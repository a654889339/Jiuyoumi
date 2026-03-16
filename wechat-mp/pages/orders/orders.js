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
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    var tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) tabBar.setData({ selected: 2 });
    this.loadOrders();
  },

  async loadOrders() {
    if (!app.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
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
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` });
  },

  async cancelOrder(e) {
    const id = e.currentTarget.dataset.id;
    const confirm = await new Promise((resolve) => {
      wx.showModal({
        title: '确认取消',
        content: '确定要取消这个订单吗？',
        success: (res) => resolve(res.confirm),
      });
    });
    if (!confirm) return;
    try {
      await app.request({ url: `/orders/${id}/cancel`, method: 'PUT' });
      wx.showToast({ title: '已取消', icon: 'success' });
      this.loadOrders();
    } catch (e) {
      wx.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
  },

  viewTracking(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}&showTracking=1` });
  },

  getStatusText(status) {
    const map = { pending: '待支付', paid: '已支付', shipped: '已发货', completed: '已完成', cancelled: '已取消' };
    return map[status] || status;
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => wx.stopPullDownRefresh());
  },
});
