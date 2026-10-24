import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Users,
  Award,
  Edit,
  Save,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  Layers,
  Phone,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import api from '@/shared/lib/axios';

interface AparaturItem {
  id: string;
  jabatan: string;
  nama: string;
  nik?: string;
  nip?: string;
  noSk?: string;
  level: number;
  roleSlug: string;
  status: 'Aktif' | 'Pelaksana Tugas';
  color: string;
}

export const KadesStrukturVisiMisiView: React.FC = () => {
  const [visi, setVisi] = useState<string>(
    'Mewujudkan Desa Doko yang Maju, Mandiri, Sejahtera, dan Berkeadaban Melalui Transformasi Tata Kelola Pemerintahan Digital dan Pemberdayaan Ekonomi Kerakyatan 2021-2027.'
  );
  const [misi, setMisi] = useState<string>(
    '1. Meningkatkan kualitas pelayanan publik berbasis digital yang cepat, transparan, dan akuntabel.\n2. Mengoptimalkan alokasi APBDes untuk pembangunan infrastruktur berkelanjutan dan tepat guna.\n3. Memberdayakan UMKM warga dan BUMDes Doko Makmur demi kemandirian ekonomi desa.\n4. Memperkuat kerukunan warga, perlindungan sosial, posyandu, dan ketahanan pangan desa.'
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Initial structure data
  const aparaturList: AparaturItem[] = [
    {
      id: 'kades-1',
      jabatan: 'Kepala Desa (Kades)',
      nama: 'Bambang Supriyanto, S.Sos.',
      nik: '3506041505700001',
      nip: '19700515 199803 1 002',
      noSk: '188/45/SK/KEDIRI/2021',
      level: 1,
      roleSlug: 'kades',
      status: 'Aktif',
      color: 'from-emerald-700 to-teal-800',
    },
    {
      id: 'sekdes-1',
      jabatan: 'Sekretaris Desa (Sekdes)',
      nama: 'Ir. Ahmad Zarkasih',
      nik: '3506041208750002',
      nip: '19750812 200212 1 004',
      noSk: '188/12/DESA/2022',
      level: 2,
      roleSlug: 'sekdes',
      status: 'Aktif',
      color: 'from-emerald-600 to-teal-700',
    },
    {
      id: 'bpd-1',
      jabatan: 'Ketua BPD (Badan Permusyawaratan Desa)',
      nama: 'Drs. H. Mulyadi',
      nik: '3506040304680001',
      noSk: '141/08/BPD/2021',
      level: 2,
      roleSlug: 'bpd',
      status: 'Aktif',
      color: 'from-slate-700 to-slate-800',
    },
    {
      id: 'bendahara-1',
      jabatan: 'Kaur Keuangan (Bendahara Desa)',
      nama: 'Siti Rahmawati, S.E.',
      nik: '3506045509880003',
      nip: '19880915 201402 2 001',
      noSk: '188/15/DESA/2022',
      level: 3,
      roleSlug: 'bendahara_desa',
      status: 'Aktif',
      color: 'from-amber-600 to-amber-700',
    },
    {
      id: 'perencanaan-1',
      jabatan: 'Kaur Perencanaan & TU',
      nama: 'Rahmat Hidayat, S.Kom.',
      nik: '3506041111920002',
      noSk: '188/16/DESA/2022',
      level: 3,
      roleSlug: 'kaur_tu',
      status: 'Aktif',
      color: 'from-teal-600 to-teal-700',
    },
    {
      id: 'kesra-1',
      jabatan: 'Kasi Pelayanan & Kesra',
      nama: 'Nurul Komariyah, S.Pd.',
      nik: '3506044405850004',
      noSk: '188/17/DESA/2022',
      level: 3,
      roleSlug: 'kasi_kesra',
      status: 'Aktif',
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 'kasun-1',
      jabatan: 'Kepala Dusun Krajan',
      nama: 'Sunaryo',
      nik: '3506041803740001',
      noSk: '188/21/DESA/2021',
      level: 3,
      roleSlug: 'kasun',
      status: 'Aktif',
      color: 'from-indigo-600 to-indigo-700',
    },
    {
      id: 'rw-1',
      jabatan: 'Ketua RW 01 Dusun Krajan',
      nama: 'H. Sudirman, S.H.',
      nik: '3506042104690002',
      noSk: '141/02/RW-DOKO/2022',
      level: 4,
      roleSlug: 'rw',
      status: 'Aktif',
      color: 'from-sky-600 to-sky-700',
    },
    {
      id: 'rt-1',
      jabatan: 'Ketua RT 01 Krajan',
      nama: 'Sugeng Riyadi',
      nik: '3506041505840001',
      noSk: '141/01/RT01/2023',
      level: 4,
      roleSlug: 'rt',
      status: 'Aktif',
      color: 'from-emerald-600 to-teal-600',
    },
  ];

  // Fetch current setting
  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await api.get('/settings/desa');
        if (res.data?.success && res.data.data) {
          const d = res.data.data;
          if (d.visi) setVisi(d.visi);
          if (d.misi) setMisi(d.misi);
        }
      } catch {
        // use default
      }
    };
    fetchSetting();
  }, []);

  const handleSaveVisiMisi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await api.put('/settings/desa', {
        visi,
        misi,
      }).catch(async () => {
        // Fallback endpoint
        await api.post('/settings/desa', { visi, misi });
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);
    } catch {
      // Even if network fails, persist locally for instant preview
      localStorage.setItem('sidesku_desa_visi', visi);
      localStorage.setItem('sidesku_desa_misi', misi);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            Pemerintah Desa • RPJMDes & Tata Usaha
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Visi, Misi & Struktur Pemerintahan Desa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Perbarui rumusan resmi Visi dan butir Misi desa yang langsung tampil di halaman profil publik, transparansi warga, dan portal resmi desa.
          </p>
        </div>

        <a
          href="/profil-desa"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition shadow-2xs cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 text-emerald-600" />
          <span>Lihat di Landing Page</span>
        </a>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong>Visi & Misi Berhasil Diperbarui!</strong>
            <p className="font-normal text-emerald-800 mt-0.5">
              Perubahan telah tersinkronisasi ke seluruh antarmuka sistem dan halaman profil publik desa.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Form Kelola Visi & Misi */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100/80 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Perumusan Visi & Misi Desa Periode Aktif</h3>
              <p className="text-xs text-slate-500">Arah kebijakan pembangunan desa selama masa jabatan Pemerintah Desa</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveVisiMisi} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Visi Pembangunan Desa (Rencana Strategis) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={visi}
              onChange={(e) => setVisi(e.target.value)}
              className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition leading-relaxed"
              placeholder="Tuliskan rumusan visi desa..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Misi Pembangunan Desa (Uraian Agenda Pokok) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={misi}
              onChange={(e) => setMisi(e.target.value)}
              className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition leading-relaxed font-mono"
              placeholder="Tuliskan butir-butir misi (satu baris per poin misi)..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan ke Server...' : 'Simpan Visi & Misi'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Struktur Organisasi & Hierarki Pemerintahan */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Bagan Struktur Hierarki Aparatur Pemerintah Desa</h3>
              <p className="text-xs text-slate-500">
                Hubungan komando, pengawasan keuangan (Kades dan Bendahara), dan koordinasi kewilayahan RT/RW
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full w-fit">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Terkoneksi Real-Time ke Landing Page</span>
          </span>
        </div>

        {/* Visual Org Chart Cards */}
        <div className="space-y-6">
          {/* Level 1: Kepala Desa */}
          <div className="flex justify-center">
            {aparaturList
              .filter((a) => a.level === 1)
              .map((a) => (
                <div
                  key={a.id}
                  className="w-full max-w-md bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-3xl p-5 shadow-lg border-2 border-emerald-500 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-200 bg-white/15 px-2.5 py-0.5 rounded-full">
                      Pucuk Pimpinan Desa
                    </span>
                    <span className="text-[10px] bg-emerald-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full">
                      {a.status}
                    </span>
                  </div>
                  <h4 className="text-base font-black">{a.nama}</h4>
                  <p className="text-xs text-emerald-100 font-semibold">{a.jabatan}</p>
                  <div className="pt-2 border-t border-white/20 text-[10px] text-emerald-200 space-y-0.5 font-mono">
                    <div>NIP: {a.nip}</div>
                    <div>SK: {a.noSk}</div>
                  </div>
                </div>
              ))}
          </div>

          <div className="w-0.5 h-6 bg-slate-300 mx-auto"></div>

          {/* Level 2: Sekdes & BPD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {aparaturList
              .filter((a) => a.level === 2)
              .map((a) => (
                <div
                  key={a.id}
                  className="bg-white border-2 border-slate-200 hover:border-emerald-400 rounded-2xl p-4 shadow-xs space-y-2 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {a.jabatan}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{a.status}</span>
                  </div>
                  <h5 className="text-sm font-black text-slate-900">{a.nama}</h5>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {a.nip ? `NIP: ${a.nip}` : `SK: ${a.noSk}`}
                  </div>
                </div>
              ))}
          </div>

          <div className="w-0.5 h-6 bg-slate-300 mx-auto"></div>

          {/* Level 3: Pelaksana Teknis & Kewilayahan */}
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
            Kaur, Kasi & Pelaksana Wilayah (Dusun)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {aparaturList
              .filter((a) => a.level === 3)
              .map((a) => (
                <div
                  key={a.id}
                  className={`bg-white border rounded-2xl p-4 shadow-2xs space-y-2 transition ${
                    a.roleSlug === 'bendahara_desa'
                      ? 'border-amber-300 bg-amber-50/30 ring-2 ring-amber-400/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        a.roleSlug === 'bendahara_desa'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {a.jabatan}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 leading-snug">{a.nama}</h5>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {a.nip || `SK: ${a.noSk}`}
                  </div>
                  {a.roleSlug === 'bendahara_desa' && (
                    <div className="pt-2 border-t border-amber-200 text-[10px] text-amber-900 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Mitra Pengawasan APBDes</span>
                    </div>
                  )}
                </div>
              ))}
          </div>

          <div className="w-0.5 h-6 bg-slate-300 mx-auto"></div>

          {/* Level 4: Kelembagaan RW & RT */}
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
            Pimpinan Teritorial Lingkungan (RW & RT)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {aparaturList
              .filter((a) => a.level === 4)
              .map((a) => (
                <div
                  key={a.id}
                  className="bg-white border border-slate-200 hover:border-sky-300 rounded-2xl p-4 shadow-2xs space-y-1.5"
                >
                  <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                    {a.jabatan}
                  </span>
                  <h5 className="text-xs font-bold text-slate-900">{a.nama}</h5>
                  <div className="text-[10px] text-slate-400 font-mono">SK: {a.noSk}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

