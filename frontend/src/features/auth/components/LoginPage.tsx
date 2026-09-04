import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Loader2, 
  Eye, 
  EyeOff,
  ShieldCheck, 
  CheckCircle2, 
  Zap,
  Globe,
  Mail,
  Phone,
  CreditCard,
  Building2,
  Sparkles,
  Star,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { BrandLogo } from '@/shared/components/BrandLogo';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<AuthPageProps> = ({ initialMode }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>(() => {
    if (initialMode) return initialMode;
    return location.pathname === '/register' ? 'register' : 'login';
  });

  // Login Form States
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States
  const [registerData, setRegisterData] = useState({
    nik: '',
    nama_lengkap: '',
    username: '',
    email: '',
    no_hp_wa: '',
    password: '',
    password_confirmation: '',
    rt_id: 1,
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync mode on URL change if navigated via browser buttons
  useEffect(() => {
    if (location.pathname === '/register' && mode !== 'register') {
      setMode('register');
      setError('');
    } else if (location.pathname === '/login' && mode !== 'login') {
      setMode('login');
      setError('');
    }
  }, [location.pathname]);

  const switchMode = (newMode: 'login' | 'register') => {
    if (newMode === mode) return;
    setMode(newMode);
    setError('');
    window.history.replaceState(null, '', newMode === 'register' ? '/register' : '/login');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim() || !loginPassword.trim()) {
      setError('Username/NIK/Email dan password wajib diisi.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const success = await login(loginInput.trim(), loginPassword);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Kredensial tidak cocok. Periksa kembali username/NIK dan password Anda.');
      }
    } catch (err: any) {
      const backendMsg = err.response?.data?.errors?.login?.[0] || 
                         err.response?.data?.message || 
                         'Gagal login. Pastikan server backend terhubung atau kredensial benar.';
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.nik || !registerData.nama_lengkap || !registerData.username || !registerData.email || !registerData.password) {
      setError('Seluruh formulir berbintang (*) wajib diisi.');
      return;
    }

    if (registerData.nik.length !== 16) {
      setError('NIK harus berjumlah tepat 16 digit angka.');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (registerData.password !== registerData.password_confirmation) {
      setError('Konfirmasi password tidak sesuai.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await register({
        nik: registerData.nik.trim(),
        nama_lengkap: registerData.nama_lengkap.trim(),
        username: registerData.username.trim(),
        email: registerData.email.trim(),
        no_hp_wa: registerData.no_hp_wa.trim(),
        password: registerData.password,
        rt_id: Number(registerData.rt_id),
      });

      if (success) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pendaftaran gagal. Periksa kembali NIK atau Email Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string) => {
    setLoginInput(u);
    setLoginPassword('password123');
    setError('');
  };

  return (
    <div className="h-screen h-[100dvh] max-h-screen w-full bg-[#f8fcf9] font-sans text-slate-800 flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Background Ornaments */}
      {/* 1. Subtle Dot Grid Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(#059669_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-[0.07] pointer-events-none -z-30" />

      {/* 2. Fullscreen Concentric Decorative Circles (Top-Left & Bottom-Right) */}
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full border border-emerald-300/30 pointer-events-none -z-20 flex items-center justify-center">
        <div className="w-[420px] h-[420px] rounded-full border border-emerald-400/20 flex items-center justify-center">
          <div className="w-[320px] h-[320px] rounded-full bg-emerald-200/20 blur-2xl" />
        </div>
      </div>

      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full border border-teal-300/30 pointer-events-none -z-20 flex items-center justify-center">
        <div className="w-[480px] h-[480px] rounded-full border border-teal-400/20 flex items-center justify-center">
          <div className="w-[360px] h-[360px] rounded-full bg-teal-200/25 blur-3xl" />
        </div>
      </div>

      <div className="absolute top-1/2 left-10 w-72 h-72 rounded-full border border-emerald-200/40 pointer-events-none -z-20 hidden md:block" />
      <div className="absolute top-16 right-1/4 w-48 h-48 rounded-full border border-teal-200/40 pointer-events-none -z-20 hidden md:block" />

      {/* 3. Soft Ambient Blurs & Glows */}
      <div className="absolute -top-20 right-1/3 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 4. Floating Geometric Vectors from public/images */}
      <img 
        src="/images/landing/Vector.svg" 
        alt="" 
        className="absolute top-6 left-12 w-44 opacity-35 pointer-events-none animate-pulse -z-10" 
      />
      <img 
        src="/images/landing/Vector2.svg" 
        alt="" 
        className="absolute bottom-8 right-20 w-52 opacity-30 pointer-events-none -z-10" 
      />
      <img 
        src="/images/landing/Component 12.svg" 
        alt="" 
        className="absolute top-14 right-1/4 w-8 h-8 opacity-45 pointer-events-none animate-float -z-10 hidden sm:block" 
      />
      <img 
        src="/images/landing/Component 12.svg" 
        alt="" 
        className="absolute bottom-16 left-1/4 w-6 h-6 opacity-35 pointer-events-none animate-float-gentle -z-10 hidden sm:block" 
      />

      {/* Header */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-3 sm:py-4 flex items-center justify-between shrink-0">
        <Link to="/" className="hover:opacity-95 transition-opacity shrink-0 outline-none focus:outline-none">
          <BrandLogo size="md" />
        </Link>

        {/* Center Nav Links - Pill Capsule with Image 1 Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-full border border-slate-200/80 shadow-md shadow-emerald-950/5">
          <Link
            to="/"
            className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-all outline-none"
          >
            <span>Beranda</span>
          </Link>
          <Link
            to="/profil"
            className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-all outline-none"
          >
            <span>Direktori Desa</span>
          </Link>
          <Link
            to="/layanan-surat"
            className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-all outline-none"
          >
            <span>Layanan Surat</span>
          </Link>
          <Link
            to="/lacak"
            className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-all outline-none"
          >
            <span>Lacak Surat</span>
          </Link>
          <Link
            to="/berita"
            className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80 transition-all outline-none"
          >
            <span>Warta</span>
          </Link>
        </nav>

        {/* Right Action: Daftar Akun & Portal Masuk (Identical to Image 1) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all shadow-2xs whitespace-nowrap cursor-pointer outline-none ${
              mode === 'register'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200/80'
            }`}
          >
            <span>Daftar Akun</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-extrabold shadow-md transition-all press-down whitespace-nowrap cursor-pointer outline-none ${
              mode === 'login'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/30'
                : 'bg-white text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 border border-slate-200/80'
            }`}
          >
            <span>Portal Masuk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 py-1 sm:py-2 flex items-center justify-center overflow-visible my-auto">
        
        {/* Background Aura */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 w-full overflow-visible">
          <div className="relative w-full max-w-5xl mx-auto h-full flex items-center">
            <div 
              className={`w-full lg:w-1/2 flex items-center justify-center transition-transform duration-750 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                mode === 'login' ? 'translate-x-0 lg:translate-x-full' : 'translate-x-0'
              }`}
            >
              {/* Outer Glowing Green Concentric Circles & Aura (Seamless, Ultra-smooth & Unclipped) */}
              <div className="relative flex items-center justify-center overflow-visible">
                <div className="w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-emerald-400/35 via-teal-300/30 to-emerald-100/15 blur-3xl transform scale-110" />
                <div className="absolute w-[520px] h-[520px] rounded-full border border-emerald-400/30 blur-[0.5px]" />
                <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-bl from-teal-200/40 via-emerald-200/35 to-emerald-100/20 blur-2xl" />
                <div className="absolute w-[320px] h-[320px] rounded-full border border-teal-300/35" />
                <div className="absolute w-[240px] h-[240px] rounded-full bg-emerald-300/30 blur-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative w-full max-w-5xl mx-auto bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-3 sm:p-5 lg:p-6 shadow-2xl shadow-emerald-950/8 border border-white/90 ring-1 ring-emerald-500/10 flex items-center min-h-[490px] overflow-hidden">
          
          {/* Inner Corner Glows */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none -z-10" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-300/20 rounded-full blur-2xl pointer-events-none -z-10" />

          <div className="relative w-full flex items-center">
            
            {/* Form Panel */}
            <div 
              className={`w-full lg:w-1/2 p-1 sm:p-3 lg:p-4 flex items-center justify-center transition-transform duration-750 ease-[cubic-bezier(0.65,0,0.35,1)] z-20 ${
                mode === 'login' ? 'translate-x-0 lg:translate-x-0' : 'translate-x-0 lg:translate-x-full'
              }`}
            >
              <div className="w-full max-w-md bg-white p-5 sm:p-6 rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100/90 space-y-3">
              
              {/* Tab Selector: Login vs Sign up with Staggered Sliding Pill Indicator */}
              <div className="flex items-center gap-8 border-b border-slate-100 pb-1.5 relative">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`text-lg sm:text-xl font-black tracking-tight transition-all duration-300 cursor-pointer relative pb-1.5 ${
                    mode === 'login' ? 'text-slate-900 scale-105' : 'text-slate-300 hover:text-slate-500 scale-100'
                  }`}
                >
                  Login
                  {mode === 'login' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full transition-all duration-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`text-lg sm:text-xl font-black tracking-tight transition-all duration-300 cursor-pointer relative pb-1.5 ${
                    mode === 'register' ? 'text-slate-900 scale-105' : 'text-slate-300 hover:text-slate-500 scale-100'
                  }`}
                >
                  Sign up
                  {mode === 'register' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full transition-all duration-500" />
                  )}
                </button>
              </div>

              {/* Sub-Headline */}
              <div className="space-y-0.5">
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium transition-opacity duration-300">
                  {mode === 'login' 
                    ? 'Masukkan akun terdaftar untuk mengakses panel layanan surat dan data desa.'
                    : 'Daftarkan identitas resmi warga Desa Doko untuk akses layanan digital mandiri.'}
                </p>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-fade-in flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</div>
                  <span>{error}</span>
                </div>
              )}

              {/* DUAL FORM INNER CONTAINER */}
              <div className="relative">
                
                {/* Form 1: Login */}
                <div 
                  className={`w-full space-y-3 transition-all duration-500 ease-out ${
                    mode === 'login' 
                      ? 'opacity-100 translate-x-0 pointer-events-auto relative' 
                      : 'opacity-0 -translate-x-8 pointer-events-none absolute inset-0'
                  }`}
                >
                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    {/* Email / Username / NIK Pill */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80">
                          <User className="w-3 h-3" />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={loginInput}
                        onChange={(e) => setLoginInput(e.target.value)}
                        placeholder="Email / NIK / Username"
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50/90 rounded-full border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
                        required={mode === 'login'}
                      />
                    </div>

                    {/* Password Pill */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80">
                          <Lock className="w-3 h-3" />
                        </div>
                      </div>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full pl-11 pr-11 py-2.5 sm:py-3 bg-slate-50/90 rounded-full border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner font-mono"
                        required={mode === 'login'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Forgot Password & Submit Button Row */}
                    <div className="flex items-center justify-between pt-0.5">
                      <Link
                        to="/lacak"
                        className="text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        Forgot your password?
                      </Link>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-500/25 transition-all press-down flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed hover-glow"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifikasi...</span>
                          </>
                        ) : (
                          <span>Login</span>
                        )}
                      </button>
                    </div>

                    {/* Quick 1-Click Demo Accounts Switcher */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        <span>Pilih Akun Demo (1-Klik):</span>
                        <span className="text-emerald-700 font-bold">Password: password123</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {[
                          { label: 'Warga', user: 'warga01' },
                          { label: 'Ketua RT', user: 'rt01' },
                          { label: 'Ketua RW', user: 'rw01' },
                          { label: 'Sekdes', user: 'sekdes' },
                          { label: 'Bendahara', user: 'bendahara_desa' },
                          { label: 'Kades', user: 'kades' },
                          { label: 'Admin', user: 'admin' },
                        ].map((acc) => (
                          <button
                            key={acc.user}
                            type="button"
                            onClick={() => handleQuickFill(acc.user)}
                            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-[10px] border border-slate-200/70 transition-all cursor-pointer press-down shadow-2xs"
                          >
                            {acc.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>

                {/* Form 2: Register */}
                <div 
                  className={`w-full space-y-2.5 transition-all duration-500 ease-out ${
                    mode === 'register' 
                      ? 'opacity-100 translate-x-0 pointer-events-auto relative' 
                      : 'opacity-0 translate-x-8 pointer-events-none absolute inset-0'
                  }`}
                >
                  <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                    
                    {/* Row 1: NIK & Nama Lengkap */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          name="nik"
                          maxLength={16}
                          value={registerData.nik}
                          onChange={(e) => setRegisterData({ ...registerData, nik: e.target.value })}
                          placeholder="NIK (16 Digit) *"
                          className="w-full pl-8 pr-3 py-2 bg-slate-50/90 rounded-full border border-slate-200 text-[11px] font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono shadow-inner"
                          required={mode === 'register'}
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          name="nama_lengkap"
                          value={registerData.nama_lengkap}
                          onChange={(e) => setRegisterData({ ...registerData, nama_lengkap: e.target.value })}
                          placeholder="Nama Lengkap (KTP) *"
                          className="w-full pl-8 pr-3 py-2 bg-slate-50/90 rounded-full border border-slate-200 text-[11px] font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-inner"
                          required={mode === 'register'}
                        />
                      </div>
                    </div>

                    {/* Row 2: Username & WhatsApp */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          name="username"
                          value={registerData.username}
                          onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                          placeholder="Username Akun *"
                          className="w-full pl-8 pr-3 py-2 bg-slate-50/90 rounded-full border border-slate-200 text-[11px] font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-inner"
                          required={mode === 'register'}
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          name="no_hp_wa"
                          value={registerData.no_hp_wa}
                          onChange={(e) => setRegisterData({ ...registerData, no_hp_wa: e.target.value })}
                          placeholder="No. WhatsApp *"
                          className="w-full pl-8 pr-3 py-2 bg-slate-50/90 rounded-full border border-slate-200 text-[11px] font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono shadow-inner"
                          required={mode === 'register'}
                        />
                      </div>
                    </div>

                    {/* Row 3: Email */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="Alamat Email Aktif *"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50/90 rounded-full border border-slate-200 text-[11px] font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-inner"
                        required={mode === 'register'}
                      />
                    </div>

                    {/* Row 4: Password & Confirm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          name="password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          placeholder="Password *"
                          className="w-full pl-8 pr-8 py-2 bg-slate-50/90 rounded-full border border-slate-200 text-[11px] font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono shadow-inner"
                          required={mode === 'register'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showRegisterPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="password_confirmation"
                          value={registerData.password_confirmation}
                          onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
                          placeholder="Ulangi Password *"
                          className="w-full pl-8 pr-8 py-2 bg-slate-50/90 rounded-full border border-slate-200 text-[11px] font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono shadow-inner"
                          required={mode === 'register'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all press-down flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed hover-glow"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Mendaftarkan Data...</span>
                          </>
                        ) : (
                          <span>Daftar Akun Warga</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

              </div>

            </div>
          </div>

          {/* Hero Panel */}
          <div 
            className={`w-full lg:w-1/2 p-2 sm:p-4 items-center justify-center transition-transform duration-750 ease-[cubic-bezier(0.65,0,0.35,1)] z-10 hidden lg:flex relative ${
              mode === 'login' ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Layered Mint Circles Concentric Behind Laptop */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
              <div className="w-[460px] h-[460px] rounded-full bg-emerald-100/50 blur-sm" />
              <div className="absolute w-[360px] h-[360px] rounded-full bg-gradient-to-bl from-teal-200/60 via-emerald-200/50 to-emerald-100/40" />
              <div className="absolute w-[270px] h-[270px] rounded-full bg-gradient-to-bl from-teal-300/40 via-emerald-300/30 to-teal-100/40" />
            </div>

            <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center">
              
              {/* Decorative Vector */}
              <img 
                src="/images/paper-plane.svg" 
                alt="" 
                className={`absolute -top-3 w-10 h-10 opacity-80 pointer-events-none animate-float drop-shadow-sm transition-all duration-750 ease-out ${
                  mode === 'login' ? 'right-1/4 rotate-0' : 'left-1/4 -rotate-12'
                }`}
              />

              {/* Main 3D Laptop */}
              <div 
                className={`relative w-full flex items-center justify-center group transition-transform duration-750 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                  mode === 'login' ? 'scale-100 rotate-0' : 'scale-105 -rotate-1'
                }`}
              >
                {/* Backing Ambient Glow */}
                <div className="absolute inset-0 bg-emerald-300/20 rounded-full blur-2xl -z-10 group-hover:bg-emerald-400/30 transition-colors" />

                {/* Primary Laptop Workspace */}
                <img 
                  src="/images/landing/benefit-laptop-element.webp" 
                  alt="SIDes Laptop Digital Workspace" 
                  className="w-full max-w-[340px] xl:max-w-[370px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500 z-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/auth-illustration.png';
                  }}
                />

                {/* Floating Badge 1 */}
                <div 
                  className={`absolute -top-2 -left-2 sm:left-2 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-emerald-100 transition-all duration-700 ease-out animate-float ${
                    mode === 'login' ? 'translate-x-0' : '-translate-x-2 -translate-y-1'
                  }`}
                >
                  <div className="w-6 h-6 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left text-[10px]">
                    <div className="font-extrabold text-slate-900 leading-tight">TTD QR Code Sah</div>
                    <div className="text-[8px] text-emerald-600 font-semibold">DPMPD Kab. Kediri</div>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div 
                  className={`absolute -bottom-2 right-2 sm:right-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-emerald-100 transition-all duration-700 ease-out animate-float-gentle ${
                    mode === 'login' ? 'translate-x-0' : 'translate-x-2 translate-y-1'
                  }`}
                >
                  <div className="w-6 h-6 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left text-[10px]">
                    <div className="font-extrabold text-slate-900 leading-tight">&lt; 15 Menit Layanan</div>
                    <div className="text-[8px] text-slate-500 font-medium">100% Bebas Biaya</div>
                  </div>
                </div>
              </div>

              {/* Bottom Trust Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4 z-20">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200 shadow-2xs text-[11px] font-black text-slate-800 hover:border-emerald-400 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Legalitas QR Dispendukcapil</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200 shadow-2xs text-[11px] font-black text-slate-800 hover:border-emerald-400 transition-colors">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Pemerintah Desa Doko</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-medium border-t border-slate-100 shrink-0">
        <div>© {new Date().getFullYear()} Pemerintah Desa Doko, Kec. Ngasem, Kab. Kediri.</div>
        <div className="flex items-center gap-4 mt-1 sm:mt-0 font-bold text-slate-500">
          <Link to="/" className="hover:text-emerald-700">Privasi</Link>
          <Link to="/" className="hover:text-emerald-700">Syarat & Ketentuan</Link>
          <Link to="/lacak" className="hover:text-emerald-700">Bantuan</Link>
        </div>
      </footer>

    </div>
  );
};
