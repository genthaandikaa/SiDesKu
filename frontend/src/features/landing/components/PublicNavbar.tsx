import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard, 
  Search, 
  LogOut,
  LogIn,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { BrandLogo } from '@/shared/components/BrandLogo';

interface NavItem {
  name: string;
  path: string;
  isSpecial?: boolean;
}

export const PublicNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const preLoginLinks: NavItem[] = [
    { name: 'Beranda', path: '/' },
    { name: 'Profil Kota', path: '/profil' },
    { name: 'Layanan Surat', path: '/layanan-surat' },
    { name: 'Transparansi', path: '/transparansi' },
    { name: 'Smart City', path: '/smart-city' },
    { name: 'Berita', path: '/berita' },
  ];

  const postLoginLinks: NavItem[] = [
    { name: 'Beranda', path: '/' },
    { name: 'Profil Kota', path: '/profil' },
    { name: 'Layanan Surat', path: '/layanan-surat' },
    { name: 'Transparansi', path: '/transparansi' },
    { name: 'Smart City', path: '/smart-city' },
    { name: 'Berita', path: '/berita' },
  ];

  const activeLinks = user ? postLoginLinks : preLoginLinks;
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const displayName = user?.warga_profile?.nama_lengkap || user?.name || user?.username || 'Warga';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none pt-2 sm:pt-3 pb-2 px-3 sm:px-6 lg:px-8 pointer-events-none">
      <div className={`max-w-7xl mx-auto rounded-4xl transition-all duration-300 pointer-events-auto ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl border-sky-200/90 shadow-lg shadow-sky-950/8 py-2 px-4 sm:px-6' 
          : 'bg-white/92 backdrop-blur-lg border-slate-200/80 shadow-md shadow-slate-900/5 py-2 sm:py-2.5 px-4 sm:px-6'
      }`}>
        <div className="grid grid-cols-2 lg:grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4 w-full">

          {/* Left Brand Identity - Vertically Centered & Balanced */}
          <div className="flex items-center justify-start shrink-0">
            <Link to="/" className="flex items-center gap-2 outline-none focus:outline-none shrink-0 group">
              <BrandLogo size="sm" subtitleText="Pemerintah Kota Kediri" />
            </Link>
          </div>

          {/* Desktop Navigation Links - Symmetrical Center Position */}
          <div className="hidden lg:flex items-center justify-center px-2">
            <nav className="inline-flex items-center justify-center gap-1.5 bg-slate-100/90 p-1.5 sm:p-2 rounded-full border border-slate-200/80 shadow-2xs">
              {activeLinks.map((item) => {
                const active = isActive(item.path);
                if (item.isSpecial) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap outline-none focus:outline-none hover:-translate-y-0.5 active:scale-95 ${
                        active 
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/25' 
                          : 'bg-sky-500 hover:bg-sky-600 text-white shadow-2xs'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </Link>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 outline-none focus:outline-none ${
                      active 
                        ? 'bg-white text-sky-950 font-bold border border-slate-200/90 shadow-xs' 
                        : 'border border-transparent text-slate-600 hover:text-sky-800 hover:bg-white/60'
                    }`}
                  >
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action: Dual Mode (Pre-login = Login/Register, Post-login = User Profile Card) */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            {!user && (
              <Link
                to="/lacak"
                className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-sky-700 hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200/80 whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Lacak Berkas</span>
              </Link>
            )}

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all press-down outline-none focus:outline-none cursor-pointer"
                >
                  <span>Layanan Utama</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sky-100 py-2 z-50 animate-fade-in space-y-1">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Akun Terdaftar</div>
                      <div className="text-sm font-black text-slate-900 truncate">{displayName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{user.email || user.username}</div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2.5 transition-colors outline-none focus:outline-none"
                    >
                      <LayoutDashboard className="w-4 h-4 text-sky-600" />
                      <span>Buka Panel Layanan</span>
                    </Link>

                    <Link
                      to="/lacak"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors outline-none focus:outline-none"
                    >
                      <Search className="w-4 h-4 text-slate-400" />
                      <span>Riwayat Berkas Saya</span>
                    </Link>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors outline-none focus:outline-none cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Keluar Akun (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs shadow-md shadow-sky-500/25 transition-all press-down hover-glow whitespace-nowrap outline-none focus:outline-none"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <div className="flex lg:hidden items-center ml-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200/70 text-sky-700"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-4 bg-white/95 backdrop-blur-xl rounded-3xl border border-sky-100 shadow-xl space-y-3 animate-fade-in">
            {user && (
              <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">{displayName}</div>
                    <div className="text-[10px] text-sky-700 font-bold capitalize">{user.role?.display_name || 'Warga'}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-1">
              {activeLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive(item.path) 
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs' 
                      : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {!user && (
              <div className="pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
