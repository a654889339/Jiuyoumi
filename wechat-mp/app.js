App({
  globalData: {
    baseUrl: 'http://localhost:5102/api',
    token: '',
    userInfo: null,
  },

  onLaunch() {
    const token = wx.getStorageSync('jym_token');
    if (token) {
      this.globalData.token = token;
    }
  },

  request(options) {
    const { baseUrl, token } = this.globalData;
    const header = { 'Content-Type': 'application/json' };
    if (token) header['Authorization'] = `Bearer ${token}`;
    return new Promise((resolve, reject) => {
      wx.request({
        url: baseUrl + options.url,
        method: options.method || 'GET',
        data: options.data,
        header: { ...header, ...options.header },
        success: (res) => {
          if (res.statusCode === 401) {
            this.globalData.token = '';
            wx.removeStorageSync('jym_token');
            wx.navigateTo({ url: '/pages/login/login' });
            reject(new Error('未登录'));
            return;
          }
          if (res.data && res.data.code === 0) {
            resolve(res.data);
          } else {
            reject(new Error((res.data && res.data.message) || '请求失败'));
          }
        },
        fail: reject,
      });
    });
  },

  setAuth(token, user) {
    this.globalData.token = token;
    this.globalData.userInfo = user;
    wx.setStorageSync('jym_token', token);
  },

  logout() {
    this.globalData.token = '';
    this.globalData.userInfo = null;
    wx.removeStorageSync('jym_token');
  },
});
