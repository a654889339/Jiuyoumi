<template>
  <div class="login-page">
    <van-nav-bar title="登录" left-arrow @click-left="$router.back()" />
    <div class="login-header">
      <h1 class="brand">九柚米</h1>
      <h2>欢迎回来</h2>
    </div>
    <div class="login-form">
      <van-cell-group inset>
        <van-field v-model="form.username" label="账号" placeholder="请输入用户名" left-icon="manager-o" />
        <van-field v-model="form.password" type="password" label="密码" placeholder="请输入密码" left-icon="lock" autocomplete="current-password" />
      </van-cell-group>
      <div class="login-actions">
        <van-button type="primary" color="linear-gradient(135deg, #667eea, #764ba2)" block round :loading="loading" @click="handleLogin">登录</van-button>
        <p class="register-link">还没有账号？<span @click="$router.push('/register')">立即注册</span></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);
const form = reactive({ username: '', password: '' });

const handleLogin = async () => {
  if (!form.username || !form.password) { showToast('请填写完整信息'); return; }
  loading.value = true;
  try {
    await userStore.login(form);
    showToast('登录成功');
    const redirect = route.query.redirect;
    if (redirect && typeof redirect === 'string' && redirect.startsWith('/')) router.replace(decodeURIComponent(redirect));
    else router.replace('/');
  } catch (err) { showToast(err.message || '登录失败'); }
  finally { loading.value = false; }
};
</script>

<style scoped>
.login-page { background: var(--jym-bg); min-height: 100vh; }
.login-header { text-align: center; padding: 40px 20px 20px; }
.brand { font-size: 36px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 4px; margin-bottom: 12px; }
.login-header h2 { font-size: 20px; color: var(--jym-text); }
.login-form { padding: 20px 0; }
.login-actions { padding: 24px 16px; }
.register-link { text-align: center; margin-top: 16px; font-size: 14px; color: var(--jym-text-secondary); }
.register-link span { color: var(--jym-primary); cursor: pointer; }
</style>
