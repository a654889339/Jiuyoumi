const app = getApp();

Page({
  data: {
    username: '', password: '', confirmPassword: '', nickname: '', email: '', emailCode: '', phone: '', smsCode: '',
    registering: false,
    emailCooldown: 0, emailSending: false,
    smsCooldown: 0, smsSending: false,
  },

  onInput(e) {
    var field = e.currentTarget.dataset.field;
    var obj = {};
    obj[field] = e.detail.value;
    this.setData(obj);
  },

  async sendEmailCode() {
    var that = this;
    var email = that.data.email;
    if (!email || email.indexOf('@') === -1) { my.showToast({ content: '请输入正确的邮箱', type: 'none' }); return; }
    that.setData({ emailSending: true });
    try {
      await app.request({ url: '/auth/send-email-code', method: 'POST', data: { email: email } });
      my.showToast({ content: '验证码已发送' });
      that.setData({ emailCooldown: 60 });
      var timer = setInterval(function() {
        var cd = that.data.emailCooldown - 1;
        that.setData({ emailCooldown: cd });
        if (cd <= 0) clearInterval(timer);
      }, 1000);
    } catch (e) { my.showToast({ content: (e && e.message) || '发送失败', type: 'none' }); }
    finally { that.setData({ emailSending: false }); }
  },

  async sendSmsCode() {
    var that = this;
    var phone = that.data.phone;
    if (!phone || !/^1\d{10}$/.test(phone)) { my.showToast({ content: '请输入正确的手机号', type: 'none' }); return; }
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

  async register() {
    var that = this;
    var d = that.data;
    if (!d.username || !d.password) { my.showToast({ content: '请填写账号和密码', type: 'none' }); return; }
    if (d.password.length < 6) { my.showToast({ content: '密码至少6位', type: 'none' }); return; }
    if (d.password !== d.confirmPassword) { my.showToast({ content: '两次输入的密码不一致', type: 'none' }); return; }
    if (!d.email) { my.showToast({ content: '请填写邮箱', type: 'none' }); return; }
    if (!d.emailCode) { my.showToast({ content: '请输入邮箱验证码', type: 'none' }); return; }
    if (d.phone && d.phone.length === 11 && !d.smsCode) { my.showToast({ content: '请输入短信验证码', type: 'none' }); return; }
    that.setData({ registering: true });
    try {
      var res = await app.request({
        url: '/auth/register', method: 'POST',
        data: { username: d.username.trim(), password: d.password, nickname: d.nickname, email: d.email, emailCode: d.emailCode, phone: d.phone, smsCode: d.smsCode },
      });
      var data = res.data;
      app.setAuth(data.token, data.user);
      my.showToast({ content: '注册成功' });
      setTimeout(function() { my.navigateBack({ delta: 2, fail: function() { my.switchTab({ url: '/pages/index/index' }); }}); }, 1000);
    } catch (e) { my.showToast({ content: (e && e.message) || '注册失败', type: 'none' }); }
    finally { that.setData({ registering: false }); }
  },

  goLogin() {
    my.navigateBack();
  },
});
