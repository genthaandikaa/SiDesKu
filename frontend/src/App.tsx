import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/shared/context/AuthContext';
import { PublicLayout } from '@/features/landing/components/PublicLayout';
import { HomePage } from '@/features/landing/components/HomePage';
import { ProfilDesaPage } from '@/features/landing/components/ProfilDesaPage';
import { LayananSuratPage } from '@/features/landing/components/LayananSuratPage';
import { LacakSuratPage } from '@/features/landing/components/LacakSuratPage';
import { TransparansiApbdesPage } from '@/features/landing/components/TransparansiApbdesPage';
import { BansosPage } from '@/features/landing/components/BansosPage';
import { BeritaPage } from '@/features/landing/components/BeritaPage';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { RegisterPage } from '@/features/auth/components/RegisterPage';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';

const ProtectedDashboardRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f9f8] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md animate-pulse">
            S
          </div>
          <div className="text-xs font-bold text-gray-500 font-mono">
            Memuat Sistem Informasi Desa Doko...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with Dedicated URLs */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/profil" element={<ProfilDesaPage />} />
        <Route path="/layanan-surat" element={<LayananSuratPage />} />
        <Route path="/lacak" element={<LacakSuratPage />} />
        <Route path="/transparansi" element={<TransparansiApbdesPage />} />
        <Route path="/transparansi-apbdes" element={<Navigate to="/transparansi" replace />} />
        <Route path="/bansos" element={<BansosPage />} />
        <Route path="/berita" element={<BeritaPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Dashboard Route */}
      <Route path="/dashboard/*" element={<ProtectedDashboardRoute />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
