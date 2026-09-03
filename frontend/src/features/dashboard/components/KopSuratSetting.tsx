import React, { useState, useEffect } from 'react';
import { Building2, Save, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import api from '@/shared/lib/axios';
import { DesaSetting } from '@/shared/types';

export const KopSuratSetting: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string>('/images/logo-kediri.png');
  const [formData, setFormData] = useState<Partial<DesaSetting>>({
    kop_atas: 'PEMERINTAH KABUPATEN KEDIRI',
    kop_tengah: 'KECAMATAN NGASEM',
    kop_bawah: 'KANTOR KEPALA DESA DOKO',
    kop_footer: 'Jl. Raya Doko No. 12 Kec. Ngasem Kab. Kediri, Jawa Timur 64182, Telp. (0354) 681234, Email: pemdes.doko@kedirikab.go.id',
    nama_kades: 'Drs. H. Bambang Prasetyo, M.Si',
    nama_sekdes: 'Ahmad Fauzi, S.Kom',
    nip_sekdes: '19850412 201101 1 003',
  });
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/desa');
      if (res.data.success && res.data.data) {
        setFormData(res.data.data);
      }
    } catch {
      //
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await api.put('/settings/desa', formData);
      if (res.data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err: any) {
      alert('Gagal menyimpan kop surat: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0f241d]">Pengaturan Kop Surat Desa Dinamis</h2>
          <p className="text-xs text-gray-500">
            Sesuaikan identitas, logo resmi, teks kop, dan footer yang otomatis dicetak pada seluruh surat resmi desa.
          </p>
        </div>
        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-fade-in">
            <Check className="w-4 h-4" /> Tersimpan & Aktif pada Seluruh Surat
          </span>
        )}
      </div>

      {/* Live Document Preview Box matching User Screenshot Style */}
      <div className="bg-white rounded-2xl border border-[#d8e3dc] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
          <span>Live Document Header Preview</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">Format Baku</span>
        </div>

        {/* The Letterhead Frame */}
        <div className="bg-white border border-gray-300 p-6 sm:p-8 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Official Logo Emblem */}
            <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center shrink-0">
              <img 
                src={logoUrl || '/images/logo-kediri.png'} 
                alt="Logo Resmi Kabupaten Kediri / Desa Doko" 
                className="w-full h-full object-contain filter contrast-110 drop-shadow-2xs"
                onError={(e) => {
                  e.currentTarget.src = '/images/logo-kediri.png';
                }}
              />
            </div>

            {/* Letterhead Text Hierarchy */}
            <div className="flex-1 text-center space-y-1">
              <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700">
                {formData.kop_atas || 'PEMERINTAH KABUPATEN KEDIRI'}
              </div>
              <div className="text-base sm:text-xl font-black uppercase tracking-tight text-gray-900">
                "{formData.kop_tengah || 'KECAMATAN NGASEM'}"
              </div>
              <div className="text-sm sm:text-base font-bold uppercase text-gray-800">
                {formData.kop_bawah || 'KANTOR KEPALA DESA DOKO'}
              </div>
              <div className="text-[11px] sm:text-xs text-gray-600 pt-1 font-serif leading-tight">
                {formData.kop_footer || 'Jl. Raya Doko No. 12 Kec. Ngasem Kab. Kediri 64182, Telp. (0354) 681234, Email: pemdes.doko@kedirikab.go.id'}
              </div>
            </div>
          </div>

          {/* Double Border Line of Indonesian Official Letter */}
          <div className="space-y-0.5 pt-2">
            <div className="border-t-2 border-black"></div>
            <div className="border-t border-black"></div>
          </div>
        </div>
      </div>

      {/* Editor Form matching Reference Screenshot */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#d8e3dc] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Logo Configuration Strip */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 bg-white p-1.5 rounded-xl border border-emerald-300 shadow-2xs flex items-center justify-center shrink-0">
              <img 
                src={logoUrl || '/images/logo-kediri.png'} 
                alt="Logo Preview" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-900">Logo Lambang Resmi Kop Surat</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Format resmi: Lambang Daerah Kabupaten Kediri (PNG Transparan / High-Res)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Ganti Logo</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload} 
                className="hidden" 
              />
            </label>
            <button
              type="button"
              onClick={() => setLogoUrl('/images/logo-kediri.png')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Reset Baku
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Kop Atas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="kop_atas"
              required
              placeholder="Masukkan kop atas (cth: PEMERINTAH KABUPATEN KEDIRI)"
              value={formData.kop_atas || ''}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Kop Tengah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="kop_tengah"
              required
              placeholder="Masukkan kop tengah (cth: KECAMATAN NGASEM)"
              value={formData.kop_tengah || ''}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Kop Bawah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="kop_bawah"
              required
              placeholder="Masukkan kop bawah (cth: KANTOR KEPALA DESA DOKO)"
              value={formData.kop_bawah || ''}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Footer / Alamat Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="kop_footer"
              required
              placeholder="Masukkan footer alamat & kontak desa"
              value={formData.kop_footer || ''}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nama Kepala Desa (Penandatangan Utama)
            </label>
            <input
              type="text"
              name="nama_kades"
              value={formData.nama_kades || ''}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nama Sekretaris Desa (Legalisator Surat)
            </label>
            <input
              type="text"
              name="nama_sekdes"
              value={formData.nama_sekdes || ''}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
};
