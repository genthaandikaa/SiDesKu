import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PublicLayout } from '@/features/landing/components/PublicLayout';
import { ProtectedDashboardRoute } from '@/middleware';

const HomePage = React.lazy(() => import('@/features/landing/components/HomePage').then(m => ({ default: m.HomePage })));
const ProfilDesaPage = React.lazy(() => import('@/features/landing/components/ProfilDesaPage').then(m => ({ default: m.ProfilDesaPage })));
const LayananSuratPage = React.lazy(() => import('@/features/landing/components/LayananSuratPage').then(m => ({ default: m.LayananSuratPage })));
const LacakSuratPage = React.lazy(() => import('@/features/landing/components/LacakSuratPage').then(m => ({ default: m.LacakSuratPage })));
const TransparansiApbdesPage = React.lazy(() => import('@/features/landing/components/TransparansiApbdesPage').then(m => ({ default: m.TransparansiApbdesPage })));
const BansosPage = React.lazy(() => import('@/features/landing/components/BansosPage').then(m => ({ default: m.BansosPage })));
const BeritaPage = React.lazy(() => import('@/features/landing/components/BeritaPage').then(m => ({ default: m.BeritaPage })));
const SmartCityHubPage = React.lazy(() => import('@/features/smart-city').then(m => ({ default: m.SmartCityHubPage })));
const UmkmPage = React.lazy(() => import('@/features/smart-city').then(m => ({ default: m.UmkmPage })));
const UmkmDetailPage = React.lazy(() => import('@/features/smart-city').then(m => ({ default: m.UmkmDetailPage })));
const KosPage = React.lazy(() => import('@/features/smart-city').then(m => ({ default: m.KosPage })));
const LokerPage = React.lazy(() => import('@/features/smart-city').then(m => ({ default: m.LokerPage })));
const LoginPage = React.lazy(() => import('@/features/auth/components/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('@/features/auth/components/RegisterPage').then(m => ({ default: m.RegisterPage })));

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4 text-2xl font-black">
            !
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-1">Terjadi Kendala Memuat Konten</h2>
          <p className="text-xs text-slate-500 max-w-md mb-4">
            Halaman mengalami sedikit gangguan jaringan atau data. Silakan muat ulang halaman untuk melanjutkan.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8 font-sans">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Memuat Halaman...</span>
    </div>
  </div>
);

const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, search]);

  return null;
};

export const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* Public Pages with Dedicated URLs */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profil" element={<ProfilDesaPage />} />
          <Route path="/layanan-surat" element={<LayananSuratPage />} />
          <Route path="/lacak" element={<LayananSuratPage initialTab="lacak" />} />
          <Route path="/transparansi" element={<TransparansiApbdesPage />} />
          <Route path="/transparansi-apbdes" element={<Navigate to="/transparansi" replace />} />
          <Route path="/bansos" element={<TransparansiApbdesPage initialTab="bansos" />} />
          <Route path="/berita" element={<BeritaPage />} />

          {/* Smart City Pages (Dedicated URLs & Pages) */}
          <Route path="/smart-city" element={<SmartCityHubPage />} />
          <Route path="/smart-city/umkm" element={<UmkmPage />} />
          <Route path="/smart-city/umkm/:id" element={<UmkmDetailPage />} />
          <Route path="/smart-city/kos" element={<KosPage />} />
          <Route path="/smart-city/loker" element={<LokerPage />} />

          {/* Convenient Direct Aliases */}
          <Route path="/umkm" element={<UmkmPage />} />
          <Route path="/umkm/:id" element={<UmkmDetailPage />} />
          <Route path="/pasar" element={<UmkmPage />} />
          <Route path="/kos" element={<KosPage />} />
          <Route path="/hunian" element={<KosPage />} />
          <Route path="/loker" element={<LokerPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard Route */}
        <Route path="/dashboard/*" element={<ProtectedDashboardRoute />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
};
