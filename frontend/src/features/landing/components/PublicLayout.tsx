import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eaf6f1] via-[#f0f9f5] to-[#f8fcf9] text-[#0f241d] flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Dot Grid Matrix Texture (Gambar no 3) */}
      <div className="fixed inset-0 bg-[radial-gradient(#059669_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-[0.08] pointer-events-none z-0" />
      
      {/* Soft Ambient Glowing Orbs */}
      <div className="fixed top-12 left-1/4 w-[500px] h-[500px] bg-emerald-200/25 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/2 right-10 w-[600px] h-[600px] bg-teal-200/25 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-10 left-10 w-[450px] h-[450px] bg-sky-200/20 rounded-full blur-3xl pointer-events-none z-0" />

      <PublicNavbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
