import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Printer, 
  ArrowRight,
  Download,
  Building2,
} from 'lucide-react';

export const BansosPage: React.FC = () => {
  const [nikSearch, setNikSearch] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-bulog-active');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handlePrintBulog = () => {
    document.body.classList.add('printing-bulog-active');
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 50);
    });
  };

  const bansosPrograms = [
    {
      nama: 'Bantuan Pangan Beras (CBP)',
      sumber: 'Bapanas & Bulog',
      nominal: '30 (Tiga Puluh) Kg Beras',
      tahap: 'Juli–September 2026',
      kriteria: 'Terdaftar sebagai penerima bantuan pangan.',
      jadwal: 'Selasa, 18 Agustus 2026 (Waktu Setempat)',
      lokasi: 'Kantor Balai Desa',
      noSurat: 'UND/18/08/26/115001',
    },
    {
      nama: 'Program Keluarga Harapan (PKH)',
      sumber: 'Kemensos',
      nominal: 'Rp 600.000 - Rp 750.000 / Tahap',
      tahap: 'Tahap III Tahun 2026',
      kriteria: 'Keluarga terdaftar dengan anak sekolah, balita, ibu hamil, atau lansia.',
      jadwal: '25 Agustus 2026 (08.30 - 14.00 WIB)',
      lokasi: 'Pendopo Balai Desa',
      noSurat: 'PKH/2026/A-014/DOKO',
    },
    {
      nama: 'Bantuan Langsung Tunai Dana Desa (BLT-DD)',
      sumber: 'Dana Desa',
      nominal: 'Rp 300.000 / Bulan',
      tahap: 'Bulan Juli - Agustus 2026',
      kriteria: 'Keluarga rentan yang tidak menerima PKH/BPNT.',
      jadwal: '28 Agustus 2026 (09.00 - 12.00 WIB)',
      lokasi: 'Ruang Pelayanan Balai Desa',
      noSurat: 'BLT-DD/2026/08/DOKO',
    },
  ];

  const handleCekNik = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikSearch.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    setTimeout(() => {
      const q = nikSearch.trim().toLowerCase();
      if (q.includes('430376') || q.includes('yati') || q.includes('1340') || q.includes('350606') || q === '3506064303760001') {
        setSearchResult({
          tipe: 'undangan_bulog',
          judulSurat: 'UNDANGAN PENERIMA BANTUAN PANGAN BERAS PERIODE BULAN JULI SAMPAI DENGAN SEPTEMBER TAHUN 2026',
          provinsi: 'JAWA TIMUR',
          kabupaten: 'KAB. KEDIRI',
          kecamatan: 'Wates / Ngasem',
          desa: 'Desa Doko (Wilayah Tunge)',
          tanggalSurat: 'Kab. Kediri, Kamis, 13 Agustus 2026',
          nomorSurat: 'UND/18/08/26/115001',
          perihal: 'UNDANGAN',
          nama: 'Supriyadi',
          nik: '3506064303760001',
          nikMasked: '******4303760001',
          alamat: 'RT 38 / RW 6',
          hariTanggal: 'Selasa, 18 Agustus 2026',
          jam: '- s.d - Waktu Setempat',
          tempat: 'KANTOR DESA',
          keperluan: 'Mengambil Bantuan Pangan alokasi bulan Juli - September 2026 sejumlah 30 (tiga puluh) Kg Beras',
          alokasi: '30 (tiga puluh) Kg Beras',
          noUrut: '1340',
          barcode: '350606200801340',
          status: 'Undangan Resmi Terbit • Siap Diambil',
          persyaratan: [
            'Membawa surat undangan ini (Digital / Fisik)',
            'Jika diambil sendiri: Membawa KTP asli / IKD',
            'Jika diwakilkan dalam 1 KK: membawa KTP asli/IKD orang yang mewakili, asli/fotocopy KTP orang yang diwakili, dan KK',
            'Jika diwakilkan diluar KK: membawa KTP asli/IKD dan KK orang yang mewakili, serta asli/fotocopy KTP orang yang diwakili',
            'Jika pengganti: membawa KTP asli/IKD dan KK',
            'Jika KTP atau KK hilang/rusak agar membawa surat keterangan hilang/rusak dari aparat yang berwenang'
          ],
          catatanBatas: 'Harap diambil tepat pada waktunya. Jika setelah 5 (lima) hari tidak diambil tanpa keterangan, akan dilakukan penggantian PBP. Demikian atas kehadirannya disampaikan terima kasih.'
        });
      } else if (q.includes('35060415') || q.includes('bambang') || q === '3506041505840001') {
        setSearchResult({
          tipe: 'reguler',
          nik: '3506041505840001',
          nama: 'Bambang Utomo',
          rt: '01 / RW 01',
          dusun: 'Dusun Krajan',
          program: 'Program Keluarga Harapan (PKH) Tahap III 2026',
          status: 'Terdaftar & Siap Disalurkan',
          antrean: 'A-014',
          jadwal: '25 Agustus 2026, Pukul 08.30 WIB',
          lokasi: 'Pendopo Balai Desa Doko',
          nominal: 'Rp 750.000,-',
          barcode: 'PKH2026-A014-3506',
        });
      } else {
        setSearchResult(null);
      }
      setIsSearching(false);
    }, 450);
  };

  return (
    <div className="page-enter relative w-full overflow-hidden flex flex-col font-sans text-slate-800 bg-white">

      {/* Div 1: Clean Ambient Hero Section with SVG Vectors (Canvas Mint) */}
      <section className="relative isolate w-full px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 sm:pb-10 text-center overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-blue-500/15 via-sky-400/10 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-blue-500/20 via-sky-400/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        {/* SVG Ambient Concentric Watermark Vectors */}
        <svg className="absolute -right-20 -top-20 w-[500px] h-[500px] text-blue-200/35 pointer-events-none -z-10" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="40" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg className="absolute -left-20 top-1/4 w-[420px] h-[420px] text-indigo-200/25 pointer-events-none -z-10" viewBox="0 0 400 400" fill="none">
          <path d="M 0,200 Q 100,70 200,200 T 400,200" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 0,230 Q 100,100 200,230 T 400,230" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>

        <div className="relative z-10 mx-auto max-w-4xl">

          {/* Left Column (60% Fibonacci): Title, Eyebrow, and Description */}
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 text-blue-800 text-xs font-black border border-blue-200 shadow-2xs">
              <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
              <span>Jaring Pengaman Sosial & Kesejahteraan</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 leading-[1.08] max-w-4xl mx-auto">
              Bantuan Sosial{' '}
              <span className="relative whitespace-nowrap text-blue-700 inline-block">
                Desa Doko
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-400" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 15 Q 50 0, 100 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>



            <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <strong className="text-slate-800">Bebas pungli</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <strong className="text-slate-800">Data DTKS</strong>
              </span>
            </div>
          </div>

          {/* Right Column (40% Fibonacci): Bansos Mockup Preview */}
          <div className="hidden">
            <div className="w-full max-w-md animate-float-gentle">
              <div className="card-elevated-mockup p-6 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-900/5 space-y-4">

                {/* Top Bar with Badge */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-xs text-slate-900 leading-tight">
                        Penyaluran Bansos PKH
                      </div>
                      <div className="text-[10px] text-blue-600 font-bold">
                        Kemensos & Pemkab Kediri
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold text-[10px] border border-blue-200">
                    Tersalurkan
                  </span>
                </div>

                {/* Bansos Snapshot */}
                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Keluarga Penerima (KPM):</span>
                    <span className="font-black text-slate-900">84 KPM Terdaftar</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Status Penyaluran:</span>
                    <span className="font-bold text-blue-700">100% Tuntas Tahap III</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-blue-600 h-full rounded-full w-full" />
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Notifikasi WA Otomatis Terkirim</span>
                  </span>
                  <span className="font-bold text-slate-700">Tepat Sasaran</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Cek NIK Bridge Card - Straddling Seam Line */}
      <div className="relative z-30 mt-6 sm:mt-8 max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] border border-slate-200/90 p-6 sm:p-7 space-y-4 shadow-xl shadow-slate-900/10">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-900">
              Cek Kepesertaan Bansos
            </h2>
          </div>

          <form onSubmit={handleCekNik} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Masukkan 16 digit NIK"
                value={nikSearch}
                onChange={(e) => setNikSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-2xs transition-all font-mono text-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all press-down disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSearching ? 'Memeriksa...' : 'Cek NIK'}
            </button>
          </form>

          {/* Quick NIK helper */}
          <div className="text-center text-xs text-slate-500 space-y-2 pt-1 border-t border-slate-100">
            <div>Contoh NIK:</div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNikSearch('3506064303760001');
                }}
                className="px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-mono text-[11px] font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <span>3506064303760001</span>
                <span className="text-blue-700 font-semibold">(Supriyadi - Beras Bulog 30 Kg)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNikSearch('3506041505840001');
                }}
                className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-mono text-[11px] font-medium transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <span>3506041505840001</span>
                <span className="text-slate-600">(Bpk. Bambang Utomo - PKH)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Div 2: Hasil Pencarian & Daftar Program Bansos (Full-Width Pure White Band) */}
      <section className="w-full bg-white pt-10 sm:pt-12 pb-16 sm:pb-24 border-b border-slate-200/80 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Hasil Pengecekan NIK */}
          {hasSearched && !isSearching && (
            <div className="animate-fade-in max-w-4xl mx-auto">
              {searchResult ? (
                searchResult.tipe === 'undangan_bulog' ? (
                  /* Authentic Replica of Surat Undangan Bulog */
                  <div className="bg-white rounded-3xl border-2 border-slate-300 p-5 sm:p-8 shadow-2xl space-y-5 animate-fade-up font-sans text-slate-900 print:hidden">
                    {/* Header */}
                    <div className="border-b-2 border-dashed border-slate-300 pb-4 text-center space-y-1">
                      <div className="text-xs sm:text-sm font-black tracking-widest uppercase text-slate-900 leading-tight">
                        UNDANGAN PENERIMA
                      </div>
                      <div className="text-sm sm:text-base font-black tracking-tight uppercase text-slate-900 leading-tight">
                        BANTUAN PANGAN BERAS PERIODE BULAN JULI
                      </div>
                      <div className="text-xs sm:text-sm font-black tracking-tight uppercase text-slate-900 leading-tight">
                        SAMPAI DENGAN SEPTEMBER TAHUN 2026
                      </div>
                    </div>

                    {/* Metadata Table */}
                    <div className="grid grid-cols-2 gap-4 text-[11px] sm:text-xs text-slate-800 font-medium">
                      <div className="space-y-1">
                        <div className="flex"><span className="w-24 text-slate-500">Provinsi</span><span className="font-bold">: {searchResult.provinsi}</span></div>
                        <div className="flex"><span className="w-24 text-slate-500">Kecamatan</span><span className="font-bold">: {searchResult.kecamatan}</span></div>
                      </div>
                      <div className="space-y-1 sm:pl-4">
                        <div className="flex"><span className="w-28 text-slate-500">Kabupaten/Kota</span><span className="font-bold">: {searchResult.kabupaten}</span></div>
                        <div className="flex"><span className="w-28 text-slate-500">Kelurahan/Desa</span><span className="font-bold">: {searchResult.desa}</span></div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-right text-[11px] sm:text-xs text-slate-600 font-medium pt-1">
                      {searchResult.tanggalSurat}
                    </div>

                    {/* Letter Identification & Recipient Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-100">
                      <div className="space-y-1 pt-1">
                        <div className="flex"><span className="w-20 text-slate-500">Nomor</span><span className="font-mono font-bold">: {searchResult.nomorSurat}</span></div>
                        <div className="flex"><span className="w-20 text-slate-500">Perihal</span><span className="font-bold uppercase">: {searchResult.perihal}</span></div>
                      </div>
                      <div className="space-y-0.5 sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-none border-slate-200">
                        <div className="text-slate-500 text-[11px]">Kepada Yth :</div>
                        <div className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                          {searchResult.nama}
                        </div>
                        <div className="text-[11px] font-mono text-slate-600">
                          NIK: {searchResult.nikMasked}
                        </div>
                        <div className="text-xs font-bold text-slate-700">
                          Alamat: {searchResult.alamat}
                        </div>
                      </div>
                    </div>

                    {/* Body Invitation */}
                    <div className="text-xs sm:text-sm space-y-2 pt-2 border-t border-slate-200">
                      <p className="text-slate-700 font-medium">
                        Mengharapkan kehadiran Bapak/Ibu/Saudara besok pada :
                      </p>
                      <div className="pl-2 sm:pl-4 space-y-1.5 text-xs sm:text-sm text-slate-800">
                        <div className="flex"><span className="w-28 text-slate-500 shrink-0">Hari/Tanggal</span><span className="font-bold">: {searchResult.hariTanggal}</span></div>
                        <div className="flex"><span className="w-28 text-slate-500 shrink-0">Jam</span><span className="font-bold">: {searchResult.jam}</span></div>
                        <div className="flex"><span className="w-28 text-slate-500 shrink-0">Tempat</span><span className="font-bold uppercase">: {searchResult.tempat}</span></div>
                        <div className="flex items-start"><span className="w-28 text-slate-500 shrink-0">Keperluan</span><span className="font-bold text-blue-900 leading-snug">: {searchResult.keperluan}</span></div>
                      </div>
                    </div>

                    {/* Persyaratan */}
                    <div className="text-[11px] sm:text-xs space-y-1.5 pt-2 text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="font-extrabold text-slate-900 uppercase tracking-wide">
                        Persyaratan Pengambilan Bantuan:
                      </div>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-700 leading-relaxed">
                        {searchResult.persyaratan.map((syarat: string, sIdx: number) => (
                          <li key={sIdx}>{syarat}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Catatan Batas */}
                    <div className="text-[11px] text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200/90 font-medium leading-relaxed">
                      {searchResult.catatanBatas}
                    </div>

                    {/* Footer: QR Code Barcode + No Urut + Bulog Signature */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t-2 border-dashed border-slate-300">
                      <div className="text-center space-y-1.5">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-300 inline-block shadow-xs">
                          <img
                            src={`/api/public/surat/qr?data=${searchResult.barcode}`}
                            alt={`Barcode Bantuan ${searchResult.barcode}`}
                            className="w-28 h-28 sm:w-32 sm:h-32 mx-auto object-contain"
                          />
                          <div className="text-xs font-mono font-black text-slate-900 tracking-wider mt-1.5">
                            {searchResult.barcode}
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Kode Barcode Terdaftar Resmi</div>
                      </div>

                      <div className="text-center sm:text-right space-y-2">
                        <div className="text-xs text-slate-600 font-medium">
                          <div>Hormat Kami,</div>
                          <div className="font-extrabold text-slate-900 text-sm">Perum BULOG & Pemerintah Desa</div>
                        </div>
                        <div className="pt-2">
                          <div className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
                            No. Urut Pengambilan
                          </div>
                          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900">
                            {searchResult.noUrut}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Print & Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 print:hidden">
                      <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Dokumen Sah & Berlaku Resmi Tanpa Perlu Surat Kertas</span>
                      </div>
                      <button
                        type="button"
                        onClick={handlePrintBulog}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 press-down cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Cetak / Unduh Undangan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Card for PKH */
                  <div className="p-6 bg-blue-50/80 rounded-3xl border border-blue-200 space-y-4 shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-200">
                      <div>
                        <span className="text-[10px] font-bold text-blue-800 bg-white px-2.5 py-0.5 rounded-full border border-blue-300">
                          {searchResult.status}
                        </span>
                        <h3 className="font-black text-lg text-slate-900 mt-1">{searchResult.nama}</h3>
                        <div className="text-xs text-slate-600 font-mono">NIK: {searchResult.nik} • {searchResult.dusun} (RT {searchResult.rt})</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500">Nomor Antrean:</div>
                        <div className="text-2xl font-black text-blue-800 font-mono">{searchResult.antrean}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                        <div className="text-slate-400 text-[10px]">Program Bantuan:</div>
                        <div className="font-bold text-slate-900">{searchResult.program}</div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                        <div className="text-slate-400 text-[10px]">Nominal Pencairan:</div>
                        <div className="font-bold text-blue-800">{searchResult.nominal}</div>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-2xs">
                        <div className="text-slate-400 text-[10px]">Jadwal & Lokasi:</div>
                        <div className="font-bold text-slate-900">{searchResult.jadwal}</div>
                        <div className="text-[11px] text-slate-500">{searchResult.lokasi}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-white/90 rounded-2xl border border-blue-100 flex items-center gap-2 text-xs text-blue-950">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Harap bawa KTP Asli, Kartu Keluarga (KK), dan tunjukkan kartu saat hadir di Balai Desa Doko.</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                  <div className="font-black text-sm text-slate-900">NIK Tidak Terdaftar Sebagai Penerima Bansos Aktif</div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    NIK yang Anda masukkan tidak tercatat dalam daftar penerima bantuan tahap berjalan. Apabila Anda merasa memenuhi kriteria namun belum terdaftar, silakan ajukan usulan melalui Musyawarah Dusun (Musdus) atau hubungi Ketua RT setempat.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3 Program Bansos Aktif Section */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80 uppercase tracking-widest">
                Informasi Program
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Program Bansos Desa Doko
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bansosPrograms.map((b) => (
                <div key={b.nama} className="bg-slate-50/70 hover:bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        {b.tahap}
                      </span>
                    </div>
                    <h3 className="font-black text-base text-slate-900 leading-snug">{b.nama}</h3>
                    <div className="text-xs text-slate-500 font-medium">Sumber: <strong className="text-slate-700">{b.sumber}</strong></div>
                    <div className="p-3 bg-white rounded-2xl border border-slate-200/80 text-xs shadow-2xs">
                      <div className="text-[10px] text-slate-400">Manfaat</div>
                      <div className="font-black text-sm text-blue-700">{b.nominal}</div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Syarat:</strong> {b.kriteria}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 text-xs space-y-1.5 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>{b.jadwal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>{b.lokasi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Div 3: Inovasi Broadcast WhatsApp Dual-Mode (Full-Width Emerald Background Banner Band) */}
      <section className="w-full bg-gradient-to-b from-[#1e3a5f] via-[#1d4ed8] to-[#172554] py-16 sm:py-24 text-white relative overflow-hidden">
        {/* Concentric Circle Orbit Watermark */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Column: Information */}
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-blue-200 text-xs font-black border border-white/20">
                <BellRing className="w-3.5 h-3.5 text-blue-300" />
                <span>INOVASI AKSESIBILITAS INKLUSIF (DUAL-MODE)</span>
              </span>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Notifikasi WhatsApp Otomatis: Pilihan QR Code & Teks Manual
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-2 shadow-xl">
                  <div className="font-extrabold text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-300" />
                    <span>1. Jalur Cepat QR Code (Anak Muda)</span>
                  </div>
                  <p className="text-blue-100/80 text-[11px] leading-relaxed">
                    Bagi yang terbiasa gadget, cukup tunjukkan QR Code di WhatsApp/Web untuk scan 1 detik di meja petugas langsung cair.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-2 shadow-xl">
                  <div className="font-extrabold text-white flex items-center gap-1.5">
                    <span>2. Jalur Teks Chat & KTP (Warga Sepuh)</span>
                  </div>
                  <p className="text-blue-100/80 text-[11px] leading-relaxed">
                    Bagi warga lansia/gaptek, cukup perlihatkan isi teks chat berisi Nomor Antrean & KTP fisik asli ke petugas.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Light WhatsApp Chat Bubble */}
            <div className="lg:col-span-5 overflow-hidden rounded-3xl border border-white/20 shadow-2xl bg-blue-50/70">
              {/* Official Village Messaging Preview */}
              <div className="bg-blue-700 text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
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
                      <CheckCircle2 className="w-3.5 h-3.5 fill-blue-300 text-blue-700" />
                    </div>
                    <div className="text-[11px] text-blue-100 font-medium">
                      WhatsApp Gateway Resmi • Online
                    </div>
                  </div>
                </div>

                <div className="bg-blue-800 px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-100 border border-blue-500/30">
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
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-blue-700 font-black text-xs">
                    <span>PEMERINTAH DESA & PERUM BULOG</span>
                    <span className="text-[10px] text-slate-400 font-medium font-mono">08.02</span>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                    <p className="font-extrabold text-blue-700">Undangan bantuan pangan</p>
                  </div>

                  <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200/80 space-y-1.5 text-xs text-slate-700 font-sans">
                    <div className="flex justify-between"><span>Penerima</span> <strong className="text-slate-900 font-bold">Supriyadi</strong></div>
                    <div className="flex justify-between"><span>Tanggal</span> <strong className="text-slate-900 font-bold">18 Agustus 2026</strong></div>
                    <div className="flex justify-between"><span>Waktu</span> <strong className="text-slate-900 font-bold">08.30 WIB</strong></div>
                    <div className="flex justify-between"><span>Lokasi</span> <strong className="text-slate-900 font-bold">Balai Desa Doko</strong></div>
                    <div className="flex justify-between"><span>Bantuan</span> <strong className="text-slate-900 font-bold">30 kg beras</strong></div>
                    <div className="flex justify-between"><span>Biaya</span> <strong className="text-blue-700 font-bold">Gratis</strong></div>
                    <div className="flex justify-between pt-1 border-t border-blue-200/60 items-center">
                      <span className="text-blue-800 font-bold">No. Urut Antrean :</span>
                      <span className="text-base font-black text-blue-700 bg-white px-2.5 py-0.5 rounded-lg shadow-2xs border border-blue-300 font-mono">
                        1340
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center text-[10px] text-slate-500 font-medium">
                    Bebas pilih: scan Barcode <strong>350606200801340</strong> atau tunjukkan No. Urut <strong>1340</strong> & KTP asli ke petugas balai desa.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Official Print Portal for 1-Page A4 Authentic Surat Undangan Bulog */}
      {searchResult && searchResult.tipe === 'undangan_bulog' && createPortal(
        <div id="surat-undangan-print-portal" className="hidden print:block font-sans text-black bg-white">
          <div className="border-2 border-dashed border-slate-700 p-6 sm:p-7 space-y-3.5 max-w-[700px] mx-auto text-black bg-white">
            {/* Official Header */}
            <div className="border-b-2 border-slate-700 pb-2.5 text-center space-y-0.5">
              <div className="text-[13px] font-black tracking-widest uppercase leading-tight">
                UNDANGAN PENERIMA
              </div>
              <div className="text-[15px] font-black tracking-tight uppercase leading-tight">
                BANTUAN PANGAN BERAS PERIODE BULAN JULI
              </div>
              <div className="text-[13px] font-black tracking-tight uppercase leading-tight">
                SAMPAI DENGAN SEPTEMBER TAHUN 2026
              </div>
            </div>

            {/* Region Metadata Table 2 Columns */}
            <div className="grid grid-cols-2 gap-4 text-[12px] font-semibold text-black border-b border-slate-700 pb-2">
              <div className="space-y-0.5">
                <div className="flex"><span className="w-24 text-slate-700">Provinsi</span><span>: {searchResult.provinsi}</span></div>
                <div className="flex"><span className="w-24 text-slate-700">Kecamatan</span><span>: {searchResult.kecamatan}</span></div>
              </div>
              <div className="space-y-0.5">
                <div className="flex"><span className="w-28 text-slate-700">Kabupaten/Kota</span><span>: {searchResult.kabupaten}</span></div>
                <div className="flex"><span className="w-28 text-slate-700">Kelurahan/Desa</span><span>: {searchResult.desa}</span></div>
              </div>
            </div>

            {/* Date on Right */}
            <div className="text-right text-[12px] text-slate-800 font-medium">
              {searchResult.tanggalSurat}
            </div>

            {/* Letter Identification & Recipient Box */}
            <div className="grid grid-cols-2 gap-4 text-[12px] pt-0.5">
              <div className="space-y-1">
                <div className="flex"><span className="w-16 text-slate-700">Nomor</span><span className="font-mono font-bold">: {searchResult.nomorSurat}</span></div>
                <div className="flex"><span className="w-16 text-slate-700">Perihal</span><span className="font-bold uppercase">: {searchResult.perihal}</span></div>
              </div>
              <div className="space-y-0.5 text-left">
                <div className="text-slate-700">Kepada Yth :</div>
                <div className="text-[14px] font-black text-black uppercase tracking-wide">
                  {searchResult.nama}
                </div>
                <div className="font-mono text-slate-800 font-bold">
                  {searchResult.nikMasked}
                </div>
                <div className="text-slate-600">-</div>
                <div className="font-bold text-slate-900">
                  {searchResult.alamat}
                </div>
              </div>
            </div>

            {/* Invitation Body */}
            <div className="text-[12px] space-y-1 pt-1">
              <p className="font-medium text-black">
                Mengharapkan kehadiran Bapak/Ibu/Saudara besok pada :
              </p>
              <div className="pl-3 space-y-1 text-black font-medium">
                <div className="flex"><span className="w-28 text-slate-700 shrink-0">Hari/Tanggal</span><span className="font-bold">: {searchResult.hariTanggal}</span></div>
                <div className="flex"><span className="w-28 text-slate-700 shrink-0">Jam</span><span className="font-bold">: {searchResult.jam}</span></div>
                <div className="flex"><span className="w-28 text-slate-700 shrink-0">Tempat</span><span className="font-bold uppercase">: {searchResult.tempat}</span></div>
                <div className="flex items-start">
                  <span className="w-28 text-slate-700 shrink-0">Keperluan</span>
                  <span className="leading-snug">
                    : Mengambil Bantuan Pangan alokasi bulan Juli - September 2026 sejumlah <strong>{searchResult.alokasi}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* 6 Requirements */}
            <div className="text-[11px] space-y-1 pt-1 text-black">
              <div className="font-bold">Persyaratan :</div>
              <ol className="list-decimal pl-4 space-y-0.5 leading-snug">
                {searchResult.persyaratan.map((syarat: string, sIdx: number) => (
                  <li key={sIdx}>{syarat}</li>
                ))}
              </ol>
            </div>

            {/* 5-Day Expiration Note */}
            <div className="text-[11px] text-slate-900 font-medium leading-relaxed pt-1">
              <p>{searchResult.catatanBatas}</p>
              <p className="mt-0.5">Demikian atas kehadirannya disampaikan terima kasih</p>
            </div>

            {/* Footer: QR Code Barcode + No Urut + Bulog Signature */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-300">
              <div className="text-center">
                <div className="inline-block p-1 border border-slate-400 bg-white">
                  <img
                    src={`/api/public/surat/qr?data=${searchResult.barcode}`}
                    alt={`Barcode Bantuan ${searchResult.barcode}`}
                    className="w-24 h-24 object-contain mx-auto"
                    crossOrigin="anonymous"
                  />
                  <div className="text-[11px] font-mono font-bold text-black tracking-wider mt-1">
                    {searchResult.barcode}
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-[12px] font-medium text-black">
                  <div>Hormat Kami,</div>
                  <div className="font-bold">Perum BULOG</div>
                  <div className="flex items-center justify-end gap-1 text-[13px] font-black text-slate-800 italic mt-0.5">
                    <span>Bulog</span>
                    <span className="text-[9px] not-italic font-normal text-slate-600">mengantarkan kebaikan</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    No. Urut
                  </div>
                  <div className="text-4xl font-black font-mono tracking-tight text-black">
                    {searchResult.noUrut}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
