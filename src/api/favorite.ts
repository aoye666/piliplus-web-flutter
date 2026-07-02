import { api } from './http'

/** 收藏夹列表 */
export function getFavFolders(params: { mid: number; pn?: number }) {
  return api.get('/x/v3/fav/folder/created/list', { params })
}

/** 全部收藏夹（简略） */
export function getAllFavFolders(params: { mid: number }) {
  return api.get('/x/v3/fav/folder/created/list-all', { params })
}

/** 收藏夹详情 */
export function getFavFolderInfo(params: { media_id: number }) {
  return api.get('/x/v3/fav/folder/info', { params })
}

/** 收藏夹内容列表 */
export function getFavResources(params: {
  media_id: number
  pn?: number
  ps?: number
  keyword?: string
  order?: string
  type?: number
}) {
  return api.get('/x/v3/fav/resource/list', { params })
}

/** 收藏/取消收藏视频 */
export function favVideo(params: {
  rid: number
  type?: number
  add_media_ids?: string
  del_media_ids?: string
}) {
  return api.post('/x/v3/fav/resource/batch-deal', null, { params: { type: 2, ...params } })
}

/** 创建收藏夹 */
export function createFavFolder(params: { title: string; intro?: string; privacy?: number }) {
  return api.post('/x/v3/fav/folder/add', null, { params })
}

/** 删除收藏夹 */
export function deleteFavFolder(params: { media_id: number }) {
  return api.post('/x/v3/fav/folder/del', null, { params })
}

/** 编辑收藏夹 */
export function editFavFolder(params: { media_id: number; title: string; intro?: string; privacy?: number }) {
  return api.post('/x/v3/fav/folder/edit', null, { params })
}
