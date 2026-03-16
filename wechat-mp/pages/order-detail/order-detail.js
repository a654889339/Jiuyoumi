const app = getApp();

Page({
  data: {
    id: '',
    order: null,
    tracking: null,
    loading: true,
  },

  onLoad(options) {
    this.setData({ id: options.id });
    this.loadOrder();
    if (options.showTracking) {
      this.loadTracking();
    }
  },

  async loadOrder() {
    try {
      const res = await app.request({ url: `/orders/${this.data.id}` });
      const order = res.data;
      this.setData({ order, loading: false });
      if (order.trackingNo) {
        this.loadTracking();
      }
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  async loadTracking() {
    try {
      const res = await app.request({ url: `/orders/${this.data.id}/tracking` });
      this.setData({ tracking: res.data });
    } catch (e) {}
  },

  async cancelOrder() {
    const confirm = await new Promise((resolve) => {
      wx.showModal({
        title: '确认取消',
        content: '确定要取消这个订单吗？',
        success: (res) => resolve(res.confirm),
      });
    });
    if (!confirm) return;
    try {
      await app.request({ url: `/orders/${this.data.id}/cancel`, method: 'PUT' });
      wx.showToast({ title: '已取消', icon: 'success' });
      this.loadOrder();
    } catch (e) {
      wx.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
  },

  copyOrderNo() {
    const no = this.data.order.orderNo || this.data.order.id;
    wx.setClipboardData({ data: String(no) });
  },

  getStatusText(status) {
    const map = { pending: '待支付', paid: '已支付', shipped: '已发货', completed: '已完成', cancelled: '已取消' };
    return map[status] || status;
  },
});
