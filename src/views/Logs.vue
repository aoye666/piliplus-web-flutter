<template>
  <div class="page-container">
    <!-- 顶栏 -->
    <header class="glass-header page-header">
      <button class="back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="page-title">📋 调试日志</h1>
      <div class="header-actions">
        <span class="log-count">{{ logs.length }} 条</span>
      </div>
    </header>

    <!-- 工具栏 -->
    <div class="toolbar glass">
      <div class="filter-group">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          class="filter-btn"
          :class="{ active: activeFilter === filter.value }"
          @click="activeFilter = filter.value"
        >
          <span class="filter-icon">{{ filter.icon }}</span>
          <span class="filter-name">{{ filter.name }}</span>
          <span class="filter-count" v-if="getFilterCount(filter.value) > 0">
            {{ getFilterCount(filter.value) }}
          </span>
        </button>
      </div>
      
      <div class="action-group">
        <button class="action-btn" @click="copyAll" title="复制全部">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button class="action-btn danger" @click="clearLogs" title="清空">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="log-list" ref="logListRef">
      <TransitionGroup name="log">
        <div 
          v-for="log in filteredLogs" 
          :key="log.id"
          class="log-item glass"
          :class="[`log-${log.type}`, { expanded: expandedIds.has(log.id) }]"
          @click="toggleExpand(log.id)"
        >
          <div class="log-main">
            <div class="log-header">
              <span class="log-type-badge">{{ getTypeIcon(log.type) }}</span>
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-status" v-if="log.status">{{ log.status }}</span>
              <span class="log-duration" v-if="log.duration">{{ log.duration }}ms</span>
            </div>
            <div class="log-url">{{ log.method }} {{ log.url || log.message }}</div>
            <div class="log-message" v-if="log.error">{{ log.error }}</div>
          </div>
          
          <!-- 展开详情 -->
          <div class="log-detail" v-if="expandedIds.has(log.id)">
            <div class="detail-section" v-if="log.requestData">
              <div class="detail-title">📤 请求参数</div>
              <pre class="detail-code">{{ formatJson(log.requestData) }}</pre>
              <button class="copy-btn" @click.stop="copyText(formatJson(log.requestData))">复制</button>
            </div>
            <div class="detail-section" v-if="log.responseData">
              <div class="detail-title">📥 响应数据</div>
              <pre class="detail-code">{{ formatJson(log.responseData) }}</pre>
              <button class="copy-btn" @click.stop="copyText(formatJson(log.responseData))">复制</button>
            </div>
            <div class="detail-section" v-if="log.error">
              <div class="detail-title">❌ 错误信息</div>
              <pre class="detail-code error">{{ log.error }}</pre>
              <button class="copy-btn" @click.stop="copyText(log.error)">复制</button>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="filteredLogs.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">{{ activeFilter === 'all' ? '暂无日志' : '没有该类型的日志' }}</div>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <Transition name="toast">
      <div v-if="showToast" class="toast glass">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { logger, type LogEntry } from '@/utils/logger'

const logs = ref<LogEntry[]>([])
const activeFilter = ref('all')
const expandedIds = ref<Set<string>>(new Set())
const showToast = ref(false)
const toastMessage = ref('')
const logListRef = ref<HTMLElement>()

const filters = [
  { value: 'all', name: '全部', icon: '📋' },
  { value: 'request', name: '请求', icon: '📤' },
  { value: 'response', name: '响应', icon: '📥' },
  { value: 'error', name: '错误', icon: '❌' },
]

// 订阅日志更新
let unsubscribe: (() => void) | null = null

onMounted(() => {
  logs.value = logger.getLogs()
  unsubscribe = logger.subscribe(newLogs => {
    logs.value = newLogs
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

// 过滤后的日志
const filteredLogs = computed(() => {
  if (activeFilter.value === 'all') return logs.value
  return logs.value.filter(log => log.type === activeFilter.value)
})

// 获取过滤计数
function getFilterCount(filter: string): number {
  if (filter === 'all') return logs.value.length
  return logs.value.filter(log => log.type === filter).length
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour12: false })
}

// 获取类型图标
function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    request: '📤',
    response: '📥',
    error: '❌',
    warn: '⚠️',
    info: 'ℹ️',
  }
  return icons[type] || '📋'
}

// 格式化 JSON
function formatJson(data: any): string {
  try {
    if (typeof data === 'string') return data
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

// 展开/折叠
function toggleExpand(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

// 复制文本
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    showToastMsg('已复制到剪贴板')
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToastMsg('已复制到剪贴板')
  }
}

// 复制全部
async function copyAll() {
  const text = logger.exportAsText()
  await copyText(text)
}

// 清空日志
function clearLogs() {
  if (confirm('确定清空所有日志？')) {
    logger.clear()
    expandedIds.value.clear()
    showToastMsg('日志已清空')
  }
}

// 显示 toast
function showToastMsg(msg: string) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}
</script>

<style scoped>
.page-header {
  gap: 12px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: var(--glass-bg);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--glass-bg-hover);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.header-actions {
  margin-left: auto;
}

.log-count {
  font-size: 13px;
  color: var(--text-muted);
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: var(--glass-bg-hover);
  color: white;
}

.filter-btn.active {
  background: linear-gradient(135deg, rgba(251, 114, 153, 0.3), rgba(0, 161, 214, 0.3));
  border-color: var(--glass-border-light);
  color: white;
}

.filter-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.action-group {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-light);
}

.action-btn.danger:hover {
  background: rgba(255, 77, 79, 0.3);
  border-color: rgba(255, 77, 79, 0.5);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

/* 日志列表 */
.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.log-item:hover {
  background: var(--glass-bg-hover);
}

.log-item.expanded {
  background: var(--glass-bg-light);
}

.log-item.log-error {
  border-left: 3px solid #ff4d4f;
}

.log-item.log-response {
  border-left: 3px solid #52c41a;
}

.log-item.log-request {
  border-left: 3px solid #00a1d6;
}

.log-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.log-type-badge {
  font-size: 14px;
}

.log-time {
  color: var(--text-muted);
  font-family: monospace;
}

.log-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-family: monospace;
}

.log-item.log-response .log-status {
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

.log-item.log-error .log-status {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.log-duration {
  color: var(--text-muted);
  font-family: monospace;
}

.log-url {
  font-size: 13px;
  color: var(--text-primary);
  font-family: monospace;
  word-break: break-all;
}

.log-message {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 4px;
}

/* 展开详情 */
.log-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-section {
  position: relative;
}

.detail-title {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.detail-code {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-primary);
}

.detail-code.error {
  color: #ff4d4f;
}

.copy-btn {
  position: absolute;
  top: 24px;
  right: 8px;
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  background: var(--glass-bg);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: var(--bili-blue);
  color: white;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(82, 196, 26, 0.9);
  color: white;
  font-size: 14px;
  z-index: 1000;
}

.toast svg {
  width: 18px;
  height: 18px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* 列表动画 */
.log-enter-active,
.log-leave-active {
  transition: all 0.3s;
}

.log-enter-from,
.log-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.log-move {
  transition: transform 0.3s;
}
</style>
