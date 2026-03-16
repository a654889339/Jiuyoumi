const app = getApp();

Page({
  data: {
    hotProducts: [],
    loading: true,
  },

  onLoad() {
    this.loadHotProducts();
  },

  onShow() {},

  async loadHotProducts() {
    try {
      const res = await app.request({ url: '/products?page=1&pageSize=6' });
      this.setData({ hotProducts: res.data.list || res.data || [], loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  onPullDownRefresh() {
    this.loadHotProducts().then(() => my.stopPullDownRefresh());
  },

  goProducts() {
    my.switchTab({ url: '/pages/products/products' });
  },

  goNew() {
    my.navigateTo({ url: '/pages/products/products?keyword=新品' });
  },

  goSale() {
    my.navigateTo({ url: '/pages/products/products?keyword=特惠' });
  },

  goCart() {
    my.navigateTo({ url: '/pages/cart/cart' });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    my.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },
});
