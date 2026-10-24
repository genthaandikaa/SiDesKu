import api from '@/shared/lib/axios';

export interface PushStatus {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  subscriptionCount?: number;
  isConfigured?: boolean;
}

/**
 * Konversi URL-safe base64 string ke Uint8Array (standar VAPID key)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushNotificationService = {
  /**
   * Cek apakah browser mendukung Service Worker, Push Manager, dan Notification
   */
  isPushSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  },

  /**
   * Ambil status izin notifikasi saat ini
   */
  getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isPushSupported()) {
      return 'unsupported';
    }
    return Notification.permission;
  },

  /**
   * Ambil Service Worker registration aktif
   */
  async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isPushSupported()) return null;

    try {
      // Pastikan service worker terdaftar
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw-push.js', { scope: '/' });
      }
      return await navigator.serviceWorker.ready;
    } catch (err) {
      console.warn('[WebPush] Error getting service worker registration:', err);
      return null;
    }
  },

  /**
   * Cek apakah browser saat ini sudah memiliki subscription aktif
   */
  async getExistingSubscription(): Promise<PushSubscription | null> {
    const reg = await this.getRegistration();
    if (!reg) return null;

    try {
      return await reg.pushManager.getSubscription();
    } catch (err) {
      console.warn('[WebPush] Error checking existing subscription:', err);
      return null;
    }
  },

  /**
   * Ambil ringkasan status lengkap (lokal + server)
   */
  async getStatus(): Promise<PushStatus> {
    const isSupported = this.isPushSupported();
    if (!isSupported) {
      return {
        isSupported: false,
        permission: 'unsupported',
        isSubscribed: false,
      };
    }

    const permission = Notification.permission;
    const localSub = await this.getExistingSubscription();

    let serverConfigured = true;
    let subscriptionCount = 0;

    try {
      const res = await api.get('/push/status');
      if (res.data?.success) {
        serverConfigured = res.data.data.isConfigured;
        subscriptionCount = res.data.data.subscriptionCount;
      }
    } catch {
      // Offline fallback
    }

    return {
      isSupported: true,
      permission,
      isSubscribed: !!localSub,
      subscriptionCount,
      isConfigured: serverConfigured,
    };
  },

  /**
   * Daftarkan push subscription baru (Rp0 VAPID)
   */
  async subscribe(): Promise<{ success: boolean; message: string }> {
    if (!this.isPushSupported()) {
      return {
        success: false,
        message: 'Browser Anda tidak mendukung Web Push Notification.',
      };
    }

    // 1. Minta izin pengguna secara sadar
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      return {
        success: false,
        message:
          perm === 'denied'
            ? 'Izin notifikasi diblokir oleh browser. Silakan aktifkan melalui ikon gembok di bilah alamat browser.'
            : 'Izin notifikasi belum diberikan.',
      };
    }

    // 2. Ambil Public VAPID Key dari backend
    let publicKey = '';
    try {
      const keyRes = await api.get('/push/public-key');
      publicKey = keyRes.data?.data?.publicKey || '';
    } catch (err: any) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          'Gagal mengambil kunci otentikasi push dari server.',
      };
    }

    if (!publicKey) {
      return {
        success: false,
        message: 'Kunci VAPID belum dikonfigurasi di server backend.',
      };
    }

    // 3. Daftarkan subscription ke Push Manager browser
    const reg = await this.getRegistration();
    if (!reg) {
      return {
        success: false,
        message: 'Gagal menginisialisasi Service Worker.',
      };
    }

    try {
      let subscription = await reg.pushManager.getSubscription();

      // Jika belum ada subscription aktif di browser, buat langganan baru via PushManager
      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(publicKey);
        try {
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey as BufferSource,
          });
        } catch (firstErr: any) {
          console.warn('[WebPush] First subscribe attempt failed, trying cleanup reset...', firstErr);
          // Jika push service error karena cache browser, unsubscribe dan coba lagi
          try {
            const stale = await reg.pushManager.getSubscription();
            if (stale) await stale.unsubscribe();
          } catch {}

          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey as BufferSource,
          });
        }
      }

      const subJson = subscription.toJSON();

      // 4. Kirim subscription ke backend untuk disimpan pada akun yang sedang login
      const saveRes = await api.post('/push/subscribe', {
        endpoint: subJson.endpoint,
        keys: subJson.keys,
        contentEncoding: 'aes128gcm',
      });

      return {
        success: true,
        message:
          saveRes.data?.message ||
          'Notifikasi Web Push berhasil diaktifkan pada perangkat ini.',
      };
    } catch (err: any) {
      console.error('[WebPush] Error during push subscription:', err);
      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.message ||
          'Gagal mendaftarkan langganan notifikasi ke penyedia push.',
      };
    }
  },

  /**
   * Nonaktifkan push subscription pada perangkat saat ini
   */
  async unsubscribe(): Promise<{ success: boolean; message: string }> {
    const sub = await this.getExistingSubscription();
    if (!sub) {
      return {
        success: true,
        message: 'Perangkat ini belum terdaftar notifikasi push.',
      };
    }

    try {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();

      await api.post('/push/unsubscribe', { endpoint });

      return {
        success: true,
        message: 'Notifikasi Web Push berhasil dinonaktifkan.',
      };
    } catch (err: any) {
      console.warn('[WebPush] Error during unsubscribe:', err);
      return {
        success: false,
        message:
          err.response?.data?.message ||
          'Gagal menghapus langganan notifikasi dari server.',
      };
    }
  },

  /**
   * Kirim notifikasi uji coba ke akun sendiri
   */
  async sendTestPush(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.post('/push/test');
      return {
        success: true,
        message: res.data?.message || 'Notifikasi uji coba berhasil dikirim.',
      };
    } catch (err: any) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          'Gagal mengirim notifikasi uji coba.',
      };
    }
  },
};

