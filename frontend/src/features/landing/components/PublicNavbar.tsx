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
  ShoppingBag,
  Home,
  Briefcase,
  Layers,
  ChevronRight
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
  const [smartCityDropdownOpen, setSmartCityDropdownOpen] = useState(false);
  const [mobileSmartCityOpen, setMobileSmartCityOpen] = useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);
  const navbarRef = React.useRef<HTMLDivElement>(null);
  const smartCityDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on click/tap outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (smartCityDropdownRef.current && !smartCityDropdownRef.current.contains(target)) {
        setSmartCityDropdownOpen(false);
      }
      if (navbarRef.current && !navbarRef.current.contains(target)) {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    };

    if (mobileMenuOpen || profileDropdownOpen || smartCityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen, profileDropdownOpen, smartCityDropdownOpen]);

  // Close mobile menu & dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setSmartCityDropdownOpen(false);
  }, [location.pathname]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
        setSmartCityDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const preLoginLinks: NavItem[] = [
    { name: 'Beranda', path: '/' },
    { name: 'Profil', path: '/profil' },
    { name: 'Layanan Surat', path: '/layanan-surat' },
    { name: 'Transparansi', path: '/transparansi' },
    { name: 'Smart City', path: '/smart-city' },
    { name: 'Berita', path: '/berita' },
  ];

  const postLoginLinks: NavItem[] = [
    { name: 'Beranda', path: '/' },
    { name: 'Profil', path: '/profil' },
    { name: 'Layanan Surat', path: '/layanan-surat' },
    { name: 'Transparansi', path: '/transparansi' },
    { name: 'Smart City', path: '/smart-city' },
    { name: 'Berita', path: '/berita' },
  ];

  const activeLinks = user ? postLoginLinks : preLoginLinks;

  const smartCitySubItems = [
    {
      name: 'Smart City Hub',
      desc: 'Peta Spasial GIS & Portal Terpadu',
      path: '/smart-city',
      icon: Layers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Pasar Digital & UMKM',
      desc: 'Produk Tetangga, QRIS & COD',
      path: '/smart-city/umkm',
      icon: ShoppingBag,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      name: 'Pencarian Kos & Hunian',
      desc: 'Kamar Kos & Kontrakan Terverifikasi',
      path: '/smart-city/kos',
      icon: Home,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
    {
      name: 'Bursa Kerja & Loker',
      desc: 'Peluang Kerja Lokal & Lamar CV',
      path: '/smart-city/loker',
      icon: Briefcase,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/smart-city' && (
      location.pathname.startsWith('/smart-city') ||
      location.pathname.startsWith('/umkm') ||
      location.pathname.startsWith('/pasar') ||
      location.pathname.startsWith('/kos') ||
      location.pathname.startsWith('/hunian') ||
      location.pathname.startsWith('/loker')
    )) return true;
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
    <>
      {/* Backdrop for auto-close when clicking outside mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/20 lg:hidden animate-fade-in pointer-events-auto"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none pt-2 sm:pt-3 pb-2 px-3 sm:px-6 lg:px-8 pointer-events-none">
        <div 
          ref={navbarRef}
          className={`max-w-7xl mx-auto rounded-4xl transition-all duration-300 pointer-events-auto ${
            isScrolled 
              ? 'bg-white/95 backdrop-blur-xl border-sky-200/90 shadow-lg shadow-sky-950/8 py-2 px-4 sm:px-6' 
              : 'bg-white/92 backdrop-blur-lg border-slate-200/80 shadow-md shadow-slate-900/5 py-2 sm:py-2.5 px-4 sm:px-6'
          }`}
        >
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
                if (item.path === '/smart-city') {
                  return (
                    <div
                      key={item.path}
                      ref={smartCityDropdownRef}
                      className="relative"
                      onMouseEnter={() => setSmartCityDropdownOpen(true)}
                      onMouseLeave={() => setSmartCityDropdownOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => setSmartCityDropdownOpen((prev) => !prev)}
                        className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 outline-none focus:outline-none inline-flex items-center gap-1 cursor-pointer ${
                          active 
                            ? 'bg-white text-sky-950 font-bold border border-slate-200/90 shadow-xs' 
                            : 'border border-transparent text-slate-600 hover:text-sky-800 hover:bg-white/60'
                        }`}
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${smartCityDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                      </button>

                      {/* Dropdown Container with padding bridge so hover never breaks */}
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 pt-2 w-72 z-50 transition-all duration-150 ${
                          smartCityDropdownOpen
                            ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                            : 'opacity-0 invisible -translate-y-1 pointer-events-none'
                        }`}
                      >
                        <div className="bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-sky-100 p-2 space-y-1">
                          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Ekosistem Smart City</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold">4 Modul</span>
                          </div>
                          {smartCitySubItems.map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = location.pathname === sub.path;
                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={() => setSmartCityDropdownOpen(false)}
                                className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                                  isSubActive
                                    ? 'bg-sky-50 text-sky-950 border border-sky-200/70 font-bold'
                                    : 'hover:bg-slate-50 text-slate-700 hover:text-sky-900'
                                }`}
                              >
                                <div className={`p-2 rounded-lg shrink-0 ${sub.bgColor} ${sub.color}`}>
                                  <SubIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold leading-tight">{sub.name}</div>
                                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{sub.desc}</div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
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
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
                className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer outline-none focus:outline-none flex items-center justify-center ${
                  mobileMenuOpen
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                    : 'bg-sky-50 hover:bg-sky-100 border-sky-200/70 text-sky-700 active:scale-95'
                }`}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 transition-transform duration-200 rotate-90" /> : <Menu className="w-5 h-5 transition-transform duration-200" />}
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-4 bg-white/95 rounded-3xl border border-sky-100 shadow-xl space-y-3 animate-fade-in">
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
              {activeLinks.map((item) => {
                if (item.path === '/smart-city') {
                  const active = isActive(item.path);
                  return (
                    <div key={item.path} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setMobileSmartCityOpen((prev) => !prev)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                          active 
                            ? 'bg-sky-50 text-sky-900 border border-sky-200/70' 
                            : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-sky-600" />
                          <span>Smart City</span>
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileSmartCityOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {mobileSmartCityOpen && (
                        <div className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-sky-200 ml-4 animate-fade-in">
                          {smartCitySubItems.map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = location.pathname === sub.path;
                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setMobileSmartCityOpen(false);
                                }}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                  isSubActive
                                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-2xs'
                                    : 'text-slate-600 hover:text-sky-900 hover:bg-sky-50/60'
                                }`}
                              >
                                <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-white' : sub.color}`} />
                                <span className="truncate">{sub.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
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
                );
              })}
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
  </>
);
};
