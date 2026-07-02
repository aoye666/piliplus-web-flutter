import { api } from './http'

/** 关注的 UP 动态 */
export function getFollowDynamic(params?: {
  type?: string
  offset?: string
  host_mid?: number
}) {
  return api.get('/x/polymer/web-dynamic/v1/feed/all', {
    params: {
      features: 'itemOpusStyle',
      ...params,
    },
  })
}

/** 动态详情 */
export function getDynamicDetail(params: { id: string }) {
  return api.get('/x/polymer/web-dynamic/v1/detail', { params })
}

/** 正在直播的 UP */
export function getLiveUp() {
  return api.get('/x/polymer/web-dynamic/v1/portal')
}

/** UP 主列表 */
export function getUpList() {
  return api.get('/x/polymer/web-dynamic/v1/uplist')
}

/** 动态点赞 */
export function likeDynamic(params: { uid: number; dynamic_id: string; up: number }) {
  return api.post('/x/dynamic/feed/dyn/thumb', null, { params })
}

/** 动态转发 */
export function repostDynamic(params: {
  dynamic_id: string
  content?: string
  at_mid?: number[]
}) {
  return api.post('/x/polymer/web-dynamic/v1/share/repost', params)
}
