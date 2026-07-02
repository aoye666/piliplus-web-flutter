import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { logger } from '@/utils/logger'

// ============ 代理配置 ============
// 开发环境走 vite proxy，生产环境走公共 CORS 代理
const isDev = import.meta.env.DEV

// 公共 CORS 代理（备用）
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

// B 站 API 基础配置
const BASE_URLS = {
  // 开发环境直接用 vite proxy (相对路径)
  api: isDev ? '/bili-api' : 'https://api.bilibili.com',
  app: isDev ? '/bili-app' : 'https://app.bilibili.com',
  live: isDev ? '/bili-live' : 'https://api.live.bilibili.com',
  passport: isDev ? '/bili-passport' : 'https://passport.bilibili.com',
  message: isDev ? '/bili-message' : 'https://message.bilibili.com',
  dynamic: isDev ? '/bili-dynamic' : 'https://t.bilibili.com',
  space: isDev ? '/bili-space' : 'https://space.bilibili.com',
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

  // 响应拦截 - 日志 + CORS 代理重试
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
    async (error) => {
      const url = error.config?.url || ''
      
      // 如果是 CORS 错误且不是开发环境，尝试用 CORS 代理
      if (!isDev && error.message?.includes('Network Error')) {
        logger.warn(`CORS 错误，尝试代理: ${name}${url}`)
        
        try {
          const originalUrl = `${BASE_URLS[name as keyof typeof BASE_URLS] || BASE_URLS.api}${url}`
          const proxyUrl = `${CORS_PROXY}${encodeURIComponent(originalUrl)}`
          
          const proxyResponse = await axios.get(proxyUrl, {
            timeout: 20000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          })
          
          logger.info(`代理请求成功: ${name}${url}`)
          return proxyResponse
        } catch (proxyError) {
          logger.error(`代理也失败了: ${name}${url}`, proxyError)
        }
      }
      
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

export { BASE_URLS, isDev }
