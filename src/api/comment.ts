import { api } from './http'

/** 评论列表 */
export function getComments(params: {
  oid: number
  type?: number
  pn?: number
  sort?: number
}) {
  return api.get('/x/v2/reply', { params: { type: 1, sort: 2, ...params } })
}

/** 子评论 */
export function getSubComments(params: {
  oid: number
  root: number
  pn?: number
}) {
  return api.get('/x/v2/reply/reply', { params: { type: 1, ...params } })
}

/** 点赞评论 */
export function likeComment(params: {
  oid: number
  rpid: number
  action: number
}) {
  return api.post('/x/v2/reply/action', null, { params: { type: 1, ...params } })
}

/** 发表评论 */
export function addComment(params: {
  oid: number
  message: string
  type?: number
  root?: number
  parent?: number
}) {
  return api.post('/x/v2/reply/add', null, {
    params: { type: 1, plat: 1, ...params },
  })
}

/** 删除评论 */
export function deleteComment(params: { oid: number; rpid: number }) {
  return api.post('/x/v2/reply/del', null, { params: { type: 1, ...params } })
}
