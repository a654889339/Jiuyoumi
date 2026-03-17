const app = getApp();

Page({
  data: {
    activeTab: 0,
    username: '',
    password: '',
    phone: '',
    smsCode: '',
    logging: false,
    smsCooldown: 0,
    smsSending: false,
  },

  switchTab(e) {
    this.setData({ activeTab: parseInt(e.currentTarget.dataset.tab) });
  },

  onUsernameInput(e) { this.setData({ username: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onSmsCodeInput(e) { this.setData({ smsCode: e.detail.value }); },

  loginSuccess(res) {
    var data = res.data;
    app.setAuth(data.token, data.user);
    my.showToast({ content: '登录成功' });
    setTimeout(function() {
      my.navigateBack({ delta: 1, fail: function() {
        my.switchTab({ url: '/pages/index/index' });
      }});
    }, 1000);
  },

  async login() {
    var that = this;
    var username = that.data.username;
    var password = that.data.password;
    if (!username || !username.trim()) { my.showToast({ content: '请输入用户名', type: 'none' }); return; }
    if (!password) { my.showToast({ content: '请输入密码', type: 'none' }); return; }
    that.setData({ logging: true });
    try {
      var res = await app.request({ url: '/auth/login', method: 'POST', data: { username: username.trim(), password: password } });
      that.loginSuccess(res);
    } catch (e) { my.showToast({ content: (e && e.message) || '登录失败', type: 'none' }); }
    finally { that.setData({ logging: false }); }
  },

  async sendSmsCode() {
    var that = this;
    var phone = that.data.phone;
    if (!phone || !/^1\d{10}$/.test(phone)) { my.showToast({ content: '请输入正确的11位手机号', type: 'none' }); return; }
    that.setData({ smsSending: true });
    try {
      await app.request({ url: '/auth/send-sms-code', method: 'POST', data: { phone: phone } });
      my.showToast({ content: '验证码已发送' });
      that.setData({ smsCooldown: 60 });
      var timer = setInterval(function() {
        var cd = that.data.smsCooldown - 1;
        that.setData({ smsCooldown: cd });
        if (cd <= 0) clearInterval(timer);
      }, 1000);
    } catch (e) { my.showToast({ content: (e && e.message) || '发送失败', type: 'none' }); }
    finally { that.setData({ smsSending: false }); }
  },

  async phoneLogin() {
    var that = this;
    var phone = that.data.phone;
    var smsCode = that.data.smsCode;
    if (!phone || !/^1\d{10}$/.test(phone)) { my.showToast({ content: '请输入正确的手机号', type: 'none' }); return; }
    if (!smsCode || smsCode.length < 4) { my.showToast({ content: '请输入验证码', type: 'none' }); return; }
    that.setData({ logging: true });
    try {
      var res = await app.request({ url: '/auth/login', method: 'POST', data: { phone: phone, smsCode: smsCode } });
      that.loginSuccess(res);
    } catch (e) { my.showToast({ content: (e && e.message) || '登录失败', type: 'none' }); }
    finally { that.setData({ logging: false }); }
  },

  async alipayLogin() {
    var that = this;
    that.setData({ logging: true });
    try {
      var authRes = await new Promise(function(resolve, reject) { my.getAuthCode({ scopes: 'auth_user', success: resolve, fail: reject }); });
      var res = await app.request({ url: '/auth/alipay-login', method: 'POST', data: { code: authRes.authCode } });
      that.loginSuccess(res);
    } catch (e) { my.showToast({ content: (e && e.message) || '支付宝登录失败', type: 'none' }); }
    finally { that.setData({ logging: false }); }
  },

  goRegister() {
    my.navigateTo({ url: '/pages/register/register' });
  },
});
