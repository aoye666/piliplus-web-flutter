import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/video/:bvid',
      name: 'video',
      component: () => import('@/views/VideoDetail.vue'),
      meta: { title: '视频详情' },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/Search.vue'),
      meta: { title: '搜索' },
    },
    {
      path: '/dynamic',
      name: 'dynamic',
      component: () => import('@/views/Dynamic.vue'),
      meta: { title: '动态' },
    },
    {
      path: '/user/:mid',
      name: 'user',
      component: () => import('@/views/UserSpace.vue'),
      meta: { title: '用户空间' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/player/:bvid/:cid?',
      name: 'player',
      component: () => import('@/views/Player.vue'),
      meta: { title: '播放器' },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'PiliPlus'} - PiliPlus Web`
  next()
})

export default router
