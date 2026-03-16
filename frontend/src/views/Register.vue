<template>
  <div class="register-page">
    <van-nav-bar title="注册" left-arrow @click-left="$router.back()" />
    <div class="register-header">
      <h1 class="brand">九柚米</h1>
      <h2>创建账号</h2>
    </div>
    <div class="register-form">
      <van-cell-group inset>
        <van-field v-model="form.username" label="账号" placeholder="请输入用户名（2-50字符）" left-icon="manager-o" maxlength="50" />
        <van-field v-model="form.password" type="password" label="密码" placeholder="请输入密码（至少6位）" left-icon="lock" autocomplete="new-password" />
        <van-field v-model="form.nickname" label="昵称" placeholder="选填" left-icon="contact-o" maxlength="50" />
        <van-field v-model="form.phone" label="手机号" placeholder="选填" left-icon="phone-o" type="tel" maxlength="11" />
      </van-cell-group>
      <div class="register-actions">
        <van-button type="primary" color="linear-gradient(135deg, #667eea, #764ba2)" block round :loading="loading" @click="handleRegister">注册</van-button>
        <p class="login-link">已有账号？<span @click="$router.replace('/login')">去登录</span></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { authApi } from '@/api';
import { showToast } from 'vant';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const form = reactive({ username: '', password: '', nickname: '', phone: '' });

const handleRegister = async () => {
  if (!form.username || !form.password) { showToast('请填写完整信息'); return; }
  if (form.password.length < 6) { showToast('密码至少6位'); return; }
  loading.value = true;
  try {
    const res = await authApi.register(form);
    const d = res.data || res;
    userStore.setAuth(d.token, d.user);
    showToast('注册成功');
    router.replace('/');
  } catch (err) { showToast(err.message || '注册失败'); }
  finally { loading.value = false; }
};
</script>

<style scoped>
.register-page { background: var(--jym-bg); min-height: 100vh; }
.register-header { text-align: center; padding: 30px 20px 16px; }
.brand { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 4px; margin-bottom: 8px; }
.register-header h2 { font-size: 20px; color: var(--jym-text); }
.register-form { padding: 16px 0; }
.register-actions { padding: 24px 16px; }
.login-link { text-align: center; margin-top: 16px; font-size: 14px; color: var(--jym-text-secondary); }
.login-link span { color: var(--jym-primary); cursor: pointer; }
</style>
