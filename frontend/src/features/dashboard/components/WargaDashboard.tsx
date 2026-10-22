import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  QrCode, 
  Send, 
  Printer, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle, 
  FileCheck2, 
  Download, 
  Search, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  ArrowRight, 
  CreditCard, 
  HeartHandshake, 
  Users, 
  Briefcase, 
  Layers, 
  FileSpreadsheet, 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  Paperclip, 
  X, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Edit3,
  Loader2,
  Copy,
  Info,
  FolderCheck,
  Wallet,
  AlertTriangle,
  HeartPulse,
  HandHeart
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { useAuth } from '@/shared/context/AuthContext';
import { SuratRequest, SuratType, BantuanPenerima } from '@/shared/types';
import { CetakSuratModal } from './CetakSuratModal';
import { SuratTrackingModal } from './SuratTrackingModal';
import { CameraUploadModal } from '@/shared/components/CameraUploadModal';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { BerkasKependudukanView } from './BerkasKependudukanView';
import { getSafeMediaUrl } from '@/shared/utils/mediaUrl';
import { AspirasiPengaduanWargaView } from './AspirasiPengaduanWargaView';
import { Pagination } from '@/shared/components/Pagination';
import {
  DonutGauge,
  AreaSplineChart,
  BarActivityChart,
  MiniCalendarWidget,
  MetricStatCard,
} from '@/shared/components/charts';

export interface FormLampiranItem {
  id: string;
  url: string;
  nama: string;
  tipe?: string;
}

export const parseLampiranDokumen = (val?: string | any[] | null): Array<{ url: string; nama: string }> => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item, idx) => 
      typeof item === 'string' 
        ? { url: getSafeMediaUrl(item), nama: `Dokumen ${idx + 1}` } 
        : { url: getSafeMediaUrl(item.url || item.file || ''), nama: item.nama || `Dokumen ${idx + 1}` }
    ).filter(d => !!d.url);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => 
            typeof item === 'string' 
              ? { url: getSafeMediaUrl(item), nama: `Dokumen ${idx + 1}` } 
              : { url: getSafeMediaUrl(item.url || item.file || ''), nama: item.nama || `Dokumen ${idx + 1}` }
          ).filter(d => !!d.url);
        }
        if (parsed && typeof parsed === 'object') {
          return [{ url: getSafeMediaUrl(parsed.url || parsed.file || ''), nama: parsed.nama || 'Dokumen Lampiran' }];
        }
      } catch {
        // fallback
      }
    }
    return [{ url: getSafeMediaUrl(val), nama: 'Dokumen Lampiran' }];
  }
  return [];
};

interface WargaDashboardProps {
  activeSubmenu?: string;
  onNavigate?: (submenu: string) => void;
}

// Complete Official Catalog of Village Letters
const defaultSuratTypes: SuratType[] = [
  {
    id: 1,
    kode_surat: 'SKTP',
    nama_surat: 'Surat Pembuatan / E-KTP',
    format_nomor: '471/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto Kartu Keluarga (KK)', 'Surat Pengantar RT/RW', 'KTP Lama (bila rusak/ganti)'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 2,
    kode_surat: 'SKKK',
    nama_surat: 'Surat Kartu Keluarga (KK Baru / Perubahan)',
    format_nomor: '472/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KK Asli Lama', 'Buku Nikah / Akta Cerai', 'Surat Keterangan Lahir / Pindah'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 3,
    kode_surat: 'SKTM',
    nama_surat: 'Surat Keterangan Tidak Mampu (SKTM)',
    format_nomor: '401/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP Pemohon', 'Foto Kartu Keluarga', 'Surat Pengantar RT'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 4,
    kode_surat: 'SKD',
    nama_surat: 'Surat Keterangan Domisili Warga / Lembaga',
    format_nomor: '470/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP', 'Foto KK'],
    masa_berlaku_hari: 90,
    is_active: true,
  },
  {
    id: 5,
    kode_surat: 'SKU',
    nama_surat: 'Surat Keterangan Usaha (SKU)',
    format_nomor: '503/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP', 'Foto KK', 'Foto Tempat/Aktivitas Usaha'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 6,
    kode_surat: 'SKCK',
    nama_surat: 'Surat Pengantar SKCK (Catatan Kepolisian)',
    format_nomor: '300/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP', 'Foto KK', 'Pas Foto 4x6'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 7,
    kode_surat: 'SKL',
    nama_surat: 'Surat Kelahiran / Akta Lahir',
    format_nomor: '474.1/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Surat Keterangan Lahir Bidan/RS', 'KTP Ayah & Ibu', 'Buku Nikah Asli', 'KK Asli'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 8,
    kode_surat: 'SKM',
    nama_surat: 'Surat Kematian',
    format_nomor: '474.3/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Surat Kematian RS / Saksi RT', 'KTP & KK Almarhum', 'KTP Pelapor'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 9,
    kode_surat: 'SKBM',
    nama_surat: 'Surat Belum Pernah Menikah (N1-N4)',
    format_nomor: '474.2/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP Pemohon', 'KK Asli', 'Pernyataan Belum Menikah Bermaterai'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 10,
    kode_surat: 'SKP',
    nama_surat: 'Surat Pindah Domisili (SKPWNI)',
    format_nomor: '475/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP & KK Asli', 'Alamat Tujuan Lengkap', 'Surat Bebas Tanggungan RT'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 11,
    kode_surat: 'SKBN',
    nama_surat: 'Surat Beda Nama (Ijazah / KTP / KK)',
    format_nomor: '470/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP & KK Asli', 'Dokumen/Ijazah Beda Nama', 'Surat Pengantar RT'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 12,
    kode_surat: 'SKPH',
    nama_surat: 'Surat Penghasilan Orang Tua / Wali',
    format_nomor: '401/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP Orang Tua', 'KK Asli', 'Rincian Penghasilan / Slip Usaha'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 13,
    kode_surat: 'SKAW',
    nama_surat: 'Surat Keterangan Ahli Waris',
    format_nomor: '470/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Surat Kematian Almarhum', 'Buku Nikah / Akta Cerai', 'KTP & KK Ahli Waris'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 14,
    kode_surat: 'SKIK',
    nama_surat: 'Surat Izin Keramaian / Hajatan ',
    format_nomor: '300/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP Tuan Rumah', 'Surat Persetujuan Tetangga Sekitar', 'Rekomendasi RT/RW'],
    masa_berlaku_hari: 14,
    is_active: true,
  },
];

interface ActionToast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export const WargaDashboard: React.FC<WargaDashboardProps> = ({ activeSubmenu = 'beranda', onNavigate }) => {
  const { user } = useAuth();
  const [surats, setSurats] = useState<SuratRequest[]>([]);
  const [types, setTypes] = useState<SuratType[]>(defaultSuratTypes);
  const [bansos, setBansos] = useState<BantuanPenerima[]>([]);
  const [kasSummary, setKasSummary] = useState<any>(null);
  const [desa, setDesa] = useState<any>(null);
  const [masterDokumen, setMasterDokumen] = useState<any>(null);
  const [wargaAgendas, setWargaAgendas] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Detect route parameter /dashboard/ajukan/:id and query ?editSuratId=
  const ajukanMatch = location.pathname.match(/\/dashboard\/ajukan\/(\d+)/);
  const routeSuratTypeId = ajukanMatch ? Number(ajukanMatch[1]) : null;
  const editSuratIdParam = searchParams.get('editSuratId');
  const editingSurat = editSuratIdParam ? surats.find(s => s.id === Number(editSuratIdParam)) : null;

  // Pagination for catalog cards (6 per page)
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  // Replacing Photo & Delete confirmation state
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [suratToDelete, setSuratToDelete] = useState<SuratRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Floating Action Toast Notification
  const [actionToast, setActionToast] = useState<ActionToast | null>(null);
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setActionToast({ id: String(Date.now()), type, title, message });
  };

  useEffect(() => {
    if (actionToast) {
      const timer = setTimeout(() => {
        setActionToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [actionToast]);

  // Search and category filters for Ajukan Surat
  const [suratSearch, setSuratSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | 'Kependudukan' | 'Sosial' | 'Keluarga' | 'Usaha' | 'Hukum'>('Semua');
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'semua' | 'selesai' | 'proses' | 'ditolak' | 'arsip'>('arsip');
  const [historyPage, setHistoryPage] = useState(1);

  useEffect(() => {
    setHistoryPage(1);
  }, [historySearch, historyStatusFilter]);

  // Form State for Ajukan Surat
  const [selectedTypeId, setSelectedTypeId] = useState<number>(1);
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitSuccessModal, setSubmitSuccessModal] = useState<{
    isEdit: boolean;
    surat: SuratRequest | null;
  } | null>(null);
  const [copiedResi, setCopiedResi] = useState(false);

  // Camera & Multi-Document Attachment State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraModalTitle, setCameraModalTitle] = useState('Ambil Foto Dokumen / KTP');
  const [cameraModalInitialMode, setCameraModalInitialMode] = useState<'camera' | 'upload'>('camera');
  const [lampiranCategory, setLampiranCategory] = useState<string>('Foto KTP');
  const [lampiranList, setLampiranList] = useState<FormLampiranItem[]>([]);
  const [previewGallery, setPreviewGallery] = useState<Array<{ url: string; nama: string }>>([]);
  const [galleryIndex, setGalleryIndex] = useState<number>(0);
  const fileUploadInputRef = useRef<HTMLInputElement | null>(null);
  const cameraDirectInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to attach or update photos in lampiranList
  const attachPhoto = (base64: string, fileName?: string) => {
    if (replacingPhotoId) {
      setLampiranList(prev => prev.map(item => 
        item.id === replacingPhotoId ? { ...item, url: base64, nama: fileName || item.nama } : item
      ));
      setReplacingPhotoId(null);
      showToast('success', 'Foto Diperbarui', 'Foto lampiran berhasil diganti.');
    } else {
      const newDoc: FormLampiranItem = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        url: base64,
        nama: fileName || `Foto Dokumen #${lampiranList.length + 1}`,
      };
      setLampiranList(prev => [...prev, newDoc]);
      showToast('success', 'Foto Terlampir', `${newDoc.nama} berhasil ditambahkan.`);
    }
  };

  // Direct Gallery / File Upload Handler (Opens phone gallery directly without modal)
  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_FILE_SIZE) {
      showToast('error', 'Ukuran Berkas Terlalu Besar', 'Maksimal ukuran foto adalah 5 MB.');
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      showToast('error', 'Format Tidak Didukung', 'Mohon gunakan format gambar JPG, PNG, atau WebP.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.src = result;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.78);
            attachPhoto(compressed, file.name);
          } else {
            attachPhoto(result, file.name);
          }
        } catch {
          attachPhoto(result, file.name);
        }
      };
      img.onerror = () => {
        attachPhoto(result, file.name);
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Lock body scroll and handle ESC key for delete confirm and preview gallery
  useEffect(() => {
    if (isDeleteConfirmOpen || previewGallery.length > 0) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsDeleteConfirmOpen(false);
          setSuratToDelete(null);
          setPreviewGallery([]);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isDeleteConfirmOpen, previewGallery.length]);

  // Reset catalog pagination on search or category filter change
  useEffect(() => {
    setCatalogPage(1);
  }, [suratSearch, selectedCategory]);

  // Pre-fill form on edit mode or route type change
  useEffect(() => {
    if (editingSurat) {
      setSelectedTypeId(editingSurat.surat_type_id);
      setKeperluan(editingSurat.keperluan || '');
      const docs = parseLampiranDokumen(editingSurat.file_lampiran);
      setLampiranList(docs.map((d, i) => ({
        id: `existing-${i}-${Date.now()}`,
        url: d.url,
        nama: d.nama,
      })));
      setSubmitSuccess(false);
    } else if (routeSuratTypeId) {
      setSelectedTypeId(routeSuratTypeId);
      setKeperluan('');
      setLampiranList([]);
      setSubmitSuccess(false);
    }
  }, [routeSuratTypeId, editingSurat]);

  // Print Letter & Tracking Detail Modals
  const [printSurat, setPrintSurat] = useState<SuratRequest | null>(null);
  const [selectedTrackingSurat, setSelectedTrackingSurat] = useState<SuratRequest | null>(null);

  // New Aduan State
  const [aduanJudul, setAduanJudul] = useState('');
  const [aduanKategori, setAduanKategori] = useState('Infrastruktur');
  const [aduanDeskripsi, setAduanDeskripsi] = useState('');

  // Active sub tab on Beranda
  const [berandaTab, setBerandaTab] = useState<'surat_aktif' | 'bansos' | 'kas' | 'aduan'>('surat_aktif');

  useEffect(() => {
    fetchWargaData();
  }, []);

  const fetchWargaData = async () => {
    try {
      const [suratRes, typesRes, bansosRes, kasRes, desaRes, dokRes, agendaRes] = await Promise.all([
        api.get('/surats'),
        api.get('/surat-types'),
        api.get('/bansos'),
        api.get('/kas-rt'),
        api.get('/settings/desa'),
        api.get('/warga/dokumen').catch(() => ({ data: { success: false } })),
        api.get('/agendas').catch(() => api.get('/public/agendas')).catch(() => ({ data: { data: [] } })),
      ]);

      if (suratRes.data?.success && suratRes.data.data) setSurats(suratRes.data.data);
      if (typesRes.data?.success && typesRes.data.data?.length > 0) {
        setTypes(typesRes.data.data);
      }
      if (bansosRes.data?.success && bansosRes.data.data) setBansos(bansosRes.data.data);
      if (kasRes.data?.success) setKasSummary(kasRes.data);
      if (desaRes.data?.success && desaRes.data.data) setDesa(desaRes.data.data);
      if (dokRes.data?.success && dokRes.data.data) setMasterDokumen(dokRes.data.data);
      if (agendaRes.data?.data && Array.isArray(agendaRes.data.data)) {
        const filtered = agendaRes.data.data.filter((ag: any) => {
          const p = (ag.peserta || '').trim();
          return p !== 'RT' && p !== 'RW' && p !== 'RT & RW';
        });
        setWargaAgendas(filtered);
      }
    } catch {
      //
    }
  };

  const handleCreateOrUpdateSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double click / spamming

    const typeId = routeSuratTypeId || selectedTypeId;
    if (!typeId || !keperluan.trim()) {
      showToast('error', 'Formulir Belum Lengkap', 'Mohon pilih jenis surat dan isi keperluan pengajuan dengan jelas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payloadLampiran = lampiranList.length > 0
        ? lampiranList.map(item => ({ url: item.url, nama: item.nama }))
        : null;

      if (editingSurat) {
        const res = await api.put(`/surats/${editingSurat.id}`, {
          surat_type_id: typeId,
          keperluan: keperluan.trim(),
          file_lampiran: payloadLampiran,
        });
        if (res.data && res.data.success) {
          setSubmitSuccess(true);
          setSubmitSuccessModal({
            isEdit: true,
            surat: res.data.data || editingSurat,
          });
          await fetchWargaData();
          showToast(
            'success',
            'Perubahan Berhasil Disimpan',
            `Data pengajuan ${res.data.data?.nomor_resi || editingSurat.nomor_resi} berhasil diperbarui.`
          );
        } else {
          showToast('error', 'Gagal Memperbarui Surat', res.data?.message || 'Respons server tidak valid.');
        }
      } else {
        const idempotencyKey = `warga_req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const res = await api.post('/surats', {
          surat_type_id: typeId,
          keperluan: keperluan.trim(),
          file_lampiran: payloadLampiran,
        }, {
          headers: { 'X-Idempotency-Key': idempotencyKey }
        });
        if (res.data && res.data.success) {
          setSubmitSuccess(true);
          setSubmitSuccessModal({
            isEdit: false,
            surat: res.data.data,
          });
          setKeperluan('');
          setLampiranList([]);
          await fetchWargaData();
          showToast(
            'success',
            'Permohonan Berhasil Dikirim',
            `Surat permohonan (${res.data.data?.nomor_resi || ''}) berhasil diajukan dan masuk antrean RT.`
          );
        } else {
          showToast('error', 'Gagal Mengirim Permohonan', res.data?.message || 'Respons server tidak valid.');
        }
      }
    } catch (err: any) {
      showToast(
        'error',
        'Gagal Memproses Surat',
        err.response?.data?.message || 'Terjadi kesalahan sistem saat memproses permohonan surat.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSurat = async () => {
    if (!suratToDelete || isDeleting) return;
    setIsDeleting(true);
    const targetNama = suratToDelete.surat_type?.nama_surat || 'Surat Permohonan';
    const targetResi = suratToDelete.nomor_resi;
    try {
      const res = await api.delete(`/surats/${suratToDelete.id}`);
      if (res.data?.success) {
        setIsDeleteConfirmOpen(false);
        setSuratToDelete(null);
        await fetchWargaData();
        showToast(
          'success',
          'Permohonan Berhasil Dibatalkan',
          `Pengajuan "${targetNama}" (${targetResi}) telah berhasil dihapus dari antrean verifikasi.`
        );
      } else {
        showToast('error', 'Gagal Membatalkan Permohonan', res.data?.message || 'Gagal membatalkan permohonan surat.');
      }
    } catch (err: any) {
      showToast(
        'error',
        'Gagal Membatalkan Permohonan',
        err.response?.data?.message || 'Terjadi kesalahan sistem saat membatalkan permohonan.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReapplySurat = (suratTypeId: number, oldKeperluan: string) => {
    setSelectedTrackingSurat(null);
    setSelectedTypeId(suratTypeId);
    setKeperluan(oldKeperluan || '');
    setLampiranList([]);
    if (onNavigate) {
      onNavigate('ajukan_surat');
    }
    navigate(`/dashboard/ajukan/${suratTypeId}`);
    showToast(
      'info',
      'Pengajuan Ulang Surat',
      'Data keperluan sebelumnya telah dimuat. Silakan periksa kembali berkas persyaratan dan ajukan permohonan baru.'
    );
  };

  const p = user?.warga_profile;

  // Filter letter types by search and category
  const filteredTypes = types.filter((t) => {
    const matchSearch = t.nama_surat.toLowerCase().includes(suratSearch.toLowerCase()) ||
                        t.kode_surat.toLowerCase().includes(suratSearch.toLowerCase()) ||
                        (t.persyaratan_json && t.persyaratan_json.some(p => p.toLowerCase().includes(suratSearch.toLowerCase())));

    if (!matchSearch) return false;

    if (selectedCategory === 'Semua') return true;
    if (selectedCategory === 'Kependudukan') return ['SKTP', 'SKKK', 'SKD', 'SKP', 'SKBN'].includes(t.kode_surat);
    if (selectedCategory === 'Sosial') return ['SKTM', 'SKPH'].includes(t.kode_surat);
    if (selectedCategory === 'Keluarga') return ['SKL', 'SKM', 'SKBM', 'SKAW'].includes(t.kode_surat);
    if (selectedCategory === 'Usaha') return ['SKU'].includes(t.kode_surat);
    if (selectedCategory === 'Hukum') return ['SKCK', 'SKIK'].includes(t.kode_surat);
    return true;
  });

  // Filtered lists
  const pendingSurats = surats.filter(s => ['pending_rt', 'approved_rt', 'pending_rw', 'processed_sekdes', 'pending_kades'].includes(s.status));
  const completedSurats = surats.filter(s => s.status === 'completed');
  const rejectedSurats = surats.filter(s => ['rejected', 'rejected_rt', 'rejected_kades'].includes(s.status));
  const searchedHistory = surats.filter(s => {
    const matchKeyword = s.nomor_resi.toLowerCase().includes(historySearch.toLowerCase()) ||
      s.surat_type?.nama_surat.toLowerCase().includes(historySearch.toLowerCase()) ||
      s.keperluan.toLowerCase().includes(historySearch.toLowerCase());
    
    if (!matchKeyword) return false;

    if (historyStatusFilter === 'selesai') return s.status === 'completed';
    if (historyStatusFilter === 'proses') return ['pending_rt', 'approved_rt', 'pending_rw', 'processed_sekdes', 'pending_kades'].includes(s.status);
    if (historyStatusFilter === 'ditolak') return ['rejected', 'rejected_rt', 'rejected_kades'].includes(s.status);
    if (historyStatusFilter === 'arsip') return ['completed', 'rejected', 'rejected_rt', 'rejected_kades'].includes(s.status);
    return true;
  });

  const paginatedHistory = searchedHistory.slice((historyPage - 1) * 8, historyPage * 8);

  // Submenu router renderer
  const renderSubmenuContent = () => {
    // Berkas Kependudukan (Master Berkas Sekali Upload)
    if (activeSubmenu === 'berkas_kependudukan' || activeSubmenu === 'berkas') {
      return (
        <BerkasKependudukanView
          onApplySurat={() => {
            if (onNavigate) {
              onNavigate('ajukan_surat');
            } else {
              navigate('/dashboard/ajukan');
            }
          }}
        />
      );
    }

    // Aspirasi & Pengaduan Warga
    if (['aspirasi_warga', 'aspirasi', 'pengaduan'].includes(activeSubmenu)) {
      return <AspirasiPengaduanWargaView />;
    }

    // Form & Katalog Pengajuan Surat
    if (activeSubmenu === 'ajukan_surat') {
      const isFormMode = Boolean(routeSuratTypeId || editingSurat);
      const currentType = types.find(t => t.id === (editingSurat ? editingSurat.surat_type_id : (routeSuratTypeId || selectedTypeId))) || types[0];

      if (isFormMode) {
        return (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in font-sans">
            {/* Top Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (editingSurat) {
                    navigate('/dashboard/status-surat');
                  } else {
                    navigate('/dashboard/ajukan');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs press-down"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
                <span>Kembali ke Pilihan Surat</span>
              </button>
            </div>

            {/* Edit Mode Alert Banner (Clean White) */}
            {editingSurat && (
              <div className="p-4 sm:p-5 rounded-3xl bg-white border border-amber-200/90 text-slate-800 flex items-start gap-3.5 shadow-2xs">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm text-slate-900">
                    Mode Edit Pengajuan (No. Resi: {editingSurat.nomor_resi})
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Data lama Anda telah otomatis terisi pada formulir ini. Silakan perbaiki data yang salah atau ubah/hapus foto dokumen yang kurang jernih, lalu klik <strong>Simpan Perubahan Surat</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Success Banner */}
            {submitSuccess && (
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-scale-up shadow-xs">
                <div className="flex items-center gap-2 font-black text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{editingSurat ? 'Perubahan Pengajuan Berhasil Disimpan!' : 'Pengajuan Surat Berhasil Dikirim!'}</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {editingSurat 
                    ? 'Data permohonan surat Anda telah berhasil diperbarui dan dialirkan ke antrean verifikasi Ketua RT 01.'
                    : 'Permohonan surat Anda telah otomatis masuk ke antrean verifikasi Ketua RT 01. Anda dapat memantau progresnya di menu Status Surat.'}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/status-surat')}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-xs hover:bg-emerald-800 cursor-pointer"
                  >
                    Pantau di Status Surat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(false);
                      navigate('/dashboard/ajukan');
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-emerald-900 border border-emerald-300 font-bold text-xs shadow-2xs hover:bg-emerald-50 cursor-pointer"
                  >
                    Ajukan Surat Lain
                  </button>
                </div>
              </div>
            )}

            {/* Surat Type Header Info */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-black">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {currentType.kode_surat}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Masa Berlaku: {currentType.masa_berlaku_hari} Hari</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      {currentType.nama_surat}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Requirements summary checklist */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="font-black text-slate-700 flex items-center gap-1.5">
                  <span>Persyaratan Berkas Resmi:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentType.persyaratan_json && currentType.persyaratan_json.length > 0 ? (
                    currentType.persyaratan_json.map((syarat, sIdx) => (
                      <span key={sIdx} className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{syarat}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">KTP & Kartu Keluarga</span>
                  )}
                </div>
              </div>

              {/* Submission Form */}
              <form onSubmit={handleCreateOrUpdateSurat} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pemohon (Sesuai Akun Anda):</label>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                    <div className="font-black text-slate-900">{p?.nama_lengkap || user?.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">NIK: {p?.nik || '3506041505840001'}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Keperluan / Keterangan Pengajuan:</label>
                  <textarea
                    required
                    rows={4}
                    value={keperluan}
                    onChange={(e) => setKeperluan(e.target.value)}
                    placeholder="Contoh: Persyaratan pembuatan KTP baru karena rusak/hilang di Kantor Kecamatan Ngasem..."
                    className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs"
                  />
                </div>

                {/* Status Arsip Kependudukan Desa (Otomatis & Tenang) */}
                {(() => {
                  const hasKtp = Boolean(masterDokumen?.stats?.has_ktp ?? masterDokumen?.dokumen?.foto_ktp);
                  const hasKk = Boolean(masterDokumen?.stats?.has_kk ?? masterDokumen?.dokumen?.foto_kk);
                  if (hasKtp || hasKk) {
                    return (
                      <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-2.5 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">
                          Identitas <strong className="font-bold">{[hasKtp && 'KTP', hasKk && 'Kartu Keluarga'].filter(Boolean).join(' & ')}</strong> Anda telah terhubung otomatis dari arsip kependudukan desa.
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Bagian Lampiran Dokumen Bersih & Ramah Pemula */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Foto / Lampiran Dokumen</span>
                      </label>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                      Opsional
                    </span>
                  </div>

                  {/* Daftar Foto Terlampir */}
                  {lampiranList.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>Dokumen Terlampir ({lampiranList.length}):</span>
                        <span className="text-[10px] text-slate-400">Ketuk foto untuk melihat pratinjau</span>
                      </div>

                      <div className="space-y-2">
                        {lampiranList.map((item, idx) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 flex items-center justify-between gap-3 transition-all"
                          >
                            <div
                              onClick={() => {
                                setPreviewGallery(lampiranList.map(l => ({ url: l.url, nama: l.nama })));
                                setGalleryIndex(idx);
                              }}
                              className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                              title="Ketuk untuk melihat foto ukuran penuh"
                            >
                              <div className="relative w-11 h-11 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 shadow-2xs group-hover:ring-2 group-hover:ring-emerald-500 transition-all">
                                <img
                                  src={item.url}
                                  alt={item.nama}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="w-3.5 h-3.5 text-white drop-shadow" />
                                </div>
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                                  {item.nama}
                                </div>
                                <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Siap dilampirkan</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplacingPhotoId(item.id);
                                  fileUploadInputRef.current?.click();
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] transition-all flex items-center gap-1 shadow-2xs cursor-pointer press-down"
                                title="Ganti foto ini"
                              >
                                <RefreshCw className="w-3 h-3 text-slate-500" />
                                <span className="hidden sm:inline">Ganti</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setLampiranList(prev => prev.filter(l => l.id !== item.id));
                                }}
                                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[11px] transition-all flex items-center gap-1 shadow-2xs cursor-pointer press-down"
                                title="Hapus foto ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Hapus</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dua Tombol Aksi Bersih: Galeri & Kamera HP */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingPhotoId(null);
                        fileUploadInputRef.current?.click();
                      }}
                      className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs group press-down"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center group-hover:border-emerald-500 group-hover:text-emerald-700 transition-colors">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          {lampiranList.length > 0 ? '+ Tambah dari Galeri' : 'Pilih dari Galeri'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Buka file / galeri HP</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReplacingPhotoId(null);
                        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                        if (isMobile && cameraDirectInputRef.current) {
                          cameraDirectInputRef.current.click();
                        } else {
                          setCameraModalTitle('Ambil Foto Dokumen');
                          setCameraModalInitialMode('camera');
                          setIsCameraModalOpen(true);
                        }
                      }}
                      className="p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-950 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-2xs group press-down"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-950">
                          {lampiranList.length > 0 ? '+ Jepret Kamera' : 'Buka Kamera HP'}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-medium">Foto berkas langsung</div>
                      </div>
                    </button>

                    {/* Native file picker */}
                    <input
                      ref={fileUploadInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg,image/*"
                      onChange={handleDirectFileUpload}
                      className="hidden"
                    />

                    {/* Native camera capture */}
                    <input
                      ref={cameraDirectInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleDirectFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Tombol Aksi Submit Form */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-3">
                    {editingSurat && (
                      <button
                        type="button"
                        onClick={() => navigate('/dashboard/status-surat')}
                        className="py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 py-3.5 px-5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                        isSubmitting 
                          ? 'bg-emerald-800/80 cursor-not-allowed opacity-80' 
                          : 'bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] cursor-pointer'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{editingSurat ? 'Menyimpan...' : 'Mengajukan...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{editingSurat ? 'Simpan perubahan' : 'Ajukan surat'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Layanan resmi Pemerintah Desa Doko • Gratis tanpa pungutan biaya</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      }

      // Catalog Full-Width View with Pagination
      const totalPages = Math.ceil(filteredTypes.length / ITEMS_PER_PAGE) || 1;
      const paginatedTypes = filteredTypes.slice((catalogPage - 1) * ITEMS_PER_PAGE, catalogPage * ITEMS_PER_PAGE);

      return (
        <div className="space-y-6 animate-fade-in font-sans">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Katalog Layanan Surat Digital
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Pilih jenis surat resmi yang Anda butuhkan (KTP, KK, SKTM, Domisili, SKU, Akta, dll) untuk pengurusan cepat online.
              </p>
            </div>
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari jenis surat: KTP, KK, SKTM..."
                value={suratSearch}
                onChange={(e) => setSuratSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: 'Semua', label: `Semua (${types.length})` },
              { id: 'Kependudukan', label: 'KTP & KK' },
              { id: 'Sosial', label: 'SKTM & Bansos' },
              { id: 'Keluarga', label: 'Nikah & Akta' },
              { id: 'Usaha', label: 'Usaha (SKU)' },
              { id: 'Hukum', label: 'SKCK & Izin' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer press-down ${
                  selectedCategory === c.id 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Cards Grid: 3 columns on desktop, full-width stretching down */}
          {paginatedTypes.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
              Tidak ada jenis surat yang cocok dengan kata kunci "{suratSearch}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedTypes.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {t.kode_surat}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-sm text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                        {t.nama_surat}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-2 space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Syarat Berkas:</div>
                        <p className="line-clamp-2 text-slate-600 leading-relaxed">
                          {t.persyaratan_json?.join(' • ') || 'KTP & KK Asli'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Masa Berlaku:</span>
                      <span className="font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {t.masa_berlaku_hari} Hari
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/ajukan/${t.id}`)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-xs press-down flex items-center justify-center gap-2 cursor-pointer group/btn"
                    >
                      <span>Pengajuan</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Desktop & Mobile Clean Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-medium text-center sm:text-left">
                Menampilkan <span className="font-bold text-slate-800">{(catalogPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-bold text-slate-800">{Math.min(catalogPage * ITEMS_PER_PAGE, filteredTypes.length)}</span> dari <span className="font-bold text-slate-800">{filteredTypes.length}</span> jenis surat
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  disabled={catalogPage <= 1}
                  onClick={() => setCatalogPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCatalogPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      catalogPage === pageNum
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={catalogPage >= totalPages}
                  onClick={() => setCatalogPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

  // Status Surat Proses
  if (activeSubmenu === 'status_surat') {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Status Surat
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pantau progres persetujuan RT hingga penerbitan oleh Kepala Desa.
          </p>
        </div>

        {pendingSurats.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Belum ada pengajuan aktif</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Semua surat telah selesai diproses atau belum ada pengajuan baru.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSurats.map((s) => {
              const isRTStepDone = s.status !== 'pending_rt';
              const isDesaStepActive = ['processed_sekdes', 'approved_rt', 'pending_rw', 'pending_kades'].includes(s.status);
              const isDone = s.status === 'completed';
              const lampiranDocs = parseLampiranDokumen(s.file_lampiran);

              return (
                <div key={s.id} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                  {/* Card Header: Resi, Judul & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 pb-3.5 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {s.nomor_resi}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {s.surat_type?.nama_surat}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        Keperluan: {s.keperluan}
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto shrink-0 ${
                      isRTStepDone 
                        ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}>
                      {isRTStepDone ? 'Tahap 2: Menunggu Balai Desa' : 'Tahap 1: Menunggu Ketua RT'}
                    </span>
                  </div>

                  {/* Sleek Horizontal Stepper (Direct RT -> Desa) */}
                  <div className="pt-1 pb-1 px-3 sm:px-6">
                    <div className="relative flex items-center justify-between">
                      {/* Connecting Line */}
                      <div className="absolute left-8 right-8 top-4 h-1 bg-slate-100 -z-0 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${
                            isRTStepDone ? 'w-full bg-emerald-500' : 'w-0'
                          }`}
                        />
                      </div>

                      {/* Step 1: Ketua RT */}
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-2xs ${
                          isRTStepDone
                            ? 'bg-emerald-600 text-white shadow-emerald-200'
                            : 'bg-amber-500 text-white ring-4 ring-amber-100'
                        }`}>
                          {isRTStepDone ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                        </div>
                        <span className={`text-[11px] font-bold mt-1.5 ${isRTStepDone ? 'text-emerald-800' : 'text-slate-900'}`}>
                          Ketua RT 01
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium">
                          {isRTStepDone ? 'Disetujui' : 'Menunggu ACC'}
                        </span>
                      </div>

                      {/* Step 2: Kantor / Balai Desa */}
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all shadow-2xs ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isDesaStepActive
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                        </div>
                        <span className={`text-[11px] font-bold mt-1.5 ${
                          isDone 
                            ? 'text-emerald-800' 
                            : isDesaStepActive 
                            ? 'text-blue-900' 
                            : 'text-slate-600'
                        }`}>
                          Balai Desa
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium">
                          {isDone 
                            ? 'Sah & TTD QR' 
                            : isDesaStepActive 
                            ? 'Proses TTD QR' 
                            : 'Menunggu RT'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Keterangan Status Kontekstual Tenang */}
                  <div className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
                    s.status === 'pending_rt' 
                      ? 'bg-amber-50/70 border border-amber-200/80 text-amber-950'
                      : isDesaStepActive
                      ? 'bg-blue-50/70 border border-blue-200/80 text-blue-950'
                      : 'bg-emerald-50/70 border border-emerald-200/80 text-emerald-950'
                  }`}>
                    <div className="shrink-0">
                      {s.status === 'pending_rt' && <Clock className="w-4 h-4 text-amber-600" />}
                      {isDesaStepActive && <FileCheck2 className="w-4 h-4 text-blue-600" />}
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div className="leading-relaxed">
                      {s.status === 'pending_rt' && 'Berkas telah terkirim dan sedang menunggu persetujuan digital dari Ketua RT 01.'}
                      {isDesaStepActive && 'Ketua RT 01 telah menyetujui. Berkas kini sedang dalam proses penandatanganan QR resmi di Balai Desa.'}
                      {isDone && 'Surat resmi telah selesai disahkan dan siap diunduh di menu Surat Selesai.'}
                    </div>
                  </div>

                  {/* Action Buttons: Lampiran, Edit/Batal, dan Lacak Detail */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                    <div>
                      {lampiranDocs.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewGallery(lampiranDocs);
                            setGalleryIndex(0);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          title="Lihat foto dokumen terlampir"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{lampiranDocs.length} Foto Lampiran</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-600">Tanpa lampiran tambahan</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      {s.status === 'pending_rt' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              showToast(
                                'info',
                                'Mode Edit Pengajuan',
                                `Membuka formulir perbaikan data untuk ${s.surat_type?.nama_surat || 'surat'} (${s.nomor_resi}).`
                              );
                              navigate(`/dashboard/ajukan/${s.surat_type_id}?editSuratId=${s.id}`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all flex items-center gap-1 shadow-2xs cursor-pointer press-down"
                            title="Ubah data pengajuan atau perbaiki foto lampiran"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                            <span>Ubah</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSuratToDelete(s);
                              setIsDeleteConfirmOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs transition-all flex items-center gap-1 shadow-2xs cursor-pointer press-down"
                            title="Batalkan permohonan surat ini"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Batalkan</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedTrackingSurat(s)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>Lacak</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Surat Selesai & Dokumen Sah
  if (activeSubmenu === 'surat_selesai') {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Surat Selesai
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dokumen resmi yang telah disahkan dan siap dicetak.
          </p>
        </div>

        {completedSurats.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold mx-auto">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Belum ada surat selesai</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Surat yang sudah disahkan Kepala Desa akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {completedSurats.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      TERBIT
                    </span>
                    <span className="text-xs font-mono text-slate-500">No: {s.nomor_surat_resmi || s.nomor_resi}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{s.surat_type?.nama_surat}</h3>
                  <p className="text-xs text-slate-600">Keperluan: {s.keperluan}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTrackingSurat(s)}
                    className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                  >
                    Lacak
                  </button>
                  <button
                    onClick={() => setPrintSurat(s)}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all press-down flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Riwayat Pengajuan Surat
  if (activeSubmenu === 'riwayat_surat') {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Riwayat Surat
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Riwayat status seluruh permohonan surat warga.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari resi / nama surat..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Quick Filter Pills for Riwayat Surat */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setHistoryStatusFilter('arsip')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              historyStatusFilter === 'arsip' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Arsip ({completedSurats.length + rejectedSurats.length})
          </button>

          <button
            type="button"
            onClick={() => setHistoryStatusFilter('selesai')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              historyStatusFilter === 'selesai' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/80'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai ({completedSurats.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setHistoryStatusFilter('proses')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              historyStatusFilter === 'proses' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100/80'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Diproses ({pendingSurats.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setHistoryStatusFilter('ditolak')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              historyStatusFilter === 'ditolak' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100/80'
            }`}
          >
            Ditolak ({rejectedSurats.length})
          </button>

          <button
            type="button"
            onClick={() => setHistoryStatusFilter('semua')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              historyStatusFilter === 'semua' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua ({surats.length})
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          {/* Desktop Table View (Fit 100% tanpa garis geser) */}
          <div className="hidden sm:block">
            <table className="w-full text-left text-xs table-auto">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3.5 py-3.5 whitespace-nowrap w-28">No. Resi</th>
                  <th className="px-3.5 py-3.5 whitespace-nowrap w-44">Jenis Surat</th>
                  <th className="px-3.5 py-3.5">Keperluan & Catatan</th>
                  <th className="px-3.5 py-3.5 whitespace-nowrap w-24">Tanggal</th>
                  <th className="px-3.5 py-3.5 whitespace-nowrap w-28">Status</th>
                  <th className="px-3.5 py-3.5 text-right whitespace-nowrap w-36">Aksi Surat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {searchedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada riwayat pengajuan surat yang cocok.
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((s) => {
                    const isCompleted = s.status === 'completed';
                    const isRejected = ['rejected', 'rejected_rt', 'rejected_kades'].includes(s.status);
                    const lampiranDocs = parseLampiranDokumen(s.file_lampiran);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-3.5 py-3.5 font-mono font-bold text-slate-800 text-[11px] whitespace-nowrap">{s.nomor_resi}</td>
                        <td className="px-3.5 py-3.5 font-bold text-slate-900">{s.surat_type?.nama_surat}</td>
                        <td className="px-3.5 py-3.5 text-slate-600">
                          <div className="line-clamp-2">{s.keperluan}</div>
                          {isRejected && (
                            <div className="mt-1 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[10px] font-bold flex items-start gap-1 shadow-2xs">
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                              <span className="line-clamp-2">
                                Alasan Tolak: <em>"{s.catatan_penolakan || s.catatan_penolakan_kades || 'Berkas persyaratan belum lengkap / tidak sesuai'}"</em>
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-3.5 py-3.5 text-slate-400 text-[11px] whitespace-nowrap">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="px-3.5 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' :
                            isRejected ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {isCompleted ? 'Diterima & Sah' : isRejected ? 'Ditolak' : 'Sedang Diproses'}
                          </span>
                        </td>
                        <td className="px-3.5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {lampiranDocs.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewGallery(lampiranDocs);
                                  setGalleryIndex(0);
                                }}
                                className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                title={`Lihat ${lampiranDocs.length} Foto Lampiran`}
                              >
                                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                              </button>
                            )}

                            {/* Kondisi 1: Ketika sudah disahkan -> HANYA CETAK PDF */}
                            {isCompleted ? (
                              <button
                                onClick={() => setPrintSurat(s)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer press-down"
                                title="Cetak atau Unduh Dokumen Sah PDF"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Cetak</span>
                              </button>
                            ) : isRejected ? (
                              /* Kondisi 2: Ketika ditolak -> LIHAT ALASAN TOLAK & PENGAJUAN ULANG */
                              <button
                                onClick={() => setSelectedTrackingSurat(s)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer press-down"
                                title="Lihat alasan ditolak dan ajukan ulang surat di modal ini"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Alasan & Ulang</span>
                              </button>
                            ) : (
                              /* Kondisi 3: Ketika belum disahkan -> BISA DILACAK SURAT */
                              <button
                                onClick={() => setSelectedTrackingSurat(s)}
                                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer press-down"
                                title="Lacak posisi alur verifikasi berkas"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>Lacak</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="sm:hidden p-4 space-y-3">
            {searchedHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada riwayat pengajuan surat yang cocok.
              </div>
            ) : (
              paginatedHistory.map((s) => {
                const isCompleted = s.status === 'completed';
                const isRejected = ['rejected', 'rejected_rt', 'rejected_kades'].includes(s.status);
                const lampiranDocs = parseLampiranDokumen(s.file_lampiran);

                return (
                  <div key={s.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono text-slate-400">Resi: {s.nomor_resi}</div>
                        <h4 className="text-xs font-black text-slate-900 mt-0.5">{s.surat_type?.nama_surat}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        isCompleted ? 'bg-emerald-100 text-emerald-800' :
                        isRejected ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {isCompleted ? 'Diterima & Sah' : isRejected ? 'Ditolak' : 'Sedang Diproses'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold">Keperluan:</div>
                      <p>{s.keperluan}</p>

                      {isRejected && (
                        <div className="mt-2 p-2 rounded-xl bg-rose-100/80 border border-rose-200 text-rose-950 text-[11px] font-bold">
                          Alasan Penolakan: "{s.catatan_penolakan || 'Berkas persyaratan belum sesuai'}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400 font-medium">{new Date(s.created_at).toLocaleDateString('id-ID')}</span>
                      
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {lampiranDocs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewGallery(lampiranDocs);
                              setGalleryIndex(0);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer flex items-center gap-1"
                            title="Lihat Foto Lampiran"
                          >
                            <Paperclip className="w-3 h-3 text-slate-500" />
                            <span>Foto ({lampiranDocs.length})</span>
                          </button>
                        )}

                        {/* Kondisi 1: Sudah Disahkan -> HANYA CETAK PDF */}
                        {isCompleted ? (
                          <button
                            onClick={() => setPrintSurat(s)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer press-down"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Cetak / Unduh</span>
                          </button>
                        ) : isRejected ? (
                          /* Kondisi 2: Ditolak -> LIHAT ALASAN TOLAK & PENGAJUAN ULANG */
                          <button
                            onClick={() => setSelectedTrackingSurat(s)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer press-down"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Alasan Tolak & Ajukan Ulang</span>
                          </button>
                        ) : (
                          /* Kondisi 3: Belum Disahkan -> LACAK SURAT */
                          <button
                            onClick={() => setSelectedTrackingSurat(s)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer press-down"
                          >
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Lacak Surat</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Pagination
            currentPage={historyPage}
            totalItems={searchedHistory.length}
            pageSize={8}
            onPageChange={setHistoryPage}
            itemLabel="pengajuan surat"
            className="p-4"
          />
        </div>
      </div>
    );
  }

  // Sample Performance Chart & Activity Data
  const performanceData = [
    { label: 'Jan', value: 8, secondaryValue: 8, tooltipText: 'Surat Selesai' },
    { label: 'Feb', value: 12, secondaryValue: 11, tooltipText: 'Surat Selesai' },
    { label: 'Mar', value: 16, secondaryValue: 15, tooltipText: 'Surat Selesai' },
    { label: 'Apr', value: 14, secondaryValue: 14, tooltipText: 'Surat Selesai' },
    { label: 'Mei', value: 20, secondaryValue: 19, tooltipText: 'Surat Selesai' },
    { label: 'Jun', value: 24, secondaryValue: 22, tooltipText: 'Surat Selesai' },
    { label: 'Jul', value: 28, secondaryValue: 27, tooltipText: 'Surat Selesai' },
    { label: 'Agu', value: Math.max(32, surats.length * 4), secondaryValue: completedSurats.length, tooltipText: 'Surat Selesai' },
  ];

  const weeklyActivityData = [
    { label: 'Sen', value: 12 },
    { label: 'Sel', value: 18 },
    { label: 'Rab', value: 26, highlight: true },
    { label: 'Kam', value: 20 },
    { label: 'Jum', value: 34, highlight: true },
    { label: 'Sab', value: 14 },
    { label: 'Min', value: 6 },
  ];

  // Beranda Dashboard Warga (Pemisahan Tegas Mobile-First vs Desktop Asli)
  return (
    <div className="animate-fade-in font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TAMPILAN KHUSUS MOBILE (block sm:hidden)                               */}
      {/* Mobile-First, Ramah Warga Awam, Bebas Kebingungan, Tombol Pas Jempol      */}
      {/* ========================================================================= */}
      <div className="block sm:hidden space-y-4">
        {/* 1. Sapaan Ramah & Identitas Warga (At The Top) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                src={user?.avatar}
                name={p?.nama_lengkap || user?.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
                fallbackClassName="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 font-medium block">Selamat datang,</span>
                <h2 className="text-sm font-black text-slate-900 truncate">
                  {p?.nama_lengkap || user?.name || 'Warga Desa Doko'}
                </h2>
                <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span>RT 01 / RW 01 • Desa Doko</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                ● Warga Sah
              </span>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono text-[10px] text-slate-400">
              NIK: {p?.nik || '3506041505840001'}
            </span>
            <span className="text-emerald-700 font-bold text-[10px]">
              Iuran RT: Lunas (Agustus)
            </span>
          </div>
        </div>

        {/* 2. Tombol Utama & Layanan Pintas Warga (Dekat Jempol) */}
        <div className="space-y-2.5">
          {/* Tombol Utama Pengajuan Surat */}
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('ajukan_surat') : null}
            className="w-full p-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-xs transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold shrink-0">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-black text-xs leading-tight">Ajukan Surat Baru</div>
                <div className="text-[11px] text-emerald-100/90 font-normal mt-0.5">14 jenis surat siap diproses</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          {/* 4 Icon Pintas Cepat (Grid 2x2 di Mobile) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Pintasan 1: Lacak Surat */}
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('status_surat') : null}
              className="p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/40 shadow-2xs transition-all text-left space-y-1.5 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                {pendingSurats.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                    {pendingSurats.length}
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 group-hover:text-amber-900 leading-tight">Lacak Berkas</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Status verifikasi surat</div>
              </div>
            </button>

            {/* Pintasan 2: Surat Sah */}
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('surat_selesai') : null}
              className="p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/40 shadow-2xs transition-all text-left space-y-1.5 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                {completedSurats.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {completedSurats.length}
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 group-hover:text-emerald-900 leading-tight">Surat Sah</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Dokumen berstempel QR</div>
              </div>
            </button>

            {/* Pintasan 3: Master Berkas */}
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('berkas_kependudukan') : null}
              className="p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/40 shadow-2xs transition-all text-left space-y-1.5 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                  <FolderCheck className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {masterDokumen?.persentase_kelengkapan ?? 100}%
                </span>
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 group-hover:text-indigo-900 leading-tight">Dokumen Warga</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Berkas KTP & KK</div>
              </div>
            </button>

            {/* Pintasan 4: Keuangan Desa */}
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('keuangan_desa') : null}
              className="p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-300 hover:bg-teal-50/40 shadow-2xs transition-all text-left space-y-1.5 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200">
                  APBDes
                </span>
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 group-hover:text-teal-900 leading-tight">APBDes</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Transparansi anggaran</div>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Ringkasan Status Cepat (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Pengajuan</span>
            <div className="text-base font-black text-slate-900">{surats.length} Surat</div>
            <div className="text-[10px] text-emerald-700 font-semibold truncate">
              ● Kuota Bebas Layanan
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Sedang Diproses</span>
            <div className="text-base font-black text-amber-700">{pendingSurats.length} Berkas</div>
            <div className="text-[10px] text-amber-800 font-semibold truncate">
              {pendingSurats.length > 0 ? 'Verifikasi RT/Desa' : 'Tidak ada antrean'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Surat Sah & Terbit</span>
            <div className="text-base font-black text-emerald-800">{completedSurats.length} Selesai</div>
            <div className="text-[10px] text-emerald-700 font-semibold truncate">
              100% Sah & Berstempel QR
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Bantuan Sosial</span>
            <div className="text-base font-black text-sky-800">KPM Aktif</div>
            <div className="text-[10px] text-sky-700 font-semibold truncate">
              PKH Tahap III 2026
            </div>
          </div>
        </div>

        {/* 4. Aktivitas Dokumen Terbaru (Mobile Card List Pas Jempol) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                Aktivitas Dokumen
              </span>
              <h3 className="text-xs font-black text-slate-900 mt-1">Daftar Permohonan Surat</h3>
            </div>

            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('riwayat_surat') : null}
              className="text-xs font-black text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Semua ({surats.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {surats.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                Belum ada pengajuan surat.
              </div>
            ) : (
              surats.slice(0, 4).map((s) => {
                const isCompleted = s.status === 'completed';
                const isRejected = ['rejected', 'rejected_rt', 'rejected_kades'].includes(s.status);
                const statusLabel = isCompleted ? 'Sah & Ber-QR' : isRejected ? 'Perlu Diperbaiki' : 'Sedang Diproses';
                const statusClass = isCompleted 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : isRejected 
                  ? 'bg-rose-50 text-rose-800 border-rose-200' 
                  : 'bg-amber-50 text-amber-900 border-amber-200';

                return (
                  <div key={s.id} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{s.nomor_resi}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {s.surat_type?.nama_surat || 'Surat Permohonan'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic">
                        "{s.keperluan}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>

                      {isCompleted ? (
                        <button
                          type="button"
                          onClick={() => setPrintSurat(s)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak</span>
                        </button>
                      ) : isRejected ? (
                        <button
                          type="button"
                          onClick={() => setSelectedTrackingSurat(s)}
                          className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Lihat alasan</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedTrackingSurat(s)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Lacak</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 5. Agenda & Informasi Desa Mendatang (Mobile List) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                Informasi Desa
              </span>
              <h3 className="text-xs font-black text-slate-900 mt-1">Agenda Desa Doko</h3>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('agenda_desa')}
                className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Lihat Semua
              </button>
            )}
          </div>

          <div className="space-y-2">
            {(wargaAgendas.length > 0 ? wargaAgendas.slice(0, 3) : [
              { id: 1, judul: 'Posyandu Balita & Lansia', waktu: '08.30 WIB', tempat: 'Poskesdes Dusun Doko', tipe: 'Kesehatan' },
              { id: 2, judul: 'Penyaluran Bansos PKH', waktu: '09.00 WIB', tempat: 'Balai Desa Doko', tipe: 'Sosial' }
            ]).map((ag: any) => (
              <div key={ag.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{ag.judul}</span>
                  </span>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                    {ag.tipe}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{ag.waktu} • {ag.tempat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAMPILAN KHUSUS DESKTOP & TABLET (hidden sm:block)                     */}
      {/* Tampilan Desktop Asli: 4 Stat Cards, 12-Col Grid, Area Spline, Bar Chart,  */}
      {/* Quick Action Hub, Identitas Akun Samping, Kalender Widget & Tabel Lengkap  */}
      {/* ========================================================================= */}
      <div className="hidden sm:block space-y-6">
        
        {/* 4 Top Modular Stat Metric Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          <MetricStatCard
            title="Total Surat Diajukan"
            value={`${surats.length} Surat`}
            subvalue="/ Kuota Bebas"
            percentage={100}
            color="emerald"
            trend="+18.5% vs bulan lalu"
            isPositiveTrend={true}
          />
          <MetricStatCard
            title="Surat Diterima & Sah"
            value={`${completedSurats.length} Selesai`}
            subvalue="Siap Unduh PDF"
            percentage={surats.length > 0 ? Math.round((completedSurats.length / surats.length) * 100) : 100}
            color="teal"
            trend="100% Sah & Ber-QR"
            isPositiveTrend={true}
          />
          <MetricStatCard
            title="Antrean Surat RT"
            value={`${pendingSurats.length} Berkas`}
            subvalue="Sedang Diperiksa"
            percentage={pendingSurats.length > 0 ? 65 : 100}
            color="amber"
            trend="SLA Rata-rata < 15 Menit"
            isPositiveTrend={true}
          />
          <MetricStatCard
            title="Status Bansos & PKH"
            value="KPM Aktif"
            subvalue="Tahap III 2026"
            percentage={95}
            color="sky"
            trend="Nomor Antrean: A-014"
            isPositiveTrend={true}
          />
        </div>

        {/* 12-Column Overview Layout: Chart + Actions (Left 8) & Profile + Calendar (Right 4) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left 8 Cols: Performance Spline Chart + Sub-grid (Bar Chart + Quick Actions) */}
          <div className="xl:col-span-8 space-y-5">
            <AreaSplineChart
              title="Overview Efisiensi & Volume Surat"
              subtitle="Statistik Layanan Administrasi Desa"
              data={performanceData}
              highlightValue="96.75%"
              highlightLabel="Kecepatan Penerbitan & Kepuasan Warga"
              trendText="+12.8% vs bulan lalu"
            />

            {/* Sub-grid under Chart: Weekly Bar Activity (6 Col) + Quick Actions (6 Col) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <BarActivityChart
                title="Aktivitas Jam Layanan"
                subtitle="Statistik Mingguan"
                data={weeklyActivityData}
                mainValue="34.30 Jam"
                mainLabel="Waktu Pelayanan Aktif Minggu Ini"
              />

              {/* Quick Action & Document Hub Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                    Aksi Mandiri
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-1">Layanan Pintas</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Akses cepat layanan surat dan kependudukan.</p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => onNavigate ? onNavigate('ajukan_surat') : null}
                    className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>Ajukan surat</span>
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate ? onNavigate('status_surat') : null}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-400" />
                      <span>Lacak berkas</span>
                    </span>
                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {pendingSurats.length} Proses
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate ? onNavigate('surat_selesai') : null}
                    className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-700" />
                      <span>Unduh surat sah</span>
                    </span>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                      {completedSurats.length} Sah
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate ? onNavigate('berkas_kependudukan') : null}
                    className="w-full p-3 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-950 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FolderCheck className="w-4 h-4 text-indigo-600" />
                      <span>Dokumen kependudukan</span>
                    </span>
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-200/70 px-2 py-0.5 rounded-full">
                      {masterDokumen?.persentase_kelengkapan ?? 100}% Siap
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Personal Profile Card + Mini Calendar Widget */}
          <div className="xl:col-span-4 space-y-5">
            {/* Quick Profile / Personal Info Card Matching Reference */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Identitas Akun
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ● Aktif / Terverifikasi
                </span>
              </div>

              <div className="flex items-center gap-3.5 pt-1">
                <UserAvatar
                  src={user?.avatar}
                  name={p?.nama_lengkap || user?.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs shrink-0"
                  fallbackClassName="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black text-slate-900 leading-snug break-words">
                    {p?.nama_lengkap || user?.name}
                  </h4>
                  <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                    Warga Penduduk Tetap
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    NIK: {p?.nik || '3506041505840001'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold">Wilayah Domisili:</span>
                  <span className="font-extrabold text-slate-900">RT 01 / RW 01</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold">Nomor KK:</span>
                  <span className="font-mono text-slate-800">{p?.kartu_keluarga?.no_kk || '3506040101150001'}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-bold">Status Iuran Kas RT:</span>
                  <span className="text-emerald-700 font-black">Lunas (Agustus)</span>
                </div>
              </div>
            </div>

            {/* Mini Calendar & Agenda Widget */}
            <MiniCalendarWidget 
              title="Jadwal & Agenda Desa" 
              agendas={wargaAgendas.length > 0 ? wargaAgendas.map((a: any) => {
                let dayNum = 20;
                if (a.tanggal) {
                  const parts = a.tanggal.split('-');
                  if (parts.length === 3) dayNum = parseInt(parts[2], 10) || 20;
                }
                return {
                  id: String(a.id),
                  title: a.judul,
                  date: dayNum,
                  time: a.waktu,
                  category: a.tipe,
                  location: a.tempat,
                  color: a.is_custom ? 'emerald' : 'sky',
                };
              }) : undefined}
            />
          </div>
        </div>

        {/* Recent Documents Table (Full Desktop Experience) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                Aktivitas Dokumen Terbaru
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">Daftar Permohonan & Surat Sah</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('riwayat_surat') : null}
                className="text-xs font-black text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Seluruh Arsip ({surats.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-2xl">Nomor Resi</th>
                  <th className="p-3.5">Jenis Surat</th>
                  <th className="p-3.5">Keperluan</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-2xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {surats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Belum ada pengajuan surat. Klik "Ajukan Surat Baru" untuk memulai permohonan.
                    </td>
                  </tr>
                ) : (
                  surats.slice(0, 5).map((s) => {
                    const isCompleted = s.status === 'completed';
                    const isRejected = ['rejected', 'rejected_rt', 'rejected_kades'].includes(s.status);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-800">{s.nomor_resi}</td>
                        <td className="p-3.5 font-black text-slate-900">{s.surat_type?.nama_surat}</td>
                        <td className="p-3.5 text-slate-600 max-w-xs truncate">{s.keperluan}</td>
                        <td className="p-3.5 text-slate-400 font-mono">
                          {new Date(s.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' :
                            isRejected ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            'bg-amber-100 text-amber-900'
                          }`}>
                            {isCompleted ? 'Diterima' : isRejected ? 'Ditolak' : 'Proses'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isCompleted ? (
                              <button
                                onClick={() => setPrintSurat(s)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Cetak PDF</span>
                              </button>
                            ) : isRejected ? (
                              <button
                                onClick={() => setSelectedTrackingSurat(s)}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                              >
                                Alasan Tolak
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedTrackingSurat(s)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                              >
                                Lacak
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

  return (
    <>
      {renderSubmenuContent()}

      {selectedTrackingSurat && (
        <SuratTrackingModal
          surat={selectedTrackingSurat}
          desa={desa}
          onClose={() => setSelectedTrackingSurat(null)}
          onPrint={(suratToPrint) => setPrintSurat(suratToPrint)}
          onReapply={handleReapplySurat}
        />
      )}

      {printSurat && (
        <CetakSuratModal 
          surat={printSurat} 
          desa={desa} 
          onClose={() => setPrintSurat(null)} 
        />
      )}

      {/* Reusable Camera & Document Upload Modal */}
      <CameraUploadModal
        isOpen={isCameraModalOpen}
        onClose={() => {
          setIsCameraModalOpen(false);
          setReplacingPhotoId(null);
        }}
        initialMode="camera"
        onCapture={(base64, fileName) => {
          attachPhoto(base64, fileName);
        }}
        title={cameraModalTitle}
        description="Posisikan dokumen KTP, KK, atau berkas persyaratan di dalam bingkai kamera agar data NIK dan teks terbaca jelas."
        guideType="ktp"
      />

      {/* Success Submission Modal - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
      {submitSuccessModal && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-slate-950/75 flex items-center justify-center p-4 animate-fade-in font-sans overflow-y-auto select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSubmitSuccessModal(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 animate-scale-up my-auto max-h-[90vh] overflow-y-auto text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Celebration Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {submitSuccessModal.isEdit ? 'Pembaruan Berhasil' : 'Pengajuan Berhasil Terkirim'}
              </span>
              <h3 className="text-xl font-black text-slate-900 pt-1">
                {submitSuccessModal.isEdit 
                  ? 'Perubahan Berkas Berhasil Disimpan!' 
                  : 'Permohonan Surat Siap Diproses!'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {submitSuccessModal.isEdit
                  ? 'Data revisi surat Anda telah diperbarui dan dialirkan kembali ke antrean verifikasi Ketua RT.'
                  : 'Permohonan surat Anda telah otomatis masuk ke sistem desa dan tercatat dalam antrean verifikasi Ketua RT 01.'}
              </p>
            </div>

            {/* Resi & Letter Details Box */}
            {submitSuccessModal.surat && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nomor Resi Pelacakan
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-mono font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-xl">
                      {submitSuccessModal.surat.nomor_resi}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(submitSuccessModal.surat?.nomor_resi || '');
                        setCopiedResi(true);
                        setTimeout(() => setCopiedResi(false), 2000);
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                    >
                      {copiedResi ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Resi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-2.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Jenis Surat
                  </div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">
                    {submitSuccessModal.surat.surat_type?.nama_surat || 'Surat Permohonan'}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Tahap 1: Menunggu Verifikasi Ketua RT 01</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSubmitSuccessModal(null);
                  navigate('/dashboard/status-surat');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover-glow press-down"
              >
                <span>Pantau di Status Surat</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmitSuccessModal(null);
                  navigate('/dashboard/ajukan');
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
              >
                Ajukan Surat Lainnya
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete / Cancel Confirmation Modal - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
      {isDeleteConfirmOpen && suratToDelete && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-slate-950/75 flex items-center justify-center p-4 animate-fade-in font-sans overflow-y-auto select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setIsDeleteConfirmOpen(false);
              setSuratToDelete(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-scale-up my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">Batalkan Permohonan Surat?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin membatalkan pengajuan <strong>{suratToDelete.surat_type?.nama_surat}</strong> (No. Resi: <span className="font-mono font-bold text-slate-800">{suratToDelete.nomor_resi}</span>)? Permohonan ini akan dihapus permanen dari antrean verifikasi Ketua RT.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  if (isDeleting) return;
                  setIsDeleteConfirmOpen(false);
                  setSuratToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSurat}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all press-down cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Membatalkan...</span>
                  </>
                ) : (
                  'Ya, Batalkan'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox Modal for Zooming Document Attachment(s) - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
      {previewGallery.length > 0 && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-slate-950/90 flex items-center justify-center p-4 animate-fade-in font-sans overflow-y-auto select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewGallery([]);
          }}
        >
          <div 
            className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl space-y-3 p-4 flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-slate-900 pb-3 border-b border-slate-100 shrink-0">
              <span className="text-xs font-bold flex items-center gap-2 truncate text-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="truncate">
                  Pratinjau Dokumen Lampiran: {previewGallery[galleryIndex]?.nama || 'Dokumen'}
                </span>
                {previewGallery.length > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 text-[10px] font-mono shrink-0">
                    {galleryIndex + 1} / {previewGallery.length}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setPreviewGallery([])}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Tutup (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center flex-1 min-h-[280px] max-h-[65vh]">
              <img
                src={previewGallery[galleryIndex]?.url}
                alt={previewGallery[galleryIndex]?.nama || 'Pratinjau Dokumen'}
                className="w-full h-full object-contain"
              />

              {previewGallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setGalleryIndex(prev => (prev > 0 ? prev - 1 : previewGallery.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 transition-all cursor-pointer shadow-md border border-slate-200"
                    title="Dokumen Sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryIndex(prev => (prev < previewGallery.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 transition-all cursor-pointer shadow-md border border-slate-200"
                    title="Dokumen Selanjutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip for Multi-Documents */}
            {previewGallery.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 shrink-0">
                {previewGallery.map((doc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGalleryIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      galleryIndex === idx ? 'border-emerald-500 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={doc.url} alt={doc.nama} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Action Toast Notifications - Portaled, Top-Right, Highest Z-Index, Unmistakable Feedback */}
      {actionToast && createPortal(
        <div className="fixed top-5 right-5 z-[9999999] max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none animate-fade-in font-sans">
          <div
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all ${
              actionToast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/60 text-white shadow-emerald-950/50'
                : actionToast.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/60 text-white shadow-rose-950/50'
                : 'bg-slate-900/95 border-blue-500/60 text-white shadow-slate-950/50'
            }`}
            role="alert"
          >
            <div className="shrink-0 mt-0.5">
              {actionToast.type === 'success' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {actionToast.type === 'error' && (
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {actionToast.type === 'info' && (
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Info className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-black tracking-wide flex items-center gap-1.5">
                <span>{actionToast.title}</span>
              </h4>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-0.5 break-words">
                {actionToast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActionToast(null)}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
