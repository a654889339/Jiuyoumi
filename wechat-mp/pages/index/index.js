const app = getApp();

Page({
  data: {
    hotProducts: [],
    loading: true,
  },

  onLoad() {
    this.loadHotProducts();
  },

  onShow() {
    var tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) tabBar.setData({ selected: 0 });
  },

  async loadHotProducts() {
    try {
      const res = await app.request({ url: '/products?page=1&pageSize=6' });
      this.setData({ hotProducts: res.data.list || res.data || [], loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  onPullDownRefresh() {
    this.loadHotProducts().then(() => wx.stopPullDownRefresh());
  },

  goProducts() {
    wx.switchTab({ url: '/pages/products/products' });
  },

  goNew() {
    wx.navigateTo({ url: '/pages/products/products?keyword=新品' });
  },

  goSale() {
    wx.navigateTo({ url: '/pages/products/products?keyword=特惠' });
  },

  goCart() {
    wx.navigateTo({ url: '/pages/cart/cart' });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },
});
