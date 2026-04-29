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
      // Stash the token used so the response interceptor can tell whether
      // a 401 is for THIS token or a since-replaced one (race condition
      // when an in-flight /me from a stale token returns after a fresh login).
      config.__tokenUsed = token;
    }
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    if (typeof window !== 'undefined' && err?.response?.status === 401) {
      const tokenUsed = err.config?.__tokenUsed;
      const current = window.localStorage.getItem(TOKEN_KEY);
      // Only evict if the failing request used the token that's still
      // in storage. If a newer login replaced it mid-flight, leave it.
      if (tokenUsed && tokenUsed === current) {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
