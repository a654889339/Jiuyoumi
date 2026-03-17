import axios from 'axios';
import router from '@/router';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('jym_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 无需登录即可访问的路径，401 时不跳转登录
const publicPaths = ['/', '/login', '/register', '/products'];
const isPublicPath = (path) => {
  if (!path) return true;
  if (publicPaths.includes(path)) return true;
  if (path.startsWith('/products/')) return true;
  return false;
};

function getFriendlyMessage(error) {
  const status = error.response?.status;
  const msg = error.response?.data?.message;
  if (msg && typeof msg === 'string') return msg;
  if (status === 401) return '账号或密码错误，请检查后重试';
  if (status === 403) return '无权限操作';
  if (status === 400) return '请求参数有误，请检查后重试';
  if (status >= 500) return '服务暂时不可用，请稍后再试';
  if (error.message && !error.message.includes('status code')) return error.message;
  return '网络异常，请稍后再试';
}

request.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return data;
  },
  (error) => {
    const friendlyMessage = getFriendlyMessage(error);
    if (error.response?.status === 401) {
      localStorage.removeItem('jym_token');
      const currentPath = router.currentRoute?.value?.fullPath;
      if (!isPublicPath(router.currentRoute?.value?.path)) {
        router.push({ path: '/login', query: { redirect: currentPath } });
      }
    }
    return Promise.reject(new Error(friendlyMessage));
  }
);

export default request;
