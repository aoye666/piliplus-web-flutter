<template>
  <div class="login-page">
    <!-- 毛玻璃顶栏 -->
    <header class="glass-topbar">
      <button class="btn-icon" @click="$router.back()">←</button>
      <span class="title">登录 B 站</span>
    </header>

    <div class="login-content">
      <!-- Logo -->
      <div class="logo-area">
        <div class="logo-icon">P</div>
        <div class="logo-text">PiliPlus Web</div>
      </div>

      <!-- 扫码登录 -->
      <div class="glass login-card px-16 py-16" v-if="loginMode === 'qr'">
        <div class="card-title">扫码登录</div>
        <div class="qr-wrap">
          <img v-if="qrImg" :src="qrImg" class="qr-img" />
          <div v-else-if="qrError" class="qr-error">
            <span>⚠️</span>
            <span>{{ qrError }}</span>
            <button class="retry-btn" @click="refreshQr">重新获取</button>
          </div>
          <div v-else class="qr-loading">
            <div class="spinner"></div>
            <span>获取二维码中...</span>
          </div>
        </div>
        <div class="qr-tip">打开哔哩哔哩 APP 扫描上方二维码</div>
        <div class="qr-status" v-if="qrStatus === 'scanned'">✅ 已扫码，请在手机上确认</div>
        <div class="qr-status expired" v-if="qrStatus === 'expired'">⏰ 二维码已过期，点击刷新</div>

        <div class="switch-mode" @click="loginMode = 'cookie'">或直接粘贴 Cookie 登录 →</div>
      </div>

      <!-- Cookie 登录 -->
      <div class="glass login-card px-16 py-16" v-if="loginMode === 'cookie'">
        <div class="card-title">Cookie 登录</div>
        <div class="cookie-tips">
          <p>在浏览器中登录 B 站后，从开发者工具中复制 Cookie：</p>
          <code>SESSDATA=xxx; bili_jct=xxx; DedeUserID=xxx</code>
        </div>
        <textarea class="cookie-input" v-model="cookieInput" placeholder="粘贴完整 Cookie 字符串..." rows="3"></textarea>
        <div class="cookie-actions">
          <button class="login-btn" @click="loginByCookie" :disabled="!cookieInput">
            {{ loginLoading ? '登录中...' : '登录' }}
          </button>
        </div>
        <div class="switch-mode" @click="loginMode = 'qr'">← 返回扫码登录</div>
      </div>

      <!-- 已登录状态 -->
      <div class="glass login-card px-16 py-16" v-if="userStore.isLogin">
        <div class="logged-in">
          <img class="avatar" :src="userStore.avatar || defaultAvatar" />
          <div class="user-info">
            <div class="uname">{{ userStore.uname || '已登录' }}</div>
            <div class="uid">UID: {{ userStore.mid || '---' }}</div>
          </div>
        </div>
        <div class="cookie-actions">
          <button class="logout-btn" @click="doLogout">退出登录</button>
          <button class="back-btn-main" @click="$router.push('/')">返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { passportApi } from '@/api/http'

const router = useRouter()
const userStore = useUserStore()

const defaultAvatar = 'https://i0.hdslb.com/bfs/static/jinkela/sns/icons/defaultavatar.png'
const loginMode = ref<'qr' | 'cookie'>('qr')
const qrImg = ref('')
const qrError = ref('')
const qrStatus = ref<'waiting' | 'scanned' | 'expired'>('waiting')
const cookieInput = ref('')
const loginLoading = ref(false)

let pollTimer: any = null

/** 获取扫码二维码 */
async function refreshQr() {
  qrStatus.value = 'waiting'
  qrError.value = ''
  qrImg.value = ''
  try {
    const res = await passportApi.get('/x/passport-login/captcha', { params: { source: 'main_web' } })
    const qrcodeKey = res.data?.data?.qrcode_key
    if (qrcodeKey) {
      qrImg.value = `https://passport.bilibili.com/x/passport-login/web/qrcode/h5/qrcode?qrcode_key=${qrcodeKey}`
      startPoll(qrcodeKey)
    }
  } catch (e) {
    qrError.value = '获取二维码失败'
  }
}

/** 轮询扫码状态 */
function startPoll(qrcodeKey: string) {
  stopPoll()
  pollTimer = setInterval(async () => {
    try {
      const res = await passportApi.get('/x/passport-login/web/qrcode/poll', { params: { qrcode_key: qrcodeKey } })
      const code = res.data?.data?.code
      if (code === 0) {
        // 扫码成功，设置 cookie
        const cookie = res.data?.data?.url?.match(/SESSDATA=([^;]+)/)?.[1]
        if (cookie) {
          userStore.setCookie(`SESSDATA=${cookie}`)
        }
        stopPoll()
        router.push('/')
      } else if (code === 86038) {
        qrStatus.value = 'expired'
        stopPoll()
      } else if (code === 86090) {
        qrStatus.value = 'scanned'
      }
    } catch { /* ignore */ }
  }, 2000)
}

function stopPoll() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
}

/** Cookie 登录 */
async function loginByCookie() {
  if (!cookieInput.value) return
  loginLoading.value = true
  try {
    userStore.setCookie(cookieInput.value.trim())
    await userStore.fetchUserInfo()
    if (userStore.isLogin) {
      router.push('/')
    }
  } catch {
    alert('Cookie 无效，请检查后重试')
  } finally {
    loginLoading.value = false
  }
}

/** 退出登录 */
function doLogout() {
  userStore.logout()
  refreshQr()
}

onMounted(() => {
  if (userStore.isLogin) return
  refreshQr()
})

onBeforeUnmount(stopPoll)
</script>

<style scoped>
.login-page { min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }

.glass-topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: 44px; display: flex; align-items: center; padding: 0 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
}
.btn-icon { background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; color: #fff; }
.title { flex: 1; font-size: 16px; font-weight: 600; color: #fff; text-align: center; }

.login-content { padding-top: 80px; padding-bottom: 40px; padding-left: 24px; padding-right: 24px; }

.logo-area { text-align: center; margin-bottom: 32px; }
.logo-icon { width: 72px; height: 72px; border-radius: 20px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(20px); display: inline-flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; color: #fff; border: 1px solid rgba(255, 255, 255, 0.3); }
.logo-text { font-size: 20px; font-weight: 700; color: #fff; margin-top: 12px; }

.login-card { max-width: 400px; margin: 0 auto; border-radius: 20px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.4); }
.card-title { font-size: 18px; font-weight: 600; text-align: center; margin-bottom: 20px; color: #333; }

.qr-wrap { width: 200px; height: 200px; margin: 0 auto; background: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.qr-img { width: 100%; height: 100%; }
.qr-loading, .qr-error { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 13px; color: #999; }
.spinner { width: 24px; height: 24px; border: 3px solid #eee; border-top-color: var(--bili-pink); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn { margin-top: 8px; padding: 6px 16px; border-radius: 12px; background: var(--bili-pink); color: #fff; border: none; font-size: 13px; cursor: pointer; }
.qr-tip { text-align: center; font-size: 13px; color: #666; margin-top: 14px; }
.qr-status { text-align: center; font-size: 13px; color: var(--bili-blue); margin-top: 8px; }
.qr-status.expired { color: #f56c6c; }
.switch-mode { text-align: center; font-size: 13px; color: var(--bili-blue); margin-top: 16px; cursor: pointer; }

.cookie-tips { font-size: 13px; color: #666; margin-bottom: 12px; line-height: 1.6; }
.cookie-tips code { display: block; background: #f5f5f5; padding: 8px; border-radius: 8px; font-size: 11px; margin-top: 6px; word-break: break-all; }
.cookie-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 12px; font-size: 13px; resize: none; outline: none; font-family: monospace; }
.cookie-input:focus { border-color: var(--bili-pink); }
.cookie-actions { margin-top: 16px; }
.login-btn { width: 100%; padding: 12px; border-radius: 24px; background: var(--bili-pink); color: #fff; border: none; font-size: 15px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
.login-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.logged-in { display: flex; align-items: center; gap: 14px; }
.logged-in .avatar { width: 60px; height: 60px; border-radius: 50%; border: 2px solid var(--bili-pink); }
.user-info .uname { font-size: 18px; font-weight: 600; }
.user-info .uid { font-size: 13px; color: #999; margin-top: 2px; }
.logout-btn { flex: 1; padding: 10px; border-radius: 24px; background: rgba(0, 0, 0, 0.05); color: #666; border: none; font-size: 14px; cursor: pointer; }
.back-btn-main { flex: 1; padding: 10px; border-radius: 24px; background: var(--bili-pink); color: #fff; border: none; font-size: 14px; cursor: pointer; }
</style>
