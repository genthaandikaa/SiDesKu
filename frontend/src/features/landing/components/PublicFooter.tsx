import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#0a1c16] text-slate-300 border-t border-emerald-900/60 relative overflow-hidden font-sans">
      {/* Subtle Wave Transition on Top of Footer */}
      <div className="w-full overflow-hidden leading-none opacity-20 pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-7 text-emerald-400 fill-current">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>

      {/* Subtle Ambient Radial Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Col 1: Official Identity & Contact (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="h-14 sm:h-16 w-auto max-w-[56px] shrink-0">
                <img 
                  src="/images/logo-kediri.png" 
                  alt="Lambang Kabupaten Kediri" 
                  className="h-full w-auto object-contain filter drop-shadow-md"
                />
              </div>
              <div>
                <div className="text-white font-black text-lg tracking-tight">Pemerintah Kabupaten Kediri</div>
                <div className="text-xs text-emerald-400 font-semibold">Sistem Pelayanan Informasi Desa Terpadu</div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-sm">
              Sistem Informasi Desa (SIDes) menghadirkan transformasi birokrasi digital yang transparan, akuntabel, dan bebas biaya demi kemudahan seluruh warga.
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Jl. Soekarno Hatta No. 1, Kab. Kediri, Jawa Timur 64182</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>(0354) 682-991 / 0812-3456-7890 (Layanan Warga)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>layanan@kedirikab.go.id</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Senin - Jumat: 08.00 - 15.30 WIB (Layanan Online 24 Jam)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-white font-extrabold text-xs uppercase tracking-wider">Halaman Utama</div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" /> Beranda
                </Link>
              </li>
              <li>
                <Link to="/profil" className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" /> Profil & Lembaga Desa
                </Link>
              </li>
              <li>
                <Link to="/layanan-surat" className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" /> Katalog Layanan Surat
                </Link>
              </li>
              <li>
                <Link to="/lacak" className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" /> Lacak Surat & Validasi QR
                </Link>
              </li>
              <li>
                <Link to="/transparansi" className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" /> Transparansi APBDes
                </Link>
              </li>
              <li>
                <Link to="/bansos" className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" /> Program Bantuan Sosial
                </Link>
              </li>
              <li>
                <Link to="/berita" className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" /> Warta & Pengumuman
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Government Services & Security (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-white font-extrabold text-xs uppercase tracking-wider">Integritas Pelayanan</div>
            
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 space-y-2 text-xs shadow-md">
              <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Dokumen Resmi Ber-QR Code
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Setiap surat yang diterbitkan melalui SIDes dilengkapi tanda tangan elektronik dan kode hash unik yang dapat diverifikasi keasliannya oleh instansi manapun.
              </p>
            </div>

            <div className="text-xs space-y-1.5">
              <div className="text-emerald-400 font-bold">Portal & Tautan Terkait:</div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                <a href="https://kedirikab.go.id" target="_blank" rel="noreferrer" className="hover:text-white underline inline-flex items-center gap-1">
                  Pemkab Kediri <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <a href="https://kemendesa.go.id" target="_blank" rel="noreferrer" className="hover:text-white underline inline-flex items-center gap-1">
                  Kemendesa RI <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <a href="https://cekbansos.kemensos.go.id" target="_blank" rel="noreferrer" className="hover:text-white underline inline-flex items-center gap-1">
                  Cek Bansos Kemensos <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
          <div>
            © {new Date().getFullYear()} Pemerintah Kabupaten Kediri. Hak Cipta Dilindungi.
          </div>
          <div>
            Sistem Informasi Desa & Tata Kelola Pelayanan Digital Mandiri
          </div>
        </div>
      </div>
    </footer>
  );
};
