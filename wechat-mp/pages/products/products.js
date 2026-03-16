const app = getApp();

Page({
  data: {
    keyword: '',
    categories: [],
    activeCategory: 0,
    products: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
  },

  onLoad(options) {
    if (options.keyword) {
      this.setData({ keyword: options.keyword });
    }
    this.loadCategories();
    this.loadProducts(true);
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  async loadCategories() {
    try {
      const res = await app.request({ url: '/products/categories' });
      const cats = [{ id: 0, name: '全部' }, ...(res.data || [])];
      this.setData({ categories: cats });
    } catch (e) {}
  },

  async loadProducts(reset = false) {
    if (this.data.loading) return;
    const page = reset ? 1 : this.data.page;
    this.setData({ loading: true });
    try {
      let url = `/products?page=${page}&pageSize=${this.data.pageSize}`;
      if (this.data.activeCategory) url += `&categoryId=${this.data.activeCategory}`;
      if (this.data.keyword) url += `&keyword=${this.data.keyword}`;
      const res = await app.request({ url });
      const list = res.data.list || res.data || [];
      this.setData({
        products: reset ? list : [...this.data.products, ...list],
        page: page + 1,
        hasMore: list.length >= this.data.pageSize,
        loading: false,
      });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  onPullDownRefresh() {
    this.loadProducts(true).then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore) this.loadProducts();
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
    this.loadProducts(true);
  },

  onClearSearch() {
    this.setData({ keyword: '' });
    this.loadProducts(true);
  },

  switchCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeCategory: id });
    this.loadProducts(true);
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },
});
