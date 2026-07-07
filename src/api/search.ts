import { api, searchApi } from './http'

/** 搜索建议（s.search.bilibili.com） */
export function getSearchSuggest(params: { term: string }) {
  return searchApi.get('/main/suggest', { params })
}

/** 热搜榜（s.search.bilibili.com） */
export function getHotSearch() {
  return searchApi.get('/main/hotword')
}

/** 默认搜索词 */
export function getSearchDefault() {
  return api.get('/x/web-interface/wbi/search/default')
}

/** 综合搜索 */
export function searchAll(params: {
  keyword: string
  page?: number
  search_type?: string
}) {
  return api.get('/x/web-interface/wbi/search/all/v2', { params })
}

/** 分类搜索 */
export function searchByType(params: {
  keyword: string
  page?: number
  search_type: string
  order?: string
  duration?: number
  tids?: number
}) {
  return api.get('/x/web-interface/wbi/search/type', { params })
}