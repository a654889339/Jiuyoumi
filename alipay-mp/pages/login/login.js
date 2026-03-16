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
      my.showToast({ content: '请输入用户名', type: 'none' });
      return;
    }
    if (!password) {
      my.showToast({ content: '请输入密码', type: 'none' });
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
      my.showToast({ content: '登录成功' });
      setTimeout(() => {
        my.navigateBack({ delta: 1, fail: () => {
          my.switchTab({ url: '/pages/index/index' });
        }});
      }, 1000);
    } catch (e) {
      my.showToast({ content: e.message || '登录失败', type: 'none' });
    } finally {
      this.setData({ logging: false });
    }
  },

  async alipayLogin() {
    this.setData({ logging: true });
    try {
      const authRes = await new Promise((resolve, reject) => {
        my.getAuthCode({
          scopes: 'auth_user',
          success: resolve,
          fail: reject,
        });
      });
      const res = await app.request({
        url: '/auth/alipay-login',
        method: 'POST',
        data: { code: authRes.authCode },
      });
      const { token, user } = res.data;
      app.setAuth(token, user);
      my.showToast({ content: '登录成功' });
      setTimeout(() => {
        my.navigateBack({ delta: 1, fail: () => {
          my.switchTab({ url: '/pages/index/index' });
        }});
      }, 1000);
    } catch (e) {
      my.showToast({ content: e.message || '支付宝登录失败', type: 'none' });
    } finally {
      this.setData({ logging: false });
    }
  },

  goRegister() {
    my.alert({
      title: '注册',
      content: '请联系客服或使用支付宝登录',
    });
  },
});
