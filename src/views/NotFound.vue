<template>
  <div class="not-found">
    <div class="code">404</div>
    <div class="msg">页面不存在</div>
    <button class="btn" @click="$router.push('/')">返回首页</button>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.code {
  font-size: 120px;
  font-weight: 800;
  background: linear-gradient(135deg, #fb7299, #00a1d6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.msg {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 16px 0 32px;
}
.btn {
  padding: 12px 32px;
  border-radius: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.25s;
}
.btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}
</style>