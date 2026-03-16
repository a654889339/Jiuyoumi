var app = getApp();

function formatTime(t) {
  if (!t) return '';
  var d = new Date(t);
  var now = new Date();
  var isToday = d.toDateString() === now.toDateString();
  var time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return isToday ? time : (d.getMonth() + 1) + '/' + d.getDate() + ' ' + time;
}

function imageUrl(content, baseUrl) {
  if (!content) return '';
  if (content.indexOf('http') === 0 || content.indexOf('//') === 0) return content;
  var host = (baseUrl || '').replace(/\/api\/?$/, '');
  return host + (content.indexOf('/') === 0 ? content : '/' + content);
}

Page({
  data: {
    messages: [],
    inputText: '',
    loading: true,
    sending: false,
    isLogin: false,
    scrollToId: '',
    inputFocus: false,
  },

  onLoad: function (options) {
    this.setData({ autoMsg: options.autoMsg ? decodeURIComponent(options.autoMsg || '') : '' });
  },

  onShow: function () {
    var token = app.globalData.token;
    this.setData({ isLogin: !!token });
    if (token) {
      this.loadMessages();
      if (this.data.autoMsg) {
        this.setData({ inputText: this.data.autoMsg, autoMsg: '' });
      }
    } else {
      this.setData({ messages: [], loading: false });
    }
  },

  loadMessages: async function () {
    this.setData({ loading: true });
    try {
      var res = await app.request({ url: '/messages/mine' });
      var list = res.data || [];
      var baseUrl = app.globalData.baseUrl || '';
      list.forEach(function (m) {
        m.timeText = formatTime(m.createdAt);
        if (m.type === 'image') m.imageUrl = imageUrl(m.content, baseUrl);
      });
      this.setData({ messages: list, loading: false });
      this.scrollToBottom();
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  scrollToBottom: function () {
    var list = this.data.messages;
    if (list.length) {
      this.setData({ scrollToId: 'msg-' + list[list.length - 1].id });
    }
  },

  onInput: function (e) {
    this.setData({ inputText: e.detail.value });
  },

  sendMessage: async function () {
    var text = (this.data.inputText || '').trim();
    if (!text || this.data.sending || !this.data.isLogin) return;
    this.setData({ sending: true });
    try {
      var res = await app.request({
        url: '/messages/send',
        method: 'POST',
        data: { content: text },
      });
      var msg = res.data;
      if (msg) {
        msg.timeText = formatTime(msg.createdAt);
        var messages = this.data.messages.concat([msg]);
        this.setData({ messages: messages, inputText: '', sending: false });
        this.scrollToBottom();
      } else {
        this.setData({ sending: false });
      }
    } catch (e) {
      wx.showToast({ title: e.message || '发送失败', icon: 'none' });
      this.setData({ sending: false });
    }
  },

  previewImage: function (e) {
    var url = e.currentTarget.dataset.url;
    if (url) wx.previewImage({ urls: [url] });
  },

  goLogin: function () {
    wx.navigateTo({ url: '/pages/login/login' });
  },
});
