<template>
  <div class="page-container">
    <header class="glass-header page-header">
      <button class="back-btn" @click="$router.back()">←</button>
      <span class="page-title">用户空间</span>
    </header>

    <div v-if="user">
      <!-- 用户卡片 -->
      <div class="glass profile-card px-16 py-12">
        <div class="profile-top">
          <img class="avatar-lg" :src="user.face" />
          <div class="profile-info">
            <div class="uname">{{ user.name }}</div>
            <div class="mid">UID: {{ user.mid }}</div>
            <div class="sign" v-if="user.sign">{{ user.sign }}</div>
          </div>
          <button class="follow-btn" :class="{ followed: isFollow }" @click="toggleFollow">
            {{ isFollow ? '已关注' : '+ 关注' }}
          </button>
        </div>

        <!-- 数据统计 -->
        <div class="stat-bar" v-if="userStat">
          <div class="stat-item" @click="showTab = 'video'">
            <div class="stat-num">{{ userStat.archive_count || 0 }}</div>
            <div class="stat-label">投稿</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ formatCount(userStat.follower || 0) }}</div>
            <div class="stat-label">粉丝</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ userStat.following || 0 }}</div>
            <div class="stat-label">关注</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ formatCount(userStat.like_num || 0) }}</div>
            <div class="stat-label">获赞</div>
          </div>
        </div>
      </div>

      <!-- 标签切换 -->
      <div class="tag-bar">
        <span v-for="tab in tabs" :key="tab.id" class="tag-item" :class="{ active: showTab === tab.id }" @click="showTab = tab.id; loadTab()">
          {{ tab.name }}
        </span>
      </div>

      <!-- 用户视频列表 -->
      <div class="video-grid px-16">
        <div v-for="item in videoList" :key="item.bvid" class="video-card" @click="$router.push(`/video/${item.bvid}`)">
          <img class="cover" :src="item.pic + '@480w_300c'" loading="lazy" />
          <div class="info">
            <div class="title">{{ item.title }}</div>
            <div class="meta">{{ formatCount(item.stat?.view || 0) }}次播放 · {{ formatDuration(item.duration) }}</div>
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
import { spaceApi, api } from '@/api/http'
import { formatCount, formatDuration } from '@/types/video'

const route = useRoute()
const user = ref<any>(null)
const userStat = ref<any>(null)
const videoList = ref<any[]>([])
const isFollow = ref(false)
const showTab = ref('video')

const tabs = [
  { id: 'video', name: '投稿' },
  { id: 'dynamic', name: '动态' },
  { id: 'fav', name: '收藏' },
]

async function loadUser() {
  const mid = Number(route.params.mid)
  const [infoRes, statRes] = await Promise.all([
    spaceApi.get('/x/space/acc/info', { params: { mid } }),
    api.get('/x/space/upstat', { params: { mid } }),
  ])
  user.value = infoRes.data?.data
  userStat.value = statRes.data?.data

  // 加载视频
  const videoRes = await spaceApi.get('/x/space/wbi/arc/search', { params: { mid, pn: 1, ps: 30 } })
  videoList.value = videoRes.data?.data?.list?.vlist || []
}

async function toggleFollow() {
  if (!user.value) return
  await api.post('/x/relation/modify', null, { params: { mid: user.value.mid, act: isFollow.value ? 2 : 1 } })
  isFollow.value = !isFollow.value
}

function loadTab() { /* TODO: 动态/收藏切换 */ }

onMounted(loadUser)
</script>

<style scoped>
.back-btn { background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; }
.page-title { font-size: 18px; font-weight: 600; }

.profile-card { margin: 12px 16px; }
.profile-top { display: flex; gap: 14px; align-items: flex-start; }
.avatar-lg { width: 72px; height: 72px; border-radius: 50%; }
.profile-info { flex: 1; }
.uname { font-size: 18px; font-weight: 700; }
.mid { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.sign { font-size: 13px; color: var(--text-secondary); margin-top: 6px; }
.follow-btn { padding: 6px 18px; border-radius: 18px; background: var(--bili-pink); color: #fff; border: none; font-size: 13px; cursor: pointer; white-space: nowrap; }
.follow-btn.followed { background: rgba(0,0,0,0.06); color: var(--text-secondary); }

.stat-bar { display: flex; justify-content: space-around; margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.06); }
.stat-item { text-align: center; cursor: pointer; }
.stat-num { font-size: 16px; font-weight: 600; }
.stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

.video-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (min-width: 768px) { .video-grid { grid-template-columns: repeat(3, 1fr); } }
.video-card { display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; background: var(--bg-card); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255,255,255,0.3); }
.video-card .cover { width: 100%; aspect-ratio: 16/10; object-fit: cover; }
.video-card .info { padding: 10px 12px; }
.video-card .title { font-size: 14px; font-weight: 500; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.video-card .meta { font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
</style>
