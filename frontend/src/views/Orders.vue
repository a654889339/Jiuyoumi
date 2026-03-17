<template>
  <div class="orders-page">
    <van-tabs v-model:active="activeTab" sticky color="var(--jym-primary)" @change="onTabChange">
      <van-tab v-for="tab in tabs" :key="tab.key" :title="tab.name">
        <van-pull-refresh v-model="refreshing" @refresh="refreshOrders">
          <van-loading v-if="loading && !orders.length" class="page-loading" size="28" vertical>加载中...</van-loading>
          <van-empty v-else-if="!orders.length && !loading" description="暂无订单" />
          <div v-else class="order-list">
            <div v-for="order in orders" :key="order.id" class="order-card" @click="$router.push(`/orders/${order.id}`)">
              <div class="order-header">
                <span class="order-no">{{ order.orderNo }}</span>
                <van-tag :type="order.statusType" size="medium">{{ order.statusText }}</van-tag>
              </div>
              <div class="order-items">
                <div v-for="item in (order.items || []).slice(0, 2)" :key="item.id" class="order-item">
                  <div class="item-img">
                    <img v-if="item.productImage" :src="item.productImage" />
                    <van-icon v-else name="photo-o" size="28" color="#ccc" />
                  </div>
                  <div class="item-info">
                    <h4>{{ item.productName }}</h4>
                    <span class="item-qty">x{{ item.quantity }}</span>
                  </div>
                  <span class="item-price">¥{{ item.price }}</span>
                </div>
              </div>
              <div class="order-footer">
                <span class="order-total">共{{ orderItemCount(order) }}件 合计: <b>¥{{ order.totalPrice }}</b></span>
                <div class="order-actions">
                  <van-button v-if="order.trackingNo" size="small" plain type="primary" @click.stop="$router.push(`/orders/${order.id}`)">查看物流</van-button>
                  <van-button v-if="order.status === 'pending'" size="small" plain @click.stop="cancelOrder(order)">取消订单</van-button>
                </div>
              </div>
            </div>
            <van-loading v-if="loadingMore" class="loading-more" size="20">加载更多...</van-loading>
            <div v-if="finished && orders.length" class="no-more">没有更多订单了</div>
          </div>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
    <div style="height: 60px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { orderApi } from '@/api';
import { showToast, showConfirmDialog } from 'vant';

const router = useRouter();
const activeTab = ref(0);
const loading = ref(true);
const loadingMore = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const orders = ref([]);
const currentPage = ref(1);

const tabs = [
  { key: 'all', name: '全部' },
  { key: 'pending', name: '待支付' },
  { key: 'shipped', name: '已发货' },
  { key: 'completed', name: '已完成' },
];

const orderItemCount = (order) => (order.items || []).reduce((sum, i) => sum + i.quantity, 0);

const loadOrders = async (page = 1) => {
  const token = localStorage.getItem('jym_token');
  if (!token) { loading.value = false; refreshing.value = false; orders.value = []; return; }
  try {
    const status = tabs[activeTab.value].key;
    const res = await orderApi.mine({ status, page, pageSize: 10 });
    const data = res.data || {};
    const list = data.list || data || [];
    if (page === 1) {
      orders.value = list;
    } else {
      orders.value = [...orders.value, ...list];
    }
    currentPage.value = data.page || page;
    const total = data.total || 0;
    finished.value = orders.value.length >= total;
  } catch (err) {
    if (String(err).includes('401') || String(err).includes('请先登录')) {
      showToast('请先登录');
      router.push('/login');
    }
  } finally {
    loading.value = false;
    loadingMore.value = false;
    refreshing.value = false;
  }
};

const refreshOrders = () => {
  currentPage.value = 1;
  finished.value = false;
  loadOrders(1);
};

const loadMore = () => {
  if (finished.value || loadingMore.value || loading.value) return;
  loadingMore.value = true;
  loadOrders(currentPage.value + 1);
};

const onTabChange = () => {
  loading.value = true;
  orders.value = [];
  currentPage.value = 1;
  finished.value = false;
  loadOrders(1);
};

const cancelOrder = async (order) => {
  try {
    await showConfirmDialog({ title: '取消订单', message: '确定要取消该订单吗？' });
    await orderApi.cancel(order.id);
    showToast('订单已取消');
    refreshOrders();
  } catch { /* user cancelled */ }
};

const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  const scrollHeight = document.documentElement.scrollHeight;
  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadMore();
  }
};

onMounted(() => {
  loadOrders(1);
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.orders-page { background: var(--jym-bg); min-height: 100vh; }
.page-loading { padding: 40px 0; text-align: center; }
.order-list { padding: 12px 16px; }
.order-card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 10px; cursor: pointer; }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.order-no { font-size: 12px; color: var(--jym-text-secondary); }
.order-items { border-top: 1px solid #f5f5f5; padding-top: 10px; }
.order-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
.item-img { width: 50px; height: 50px; border-radius: 8px; overflow: hidden; background: #f5f5f5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; min-width: 0; }
.item-info h4 { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-qty { font-size: 12px; color: #999; }
.item-price { font-size: 14px; font-weight: 600; color: var(--jym-dark); flex-shrink: 0; }
.order-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #f5f5f5; }
.order-total { font-size: 13px; color: var(--jym-text-secondary); }
.order-total b { color: #f5576c; font-size: 16px; }
.order-actions { display: flex; gap: 8px; }
.loading-more { text-align: center; padding: 16px 0; }
.no-more { text-align: center; padding: 16px 0; font-size: 13px; color: #999; }
</style>
