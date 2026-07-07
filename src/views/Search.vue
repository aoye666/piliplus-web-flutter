<template>
  <div class="page-container">
    <!-- 毛玻璃顶栏 -->
    <header class="glass-header page-header">
      <button class="back-btn" @click="$router.back()">←</button>
      <input class="search-bar" v-model="keyword" placeholder="搜索视频、UP主..." autofocus @keyup.enter="doSearch" @input="onInput" />
      <button class="search-btn" @click="doSearch">搜索</button>
    </header>

    <!-- 搜索建议 -->
    <div class="glass suggest-list px-16" v-if="suggests.length && !results.length">
      <div v-for="item in suggests" :key="item.value" class="suggest-item" @click="keyword = item.value; doSearch()">
        🔍 {{ item.value }}
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="tag-bar">
      <span v-for="type in searchTypes" :key="type.id" class="tag-item" :class="{ active: currentType === type.id }" @click="currentType = type.id; if (keyword) doSearch()">
        {{ type.name }}
      </span>
    </div>

    <!-- 热搜 -->
    <div v-if="!results.length && !suggests.length && hotWords.length" class="px-16">
      <div class="section-title">🔥 热搜榜</div>
      <div class="hot-grid">
        <div v-for="(word, idx) in hotWords" :key="word" class="glass hot-item" @click="keyword = word; doSearch()">
          <span class="hot-rank" :class="{ top: idx < 3 }">{{ idx + 1 }}</span>
          <span>{{ word }}</span>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="video-grid px-16">
      <div v-for="item in results" :key="item.bvid || item.mid" class="video-card" @click="goToItem(item)">
        <img class="cover" :src="(item.pic || item.upic) + '@480w_300c'" loading="lazy" />
        <div class="info">
          <div class="title">{{ item.title || item.uname }}</div>
          <div class="meta">{{ item.owner?.name || item.author }} · {{ formatCount(item.stat?.view || item.fans || 0) }}{{ item.stat?.view ? '次播放' : '粉丝' }}</div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-tip">搜索中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/http'
import { getHotSearch, getSearchSuggest } from '@/api/search'
import { formatCount } from '@/types/video'

const router = useRouter()
const keyword = ref('')
const results = ref<any[]>([])
const suggests = ref<any[]>([])
const hotWords = ref<string[]>([])
const loading = ref(false)
const currentType = ref('video')

const searchTypes = [
  { id: 'video', name: '视频' },
  { id: 'bangumi', name: '番剧' },
  { id: 'live', name: '直播' },
  { id: 'article', name: '专栏' },
  { id: 'user', name: '用户' },
]

let suggestTimer: any = null

async function onInput() {
  clearTimeout(suggestTimer)
  if (!keyword.value) { suggests.value = []; return }
  suggestTimer = setTimeout(async () => {
    const res = await getSearchSuggest({ term: keyword.value })
    suggests.value = res.data?.result?.tag || []
  }, 300)
}

async function doSearch() {
  if (!keyword.value) return
  suggests.value = []
  loading.value = true
  try {
    const res = await api.get('/x/web-interface/wbi/search/type', {
      params: { keyword: keyword.value, search_type: currentType.value, page: 1, page_size: 20 }
    })
    results.value = res.data?.data?.result || []
  } catch { results.value = [] }
  finally { loading.value = false }
}

function goToItem(item: any) {
  if (item.bvid) router.push(`/video/${item.bvid}`)
  else if (item.mid) router.push(`/user/${item.mid}`)
}

onMounted(async () => {
  const res = await getHotSearch()
  hotWords.value = (res.data?.list || []).slice(0, 10).map((i: any) => i.keyword)
})
</script>

<style scoped>
.back-btn { background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; }
.search-btn { background: var(--bili-pink); color: #fff; border: none; border-radius: 18px; padding: 6px 16px; font-size: 14px; cursor: pointer; margin-left: 8px; flex-shrink: 0; }
.suggest-list { margin: 60px 16px 0; position: fixed; left: 0; right: 0; z-index: 50; }
.suggest-item { padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.04); font-size: 14px; cursor: pointer; }
.section-title { font-size: 16px; font-weight: 600; margin: 12px 0 10px; }
.hot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.hot-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; cursor: pointer; font-size: 13px; transition: transform 0.15s; }
.hot-item:active { transform: scale(0.97); }
.hot-rank { width: 20px; text-align: center; font-weight: 700; color: var(--text-secondary); }
.hot-rank.top { color: var(--bili-pink); }
.video-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 8px; }
@media (min-width: 768px) { .video-grid { grid-template-columns: repeat(3, 1fr); } }
.video-card { display: flex; flex-direction: column; border-radius: 12px; overflow: hidden; background: var(--bg-card); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255,255,255,0.3); }
.video-card .cover { width: 100%; aspect-ratio: 16/10; object-fit: cover; }
.video-card .info { padding: 10px 12px; }
.video-card .title { font-size: 14px; font-weight: 500; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.video-card .meta { font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
.loading-tip { text-align: center; padding: 24px; color: var(--text-secondary); font-size: 14px; }
</style>
