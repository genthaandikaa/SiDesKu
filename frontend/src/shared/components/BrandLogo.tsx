import React from 'react';
import { useAuth } from '@/shared/context/AuthContext';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  overrideVillage?: string;
  isDark?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText,
  overrideVillage,
  isDark = false,
  className = '',
}) => {
  const { user } = useAuth();

  // Significant, bold height for official governmental shield emblem
  const iconSizes = {
    sm: 'h-10 w-10',
    md: 'h-11 w-11 sm:h-12 sm:w-12',
    lg: 'h-16 w-16 sm:h-20 sm:w-20',
    xl: 'h-22 w-22 sm:h-26 sm:w-26',
  };

  const textSizes = {
    sm: 'text-sm sm:text-base font-extrabold',
    md: 'text-[clamp(0.9rem,1.1vw,1.125rem)] font-black',
    lg: 'text-lg sm:text-xl lg:text-2xl font-black',
    xl: 'text-2xl sm:text-3xl font-black',
  };

  // Auto-detect Village/City Location from User Profile when Logged In
  let villageName = overrideVillage;
  let detectedSubtitle = subtitleText || 'Wilayah Kota Kediri';

  if (user) {
    const dusun = (user as any).warga_profile?.rt?.rw?.dusun?.nama_dusun;
    const rt = (user as any).warga_profile?.rt?.nomor_rt;
    const rw = (user as any).warga_profile?.rt?.rw?.nomor_rw;

    villageName = villageName || 'Doko';

    if (rt && rw) {
      detectedSubtitle = subtitleText || `RT ${rt} / RW ${rw} • Kel./Desa ${villageName} • Kota Kediri`;
    } else {
      detectedSubtitle = subtitleText || `Wilayah Kota Kediri`;
    }
  }

  return (
    <div className={`flex min-w-0 items-center gap-2.5 select-none group ${className}`}>
      
      {/* Official Lambang Candra Birawa Kediri (Tall, Prominent & Majestic) */}
      <div className={`relative flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 ${iconSizes[size]}`}>
        <img 
          src="/images/logo-kediri.png" 
          alt="Lambang Kota Kediri" 
          className="h-full w-auto object-contain filter drop-shadow-md"
        />
      </div>

      {/* Dynamic Typography */}
      <div className="flex min-w-0 flex-col justify-center">
        <div className={`flex min-w-0 flex-nowrap items-center gap-x-1 whitespace-nowrap tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'} ${textSizes[size]}`}>
          <span>Kota</span>
          <span className="text-blue-600 font-extrabold">Kediri</span>
        </div>
        
        {showSubtitle && (
          <div className={`mt-1 min-w-0 text-[11px] font-semibold leading-tight sm:text-xs ${isDark ? 'text-blue-200/80' : 'text-slate-500'}`}>
            <span className="block truncate" title={detectedSubtitle}>{detectedSubtitle}</span>
          </div>
        )}
      </div>

    </div>
  );
};
