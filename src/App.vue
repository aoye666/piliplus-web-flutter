<template>
  <router-view />

  <!-- Flutter风格底部导航栏 -->
  <nav class="glass-tabbar" v-if="showTabbar">
    <div 
      class="tab-item" 
      :class="{ active: currentPath === '/' }" 
      @click="go('/')"
    >
      <div class="tab-icon-wrapper">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <span class="tab-label">首页</span>
    </div>
    
    <div 
      class="tab-item" 
      :class="{ active: currentPath === '/dynamic' }" 
      @click="go('/dynamic')"
    >
      <div class="tab-icon-wrapper">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </div>
      <span class="tab-label">动态</span>
    </div>
    
    <div 
      class="tab-item" 
      :class="{ active: currentPath === '/search' }" 
      @click="go('/search')"
    >
      <div class="tab-icon-wrapper">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <span class="tab-label">搜索</span>
    </div>
    
    <div 
      class="tab-item" 
      :class="{ active: currentPath.startsWith('/user') || currentPath === '/login' }" 
      @click="go(userStore.isLogin ? `/user/${userStore.mid}` : '/login')"
    >
      <div class="tab-icon-wrapper">
        <img 
          v-if="userStore.isLogin && userStore.avatar" 
          class="tab-avatar" 
          :src="userStore.avatar" 
        />
        <svg v-else class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <span class="tab-label">{{ userStore.isLogin ? (userStore.uname || '我') : '登录' }}</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentPath = computed(() => route.path)

const showTabbar = computed(() => {
  const hideOn = ['/player/', '/login']
  return !hideOn.some(p => route.path.startsWith(p))
})

function go(path: string) {
  router.push(path)
}

onMounted(() => {
  if (userStore.isLogin) {
    userStore.fetchUserInfo()
  }
})
</script>

<style scoped>
.glass-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed, 300);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(15, 15, 35, 0.85);
  backdrop-filter: blur(30px) saturate(200%);
  -webkit-backdrop-filter: blur(30px) saturate(200%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 20px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  color: rgba(255, 255, 255, 0.5);
  position: relative;
}

.tab-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 24px;
  height: 3px;
  background: linear-gradient(90deg, #fb7299, #00a1d6);
  border-radius: 0 0 3px 3px;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.tab-item.active {
  color: #ffffff;
}

.tab-item.active::before {
  transform: translateX(-50%) scaleX(1);
}

.tab-item:active {
  transform: scale(0.9);
}

.tab-icon-wrapper {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tab-item.active .tab-icon-wrapper::before {
  content: '';
  position: absolute;
  inset: -4px;
  background: linear-gradient(135deg, rgba(251, 114, 153, 0.2), rgba(0, 161, 214, 0.2));
  border-radius: 50%;
  filter: blur(8px);
  z-index: -1;
}

.tab-icon {
  width: 24px;
  height: 24px;
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.tab-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #fb7299, #00a1d6) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.tab-item:hover .tab-avatar {
  border-color: #fb7299;
  box-shadow: 0 0 15px rgba(251, 114, 153, 0.4);
}
</style>
