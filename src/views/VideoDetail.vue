<template>
  <div class="page-container">
    <!-- 毛玻璃顶栏 -->
    <header class="glass-header page-header">
      <button class="back-btn" @click="$router.back()">←</button>
      <div class="title-bar" v-if="video">{{ video.title }}</div>
    </header>

    <div v-if="video">
      <!-- 视频封面 -->
      <div class="video-cover">
        <img :src="video.pic + '@480w_300c'" />
        <div class="play-btn" @click="$router.push(`/player/${video.bvid}/${video.cid}`)">▶</div>
        <div class="duration">{{ formatDuration(video.duration) }}</div>
      </div>

      <!-- 视频信息卡片 -->
      <div class="glass info-card px-16 py-12">
        <div class="title">{{ video.title }}</div>
        <div class="meta-row">
          <span>{{ formatCount(video.stat?.view || 0) }}次播放</span>
          <span>{{ video.stat?.danmaku || 0 }}条弹幕</span>
          <span>{{ formatDate(video.pubdate) }}</span>
        </div>

        <!-- 互动按钮 -->
        <div class="action-bar">
          <div class="action-item" :class="{ active: isLike }" @click="toggleLike">
            <span class="icon">👍</span>
            <span>{{ formatCount(video.stat?.like || 0) }}</span>
          </div>
          <div class="action-item" :class="{ active: isCoin }" @click="toggleCoin">
            <span class="icon">🪙</span>
            <span>{{ formatCount(video.stat?.coin || 0) }}</span>
          </div>
          <div class="action-item" :class="{ active: isFav }" @click="toggleFav">
            <span class="icon">⭐</span>
            <span>{{ formatCount(video.stat?.favorite || 0) }}</span>
          </div>
          <div class="action-item" @click="share">
            <span class="icon">🔗</span>
            <span>{{ formatCount(video.stat?.share || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- UP 主信息 -->
      <div class="glass up-card px-16 py-12" @click="$router.push(`/user/${video.owner.mid}`)">
        <img class="avatar" :src="video.owner.face" />
        <div class="up-info">
          <div class="up-name">{{ video.owner.name }}</div>
          <div class="up-fans" v-if="upStat">{{ formatCount(upStat.follower) }}粉丝</div>
        </div>
        <button class="follow-btn" :class="{ followed: isFollow }" @click.stop="toggleFollow">
          {{ isFollow ? '已关注' : '+ 关注' }}
        </button>
      </div>

      <!-- 视频简介 -->
      <div class="glass desc-card px-16 py-12" v-if="video.desc">
        <div class="desc-title">简介</div>
        <div class="desc-text">{{ video.desc }}</div>
      </div>

      <!-- 相关推荐 -->
      <div class="related-section px-16" v-if="relatedList.length">
        <div class="section-title">相关推荐</div>
        <div v-for="item in relatedList" :key="item.bvid" class="video-card" @click="$router.push(`/video/${item.bvid}`)">
          <img class="cover" :src="item.pic + '@480w_300c'" loading="lazy" />
          <div class="info">
            <div class="title">{{ item.title }}</div>
            <div class="meta">
              <span class="up-name">{{ item.owner?.name }}</span>
              <span class="stat">{{ formatCount(item.stat?.view || 0) }}次播放</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-tip">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getVideoDetail, getRelatedVideos } from '@/api/video'
import { formatCount, formatDuration } from '@/types/video'
import { api } from '@/api/http'

const route = useRoute()
const video = ref<any>(null)
const relatedList = ref<any[]>([])
const upStat = ref<any>(null)
const isLike = ref(false)
const isCoin = ref(false)
const isFav = ref(false)
const isFollow = ref(false)

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('zh-CN')
}

async function loadVideo() {
  const bvid = route.params.bvid as string
  const res = await getVideoDetail({ bvid })
  video.value = res.data?.data
  if (!video.value) return

  // 加载相关推荐
  const relatedRes = await getRelatedVideos({ aid: video.value.aid })
  relatedList.value = (relatedRes.data?.data || []).slice(0, 10)

  // 加载 UP 主粉丝数
  try {
    const statRes = await api.get('/x/relation/stat', { params: { mid: video.value.owner.mid } })
    upStat.value = statRes.data?.data
  } catch { /* ignore */ }
}

async function toggleLike() {
  if (!video.value) return
  await api.post('/x/web-interface/archive/like', null, { params: { aid: video.value.aid, like: isLike.value ? 0 : 1 } })
  isLike.value = !isLike.value
}

async function toggleCoin() {
  if (!video.value || isCoin.value) return
  await api.post('/x/web-interface/coin/add', null, { params: { aid: video.value.aid, multiply: 1, select_like: 1 } })
  isCoin.value = true
}

async function toggleFav() {
  if (!video.value) return
  await api.post('/x/v3/fav/resource/batch-deal', null, { params: { rid: video.value.aid, type: 2, add_media_ids: isFav.value ? '' : '0' } })
  isFav.value = !isFav.value
}

function share() {
  navigator.clipboard?.writeText(`https://www.bilibili.com/video/${video.value?.bvid}`)
}

async function toggleFollow() {
  if (!video.value) return
  await api.post('/x/relation/modify', null, { params: { mid: video.value.owner.mid, act: isFollow.value ? 2 : 1 } })
  isFollow.value = !isFollow.value
}

onMounted(loadVideo)
</script>

<style scoped>
.back-btn { background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; }
.title-bar { flex: 1; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.video-cover { position: relative; width: 100%; aspect-ratio: 16/9; background: #000; }
.video-cover img { width: 100%; height: 100%; object-fit: cover; }
.play-btn { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 56px; height: 56px; border-radius: 50%; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); color: #fff; font-size: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.duration { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.info-card { margin: 12px 16px; }
.info-card .title { font-size: 16px; font-weight: 600; line-height: 1.5; }
.meta-row { display: flex; gap: 12px; font-size: 12px; color: var(--text-secondary); margin-top: 8px; }
.action-bar { display: flex; justify-content: space-around; margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.06); }
.action-item { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; color: var(--text-secondary); cursor: pointer; transition: color 0.2s; }
.action-item.active { color: var(--bili-pink); }
.action-item .icon { font-size: 20px; }
.up-card { margin: 0 16px 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
.up-card .avatar { width: 44px; height: 44px; border-radius: 50%; }
.up-info { flex: 1; }
.up-name { font-size: 14px; font-weight: 500; }
.up-fans { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.follow-btn { padding: 6px 16px; border-radius: 18px; background: var(--bili-pink); color: #fff; border: none; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.follow-btn.followed { background: rgba(0,0,0,0.06); color: var(--text-secondary); }
.desc-card { margin: 0 16px 12px; }
.desc-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.desc-text { font-size: 13px; color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap; }
.related-section { margin-top: 16px; }
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.video-card { display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; background: var(--bg-card); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255,255,255,0.3); margin-bottom: 10px; }
.video-card .cover { width: 100%; aspect-ratio: 16/10; object-fit: cover; }
.video-card .info { padding: 10px 12px; }
.video-card .title { font-size: 14px; font-weight: 500; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.video-card .meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
.up-name { color: var(--bili-blue); }
</style>
