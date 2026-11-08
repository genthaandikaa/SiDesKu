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
  Star,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { PublicNavbar } from '@/features/landing/components/PublicNavbar';
import { GuestSupportChatModal } from '@/features/chat/components/GuestSupportChatModal';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<AuthPageProps> = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Login Form States
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim() || !loginPassword.trim()) {
      setError('NIK/Username/Email dan password wajib diisi.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const success = await login(loginInput.trim(), loginPassword);
      if (success) {
        const searchParams = new URLSearchParams(location.search);
        const rawReturnUrl = searchParams.get('returnUrl');
        let targetUrl = '/dashboard';

        if (rawReturnUrl && typeof rawReturnUrl === 'string') {
          const trimmed = rawReturnUrl.trim();
          let isSafe =
            trimmed.startsWith('/') &&
            !trimmed.startsWith('//') &&
            !trimmed.startsWith('/\\') &&
            !trimmed.includes('\\') &&
            !trimmed.includes('://') &&
            !trimmed.includes('\0');

          if (isSafe) {
            try {
              const decoded = decodeURIComponent(trimmed);
              if (
                !decoded.startsWith('/') ||
                decoded.startsWith('//') ||
                decoded.startsWith('/\\') ||
                decoded.includes('\\') ||
                decoded.includes('://')
              ) {
                isSafe = false;
              }
            } catch {
              isSafe = false;
            }
          }

          if (isSafe) {
            targetUrl = trimmed;
          }
        }

        navigate(targetUrl, { replace: true });
      } else {
        setError('Kredensial tidak cocok. Periksa kembali NIK dan password (tanggal lahir) Anda.');
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

  const handleQuickLogin = async (u: string, p: string) => {
    setLoginInput(u);
    setLoginPassword(p);
    setError('');
    setLoading(true);
    try {
      const success = await login(u, p);
      if (success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError('Login gagal untuk akun demo.');
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

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#f8fcf9] font-sans text-slate-800 flex flex-col justify-between relative overflow-x-hidden select-none">
      
      {/* Background Ornaments */}
      {/* 1. Subtle Dot Grid Matrix */}
      <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-[0.07] pointer-events-none -z-30" />

      {/* 2. Fullscreen Concentric Decorative Circles (Top-Left & Bottom-Right) */}
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full border border-blue-300/30 pointer-events-none -z-20 flex items-center justify-center">
        <div className="w-[420px] h-[420px] rounded-full border border-blue-400/20 flex items-center justify-center">
          <div className="w-[320px] h-[320px] rounded-full bg-blue-200/20 blur-2xl" />
        </div>
      </div>

      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full border border-indigo-300/30 pointer-events-none -z-20 flex items-center justify-center">
        <div className="w-[480px] h-[480px] rounded-full border border-indigo-400/20 flex items-center justify-center">
          <div className="w-[360px] h-[360px] rounded-full bg-indigo-200/25 blur-3xl" />
        </div>
      </div>

      <div className="absolute top-1/2 left-10 w-72 h-72 rounded-full border border-blue-200/40 pointer-events-none -z-20 hidden md:block" />
      <div className="absolute top-16 right-1/4 w-48 h-48 rounded-full border border-indigo-200/40 pointer-events-none -z-20 hidden md:block" />

      {/* 3. Soft Ambient Blurs & Glows */}
      <div className="absolute -top-20 right-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
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

      {/* Public Navbar (Sesuai Foto No 1) */}
      <PublicNavbar />

      {/* Main Content */}
      <main className="relative z-20 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 pt-20 sm:pt-24 pb-8 flex items-center justify-center overflow-visible my-auto">
        
        {/* Background Aura */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 w-full overflow-visible">
          <div className="relative w-full max-w-5xl mx-auto h-full flex items-center">
            <div className="w-full lg:w-1/2 flex items-center justify-center translate-x-0 lg:translate-x-full">
              <div className="relative flex items-center justify-center overflow-visible">
                <div className="w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-blue-400/35 via-indigo-300/30 to-blue-100/15 blur-3xl transform scale-110" />
                <div className="absolute w-[520px] h-[520px] rounded-full border border-blue-400/30 blur-[0.5px]" />
                <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-bl from-indigo-200/40 via-blue-200/35 to-blue-100/20 blur-2xl" />
                <div className="absolute w-[320px] h-[320px] rounded-full border border-indigo-300/35" />
                <div className="absolute w-[240px] h-[240px] rounded-full bg-blue-300/30 blur-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative w-full max-w-5xl mx-auto bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-3 sm:p-5 lg:p-6 shadow-2xl shadow-blue-950/8 border border-white/90 ring-1 ring-blue-500/10 flex items-center min-h-[490px] overflow-hidden">
          
          {/* Inner Corner Glows */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-300/20 rounded-full blur-2xl pointer-events-none -z-10" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-300/20 rounded-full blur-2xl pointer-events-none -z-10" />

          <div className="relative w-full flex items-center">
            
            {/* Form Panel */}
            <div 
              className="w-full lg:w-1/2 p-1 sm:p-3 lg:p-4 flex items-center justify-center z-20 relative"
            >
              {/* Rich Floating Geometric Vectors behind the Login Card */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
                {/* 1. Concentric Geometric Orbit Radar Rings */}
                <svg className="w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] text-blue-500/20" viewBox="0 0 400 400" fill="none">
                  <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
                  <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="200" y1="5" x2="200" y2="395" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 8" opacity="0.6" />
                  <line x1="5" y1="200" x2="395" y2="200" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 8" opacity="0.6" />
                  <circle cx="200" cy="10" r="3" fill="#2563eb" fillOpacity="0.5" />
                  <circle cx="390" cy="200" r="3" fill="#2563eb" fillOpacity="0.5" />
                  <circle cx="10" cy="200" r="3" fill="#2563eb" fillOpacity="0.5" />
                  <circle cx="200" cy="390" r="3" fill="#2563eb" fillOpacity="0.5" />
                </svg>

                {/* 2. Geometric Organic Vector Wave 1 (Top Left) */}
                <svg 
                  className="absolute -top-14 -left-14 w-56 sm:w-64 h-auto text-blue-400/30 pointer-events-none" 
                  viewBox="0 0 229 73" 
                  fill="none"
                >
                  <path 
                    d="M211.26 72.0986C139.885 56.3466 96.1906 64.7453 4.78946 61.6528C1.46577 61.0612 -0.611907 58.2501 0.161365 55.3864C3.62557 41.9843 6.23939 29.1989 8.00076 17.03C8.27791 14.5322 11.0804 12.4866 14.241 12.4635C80.1121 10.9578 78.7541 -8.73034 169.917 4.61604C179.156 5.20641 222.822 -5.03963 228.08 16.8566C229.198 29.7428 214.959 54.348 216.581 66.951C216.916 69.5925 214.541 71.8881 211.271 72.0993" 
                    fill="currentColor" 
                  />
                </svg>

                {/* 3. Geometric Organic Vector Ribbon 2 (Bottom Right) */}
                <svg 
                  className="absolute -bottom-12 -right-12 w-60 sm:w-68 h-auto text-indigo-400/25 pointer-events-none" 
                  viewBox="0 0 228 63" 
                  fill="none"
                >
                  <path 
                    d="M5.50045 1.34712C76.7075 -2.39386 148.921 1.65722 222.141 13.5004C225.638 14.12 227.883 16.9515 227.141 19.8124C223.831 33.2024 221.397 45.9818 219.842 58.1511C219.611 60.6497 216.723 62.6747 213.411 62.6719C144.411 63.6387 77.1072 59.5847 11.4982 50.51C8.3157 50.0662 5.53067 47.4928 5.26751 44.7714C3.78788 31.8603 2.04739 19.0889 0.0460319 6.45727C-0.368077 3.80978 2.0661 1.53086 5.48838 1.34624" 
                    fill="currentColor" 
                  />
                </svg>

                {/* 4. Geometric Dot Grid Matrix (Top Right) */}
                <div className="absolute top-2 -right-6 sm:top-4 sm:-right-8 grid grid-cols-4 gap-2 opacity-30 pointer-events-none">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  ))}
                </div>

                {/* 5. Geometric Dot Grid Matrix (Bottom Left) */}
                <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 grid grid-cols-4 gap-2 opacity-25 pointer-events-none">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  ))}
                </div>

                {/* 6. Geometric Dashed Wave Trajectory (Top Right) */}
                <svg className="absolute -top-8 right-12 w-32 h-16 text-sky-500/35 pointer-events-none" viewBox="0 0 120 60" fill="none">
                  <path d="M 5 50 Q 55 10 115 25" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M 110 20 L 118 25 L 110 30 Z" fill="currentColor" />
                </svg>

                {/* 7. Floating 4-point Sparkle Stars */}
                <div className="absolute -top-3 left-6 w-5 h-5 text-blue-500/70 pointer-events-none animate-float">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                  </svg>
                </div>
                <div className="absolute top-1/2 -right-6 w-6 h-6 text-indigo-500/70 pointer-events-none animate-float-gentle">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                  </svg>
                </div>
                <div className="absolute -bottom-4 right-1/4 w-4 h-4 text-sky-500/80 pointer-events-none animate-pulse">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                  </svg>
                </div>
                <div className="absolute bottom-1/4 -left-6 w-4 h-4 text-blue-600/60 pointer-events-none animate-float">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                  </svg>
                </div>
              </div>

              <div className="w-full max-w-md bg-white p-5 sm:p-6 rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-100/90 space-y-3 relative overflow-hidden">
                {/* Subtle Geometric Watermark inside top of card */}
                <div className="absolute -top-10 -right-10 w-36 h-36 pointer-events-none -z-10">
                  <svg className="w-full h-full text-blue-500/10" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                    <circle cx="60" cy="60" r="32" stroke="currentColor" strokeWidth="1" />
                    <circle cx="60" cy="60" r="15" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                  </svg>
                </div>
                <div className="absolute -top-6 -left-6 w-28 h-28 pointer-events-none -z-10">
                  <svg className="w-full h-full text-indigo-500/10" viewBox="0 0 100 100" fill="none">
                    <path d="M 10 90 Q 50 10 90 90" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
                    <path d="M 20 90 Q 50 25 80 90" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </div>

                {/* Header Title with Prominent Geometric Vector Backdrop */}
                <div className="relative text-center pb-3 pt-2 flex flex-col items-center justify-center">
                  {/* Geometric Vector Graphic directly behind "Masuk ke Akun" */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
                    {/* Glowing ambient radial light */}
                    <div className="w-56 h-14 bg-gradient-to-r from-blue-400/25 via-sky-300/30 to-indigo-400/25 rounded-full blur-xl" />
                    
                    {/* SVG Geometric Vector Ribbon & Arc */}
                    <svg 
                      className="w-64 sm:w-72 h-16 sm:h-20 text-blue-600/40 pointer-events-none overflow-visible" 
                      viewBox="0 0 260 70" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Geometric Background Pill Ribbon */}
                      <rect x="25" y="8" width="210" height="46" rx="23" fill="#3b82f6" fillOpacity="0.08" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.35" />
                      
                      {/* Concentric Geometric Orbit Arcs */}
                      <path d="M 15 31 C 45 10, 215 10, 245 31" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.4" />
                      <path d="M 20 40 C 60 62, 200 62, 240 40" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.45" />
                      
                      {/* 4-point Geometric Sparkle Stars */}
                      <path d="M 12 31 L 15 23 L 23 20 L 15 17 L 12 9 L 9 17 L 1 20 L 9 23 Z" fill="#2563eb" fillOpacity="0.5" />
                      <path d="M 248 31 L 251 25 L 257 22 L 251 19 L 248 13 L 245 19 L 239 22 L 245 25 Z" fill="#4f46e5" fillOpacity="0.5" />
                      
                      {/* Accent Circles & Crosshairs */}
                      <circle cx="35" cy="50" r="2.5" fill="#3b82f6" fillOpacity="0.6" />
                      <circle cx="225" cy="50" r="2.5" fill="#3b82f6" fillOpacity="0.6" />
                      <path d="M 130 5 L 130 11 M 127 8 L 133 8" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
                    </svg>
                  </div>

                  <h1 className="relative z-10 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Masuk ke Akun
                  </h1>
                </div>

              {/* Informative notice if came from /register */}
              {location.pathname === '/register' && (
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium animate-fade-in flex items-start gap-2">
                  <div className="text-[11px] leading-snug">
                    <strong>Pendaftaran Warga Terpusat:</strong> Akun warga didaftarkan langsung oleh kantor desa. Silakan masuk dengan NIK dan tanggal lahir.
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {error && (
                <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-fade-in flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</div>
                  <span>{error}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
                {/* Email / Username / NIK Pill */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block pl-1">
                    NIK atau Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80">
                        <User className="w-3 h-3" />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      placeholder="NIK 16 digit atau username"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50/90 rounded-full border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Password / Tanggal Lahir Pill */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block pl-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80">
                        <Lock className="w-3 h-3" />
                      </div>
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password atau tanggal lahir (DDMMYYYY)"
                      className="w-full pl-11 pr-11 py-2.5 sm:py-3 bg-slate-50/90 rounded-full border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between pt-1">
                  <Link
                    to="/lacak"
                    className="text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors"
                  >
                    Lacak berkas
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition-all press-down flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed hover-glow"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-center text-slate-500 pt-2 flex items-center justify-center gap-1">
                  <span>Punya masalah?</span>
                  <button
                    type="button"
                    onClick={() => setShowSupportChat(true)}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                  >
                    Bantuan
                  </button>
                </div>
              </form>

            </div>
          </div>

          {/* Hero Panel */}
          <div className="w-full lg:w-1/2 p-2 sm:p-4 items-center justify-center z-10 hidden lg:flex relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
              <div className="w-[380px] h-[380px] rounded-full bg-blue-100/50 blur-sm" />
              <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-bl from-indigo-200/60 via-blue-200/50 to-blue-100/40" />
              <div className="absolute w-[220px] h-[220px] rounded-full bg-gradient-to-bl from-indigo-300/40 via-blue-300/30 to-indigo-100/40" />
            </div>

            <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center">
              <img src="/images/paper-plane.svg" alt="" className="absolute -top-3 w-10 h-10 opacity-80 pointer-events-none animate-float drop-shadow-sm right-1/4 rotate-0" />

              <div className="relative w-full flex items-center justify-center group scale-100 rotate-0">
                <div className="absolute inset-0 bg-blue-300/20 rounded-full blur-2xl -z-10 group-hover:bg-blue-400/30 transition-colors" />
                <img
                  src="/images/landing/ilustrasi-login.svg"
                  alt="Ilustrasi layanan surat desa digital"
                  className="w-full max-w-[340px] xl:max-w-[370px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500 z-10"
                />

                <div className="absolute -top-2 -left-2 sm:left-2 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-blue-100 animate-float">
                  <div className="w-6 h-6 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                  <div className="text-left text-[10px]"><div className="font-extrabold text-slate-900 leading-tight">TTD Barcode & QR Sah</div><div className="text-[8px] text-blue-600 font-semibold">Kepala Desa Doko</div></div>
                </div>

                <div className="absolute -bottom-2 right-2 sm:right-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-blue-100 animate-float-gentle">
                  <div className="w-6 h-6 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black"><Zap className="w-3.5 h-3.5" /></div>
                  <div className="text-left text-[10px]"><div className="font-extrabold text-slate-900 leading-tight">&lt; 15 Menit Layanan</div><div className="text-[8px] text-slate-500 font-medium">100% Bebas Biaya</div></div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-4 z-20">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-blue-200 shadow-2xs text-[11px] font-black text-slate-800 hover:border-blue-400 transition-colors"><ShieldCheck className="w-3.5 h-3.5 text-blue-600" /><span>Legalitas QR Dispendukcapil</span></div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-blue-200 shadow-2xs text-[11px] font-black text-slate-800 hover:border-blue-400 transition-colors"><Building2 className="w-3.5 h-3.5 text-indigo-600" /><span>Pemerintah Desa Doko</span></div>
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
          <Link to="/" className="hover:text-blue-700">Privasi</Link>
          <Link to="/" className="hover:text-blue-700">Syarat & Ketentuan</Link>
          <Link to="/lacak" className="hover:text-blue-700">Bantuan</Link>
        </div>
      </footer>
      
      {/* Modal Bantuan Tamu (Lupa Akun / Bantuan Desa) */}
      <GuestSupportChatModal
        isOpen={showSupportChat}
        onClose={() => setShowSupportChat(false)}
      />

    </div>
  );
};
