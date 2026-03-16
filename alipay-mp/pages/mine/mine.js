const app = getApp();

Page({
  data: {
    userInfo: null,
    isLogin: false,
    stats: { pending: 0, shipped: 0, review: 0, aftersale: 0 },
  },

  onLoad() {},

  onShow() {
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
    my.navigateTo({ url: '/pages/login/login' });
  },

  goOrders(e) {
    my.switchTab({ url: '/pages/orders/orders' });
  },

  goCart() {
    my.navigateTo({ url: '/pages/cart/cart' });
  },

  goAddress() {
    my.navigateTo({ url: '/pages/address/address' });
  },

  goEditProfile() {
    my.navigateTo({ url: '/pages/profile-edit/profile-edit' });
  },

  logout() {
    my.confirm({
      title: '提示',
      content: '确定要退出登录吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          this.setData({ isLogin: false, userInfo: null });
          my.showToast({ content: '已退出' });
        }
      },
    });
  },
});
