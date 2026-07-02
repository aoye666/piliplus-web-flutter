import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { logger } from '@/utils/logger'

// ============ 环境配置 ============
const isDev = import.meta.env.DEV

// B 站 API 基础配置
const BILI_APIS = {
  api: 'https://api.bilibili.com',
  app: 'https://app.bilibili.com',
  live: 'https://api.live.bilibili.com',
  passport: 'https://passport.bilibili.com',
  message: 'https://message.bilibili.com',
  dynamic: 'https://t.bilibili.com',
  space: 'https://space.bilibili.com',
}

// 获取实际的基础 URL
function getBaseUrl(name: string): string {
  if (isDev) {
    // 开发环境：走 vite proxy
    return `/bili-${name}`
  }
  // 生产环境：走 Vercel Serverless 代理
  return '/api/proxy'
}

// 创建 axios 实例
const createInstance = (name: string): AxiosInstance => {
  const baseURL = getBaseUrl(name)
  
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

    // 标记请求开始时间
    ;(config as any)._startTime = Date.now()
    ;(config as any)._apiName = name

    // 生产环境：将完整 URL 作为参数传递给代理
    if (!isDev) {
      const fullUrl = `${BILI_APIS[name as keyof typeof BILI_APIS]}${url}`
      
      if (config.method === 'get' || !config.method) {
        // GET 请求：URL 参数
        config.params = { url: fullUrl }
      } else {
        // POST 请求：保持原有参数，URL 作为查询参数
        config.params = { url: fullUrl }
      }
    }

    return config
  })

  // 响应拦截 - 日志
  instance.interceptors.response.use(
    (response) => {
      const startTime = (response.config as any)._startTime || Date.now()
      const duration = Date.now() - startTime
      const url = response.config.url || ''
      const apiName = (response.config as any)._apiName || name
      
      logger.response(
        `${apiName}${url}`,
        response.status,
        response.data,
        duration
      )

      return response
    },
    (error) => {
      const url = error.config?.url || ''
      const apiName = (error.config as any)._apiName || name
      logger.error(`${apiName}${url}`, error)
      return Promise.reject(error)
    }
  )

  return instance
}

// 导出各模块实例
export const api = createInstance('api')
export const appApi = createInstance('app')
export const liveApi = createInstance('live')
export const passportApi = createInstance('passport')
export const messageApi = createInstance('message')
export const spaceApi = createInstance('space')

// 通用请求方法
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res: AxiosResponse<T> = await api.request(config)
  return res.data
}

export { BILI_APIS, isDev }
