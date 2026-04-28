import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const TOKEN_KEY = 'bridgix_token';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (typeof window !== 'undefined' && err?.response?.status === 401) {
      window.localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(err);
  }
);

export default api;
