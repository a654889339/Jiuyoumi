import request from './request';

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
  sendEmailCode: (email) => request.post('/auth/send-email-code', { email }),
  sendSmsCode: (phone) => request.post('/auth/send-sms-code', { phone }),
  getProfile: () => request.get('/auth/profile'),
  updateProfile: (data) => request.put('/auth/profile', data),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return request.post('/auth/upload-avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const productApi = {
  categories: () => request.get('/products/categories'),
  list: (params) => request.get('/products', { params }),
  detail: (id) => request.get(`/products/${id}`),
  toggleFavorite: (productId) => request.post('/products/favorite', { productId }),
};

export const orderApi = {
  create: (data) => request.post('/orders', data),
  mine: (params) => request.get('/orders/mine', { params }),
  detail: (id) => request.get(`/orders/${id}`),
  cancel: (id) => request.put(`/orders/${id}/cancel`),
  tracking: (id) => request.get(`/orders/${id}/tracking`),
};

export const cartApi = {
  list: () => request.get('/cart'),
  add: (data) => request.post('/cart', data),
  update: (id, data) => request.put(`/cart/${id}`, data),
  remove: (id) => request.delete(`/cart/${id}`),
  clear: () => request.delete('/cart'),
};

export const addressApi = {
  list: () => request.get('/addresses'),
  create: (data) => request.post('/addresses', data),
  update: (id, data) => request.put(`/addresses/${id}`, data),
  remove: (id) => request.delete(`/addresses/${id}`),
  setDefault: (id) => request.put(`/addresses/${id}/default`),
};

export const homeConfigApi = {
  list: (params) => request.get('/home-config', { params }),
  tabbar: () => request.get('/home-config', { params: { section: 'tabbar' } }),
};

export const messageApi = {
  mine: () => request.get('/messages/mine'),
  send: (data) => request.post('/messages/send', data),
  unread: () => request.get('/messages/unread'),
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return request.post('/messages/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};
