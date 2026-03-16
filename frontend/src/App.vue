<template>
  <router-view />
  <van-tabbar v-if="showTabbar" route active-color="var(--jym-primary)">
    <van-tabbar-item v-for="(item, i) in tabbarItems" :key="item.path || i" :to="item.path" :icon="item.icon">{{ item.title }}</van-tabbar-item>
  </van-tabbar>
  <ChatWidget ref="chatWidgetRef" :hide-fab="hideChatFab" />
</template>

<script setup>
import { ref, computed, onMounted, provide } from 'vue';
import { useRoute } from 'vue-router';
import ChatWidget from '@/components/ChatWidget.vue';
import { homeConfigApi } from '@/api';

const route = useRoute();

const DEFAULT_TABBAR = [
  { title: '首页', icon: 'wap-home-o', path: '/' },
  { title: '商品', icon: 'shopping-cart-o', path: '/products' },
  { title: '订单', icon: 'bill-o', path: '/orders' },
  { title: '我的', icon: 'contact-o', path: '/mine' },
];

const tabbarItems = ref([...DEFAULT_TABBAR]);

async function loadTabbarConfig() {
  try {
    const res = await homeConfigApi.tabbar();
    const list = (res.data || []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    if (list.length) {
      tabbarItems.value = list.map((i) => ({
        title: i.title || '',
        icon: (i.icon && i.icon.trim()) || 'wap-home-o',
        path: (i.path && i.path.trim()) || '/',
      }));
    }
  } catch {
    tabbarItems.value = [...DEFAULT_TABBAR];
  }
}

onMounted(loadTabbarConfig);

const hiddenTabRoutes = ['/login', '/register', '/address', '/cart', '/checkout', '/orders/', '/products/', '/mine/'];
const showTabbar = computed(() => {
  return !hiddenTabRoutes.some((r) => {
    if (r.endsWith('/')) return route.path.startsWith(r) && route.path !== r.slice(0, -1);
    return route.path.startsWith(r);
  });
});

const hideChatFab = computed(() => {
  const p = route.path;
  if (p === '/' || p === '/products' || p === '/mine') return true;
  if (p.startsWith('/login') || p.startsWith('/register')) return true;
  return false;
});

const chatWidgetRef = ref(null);
provide('chatWidget', chatWidgetRef);
</script>

<style scoped>
:deep(.van-tabbar) {
  max-width: 750px;
  margin: 0 auto;
  z-index: 100;
}
:deep(.van-tabbar-item) {
  touch-action: manipulation;
  cursor: pointer;
}
</style>
