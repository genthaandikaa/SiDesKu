import api from '@/shared/lib/axios';
import { UmkmItem, UmkmReviewItem } from '../types';
import { getStoredUmkmList, saveStoredUmkmItem } from '../smartCityStorage';

// Transform backend snake_case response to frontend UmkmItem
function transformUmkmFromBackend(raw: any): UmkmItem {
  return {
    id: raw.id,
    wargaId: raw.user_id ? String(raw.user_id) : undefined,
    nama: raw.nama,
    tokoNama: raw.toko_nama || raw.tokoNama || '',
    kelurahan: raw.kelurahan,
    rtRw: raw.rt_rw || raw.rtRw,
    kategori: raw.kategori,
    badgeTag: raw.badge_tag || raw.badgeTag,
    harga: Number(raw.harga) || 0,
    ongkir: Number(raw.ongkir ?? 0),
    satuan: raw.satuan,
    deskripsi: raw.deskripsi || '',
    fotoUrl: raw.foto_url || raw.fotoUrl || '',
    galeri: Array.isArray(raw.galeri) ? raw.galeri : (raw.foto_url ? [raw.foto_url] : []),
    alamat: raw.alamat || '',
    lat: Number(raw.lat) || 0,
    lng: Number(raw.lng) || 0,
    waKontak: raw.wa_kontak || raw.waKontak || '',
    qrisUrl: raw.qris_url || raw.qrisUrl,
    qrisNama: raw.qris_nama || raw.qrisNama,
    qrisNmid: raw.qris_nmid || raw.qrisNmid,
    metodePembayaran: raw.metode_pembayaran || raw.metodePembayaran || {
      qris: true,
      cod: true,
      do: true,
      transfer: true,
    },
    statusToko: raw.status_toko || raw.statusToko || 'Buka',
    rating: Number(raw.rating) || 5.0,
    reviewsCount: Number(raw.reviews_count ?? raw.reviewsCount) || 0,
    reviews: Array.isArray(raw.reviews) ? raw.reviews.map(transformReviewFromBackend) : undefined,
    terjualText: raw.terjual_text || raw.terjualText,
    terjual: Number(raw.terjual) || 0,
    bukaJamText: raw.buka_jam_text || raw.bukaJamText,
    isJasa: Boolean(raw.is_jasa ?? raw.isJasa),
    pilihanAyam: raw.pilihan_ayam || raw.pilihanAyam,
    pilihanSambal: raw.pilihan_sambal || raw.pilihanSambal,
    pilihanLayananJasa: raw.pilihan_layanan_jasa || raw.pilihanLayananJasa,
    keteranganHalal: raw.keterangan_halal || raw.keteranganHalal,
    keteranganHigienis: raw.keterangan_higienis || raw.keteranganHigienis,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

function transformReviewFromBackend(raw: any): UmkmReviewItem {
  return {
    id: raw.id,
    umkmId: raw.umkm_id || raw.umkmId,
    userId: raw.user_id || raw.userId,
    rating: Number(raw.rating) || 5,
    komentar: raw.komentar || '',
    reviewerName: raw.reviewer_name || raw.reviewerName || 'Warga Kediri',
    reviewerRtRw: raw.reviewer_rt_rw || raw.reviewerRtRw,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

export const smartCityApi = {
  /**
   * Fetch UMKM items from backend API with localStorage fallback
   */
  getUmkmList: async (params?: {
    q?: string;
    kategori?: string;
    delivery?: string;
    payment?: string;
    min_rating?: number;
    user_lat?: number;
    user_lng?: number;
    max_distance?: number;
    sort_by?: string;
  }): Promise<UmkmItem[]> => {
    try {
      const res = await api.get('/public/umkms', { params });
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const transformed = res.data.data.map(transformUmkmFromBackend);
        // Sync to localStorage
        try {
          localStorage.setItem('sidesku_smartcity_umkm_v3', JSON.stringify(transformed));
        } catch {}
        return transformed;
      }
    } catch (err) {
      console.warn('Smart city UMKM backend API fetch failed, falling back to local storage:', err);
    }
    return getStoredUmkmList();
  },

  /**
   * Get single UMKM item by ID with reviews
   */
  getUmkmDetail: async (id: string): Promise<UmkmItem | null> => {
    try {
      const res = await api.get(`/public/umkms/${id}`);
      if (res.data?.success && res.data?.data) {
        return transformUmkmFromBackend(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch UMKM detail from backend, falling back to local storage:', err);
    }
    const all = getStoredUmkmList();
    return all.find((item) => item.id === id) || null;
  },

  /**
   * Get reviews for a specific UMKM item
   */
  getUmkmReviews: async (umkmId: string): Promise<UmkmReviewItem[]> => {
    try {
      const res = await api.get(`/public/umkms/${umkmId}/reviews`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data.map(transformReviewFromBackend);
      }
    } catch (err) {
      console.warn('Failed to fetch UMKM reviews from backend:', err);
    }
    return [];
  },

  /**
   * Post citizen review for an UMKM item (Requires Citizen Auth)
   */
  submitUmkmReview: async (
    umkmId: string,
    payload: { rating: number; komentar: string }
  ): Promise<{ review: UmkmReviewItem; updatedUmkm?: { rating: number; reviewsCount: number } }> => {
    const res = await api.post(`/umkms/${umkmId}/reviews`, payload);
    const rev = transformReviewFromBackend(res.data.data);
    return {
      review: rev,
      updatedUmkm: res.data.updated_umkm
        ? {
            rating: res.data.updated_umkm.rating,
            reviewsCount: res.data.updated_umkm.reviews_count,
          }
        : undefined,
    };
  },

  /**
   * Post new UMKM store / product by citizen (Requires Citizen Auth)
   */
  createUmkmProduct: async (item: Partial<UmkmItem>): Promise<UmkmItem> => {
    try {
      const payload = {
        nama: item.nama,
        toko_nama: item.tokoNama,
        kategori: item.kategori,
        badge_tag: item.badgeTag,
        harga: item.harga,
        satuan: item.satuan,
        deskripsi: item.deskripsi,
        foto_url: item.fotoUrl,
        alamat: item.alamat,
        lat: item.lat,
        lng: item.lng,
        wa_kontak: item.waKontak,
        qris: item.metodePembayaran?.qris,
        cod: item.metodePembayaran?.cod,
        buka_jam_text: item.bukaJamText,
      };
      const res = await api.post('/umkms', payload);
      if (res.data?.success && res.data?.data) {
        const created = transformUmkmFromBackend(res.data.data);
        saveStoredUmkmItem(created);
        return created;
      }
    } catch (err) {
      console.warn('Backend create product failed, saving to local storage:', err);
    }
    // Fallback: save to local storage
    const fallbackItem = item as UmkmItem;
    saveStoredUmkmItem(fallbackItem);
    return fallbackItem;
  },
};
