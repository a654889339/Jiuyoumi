const app = getApp();

Page({
  data: {
    hotProducts: [],
    navItems: [
      { title: '全部商品', icon: '🛍', path: 'products', color: 'rgba(102,126,234,0.1)', imageUrl: '' },
      { title: '新品', icon: '🆕', path: 'new', color: 'rgba(245,87,108,0.1)', imageUrl: '' },
      { title: '特惠', icon: '🏷', path: 'sale', color: 'rgba(255,159,67,0.1)', imageUrl: '' },
      { title: '购物车', icon: '🛒', path: 'cart', color: 'rgba(118,75,162,0.1)', imageUrl: '' },
    ],
    banners: [],
    loading: true,
  },

  onLoad() {
    this.loadHomeConfig();
    this.loadHotProducts();
  },

  onShow() {
    var tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) tabBar.setData({ selected: 0 });
  },

  async loadHomeConfig() {
    try {
      var res = await app.request({ url: '/home-config' });
      var items = res.data || [];
      var navConfig = items.filter(function(i) { return i.section === 'nav' && i.status === 'active'; });
      if (navConfig.length) {
        navConfig.sort(function(a, b) { return a.sortOrder - b.sortOrder; });
        var pathMap = { '/products': 'products', '/cart': 'cart' };
        this.setData({
          navItems: navConfig.map(function(i) {
            var p = i.path || '/products';
            return {
              title: i.title,
              icon: i.icon || '🛍',
              path: p.indexOf('cat=new') >= 0 ? 'new' : p.indexOf('cat=sale') >= 0 ? 'sale' : p === '/cart' ? 'cart' : 'products',
              color: i.color || '#667eea',
              imageUrl: i.imageUrl || '',
            };
          }),
        });
      }
      var bannerList = items.filter(function(i) { return i.section === 'banner' && i.status === 'active'; });
      bannerList.sort(function(a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
      if (bannerList.length) this.setData({ banners: bannerList });
    } catch (e) {}
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

  onNavTap(e) {
    var path = e.currentTarget.dataset.path;
    if (path === 'cart') {
      wx.navigateTo({ url: '/pages/cart/cart' });
    } else if (path === 'new') {
      wx.navigateTo({ url: '/pages/products/products?keyword=新品' });
    } else if (path === 'sale') {
      wx.navigateTo({ url: '/pages/products/products?keyword=特惠' });
    } else {
      wx.switchTab({ url: '/pages/products/products' });
    }
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },

  goProducts() {
    wx.switchTab({ url: '/pages/products/products' });
  },
});
