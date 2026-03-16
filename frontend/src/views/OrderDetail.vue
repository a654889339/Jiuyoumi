<template>
  <div class="order-detail">
    <van-nav-bar title="订单详情" left-arrow @click-left="$router.back()" />
    <van-loading v-if="loading" class="page-loading" size="36" vertical>加载中...</van-loading>
    <template v-else-if="order.id">
      <div class="status-bar" :style="{ background: statusBg }">
        <van-icon :name="statusIcon" size="28" color="#fff" />
        <div>
          <h3>{{ order.statusText }}</h3>
          <p v-if="order.trackingNo">物流单号: {{ order.trackingNo }}</p>
        </div>
      </div>

      <div v-if="order.trackingNo" class="tracking-section">
        <div class="section-title">
          <van-icon name="logistics" size="18" /> 物流信息
        </div>
        <van-loading v-if="trackingLoading" size="20">查询中...</van-loading>
        <template v-else-if="trackingData && trackingData.data && trackingData.data.length">
          <van-steps direction="vertical" :active="0" active-color="#667eea">
            <van-step v-for="(item, i) in trackingData.data" :key="i">
              <h4>{{ item.context }}</h4>
              <p>{{ item.ftime || item.time }}</p>
            </van-step>
          </van-steps>
        </template>
        <van-empty v-else description="暂无物流信息" :image-size="60" />
      </div>

      <div class="address-section" v-if="order.contactName">
        <van-icon name="location-o" size="18" color="#667eea" />
        <div>
          <p class="contact">{{ order.contactName }} {{ order.contactPhone }}</p>
          <p class="addr">{{ order.address }}</p>
        </div>
      </div>

      <div class="items-section">
        <div v-for="item in (order.items || [])" :key="item.id" class="order-item">
          <div class="item-img">
            <img v-if="item.productImage" :src="item.productImage" />
            <van-icon v-else name="photo-o" size="28" color="#ccc" />
          </div>
          <div class="item-info">
            <h4>{{ item.productName }}</h4>
            <span>x{{ item.quantity }}</span>
          </div>
          <span class="item-price">¥{{ item.price }}</span>
        </div>
      </div>

      <div class="info-section">
        <van-cell title="订单编号" :value="order.orderNo" />
        <van-cell title="下单时间" :value="formatTime(order.createdAt)" />
        <van-cell title="订单金额" :value="`¥${order.totalPrice}`" />
        <van-cell v-if="order.remark" title="备注" :value="order.remark" />
      </div>

      <div class="action-area" v-if="order.status === 'pending'">
        <van-button block plain type="default" @click="cancelOrder">取消订单</van-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { orderApi } from '@/api';
import { showToast, showConfirmDialog } from 'vant';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const order = ref({});
const trackingLoading = ref(false);
const trackingData = ref(null);

const statusBg = computed(() => {
  const m = { pending: '#fda085', paid: '#667eea', shipped: '#667eea', delivered: '#10B981', completed: '#10B981', cancelled: '#999' };
  return m[order.value.status] || '#667eea';
});
const statusIcon = computed(() => {
  const m = { pending: 'clock-o', paid: 'gold-coin-o', shipped: 'logistics', delivered: 'certificate', completed: 'passed', cancelled: 'cross' };
  return m[order.value.status] || 'info-o';
});

const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '';

const loadTracking = async () => {
  if (!order.value.trackingNo) return;
  trackingLoading.value = true;
  try {
    const res = await orderApi.tracking(order.value.id);
    trackingData.value = res.data?.info || null;
  } catch { /* empty */ }
  trackingLoading.value = false;
};

const cancelOrder = async () => {
  try {
    await showConfirmDialog({ title: '取消订单', message: '确定要取消该订单吗？' });
    await orderApi.cancel(order.value.id);
    showToast('订单已取消');
    router.back();
  } catch { /* user cancelled */ }
};

onMounted(async () => {
  try {
    const res = await orderApi.detail(route.params.id);
    order.value = res.data || {};
    await loadTracking();
  } catch { /* empty */ }
  loading.value = false;
});
</script>

<style scoped>
.order-detail { background: var(--jym-bg); min-height: 100vh; }
.page-loading { padding: 80px 0; text-align: center; }
.status-bar { display: flex; align-items: center; gap: 14px; padding: 24px 20px; color: #fff; }
.status-bar h3 { font-size: 18px; font-weight: 700; color: #fff; }
.status-bar p { font-size: 13px; opacity: 0.9; margin-top: 4px; }

.tracking-section { background: #fff; margin: 8px 12px; border-radius: 12px; padding: 16px; }
.section-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.tracking-section :deep(.van-step) h4 { font-size: 13px; font-weight: 500; }
.tracking-section :deep(.van-step) p { font-size: 12px; color: #999; margin-top: 2px; }

.address-section { background: #fff; margin: 8px 12px; border-radius: 12px; padding: 16px; display: flex; gap: 12px; }
.contact { font-size: 15px; font-weight: 600; }
.addr { font-size: 13px; color: var(--jym-text-secondary); margin-top: 4px; }

.items-section { background: #fff; margin: 8px 12px; border-radius: 12px; padding: 14px; }
.order-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
.order-item + .order-item { border-top: 1px solid #f5f5f5; }
.item-img { width: 60px; height: 60px; border-radius: 8px; overflow: hidden; background: #f5f5f5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-info { flex: 1; }
.item-info h4 { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.item-info span { font-size: 12px; color: #999; }
.item-price { font-size: 15px; font-weight: 600; flex-shrink: 0; }

.info-section { background: #fff; margin: 8px 12px; border-radius: 12px; overflow: hidden; }
.action-area { padding: 20px; }
</style>
