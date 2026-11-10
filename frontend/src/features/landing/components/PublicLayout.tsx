import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/25 to-blue-50/20 text-slate-900 flex flex-col justify-between relative overflow-x-hidden selection:bg-sky-200 selection:text-sky-900 font-sans">
      {/* Background Dot Grid Matrix Texture (Light Sky Blue) */}
      <div className="fixed inset-0 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08] pointer-events-none z-0" />
      
      {/* Soft Ambient Glowing Orbs with Pure Light Blue Gradients (No Indigo / Purple Tint) */}
      <div className="fixed -top-24 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-sky-400/15 via-blue-400/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-20 w-[550px] h-[550px] bg-gradient-to-br from-blue-400/15 via-sky-300/15 to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-10 left-5 w-[500px] h-[500px] bg-gradient-to-tr from-sky-300/15 via-blue-300/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      <PublicNavbar />
      <main className="flex-1 relative z-10 pt-20 sm:pt-24">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
