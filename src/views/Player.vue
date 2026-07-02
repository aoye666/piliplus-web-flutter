<template>
  <div class="player-page">
    <!-- 毛玻璃顶栏 -->
    <header class="glass-topbar">
      <button class="btn-icon" @click="$router.back()">←</button>
      <span class="title">{{ video?.title || 'PiliPlus Player' }}</span>
      <button class="btn-icon" @click="toggleDanmaku">💬</button>
    </header>

    <!-- 播放器区域 -->
    <div class="player-box">
      <div id="dplayer" ref="playerRef"></div>
    </div>

    <!-- 视频信息 -->
    <div class="glass info-card px-16 py-12" v-if="video">
      <div class="vid-title">{{ video.title }}</div>
      <div class="meta-row">
        <span>👁 {{ formatCount(video.stat?.view || 0) }}</span>
        <span>💬 {{ video.stat?.danmaku || 0 }}条弹幕</span>
        <span>📅 {{ formatDate(video.pubdate) }}</span>
      </div>

      <!-- 清晰度切换 -->
      <div class="quality-bar" v-if="qualities.length">
        <span v-for="q in qualities" :key="q.id" class="quality-tag" :class="{ active: currentQn === q.id }" @click="switchQuality(q.id)">
          {{ q.label }}
        </span>
      </div>
    </div>

    <!-- 分P列表 -->
    <div class="glass section px-16 py-12" v-if="video?.pages?.length > 1">
      <div class="section-title">📋 分P列表 ({{ video.pages.length }}P)</div>
      <div v-for="(p, idx) in video.pages" :key="p.cid" class="part-item" :class="{ active: p.cid === currentCid }" @click="switchPart(p.cid)">
        <span class="part-idx">{{ idx + 1 }}</span>
        <span class="part-name">{{ p.part }}</span>
        <span class="part-dur">{{ formatDuration(p.duration) }}</span>
      </div>
    </div>

    <!-- 相关推荐 -->
    <div class="glass section px-16 py-12" v-if="relatedList.length">
      <div class="section-title">🎯 相关推荐</div>
      <div v-for="item in relatedList" :key="item.bvid" class="related-item" @click="goToVideo(item.bvid)">
        <img class="cover" :src="item.pic + '@240w_150c'" loading="lazy" />
        <div class="info">
          <div class="r-title">{{ item.title }}</div>
          <div class="r-meta">{{ item.owner?.name }} · {{ formatCount(item.stat?.view || 0) }}次播放</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getVideoDetail, getVideoPlayUrl, getRelatedVideos } from '@/api/video'
import { formatCount, formatDuration } from '@/types/video'

const route = useRoute()
const router = useRouter()
const playerRef = ref<HTMLDivElement>()

const video = ref<any>(null)
const relatedList = ref<any[]>([])
const currentCid = ref(0)
const currentQn = ref(80)
const danmakuVisible = ref(true)
const qualities = ref<{ id: number; label: string }[]>([])

let dp: any = null

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('zh-CN')
}

function goToVideo(bvid: string) {
  router.push(`/video/${bvid}`)
}

/** 切换分P */
function switchPart(cid: number) {
  currentCid.value = cid
  loadPlayUrl(cid)
}

/** 切换清晰度 */
function switchQuality(qn: number) {
  currentQn.value = qn
  loadPlayUrl(currentCid.value)
}

/** 开关弹幕 */
function toggleDanmaku() {
  danmakuVisible.value = !danmakuVisible.value
  if (dp) dp.danmaku && (danmakuVisible.value ? dp.danmaku.show() : dp.danmaku.hide())
}

/** 加载播放地址并播放 */
async function loadPlayUrl(cid: number) {
  const bvid = route.params.bvid as string
  const res = await getVideoPlayUrl({ bvid, cid, qn: currentQn.value, fnval: 16 })
  const data = res.data?.data

  // 解析清晰度列表
  if (data?.accept_quality) {
    qualities.value = data.accept_quality.map((q: any) => ({ id: q.id, label: q.attribute === 0 ? `${q.new_display_desc}` : q.display }))
  }

  // 获取播放URL
  const url = data?.dash?.video?.[0]?.baseUrl || data?.durl?.[0]?.url
  if (url && dp) {
    dp.switchVideo({
      url,
      type: 'auto',
      customType: {
        bilibili: () => {},
      },
    })
  }
}

/** 初始化播放器 */
async function initPlayer() {
  const bvid = route.params.bvid as string
  const cidParam = route.params.cid as string

  const res = await getVideoDetail({ bvid })
  video.value = res.data?.data
  currentCid.value = cidParam ? Number(cidParam) : video.value?.cid || 0

  // 加载相关推荐
  const relatedRes = await getRelatedVideos({ aid: video.value.aid })
  relatedList.value = (relatedRes.data?.data || []).slice(0, 6)

  await nextTick()

  // 加载 DPlayer
  await loadScript('https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.js')
  await loadCSS('https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.css')

  // @ts-ignore
  dp = new window.DPlayer({
    container: playerRef.value || document.getElementById('dplayer'),
    autoplay: true,
    theme: '#fb7299',
    lang: 'zh-cn',
    screenshot: true,
    hotkey: true,
    video: {
      url: '',
      type: 'auto',
    },
    danmaku: {
      id: bvid,
      api: 'https://comment.bilibili.com/',
      bottom: '12%',
      unlimited: true,
    },
    contextmenu: [
      { text: 'PiliPlus Web', link: 'https://github.com/aoye666/PiliPlus' },
    ],
  })

  loadPlayUrl(currentCid.value)
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    document.head.appendChild(s)
  })
}

function loadCSS(href: string): Promise<void> {
  return new Promise((resolve) => {
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = href
    l.onload = () => resolve()
    document.head.appendChild(l)
  })
}

onMounted(initPlayer)

onBeforeUnmount(() => {
  if (dp) {
    dp.destroy()
    dp = null
  }
})
</script>

<style scoped>
.player-page { background: #000; min-height: 100vh; padding-bottom: 20px; }

.glass-topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: 44px; display: flex; align-items: center; padding: 0 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}
.btn-icon { background: none; border: none; font-size: 18px; cursor: pointer; padding: 8px; color: #fff; }
.title { flex: 1; font-size: 14px; color: #fff; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.player-box { width: 100%; aspect-ratio: 16 / 9; background: #000; }
#dplayer { width: 100%; height: 100%; }

.info-card { margin: 12px 16px; color: #fff; background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.1); }
.vid-title { font-size: 16px; font-weight: 600; line-height: 1.5; }
.meta-row { display: flex; gap: 14px; font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 8px; }

.quality-bar { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.quality-tag { padding: 4px 12px; border-radius: 16px; font-size: 12px; background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.7); cursor: pointer; transition: all 0.2s; }
.quality-tag.active { background: var(--bili-pink); color: #fff; }

.section { margin: 8px 16px; color: #fff; background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.1); }
.section-title { font-size: 14px; font-weight: 600; margin-bottom: 10px; }

.part-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06); cursor: pointer; }
.part-item.active { color: var(--bili-pink); }
.part-idx { width: 24px; height: 24px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
.part-name { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.part-dur { font-size: 12px; color: rgba(255, 255, 255, 0.5); flex-shrink: 0; }

.related-item { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06); cursor: pointer; }
.related-item .cover { width: 120px; height: 75px; border-radius: 6px; object-fit: cover; flex-shrink: 0; background: rgba(255, 255, 255, 0.05); }
.related-item .info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.r-title { font-size: 13px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.r-meta { font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-top: 4px; }
</style>
