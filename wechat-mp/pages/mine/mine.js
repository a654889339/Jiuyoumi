const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    stats: { pending: 0, shipped: 0, review: 0, aftersale: 0 },
  },

  onLoad() {},

  onShow() {
    var tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null;
    if (tabBar) tabBar.setData({ selected: 3 });
    this.checkLogin();
  },

  checkLogin() {
    if (app.globalData.token) {
      this.setData({ isLogin: true });
      this.loadProfile();
    } else {
      this.setData({ isLogin: false, userInfo: null });
    }
  },

  async loadProfile() {
    try {
      const res = await app.request({ url: '/auth/profile' });
      const userInfo = res.data;
      app.globalData.userInfo = userInfo;
      this.setData({ userInfo });
    } catch (e) {}
  },

  maskPhone(phone) {
    if (!phone || phone.length < 7) return phone || '';
    return phone.substring(0, 3) + '****' + phone.substring(7);
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  goOrders(e) {
    const status = e.currentTarget.dataset.status || '';
    wx.switchTab({ url: '/pages/orders/orders' });
  },

  goCart() {
    wx.navigateTo({ url: '/pages/cart/cart' });
  },

  goAddress() {
    wx.navigateTo({ url: '/pages/address/address' });
  },

  goChat() {
    wx.navigateTo({ url: '/pages/chat/chat' });
  },

  goEditProfile() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          this.setData({ isLogin: false, userInfo: null });
          wx.showToast({ title: '已退出', icon: 'success' });
        }
      },
    });
  },
});
