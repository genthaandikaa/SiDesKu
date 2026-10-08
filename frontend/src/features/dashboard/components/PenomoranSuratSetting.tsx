import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Hash, 
  Edit3, 
  Save, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles,
  Sliders,
  Layers
} from 'lucide-react';
import api from '@/shared/lib/axios';

interface SuratTypeSetting {
  id: number;
  kode_surat: string;
  nama_surat: string;
  kode_klasifikasi: string;
  format_nomor: string;
  nomor_terakhir: number;
  nomor_berikutnya: number;
  preview_nomor: string;
  masa_berlaku_hari: number;
  is_active: boolean;
}

interface CalendarData {
  iso_date: string;
  tanggal: string;
  hari: string;
  bulan_angka: string;
  bulan_nama: string;
  bulan_romawi: string;
  tahun: string;
  formatted: string;
  sumber: string;
}

export const PenomoranSuratSetting: React.FC = () => {
  const [types, setTypes] = useState<SuratTypeSetting[]>([]);
  const [calendar, setCalendar] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<SuratTypeSetting | null>(null);
  const [formFormat, setFormFormat] = useState('');
  const [formKlasifikasi, setFormKlasifikasi] = useState('');
  const [formNomorTerakhir, setFormNomorTerakhir] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sekdes/surat-types');
      if (res.data.success) {
        setTypes(res.data.data);
        if (res.data.calendar) {
          setCalendar(res.data.calendar);
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat pengaturan penomoran surat.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (st: SuratTypeSetting) => {
    setEditingType(st);
    setFormFormat(st.format_nomor);
    setFormKlasifikasi(st.kode_klasifikasi);
    setFormNomorTerakhir(st.nomor_terakhir);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;

    try {
      setIsSaving(true);
      const res = await api.put(`/sekdes/surat-types/${editingType.id}`, {
        format_nomor: formFormat,
        kode_klasifikasi: formKlasifikasi,
        nomor_terakhir: formNomorTerakhir,
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message || 'Format nomor surat berhasil diperbarui.' });
        setEditingType(null);
        fetchSettings();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal menyimpan format penomoran.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Live preview calculator for modal
  const computeLivePreview = () => {
    if (!calendar) return formFormat;
    const padded = String(Number(formNomorTerakhir) + 1).padStart(3, '0');
    return formFormat
      .replace('{NO}', padded)
      .replace('{KLASIFIKASI}', formKlasifikasi || '470')
      .replace('{KODE}', editingType?.kode_surat || 'SK')
      .replace('{TANGGAL}', calendar.tanggal)
      .replace('{BULAN}', calendar.bulan_angka)
      .replace('{BULAN_ROMAWI}', calendar.bulan_romawi)
      .replace('{TAHUN}', calendar.tahun);
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Modul Penomoran Resmi Desa
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Pengaturan Format & Urutan Nomor Surat
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Setiap jenis surat (SKTM, KTP, KK, Domisili, dll.) memiliki format kode klasifikasi dan nomor urut tersendiri yang diatur oleh kantor desa.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sinkronkan Kalender</span>
        </button>
      </div>

      {/* Alert Notice */}
      {message && (
        <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 animate-fade-in ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Calendar API Integration Ribbon */}
      <div className="card-surface p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-emerald-500/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/50">
                  API Kalender Resmi Terhubung
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Real-time Auto Sync</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {calendar ? `${calendar.hari}, ${calendar.formatted}` : 'Memuat Kalender...'}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
              <span className="text-[9px] uppercase text-emerald-300 font-bold block">Bulan Romawi</span>
              <span className="font-mono font-black text-white text-sm">{calendar?.bulan_romawi || 'X'}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
              <span className="text-[9px] uppercase text-emerald-300 font-bold block">Tahun Kalender</span>
              <span className="font-mono font-black text-white text-sm">{calendar?.tahun || '2026'}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
              <span className="text-[9px] uppercase text-emerald-300 font-bold block">Tanggal Padded</span>
              <span className="font-mono font-black text-white text-sm">{calendar?.tanggal || '08'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Surat Types Grid / Table */}
      <div className="card-surface p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Master Format & Urutan per Jenis Surat Desa
            </h3>
            <p className="text-xs text-slate-500">
              Klik tombol &ldquo;Edit Format&rdquo; untuk mengubah template penomoran atau mengatur ulang nomor urut surat.
            </p>
          </div>
          <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {types.length} Jenis Surat Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map((st) => (
            <div 
              key={st.id} 
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                    {st.kode_surat}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Klasifikasi: {st.kode_klasifikasi}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                    {st.nama_surat}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 truncate" title={st.format_nomor}>
                    Template: {st.format_nomor}
                  </p>
                </div>

                {/* Preview Box */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                  <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Preview Terbitan Berikutnya:</span>
                  </span>
                  <div className="font-mono font-black text-xs text-slate-900 break-all bg-white p-1.5 rounded-lg border border-slate-200">
                    {st.preview_nomor}
                  </div>
                </div>
              </div>

              {/* Footer Urutan & Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Urutan Terakhir:</span>
                  <span className="font-mono font-black text-emerald-800 text-sm">
                    #{st.nomor_terakhir}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">
                    (Next: #{st.nomor_berikutnya})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleEdit(st)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs press-down"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Format</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Edit Format & Urutan */}
      {editingType && (
        <div 
          onClick={() => setEditingType(null)}
          className="fixed inset-0 z-[999999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 animate-scale-up"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {editingType.kode_surat}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Atur Penomoran: {editingType.nama_surat}
                </h3>
              </div>
              <button 
                onClick={() => setEditingType(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* Kode Klasifikasi */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wide block">
                  Kode Klasifikasi Surat (Contoh: 401 untuk SKTM, 471 untuk KTP):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formKlasifikasi}
                    onChange={(e) => setFormKlasifikasi(e.target.value)}
                    placeholder="Contoh: 401 atau 470"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Format Template */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wide block">
                  Template Format Nomor Surat:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formFormat}
                    onChange={(e) => setFormFormat(e.target.value)}
                    placeholder="Contoh: {KLASIFIKASI}/{NO}/418.66.04/{BULAN_ROMAWI}/{TAHUN}"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="flex flex-wrap gap-1 pt-1 text-[10px] text-slate-500 font-mono">
                  <span>Token tersedia:</span>
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold">&#123;NO&#125;</code>
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold">&#123;KLASIFIKASI&#125;</code>
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold">&#123;BULAN_ROMAWI&#125;</code>
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold">&#123;BULAN&#125;</code>
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold">&#123;TAHUN&#125;</code>
                </div>
              </div>

              {/* Urutan Nomor Terakhir */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wide block">
                  Nomor Urut Terakhir yang Terbit (Counter Desa):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={formNomorTerakhir}
                    onChange={(e) => setFormNomorTerakhir(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Surat berikutnya otomatis akan mengambil nomor urut <strong>#{Number(formNomorTerakhir) + 1}</strong>.
                </p>
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-emerald-900">
                  <span>Hasil Generate No. Surat Berikutnya:</span>
                  <span className="text-emerald-700 font-mono">Live Preview</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-emerald-300 font-mono font-black text-xs text-emerald-950 break-all text-center">
                  {computeLivePreview()}
                </div>
                <p className="text-[10px] text-emerald-800/80 italic">
                  * Tanggal, bulan Romawi ({calendar?.bulan_romawi || 'X'}), dan tahun ({calendar?.tahun || '2026'}) diambil otomatis dari kalender hari ini.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingType(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
