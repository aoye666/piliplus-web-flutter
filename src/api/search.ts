import { api } from './http'

/** 搜索建议 */
export function getSearchSuggest(params: { term: string }) {
  return api.get('https://s.search.bilibili.com/main/suggest', { params })
}

/** 热搜榜 */
export function getHotSearch() {
  return api.get('https://s.search.bilibili.com/main/hotword')
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
