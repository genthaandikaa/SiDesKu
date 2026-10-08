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
  Layers,
  Sparkles
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
    <div className="page-enter relative w-full overflow-hidden flex flex-col font-sans text-slate-800">
      
      {/* Div 1: Clean Ambient Hero Section with SVG Vectors (Canvas Mint) */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 sm:pb-20 overflow-hidden">
        {/* SVG Ambient Concentric Watermark Vectors */}
        <svg className="absolute -right-20 -top-20 w-[500px] h-[500px] text-emerald-200/35 pointer-events-none -z-10" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="40" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg className="absolute -left-20 top-1/4 w-[420px] h-[420px] text-teal-200/25 pointer-events-none -z-10" viewBox="0 0 400 400" fill="none">
          <path d="M 0,200 Q 100,70 200,200 T 400,200" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 0,230 Q 100,100 200,230 T 400,230" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column (60% Fibonacci): Title, Eyebrow, and Description */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-black border border-emerald-200 shadow-2xs">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Akuntabilitas & Transparansi Keuangan Desa</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Transparansi{' '}
              <span className="relative whitespace-nowrap text-emerald-700 inline-block">
                APBDes {apbdesData?.tahun || 2026}
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 15 Q 50 0, 100 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-xl">
              Laporan terbuka Anggaran Pendapatan dan Belanja Desa (APBDes) di Kabupaten Kediri. Publikasi rincian anggaran pendapatan dan belanja desa demi tata kelola yang bersih dan akuntabel.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <strong className="text-slate-800">Siskeudes Terintegrasi</strong> resmi
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <strong className="text-slate-800">100% Audit Terbuka</strong> warga
              </span>
            </div>
          </div>

          {/* Right Column (40% Fibonacci): Financial Gauge Mockup */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="w-full max-w-md animate-float-gentle">
              <div className="card-elevated-mockup p-6 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-900/5 space-y-4">
                
                {/* Top Bar with Badge */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-xs text-slate-900 leading-tight">
                        Kas Rekening Kas Desa
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold">
                        Bank Jatim Cabang Kediri
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200">
                    Surplus
                  </span>
                </div>

                {/* Financial Snapshot */}
                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Total Anggaran Pagu:</span>
                    <span className="font-black text-slate-900">Rp {Number(s?.pendapatan?.anggaran || 1110000000).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Realisasi Terserap:</span>
                    <span className="font-bold text-emerald-700">{s?.belanja?.persen || 92.5}% Efektif</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${s?.belanja?.persen || 92.5}%` }} />
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verifikasi Inspektorat Daerah</span>
                  </span>
                  <span className="font-bold text-slate-700">Opini WTP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating 3 Financial Cards - Straddling Seam Line (Fibonacci Golden Ratio) */}
      <div className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mb-[52px] sm:-mb-[58px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Pendapatan */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg hover:shadow-2xl rounded-3xl p-5 sm:p-6 space-y-3 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Pendapatan Desa
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                {s?.pendapatan?.persen || 60.8}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:scale-102 transition-transform">
              Rp {Number(s?.pendapatan?.realisasi || 675000000).toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-slate-500">
              Target: Rp {Number(s?.pendapatan?.anggaran || 1110000000).toLocaleString('id-ID')}
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full" 
                style={{ width: `${s?.pendapatan?.persen || 60.8}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400">
              Sumber: PADes, Dana Desa (DD), ADD, Bagi Hasil Pajak.
            </div>
          </div>

          {/* Card 2: Belanja */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg hover:shadow-2xl rounded-3xl p-5 sm:p-6 space-y-3 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">
                <TrendingDown className="w-4 h-4 text-emerald-700" /> Belanja Pembangunan
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                {s?.belanja?.persen || 92.5}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight leading-none group-hover:scale-102 transition-transform">
              Rp {Number(s?.belanja?.realisasi || 217500000).toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] text-slate-500">
              Pagu: Rp {Number(s?.belanja?.anggaran || 235000000).toLocaleString('id-ID')}
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-700 h-full rounded-full" 
                style={{ width: `${s?.belanja?.persen || 92.5}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400">
              Alokasi: Irigasi, rabat beton jalan RT, posyandu & UMKM.
            </div>
          </div>

          {/* Card 3: Surplus & Kas */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg hover:shadow-2xl rounded-3xl p-5 sm:p-6 space-y-3 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">
                <Wallet className="w-4 h-4 text-emerald-700" /> Sisa Kas & Pembiayaan
              </span>
              <span className="text-emerald-800 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Surplus
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:scale-102 transition-transform">
              Rp {((s?.pendapatan?.realisasi || 675000000) - (s?.belanja?.realisasi || 217500000)).toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Saldo kas aktif desa dikelola secara prudent melalui Rekening Kas Desa (RKD) Bank Jatim.
            </p>
            <div className="pt-1 text-[10px] font-mono text-emerald-700 font-bold">
              Status Siskeudes: Terverifikasi Sah
            </div>
          </div>
        </div>
      </div>

      {/* Div 2: Rincian Pos APBDes (Full-Width Pure White Band) */}
      <section className="w-full bg-white pt-20 sm:pt-24 pb-16 sm:pb-24 border-y border-slate-200/80 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 uppercase tracking-widest mb-1">
                Detail Realisasi
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Rincian Pos Anggaran Desa Doko Tahun {apbdesData?.tahun || 2026}
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Sesuai Peraturan Desa No. 03 Tahun 2026
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-3xl shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8faf9] text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th className="p-4">Kode Rekening</th>
                  <th className="p-4">Pos & Kategori</th>
                  <th className="p-4">Uraian Kegiatan / Sumber</th>
                  <th className="p-4 text-right">Pagu Anggaran (Rp)</th>
                  <th className="p-4 text-right">Realisasi (Rp)</th>
                  <th className="p-4 text-center">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length > 0 ? (
                  records.map((r) => {
                    const persen = r.anggaran > 0 ? Math.round((r.realisasi / r.anggaran) * 100) : 0;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-600">{r.category?.kode_rekening}</td>
                        <td className="p-4">
                          <div className="font-extrabold text-slate-900">{r.category?.nama_kategori}</div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            r.category?.jenis === 'Pendapatan' ? 'bg-emerald-100 text-emerald-800' :
                            r.category?.jenis === 'Belanja' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {r.category?.jenis}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">{r.uraian}</td>
                        <td className="p-4 text-right font-mono font-bold text-slate-800">
                          {Number(r.anggaran).toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-700">
                          {Number(r.realisasi).toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200">
                            {persen}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Belum ada data pos anggaran yang dimuat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Div 3: 5 Pilar Fokus Pembangunan (Full-Width Emerald Background Banner Band) */}
      <section className="w-full bg-gradient-to-b from-[#065f46] via-[#047857] to-[#064e3b] py-16 sm:py-24 text-white relative overflow-hidden">
        {/* Concentric Circle Orbit Watermark */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-black border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>PRIORITAS PENGGUNAAN DANA DESA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              5 Pilar Fokus Pembangunan Desa Doko 2026
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
              Alokasi strategis untuk pemerataan sarana publik, ketahanan pangan, pengentasan stunting, dan digitalisasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-2.5 shadow-xl">
              <div className="font-extrabold text-sm text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-black">1</span>
                <span>Infrastruktur Pertanian</span>
              </div>
              <p className="text-emerald-100/85 leading-relaxed">
                Rehabilitasi saluran irigasi tersier 850m di Dusun Krajan & Doko Timur untuk mengairi sawah produktif.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-2.5 shadow-xl">
              <div className="font-extrabold text-sm text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-black">2</span>
                <span>Peningkatan Jalan Lingkungan</span>
              </div>
              <p className="text-emerald-100/85 leading-relaxed">
                Pavingisasi jalan gang di 6 titik RT dan drainase pencegah genangan saat musim hujan.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-2.5 shadow-xl">
              <div className="font-extrabold text-sm text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-black">3</span>
                <span>Penanganan Stunting & Kesehatan</span>
              </div>
              <p className="text-emerald-100/85 leading-relaxed">
                Pemberian Makanan Tambahan (PMT) balita & lansia di 8 posyandu terpadu setiap bulan secara rutin.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-2.5 shadow-xl">
              <div className="font-extrabold text-sm text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-black">4</span>
                <span>Pemberdayaan Ekonomi & BUMDes</span>
              </div>
              <p className="text-emerald-100/85 leading-relaxed">
                Penyertaan modal BUMDes 'Doko Makmur' untuk unit simpan pinjam dan sentra pemasaran produk UMKM lokal.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-2.5 shadow-xl sm:col-span-2 lg:col-span-1">
              <div className="font-extrabold text-sm text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs font-black">5</span>
                <span>Transformasi Desa Digital</span>
              </div>
              <p className="text-emerald-100/85 leading-relaxed">
                Pengadaan infrastruktur server SIDes, wifi gratis balai desa, dan pelatihan digitalisasi operasional pengurus RT/RW.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
