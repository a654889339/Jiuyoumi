<template>
  <div class="profile-edit">
    <van-nav-bar title="编辑资料" left-arrow @click-left="$router.back()" />
    <div class="avatar-section">
      <div class="avatar-wrap" @click="triggerAvatarInput">
        <img v-if="form.avatar" :src="form.avatar" class="avatar-img" alt="头像" />
        <span v-else-if="userStore.userInfo?.nickname || userStore.userInfo?.username" class="avatar-initial">{{ (userStore.userInfo?.nickname || userStore.userInfo?.username).charAt(0) }}</span>
        <van-icon v-else name="user-o" size="48" color="#ccc" />
        <span class="avatar-tip">点击上传或拍照</span>
      </div>
      <input ref="avatarInputRef" type="file" accept="image/*" class="avatar-input" @change="onAvatarChange" />
      <input ref="cameraInputRef" type="file" accept="image/*" capture="environment" class="avatar-input" @change="onAvatarChange" />
      <div class="avatar-actions">
        <span @click="triggerAvatarInput">上传图片</span>
        <span @click="triggerCameraInput">拍照</span>
      </div>
    </div>
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
const uploading = ref(false);
const avatarInputRef = ref(null);
const cameraInputRef = ref(null);
const form = reactive({ nickname: '', phone: '', avatar: '' });

onMounted(async () => {
  if (!userStore.userInfo) await userStore.fetchProfile();
  const u = userStore.userInfo;
  if (u) {
    form.nickname = u.nickname || '';
    form.phone = u.phone || '';
    form.avatar = u.avatar || '';
  }
});

function triggerAvatarInput() {
  avatarInputRef.value?.click();
}
function triggerCameraInput() {
  cameraInputRef.value?.click();
}

async function onAvatarChange(e) {
  const file = e.target?.files?.[0];
  e.target.value = '';
  if (!file || !file.type.startsWith('image/')) {
    showToast('请选择图片');
    return;
  }
  uploading.value = true;
  try {
    const res = await authApi.uploadAvatar(file);
    const url = res.data?.url;
    if (url) {
      form.avatar = url;
      showToast('头像已更新，请保存');
    }
  } catch (err) {
    showToast(err.message || '上传失败');
  } finally {
    uploading.value = false;
  }
}

const save = async () => {
  saving.value = true;
  try {
    await authApi.updateProfile({ nickname: form.nickname, phone: form.phone, avatar: form.avatar });
    await userStore.fetchProfile();
    showToast('保存成功');
    router.back();
  } catch (err) { showToast(err.message || '保存失败'); }
  finally { saving.value = false; }
};
</script>

<style scoped>
.profile-edit { background: var(--jym-bg); min-height: 100vh; }
.avatar-section { padding: 24px 16px; background: #fff; margin: 12px; border-radius: 12px; text-align: center; }
.avatar-wrap { width: 96px; height: 96px; border-radius: 50%; margin: 0 auto 12px; overflow: hidden; background: #f5f5f5; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-initial { font-size: 36px; font-weight: 700; color: #667eea; }
.avatar-tip { display: block; font-size: 12px; color: var(--jym-text-secondary); margin-top: 8px; }
.avatar-input { display: none; }
.avatar-actions { display: flex; justify-content: center; gap: 24px; margin-top: 8px; }
.avatar-actions span { font-size: 14px; color: var(--jym-primary); cursor: pointer; }
.form-group { margin: 16px 12px !important; border-radius: 12px !important; }
.actions { padding: 24px 16px; }
</style>
