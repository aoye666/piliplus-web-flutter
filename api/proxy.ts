/**
 * Vercel Serverless Function - B站 API 代理
 * 
 * 用法：/api/proxy?url=https://api.bilibili.com/x/web-interface/...
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import https from 'https'
import http from 'http'

// 允许代理的域名白名单
const ALLOWED_HOSTS = [
  'api.bilibili.com',
  'app.bilibili.com',
  'api.live.bilibili.com',
  'passport.bilibili.com',
  'message.bilibili.com',
  't.bilibili.com',
  'space.bilibili.com',
]

// 默认请求头
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com',
  'Origin': 'https://www.bilibili.com',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie, User-Agent')

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 获取目标 URL
  const { url } = req.query
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ 
      code: -1, 
      message: '缺少 url 参数' 
    })
  }

  try {
    const targetUrl = new URL(url)
    
    // 检查域名白名单
    if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
      return res.status(403).json({ 
        code: -1, 
        message: `不允许代理 ${targetUrl.hostname}` 
      })
    }

    // 构建请求头
    const headers: Record<string, string> = { ...DEFAULT_HEADERS }
    
    // 透传 Cookie
    const cookie = req.headers.cookie
    if (cookie) {
      headers['Cookie'] = cookie
    }

    // 透传其他自定义头
    const customHeaders = req.headers['x-custom-headers']
    if (customHeaders && typeof customHeaders === 'string') {
      try {
        const parsed = JSON.parse(customHeaders)
        Object.assign(headers, parsed)
      } catch {}
    }

    // 发起请求
    const response = await fetch(url, {
      method: req.method === 'POST' ? 'POST' : 'GET',
      headers,
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    })

    // 获取响应
    const data = await response.text()
    
    // 设置响应头
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
    
    // 透传 Set-Cookie
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie)
    }

    // 返回响应
    return res.status(response.status).send(data)
    
  } catch (error: any) {
    console.error('[Proxy Error]', error.message)
    return res.status(500).json({ 
      code: -1, 
      message: '代理请求失败',
      error: error.message 
    })
  }
}
