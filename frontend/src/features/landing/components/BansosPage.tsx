import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Search, 
  QrCode, 
  BellRing, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Phone,
  Smartphone,
  Info
} from 'lucide-react';
import api from '@/shared/lib/axios';

export const BansosPage: React.FC = () => {
  const [nikSearch, setNikSearch] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const bansosPrograms = [
    {
      nama: 'Program Keluarga Harapan (PKH)',
      sumber: 'Kementerian Sosial RI',
      nominal: 'Rp 600.000 - Rp 750.000 / Tahap',
      tahap: 'Tahap III Tahun 2026',
      kriteria: 'Keluarga kurang mampu dengan komponen anak sekolah (SD/SMP/SMA), balita, ibu hamil, atau lansia.',
      jadwal: '25 Agustus 2026 (08.30 - 14.00 WIB)',
      lokasi: 'Pendopo Balai Desa Doko',
    },
    {
      nama: 'Bantuan Langsung Tunai Dana Desa (BLT-DD)',
      sumber: 'Dana Desa APBDes Doko 2026',
      nominal: 'Rp 300.000 / Bulan',
      tahap: 'Bulan Juli - Agustus 2026',
      kriteria: 'Keluarga miskin ekstrem, kehilangan mata pencaharian, tidak menerima bansos PKH/BPNT, dan memiliki anggota keluarga difabel/kronis.',
      jadwal: '28 Agustus 2026 (09.00 - 12.00 WIB)',
      lokasi: 'Ruang Pelayanan Balai Desa Doko',
    },
    {
      nama: 'Bantuan Pangan Non-Tunai (BPNT / Sembako)',
      sumber: 'Kemensos & Pos Indonesia',
      nominal: 'Bahan Pokok Beras 10kg + Telur & Minyak',
      tahap: 'Penyaluran Reguler Agustus 2026',
      kriteria: 'Keluarga Penerima Manfaat (KPM) terdaftar dalam Data Terpadu Kesejahteraan Sosial (DTKS).',
      jadwal: '30 Agustus 2026 (08.00 - 13.00 WIB)',
      lokasi: 'E-Warong BUMDes Doko Makmur',
    },
  ];

  const handleCekNik = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikSearch.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Mock search logic / query simulation
    setTimeout(() => {
      if (nikSearch.includes('35060415') || nikSearch.trim() === '3506041505840001') {
        setSearchResult({
          nik: nikSearch.trim(),
          nama: 'Bambang Utomo',
          rt: '01 / RW 01',
          dusun: 'Dusun Krajan',
          program: 'Program Keluarga Harapan (PKH) Tahap III 2026',
          status: 'Terdaftar & Siap Disalurkan',
          antrean: 'A-014',
          jadwal: '25 Agustus 2026, Pukul 08.30 WIB',
          lokasi: 'Pendopo Balai Desa Doko',
          nominal: 'Rp 750.000,-',
        });
      } else {
        setSearchResult(null);
      }
      setIsSearching(false);
    }, 600);
  };

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
              <HeartHandshake className="w-4 h-4 text-emerald-300" />
              <span>Jaring Pengaman Sosial & Kesejahteraan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Bantuan Sosial & Distribusi Tepat Sasaran
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-medium">
              Informasi resmi program bantuan sosial (PKH, BLT-DD, BPNT), cek mandiri status kepesertaan NIK, dan sistem broadcast jadwal ke WhatsApp warga di Kabupaten Kediri tanpa potongan biaya.
            </p>
          </div>
        </div>
      </section>

      {/* Cek NIK Kelayakan Mandiri */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="card-surface p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-widest">
              <Search className="w-3.5 h-3.5" /> Pengecekan Mandiri
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">
              Cek Status Kepesertaan Bansos Anda
            </h2>
            <p className="text-xs text-gray-500">
              Masukkan 16 digit Nomor Induk Kependudukan (NIK) Kepala Keluarga atau Pemohon
            </p>
          </div>

          <form onSubmit={handleCekNik} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Contoh: 3506041505840001"
                value={nikSearch}
                onChange={(e) => setNikSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#f9fbfa] rounded-xl border border-gray-300 text-xs font-medium focus-ring shadow-2xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all press-down disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSearching ? 'Memeriksa...' : 'Cek Status NIK'}
            </button>
          </form>

          {/* Quick NIK helper */}
          <div className="text-center text-xs text-gray-400">
            Contoh NIK penerima aktif demo: <button type="button" onClick={() => setNikSearch('3506041505840001')} className="text-emerald-700 underline font-mono font-medium">3506041505840001</button>
          </div>

          {/* Hasil Pengecekan */}
          {hasSearched && !isSearching && (
            <div className="pt-4 border-t border-gray-100">
              {searchResult ? (
                <div className="p-6 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-4 animate-fade-up">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-200">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                        {searchResult.status}
                      </span>
                      <h3 className="font-extrabold text-base text-gray-900 mt-1">{searchResult.nama}</h3>
                      <div className="text-xs text-gray-500 font-mono">NIK: {searchResult.nik} • {searchResult.dusun} (RT {searchResult.rt})</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-500">Nomor Antrean:</div>
                      <div className="text-2xl font-black text-emerald-800 font-mono">{searchResult.antrean}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <div className="text-gray-400 text-[10px]">Program Bantuan:</div>
                      <div className="font-bold text-gray-900">{searchResult.program}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <div className="text-gray-400 text-[10px]">Nominal Pencairan:</div>
                      <div className="font-bold text-emerald-800">{searchResult.nominal}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <div className="text-gray-400 text-[10px]">Jadwal & Lokasi:</div>
                      <div className="font-bold text-gray-900">{searchResult.jadwal}</div>
                      <div className="text-[11px] text-gray-500">{searchResult.lokasi}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Harap bawa KTP Asli, Kartu Keluarga (KK), dan tunjukkan kartu/QR saat hadir di balai desa.</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-2 animate-fade-up">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                  <div className="font-bold text-sm text-gray-900">NIK Tidak Terdaftar Sebagai Penerima Bansos Aktif</div>
                  <p className="text-xs text-gray-600 max-w-md mx-auto">
                    NIK yang Anda masukkan tidak tercatat dalam daftar penerima bantuan tahap berjalan. Apabila Anda merasa memenuhi kriteria namun belum terdaftar, silakan ajukan usulan melalui Musyawarah Dusun (Musdus) atau hubungi Ketua RT setempat.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3 Program Bansos Aktif */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Informasi Program</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Daftar Program Bantuan Sosial di Desa Doko
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bansosPrograms.map((b) => (
            <div key={b.nama} className="card-surface p-6 space-y-4 hover-lift flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {b.tahap}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-gray-900">{b.nama}</h3>
                <div className="text-xs text-gray-500 font-medium">Sumber Dana: <strong className="text-gray-700">{b.sumber}</strong></div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
                  <div className="text-[10px] text-gray-400">Besaran Manfaat:</div>
                  <div className="font-black text-sm text-emerald-900">{b.nominal}</div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>Kriteria:</strong> {b.kriteria}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 text-xs space-y-1.5 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{b.jadwal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{b.lokasi}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inovasi Broadcast WhatsApp dengan Dual Mode Verifikasi (Clean White Surface & Authentic WhatsApp Mockup) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-modern bg-white text-slate-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-slate-200/90 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Information */}
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-900 text-xs font-black border border-emerald-200 shadow-2xs">
                <BellRing className="w-3.5 h-3.5 text-emerald-700" /> 
                <span>Inovasi Aksesibilitas Inklusif (Dual-Mode)</span>
              </span>
              
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Notifikasi WhatsApp Otomatis: Pilihan QR Code & Teks Manual
              </h2>
              
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Kami memahami keragaman kemampuan teknologi warga Desa Doko. Sistem SIDes dirancang fleksibel dengan <strong className="text-slate-900">2 metode pencairan dana</strong> yang ramah untuk semua generasi:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1.5 shadow-2xs hover:border-emerald-300 transition-all">
                  <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    <span>1. Jalur Cepat QR Code (Anak Muda)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Bagi yang terbiasa gadget, cukup tunjukkan QR Code di WhatsApp/Web untuk scan 1 detik di meja petugas langsung cair.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1.5 shadow-2xs hover:border-amber-300 transition-all">
                  <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                    <span>👵 2. Jalur Teks Chat & KTP (Warga Sepuh)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Bagi warga lansia/gaptek, cukup perlihatkan isi teks chat berisi Nomor Antrean & KTP fisik asli ke petugas.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Light WhatsApp Chat Bubble */}
            <div className="lg:col-span-5 overflow-hidden rounded-3xl border border-slate-200 shadow-xl bg-[#efeae2]">
              {/* WhatsApp App Header (Authentic Bright Green) */}
              <div className="bg-[#008069] text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white p-0.5 shadow-xs shrink-0">
                    <img 
                      src="/images/logo-kediri.png" 
                      alt="Logo Kediri" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-black text-sm text-white flex items-center gap-1.5 leading-tight">
                      <span>Pemerintah Desa Doko</span>
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-300 text-[#008069]" />
                    </div>
                    <div className="text-[11px] text-emerald-100 font-medium">
                      WhatsApp Gateway Resmi • Online
                    </div>
                  </div>
                </div>

                <div className="bg-[#006a57] px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-100 border border-emerald-500/30">
                  Dual-Mode
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-4 space-y-3 font-sans text-xs">
                <div className="flex justify-center">
                  <span className="bg-white/80 text-[10px] font-bold text-slate-500 px-3 py-0.5 rounded-full shadow-2xs">
                    Hari Ini • 08.00 WIB
                  </span>
                </div>

                <div className="bg-white rounded-2xl rounded-tl-xs p-4 text-slate-800 shadow-sm border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-[#008069] font-black text-xs">
                    <span>🏛️ PEMERINTAH DESA DOKO</span>
                    <span className="text-[10px] text-slate-400 font-medium font-mono">08.02</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-xs">
                    Yth. Bpk/Ibu <strong className="text-slate-900 font-extrabold">Bambang Utomo</strong>,<br />
                    Bantuan <strong className="text-[#008069]">PKH Tahap III 2026</strong> sebesar <strong className="text-slate-900 font-extrabold">Rp 750.000</strong> siap disalurkan.
                  </p>

                  <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/80 space-y-1 text-[11px] text-slate-700">
                    <div className="flex justify-between"><span>📅 Tanggal:</span> <strong className="text-slate-900">25 Agustus 2026</strong></div>
                    <div className="flex justify-between"><span>⏰ Jam:</span> <strong className="text-slate-900">08.30 WIB (Sesi 1)</strong></div>
                    <div className="flex justify-between"><span>📍 Lokasi:</span> <strong className="text-slate-900">Pendopo Balai Desa</strong></div>
                    <div className="flex justify-between pt-1 border-t border-emerald-200/60 items-center">
                      <span className="text-emerald-800 font-bold">🎫 No. Antrean:</span>
                      <span className="text-sm font-black text-[#008069] bg-white px-2 py-0.5 rounded-md shadow-2xs border border-emerald-300 font-mono">
                        A-014
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center text-[10px] text-slate-500 font-medium">
                    💡 Bebas pilih: scan QR Code atau tunjukkan chat teks ini ke petugas di loket balai desa.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
