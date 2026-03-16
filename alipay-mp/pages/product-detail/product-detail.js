const app = getApp();

Page({
  data: {
    id: '',
    product: null,
    currentSwiper: 0,
    loading: true,
  },

  onLoad(options) {
    this.setData({ id: options.id });
    this.loadProduct();
  },

  async loadProduct() {
    try {
      const res = await app.request({ url: `/products/${this.data.id}` });
      const product = res.data;
      if (!product.images) {
        product.images = [product.imageUrl || product.image];
      }
      this.setData({ product, loading: false });
      my.setNavigationBar({ title: product.name || '商品详情' });
    } catch (e) {
      my.showToast({ content: '加载失败', type: 'none' });
      this.setData({ loading: false });
    }
  },

  onSwiperChange(e) {
    this.setData({ currentSwiper: e.detail.current });
  },

  async addToCart() {
    if (!app.globalData.token) {
      my.navigateTo({ url: '/pages/login/login' });
      return;
    }
    try {
      await app.request({
        url: '/cart',
        method: 'POST',
        data: { productId: Number(this.data.id), quantity: 1 },
      });
      my.showToast({ content: '已加入购物车' });
    } catch (e) {
      my.showToast({ content: e.message || '操作失败', type: 'none' });
    }
  },

  buyNow() {
    if (!app.globalData.token) {
      my.navigateTo({ url: '/pages/login/login' });
      return;
    }
    const p = this.data.product;
    const item = {
      productId: p.id,
      name: p.name,
      image: p.imageUrl || p.image || (p.images && p.images[0]),
      price: p.price,
      quantity: 1,
    };
    my.navigateTo({
      url: `/pages/checkout/checkout?directBuy=${encodeURIComponent(JSON.stringify(item))}`,
    });
  },

  goCart() {
    my.navigateTo({ url: '/pages/cart/cart' });
  },

  goConsult() {
    const p = this.data.product;
    let msg = '';
    if (p) {
      msg = '我想咨询【' + (p.name || '该商品') + '】';
      if (p.price != null) msg += '（¥' + p.price + '）';
      if (p.description) msg += '：' + p.description;
    }
    my.navigateTo({
      url: '/pages/chat/chat?autoMsg=' + encodeURIComponent(msg),
    });
  },
});
