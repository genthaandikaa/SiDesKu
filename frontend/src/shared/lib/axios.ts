import axios from 'axios';

type UnauthenticatedCallback = () => void;
const unauthenticatedCallbacks: Set<UnauthenticatedCallback> = new Set();

export const registerOnUnauthenticated = (cb: UnauthenticatedCallback): (() => void) => {
  unauthenticatedCallbacks.add(cb);
  return () => {
    unauthenticatedCallbacks.delete(cb);
  };
};

const notifyUnauthenticated = () => {
  unauthenticatedCallbacks.forEach((cb) => {
    try {
      cb();
    } catch {
      //
    }
  });
};

export const getBaseApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const clean = envUrl.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : clean + '/api';
  }
  return 'https://api-sides.smkkartanegara.sch.id/api';
};

const api = axios.create({
  baseURL: getBaseApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';

    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.endsWith('/login') ||
      url.endsWith('/register');

    if (status === 401 && !isAuthEndpoint) {
      try {
        localStorage.removeItem('token');
      } catch {
        //
      }

      notifyUnauthenticated();

      if (typeof window !== 'undefined' && !isRedirecting) {
        const pathname = window.location.pathname;
        const isProtectedRoute = pathname.startsWith('/dashboard');
        const isLoginPage = pathname === '/login' || pathname.startsWith('/login?');

        if (isProtectedRoute && !isLoginPage) {
          isRedirecting = true;
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);

          setTimeout(() => {
            if (window.location.pathname.startsWith('/dashboard')) {
              window.location.href = `/login?returnUrl=${returnUrl}`;
            }
            setTimeout(() => {
              isRedirecting = false;
            }, 1000);
          }, 150);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
