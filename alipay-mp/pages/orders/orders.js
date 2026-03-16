const app = getApp();

Page({
  data: {
    tabs: [
      { key: '', label: '全部' },
      { key: 'pending', label: '待支付' },
      { key: 'shipped', label: '已发货' },
      { key: 'completed', label: '已完成' },
    ],
    activeTab: '',
    orders: [],
    loading: true,
    statusMap: { pending: '待支付', paid: '已支付', shipped: '已发货', completed: '已完成', cancelled: '已取消' },
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  async loadOrders() {
    if (!app.globalData.token) {
      my.navigateTo({ url: '/pages/login/login' });
      return;
    }
    this.setData({ loading: true });
    try {
      let url = '/orders/mine';
      if (this.data.activeTab) url += `?status=${this.data.activeTab}`;
      const res = await app.request({ url });
      this.setData({ orders: res.data || [], loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key });
    this.loadOrders();
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    my.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` });
  },

  async cancelOrder(e) {
    const id = e.currentTarget.dataset.id;
    my.confirm({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ url: `/orders/${id}/cancel`, method: 'PUT' });
            my.showToast({ content: '已取消' });
            this.loadOrders();
          } catch (e) {
            my.showToast({ content: e.message || '操作失败', type: 'none' });
          }
        }
      },
    });
  },

  viewTracking(e) {
    const id = e.currentTarget.dataset.id;
    my.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}&showTracking=1` });
  },

  getStatusText(status) {
    return this.data.statusMap[status] || status;
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => my.stopPullDownRefresh());
  },
});
