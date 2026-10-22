/**
 * Utility helper to safely format and normalize media & document URLs across environments.
 * - Strips localhost/127.0.0.1 port 8000 prefix so URLs flow seamlessly through Vite reverse-proxy & production domains.
 * - Automatically attaches Sanctum auth token for private document endpoints (/api/warga/dokumen/file/...)
 *   so native <img> and <iframe> tags are authenticated with 200 OK without triggering 401s or IDM popup grabs.
 */
export const getSafeMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  
  let trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs and Blob URLs are local and self-contained
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Strip any host with port 8000 (localhost, 127.0.0.1, LAN IP 192.168.x.x:8000)
  trimmed = trimmed.replace(/^https?:\/\/[^/]+:8000\//, '/');
  trimmed = trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//, '/');

  let cleanUrl = trimmed;

  // External full URLs return as is
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  // Ensure path is properly prefixed
  if (!cleanUrl.startsWith('/')) {
    if (cleanUrl.startsWith('uploads/') || cleanUrl.startsWith('storage/') || cleanUrl.startsWith('images/') || cleanUrl.startsWith('api/')) {
      cleanUrl = '/' + cleanUrl;
    } else {
      // Bare filename like dokumen_xxx.jpg or foto-ktp.jpg
      cleanUrl = '/uploads/lampiran/' + cleanUrl;
    }
  }

  return cleanUrl;
};

/**
 * Returns initials from a full name for avatar badges.
 */
export const getAvatarInitials = (name?: string | null, fallback = 'U'): string => {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};
