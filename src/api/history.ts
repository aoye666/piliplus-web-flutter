import { api } from './http'

/** 历史记录列表 */
export function getHistoryList(params?: { max?: number; view_at?: number; type?: number }) {
  return api.get('/x/web-interface/history/cursor', { params })
}

/** 稍后再看 */
export function getWatchLater() {
  return api.get('/x/v2/history/toview/web')
}

/** 上报播放进度 */
export function reportHistory(params: { oid: number; progress: number; type?: number }) {
  return api.post('/x/v2/history/report', null, { params })
}

/** 删除历史记录 */
export function deleteHistory(params: { kid: string }) {
  return api.post('/x/v2/history/delete', null, { params })
}

/** 清空历史记录 */
export function clearHistory() {
  return api.post('/x/v2/history/clear')
}
