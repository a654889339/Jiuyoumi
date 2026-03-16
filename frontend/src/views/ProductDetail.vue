<template>
  <div class="product-detail">
    <van-nav-bar title="商品详情" left-arrow @click-left="$router.back()" />
    <van-loading v-if="loading" class="page-loading" size="36" vertical>加载中...</van-loading>
    <template v-else-if="product.id">
      <div class="product-images">
        <van-swipe :autoplay="3000" indicator-color="#667eea">
          <van-swipe-item v-for="(img, i) in displayImages" :key="i">
            <img :src="img" class="swipe-img" />
          </van-swipe-item>
        </van-swipe>
      </div>
      <div class="product-main">
        <div class="price-row">
          <span class="price">¥{{ product.price }}</span>
          <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
          <span class="sales">已售{{ product.sales || 0 }}</span>
        </div>
        <h2>{{ product.name }}</h2>
        <p class="desc">{{ product.description }}</p>
      </div>
      <div class="product-detail-content" v-if="product.description">
        <h3>商品详情</h3>
        <p>{{ product.description }}</p>
      </div>
      <div class="bottom-bar">
        <div class="bottom-icons">
          <div class="icon-btn" @click="$router.push('/cart')">
            <van-icon name="shopping-cart-o" size="22" />
            <span>购物车</span>
          </div>
          <div class="icon-btn" @click="onConsult">
            <van-icon name="chat-o" size="22" />
            <span>咨询</span>
          </div>
        </div>
        <van-button type="warning" round size="normal" @click="addToCart">加入购物车</van-button>
        <van-button type="danger" round size="normal" color="linear-gradient(135deg, #667eea, #764ba2)" @click="buyNow">立即购买</van-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { productApi, cartApi } from '@/api';

const route = useRoute();
const router = useRouter();
const chatWidgetRef = inject('chatWidget', ref(null));
const loading = ref(true);
const product = ref({});

const displayImages = computed(() => {
  const imgs = product.value.images || [];
  if (imgs.length) return imgs;
  if (product.value.coverImage) return [product.value.coverImage];
  return [];
});

const addToCart = async () => {
  if (!localStorage.getItem('jym_token')) { router.push('/login'); return; }
  try {
    await cartApi.add({ productId: product.value.id });
    showToast('已加入购物车');
  } catch (err) { showToast(err.message || '添加失败'); }
};

const buyNow = () => {
  if (!localStorage.getItem('jym_token')) { router.push('/login'); return; }
  router.push({ path: '/checkout', query: { productId: product.value.id, qty: 1 } });
};

const onConsult = () => {
  const p = product.value;
  const msg = p.id ? `我想咨询【${p.name || '该商品'}】${p.price != null ? '（¥' + p.price + '）' : ''}${p.description ? '：' + p.description : ''}` : '';
  if (chatWidgetRef?.value) chatWidgetRef.value.openWithAutoMessage(msg);
  else router.push('/mine');
};

onMounted(async () => {
  try {
    const res = await productApi.detail(route.params.id);
    product.value = res.data || {};
  } catch { /* empty */ }
  loading.value = false;
});
</script>

<style scoped>
.product-detail { background: var(--jym-bg); min-height: 100vh; padding-bottom: 80px; }
.page-loading { padding: 80px 0; text-align: center; }
.product-images { background: #fff; }
.swipe-img { width: 100%; height: 300px; object-fit: cover; }
.product-main { background: #fff; padding: 16px; margin-bottom: 8px; }
.price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.price { font-size: 24px; font-weight: 700; color: #f5576c; }
.original-price { font-size: 14px; color: #999; text-decoration: line-through; }
.sales { font-size: 12px; color: #bbb; margin-left: auto; }
.product-main h2 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.desc { font-size: 14px; color: var(--jym-text-secondary); line-height: 1.6; }
.product-detail-content { background: #fff; padding: 16px; margin-bottom: 8px; }
.product-detail-content h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.product-detail-content p { font-size: 14px; color: var(--jym-text-secondary); line-height: 1.8; }

.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; max-width: 750px; margin: 0 auto; background: #fff; padding: 10px 16px; display: flex; align-items: center; gap: 10px; box-shadow: 0 -2px 10px rgba(0,0,0,0.06); z-index: 100; }
.bottom-bar .van-button { flex: 1; }
.bottom-icons { display: flex; gap: 12px; margin-right: 8px; }
.icon-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; font-size: 10px; color: #666; }
</style>
