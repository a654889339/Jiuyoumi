var app = getApp();
var VIDEO_EXTS = /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i;

function isVideoUrl(url) {
  return url && VIDEO_EXTS.test(url);
}

function buildMediaList(product) {
  var items = [];
  var mi = product.mediaItems || [];
  if (mi.length) {
    for (var i = 0; i < mi.length; i++) {
      var m = mi[i];
      var isVid = m.type === 'video' || isVideoUrl(m.url);
      items.push({ url: m.url, cover: m.thumb || m.url, type: isVid ? 'video' : 'image' });
    }
    return items;
  }
  var vids = product.videos || [];
  for (var j = 0; j < vids.length; j++) {
    var v = vids[j];
    if (typeof v === 'string') items.push({ url: v, cover: '', type: 'video' });
    else items.push({ url: v.url, cover: v.cover || '', type: 'video' });
  }
  var imgs = product.images || [];
  for (var k = 0; k < imgs.length; k++) {
    items.push({ url: imgs[k], cover: imgs[k], type: 'image' });
  }
  if (!items.length && product.coverImage) {
    items.push({ url: product.coverImage, cover: product.coverImage, type: 'image' });
  }
  return items;
}

Page({
  data: {
    id: '',
    product: null,
    mediaList: [],
    currentSwiper: 0,
    loading: true,
  },

  onLoad: function(options) {
    this.setData({ id: options.id });
    this.loadProduct();
  },

  loadProduct: function() {
    var that = this;
    app.request({ url: '/products/' + that.data.id }).then(function(res) {
      var product = res.data || {};
      var mediaList = buildMediaList(product);
      that.setData({ product: product, mediaList: mediaList, loading: false });
      wx.setNavigationBarTitle({ title: product.name || '商品详情' });
    }).catch(function() {
      wx.showToast({ title: '加载失败', icon: 'none' });
      that.setData({ loading: false });
    });
  },

  onSwiperChange: function(e) {
    this.setData({ currentSwiper: e.detail.current });
  },

  playVideo: function(e) {
    var url = e.currentTarget.dataset.url;
    if (url) {
      wx.previewMedia({
        sources: [{ url: url, type: 'video' }],
        current: 0,
      });
    }
  },

  previewImage: function(e) {
    var list = this.data.mediaList;
    var images = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].type === 'image') images.push(list[i].url);
    }
    wx.previewImage({ urls: images, current: images[0] || '' });
  },

  toggleFav: function() {
    var that = this;
    if (!app.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    app.request({
      url: '/products/favorite',
      method: 'POST',
      data: { productId: Number(that.data.id) },
    }).then(function(res) {
      var p = that.data.product;
      p.isFavorited = res.data.favorited;
      p.favCount = (p.favCount || 0) + (res.data.favorited ? 1 : -1);
      that.setData({ product: p });
      wx.showToast({ title: res.data.favorited ? '已关注' : '取消关注', icon: 'success' });
    }).catch(function() {
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  addToCart: function() {
    var that = this;
    if (!app.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    app.request({
      url: '/cart',
      method: 'POST',
      data: { productId: Number(that.data.id), quantity: 1 },
    }).then(function() {
      wx.showToast({ title: '已加入购物车', icon: 'success' });
    }).catch(function(e) {
      wx.showToast({ title: (e && e.message) || '操作失败', icon: 'none' });
    });
  },

  buyNow: function() {
    if (!app.globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    var p = this.data.product;
    var item = {
      productId: p.id,
      name: p.name,
      image: p.coverImage || (p.images && p.images[0]) || '',
      price: p.price,
      quantity: 1,
    };
    wx.navigateTo({
      url: '/pages/checkout/checkout?directBuy=' + encodeURIComponent(JSON.stringify(item)),
    });
  },

  goCart: function() {
    wx.navigateTo({ url: '/pages/cart/cart' });
  },

  goConsult: function() {
    var p = this.data.product;
    var msg = '';
    if (p) {
      msg = '我想咨询【' + (p.name || '该商品') + '】';
      if (p.price != null) msg += '（¥' + p.price + '）';
      if (p.description) msg += '：' + p.description;
    }
    wx.navigateTo({
      url: '/pages/chat/chat?autoMsg=' + encodeURIComponent(msg),
    });
  },
});
