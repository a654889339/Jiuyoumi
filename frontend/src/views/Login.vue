<template>
  <div class="login-page">
    <van-nav-bar title="登录" left-arrow @click-left="goBack" />
    <div class="login-header">
      <h1 class="brand">九尤米</h1>
      <h2>欢迎回来</h2>
    </div>
    <div class="login-form">
      <van-tabs v-model:active="activeTab" animated swipeable color="#667eea">
        <van-tab title="账号登录">
          <van-cell-group inset style="margin-top: 16px">
            <van-field v-model="form.username" label="账号" placeholder="请输入用户名" left-icon="manager-o" />
            <van-field v-model="form.password" type="password" label="密码" placeholder="请输入密码" left-icon="lock" autocomplete="current-password" />
          </van-cell-group>
          <div class="login-actions">
            <van-button type="primary" color="linear-gradient(135deg, #667eea, #764ba2)" block round :loading="loading" @click="handleLogin">登录</van-button>
          </div>
        </van-tab>
        <van-tab title="手机号登录">
          <van-cell-group inset style="margin-top: 16px">
            <van-field v-model="phoneForm.phone" label="手机号" placeholder="请输入手机号" left-icon="phone-o" type="tel" maxlength="11" />
            <van-field v-model="phoneForm.smsCode" label="验证码" placeholder="请输入验证码" left-icon="shield-o" maxlength="6">
              <template #button>
                <van-button size="small" type="primary" color="#667eea" :disabled="smsCooldown > 0" :loading="smsSending" @click="sendSmsCode">
                  {{ smsCooldown > 0 ? `${smsCooldown}s` : '获取验证码' }}
                </van-button>
              </template>
            </van-field>
          </van-cell-group>
          <div class="login-actions">
            <van-button type="primary" color="linear-gradient(135deg, #667eea, #764ba2)" block round :loading="phoneLoading" @click="handlePhoneLogin">登录</van-button>
          </div>
        </van-tab>
      </van-tabs>
      <p class="register-link">还没有账号？<span @click="$router.push('/register')">立即注册</span></p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { authApi } from '@/api';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);
const phoneLoading = ref(false);
const activeTab = ref(0);
const form = reactive({ username: '', password: '' });
const phoneForm = reactive({ phone: '', smsCode: '' });
const smsCooldown = ref(0);
const smsSending = ref(false);
let cooldownTimer = null;

const goBack = () => {
  if (window.history.length > 1 && !route.query.redirect) {
    router.back();
  } else {
    router.replace('/');
  }
};

const loginSuccess = (res) => {
  const d = res.data || res;
  userStore.setAuth(d.token, d.user);
  showToast('登录成功');
  const redirect = route.query.redirect;
  if (redirect && typeof redirect === 'string' && redirect.startsWith('/')) {
    router.replace(decodeURIComponent(redirect));
  } else {
    router.replace('/');
  }
};

const handleLogin = async () => {
  if (!form.username || !form.password) { showToast('请填写完整信息'); return; }
  loading.value = true;
  try {
    const res = await authApi.login(form);
    loginSuccess(res);
  } catch (err) { showToast(err?.message || '登录失败'); }
  finally { loading.value = false; }
};

const sendSmsCode = async () => {
  if (!phoneForm.phone || !/^1\d{10}$/.test(phoneForm.phone)) {
    showToast('请输入正确的11位手机号'); return;
  }
  smsSending.value = true;
  try {
    await authApi.sendSmsCode(phoneForm.phone);
    showToast('验证码已发送');
    smsCooldown.value = 60;
    cooldownTimer = setInterval(() => {
      smsCooldown.value--;
      if (smsCooldown.value <= 0) clearInterval(cooldownTimer);
    }, 1000);
  } catch (err) { showToast(err?.message || '发送失败'); }
  finally { smsSending.value = false; }
};

const handlePhoneLogin = async () => {
  if (!phoneForm.phone || !/^1\d{10}$/.test(phoneForm.phone)) { showToast('请输入正确的手机号'); return; }
  if (!phoneForm.smsCode || phoneForm.smsCode.length < 4) { showToast('请输入验证码'); return; }
  phoneLoading.value = true;
  try {
    const res = await authApi.login({ phone: phoneForm.phone, smsCode: phoneForm.smsCode });
    loginSuccess(res);
  } catch (err) { showToast(err?.message || '登录失败'); }
  finally { phoneLoading.value = false; }
};
</script>

<style scoped>
.login-page { background: var(--jym-bg); min-height: 100vh; }
.login-header { text-align: center; padding: 40px 20px 20px; }
.brand { font-size: 36px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 4px; margin-bottom: 12px; }
.login-header h2 { font-size: 20px; color: var(--jym-text); }
.login-form { padding: 0 0 20px; }
.login-actions { padding: 24px 16px 0; }
.register-link { text-align: center; margin-top: 16px; font-size: 14px; color: var(--jym-text-secondary); }
.register-link span { color: var(--jym-primary); cursor: pointer; }
</style>
