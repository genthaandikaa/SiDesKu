import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, ShieldCheck, CheckCircle2, FileText, Download, Building2 } from 'lucide-react';
import { ApbdesSummary, DesaSetting } from '@/shared/types';

interface CetakLpjModalProps {
  apbdesData: any;
  desa?: DesaSetting | null;
  onClose: () => void;
}

export const CetakLpjModal: React.FC<CetakLpjModalProps> = ({ apbdesData, desa, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const s = apbdesData?.summary;
  const totPendapatan = Number(s?.pendapatan?.realisasi || 675000000);
  const totBelanja = Number(s?.belanja?.realisasi || 217500000);
  const surplus = totPendapatan - totBelanja;

  const modalContent = (
    <div id="lpj-print-portal" className="fixed inset-0 z-[999999] bg-slate-950/80 flex flex-col items-center justify-start print:p-0 print:bg-white print:static font-sans">
      {/* Top Header Action Bar (Hidden when printing) */}
      <header className="w-full bg-white text-slate-900 border-b border-slate-200 shadow-xs px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between z-30 shrink-0 print:hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center font-bold shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 truncate">
            <div className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5 truncate">
              <span className="truncate">Dokumen Resmi LPJ Realisasi APBDes 2026</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 text-[10px] font-semibold shrink-0">
                Format A4
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">
              Nomor: LPJ-APBDes/01/418.66.04/2026
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span>Cetak / Unduh</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Scrollable Container with centered A4 Paper */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden flex justify-center py-3 sm:py-10 px-2 sm:px-6 print:p-0 print:overflow-visible">
        {/* Official A4 Sheet */}
        <div 
          id="lpj-print-area"
          className="printable-paper w-full max-w-[794px] min-w-0 bg-white rounded-xl sm:rounded-sm shadow-2xl border border-slate-300 p-4 xs:p-6 sm:p-14 space-y-4 sm:space-y-5 text-slate-900 leading-relaxed my-auto print:shadow-none print:border-none print:max-w-full print:p-0 print:my-0 print:rounded-none box-border"
        >
          {/* Dynamic Kop Surat Header */}
          <div className="relative flex items-center justify-between pb-2">
            <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center shrink-0">
              <img 
                src="/images/logo-kediri.png" 
                alt="Logo Kabupaten Kediri" 
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex-1 text-center px-2">
              <h4 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-slate-700">
                Pemerintah Kabupaten Kediri
              </h4>
              <h3 className="text-sm sm:text-base font-bold tracking-widest uppercase text-slate-800">
                Kecamatan Ngasem
              </h3>
              <h2 className="text-lg sm:text-2xl font-black tracking-wider uppercase text-slate-900 leading-tight">
                Pemerintah Desa Doko
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-600 font-serif italic mt-0.5">
                Jl. Doko Indah No. 01 Dusun Krajan Kode Pos 64182 Telp. (0354) 682110
              </p>
            </div>

            <div className="w-16 sm:w-20 shrink-0 flex justify-end">
              <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-[9px] text-slate-500 font-bold p-1 text-center">
                <Building2 className="w-4 h-4 text-emerald-700 mb-0.5" />
                <span>SiDesKu</span>
              </div>
            </div>
          </div>

          {/* Double Separator Line */}
          <div className="border-t-2 border-slate-900 pt-[2px] border-b border-slate-900 mb-4" />

          {/* Title Section */}
          <div className="text-center space-y-1">
            <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-950 underline decoration-2 underline-offset-4">
              Laporan Pertanggungjawaban Realisasi Pelaksanaan APBDes
            </h1>
            <p className="text-xs font-semibold text-slate-700">
              Tahun Anggaran 2026 (Semester Berjalan)
            </p>
            <p className="text-[11px] font-mono text-slate-500">
              Nomor: LPJ-APBDes/01/418.66.04/2026
            </p>
          </div>

          {/* Table Container */}
          <div className="pt-2 text-xs">
            <table className="w-full border-collapse border border-slate-800 text-[11px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-800 text-slate-900">
                  <th className="border border-slate-800 p-2 text-left font-black w-24">Kode Akun</th>
                  <th className="border border-slate-800 p-2 text-left font-black">Uraian Akun Rekening APBDes</th>
                  <th className="border border-slate-800 p-2 text-right font-black w-36">Anggaran (Rp)</th>
                  <th className="border border-slate-800 p-2 text-right font-black w-36">Realisasi (Rp)</th>
                  <th className="border border-slate-800 p-2 text-right font-black w-20">Serapan %</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. PENDAPATAN */}
                <tr className="bg-emerald-50/70 font-black text-slate-900">
                  <td className="border border-slate-800 p-2 font-mono">4.</td>
                  <td className="border border-slate-800 p-2 uppercase">1. PENDAPATAN DESA</td>
                  <td className="border border-slate-800 p-2 text-right font-mono">Rp {Number(s?.pendapatan?.anggaran || 1110000000).toLocaleString('id-ID')}</td>
                  <td className="border border-slate-800 p-2 text-right font-mono text-emerald-900">Rp {totPendapatan.toLocaleString('id-ID')}</td>
                  <td className="border border-slate-800 p-2 text-right font-mono">{s?.pendapatan?.persen || 60.8}%</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-1.5 pl-4 font-mono text-slate-600">4.1</td>
                  <td className="border border-slate-800 p-1.5 pl-6 text-slate-700">Pendapatan Asli Desa (PADes & BUMDes)</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-600">Rp 125.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">Rp 85.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">68.0%</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-1.5 pl-4 font-mono text-slate-600">4.2</td>
                  <td className="border border-slate-800 p-1.5 pl-6 text-slate-700">Pendapatan Transfer - Dana Desa (APBN)</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-600">Rp 835.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">Rp 480.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">57.5%</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-1.5 pl-4 font-mono text-slate-600">4.3</td>
                  <td className="border border-slate-800 p-1.5 pl-6 text-slate-700">Alokasi Dana Desa (ADD Pemkab Kediri)</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-600">Rp 150.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">Rp 110.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">73.3%</td>
                </tr>

                {/* 2. BELANJA */}
                <tr className="bg-teal-50/70 font-black text-slate-900 border-t-2 border-slate-800">
                  <td className="border border-slate-800 p-2 font-mono">5.</td>
                  <td className="border border-slate-800 p-2 uppercase">2. BELANJA DESA</td>
                  <td className="border border-slate-800 p-2 text-right font-mono">Rp {Number(s?.belanja?.anggaran || 235000000).toLocaleString('id-ID')}</td>
                  <td className="border border-slate-800 p-2 text-right font-mono text-teal-900">Rp {totBelanja.toLocaleString('id-ID')}</td>
                  <td className="border border-slate-800 p-2 text-right font-mono">{s?.belanja?.persen || 92.6}%</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-1.5 pl-4 font-mono text-slate-600">5.1</td>
                  <td className="border border-slate-800 p-1.5 pl-6 text-slate-700">Bidang Penyelenggaraan Pemerintahan Desa</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-600">Rp 80.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">Rp 76.500.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">95.6%</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-1.5 pl-4 font-mono text-slate-600">5.2</td>
                  <td className="border border-slate-800 p-1.5 pl-6 text-slate-700">Bidang Pelaksanaan Pembangunan Desa (Fisik)</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-600">Rp 175.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">Rp 172.500.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">98.6%</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-1.5 pl-4 font-mono text-slate-600">5.3</td>
                  <td className="border border-slate-800 p-1.5 pl-6 text-slate-700">Bidang Pembinaan Kemasyarakatan Desa</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-600">Rp 25.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">Rp 22.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">88.0%</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-1.5 pl-4 font-mono text-slate-600">5.4</td>
                  <td className="border border-slate-800 p-1.5 pl-6 text-slate-700">Bidang Pemberdayaan Masyarakat (UMKM)</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-600">Rp 60.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">Rp 45.000.000</td>
                  <td className="border border-slate-800 p-1.5 text-right font-mono text-slate-700">75.0%</td>
                </tr>

                {/* 3. SURPLUS / DEFISIT */}
                <tr className="bg-slate-100 font-black text-slate-950 border-t-2 border-slate-800 text-xs">
                  <td className="border border-slate-800 p-2 text-center" colSpan={2}>
                    SURPLUS / (DEFISIT) ANGGARAN TAHUN BERJALAN
                  </td>
                  <td className="border border-slate-800 p-2 text-right font-mono">
                    Rp {(Number(s?.pendapatan?.anggaran || 1110000000) - Number(s?.belanja?.anggaran || 235000000)).toLocaleString('id-ID')}
                  </td>
                  <td className="border border-slate-800 p-2 text-right font-mono text-emerald-900">
                    Rp {surplus.toLocaleString('id-ID')}
                  </td>
                  <td className="border border-slate-800 p-2 text-right font-mono">Surplus</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statement Text */}
          <p className="text-[11px] text-justify text-slate-700 leading-relaxed pt-2">
            Demikian Laporan Pertanggungjawaban Realisasi Pelaksanaan APBDes ini disusun secara transparan dan akuntabel sesuai dengan Permendagri No. 20 Tahun 2018 tentang Pengelolaan Keuangan Desa dan peraturan perundang-undangan yang berlaku.
          </p>

          {/* Signatures & Official Validation Block */}
          <div className="pt-6 grid grid-cols-2 text-center text-xs">
            <div className="space-y-1">
              <p className="text-slate-600">Mengetahui & Menyetujui,</p>
              <p className="font-bold text-slate-900">Kepala Desa Doko</p>
              <div className="py-2 flex justify-center">
                <div className="p-2 border border-slate-300 rounded-xl bg-slate-50 flex items-center gap-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent('https://sidesku.desa.id/verifikasi/lpj/2026/DOKO-KEDIRI')}`}
                    alt="QR Validasi"
                    className="w-14 h-14 object-contain"
                  />
                  <div className="text-left text-[9px] text-slate-500 font-mono">
                    <p className="font-black text-emerald-800">TERVALIDASI RESMI</p>
                    <p>SK Kades No. 14/2026</p>
                    <p>Desa Doko, Kediri</p>
                  </div>
                </div>
              </div>
              <p className="font-black underline text-slate-900 text-xs">Drs. H. Bambang Prasetyo, M.Si</p>
              <p className="text-[10px] text-slate-500 font-mono">NIP. 19680512 199403 1 004</p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-600">Doko, 12 Oktober 2026</p>
              <p className="font-bold text-slate-900">Kaur Keuangan / Bendahara Desa</p>
              <div className="py-2 flex justify-center">
                <div className="p-2 border border-slate-300 rounded-xl bg-slate-50 flex items-center gap-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent('https://sidesku.desa.id/verifikasi/bku/2026/BENDAHARA-DOKO')}`}
                    alt="QR Kasir"
                    className="w-14 h-14 object-contain"
                  />
                  <div className="text-left text-[9px] text-slate-500 font-mono">
                    <p className="font-black text-teal-800">BUKU KAS UMUM</p>
                    <p>BKU-2026/DOKO</p>
                    <p>Ratna Dewi Kusuma</p>
                  </div>
                </div>
              </div>
              <p className="font-black underline text-slate-900 text-xs">Ratna Dewi Kusuma, S.E</p>
              <p className="text-[10px] text-slate-500 font-mono">NRPDes. 35.06.04.2001.003</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  return createPortal(modalContent, document.body);
};
