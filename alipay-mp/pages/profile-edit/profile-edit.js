const app = getApp();

Page({
  data: {
    nickname: '',
    phone: '',
    saving: false,
  },

  onLoad() {
    this.loadProfile();
  },

  async loadProfile() {
    try {
      const res = await app.request({ url: '/auth/profile' });
      const user = res.data;
      this.setData({
        nickname: user.nickname || '',
        phone: user.phone || '',
      });
    } catch (e) {}
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  async save() {
    const { nickname, phone } = this.data;
    if (!nickname.trim()) {
      my.showToast({ content: '请输入昵称', type: 'none' });
      return;
    }
    this.setData({ saving: true });
    try {
      await app.request({
        url: '/auth/profile',
        method: 'PUT',
        data: { nickname: nickname.trim(), phone: phone.trim() },
      });
      if (app.globalData.userInfo) {
        app.globalData.userInfo.nickname = nickname.trim();
        app.globalData.userInfo.phone = phone.trim();
      }
      my.showToast({ content: '保存成功' });
      setTimeout(() => my.navigateBack(), 1000);
    } catch (e) {
      my.showToast({ content: e.message || '保存失败', type: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },
});
