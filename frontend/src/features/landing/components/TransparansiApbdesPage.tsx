import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Building2, 
  FileSpreadsheet, 
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { ApbdesRecord } from '@/shared/types';

export const TransparansiApbdesPage: React.FC = () => {
  const [apbdesData, setApbdesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApbdes = async () => {
      try {
        const res = await api.get('/public/apbdes/summary');
        if (res.data.success) {
          setApbdesData(res.data);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchApbdes();
  }, []);

  const s = apbdesData?.summary;
  const records: ApbdesRecord[] = apbdesData?.records || [];

  return (
    <div className="space-y-14 py-8 page-enter">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#0b3323] via-[#0f442f] to-[#072418] text-white shadow-xl relative overflow-hidden border border-emerald-800/80">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/90 text-emerald-200 text-xs font-extrabold border border-emerald-600/60 shadow-xs">
              <BarChart3 className="w-4 h-4 text-emerald-300" />
              <span>Akuntabilitas & Transparansi Keuangan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Transparansi APBDes {apbdesData?.tahun || 2026}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-medium">
              Laporan terbuka Anggaran Pendapatan dan Belanja Desa (APBDes) di Kabupaten Kediri. Publikasi anggaran pendapatan dan belanja desa demi tata kelola yang bersih dan akuntabel.
            </p>
          </div>
        </div>
      </section>

      {/* Financial Summary 3 Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-surface p-6 space-y-4 hover-lift">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-gray-700">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Pendapatan Desa
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                {s?.pendapatan?.persen || 60.8}% Terealisasi
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900">
              Rp {Number(s?.pendapatan?.realisasi || 675000000).toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-gray-500">
              Target Anggaran: Rp {Number(s?.pendapatan?.anggaran || 1110000000).toLocaleString('id-ID')}
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full progress-fill" 
                style={{ width: `${s?.pendapatan?.persen || 60.8}%` }}
              />
            </div>
            <div className="text-[11px] text-gray-400">
              Sumber: PADes, Dana Desa (DD), ADD, Bagi Hasil Pajak Daerah Kab. Kediri.
            </div>
          </div>

          <div className="card-surface p-6 space-y-4 hover-lift">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-gray-700">
                <TrendingDown className="w-4 h-4 text-emerald-700" /> Belanja Pembangunan
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                {s?.belanja?.persen || 92.5}% Terserap
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-900">
              Rp {Number(s?.belanja?.realisasi || 217500000).toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-gray-500">
              Pagu Anggaran: Rp {Number(s?.belanja?.anggaran || 235000000).toLocaleString('id-ID')}
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-700 h-full rounded-full progress-fill" 
                style={{ width: `${s?.belanja?.persen || 92.5}%` }}
              />
            </div>
            <div className="text-[11px] text-gray-400">
              Alokasi: Irigasi pertanian, rabat beton jalan RT, posyandu balita/lansia, & UMKM.
            </div>
          </div>

          <div className="card-surface p-6 space-y-4 hover-lift">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-gray-700">
                <Wallet className="w-4 h-4 text-emerald-700" /> Sisa Kas & Pembiayaan
              </span>
              <span className="text-emerald-800 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Sehat (Surplus)
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-800">
              Rp {((s?.pendapatan?.realisasi || 675000000) - (s?.belanja?.realisasi || 217500000)).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Saldo kas aktif desa dikelola secara prudent melalui Rekening Kas Desa (RKD) di Bank Jatim Cabang Kediri.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-800 font-bold">
              Status Siskeudes Online: Terverifikasi
            </div>
          </div>
        </div>
      </section>

      {/* Rincian Pos APBDes Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-surface p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Detail Realisasi</div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Rincian Pos Anggaran Desa Doko Tahun {apbdesData?.tahun || 2026}
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Sesuai Peraturan Desa No. 03 Tahun 2026
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faf9] text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Kode Rekening</th>
                  <th className="p-3.5">Pos & Kategori</th>
                  <th className="p-3.5">Uraian Kegiatan / Sumber</th>
                  <th className="p-3.5 text-right">Pagu Anggaran (Rp)</th>
                  <th className="p-3.5 text-right">Realisasi (Rp)</th>
                  <th className="p-3.5 text-center">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.length > 0 ? (
                  records.map((r) => {
                    const persen = r.anggaran > 0 ? Math.round((r.realisasi / r.anggaran) * 100) : 0;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-gray-600">{r.category?.kode_rekening}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">{r.category?.nama_kategori}</div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.category?.jenis === 'Pendapatan' ? 'bg-emerald-100 text-emerald-800' :
                            r.category?.jenis === 'Belanja' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {r.category?.jenis}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-700 font-medium">{r.uraian}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-gray-800">
                          {Number(r.anggaran).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-800">
                          {Number(r.realisasi).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            {persen}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Belum ada data pos anggaran yang dimuat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5 Pilar Penggunaan Dana Desa */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-surface p-8 space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Prioritas Penggunaan</div>
            <h2 className="text-xl font-extrabold text-gray-900">
              5 Pilar Fokus Pembangunan Desa Doko 2026
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="font-bold text-sm text-gray-900">1. Infrastruktur Pertanian</div>
              <p className="text-gray-600">Rehabilitasi saluran irigasi tersier 850m di Dusun Krajan & Doko Timur untuk mengairi sawah produktif.</p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="font-bold text-sm text-gray-900">2. Peningkatan Jalan Lingkungan</div>
              <p className="text-gray-600">Pavingisasi jalan gang di 6 titik RT dan drainase pencegah genangan saat musim hujan.</p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="font-bold text-sm text-gray-900">3. Penanganan Stunting & Kesehatan</div>
              <p className="text-gray-600">Pemberian Makanan Tambahan (PMT) balita & lansia di 8 posyandu terpadu setiap bulan.</p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="font-bold text-sm text-gray-900">4. Pemberdayaan Ekonomi & BUMDes</div>
              <p className="text-gray-600">Penyertaan modal BUMDes 'Doko Makmur' untuk unit simpan pinjam dan sentra pemasaran produk UMKM.</p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="font-bold text-sm text-gray-900">5. Transformasi Desa Digital</div>
              <p className="text-gray-600">Pengadaan infrastruktur server SIDes, wifi gratis balai desa, dan pelatihan digitalisasi RT/RW.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
