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
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({ address: addr });
    }
    my.navigateBack();
  },

  async setDefault(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await app.request({ url: `/addresses/${id}/default`, method: 'PUT' });
      my.showToast({ content: '已设为默认' });
      this.loadAddresses();
    } catch (e) {
      my.showToast({ content: '操作失败', type: 'none' });
    }
  },

  async deleteAddress(e) {
    const id = e.currentTarget.dataset.id;
    my.confirm({
      title: '确认删除',
      content: '确定删除该地址吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.request({ url: `/addresses/${id}`, method: 'DELETE' });
            my.showToast({ content: '已删除' });
            this.loadAddresses();
          } catch (e) {
            my.showToast({ content: '删除失败', type: 'none' });
          }
        }
      },
    });
  },

  goAdd() {
    my.navigateTo({ url: '/pages/address-edit/address-edit' });
  },

  goEdit(e) {
    const id = e.currentTarget.dataset.id;
    my.navigateTo({ url: `/pages/address-edit/address-edit?id=${id}` });
  },
});
