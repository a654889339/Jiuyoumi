const app = getApp();

Page({
  data: {
    cartItems: [],
    totalAmount: 0,
    loading: true,
    slideItemId: '',
  },

  onLoad() {},

  onShow() {
    if (!app.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    this.loadCart();
  },

  async loadCart() {
    this.setData({ loading: true });
    try {
      const res = await app.request({ url: '/cart' });
      const cartItems = res.data || [];
      this.setData({ cartItems, loading: false });
      this.calcTotal();
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  calcTotal() {
    const total = this.data.cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    this.setData({ totalAmount: total.toFixed(2) });
  },

  async changeQty(e) {
    const { id, action } = e.currentTarget.dataset;
    const item = this.data.cartItems.find((i) => i.id === id);
    if (!item) return;

    let newQty = action === 'add' ? item.quantity + 1 : item.quantity - 1;
    if (newQty < 1) {
      this.deleteItem(id);
      return;
    }
    try {
      await app.request({ url: `/cart/${id}`, method: 'PUT', data: { quantity: newQty } });
      const idx = this.data.cartItems.findIndex((i) => i.id === id);
      this.setData({ [`cartItems[${idx}].quantity`]: newQty });
      this.calcTotal();
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  async deleteItem(id) {
    try {
      await app.request({ url: `/cart/${id}`, method: 'DELETE' });
      const cartItems = this.data.cartItems.filter((i) => i.id !== id);
      this.setData({ cartItems, slideItemId: '' });
      this.calcTotal();
      wx.showToast({ title: '已删除', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  onDeleteItem(e) {
    const id = e.currentTarget.dataset.id;
    this.deleteItem(id);
  },

  touchStart(e) {
    this._startX = e.changedTouches[0].clientX;
  },

  touchEnd(e) {
    const endX = e.changedTouches[0].clientX;
    const diff = this._startX - endX;
    const id = e.currentTarget.dataset.id;
    if (diff > 60) {
      this.setData({ slideItemId: id });
    } else if (diff < -30) {
      this.setData({ slideItemId: '' });
    }
  },

  goCheckout() {
    if (this.data.cartItems.length === 0) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/checkout/checkout' });
  },
});
