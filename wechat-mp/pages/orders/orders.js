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
    loadingMore: false,
    finished: false,
    page: 1,
  },

  onLoad() {
    this.loadOrders(1);
  },

  onShow() {
    var tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) tabBar.setData({ selected: 2 });
    this.loadOrders(1);
  },

  async loadOrders(page) {
    if (!app.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    var isFirst = (page === 1);
    if (isFirst) this.setData({ loading: true, orders: [], finished: false });
    else this.setData({ loadingMore: true });

    try {
      var url = '/orders/mine?page=' + page + '&pageSize=10';
      if (this.data.activeTab) url += '&status=' + this.data.activeTab;
      var res = await app.request({ url: url });
      var data = res.data || {};
      var list = data.list || [];
      var total = data.total || 0;
      var newOrders = isFirst ? list : this.data.orders.concat(list);
      this.setData({
        orders: newOrders,
        page: data.page || page,
        finished: newOrders.length >= total,
        loading: false,
        loadingMore: false,
      });
    } catch (e) {
      this.setData({ loading: false, loadingMore: false });
    }
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key, page: 1 });
    this.loadOrders(1);
  },

  goDetail(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + id });
  },

  async cancelOrder(e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    var confirm = await new Promise(function(resolve) {
      wx.showModal({
        title: '确认取消',
        content: '确定要取消这个订单吗？',
        success: function(res) { resolve(res.confirm); },
      });
    });
    if (!confirm) return;
    try {
      await app.request({ url: '/orders/' + id + '/cancel', method: 'PUT' });
      wx.showToast({ title: '已取消', icon: 'success' });
      that.loadOrders(1);
    } catch (e) {
      wx.showToast({ title: (e && e.message) || '操作失败', icon: 'none' });
    }
  },

  viewTracking(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + id + '&showTracking=1' });
  },

  onReachBottom() {
    if (!this.data.finished && !this.data.loadingMore && !this.data.loading) {
      this.loadOrders(this.data.page + 1);
    }
  },

  onPullDownRefresh() {
    this.loadOrders(1).then(function() { wx.stopPullDownRefresh(); });
  },
});
