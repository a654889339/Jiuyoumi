const app = getApp();

Page({
  data: {
    id: '',
    order: null,
    tracking: null,
    loading: true,
    statusMap: { pending: '待支付', paid: '已支付', shipped: '已发货', completed: '已完成', cancelled: '已取消' },
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
      my.showToast({ content: '加载失败', type: 'none' });
      this.setData({ loading: false });
    }
  },

  async loadTracking() {
    try {
      const res = await app.request({ url: `/orders/${this.data.id}/tracking` });
      this.setData({ tracking: res.data });
    } catch (e) {}
  },

  cancelOrder() {
    my.confirm({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ url: `/orders/${this.data.id}/cancel`, method: 'PUT' });
            my.showToast({ content: '已取消' });
            this.loadOrder();
          } catch (e) {
            my.showToast({ content: e.message || '操作失败', type: 'none' });
          }
        }
      },
    });
  },

  copyOrderNo() {
    const no = this.data.order.orderNo || this.data.order.id;
    my.setClipboard({ text: String(no) });
  },

  formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },
});
