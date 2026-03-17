<template>
  <div class="home">
    <div class="hero" :style="heroStyle">
      <van-swipe v-if="banners.length" class="hero-swipe" :autoplay="4000" indicator-color="#fff">
        <van-swipe-item v-for="(b, i) in banners" :key="i">
          <div class="banner-item" :style="{ background: b.color || 'linear-gradient(135deg, #667eea, #764ba2)' }">
            <img v-if="b.imageUrl" :src="b.imageUrl" class="banner-img" alt="">
            <div v-else class="banner-text">
              <h2>{{ b.title }}</h2>
              <p>{{ b.desc }}</p>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>
      <div v-else class="hero-overlay">
        <img v-if="headerLogoUrl" :src="headerLogoUrl" class="hero-logo" alt="Logo" />
        <template v-else>
          <h1 class="hero-title">九尤米</h1>
          <p class="hero-subtitle">精选好物，品质生活</p>
        </template>
      </div>
    </div>

    <div class="section card-section nav-section" :style="navSectionStyle">
      <div class="section-header">
        <h3>快捷导航</h3>
      </div>
      <div class="nav-grid">
        <div v-for="item in navItems" :key="item.path" class="nav-item" @click="$router.push(item.path)">
          <div class="nav-icon" :style="{ background: item.color }">
            <van-icon :name="item.icon" size="24" color="#fff" />
          </div>
          <span>{{ item.title }}</span>
        </div>
      </div>
    </div>

    <div class="section card-section">
      <div class="section-header">
        <h3>热门商品</h3>
        <span class="more" @click="$router.push('/products')">查看全部 ›</span>
      </div>
      <div class="product-scroll">
        <div v-for="p in hotProducts" :key="p.id" class="product-card" @click="$router.push(`/products/${p.id}`)">
          <div class="product-img">
            <img v-if="p.coverImage" :src="p.coverImage" :alt="p.name" />
            <div v-else class="product-img-placeholder"><van-icon name="photo-o" size="36" color="#ccc" /></div>
          </div>
          <div class="product-info">
            <h4>{{ p.name }}</h4>
            <div class="product-price">
              <span class="price">¥{{ p.price }}</span>
              <span v-if="p.originalPrice" class="original-price">¥{{ p.originalPrice }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section card-section">
      <div class="section-header">
        <h3>推荐</h3>
      </div>
      <div class="recommend-grid">
        <div v-for="item in recommends" :key="item.title" class="recommend-card" @click="$router.push(item.path || '/products')">
          <div class="recommend-icon" :style="{ background: item.bg }">
            <van-icon :name="item.icon" size="28" color="#fff" />
          </div>
          <h4>{{ item.title }}</h4>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </div>

    <div class="footer-space"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { productApi, homeConfigApi } from '@/api';

const navItems = ref([
  { title: '全部商品', icon: 'apps-o', path: '/products', color: '#667eea' },
  { title: '新品', icon: 'fire-o', path: '/products', color: '#f5576c' },
  { title: '特惠', icon: 'coupon-o', path: '/products', color: '#fda085' },
  { title: '购物车', icon: 'shopping-cart-o', path: '/cart', color: '#a18cd1' },
]);

const hotProducts = ref([]);
const banners = ref([]);
const headerLogoUrl = ref('');
const homeBgUrl = ref('');
const heroStyle = ref({});
const navOpacity = ref(1);
const navSectionStyle = ref({});

const recommends = ref([
  { title: '新人礼包', desc: '首单立减', icon: 'gift-o', bg: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { title: '品质保障', desc: '正品保证', icon: 'shield-o', bg: 'linear-gradient(135deg, #10B981, #059669)' },
  { title: '极速发货', desc: '闪电配送', icon: 'logistics', bg: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { title: '售后无忧', desc: '7天退换', icon: 'service-o', bg: 'linear-gradient(135deg, #fda085, #f6d365)' },
]);

onMounted(async () => {
  try {
    const res = await productApi.list({ pageSize: 6 });
    hotProducts.value = res.data?.list || [];
  } catch { /* empty */ }
  try {
    const res = await homeConfigApi.list();
    const items = res.data || [];
    const navConfig = items.filter(i => i.section === 'nav' && i.status === 'active');
    if (navConfig.length) {
      navItems.value = navConfig.sort((a, b) => a.sortOrder - b.sortOrder).map(i => ({
        title: i.title, icon: i.icon || 'apps-o', path: i.path || '/products', color: i.color || '#667eea',
      }));
    }
    const bannerList = items.filter(i => i.section === 'banner' && i.status === 'active').sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    banners.value = bannerList;
    const logo = items.find(i => i.section === 'headerLogo' && i.status === 'active');
    headerLogoUrl.value = logo?.imageUrl || '';
    const bg = items.find(i => i.section === 'homeBg' && i.status === 'active');
    homeBgUrl.value = bg?.imageUrl || '';
    if (homeBgUrl.value) heroStyle.value = { backgroundImage: `url(${homeBgUrl.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    else heroStyle.value = {};
    const opacityItem = items.find(i => i.section === 'navOpacity' && i.status === 'active');
    const opacityVal = opacityItem?.desc != null ? parseFloat(opacityItem.desc) : 1;
    navOpacity.value = Number.isNaN(opacityVal) || opacityVal <= 0 ? 1 : Math.min(1, opacityVal);
    navSectionStyle.value = { opacity: navOpacity.value };
  } catch { /* empty */ }
});
</script>

<style scoped>
.home {
  padding-bottom: 100px;
  background: var(--jym-bg);
  min-height: 100vh;
}

.hero {
  height: 440px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-swipe { width: 100%; height: 100%; }
.hero-swipe :deep(.van-swipe-item) { height: 440px; }
.banner-item { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; }
.banner-img { width: 100%; height: 100%; object-fit: cover; }
.banner-text { text-align: center; color: #fff; padding: 20px; }
.banner-text h2 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
.banner-text p { font-size: 14px; opacity: 0.9; }

.hero-overlay { text-align: center; color: #fff; }
.hero-logo { max-height: 48px; width: auto; object-fit: contain; filter: brightness(0) invert(1); }
.hero-title { font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #fff; }
.hero-subtitle { font-size: 15px; margin-top: 8px; opacity: 0.8; }

.card-section {
  margin: 12px;
  border-radius: 16px;
  background: #fff;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  animation: fadeInUp 0.4s var(--jym-transition) both;
}

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 20px; font-weight: 700; }
.more { font-size: 14px; color: var(--jym-primary); cursor: pointer; }

.nav-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.2s; }
.nav-item:active { transform: scale(0.92); }
.nav-icon { width: 50px; height: 50px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
.nav-item span { font-size: 12px; color: var(--jym-text-secondary); }

.product-scroll { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; padding-bottom: 4px; }
.product-scroll::-webkit-scrollbar { display: none; }
.product-card { min-width: 140px; flex-shrink: 0; border-radius: 12px; overflow: hidden; background: #f8f8f8; cursor: pointer; transition: transform 0.25s; }
.product-card:active { transform: scale(0.96); }
.product-img { height: 140px; background: #eee; overflow: hidden; }
.product-img img { width: 100%; height: 100%; object-fit: cover; }
.product-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.product-info { padding: 10px 12px; }
.product-info h4 { font-size: 14px; font-weight: 600; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-price { display: flex; align-items: baseline; gap: 6px; }
.price { font-size: 16px; font-weight: 700; color: #f5576c; }
.original-price { font-size: 12px; color: #999; text-decoration: line-through; }

.recommend-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.recommend-card { background: #f5f5f5; border-radius: 12px; padding: 20px 16px; text-align: center; cursor: pointer; transition: transform 0.25s; }
.recommend-card:active { transform: scale(0.97); }
.recommend-icon { width: 50px; height: 50px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.recommend-card h4 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.recommend-card p { font-size: 13px; color: var(--jym-text-secondary); }

.footer-space { height: 80px; }
</style>
