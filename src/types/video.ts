/** 视频信息 */
export interface VideoItem {
  bvid: string
  aid: number
  title: string
  desc: string
  pic: string
  owner: {
    mid: number
    name: string
    face: string
  }
  stat: {
    view: number
    danmaku: number
    like: number
    coin: number
    favorite: number
    reply: number
    share: number
  }
  duration: number
  cid: number
  pages: Array<{ cid: number; part: string; duration: number }>
  pubdate: number
  tname?: string
}

/** 搜索结果 */
export interface SearchResult {
  result: VideoItem[]
  numResults: number
  pagesize: number
  page: number
}

/** 弹幕 */
export interface Danmaku {
  id: string
  content: string
  time: number
  type: number
  color: number
  fontSize: number
  sendTime: number
  userId: number
}

/** 用户信息 */
export interface UserInfo {
  mid: number
  uname: string
  face: string
  sign: string
  level: number
  fans: number
  following: number
}

/** 动态 */
export interface DynamicItem {
  id: string
  type: string
  modules: Record<string, any>
}

/** 格式化播放量 */
export function formatCount(n: number): string {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return String(n)
}

/** 格式化时长 */
export function formatDuration(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}
