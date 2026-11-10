import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Send,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { BrandLogo } from '@/shared/components/BrandLogo';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-white text-slate-600 border-t border-sky-100/80 relative overflow-hidden font-sans">
      {/* Soft Ambient Radial Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-200/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Col 1: Identity & Description (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-block outline-none">
              <BrandLogo size="md" />
            </Link>

            <div className="space-y-2 pt-2 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Kompleks Kantor Pemerintahan Kota Kediri, Jawa Timur 64123</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                <a href="tel:0354682991" className="hover:text-sky-700 hover:underline">
                  (0354) 682-991 • Layanan Pengaduan 24 Jam
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                <a href="mailto:smartcity@kotakediri.go.id" className="hover:text-sky-700 hover:underline">
                  smartcity@kotakediri.go.id
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Pelayanan Mandiri Digital Aktif 24 Jam Non-Stop</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-slate-900 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>Ekosistem Kota</span>
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-sky-600 transition-colors flex items-center gap-1.5 text-slate-600">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" /> Beranda Utama
                </Link>
              </li>
              <li>
                <Link to="/layanan-surat" className="hover:text-sky-600 transition-colors flex items-center gap-1.5 text-slate-600">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" /> Layanan & Lacak Surat
                </Link>
              </li>
              <li>
                <Link to="/transparansi" className="hover:text-sky-600 transition-colors flex items-center gap-1.5 text-slate-600">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" /> Transparansi Anggaran & Bansos
                </Link>
              </li>
              <li>
                <Link to="/berita" className="hover:text-sky-600 transition-colors flex items-center gap-1.5 text-slate-600">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" /> Warta & Inovasi Kota
                </Link>
              </li>
              <li>
                <Link to="/profil" className="hover:text-sky-600 transition-colors flex items-center gap-1.5 text-slate-600">
                  <ChevronRight className="w-3.5 h-3.5 text-sky-400" /> Profil Wilayah & Pemerintahan
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Resmi & Pengaduan (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-slate-900 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Aspirasi & Kotak Pesan</span>
            </div>

            {/* Newsletter / Aspiration Input Pill (Flowora Style) */}
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Tulis pesan atau email Anda..."
                className="w-full pl-4 pr-12 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-2xs"
              />
              <button 
                type="button"
                className="absolute right-1 w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
                title="Kirim Aspirasi"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-2 space-y-2">
              <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">Tautan Mitra Terkait:</div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <a href="https://kedirikab.go.id" target="_blank" rel="noreferrer" className="hover:text-sky-700 underline inline-flex items-center gap-1">
                  Pemkab Kediri <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <a href="https://kemendesa.go.id" target="_blank" rel="noreferrer" className="hover:text-sky-700 underline inline-flex items-center gap-1">
                  Kemendesa RI <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <a href="https://cekbansos.kemensos.go.id" target="_blank" rel="noreferrer" className="hover:text-sky-700 underline inline-flex items-center gap-1">
                  Cek Bansos Kemensos <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} SMK KARTANEGARA WATES. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">Nexora 1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
