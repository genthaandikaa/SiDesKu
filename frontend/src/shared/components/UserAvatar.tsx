import React, { useState, useEffect } from 'react';
import { getSafeMediaUrl, getAvatarInitials } from '@/shared/utils/mediaUrl';

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  alt = 'Avatar Pengguna',
  className = 'w-8 h-8 rounded-full object-cover border border-emerald-500 shadow-xs',
  fallbackClassName = 'w-8 h-8 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-xs shadow-xs',
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);
  const safeUrl = getSafeMediaUrl(src);

  // Reset error state if image source updates
  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!safeUrl || hasError) {
    return (
      <div 
        className={fallbackClassName}
        onClick={onClick}
        title={name || alt}
      >
        <span>{getAvatarInitials(name)}</span>
      </div>
    );
  }

  return (
    <img
      src={safeUrl}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      onClick={onClick}
      loading="lazy"
    />
  );
};
