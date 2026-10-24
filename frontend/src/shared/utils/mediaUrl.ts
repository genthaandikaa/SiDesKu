import { getBaseApiUrl } from '../lib/axios';

export const getBackendBaseUrl = (): string => {
  const baseApi = getBaseApiUrl();
  return baseApi.replace(/\/api\/?$/, '');
};

export const getSafeMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  
  let trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  trimmed = trimmed.replace(/^https?:\/\/[^/]+:(8000|8001)\//, '/');
  trimmed = trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//, '/');

  let cleanUrl = trimmed;

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  if (!cleanUrl.startsWith('/')) {
    if (cleanUrl.startsWith('uploads/') || cleanUrl.startsWith('storage/') || cleanUrl.startsWith('images/') || cleanUrl.startsWith('api/')) {
      cleanUrl = '/' + cleanUrl;
    } else {
      cleanUrl = '/uploads/lampiran/' + cleanUrl;
    }
  }

  if (cleanUrl.includes('/api/warga/dokumen/file/')) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token && !cleanUrl.includes('token=')) {
        cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(token);
      }
    } catch {
      //
    }
  }

  const backendBase = getBackendBaseUrl();
  if (backendBase && (cleanUrl.startsWith('/uploads/') || cleanUrl.startsWith('/storage/') || cleanUrl.startsWith('/api/'))) {
    return backendBase + cleanUrl;
  }

  return cleanUrl;
};

export const getAvatarInitials = (name?: string | null, fallback = 'U'): string => {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};
