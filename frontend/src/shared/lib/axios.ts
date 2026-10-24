import axios from 'axios';

type UnauthenticatedCallback = () => void;
const unauthenticatedCallbacks: Set<UnauthenticatedCallback> = new Set();

/**
 * Register a listener to be invoked when any API call returns HTTP 401 Unauthenticated.
 * Used by AuthContext to synchronize React user and token state immediately.
 */
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
      // ignore callback error
    }
  });
};

const api = axios.create({
  baseURL: '/api',
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

// Guard flag with debouncing to prevent multiple cascading redirects during concurrent 401s
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';

    // Ignore 401/422 responses from login or register endpoints so form error messages can be displayed
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.endsWith('/login') ||
      url.endsWith('/register');

    // ONLY intercept HTTP 401 (Unauthenticated).
    // HTTP 403 (Forbidden) MUST NOT trigger logout or session wipe!
    if (status === 401 && !isAuthEndpoint) {
      // 1. Wipe stored token from localStorage
      try {
        localStorage.removeItem('token');
      } catch {
        // ignore localStorage errors
      }

      // 2. Notify React AuthContext to reset in-memory user and token state
      notifyUnauthenticated();

      // 3. Centralized browser redirect handling for protected routes
      if (typeof window !== 'undefined' && !isRedirecting) {
        const pathname = window.location.pathname;
        const isProtectedRoute = pathname.startsWith('/dashboard');
        const isLoginPage = pathname === '/login' || pathname.startsWith('/login?');

        if (isProtectedRoute && !isLoginPage) {
          isRedirecting = true;
          const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);

          // Give React state / ProtectedDashboardRoute a brief window to perform client-side replace
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
