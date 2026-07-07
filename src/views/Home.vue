<template>
  <div class="page-container">
    <!-- Flutter风格毛玻璃顶栏 -->
    <header class="glass-header page-header">
      <div class="logo">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <defs>
            <linearGradient id="grad" x1="2" y1="2" x2="22" y2="22">
              <stop offset="0%" stop-color="#fb7299"/>
              <stop offset="100%" stop-color="#00a1d6"/>
            </linearGradient>
          </defs>
        </svg>
        <span>PiliPlus</span>
      </div>
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input class="search-bar" placeholder="搜索视频、UP主..." readonly @click="$router.push('/search')" />
      </div>
      <button class="log-btn" @click="$router.push('/logs')" title="调试日志">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </button>
    </header>

    <!-- 标签栏 -->
    <div class="tag-bar">
      <button 
        v-for="tab in tabs" 
        :key="tab.id" 
        class="tag-btn" 
        :class="{ active: activeTab === tab.id }" 
        @click="activeTab = tab.id"
      >
        <span class="tag-text">{{ tab.name }}</span>
        <span v-if="activeTab === tab.id" class="tag-indicator"></span>
      </button>
    </div>

    <!-- 视频列表 -->
    <div class="video-grid">
      <div 
        v-for="(item, index) in videoList" 
        :key="item.bvid" 
        class="video-card animate-fade-in"
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="$router.push(`/video/${item.bvid}`)"
      >
        <div class="cover-wrapper">
          <img class="cover" :src="item.pic + '@480w_300c'" loading="lazy" />
          <div class="cover-overlay">
            <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span class="duration-badge" v-if="item.duration">{{ formatDuration(item.duration) }}</span>
        </div>
        <div class="info">
          <div class="title">{{ item.title }}</div>
          <div class="meta">
            <span class="up-name">{{ item.owner?.name }}</span>
            <div class="stat-info">
              <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{{ formatCount(item.stat?.view || 0) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span class="loading-text">加载中...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="error && !loading" class="error-container glass">
      <div class="error-icon">❌</div>
      <div class="error-text">{{ error }}</div>
      <button class="retry-btn" @click="loadVideo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        重试
      </button>
      <div class="error-hint">💡 提示：需要在本地开发环境运行，或配置 CORS 代理</div>
    </div>
    
    <!-- 空状态 -->
    <div v-if="!loading && !error && !videoList.length" class="empty-container">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <span class="empty-text">暂无数据</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getRecommendList, getPopularList } from '@/api/video'
import { formatCount, formatDuration } from '@/types/video'
import type { VideoItem } from '@/types/video'

const tabs = [
  { id: 'recommend', name: '推荐' },
  { id: 'popular', name: '热门' },
  { id: 'hot', name: '热榜' },
  { id: 'live', name: '直播' },
  { id: 'anime', name: '番剧' },
]
const activeTab = ref('recommend')
const videoList = ref<VideoItem[]>([])
const loading = ref(false)
const error = ref('')
const page = ref(1)

async function loadVideo() {
  loading.value = true
  error.value = ''
  
  try {
    if (activeTab.value === 'recommend') {
      const res = await getRecommendList({ ps: 20, fresh_idx: page.value })
      const items = res.data?.data?.item || res.data?.data || []
      videoList.value = Array.isArray(items) ? items.map((i: any) => i.recommend || i) : []
    } else {
      const res = await getPopularList({ ps: 20, pn: page.value })
      videoList.value = res.data?.list || []
    }
  } catch (e: any) {
    console.error('加载失败', e)
    
    // 提取错误信息
    if (e.message?.includes('Network Error')) {
      error.value = '网络错误 - 跨域请求被拦截'
    } else if (e.response?.data?.message) {
      error.value = `API 错误: ${e.response.data.message}`
    } else {
      error.value = e.message || '未知错误'
    }
  } finally {
    loading.value = false
  }
}

watch(activeTab, () => { page.value = 1; loadVideo() })
onMounted(loadVideo)
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #fb7299, #00a1d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.logo-icon {
  width: 28px;
  height: 28px;
}

.log-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.log-btn:hover {
  background: var(--glass-bg-hover);
  color: white;
  border-color: var(--glass-border-light);
  transform: scale(1.05);
}

.log-btn svg {
  width: 20px;
  height: 20px;
}

.search-wrapper {
  flex: 1;
  max-width: 400px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}

.search-bar {
  width: 100%;
  height: 42px;
  border-radius: 21px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 0 16px 0 44px;
  font-size: 14px;
  color: #ffffff;
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

.search-bar::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.search-bar:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: #00a1d6;
  box-shadow: 0 0 20px rgba(0, 161, 214, 0.25);
}

.tag-bar {
  display: flex;
  gap: 8px;
  margin: 20px 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tag-bar::-webkit-scrollbar {
  display: none;
}

.tag-btn {
  position: relative;
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  overflow: hidden;
}

.tag-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.tag-btn.active {
  background: linear-gradient(135deg, rgba(251, 114, 153, 0.3), rgba(0, 161, 214, 0.3));
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tag-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: linear-gradient(90deg, #fb7299, #00a1d6);
  border-radius: 3px;
  animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
  from {
    transform: translateX(-50%) scaleX(0);
  }
  to {
    transform: translateX(-50%) scaleX(1);
  }
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

@media (max-width: 640px) {
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.video-card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

.video-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(251, 114, 153, 0.15);
}

.video-card:active {
  transform: translateY(-4px) scale(0.98);
}

.cover-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.video-card:hover .cover {
  transform: scale(1.08);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-card:hover .cover-overlay {
  opacity: 1;
}

.play-icon {
  width: 56px;
  height: 56px;
  color: white;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  transform: scale(0.8);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.video-card:hover .play-icon {
  transform: scale(1);
}

.duration-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.info {
  padding: 14px 16px;
  flex: 1;
}

.title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #ffffff;
  margin-bottom: 10px;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.up-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.2s ease;
}

.up-name:hover {
  color: #00a1d6;
}

.stat-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.stat-icon {
  width: 14px;
  height: 14px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
}

.loading-spinner {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #fb7299;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: rgba(255, 255, 255, 0.2);
}

.empty-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.4);
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 24px;
  margin: 20px 0;
  text-align: center;
}

.error-icon {
  font-size: 48px;
}

.error-text {
  font-size: 16px;
  color: #ff4d4f;
  font-weight: 500;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #fb7299, #00a1d6);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.retry-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(251, 114, 153, 0.4);
}

.retry-btn:active {
  transform: scale(0.95);
}

.retry-btn svg {
  width: 18px;
  height: 18px;
}

.error-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}
</style>
