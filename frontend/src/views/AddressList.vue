<template>
  <div class="address-list">
    <van-nav-bar :title="isSelectMode ? '选择收货地址' : '地址管理'" left-arrow @click-left="onBack" />
    <van-loading v-if="loading" class="page-loading" size="28" vertical>加载中...</van-loading>
    <van-empty v-else-if="!addresses.length" description="暂无收货地址" />
    <div v-else class="list">
      <div v-for="addr in addresses" :key="addr.id" class="address-card">
        <div class="addr-main" @click="onAddressClick(addr)">
          <div class="addr-info">
            <p class="contact">{{ addr.contactName }} <span>{{ addr.contactPhone }}</span></p>
            <p class="detail">{{ formatAddr(addr) }}</p>
          </div>
          <van-tag v-if="addr.isDefault" type="primary" size="medium" color="#667eea">默认</van-tag>
        </div>
        <div v-if="!isSelectMode" class="addr-actions">
          <span @click.stop="setDefault(addr)" v-if="!addr.isDefault">设为默认</span>
          <span @click.stop="removeAddr(addr)" class="danger">删除</span>
        </div>
      </div>
    </div>
    <div v-if="!isSelectMode" class="add-btn-area">
      <van-button type="primary" color="linear-gradient(135deg, #667eea, #764ba2)" block round icon="plus" @click="$router.push('/address/add')">新增地址</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { addressApi } from '@/api';
import { showToast, showConfirmDialog } from 'vant';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const addresses = ref([]);

const isSelectMode = computed(() => route.query.select === '1');

function onBack() {
  if (isSelectMode.value) {
    const q = { ...route.query };
    delete q.select;
    router.replace({ path: '/checkout', query: q });
  } else {
    router.back();
  }
}

function onAddressClick(addr) {
  if (isSelectMode.value) {
    sessionStorage.setItem('checkout_address_id', String(addr.id));
    const q = { ...route.query };
    delete q.select;
    router.replace({ path: '/checkout', query: q });
  } else {
    router.push(`/address/edit/${addr.id}`);
  }
}

const formatAddr = (addr) => {
  const parts = [];
  if (addr.country === '其他') parts.push(addr.customCountry || '其他');
  else if (addr.country) parts.push(addr.country);
  if (addr.country === '中国大陆') {
    if (addr.province) parts.push(addr.province);
    if (addr.city) parts.push(addr.city);
    if (addr.district) parts.push(addr.district);
  }
  if (addr.detailAddress) parts.push(addr.detailAddress);
  return parts.join(' ');
};

const loadAddresses = async () => {
  try { const res = await addressApi.list(); addresses.value = res.data || []; } catch { addresses.value = []; }
  loading.value = false;
};

const setDefault = async (addr) => {
  try { await addressApi.setDefault(addr.id); await loadAddresses(); showToast('设置成功'); } catch { /* empty */ }
};

const removeAddr = async (addr) => {
  try {
    await showConfirmDialog({ title: '删除地址', message: '确定删除？' });
    await addressApi.remove(addr.id);
    addresses.value = addresses.value.filter(a => a.id !== addr.id);
    showToast('已删除');
  } catch { /* user cancelled */ }
};

onMounted(loadAddresses);
</script>

<style scoped>
.address-list { background: var(--jym-bg); min-height: 100vh; padding-bottom: 80px; }
.page-loading { padding: 80px 0; text-align: center; }
.list { padding: 12px; }
.address-card { background: #fff; border-radius: 12px; margin-bottom: 10px; overflow: hidden; }
.addr-main { padding: 16px; display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
.addr-info { flex: 1; }
.contact { font-size: 15px; font-weight: 600; }
.contact span { font-weight: 400; color: var(--jym-text-secondary); }
.detail { font-size: 13px; color: var(--jym-text-secondary); margin-top: 6px; line-height: 1.5; }
.addr-actions { display: flex; gap: 20px; padding: 10px 16px; border-top: 1px solid #f5f5f5; }
.addr-actions span { font-size: 13px; color: var(--jym-primary); cursor: pointer; }
.addr-actions .danger { color: #f5576c; }
.add-btn-area { position: fixed; bottom: 0; left: 0; right: 0; max-width: 750px; margin: 0 auto; padding: 12px 16px; background: #fff; }
</style>
