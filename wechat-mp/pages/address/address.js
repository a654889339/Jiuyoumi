const app = getApp();

Page({
  data: {
    addresses: [],
    loading: true,
    selectMode: false,
  },

  onLoad(options) {
    if (options.select === '1') {
      this.setData({ selectMode: true });
    }
  },

  onShow() {
    this.loadAddresses();
  },

  async loadAddresses() {
    try {
      const res = await app.request({ url: '/addresses' });
      this.setData({ addresses: res.data || [], loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  selectAddress(e) {
    if (!this.data.selectMode) return;
    const addr = e.currentTarget.dataset.addr;
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('selectAddress', addr);
    }
    wx.navigateBack();
  },

  async setDefault(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await app.request({ url: `/addresses/${id}/default`, method: 'PUT' });
      wx.showToast({ title: '已设为默认', icon: 'success' });
      this.loadAddresses();
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  async deleteAddress(e) {
    const id = e.currentTarget.dataset.id;
    const confirm = await new Promise((resolve) => {
      wx.showModal({
        title: '确认删除',
        content: '确定删除该地址吗？',
        success: (res) => resolve(res.confirm),
      });
    });
    if (!confirm) return;
    try {
      await app.request({ url: `/addresses/${id}`, method: 'DELETE' });
      wx.showToast({ title: '已删除', icon: 'success' });
      this.loadAddresses();
    } catch (e) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/address-edit/address-edit' });
  },

  goEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/address-edit/address-edit?id=${id}` });
  },
});
