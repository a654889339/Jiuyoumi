<template>
  <div class="address-edit">
    <van-nav-bar :title="isEdit ? '编辑地址' : '新增地址'" left-arrow @click-left="$router.back()" />
    <van-cell-group inset class="form-group">
      <van-field v-model="form.contactName" label="联系人" placeholder="收货人姓名" />
      <van-field v-model="form.contactPhone" label="手机号" placeholder="收货人手机号" type="tel" maxlength="11" />
      <van-field v-model="form.province" label="省份" placeholder="省份" />
      <van-field v-model="form.city" label="城市" placeholder="城市" />
      <van-field v-model="form.district" label="区县" placeholder="区县" />
      <van-field v-model="form.detailAddress" label="详细地址" placeholder="街道、门牌号等" type="textarea" rows="2" autosize />
      <van-cell title="设为默认地址">
        <template #right-icon>
          <van-switch v-model="form.isDefault" size="22" active-color="#667eea" />
        </template>
      </van-cell>
    </van-cell-group>
    <div class="actions">
      <van-button type="primary" color="linear-gradient(135deg, #667eea, #764ba2)" block round :loading="saving" @click="save">保存</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { addressApi } from '@/api';
import { showToast } from 'vant';

const route = useRoute();
const router = useRouter();
const saving = ref(false);
const isEdit = computed(() => !!route.params.id);
const form = reactive({ contactName: '', contactPhone: '', province: '', city: '', district: '', detailAddress: '', isDefault: false });

onMounted(async () => {
  if (isEdit.value) {
    try {
      const res = await addressApi.list();
      const addr = (res.data || []).find(a => String(a.id) === String(route.params.id));
      if (addr) Object.assign(form, addr);
    } catch { /* empty */ }
  }
});

const save = async () => {
  if (!form.contactName || !form.contactPhone) { showToast('请填写联系人和手机号'); return; }
  if (!form.detailAddress) { showToast('请填写详细地址'); return; }
  saving.value = true;
  try {
    if (isEdit.value) await addressApi.update(route.params.id, form);
    else await addressApi.create(form);
    showToast('保存成功');
    router.back();
  } catch (err) { showToast(err.message || '保存失败'); }
  finally { saving.value = false; }
};
</script>

<style scoped>
.address-edit { background: var(--jym-bg); min-height: 100vh; }
.form-group { margin: 16px 12px !important; border-radius: 12px !important; }
.actions { padding: 24px 16px; }
</style>
