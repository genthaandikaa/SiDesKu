import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';

export const ProtectedDashboardRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

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
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  return <DashboardLayout />;
};

export const requireRole = (allowedRoles: string[], userRole?: string): boolean => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};
