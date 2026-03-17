<template>
  <div class="checkout-page">
    <van-nav-bar title="确认订单" left-arrow @click-left="$router.back()" />
    <div class="address-card" @click="$router.push('/address')">
      <template v-if="selectedAddress">
        <van-icon name="location-o" size="20" color="#667eea" />
        <div class="address-info">
          <p class="contact">{{ selectedAddress.contactName }} {{ selectedAddress.contactPhone }}</p>
          <p class="addr">{{ fullAddress(selectedAddress) }}</p>
        </div>
      </template>
      <template v-else>
        <van-icon name="add-o" size="20" color="#667eea" />
        <span>请选择收货地址</span>
      </template>
      <van-icon name="arrow" />
    </div>

    <div class="items-card">
      <div v-for="item in orderItems" :key="item.productId" class="checkout-item">
        <div class="item-img">
          <img v-if="item.coverImage" :src="item.coverImage" />
          <van-icon v-else name="photo-o" size="28" color="#ccc" />
        </div>
        <div class="item-info">
          <h4>{{ item.name }}</h4>
          <span>x{{ item.quantity }}</span>
        </div>
        <span class="item-price">¥{{ item.price }}</span>
      </div>
    </div>

    <van-cell-group inset class="remark-group">
      <van-field v-model="remark" label="备注" placeholder="选填，给卖家留言" />
    </van-cell-group>

    <div class="checkout-bottom">
      <div class="total">合计: <b>¥{{ totalPrice }}</b></div>
      <van-button type="primary" round color="linear-gradient(135deg, #667eea, #764ba2)" :loading="submitting" @click="submitOrder">提交订单</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { productApi, cartApi, addressApi, orderApi } from '@/api';

const route = useRoute();
const router = useRouter();
const selectedAddress = ref(null);
const orderItems = ref([]);
const remark = ref('');
const submitting = ref(false);

const totalPrice = computed(() => orderItems.value.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0).toFixed(2));

const fullAddress = (addr) => {
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

onMounted(async () => {
  try {
    const res = await addressApi.list();
    const addrs = res.data || [];
    selectedAddress.value = addrs.find(a => a.isDefault) || addrs[0] || null;
  } catch { /* empty */ }

  if (route.query.productId) {
    try {
      const res = await productApi.detail(route.query.productId);
      const p = res.data;
      orderItems.value = [{ productId: p.id, name: p.name, coverImage: p.coverImage, price: p.price, quantity: parseInt(route.query.qty) || 1 }];
    } catch { /* empty */ }
  } else {
    try {
      const res = await cartApi.list();
      orderItems.value = (res.data || []).map(i => ({
        productId: i.productId,
        name: i.product?.name || '商品',
        coverImage: i.product?.coverImage || '',
        price: i.product?.price || 0,
        quantity: i.quantity,
      }));
    } catch { /* empty */ }
  }
});

const submitOrder = async () => {
  if (!selectedAddress.value) { showToast('请选择收货地址'); return; }
  if (!orderItems.value.length) { showToast('无商品信息'); return; }
  submitting.value = true;
  try {
    const addr = selectedAddress.value;
    await orderApi.create({
      items: orderItems.value.map(i => ({ productId: i.productId, quantity: i.quantity })),
      contactName: addr.contactName,
      contactPhone: addr.contactPhone,
      address: fullAddress(addr),
      remark: remark.value,
    });
    if (!route.query.productId) await cartApi.clear();
    showToast('下单成功');
    router.replace('/orders');
  } catch (err) { showToast(err.message || '下单失败'); }
  finally { submitting.value = false; }
};
</script>

<style scoped>
.checkout-page { background: var(--jym-bg); min-height: 100vh; padding-bottom: 80px; }
.address-card { background: #fff; margin: 12px; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
.address-info { flex: 1; }
.contact { font-size: 15px; font-weight: 600; }
.addr { font-size: 13px; color: var(--jym-text-secondary); margin-top: 4px; }

.items-card { background: #fff; margin: 8px 12px; border-radius: 12px; padding: 14px; }
.checkout-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.checkout-item + .checkout-item { border-top: 1px solid #f5f5f5; }
.item-img { width: 60px; height: 60px; border-radius: 8px; overflow: hidden; background: #f5f5f5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; }
.item-info h4 { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.item-info span { font-size: 12px; color: #999; }
.item-price { font-size: 15px; font-weight: 600; flex-shrink: 0; }

.remark-group { margin: 8px 12px !important; border-radius: 12px !important; }

.checkout-bottom { position: fixed; bottom: 0; left: 0; right: 0; max-width: 750px; margin: 0 auto; background: #fff; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -2px 10px rgba(0,0,0,0.06); z-index: 100; }
.total { font-size: 14px; color: var(--jym-text-secondary); }
.total b { font-size: 20px; color: #f5576c; }
</style>
