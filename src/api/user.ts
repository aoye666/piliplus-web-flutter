import { api, passportApi } from './http'

/** 获取当前登录用户信息 */
export function getNavInfo() {
  return api.get('/x/web-interface/nav')
}

/** 用户状态统计 */
export function getNavStat() {
  return api.get('/x/web-interface/nav/stat')
}

/** 获取用户信息（空间页） */
export function getUserInfo(params: { mid: number }) {
  return api.get('https://space.bilibili.com/x/space/acc/info', { params })
}

/** 用户关注/粉丝数 */
export function getUserStat(params: { mid: number }) {
  return api.get('/x/relation/stat', { params })
}

/** 关注列表 */
export function getFollowings(params: { mid: number; pn?: number; ps?: number }) {
  return api.get('/x/relation/followings', { params })
}

/** 粉丝列表 */
export function getFollowers(params: { mid: number; pn?: number; ps?: number }) {
  return api.get('/x/relation/followers', { params })
}

/** 关注用户 */
export function followUser(params: { mid: number }) {
  return api.post('/x/relation/modify', null, {
    params: { ...params, act: 1, re_src: 11 },
  })
}

/** 取消关注 */
export function unfollowUser(params: { mid: number }) {
  return api.post('/x/relation/modify', null, {
    params: { ...params, act: 2, re_src: 11 },
  })
}

/** 检查是否关注 */
export function checkRelation(params: { fid: number }) {
  return api.get('/x/relation', { params })
}

/** 扫码登录二维码 */
export function getQrcode() {
  return passportApi.get('/x/passport-login/captcha', { params: { source: 'main_web' } })
}

/** 扫码登录轮询 */
export function pollQrcode(params: { qrcode_key: string }) {
  return passportApi.get('/x/passport-login/web/qrcode/poll', { params })
}

/** 短信验证码 */
export function sendSmsCode(params: { cid: number; tel: number }) {
  return passportApi.get('/x/passport-login/web/sms/send', { params })
}

/** 短信登录 */
export function loginBySms(params: {
  cid: number
  tel: number
  code: number
  challenge: string
  validate: string
  seccode: string
}) {
  return passportApi.post('/x/passport-login/web/login', null, { params })
}

/** 退出登录 */
export function logout() {
  return passportApi.get('/x/passport-login/web/logout')
}
