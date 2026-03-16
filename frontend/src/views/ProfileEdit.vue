<template>
  <div class="profile-edit">
    <van-nav-bar title="编辑资料" left-arrow @click-left="$router.back()" />
    <van-cell-group inset class="form-group">
      <van-field v-model="form.nickname" label="昵称" placeholder="请输入昵称" />
      <van-field v-model="form.phone" label="手机号" placeholder="请输入手机号" type="tel" maxlength="11" />
    </van-cell-group>
    <div class="actions">
      <van-button type="primary" color="linear-gradient(135deg, #667eea, #764ba2)" block round :loading="saving" @click="save">保存</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { authApi } from '@/api';
import { showToast } from 'vant';

const router = useRouter();
const userStore = useUserStore();
const saving = ref(false);
const form = reactive({ nickname: '', phone: '' });

onMounted(async () => {
  if (!userStore.userInfo) await userStore.fetchProfile();
  const u = userStore.userInfo;
  if (u) { form.nickname = u.nickname || ''; form.phone = u.phone || ''; }
});

const save = async () => {
  saving.value = true;
  try {
    await authApi.updateProfile(form);
    await userStore.fetchProfile();
    showToast('保存成功');
    router.back();
  } catch (err) { showToast(err.message || '保存失败'); }
  finally { saving.value = false; }
};
</script>

<style scoped>
.profile-edit { background: var(--jym-bg); min-height: 100vh; }
.form-group { margin: 16px 12px !important; border-radius: 12px !important; }
.actions { padding: 24px 16px; }
</style>
