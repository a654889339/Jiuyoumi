<template>
  <div class="product-detail">
    <van-nav-bar title="商品详情" left-arrow @click-left="$router.back()" />
    <van-loading v-if="loading" class="page-loading" size="36" vertical>加载中...</van-loading>
    <template v-else-if="product.id">
      <div class="product-media">
        <van-swipe :autoplay="3000" indicator-color="#667eea" @change="onSwipeChange">
          <van-swipe-item v-for="(m, i) in mediaList" :key="i">
            <div v-if="m.type === 'video'" class="media-item" @click="playVideo(m.url)">
              <img :src="m.cover || m.thumb || ''" class="swipe-img" />
              <div class="play-overlay"><van-icon name="play-circle" size="48" color="#fff" /></div>
            </div>
            <img v-else :src="m.url" class="swipe-img" @click="previewImage(i)" />
          </van-swipe-item>
        </van-swipe>
        <div class="swipe-indicator">{{ currentIndex + 1 }} / {{ mediaList.length }}</div>
      </div>
      <div class="product-main">
        <div class="price-row">
          <span class="price">¥{{ product.price }}</span>
          <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
          <span class="sales">已售{{ product.sales || 0 }}</span>
        </div>
        <h2>{{ product.name }}</h2>
        <p class="desc">{{ product.description }}</p>
        <div class="fav-row">
          <span class="fav-count">{{ product.favCount || 0 }} 人关注</span>
        </div>
      </div>
      <div class="product-detail-content" v-if="product.description">
        <h3>商品详情</h3>
        <p>{{ product.description }}</p>
      </div>
      <div class="bottom-bar">
        <div class="bottom-icons">
          <div class="icon-btn" @click="toggleFav">
            <van-icon :name="product.isFavorited ? 'like' : 'like-o'" size="22" :color="product.isFavorited ? '#f5576c' : ''" />
            <span>{{ product.isFavorited ? '已关注' : '关注' }}</span>
          </div>
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

      <van-popup v-model:show="showVideo" position="center" :style="{ width: '100%', height: '100%', background: '#000' }" @close="videoUrl = ''">
        <div class="video-wrap">
          <van-icon name="cross" class="video-close" size="28" color="#fff" @click="showVideo = false" />
          <video v-if="videoUrl" :src="videoUrl" controls autoplay class="video-player"></video>
        </div>
      </van-popup>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showImagePreview } from 'vant';
import { productApi, cartApi } from '@/api';

const route = useRoute();
const router = useRouter();
const chatWidgetRef = inject('chatWidget', ref(null));
const loading = ref(true);
const product = ref({});
const currentIndex = ref(0);
const showVideo = ref(false);
const videoUrl = ref('');

const VIDEO_EXTS = /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i;
const isVideoUrl = (url) => url && VIDEO_EXTS.test(url);

const mediaList = computed(() => {
  const items = [];
  const mi = product.value.mediaItems || [];
  if (mi.length) {
    mi.forEach(m => {
      const isVid = m.type === 'video' || isVideoUrl(m.url);
      items.push({ url: m.url, thumb: m.thumb || '', cover: m.thumb || '', type: isVid ? 'video' : 'image' });
    });
    return items;
  }
  const vids = product.value.videos || [];
  vids.forEach(v => {
    if (typeof v === 'string') items.push({ url: v, thumb: '', cover: '', type: 'video' });
    else items.push({ url: v.url, thumb: v.cover || '', cover: v.cover || '', type: 'video' });
  });
  const imgs = product.value.images || [];
  imgs.forEach(img => items.push({ url: img, type: 'image' }));
  if (!items.length && product.value.coverImage) {
    items.push({ url: product.value.coverImage, type: 'image' });
  }
  return items;
});

const onSwipeChange = (idx) => { currentIndex.value = idx; };

const playVideo = (url) => {
  videoUrl.value = url;
  showVideo.value = true;
};

const previewImage = (idx) => {
  const images = mediaList.value.filter(m => m.type === 'image').map(m => m.url);
  const imgIdx = mediaList.value.slice(0, idx + 1).filter(m => m.type === 'image').length - 1;
  showImagePreview({ images, startPosition: Math.max(imgIdx, 0), closeable: true });
};

const toggleFav = async () => {
  if (!localStorage.getItem('jym_token')) { router.push('/login'); return; }
  try {
    const res = await productApi.toggleFavorite(product.value.id);
    product.value.isFavorited = res.data.favorited;
    product.value.favCount = (product.value.favCount || 0) + (res.data.favorited ? 1 : -1);
    showToast(res.data.favorited ? '已关注' : '取消关注');
  } catch { showToast('操作失败'); }
};

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
.product-media { background: #fff; position: relative; }
.swipe-img { width: 100%; height: 300px; object-fit: cover; }
.media-item { position: relative; }
.play-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.3); border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }
.swipe-indicator { position: absolute; bottom: 8px; right: 12px; background: rgba(0,0,0,0.5); color: #fff; font-size: 12px; padding: 2px 8px; border-radius: 10px; }
.product-main { background: #fff; padding: 16px; margin-bottom: 8px; }
.price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.price { font-size: 24px; font-weight: 700; color: #f5576c; }
.original-price { font-size: 14px; color: #999; text-decoration: line-through; }
.sales { font-size: 12px; color: #bbb; margin-left: auto; }
.product-main h2 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.desc { font-size: 14px; color: var(--jym-text-secondary); line-height: 1.6; }
.fav-row { margin-top: 8px; font-size: 13px; color: #999; }
.product-detail-content { background: #fff; padding: 16px; margin-bottom: 8px; }
.product-detail-content h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.product-detail-content p { font-size: 14px; color: var(--jym-text-secondary); line-height: 1.8; }

.bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; max-width: 750px; margin: 0 auto; background: #fff; padding: 10px 16px; display: flex; align-items: center; gap: 10px; box-shadow: 0 -2px 10px rgba(0,0,0,0.06); z-index: 100; }
.bottom-bar .van-button { flex: 1; }
.bottom-icons { display: flex; gap: 12px; margin-right: 8px; }
.icon-btn { display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer; font-size: 10px; color: #666; }

.video-wrap { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; }
.video-close { position: absolute; top: 16px; right: 16px; z-index: 10; cursor: pointer; }
.video-player { width: 100%; max-height: 100%; }
</style>
