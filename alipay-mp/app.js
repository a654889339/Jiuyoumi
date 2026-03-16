App({
  globalData: {
    baseUrl: 'http://106.54.50.88:5102/api',
    token: '',
    userInfo: null,
  },

  onLaunch() {
    const token = my.getStorageSync({ key: 'jym_token' }).data;
    if (token) {
      this.globalData.token = token;
    }
  },

  request(options) {
    const { baseUrl, token } = this.globalData;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return new Promise((resolve, reject) => {
      my.request({
        url: baseUrl + options.url,
        method: options.method || 'GET',
        data: options.data,
        headers: { ...headers, ...options.headers },
        dataType: 'json',
        success: (res) => {
          if (res.status === 401) {
            this.globalData.token = '';
            my.removeStorageSync({ key: 'jym_token' });
            my.navigateTo({ url: '/pages/login/login' });
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
    my.setStorageSync({ key: 'jym_token', data: token });
  },

  logout() {
    this.globalData.token = '';
    this.globalData.userInfo = null;
    my.removeStorageSync({ key: 'jym_token' });
  },
});
