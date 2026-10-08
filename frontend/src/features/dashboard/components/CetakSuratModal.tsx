import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, ShieldCheck, CheckCircle2, FileText, Download } from 'lucide-react';
import { SuratRequest, DesaSetting } from '@/shared/types';

interface CetakSuratModalProps {
  surat: SuratRequest;
  desa: DesaSetting | null;
  onClose: () => void;
}

export const CetakSuratModal: React.FC<CetakSuratModalProps> = ({ surat, desa, onClose }) => {
  const [showQrZoom, setShowQrZoom] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const w = surat.warga_profile;

  const modalContent = (
    <div id="surat-print-portal" className="fixed inset-0 z-[999999] bg-slate-950/80 flex flex-col items-center justify-start print:p-0 print:bg-white print:static font-sans">
      
      {/* Full-width Top Header Action Bar (Mobile Responsive) */}
      <header className="w-full bg-slate-900 text-white border-b border-slate-800 shadow-xl px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between z-30 shrink-0 print:hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 truncate">
            <div className="text-xs sm:text-sm font-black tracking-wide text-slate-100 flex items-center gap-1.5 truncate">
              <span className="truncate">Pratinjau Surat Resmi</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold shrink-0">
                A4 (100%)
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
              {surat.nomor_resi}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all press-down hover-glow cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">Cetak / Unduh PDF</span>
            <span className="sm:hidden">Cetak PDF</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Pratinjau (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Scrollable Container with centered A4 Paper */}
      <main className="flex-1 w-full overflow-y-auto flex justify-center py-4 sm:py-10 px-2 sm:px-3 print:p-0 print:overflow-visible">
        
        {/* Official A4 Paper Sheet (Realistic Proportions & Fluid Mobile Padding) */}
        <div 
          id="surat-print-area" 
          className="w-full max-w-[794px] bg-white rounded-sm shadow-2xl border border-slate-300 p-5 sm:p-14 space-y-4 sm:space-y-6 text-slate-900 leading-relaxed my-auto print:shadow-none print:border-none print:max-w-full print:p-0 print:my-0"
        >
          
          {/* Dynamic Kop Surat Header with Perfectly Centered Text */}
          <div className="relative flex items-center justify-between pb-1 sm:pb-2">
            {/* Left: Official Logo Kediri */}
            <div className="w-16 h-20 sm:w-24 sm:h-28 flex items-center justify-center shrink-0">
              <img 
                src="/images/logo-kediri.png" 
                alt="Lambang Kabupaten Kediri" 
                className="w-full h-full object-contain filter contrast-125 drop-shadow-xs"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/Kediri.png';
                }}
              />
            </div>

            {/* Center: Kop Typography */}
            <div className="flex-1 text-center space-y-0.5 font-sans px-2">
              <div className="text-[10px] sm:text-sm font-black tracking-wider sm:tracking-widest text-slate-800 uppercase">
                {desa?.kop_atas || 'PEMERINTAH KABUPATEN KEDIRI'}
              </div>
              <div className="text-sm sm:text-xl font-black tracking-tight text-slate-950 uppercase leading-tight">
                "{desa?.kop_tengah || 'KECAMATAN NGASEM'}"
              </div>
              <div className="text-xs sm:text-lg font-black text-slate-900 uppercase">
                {desa?.kop_bawah || 'KANTOR KEPALA DESA DOKO'}
              </div>
              <div className="text-[9px] sm:text-xs text-slate-600 font-serif leading-tight pt-0.5">
                {desa?.kop_footer || 'Jl. Raya Doko No. 12 Kec. Ngasem Kab. Kediri 64182, Telp. (0354) 681234, Email: pemdes.doko@kedirikab.go.id'}
              </div>
            </div>

            {/* Right: Invisible balancer for exact geometric centering */}
            <div className="w-16 h-20 sm:w-24 sm:h-28 shrink-0 hidden sm:block pointer-events-none" aria-hidden="true"></div>
          </div>

          {/* Double Separator Line (Official Government Standard) */}
          <div className="space-y-0.5 sm:space-y-1 my-1 sm:my-2">
            <div className="border-t-2 sm:border-t-[3px] border-slate-950"></div>
            <div className="border-t border-slate-950"></div>
          </div>

          {/* Title & Official Letter Number */}
          <div className="text-center space-y-0.5 sm:space-y-1 font-sans pt-1">
            <div className="text-xs sm:text-base font-black uppercase underline tracking-wide text-slate-950">
              {surat.surat_type?.nama_surat || 'SURAT KETERANGAN RESMI'}
            </div>
            <div className="text-[10px] sm:text-xs font-mono font-bold text-slate-700">
              Nomor: {surat.nomor_surat_resmi || '401/042/418.66.04/2026'}
            </div>
          </div>

          {/* Body Content */}
          <div className="text-[11px] sm:text-sm font-serif space-y-3 sm:space-y-4 text-justify leading-relaxed">
            <p>
              Yang bertanda tangan di bawah ini Kepala Desa Doko, Kecamatan Ngasem, Kabupaten Kediri, dengan ini menerangkan bahwa:
            </p>

            <table className="w-full text-[11px] sm:text-sm space-y-1 ml-1 sm:ml-4 font-sans">
              <tbody>
                <tr>
                  <td className="w-32 sm:w-40 py-0.5 sm:py-1 font-semibold text-slate-700">Nama Lengkap</td>
                  <td className="w-3 sm:w-4">:</td>
                  <td className="font-black uppercase text-slate-900">{w?.nama_lengkap}</td>
                </tr>
                <tr>
                  <td className="py-0.5 sm:py-1 font-semibold text-slate-700">NIK</td>
                  <td>:</td>
                  <td className="font-mono font-bold text-slate-900">{w?.nik}</td>
                </tr>
                <tr>
                  <td className="py-0.5 sm:py-1 font-semibold text-slate-700">No. Kartu Keluarga</td>
                  <td>:</td>
                  <td className="font-mono text-slate-800">{w?.kartu_keluarga?.no_kk || '3506040101150001'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 sm:py-1 font-semibold text-slate-700">Tempat, Tgl Lahir</td>
                  <td>:</td>
                  <td>{w?.tempat_lahir || 'Kediri'}, {w?.tanggal_lahir ? new Date(w.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '15 Mei 1984'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 sm:py-1 font-semibold text-slate-700">Jenis Kelamin</td>
                  <td>:</td>
                  <td>{w?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 sm:py-1 font-semibold text-slate-700">Agama</td>
                  <td>:</td>
                  <td>{w?.agama || 'Islam'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 sm:py-1 font-semibold text-slate-700">Pekerjaan</td>
                  <td>:</td>
                  <td>{w?.pekerjaan || 'Buruh Harian Lepas / Petani'}</td>
                </tr>
                <tr>
                  <td className="py-0.5 sm:py-1 font-semibold text-slate-700">Alamat Domisili</td>
                  <td>:</td>
                  <td>{w?.alamat_ktp || 'Jl. Kenanga No. 14, RT 01 / RW 01 Dusun Doko Krajan, Desa Doko'}</td>
                </tr>
              </tbody>
            </table>

            <p>
              {surat.surat_type?.template_body || 'Yang bertanda tangan di bawah ini Kepala Desa Doko menerangkan dengan sebenarnya bahwa orang tersebut di atas adalah benar-benar warga penduduk Desa Doko yang tergolong keluarga tidak mampu (ekonomi lemah).'}
            </p>

            <div className="bg-slate-50 border border-slate-200 p-2.5 sm:p-3.5 rounded-xl font-sans text-[11px] sm:text-xs italic font-semibold text-slate-900">
              "{surat.keperluan}"
            </div>

            <p>
              Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya oleh yang berkepentingan.
            </p>
          </div>

          {/* Signature & Digital Barcode / QR Legal Stamp Block */}
          <div className="pt-4 sm:pt-6 space-y-4 font-sans">
            
            {/* Payung Hukum Banner */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-[9px] sm:text-[10px] text-slate-700 leading-relaxed">
              <div className="flex items-center gap-1.5 font-black text-slate-900 uppercase tracking-tight pb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>PAYUNG HUKUM & KEABSAHAN DOKUMEN ELEKTRONIK:</span>
              </div>
              <p>
                Berdasarkan <strong>Pasal 5 Ayat (1) UU No. 11 Tahun 2008 tentang ITE</strong> dan <strong>Permendagri No. 2 Tahun 2019 tentang Tata Naskah Dinas</strong>, dokumen elektronik ini sah demi hukum. Barcode dan QR Code resmi di bawah ini memuat <strong>tanda tangan digital tersertifikasi Kepala Desa Doko (Lurah)</strong> dan berkekuatan hukum penuh tanpa memerlukan tanda tangan basah serta stempel manual.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 sm:gap-6">
              
              {/* Dual Barcode & QR Stamp */}
              <div className="p-3 bg-emerald-50/90 border-2 border-emerald-400 rounded-2xl flex items-center gap-3 w-full sm:w-auto sm:max-w-[420px] shadow-xs">
                {/* 2D QR Code */}
                <div 
                  onClick={() => setShowQrZoom(true)}
                  className="w-28 h-28 sm:w-32 sm:h-32 bg-white p-1.5 rounded-2xl border-2 border-emerald-400 shrink-0 shadow-sm flex flex-col items-center justify-center overflow-hidden cursor-pointer group relative transition-transform hover:scale-105"
                  title="Klik untuk memperbesar QR Code agar mudah di-scan"
                >
                  <img 
                    src={`/api/public/surat/qr/${surat.qr_verification_hash || surat.nomor_resi}?v=500`} 
                    alt="QR Validasi Sah Desa Doko" 
                    className="w-full h-full object-contain filter contrast-125"
                  />
                  <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black text-center p-1 rounded-2xl">
                    🔍 Perbesar
                  </div>
                </div>

                {/* 1D Barcode & Verification Info */}
                <div className="space-y-1.5 text-[9px] sm:text-[10px] min-w-0 flex-1">
                  <div className="flex items-center gap-1 font-black text-emerald-950 uppercase tracking-tight">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>TTE LURAH / KADES</span>
                  </div>

                  {/* 1D Vector Barcode */}
                  <div className="bg-white p-1 rounded-lg border border-emerald-200">
                    <img 
                      src={`/api/public/surat/barcode/${encodeURIComponent(surat.nomor_surat_resmi || surat.nomor_resi)}`} 
                      alt="Barcode Tanda Tangan Lurah" 
                      className="w-full h-9 object-contain"
                    />
                  </div>

                  <div className="font-mono text-[9px] text-emerald-900 truncate font-black">
                    Hash: {surat.qr_verification_hash?.substring(0, 18) || surat.nomor_resi}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQrZoom(true)}
                    className="text-[9px] font-black text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer print:hidden"
                  >
                    <span>🔍 Perbesar QR Scanner</span>
                  </button>
                </div>
              </div>

              {/* Official Signer Box: Kepala Desa / Lurah */}
              <div className="text-center space-y-1 text-[11px] sm:text-xs w-full sm:w-auto">
                <div className="text-slate-700">
                  Doko, {new Date(surat.ttd_kades_at || surat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="font-black text-slate-900 uppercase">
                  KEPALA DESA DOKO
                </div>
                <div className="text-slate-500 text-[10px] sm:text-[11px]">
                  (Lurah Pemerintahan Desa)
                </div>
                
                {/* Digital Barcode Seal Graphic */}
                <div className="py-1 flex flex-col items-center justify-center gap-1">
                  <div className="px-3.5 py-1.5 rounded-2xl border-2 border-emerald-700 bg-emerald-50 text-emerald-900 flex items-center gap-1.5 font-black text-[9px] sm:text-[10px] shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>TERTANDA ELEKTRONIK (BARCODE/QR)</span>
                  </div>
                </div>

                <div className="font-black text-slate-950 underline uppercase pt-0.5">
                  {desa?.nama_kades || 'Drs. H. Bambang Prasetyo, M.Si'}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 font-mono">
                  NIP. {desa?.nip_kades || '19680514 199403 1 004'}
                </div>
              </div>

            </div>
          </div>

          {/* Large Floating Zoom QR Code Modal for Easy Phone Camera Scanning */}
          {showQrZoom && (
            <div 
              onClick={() => setShowQrZoom(false)}
              className="fixed inset-0 z-[999999] bg-slate-950/85 flex items-center justify-center p-4 animate-fade-in print:hidden overflow-y-auto select-none"
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border-2 border-emerald-400 animate-scale-up my-auto"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      QR Code Ukuran Besar
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-0.5">Pindai dengan Kamera HP</h4>
                  </div>
                  <button 
                    onClick={() => setShowQrZoom(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Big Scannable QR Matrix */}
                <div className="w-64 h-64 sm:w-72 sm:h-72 mx-auto bg-white p-3 rounded-2xl border-2 border-emerald-300 shadow-inner flex items-center justify-center">
                  <img 
                    src={`/api/public/surat/qr/${surat.qr_verification_hash || surat.nomor_resi}?v=500`} 
                    alt="QR Code Besar"
                    className="w-full h-full object-contain filter contrast-125"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="font-mono font-bold text-emerald-900 text-xs">
                    {surat.nomor_surat_resmi || surat.nomor_resi}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Arahkan kamera handphone ke QR Code di atas untuk verifikasi instan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQrZoom(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Tutup Tampilan Besar
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );

  return createPortal(modalContent, document.body);
};
