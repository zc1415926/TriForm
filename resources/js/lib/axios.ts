import axios from 'axios';

// 创建 axios 实例，配置认证
const axiosInstance = axios.create({
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
});

// 从 meta 标签获取 CSRF Token
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
    axiosInstance.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

export default axiosInstance;
