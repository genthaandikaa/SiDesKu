import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, Clock3, Eye, EyeOff, HelpCircle, Loader2, Lock, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { GuestSupportChatModal } from '@/features/chat/components/GuestSupportChatModal';
import { PublicNavbar } from '@/features/landing/components/PublicNavbar';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<AuthPageProps> = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
        const rawReturnUrl = new URLSearchParams(location.search).get('returnUrl');
        let targetUrl = '/dashboard';
        if (rawReturnUrl) {
          const trimmed = rawReturnUrl.trim();
          let isSafe = trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.startsWith('/\\') && !trimmed.includes('\\') && !trimmed.includes('://') && !trimmed.includes('\0');
          if (isSafe) {
            try {
              const decoded = decodeURIComponent(trimmed);
              if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.startsWith('/\\') || decoded.includes('\\') || decoded.includes('://')) isSafe = false;
            } catch {
              isSafe = false;
            }
          }
          if (isSafe) targetUrl = trimmed;
        }
        navigate(targetUrl, { replace: true });
      } else {
        setError('Kredensial tidak cocok. Periksa kembali NIK dan password (tanggal lahir) Anda.');
      }
    } catch (err: any) {
      const status = err.response?.status;
      const validationMessage = err.response?.data?.errors?.login?.[0];
      const serverMessage = err.response?.data?.message;
      setError(status >= 500
        ? 'Server sedang bermasalah. Coba lagi beberapa saat atau hubungi administrator.'
        : validationMessage || serverMessage || 'Gagal login. Pastikan server backend terhubung atau kredensial benar.');
    } finally {
      setLoading(false);
    }
  };

  const isRegisterRoute = location.pathname === '/register';

  const renderLoginCard = (variant: 'desktop' | 'mobile') => {
    const desktop = variant === 'desktop';
    const usernameId = `${variant}-login-username`;
    const passwordId = `${variant}-login-password`;

    return (
      <section className={desktop ? 'w-full rounded-[1.6rem] border border-slate-100 bg-white/95 p-5 shadow-[0_14px_30px_rgba(15,35,75,0.08)] sm:p-6' : 'relative mx-auto mt-8 w-[calc(100%-0.5rem)] max-w-2xl rounded-[1.75rem] border border-white bg-white px-5 py-6 shadow-[0_25px_70px_rgba(4,39,100,0.2)] sm:mt-10 sm:w-full sm:rounded-[2rem] sm:px-10 sm:py-9 lg:px-12 lg:py-10'} aria-labelledby={`${variant}-login-title`}>
        <div className={desktop ? 'mb-4 border-b border-slate-100 pb-3' : 'mb-5 text-center sm:mb-8'}>
          {desktop ? (
            <>
              <h2 id={`${variant}-login-title`} className="text-2xl font-extrabold tracking-tight text-slate-900">Masuk ke Akun</h2>
              <p className="mt-1 text-xs text-slate-500">Gunakan NIK atau username terdaftar Anda.</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2.5 sm:gap-3">
                <span className="h-9 w-1.5 rounded-full bg-blue-600 sm:h-12 sm:w-2" />
                <h2 id={`${variant}-login-title`} className="text-[1.65rem] font-black tracking-tight text-[#102653] sm:text-4xl">Masuk Akun</h2>
              </div>
              <div className="mx-auto mt-2 h-1.5 w-28 rounded-full bg-blue-300 sm:mt-3 sm:h-2 sm:w-32" />
            </>
          )}
        </div>

        {isRegisterRoute && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900 sm:text-sm">
            <strong>Pendaftaran warga terpusat:</strong> Akun warga didaftarkan langsung oleh kantor desa. Silakan masuk dengan NIK dan tanggal lahir.
          </div>
        )}
        {error && (
          <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-relaxed text-rose-700 sm:text-sm">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-xs font-black">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className={desktop ? 'space-y-3.5' : 'space-y-4 sm:space-y-5'}>
          <div className={desktop ? 'space-y-1' : 'space-y-1.5'}>
            <label htmlFor={usernameId} className={desktop ? 'block text-sm font-bold text-slate-700' : 'block text-sm font-bold tracking-tight text-[#102653] sm:text-base'}>NIK atau Username</label>
            <div className="relative">
              <span className={desktop ? 'pointer-events-none absolute inset-y-0 left-3 flex items-center text-blue-500' : 'pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-blue-600 sm:left-4'}><User className={desktop ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'} /></span>
              <input id={usernameId} type="text" autoComplete="username" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} placeholder={desktop ? 'NIK 16 digit atau username' : 'Masukkan NIK atau username'} className={desktop ? 'h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 font-mono text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100' : 'h-[3.25rem] w-full rounded-2xl border border-blue-200 bg-[#eaf2ff] pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:h-13 sm:bg-[#f5f8ff] sm:pl-12 sm:text-base'} required />
            </div>
          </div>

          <div className={desktop ? 'space-y-1' : 'space-y-1.5'}>
            <label htmlFor={passwordId} className={desktop ? 'block text-sm font-bold text-slate-700' : 'block text-sm font-bold tracking-tight text-[#102653] sm:text-base'}>Password</label>
            <div className="relative">
              <span className={desktop ? 'pointer-events-none absolute inset-y-0 left-3 flex items-center text-blue-500' : 'pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-blue-600 sm:left-4'}><Lock className={desktop ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'} /></span>
              <input id={passwordId} type={showLoginPassword ? 'text' : 'password'} autoComplete="current-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder={desktop ? 'Password atau tanggal lahir (DDMMYYYY)' : 'Masukkan password'} className={desktop ? 'h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-10 font-mono text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100' : 'h-[3.25rem] w-full rounded-2xl border border-blue-200 bg-[#eaf2ff] pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:h-13 sm:bg-[#f5f8ff] sm:pl-12 sm:pr-14 sm:text-base'} required />
              <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} aria-label={showLoginPassword ? 'Sembunyikan password' : 'Tampilkan password'} className={desktop ? 'absolute inset-y-0 right-2 flex items-center rounded-full px-2 text-slate-400 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500' : 'absolute inset-y-0 right-3 flex items-center rounded-lg px-2 text-slate-500 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'}>
                {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {desktop ? (
            <div className="flex items-center justify-between gap-2 pt-1">
              <Link to="/lacak" className="text-xs font-semibold text-slate-500 transition hover:text-blue-700">Lacak berkas</Link>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <button type="button" onClick={() => setShowSupportChat(true)} className="text-xs font-bold text-blue-600 transition hover:text-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">Bantuan / Lupa Akun</button>
              <button type="submit" disabled={loading} className="inline-flex min-h-9 min-w-24 items-center justify-center gap-2 rounded-full bg-blue-600 px-4 text-xs font-extrabold text-white shadow-[0_6px_14px_rgba(0,84,230,0.22)] transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Memeriksa</> : <>Masuk <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 pt-1 sm:gap-5">
                <button type="button" onClick={() => setShowSupportChat(true)} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:gap-2.5 sm:text-base">
                  <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7" /> Bantuan
                </button>
                <button type="submit" disabled={loading} className="inline-flex min-h-12 min-w-32 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(0,84,230,0.24)] transition hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-48 sm:gap-3 sm:px-7 sm:text-base">
                  {loading ? <><Loader2 className="h-5 w-5 animate-spin" />Memverifikasi...</> : <>Masuk <ArrowRight className="h-6 w-6" /></>}
                </button>
              </div>
              <div className="border-t border-blue-100 pt-4 text-center text-sm text-slate-500 sm:pt-5 sm:text-base">
                Belum memiliki akun?{' '}
                <Link to="/register" className="font-extrabold text-blue-600 transition hover:text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">Daftar</Link>
              </div>
            </>
          )}

          {desktop && <p className="pt-1 text-center text-xs leading-relaxed text-slate-400">Belum memiliki akun? Hubungi kantor kelurahan / kecamatan PATEN.</p>}
        </form>
      </section>
    );
  };

  return (
    <div className="font-sans text-[#102653]">
      <PublicNavbar />
      <div className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-hidden bg-white lg:hidden">
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-5 pb-10 pt-24 sm:px-8 sm:pt-28 lg:pt-12">
        <section className="relative z-10 pb-28 pt-2 sm:pb-32 sm:pt-4 lg:pb-36">
          <div className="mb-5 h-2 w-16 rounded-full bg-blue-600 sm:mb-7 sm:w-20" />
          <h1 className="max-w-3xl text-[1.7rem] font-black leading-[1.12] tracking-tight text-[#102653] sm:text-5xl lg:text-[3.25rem]">
            Selamat Datang <span className="text-blue-600">Kembali</span>
          </h1>
          <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className="pointer-events-none absolute right-1 top-[54px] hidden h-10 w-10 text-blue-100 opacity-90 min-[360px]:block sm:right-8 sm:top-8 sm:h-20 sm:w-20">
            <path d="M30 30C17 30 10 23 10 10C23 10 30 17 30 30Z" fill="currentColor" />
            <path d="M34 30C34 17 41 10 54 10C54 23 47 30 34 30Z" fill="currentColor" />
            <path d="M30 34C17 34 10 41 10 54C23 54 30 47 30 34Z" fill="currentColor" />
            <path d="M34 34C47 34 54 41 54 54C41 54 34 47 34 34Z" fill="currentColor" />
          </svg>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-[3.1rem] top-0 hidden h-5 w-5 text-sky-300 opacity-90 min-[360px]:block sm:right-40 sm:top-1 sm:h-6 sm:w-6">
            <path d="M12 1.5 14.5 9.5 22.5 12 14.5 14.5 12 22.5 9.5 14.5 1.5 12 9.5 9.5 12 1.5Z" fill="currentColor" />
          </svg>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-1 top-6 hidden h-4 w-4 text-blue-200 opacity-90 min-[360px]:block sm:right-8 sm:top-28 sm:h-5 sm:w-5">
            <circle cx="5" cy="6" r="2" fill="currentColor" />
            <circle cx="17" cy="4" r="1.5" fill="currentColor" />
            <circle cx="15" cy="17" r="2.5" fill="currentColor" />
          </svg>
          <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" className="pointer-events-none absolute right-[4.5rem] top-[78px] hidden h-10 w-10 text-sky-200 opacity-90 min-[360px]:block sm:right-40 sm:top-20 sm:h-16 sm:w-16">
            <path d="M8 57C19 44 31 31 54 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M17 47C8 45 5 37 8 29C17 29 23 35 22 43C21 45 19 47 17 47Z" fill="currentColor" />
            <path d="M28 36C21 29 23 20 30 14C38 20 38 29 32 36C31 37 29 37 28 36Z" fill="currentColor" />
            <path d="M42 22C37 14 41 7 49 4C55 11 53 19 46 23C45 24 43 23 42 22Z" fill="currentColor" />
          </svg>
        </section>

        <div aria-hidden="true" className="absolute left-1/2 top-[115px] bottom-[-160px] -z-10 w-screen -translate-x-1/2 overflow-hidden bg-gradient-to-b from-[#0873e8] via-[#168cf2] to-[#0755c7] sm:top-[180px] lg:top-[175px]">
          <svg className="absolute -top-px h-24 w-full sm:h-32" viewBox="0 0 1440 180" preserveAspectRatio="none" fill="none">
            <path d="M0 0H1440V30C1200 45 1090 145 810 150C500 155 330 123 0 38V0Z" fill="#dcecff" />
            <path d="M0 0H1440V15C1200 28 1080 126 810 133C500 139 320 108 0 23V0Z" fill="white" />
          </svg>
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0849b7]/60 to-transparent sm:h-72" />
          <svg aria-hidden="true" viewBox="0 0 1440 330" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-[130px] h-48 w-full opacity-45 sm:bottom-[140px] sm:h-64 lg:bottom-[150px] lg:h-72">
            <path d="M0 250 100 190l75 34 92-90 119 115 140-62 100 61 180-133 146 101 78-63 100 74 100-88 110 94v97H0Z" fill="#c9e5ff" />
            <path d="M0 273 89 231l91 26 74-72 91 90 100-47 126 65 111-76 102 51 80-48 111 61 111-80 104 63 89-33 61 47v52H0Z" fill="#73b9ff" />
            <path d="M0 294c95-41 174-29 267-10 90 19 173 13 266-14 132-38 230-30 326-1 116 36 213 14 302-20 98-37 178-24 279 3v78H0Z" fill="#0753c5" />
            <g fill="#0758c9"><path d="M130 262h12v-35h-12zm-10-33h32l-5-15h-22zm3-18h26l-7-13h-12zm4-16h18l-9-15zM198 280h9v-27h-9zm-7-25h23l-4-12h-15zm4-15h15l-7-12zM1040 270h10v-31h-10zm-8-29h26l-5-12h-16zm4-15h18l-9-13zM1260 280h11v-32h-11zm-8-30h27l-5-13h-17zm4-16h18l-9-13z" /></g>
            <path d="M0 296c100-30 185-25 271-7 100 20 180 15 277-11 116-31 227-34 330 0 109 36 212 20 305-13 98-34 179-18 257 6v59H0Z" fill="#0646ae" />
          </svg>
        </div>

        {renderLoginCard('mobile')}
      </main>

      <footer className="relative z-10 mt-auto px-5 pb-6 pt-12 text-center text-[11px] font-medium leading-5 text-white sm:pb-8 sm:pt-16 sm:text-base">
        <p className="drop-shadow-sm">&copy; {new Date().getFullYear()} Pemerintah Desa Doko, Kec. Ngasem, Kab. Kediri.</p>
        <nav aria-label="Tautan informasi" className="mt-3 hidden justify-center gap-5 text-xs text-white/85 sm:flex">
          <Link to="/" className="hover:text-white hover:underline">Privasi</Link>
          <Link to="/" className="hover:text-white hover:underline">Syarat & Ketentuan</Link>
          <Link to="/lacak" className="hover:text-white hover:underline">Lacak berkas</Link>
        </nav>
      </footer>
      </div>

      <div className="relative hidden min-h-screen flex-col overflow-hidden bg-[#f7fbf9] lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_62%_68%,rgba(59,130,246,0.13),transparent_39%),radial-gradient(ellipse_at_52%_39%,rgba(191,219,254,0.23),transparent_32%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[18%] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full border border-blue-200/60" />

        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-8 pb-10 pt-28">
          <div className="grid min-h-[38rem] w-full max-w-[60rem] grid-cols-[0.96fr_1.04fr] items-center gap-8 overflow-hidden rounded-[2.25rem] border border-blue-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.97)_28%,rgba(242,247,255,0.95)_100%)] px-10 py-10 shadow-[0_30px_90px_rgba(34,76,139,0.10)] xl:px-11">
            <div className="relative z-10">{renderLoginCard('desktop')}</div>

            <div className="relative flex min-h-[32rem] flex-col items-center justify-center">
              <div aria-hidden="true" className="absolute h-[25rem] w-[25rem] rounded-full bg-blue-100/70 blur-3xl" />
              <img src="/images/landing/ilustrasi-login.svg" alt="Ilustrasi layanan surat digital dengan balai desa, dokumen QR, dan ponsel" className="relative z-10 w-full max-w-[27rem] drop-shadow-[0_20px_22px_rgba(37,99,235,0.13)]" />
              <div className="absolute left-0 top-6 z-20 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white/95 px-3 py-2 shadow-[0_10px_24px_rgba(30,64,175,0.12)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600"><CheckCircle2 className="h-3.5 w-3.5" /></span>
                <span className="leading-tight"><span className="block text-[10px] font-extrabold text-slate-800">TTE BSrE & QR Sah</span><span className="block text-[9px] font-semibold text-blue-600">Cermat & Lurah Terintegrasi</span></span>
              </div>
              <div className="absolute bottom-[5.5rem] right-1 z-20 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white/95 px-3 py-2 shadow-[0_10px_24px_rgba(30,64,175,0.12)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600"><Clock3 className="h-3.5 w-3.5" /></span>
                <span className="leading-tight"><span className="block text-[10px] font-extrabold text-slate-800">&lt; 15 Menit Layanan</span><span className="block text-[9px] text-slate-500">100% Bebas Pungli</span></span>
              </div>
              <div className="absolute bottom-0 flex flex-col items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700"><ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Legalitas Dispendukcapil & BSrE</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700"><Building2 className="h-3.5 w-3.5 text-blue-600" /> Pemerintah Kabupaten Kediri</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-5 border-t border-slate-200/70 px-8 py-3 text-[11px] text-slate-400">
          <span>© {new Date().getFullYear()} Pemerintah Kabupaten Kediri • Nexora</span>
          <nav aria-label="Tautan informasi" className="flex items-center gap-5 font-semibold text-slate-500">
            <Link to="/" className="hover:text-blue-700">Privasi</Link>
            <Link to="/" className="hover:text-blue-700">Syarat & Ketentuan</Link>
            <Link to="/layanan-surat" className="hover:text-blue-700">Layanan Publik</Link>
          </nav>
        </footer>
      </div>

      <GuestSupportChatModal isOpen={showSupportChat} onClose={() => setShowSupportChat(false)} />
    </div>
  );
};
