import { api } from './http'

// ============ 视频相关 API ============

/** 首页推荐视频 */
export function getRecommendList(params: { ps: number; fresh_idx: number }) {
  return api.get('/x/web-interface/wbi/index/top/feed/rcmd', { params })
}

/** 热门视频 */
export function getPopularList(params: { ps?: number; pn?: number }) {
  return api.get('/x/web-interface/popular', { params })
}

/** 视频详情 */
export function getVideoDetail(params: { bvid?: string; aid?: number }) {
  return api.get('/x/web-interface/view', { params })
}

/** 视频播放地址 */
export function getVideoPlayUrl(params: {
  bvid: string
  cid: number
  qn?: number
  fnval?: number
}) {
  return api.get('/x/player/wbi/playurl', { params })
}

/** 视频播放信息（字幕等） */
export function getPlayerInfo(params: { aid: number; cid: number }) {
  return api.get('/x/player/wbi/v2', { params })
}

/** 相关推荐 */
export function getRelatedVideos(params: { aid: number }) {
  return api.get('/x/web-interface/archive/related', { params })
}

/** AI 总结 */
export function getAiConclusion(params: {
  bvid: string
  cid: number
  up_mid: number
}) {
  return api.get('/x/web-interface/view/conclusion/get', { params })
}
