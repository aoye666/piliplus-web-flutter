import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { logger } from '@/utils/logger'

// B 站 API 基础配置
const BASE_URLS = {
  api: 'https://api.bilibili.com',
  app: 'https://app.bilibili.com',
  live: 'https://api.live.bilibili.com',
  passport: 'https://passport.bilibili.com',
  message: 'https://message.bilibili.com',
  dynamic: 'https://t.bilibili.com',
  space: 'https://space.bilibili.com',
}

// 创建 axios 实例
const createInstance = (baseURL: string, name: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.bilibili.com',
      'Origin': 'https://www.bilibili.com',
    },
  })

  // 请求拦截 - 注入 Cookie + 日志
  instance.interceptors.request.use((config) => {
    const cookie = localStorage.getItem('bili_cookie')
    if (cookie) {
      config.headers['Cookie'] = cookie
    }

    // 记录请求日志
    const url = config.url || ''
    const params = config.params || config.data
    logger.request(config.method?.toUpperCase() || 'GET', `${name}${url}`, params)

    // 标记请求开始时间 (使用扩展属性)
    ;(config as any)._startTime = Date.now()

    return config
  })

  // 响应拦截 - 日志
  instance.interceptors.response.use(
    (response) => {
      const startTime = (response.config as any)._startTime || Date.now()
      const duration = Date.now() - startTime
      const url = response.config.url || ''
      
      logger.response(
        `${name}${url}`,
        response.status,
        response.data,
        duration
      )

      return response
    },
    (error) => {
      const url = error.config?.url || ''
      logger.error(`${name}${url}`, error)
      return Promise.reject(error)
    }
  )

  return instance
}

// 导出各模块实例
export const api = createInstance(BASE_URLS.api, 'API')
export const appApi = createInstance(BASE_URLS.app, 'APP')
export const liveApi = createInstance(BASE_URLS.live, 'LIVE')
export const passportApi = createInstance(BASE_URLS.passport, 'PASSPORT')
export const messageApi = createInstance(BASE_URLS.message, 'MSG')
export const spaceApi = createInstance(BASE_URLS.space, 'SPACE')

// 通用请求方法
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res: AxiosResponse<T> = await api.request(config)
  return res.data
}

export { BASE_URLS }
