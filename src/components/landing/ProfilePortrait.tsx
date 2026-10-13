import React, { useState } from 'react';

interface Props {
  name: string;
  src?: string | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/** Browser-only portrait with an initials fallback for unavailable demo URLs. */
export const ProfilePortrait: React.FC<Props> = ({ name, src, size = 'small', className = '' }) => {
  const [broken, setBroken] = useState(false);
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join('') || '•';
  return (
    <span className={['ripple-profile-portrait', 'ripple-profile-portrait--' + size, className].filter(Boolean).join(' ')}
      role="img" aria-label={'Portrait de ' + name} data-testid="person-portrait">
      <span aria-hidden="true" className="ripple-profile-portrait-initials">{initials}</span>
      {src && !broken && (
        <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="ripple-profile-portrait-image" />
      )}
    </span>
  );
};
