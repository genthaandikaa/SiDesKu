import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard, 
  Search, 
  LogOut,
  ChevronDown
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

  // Mode 1: Pre-Login Navigation Links (Akses publik seluruh fitur unggulan desa)
  const preLoginLinks: NavItem[] = [
    { name: 'Beranda', path: '/' },
    { name: 'Profil', path: '/profil' },
    { name: 'Layanan Surat', path: '/layanan-surat' },
    { name: 'Lacak Surat', path: '/lacak' },
    { name: 'APBDes', path: '/transparansi' },
    { name: 'Bansos', path: '/bansos' },
    { name: 'Warta', path: '/berita' },
  ];

  // Mode 2: Post-Login Navigation Links (Fokus operasional warga/petugas desa)
  const postLoginLinks: NavItem[] = [
    { name: 'Beranda', path: '/' },
    { name: 'Profil', path: '/profil' },
    { name: 'Layanan Surat', path: '/layanan-surat' },
    { name: 'Lacak Berkas', path: '/lacak' },
    { name: 'APBDes', path: '/transparansi' },
    { name: 'Bansos', path: '/bansos' },
    { name: 'Warta', path: '/berita' },
    { name: 'Dashboard', path: '/dashboard', isSpecial: true },
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-sm py-2.5 border-b border-slate-200/60' 
        : 'bg-white py-3.5 shadow-2xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <Link to="/" className="hover:opacity-95 transition-opacity shrink-0 outline-none focus:outline-none">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation Links (Unboxed, Seamless with Navbar Background, Hover-Lift Animated) */}
          <nav className="hidden lg:flex items-center gap-1">
            {activeLinks.map((item) => {
              const active = isActive(item.path);
              if (item.isSpecial) {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-full text-xs font-black transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap outline-none focus:outline-none hover:-translate-y-0.5 active:scale-95 ${
                      active 
                        ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/30' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
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
                  className={`px-3.5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-300 outline-none focus:outline-none hover:-translate-y-0.5 active:scale-95 border ${
                    active 
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/25 font-black' 
                      : 'text-slate-700 border-transparent hover:text-emerald-900 hover:bg-white/80 hover:border-emerald-100/90 hover:shadow-xs'
                  }`}
                >
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Dual Mode (Pre-login = Login/Register, Post-login = User Profile Card) */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 transition-all shadow-xs press-down outline-none focus:outline-none cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                    {displayName.charAt(0)}
                  </div>
                  <div className="text-left text-xs">
                    <div className="font-extrabold text-slate-900 leading-tight max-w-[110px] truncate">
                      {displayName}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold capitalize leading-none mt-0.5">
                      {user.role?.display_name || 'Warga'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-fade-in space-y-1">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Akun Terdaftar</div>
                      <div className="text-sm font-extrabold text-slate-900 truncate">{displayName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{user.email || user.username}</div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors outline-none focus:outline-none"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      <span>Buka Panel Dashboard</span>
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
                  to="/register"
                  className="px-4 py-2 rounded-full text-xs font-extrabold text-slate-700 hover:text-emerald-800 bg-white/90 hover:bg-emerald-50 border border-slate-200/80 transition-all shadow-2xs whitespace-nowrap outline-none focus:outline-none"
                >
                  <span>Register</span>
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all press-down hover-glow whitespace-nowrap outline-none focus:outline-none"
                >
                  <span>Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-4 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-3 animate-fade-in">
            {user && (
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">{displayName}</div>
                    <div className="text-[10px] text-emerald-700 font-bold capitalize">{user.role?.display_name || 'Warga'}</div>
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
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {!user && (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-extrabold rounded-2xl border border-slate-200 text-slate-700 bg-slate-50"
                >
                  Daftar
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-extrabold rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                >
                  Masuk Portal
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};
