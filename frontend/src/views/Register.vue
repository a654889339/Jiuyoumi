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
        <van-field v-model="form.email" label="邮箱" placeholder="请输入邮箱" left-icon="envelop-o" type="email">
          <template #button>
            <van-button size="small" type="primary" color="#667eea" :disabled="emailCooldown > 0" :loading="emailSending" @click="sendEmailCode">
              {{ emailCooldown > 0 ? `${emailCooldown}s` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
        <van-field v-model="form.emailCode" label="邮箱验证码" placeholder="请输入邮箱验证码" left-icon="shield-o" maxlength="6" />
        <van-field v-model="form.phone" label="手机号" placeholder="选填" left-icon="phone-o" type="tel" maxlength="11">
          <template #button>
            <van-button v-if="form.phone && form.phone.length === 11" size="small" type="primary" color="#667eea" :disabled="smsCooldown > 0" :loading="smsSending" @click="sendSmsCode">
              {{ smsCooldown > 0 ? `${smsCooldown}s` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
        <van-field v-if="form.phone && form.phone.length === 11" v-model="form.smsCode" label="短信验证码" placeholder="请输入短信验证码" left-icon="shield-o" maxlength="6" />
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
const form = reactive({ username: '', password: '', nickname: '', email: '', emailCode: '', phone: '', smsCode: '' });

const emailCooldown = ref(0);
const emailSending = ref(false);
const smsCooldown = ref(0);
const smsSending = ref(false);
let emailTimer = null;
let smsTimer = null;

const sendEmailCode = async () => {
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    showToast('请输入正确的邮箱地址'); return;
  }
  emailSending.value = true;
  try {
    await authApi.sendEmailCode(form.email);
    showToast('验证码已发送到邮箱');
    emailCooldown.value = 60;
    emailTimer = setInterval(() => {
      emailCooldown.value--;
      if (emailCooldown.value <= 0) clearInterval(emailTimer);
    }, 1000);
  } catch (err) { showToast(err?.message || '发送失败'); }
  finally { emailSending.value = false; }
};

const sendSmsCode = async () => {
  if (!form.phone || !/^1\d{10}$/.test(form.phone)) {
    showToast('请输入正确的11位手机号'); return;
  }
  smsSending.value = true;
  try {
    await authApi.sendSmsCode(form.phone);
    showToast('验证码已发送');
    smsCooldown.value = 60;
    smsTimer = setInterval(() => {
      smsCooldown.value--;
      if (smsCooldown.value <= 0) clearInterval(smsTimer);
    }, 1000);
  } catch (err) { showToast(err?.message || '发送失败'); }
  finally { smsSending.value = false; }
};

const handleRegister = async () => {
  if (!form.username || !form.password) { showToast('请填写账号和密码'); return; }
  if (form.password.length < 6) { showToast('密码至少6位'); return; }
  if (!form.email) { showToast('请填写邮箱地址'); return; }
  if (!form.emailCode) { showToast('请输入邮箱验证码'); return; }
  if (form.phone && form.phone.length === 11 && !form.smsCode) { showToast('请输入短信验证码'); return; }
  loading.value = true;
  try {
    const res = await authApi.register(form);
    const d = res.data || res;
    userStore.setAuth(d.token, d.user);
    showToast('注册成功');
    router.replace('/');
  } catch (err) { showToast(err?.message || '注册失败'); }
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
