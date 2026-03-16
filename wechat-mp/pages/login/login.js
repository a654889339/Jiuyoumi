const app = getApp();

Page({
  data: {
    username: '',
    password: '',
    logging: false,
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  async login() {
    const { username, password } = this.data;
    if (!username.trim()) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    this.setData({ logging: true });
    try {
      const res = await app.request({
        url: '/auth/login',
        method: 'POST',
        data: { username: username.trim(), password },
      });
      const { token, user } = res.data;
      app.setAuth(token, user);
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack().catch(() => {
          wx.switchTab({ url: '/pages/index/index' });
        });
      }, 1000);
    } catch (e) {
      wx.showToast({ title: e.message || '登录失败', icon: 'none' });
    } finally {
      this.setData({ logging: false });
    }
  },

  async wxLogin() {
    this.setData({ logging: true });
    try {
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject,
        });
      });
      const res = await app.request({
        url: '/auth/wx-login',
        method: 'POST',
        data: { code: loginRes.code },
      });
      const { token, user } = res.data;
      app.setAuth(token, user);
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack().catch(() => {
          wx.switchTab({ url: '/pages/index/index' });
        });
      }, 1000);
    } catch (e) {
      wx.showToast({ title: e.message || '微信登录失败', icon: 'none' });
    } finally {
      this.setData({ logging: false });
    }
  },

  goRegister() {
    wx.showModal({
      title: '注册',
      content: '请联系客服或使用微信登录',
      showCancel: false,
    });
  },
});
