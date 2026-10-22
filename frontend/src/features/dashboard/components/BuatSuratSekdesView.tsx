import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileCheck2, 
  Search, 
  User, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  QrCode, 
  Building2,
  Calendar,
  Layers,
  Zap,
  ArrowRight
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { SuratType, SuratRequest } from '@/shared/types';
import { CetakSuratModal } from './CetakSuratModal';

interface WargaOption {
  id: number;
  nik: string;
  nama_lengkap: string;
  alamat_ktp: string;
  pekerjaan?: string;
  rt?: {
    nomor_rt: string;
    rw?: {
      nomor_rw: string;
    };
  };
}

export const BuatSuratSekdesView: React.FC = () => {
  const [wargas, setWargas] = useState<WargaOption[]>([]);
  const [types, setTypes] = useState<SuratType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [selectedWargaId, setSelectedWargaId] = useState<number | ''>('');
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');
  const [keperluan, setKeperluan] = useState('');
  const [keteranganLoket, setKeteranganLoket] = useState('Penerbitan surat mandiri via Loket Pelayanan Balai Desa');
  const [wargaSearch, setWargaSearch] = useState('');

  // Processing & result
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSurat, setCreatedSurat] = useState<SuratRequest | null>(null);
  const [printSurat, setPrintSurat] = useState<SuratRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [desaSetting, setDesaSetting] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [wargaRes, typesRes, desaRes] = await Promise.all([
        api.get('/sekdes/warga'),
        api.get('/surat-types'),
        api.get('/settings/desa'),
      ]);

      if (wargaRes.data.success) setWargas(wargaRes.data.data);
      if (typesRes.data.success) setTypes(typesRes.data.data);
      if (desaRes.data.success) setDesaSetting(desaRes.data.data);
    } catch {
      setErrorMsg('Gagal memuat data master warga atau jenis surat.');
    } finally {
      setLoading(false);
    }
  };

  const filteredWargaOptions = wargas.filter((w) => 
    !wargaSearch || 
    w.nama_lengkap.toLowerCase().includes(wargaSearch.toLowerCase()) ||
    w.nik.includes(wargaSearch)
  );

  const selectedWarga = wargas.find(w => w.id === Number(selectedWargaId));
  const selectedType = types.find(t => t.id === Number(selectedTypeId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWargaId || !selectedTypeId || !keperluan.trim()) {
      setErrorMsg('Harap lengkapi pemohon warga, jenis surat, dan keperluan.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const res = await api.post('/sekdes/surats/direct', {
        warga_profile_id: selectedWargaId,
        surat_type_id: selectedTypeId,
        keperluan: keperluan.trim(),
        keterangan_loket: keteranganLoket.trim(),
      });

      if (res.data.success) {
        setCreatedSurat(res.data.data);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal menerbitkan surat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedSurat(null);
    setSelectedWargaId('');
    setSelectedTypeId('');
    setKeperluan('');
    setErrorMsg('');
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Loket Pelayanan Mandiri Desa
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Penerbitan Surat Resmi Mandiri di Balai Desa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Fasilitas bagi warga yang hadir langsung di kantor desa (lansia/tanpa gawai) untuk penerbitan surat seketika berstempel QR resmi.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-xs border border-emerald-200 self-start sm:self-auto">
          <Zap className="w-3.5 h-3.5 text-emerald-700" />
          <span>Penerbitan Instan & Nomor Otomatis</span>
        </span>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Modal / State */}
      {createdSurat ? (
        <div className="card-surface p-6 sm:p-8 space-y-6 bg-white border border-slate-200/90 rounded-3xl animate-fade-up shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                Surat Resmi Berhasil Diterbitkan
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                {createdSurat.surat_type?.nama_surat}
              </h3>
              <p className="text-xs text-slate-500">
                Dokumen telah sah tercatat di Buku Register Desa dan siap diserahkan kepada pemohon.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-emerald-100 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Nomor Surat Resmi</span>
              <div className="font-mono font-black text-sm text-emerald-900">
                {createdSurat.nomor_surat_resmi}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Pemohon / NIK</span>
              <div className="font-bold text-slate-900">{createdSurat.warga_profile?.nama_lengkap}</div>
              <div className="font-mono text-slate-500">{createdSurat.warga_profile?.nik}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-emerald-100 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Keabsahan TTE QR</span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Terdaftar & Berstempel Sah</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-emerald-100">
            <button
              type="button"
              onClick={() => setPrintSurat(createdSurat)}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Lembar Surat A4 Sekarang</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
            >
              <span>+ Terbitkan Surat Lain</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form Creation */
        <form onSubmit={handleSubmit} className="card-surface p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1: Pilih Warga Pemohon */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">1</span>
                <h4 className="text-sm font-black text-slate-900">Pilih Warga Pemohon (Buku Induk)</h4>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Cari NIK atau Nama Warga</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={wargaSearch}
                    onChange={(e) => setWargaSearch(e.target.value)}
                    placeholder="Ketik NIK 16 digit atau nama warga..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Daftar Warga Terdaftar</label>
                <select
                  value={selectedWargaId}
                  onChange={(e) => setSelectedWargaId(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="">-- Pilih Warga Desa Doko --</option>
                  {filteredWargaOptions.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nama_lengkap} (NIK: {w.nik}) - RT {w.rt?.nomor_rt || '01'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedWarga && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-xs space-y-1 animate-fade-in">
                  <div className="font-black text-emerald-950">{selectedWarga.nama_lengkap}</div>
                  <div className="font-mono text-emerald-800 text-[11px]">NIK: {selectedWarga.nik}</div>
                  <div className="text-slate-600 text-[11px]">Alamat: {selectedWarga.alamat_ktp}</div>
                </div>
              )}
            </div>

            {/* Step 2: Pilih Jenis Surat */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">2</span>
                <h4 className="text-sm font-black text-slate-900">Jenis Dokumen Surat Resmi</h4>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Pilih Jenis Surat</label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="">-- Pilih Jenis Surat Resmi --</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama_surat} ({t.kode_surat}) - Klasifikasi: {t.kode_klasifikasi || '470'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedType && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{selectedType.nama_surat}</span>
                    <span className="font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Klasifikasi: {selectedType.kode_klasifikasi || '470'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{selectedType.deskripsi || 'Surat pengantar / keterangan resmi administrasi kantor desa.'}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Keperluan Surat <span className="text-rose-500">*</span></label>
                <textarea
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  required
                  rows={3}
                  placeholder="Contoh: Kelengkapan permohonan beasiswa kuliah, perpanjangan KTP-el, atau persyaratan administrasi perbankan..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Catatan Loket Pelayanan</label>
                <input
                  type="text"
                  value={keteranganLoket}
                  onChange={(e) => setKeteranganLoket(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Surat akan langsung diterbitkan dengan Nomor Resmi & Tanda Tangan QR sah Sekdes.
            </span>
            <button
              type="submit"
              disabled={isSubmitting || !selectedWargaId || !selectedTypeId}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Menerbitkan...' : 'Terbitkan & Sahkan Surat QR'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Cetak Modal if requested */}
      {printSurat && (
        <CetakSuratModal
          surat={printSurat}
          desa={desaSetting}
          onClose={() => setPrintSurat(null)}
        />
      )}
    </div>
  );
};
