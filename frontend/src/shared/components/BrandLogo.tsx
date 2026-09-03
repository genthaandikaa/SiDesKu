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
    sm: 'h-10 w-auto max-w-[36px]',
    md: 'h-13 sm:h-15 w-auto max-w-[52px]',
    lg: 'h-16 sm:h-20 w-auto max-w-[70px]',
    xl: 'h-22 sm:h-26 w-auto max-w-[90px]',
  };

  const textSizes = {
    sm: 'text-sm sm:text-base font-extrabold',
    md: 'text-base sm:text-lg lg:text-xl font-black',
    lg: 'text-lg sm:text-xl lg:text-2xl font-black',
    xl: 'text-2xl sm:text-3xl font-black',
  };

  // Auto-detect Village (Desa) Location from User Profile when Logged In
  let villageName = overrideVillage;
  let detectedSubtitle = subtitleText || 'Pemerintah Kabupaten Kediri';

  if (user) {
    const dusun = (user as any).warga_profile?.rt?.rw?.dusun?.nama_dusun;
    const rt = (user as any).warga_profile?.rt?.nomor_rt;
    const rw = (user as any).warga_profile?.rt?.rw?.nomor_rw;

    villageName = villageName || 'Doko';

    if (rt && rw) {
      detectedSubtitle = subtitleText || `RT ${rt} / RW ${rw} • ${dusun || 'Desa ' + villageName}`;
    } else {
      detectedSubtitle = subtitleText || `Kec. Ngasem, Kab. Kediri`;
    }
  }

  return (
    <div className={`flex items-center gap-3.5 select-none group ${className}`}>
      
      {/* Official Lambang Candra Birawa Kabupaten Kediri (Tall, Prominent & Majestic) */}
      <div className={`relative flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 ${iconSizes[size]}`}>
        <img 
          src="/images/logo-kediri.png" 
          alt="Lambang Kabupaten Kediri" 
          className="h-full w-auto object-contain filter drop-shadow-md"
        />
      </div>

      {/* Dynamic Typography */}
      <div className="flex flex-col justify-center">
        <div className={`tracking-tight leading-tight flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'} ${textSizes[size]}`}>
          {user ? (
            <>
              <span>SIDes</span>
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 bg-clip-text text-transparent font-black">
                {villageName}
              </span>
            </>
          ) : (
            <>
              <span>Kabupaten</span>
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 bg-clip-text text-transparent font-black">
                Kediri
              </span>
            </>
          )}
        </div>
        
        {showSubtitle && (
          <div className={`text-[11px] sm:text-xs font-semibold leading-tight mt-1 flex items-center gap-1.5 ${isDark ? 'text-emerald-200/80' : 'text-slate-500'}`}>
            <span>{detectedSubtitle}</span>
          </div>
        )}
      </div>

    </div>
  );
};
