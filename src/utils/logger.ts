/**
 * PiliPlus Web 日志系统
 * 记录所有 API 请求/响应，便于调试
 */

export interface LogEntry {
  id: string
  timestamp: number
  type: 'request' | 'response' | 'error' | 'info' | 'warn'
  method?: string
  url?: string
  status?: number
  duration?: number
  requestData?: any
  responseData?: any
  error?: string
  message?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs: number = 500
  private listeners: Set<(logs: LogEntry[]) => void> = new Set()

  /** 生成唯一 ID */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  }

  /** 添加日志 */
  private addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): LogEntry {
    const log: LogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...entry,
    }

    this.logs.unshift(log)

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // 通知监听器
    this.notifyListeners()

    // 同时输出到 console
    this.consoleLog(log)

    return log
  }

  /** Console 输出 */
  private consoleLog(log: LogEntry) {
    const time = new Date(log.timestamp).toLocaleTimeString('zh-CN')
    const prefix = `[${time}]`

    switch (log.type) {
      case 'request':
        console.log(
          `%c${prefix} 📤 ${log.method} ${log.url}`,
          'color: #00a1d6',
          log.requestData ? '\n请求参数:' + JSON.stringify(log.requestData) : ''
        )
        break
      case 'response':
        console.log(
          `%c${prefix} 📥 ${log.status} ${log.url} (${log.duration}ms)`,
          log.status && log.status >= 200 && log.status < 300
            ? 'color: #52c41a'
            : 'color: #ff4d4f',
          '\n响应数据:',
          log.responseData
        )
        break
      case 'error':
        console.error(
          `${prefix} ❌ ${log.url || 'Unknown'}:`,
          log.error || log.message
        )
        break
      case 'warn':
        console.warn(`${prefix} ⚠️`, log.message)
        break
      case 'info':
        console.log(`%c${prefix} ℹ️ ${log.message}`, 'color: #888')
        break
    }
  }

  /** 通知监听器 */
  private notifyListeners() {
    this.listeners.forEach(fn => fn([...this.logs]))
  }

  // ============ 公开方法 ============

  /** 记录请求 */
  request(method: string, url: string, data?: any): string {
    const id = this.generateId()
    this.addLog({
      type: 'request',
      method: method.toUpperCase(),
      url,
      requestData: data,
      message: `${method.toUpperCase()} ${url}`,
    })
    return id
  }

  /** 记录响应 */
  response(url: string, status: number, data: any, duration: number) {
    this.addLog({
      type: 'response',
      url,
      status,
      responseData: data,
      duration,
      message: `${status} ${url} (${duration}ms)`,
    })
  }

  /** 记录错误 */
  error(url: string | undefined, error: any) {
    const errorMsg = error?.response?.data?.message
      || error?.message
      || String(error)
    
    this.addLog({
      type: 'error',
      url,
      error: errorMsg,
      message: errorMsg,
    })
  }

  /** 记录警告 */
  warn(message: string) {
    this.addLog({
      type: 'warn',
      message,
    })
  }

  /** 记录信息 */
  info(message: string) {
    this.addLog({
      type: 'info',
      message,
    })
  }

  /** 获取所有日志 */
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /** 清空日志 */
  clear() {
    this.logs = []
    this.notifyListeners()
  }

  /** 监听日志变化 */
  subscribe(fn: (logs: LogEntry[]) => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  /** 导出日志为文本 */
  exportAsText(): string {
    return this.logs.map(log => {
      const time = new Date(log.timestamp).toLocaleString('zh-CN')
      const base = `[${time}] [${log.type.toUpperCase()}]`
      
      if (log.type === 'request') {
        return `${base} ${log.method} ${log.url}${log.requestData ? '\n  参数: ' + JSON.stringify(log.requestData, null, 2) : ''}`
      }
      if (log.type === 'response') {
        return `${base} ${log.status} ${log.url} (${log.duration}ms)\n  响应: ${JSON.stringify(log.responseData, null, 2).slice(0, 500)}`
      }
      if (log.type === 'error') {
        return `${base} ${log.url || ''} ${log.error}`
      }
      return `${base} ${log.message}`
    }).join('\n\n')
  }

  /** 导出为 JSON */
  exportAsJson(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// 单例
export const logger = new Logger()
