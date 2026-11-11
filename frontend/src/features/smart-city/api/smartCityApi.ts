import api from '@/shared/lib/axios';
import { UmkmItem, UmkmReviewItem, LokerItem, LamaranLoker, JobSeekerProfile } from '../types';
import {
  getStoredUmkmList,
  saveStoredUmkmItem,
  getStoredLokerList,
  getStoredLokerById,
  getStoredJobSeekerProfile,
  saveStoredJobSeekerProfile,
  getStoredLamaranList,
  submitStoredLamaran
} from '../smartCityStorage';

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

function transformLokerFromBackend(raw: any): LokerItem {
  return {
    id: raw.id,
    wargaId: raw.user_id ? String(raw.user_id) : undefined,
    posisi: raw.posisi,
    perusahaan: raw.perusahaan,
    kodeReg: raw.kode_reg,
    nib: raw.nib,
    companyLogoText: raw.company_logo_text,
    mitraStatus: raw.mitra_status,
    tagVerifikasi: raw.tag_verifikasi,
    kategori: raw.kategori,
    tipeKerja: raw.tipe_kerja,
    isJasaMitra: Boolean(raw.is_jasa_mitra),
    lokasi: raw.lokasi,
    distanceText: raw.distance_text,
    lat: Number(raw.lat) || 0,
    lng: Number(raw.lng) || 0,
    gajiLabel: raw.gaji_label,
    gajiMin: Number(raw.gaji_min) || 0,
    gajiMax: Number(raw.gaji_max) || 0,
    gajiSubtext: raw.gaji_subtext,
    pendidikan: raw.pendidikan || '',
    pengalaman: raw.pengalaman || '',
    syaratCv: Boolean(raw.syarat_cv),
    ringkasan: raw.ringkasan || '',
    deskripsi: Array.isArray(raw.deskripsi) ? raw.deskripsi : (raw.ringkasan ? [raw.ringkasan] : []),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    waktuKerja: raw.waktu_kerja,
    levelPekerjaan: raw.level_pekerjaan,
    fasilitasUtama: raw.fasilitas_utama,
    bidang: raw.bidang,
    alamatKantor: raw.alamat_kantor,
    batasPengajuan: raw.batas_pengajuan,
    kuotaKebutuhan: raw.kuota_kebutuhan,
    waktuProses: raw.waktu_proses,
    deskripsiDetail: raw.deskripsi_detail,
    tanggungJawab: Array.isArray(raw.tanggung_jawab) ? raw.tanggung_jawab : undefined,
    persyaratan: Array.isArray(raw.persyaratan) ? raw.persyaratan : undefined,
    benefits: Array.isArray(raw.benefits) ? raw.benefits : undefined,
    waHrd: raw.wa_hrd || '',
    emailHrd: raw.email_hrd,
    disnakerVerified: Boolean(raw.disnaker_verified),
    tanggalPosting: raw.tanggal_posting || 'Pembaruan Real-Time',
    jumlahPelamar: Number(raw.jumlah_pelamar) || 0,
    createdAt: raw.created_at || new Date().toISOString()
  };
}

function transformLamaranFromBackend(raw: any): LamaranLoker {
  return {
    id: raw.id,
    lokerId: raw.loker_id,
    lokerPosisi: raw.loker_posisi,
    lokerPerusahaan: raw.loker_perusahaan,
    pelamarNama: raw.pelamar_nama,
    pelamarNik: raw.pelamar_nik,
    pelamarWa: raw.pelamar_wa,
    pelamarEmail: raw.pelamar_email,
    pendidikanTerakhir: raw.pendidikan_terakhir,
    cvFileName: raw.cv_file_name,
    cvFileUrl: raw.cv_file_url,
    portofolioUrl: raw.portofolio_url,
    portofolioFileName: raw.portofolio_file_name,
    portofolioFileUrl: raw.portofolio_file_url,
    catatan: raw.catatan,
    status: raw.status || 'Berkas Diterima HR - Wawancara Dijadwalkan',
    substatusText: raw.substatus_text || 'Undangan via WhatsApp & Email',
    tanggalLamar: raw.tanggal_lamar || new Date().toLocaleDateString('id-ID'),
    iconType: raw.icon_type || 'building'
  };
}

function transformProfileFromBackend(raw: any): JobSeekerProfile {
  return {
    nama: raw.nama || 'Budi Pratama',
    nik: raw.nik || '3204•••• •••• 1002',
    domisili: raw.domisili || 'RW 04, Desa Mekar Mukti',
    statusKerja: raw.status_kerja || 'Siap Bekerja (Open to Work)',
    terakhirUpdate: raw.terakhir_update || 'Diperbarui 2 hari lalu',
    email: raw.email || 'budi.pratama@warga.sidesku.id',
    telepon: raw.telepon || '0812-8921-7740',
    avatarUrl: raw.avatar_url,
    cvUtama: raw.cv_utama || {
      name: 'CV_Budi_Pratama_Terbaru.pdf',
      size: '1.4 MB',
      lastUpdated: '14 Mei 2025',
      atsPassed: true
    },
    berkasPendukung: Array.isArray(raw.berkas_pendukung) ? raw.berkas_pendukung : [],
    keahlian: Array.isArray(raw.keahlian) ? raw.keahlian : [],
    preferensi: raw.preferensi || {
      area: 'Kecamatan Pusat / Sukamaju',
      radius: 'Radius maksimal 15 km dari domisili',
      gaji: 'Rp 4.800.000+ / bulan',
      gajiSub: 'Sesuai UMK wilayah & tunjangan',
      tipe: 'Penuh Waktu (Full-time)',
      tipeSub: 'Tersedia untuk sistem kontrak PKWT / tetap'
    }
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

  /**
   * Get UMKM products owned by the authenticated citizen
   */
  getMyUmkmList: async (): Promise<UmkmItem[]> => {
    try {
      const res = await api.get('/my-umkms');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data.map(transformUmkmFromBackend);
      }
    } catch (err) {
      console.warn('Failed to fetch citizen personal UMKMs:', err);
    }
    return [];
  },

  /**
   * Delete UMKM product owned by the authenticated citizen
   */
  deleteMyUmkm: async (id: string): Promise<boolean> => {
    try {
      const res = await api.delete(`/my-umkms/${id}`);
      return res.data?.success ?? true;
    } catch (err) {
      console.warn('Failed to delete citizen personal UMKM:', err);
      return false;
    }
  },

  /**
   * Fetch Loker list from backend API with localStorage fallback
   */
  getLokerList: async (params?: {
    q?: string;
    kategori?: string;
    lokasi?: string;
    tipe_kerja?: string;
    quick_filter?: string;
  }): Promise<LokerItem[]> => {
    try {
      const res = await api.get('/public/lokers', { params });
      if (res.data?.status === 'success' && Array.isArray(res.data?.data)) {
        const transformed = res.data.data.map(transformLokerFromBackend);
        try {
          localStorage.setItem('nexora_smartcity_loker_data', JSON.stringify(transformed));
        } catch {}
        return transformed;
      }
    } catch (err) {
      console.warn('Smart city Loker backend API fetch failed, falling back to local storage:', err);
    }
    return getStoredLokerList();
  },

  /**
   * Get single Loker detail by ID from backend API
   */
  getLokerDetail: async (id: string): Promise<LokerItem | null> => {
    try {
      const res = await api.get(`/public/lokers/${id}`);
      if (res.data?.status === 'success' && res.data?.data) {
        return transformLokerFromBackend(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch Loker detail from backend, falling back to local storage:', err);
    }
    return getStoredLokerById(id) || null;
  },

  /**
   * Submit fast-apply job application to backend API
   */
  submitLokerApplication: async (
    lokerId: string,
    payload: {
      pelamar_nama: string;
      pelamar_nik?: string;
      pelamar_wa: string;
      pelamar_email: string;
      cv_file_name: string;
      cv_file_url?: string;
      portofolio_url?: string;
      portofolio_file_name?: string;
      portofolio_file_url?: string;
      catatan?: string;
    }
  ): Promise<LamaranLoker> => {
    try {
      const res = await api.post(`/public/lokers/${lokerId}/apply`, payload);
      if (res.data?.status === 'success' && res.data?.data) {
        const created = transformLamaranFromBackend(res.data.data);
        submitStoredLamaran(created);
        return created;
      }
    } catch (err) {
      console.warn('Failed to submit application to backend, saving locally:', err);
    }
    const fallbackLamaran: LamaranLoker = {
      id: `lamaran-${Date.now()}`,
      lokerId: lokerId,
      lokerPosisi: 'Staf Terdaftar',
      lokerPerusahaan: 'Mitra Usaha Kota',
      pelamarNama: payload.pelamar_nama,
      pelamarNik: payload.pelamar_nik,
      pelamarWa: payload.pelamar_wa,
      pelamarEmail: payload.pelamar_email,
      cvFileName: payload.cv_file_name,
      portofolioUrl: payload.portofolio_url,
      portofolioFileName: payload.portofolio_file_name,
      catatan: payload.catatan,
      status: 'Berkas Diterima HR - Wawancara Dijadwalkan',
      substatusText: 'Undangan via WhatsApp & Email',
      tanggalLamar: new Date().toLocaleDateString('id-ID'),
      iconType: 'building'
    };
    submitStoredLamaran(fallbackLamaran);
    return fallbackLamaran;
  },

  /**
   * Get job seeker profile from backend API
   */
  getJobSeekerProfile: async (): Promise<JobSeekerProfile> => {
    try {
      const res = await api.get('/public/loker-profile');
      if (res.data?.status === 'success' && res.data?.data) {
        const transformed = transformProfileFromBackend(res.data.data);
        saveStoredJobSeekerProfile(transformed);
        return transformed;
      }
    } catch (err) {
      console.warn('Failed to fetch seeker profile from backend:', err);
    }
    return getStoredJobSeekerProfile();
  },

  /**
   * Save / update job seeker profile in backend API
   */
  saveJobSeekerProfile: async (profile: JobSeekerProfile): Promise<JobSeekerProfile> => {
    try {
      const payload = {
        nama: profile.nama,
        nik: profile.nik,
        domisili: profile.domisili,
        status_kerja: profile.statusKerja,
        email: profile.email,
        telepon: profile.telepon,
        cv_utama: profile.cvUtama,
        berkas_pendukung: profile.berkasPendukung,
        keahlian: profile.keahlian,
        preferensi: profile.preferensi
      };
      const res = await api.post('/public/loker-profile', payload);
      if (res.data?.status === 'success' && res.data?.data) {
        const updated = transformProfileFromBackend(res.data.data);
        saveStoredJobSeekerProfile(updated);
        return updated;
      }
    } catch (err) {
      console.warn('Failed to save seeker profile to backend:', err);
    }
    saveStoredJobSeekerProfile(profile);
    return profile;
  },

  /**
   * Get submitted applications list from backend API
   */
  getLokerApplications: async (): Promise<LamaranLoker[]> => {
    try {
      const res = await api.get('/public/loker-applications');
      if (res.data?.status === 'success' && Array.isArray(res.data?.data)) {
        return res.data.data.map(transformLamaranFromBackend);
      }
    } catch (err) {
      console.warn('Failed to fetch applications from backend:', err);
    }
    return getStoredLamaranList();
  },
};
