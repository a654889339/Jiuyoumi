<template>
  <div class="address-edit">
    <van-nav-bar :title="isEdit ? '编辑地址' : '新增地址'" left-arrow @click-left="$router.back()" />
    <van-loading v-if="pageLoading" class="page-loading" size="30" vertical>加载中...</van-loading>
    <template v-else>
      <van-cell-group inset>
        <van-field v-model="form.contactName" label="联系人" placeholder="收货人姓名" />
        <van-field v-model="form.contactPhone" label="手机号" placeholder="收货人手机号" type="tel" maxlength="11" />
      </van-cell-group>

      <van-cell-group inset class="mt12">
        <div class="picker-trigger" @click="showCountryList = !showCountryList; showAreaPicker = false">
          <span class="picker-label">国家/地区</span>
          <span :class="['picker-value', { placeholder: !form.country }]">
            {{ countryDisplay || '请选择国家/地区' }}
          </span>
          <van-icon :name="showCountryList ? 'arrow-up' : 'arrow-down'" class="picker-arrow" />
        </div>
        <div v-if="showCountryList" class="select-list">
          <div
            v-for="c in countryColumns"
            :key="c"
            class="select-item"
            :class="{ active: form.country === c }"
            @click="selectCountry(c)"
          >
            <span>{{ c }}</span>
            <van-icon v-if="form.country === c" name="success" color="#667eea" size="16" />
          </div>
        </div>

        <van-field
          v-if="form.country === '其他'"
          v-model="form.customCountry"
          label="自定义国家"
          placeholder="请输入国家/地区名称"
        />

        <template v-if="form.country === '中国大陆'">
          <div class="picker-trigger" @click="showAreaPicker = !showAreaPicker; showCountryList = false">
            <span class="picker-label">省/市/区</span>
            <span :class="['picker-value', { placeholder: !form.province }]">
              {{ areaDisplay || '请选择省市区' }}
            </span>
            <van-icon :name="showAreaPicker ? 'arrow-up' : 'arrow-down'" class="picker-arrow" />
          </div>
          <div v-if="showAreaPicker" class="area-picker-wrap" @touchmove.stop @mousewheel.stop>
            <van-area
              :area-list="areaList"
              @confirm="onAreaConfirm"
              @cancel="showAreaPicker = false"
            />
          </div>
        </template>
      </van-cell-group>

      <van-cell-group inset class="mt12">
        <van-field v-model="form.detailAddress" label="详细地址" type="textarea" rows="2" placeholder="街道、门牌号等" autosize />
      </van-cell-group>

      <van-cell title="设为默认地址">
        <template #right-icon>
          <van-switch v-model="form.isDefault" size="22" active-color="#667eea" />
        </template>
      </van-cell>

      <div class="actions">
        <van-button type="primary" color="linear-gradient(135deg, #667eea, #764ba2)" block round :loading="saving" @click="save">保存</van-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { addressApi, authApi } from '@/api';
import { useUserStore } from '@/stores/user';
import { showToast } from 'vant';
import { areaList } from '@vant/area-data';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const saving = ref(false);
const pageLoading = ref(false);
const showCountryList = ref(false);
const showAreaPicker = ref(false);
const isEdit = computed(() => !!route.params.id);

const countryColumns = [
  '中国大陆', '中国香港', '中国澳门', '中国台湾',
  '美国', '英国', '日本', '韩国', '新加坡', '澳大利亚',
  '加拿大', '德国', '法国', '马来西亚', '泰国', '其他',
];

const form = reactive({
  contactName: '',
  contactPhone: '',
  country: '中国大陆',
  customCountry: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false,
});

const countryDisplay = computed(() => {
  if (form.country === '其他' && form.customCountry) return `其他 - ${form.customCountry}`;
  return form.country || '';
});

const areaDisplay = computed(() => {
  if (form.province) return `${form.province} ${form.city} ${form.district}`.trim();
  return '';
});

const selectCountry = (c) => {
  form.country = c;
  form.province = '';
  form.city = '';
  form.district = '';
  form.customCountry = '';
  showCountryList.value = false;
};

const onAreaConfirm = ({ selectedOptions }) => {
  form.province = selectedOptions[0]?.text || '';
  form.city = selectedOptions[1]?.text || '';
  form.district = selectedOptions[2]?.text || '';
  showAreaPicker.value = false;
};

const save = async () => {
  if (!form.contactName.trim()) { showToast('请输入联系人'); return; }
  if (!form.contactPhone.trim()) { showToast('请输入手机号'); return; }
  if (!form.country) { showToast('请选择国家/地区'); return; }
  if (form.country === '其他' && !form.customCountry.trim()) { showToast('请输入国家/地区名称'); return; }
  if (form.country === '中国大陆' && !form.province) { showToast('请选择省市区'); return; }
  if (!form.detailAddress.trim()) { showToast('请填写详细地址'); return; }
  saving.value = true;
  try {
    if (isEdit.value) await addressApi.update(route.params.id, form);
    else await addressApi.create(form);
    showToast('保存成功');
    router.back();
  } catch (err) { showToast(err.message || '保存失败'); }
  finally { saving.value = false; }
};

onMounted(async () => {
  if (!userStore.userInfo && userStore.token) {
    try { await userStore.fetchProfile(); } catch { /* ignore */ }
  }
  if (!isEdit.value && userStore.userInfo?.phone) {
    form.contactPhone = userStore.userInfo.phone;
  }
  if (isEdit.value) {
    pageLoading.value = true;
    try {
      const res = await addressApi.list();
      const addr = (res.data || []).find(a => String(a.id) === String(route.params.id));
      if (addr) {
        Object.assign(form, {
          contactName: addr.contactName || '',
          contactPhone: addr.contactPhone || '',
          country: addr.country || '中国大陆',
          customCountry: addr.customCountry || '',
          province: addr.province || '',
          city: addr.city || '',
          district: addr.district || '',
          detailAddress: addr.detailAddress || '',
          isDefault: !!addr.isDefault,
        });
      }
    } catch { showToast('加载地址失败'); }
    finally { pageLoading.value = false; }
  }
});
</script>

<style scoped>
.address-edit { background: var(--jym-bg); min-height: 100vh; padding-bottom: 80px; }
.page-loading { padding-top: 100px; text-align: center; }
.mt12 { margin-top: 12px; }

.picker-trigger {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  min-height: 44px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}
.picker-label { font-size: 14px; color: #323233; width: 6.2em; flex-shrink: 0; margin-right: 12px; }
.picker-value { flex: 1; font-size: 14px; color: #323233; text-align: right; }
.picker-value.placeholder { color: #c8c9cc; }
.picker-arrow { margin-left: 4px; color: #969799; flex-shrink: 0; }

.select-list { max-height: 200px; overflow-y: auto; border-bottom: 1px solid #f0f0f0; }
.select-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 14px;
  color: #323233;
  border-bottom: 1px solid #fafafa;
  cursor: pointer;
}
.select-item:active { background: #f5f5f5; }
.select-item.active { color: #667eea; font-weight: 500; }

.area-picker-wrap { border-bottom: 1px solid #f0f0f0; height: 260px; overflow: hidden; }

.actions { padding: 24px 16px; }
</style>
