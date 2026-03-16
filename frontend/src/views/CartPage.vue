<template>
  <div class="cart-page">
    <van-nav-bar title="购物车" left-arrow @click-left="$router.back()" />
    <van-loading v-if="loading" class="page-loading" size="28" vertical>加载中...</van-loading>
    <van-empty v-else-if="!items.length" description="购物车是空的" />
    <template v-else>
      <div class="cart-list">
        <van-swipe-cell v-for="item in items" :key="item.id">
          <div class="cart-item">
            <div class="item-img" @click="$router.push(`/products/${item.product?.id}`)">
              <img v-if="item.product?.coverImage" :src="item.product.coverImage" />
              <van-icon v-else name="photo-o" size="28" color="#ccc" />
            </div>
            <div class="item-info">
              <h4>{{ item.product?.name || '商品' }}</h4>
              <span class="item-price">¥{{ item.product?.price || 0 }}</span>
            </div>
            <van-stepper v-model="item.quantity" min="1" @change="(val) => updateQty(item, val)" />
          </div>
          <template #right>
            <van-button square type="danger" text="删除" class="delete-btn" @click="removeItem(item)" />
          </template>
        </van-swipe-cell>
      </div>
      <div class="cart-bottom">
        <div class="total">合计: <b>¥{{ totalPrice }}</b></div>
        <van-button type="primary" round color="linear-gradient(135deg, #667eea, #764ba2)" @click="goCheckout">去结算({{ totalCount }})</van-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { cartApi } from '@/api';

const router = useRouter();
const loading = ref(true);
const items = ref([]);

const totalPrice = computed(() => items.value.reduce((sum, i) => sum + Number(i.product?.price || 0) * i.quantity, 0).toFixed(2));
const totalCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0));

const loadCart = async () => {
  try { const res = await cartApi.list(); items.value = res.data || []; } catch { items.value = []; }
  loading.value = false;
};

const updateQty = async (item, val) => {
  try { await cartApi.update(item.id, { quantity: val }); } catch { /* empty */ }
};

const removeItem = async (item) => {
  try { await cartApi.remove(item.id); items.value = items.value.filter(i => i.id !== item.id); showToast('已删除'); } catch { /* empty */ }
};

const goCheckout = () => router.push('/checkout');

onMounted(() => {
  if (!localStorage.getItem('jym_token')) { router.push('/login'); return; }
  loadCart();
});
</script>

<style scoped>
.cart-page { background: var(--jym-bg); min-height: 100vh; padding-bottom: 80px; }
.page-loading { padding: 80px 0; text-align: center; }
.cart-list { padding: 12px; }
.cart-item { display: flex; align-items: center; gap: 12px; background: #fff; padding: 14px; border-radius: 12px; margin-bottom: 8px; }
.item-img { width: 70px; height: 70px; border-radius: 8px; overflow: hidden; background: #f5f5f5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; min-width: 0; }
.item-info h4 { font-size: 14px; font-weight: 600; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-price { font-size: 15px; font-weight: 700; color: #f5576c; }
.delete-btn { height: 100%; }

.cart-bottom { position: fixed; bottom: 0; left: 0; right: 0; max-width: 750px; margin: 0 auto; background: #fff; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 -2px 10px rgba(0,0,0,0.06); z-index: 100; }
.total { font-size: 14px; color: var(--jym-text-secondary); }
.total b { font-size: 20px; color: #f5576c; }
</style>
