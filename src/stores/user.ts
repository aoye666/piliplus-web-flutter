import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/http'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<any>(null)
  const cookie = ref(localStorage.getItem('bili_cookie') || '')

  const isLogin = computed(() => !!cookie.value)
  const mid = computed(() => userInfo.value?.mid)
  const uname = computed(() => userInfo.value?.uname || '')
  const avatar = computed(() => userInfo.value?.face || '')

  /** 获取登录用户信息 */
  async function fetchUserInfo() {
    if (!cookie.value) return
    try {
      const res = await api.get('/x/web-interface/nav')
      if (res.data?.code === 0) {
        userInfo.value = res.data.data
      }
    } catch (e) {
      console.error('获取用户信息失败', e)
    }
  }

  /** 设置 Cookie 并刷新用户信息 */
  function setCookie(val: string) {
    cookie.value = val
    localStorage.setItem('bili_cookie', val)
    fetchUserInfo()
  }

  /** 退出登录 */
  function logout() {
    cookie.value = ''
    userInfo.value = null
    localStorage.removeItem('bili_cookie')
  }

  return { userInfo, cookie, isLogin, mid, uname, avatar, fetchUserInfo, setCookie, logout }
})
