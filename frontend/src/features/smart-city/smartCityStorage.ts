import { UmkmItem, HunianItem, LokerItem, LamaranLoker } from './types';

// Pusat Kota Kediri / Simpang Lima Gumul (SLG)
export const KEDIRI_DEFAULT_COORDS = {
  lat: -7.8166,
  lng: 112.0118,
  label: 'Balai Kota / Pusat Kediri'
};

/**
 * Formula Haversine untuk kalkulasi jarak radius bumi dalam kilometer
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

/**
 * Format representasi jarak (meter jika < 1km, km jika >= 1km)
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm <= 0) return '0 m';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// ============================================================================
// SEED DATA: UMKM (Pure Dynamic Backend API - 50 items seeded in Laravel DB)
// ============================================================================
const SEED_UMKM: UmkmItem[] = [];

// ============================================================================
// SEED DATA: KOS & HUNIAN
// ============================================================================
const SEED_KOS: HunianItem[] = [
  {
    id: 'kos-1',
    nama: 'Kos Putri Griya Asri Doko (Dekat SLG)',
    tipe: 'Kos Putri',
    harga: 650000,
    periode: 'bulan',
    alamat: 'Jl. Kenanga No. 18, RT 02 / RW 01, Dusun Krajan',
    dusun: 'Dusun Krajan',
    rtRw: 'RT 02 / RW 01',
    lat: -7.8185,
    lng: 112.0142,
    sisaKamar: 3,
    deskripsi: 'Kos putri dengan lingkungan bersih, aman, dan tertib. Dekat dengan RSUD Simpang Lima Gumul dan akses kuliner 24 jam. Bebas jam malam khusus karyawati dengan kunci gerbang masing-masing.',
    fasilitas: ['WiFi Cepat 50 Mbps', 'Kamar Mandi Dalam', 'Kasur Springbed', 'Lemari Pakaian', 'Dapur Bersama', 'CCTV 24 Jam'],
    pemilikNama: 'Ibu Hj. Siti Masitoh',
    pemilikWa: '6281234567801',
    qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918KOS_GRIYA_ASRI6006KEDIRI62070703A016304E1F2',
    fotoUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
    terverifikasi: true,
    createdAt: '2026-10-01'
  },
  {
    id: 'kos-2',
    nama: 'Kos Putra Mahasiswa & Karyawan Mandiri',
    tipe: 'Kos Putra',
    harga: 500000,
    periode: 'bulan',
    alamat: 'Jl. Melati RT 04 / RW 02, Dekat Kampus IIK',
    dusun: 'Dusun Doko Tengah',
    rtRw: 'RT 04 / RW 02',
    lat: -7.812,
    lng: 112.008,
    sisaKamar: 2,
    deskripsi: 'Lokasi strategis dekat kampus IIK dan Uniska Kediri. Lingkungan kondusif untuk belajar, parkiran motor dalam berpagar tinggi, air sumur jernih, dan WiFi kencang 100 Mbps.',
    fasilitas: ['WiFi 100 Mbps', 'Parkir Motor Luas', 'Kasur Busa Tebal', 'Meja Belajar', 'Air Bersih PDAM'],
    pemilikNama: 'Bapak Bambang Suprayogi',
    pemilikWa: '6281234567802',
    fotoUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80',
    terverifikasi: true,
    createdAt: '2026-10-03'
  },
  {
    id: 'kos-3',
    nama: 'Paviliun Eksklusif AC Campur Simpang Lima',
    tipe: 'Kos Campur',
    harga: 1250000,
    periode: 'bulan',
    alamat: 'Jl. Erlangga No. 7, Kawasan SLG Kediri',
    lat: -7.825,
    lng: 112.025,
    sisaKamar: 4,
    deskripsi: 'Paviliun mewah modern berpendingin AC di kawasan elit Simpang Lima Gumul. Parkir mobil luas, water heater kamar mandi pribadi, keamanan satpam 24 jam.',
    fasilitas: ['AC Inverter Dingin', 'Water Heater', 'Kamar Mandi Dalam', 'Smart TV', 'Parkir Mobil Aman', 'Security 24 Jam'],
    pemilikNama: 'dr. Hendra Pratama',
    pemilikWa: '6281234567803',
    qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918PAVILIUN_SLG6006KEDIRI62070703A016304E1F2',
    fotoUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    terverifikasi: true,
    createdAt: '2026-10-08'
  },
  {
    id: 'kos-4',
    nama: 'Kontrakan Rumah Asri 3 Kamar Tidur',
    tipe: 'Kontrakan Rumah',
    harga: 14000000,
    periode: 'tahun',
    alamat: 'Perum Doko Indah Blok C No. 12',
    lat: -7.82,
    lng: 112.015,
    sisaKamar: 1,
    deskripsi: 'Rumah sewa kontrakan siap huni untuk keluarga. Ruang tamu luas, dapur kitchen set, halaman depan rindang, jalan perumahan paving lebar 2 mobil papasan.',
    fasilitas: ['3 Kamar Tidur', '2 Kamar Mandi', 'Garasi Mobil', 'Taman Depan', 'Listrik 2200 VA', 'Air Sumur Bor Bening'],
    pemilikNama: 'H. Sudarsono',
    pemilikWa: '6281234567804',
    fotoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    terverifikasi: true,
    createdAt: '2026-10-12'
  }
];

// ============================================================================
// SEED DATA: LOKER
// ============================================================================
const SEED_LOKER: LokerItem[] = [
  {
    id: 'loker-1',
    posisi: 'Staf Administrasi & Kasir Toko Sembako',
    perusahaan: 'CV Berkah Pangan Mandiri',
    kategori: 'Administrasi',
    tipeKerja: 'Full-time',
    gajiMin: 2300000,
    gajiMax: 3000000,
    lokasi: 'Jl. Raya Doko No. 15, Kediri',
    lat: -7.8185,
    lng: 112.0142,
    pendidikan: 'SMA / SMK Sederajat',
    pengalaman: 'Fresh graduate / 1 tahun',
    syaratCv: true,
    deskripsi: [
      'Mencatat pembukuan harian keluar masuk kas toko',
      'Melayani transaksi pembayaran kasir dan cetak nota',
      'Mengoperasikan software kasir POS berbasis tablet',
      'Jujur, teliti, dan berpenampilan rapi'
    ],
    waHrd: '6281234567810',
    emailHrd: 'hrd@berkahpangan.co.id',
    disnakerVerified: true,
    tanggalPosting: 'Hari ini',
    jumlahPelamar: 14,
    createdAt: '2026-11-01'
  },
  {
    id: 'loker-2',
    posisi: 'Barista & Front Crew Cafe Kopi Kelud',
    perusahaan: 'Kedai Kopi Kelud Semesta',
    kategori: 'F&B / Kuliner',
    tipeKerja: 'Part-time',
    gajiMin: 1500000,
    gajiMax: 2200000,
    lokasi: 'Kawasan Wisata SLG Kediri',
    lat: -7.825,
    lng: 112.025,
    pendidikan: 'Minimal SMA/SMK',
    pengalaman: 'Terbuka untuk pemula yang ingin belajar',
    syaratCv: true,
    deskripsi: [
      'Menyeduh kopi espresso based dan manual brew V60',
      'Menjaga kebersihan bar kopi dan area pengunjung',
      'Komunikatif, ramah, dan ramah terhadap pelanggan',
      'Shift fleksibel cocok untuk mahasiswa'
    ],
    waHrd: '6281234567811',
    disnakerVerified: true,
    tanggalPosting: '2 hari lalu',
    jumlahPelamar: 26,
    createdAt: '2026-11-03'
  },
  {
    id: 'loker-3',
    posisi: 'Teknisi Mekanik Motor Ringan & Ganti Oli',
    perusahaan: 'Bengkel Motor Rejeki Jaya',
    kategori: 'Teknik & Bengkel',
    tipeKerja: 'Full-time',
    gajiMin: 2500000,
    gajiMax: 3500000,
    lokasi: 'Jl. KH Wachid Hasyim No. 40, Kediri',
    lat: -7.8105,
    lng: 112.0054,
    pendidikan: 'SMK Otomotif / TKR / TBSM',
    pengalaman: 'Minimal 1 tahun mekanik motor matic/bebek',
    syaratCv: false,
    deskripsi: [
      'Melakukan servis rutin tune-up motor injeksi',
      'Penggantian kampas rem, CVT belt, dan oli berkala',
      'Membantu troubleshooting kelistrikan ringan'
    ],
    waHrd: '6281234567812',
    disnakerVerified: true,
    tanggalPosting: '3 hari lalu',
    jumlahPelamar: 8,
    createdAt: '2026-11-05'
  },
  {
    id: 'loker-4',
    posisi: 'Frontend Developer React & Web Designer',
    perusahaan: 'Studio Digital Kediri Kreatif',
    kategori: 'IT & Digital',
    tipeKerja: 'Freelance',
    gajiMin: 3500000,
    gajiMax: 5000000,
    lokasi: 'Work From Home / Remote (Kediri)',
    lat: -7.8166,
    lng: 112.0118,
    pendidikan: 'D3 / S1 / Portofolio Terbukti',
    pengalaman: 'Memiliki proyek React/Tailwind/TypeScript',
    syaratCv: true,
    deskripsi: [
      'Membangun antarmuka web modern dengan React + Tailwind CSS',
      'Menerjemahkan prototipe Figma menjadi kode responsif',
      'Kolaborasi tim melalui GitHub dan REST API'
    ],
    waHrd: '6281234567813',
    emailHrd: 'karir@kedirikreatif.id',
    disnakerVerified: true,
    tanggalPosting: '5 hari lalu',
    jumlahPelamar: 31,
    createdAt: '2026-11-06'
  }
];

// ============================================================================
// STORAGE HANDLERS WITH LOCALSTORAGE BACKING
// ============================================================================

const STORAGE_KEY_UMKM = 'nexora_smartcity_umkm_v3';
const STORAGE_KEY_KOS = 'nexora_smartcity_kos_data';
const STORAGE_KEY_LOKER = 'nexora_smartcity_loker_data';
const STORAGE_KEY_LAMARAN = 'nexora_smartcity_lamaran_data';

// --- UMKM ---
export function getStoredUmkmList(): UmkmItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UMKM);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return SEED_UMKM;
}

export function saveStoredUmkmItem(item: UmkmItem): UmkmItem[] {
  const current = getStoredUmkmList();
  const index = current.findIndex(u => u.id === item.id);
  let updated: UmkmItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [item, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEY_UMKM, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function deleteStoredUmkmItem(id: string): UmkmItem[] {
  const current = getStoredUmkmList();
  const updated = current.filter(u => u.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_UMKM, JSON.stringify(updated));
  } catch {}
  return updated;
}

// --- KOS ---
export function getStoredKosList(): HunianItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return SEED_KOS;
}

export function saveStoredKosItem(item: HunianItem): HunianItem[] {
  const current = getStoredKosList();
  const index = current.findIndex(k => k.id === item.id);
  let updated: HunianItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [item, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEY_KOS, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function deleteStoredKosItem(id: string): HunianItem[] {
  const current = getStoredKosList();
  const updated = current.filter(k => k.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_KOS, JSON.stringify(updated));
  } catch {}
  return updated;
}

// --- LOKER ---
export function getStoredLokerList(): LokerItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOKER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return SEED_LOKER;
}

export function saveStoredLokerItem(item: LokerItem): LokerItem[] {
  const current = getStoredLokerList();
  const index = current.findIndex(l => l.id === item.id);
  let updated: LokerItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [item, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEY_LOKER, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function deleteStoredLokerItem(id: string): LokerItem[] {
  const current = getStoredLokerList();
  const updated = current.filter(l => l.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_LOKER, JSON.stringify(updated));
  } catch {}
  return updated;
}

// --- LAMARAN LOKER ---
export function getStoredLamaranList(): LamaranLoker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAMARAN);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function submitStoredLamaran(lamaran: LamaranLoker): LamaranLoker[] {
  const current = getStoredLamaranList();
  const updated = [lamaran, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_LAMARAN, JSON.stringify(updated));
  } catch {}
  return updated;
}
