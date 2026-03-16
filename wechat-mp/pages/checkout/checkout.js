const app = getApp();

Page({
  data: {
    address: null,
    items: [],
    remark: '',
    totalAmount: 0,
    submitting: false,
    isDirectBuy: false,
  },

  onLoad(options) {
    if (options.directBuy) {
      const item = JSON.parse(decodeURIComponent(options.directBuy));
      this.setData({ items: [item], isDirectBuy: true });
      this.calcTotal();
    } else {
      this.loadCart();
    }
    this.loadDefaultAddress();
  },

  async loadCart() {
    try {
      const res = await app.request({ url: '/cart' });
      this.setData({ items: res.data || [] });
      this.calcTotal();
    } catch (e) {}
  },

  async loadDefaultAddress() {
    try {
      const res = await app.request({ url: '/addresses' });
      const list = res.data || [];
      const defaultAddr = list.find((a) => a.isDefault) || list[0];
      if (defaultAddr) {
        this.setData({ address: defaultAddr });
      }
    } catch (e) {}
  },

  calcTotal() {
    const total = this.data.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    this.setData({ totalAmount: total.toFixed(2) });
  },

  chooseAddress() {
    wx.navigateTo({
      url: '/pages/address/address?select=1',
      events: {
        selectAddress: (addr) => {
          this.setData({ address: addr });
        },
      },
    });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  async submitOrder() {
    if (this.data.submitting) return;
    if (!this.data.address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }
    if (this.data.items.length === 0) {
      wx.showToast({ title: '请添加商品', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      const orderItems = this.data.items.map((item) => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const addr = this.data.address;
      const res = await app.request({
        url: '/orders',
        method: 'POST',
        data: {
          items: orderItems,
          contactName: addr.contactName || addr.name,
          contactPhone: addr.contactPhone || addr.phone,
          address: addr.fullAddress || `${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.detail || addr.address || ''}`,
          remark: this.data.remark,
        },
      });
      wx.showToast({ title: '下单成功', icon: 'success' });
      const orderId = (res.data && res.data.id) || (res.data && res.data.orderId);
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/order-detail/order-detail?id=${orderId}` });
      }, 1500);
    } catch (e) {
      wx.showToast({ title: e.message || '下单失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
