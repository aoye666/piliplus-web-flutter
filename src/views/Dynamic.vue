<template>
  <div class="page-container">
    <header class="glass-header page-header">
      <button class="back-btn" @click="$router.back()">←</button>
      <span class="page-title">动态</span>
    </header>

    <!-- 分类标签 -->
    <div class="tag-bar">
      <span v-for="tab in tabs" :key="tab.id" class="tag-item" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id; loadDynamic()">
        {{ tab.name }}
      </span>
    </div>

    <!-- 正在直播的 UP -->
    <div class="live-bar px-16" v-if="liveUpList.length">
      <div class="section-title">🔴 正在直播</div>
      <div class="live-scroll">
        <div v-for="up in liveUpList" :key="up.mid" class="live-item" @click="$router.push(`/user/${up.mid}`)">
          <img class="avatar" :src="up.face" />
          <div class="live-dot"></div>
          <div class="name">{{ up.uname }}</div>
        </div>
      </div>
    </div>

    <!-- 动态列表 -->
    <div class="dynamic-list px-16">
      <div v-for="item in dynamicList" :key="item.id_str" class="glass dynamic-card py-12 px-16" @click="goToDynamic(item)">
        <!-- 头部 -->
        <div class="dyn-header">
          <img class="avatar" :src="item.modules?.module_author?.face" />
          <div class="author-info">
            <div class="name">{{ item.modules?.module_author?.name }}</div>
            <div class="time">{{ item.modules?.module_author?.pub_time }}</div>
          </div>
          <button class="more-btn" @click.stop>⋯</button>
        </div>

        <!-- 文字内容 -->
        <div class="dyn-text" v-if="item.modules?.module_dynamic?.desc?.text">
          {{ item.modules.module_dynamic.desc.text }}
        </div>

        <!-- 视频卡片 -->
        <div class="dyn-video" v-if="item.modules?.module_dynamic?.major?.archive">
          <img class="cover" :src="item.modules.module_dynamic.major.archive.cover + '@480w_300c'" loading="lazy" />
          <div class="video-meta">
            <div class="video-title">{{ item.modules.module_dynamic.major.archive.title }}</div>
            <div class="video-stat">{{ formatCount(item.modules.module_dynamic.major.archive.stat?.view || 0) }}次播放</div>
          </div>
          <div class="duration">{{ formatDuration(item.modules.module_dynamic.major.archive.duration || 0) }}</div>
        </div>

        <!-- 互动栏 -->
        <div class="dyn-actions">
          <span class="action">💬 {{ item.modules?.module_dynamic?.major?.archive?.stat?.reply || 0 }}</span>
          <span class="action">👍 {{ item.modules?.module_dynamic?.major?.archive?.stat?.like || 0 }}</span>
          <span class="action">🔄 {{ item.modules?.module_dynamic?.major?.archive?.stat?.share || 0 }}</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-tip">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFollowDynamic, getLiveUp } from '@/api/dynamic'
import { formatCount, formatDuration } from '@/types/video'

const router = useRouter()
const dynamicList = ref<any[]>([])
const liveUpList = ref<any[]>([])
const loading = ref(false)
const activeTab = ref('all')
const offset = ref('')

const tabs = [
  { id: 'all', name: '全部' },
  { id: 'video', name: '视频' },
  { id: 'pgc', name: '番剧' },
  { id: 'article', name: '专栏' },
  { id: 'dynamic', name: '文字' },
]

async function loadDynamic() {
  loading.value = true
  try {
    const res = await getFollowDynamic({ type: activeTab.value, offset: offset.value || undefined })
    dynamicList.value = res.data?.data?.items || []
    offset.value = res.data?.data?.offset || ''
  } catch { /* ignore */ }
  finally { loading.value = false }
}

function goToDynamic(item: any) {
  const archive = item.modules?.module_dynamic?.major?.archive
  if (archive?.bvid) router.push(`/video/${archive.bvid}`)
}

onMounted(async () => {
  loadDynamic()
  try {
    const res = await getLiveUp()
    liveUpList.value = (res.data?.data?.item || []).slice(0, 10)
  } catch { /* ignore */ }
})
</script>

<style scoped>
.back-btn { background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; }
.page-title { font-size: 18px; font-weight: 600; }

/* 直播横滚 */
.live-bar { margin-bottom: 8px; }
.section-title { font-size: 14px; font-weight: 600; margin-bottom: 10px; }
.live-scroll { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
.live-scroll::-webkit-scrollbar { display: none; }
.live-item { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; cursor: pointer; width: 56px; }
.live-item .avatar { width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--bili-pink); }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: #f44; position: absolute; bottom: 14px; right: 0; border: 1px solid #fff; }
.live-item .name { font-size: 11px; color: var(--text-secondary); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }

/* 动态卡片 */
.dynamic-list { display: flex; flex-direction: column; gap: 10px; }
.dynamic-card { cursor: pointer; transition: transform 0.15s; }
.dynamic-card:active { transform: scale(0.98); }
.dyn-header { display: flex; align-items: center; gap: 10px; }
.dyn-header .avatar { width: 40px; height: 40px; border-radius: 50%; }
.author-info { flex: 1; }
.author-info .name { font-size: 14px; font-weight: 500; }
.author-info .time { font-size: 12px; color: var(--text-secondary); }
.more-btn { background: none; border: none; font-size: 18px; color: var(--text-secondary); cursor: pointer; padding: 4px; }
.dyn-text { margin-top: 10px; font-size: 14px; line-height: 1.6; }
.dyn-video { margin-top: 10px; border-radius: 10px; overflow: hidden; position: relative; background: #000; }
.dyn-video .cover { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
.video-meta { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px 10px 8px; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: #fff; }
.video-title { font-size: 13px; font-weight: 500; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.video-stat { font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 4px; }
.duration { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
.dyn-actions { display: flex; gap: 20px; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.04); }
.dyn-actions .action { font-size: 13px; color: var(--text-secondary); cursor: pointer; }
</style>
