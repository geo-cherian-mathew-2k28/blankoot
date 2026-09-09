import React from 'react';
import { AvatarConfig } from '../data/avatarSystem';

interface CustomAvatarProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
}

export function CustomAvatar({ config, size = 64, className = '' }: CustomAvatarProps) {
  const { baseColor, shape, eyes, mouth, accessory } = config;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <defs>
        <clipPath id={`clip-${shape}`}>
          {shape === 'circle' && <circle cx="50" cy="50" r="46" />}
          {shape === 'squircle' && <rect x="6" y="6" width="88" height="88" rx="26" />}
          {shape === 'hexagon' && (
            <polygon points="50,6 88,27 88,73 50,94 12,73 12,27" />
          )}
          {shape === 'shield' && (
            <path d="M50 8 L88 22 C88 64 50 94 50 94 C50 94 12 64 12 22 Z" />
          )}
        </clipPath>
      </defs>

      {/* Outer Shape & Background */}
      <g clipPath={`url(#clip-${shape})`}>
        <rect x="0" y="0" width="100" height="100" fill={baseColor} />

        {/* Inner subtle darker shade */}
        <path
          d="M0 60 Q 50 45 100 60 L100 100 L0 100 Z"
          fill="rgba(0,0,0,0.18)"
        />

        {/* Eyes rendering */}
        {eyes === 'dot' && (
          <g fill="#ffffff">
            <circle cx="36" cy="44" r="5" />
            <circle cx="64" cy="44" r="5" />
          </g>
        )}

        {eyes === 'happy' && (
          <g stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none">
            <path d="M30 46 Q 36 38 42 46" />
            <path d="M58 46 Q 64 38 70 46" />
          </g>
        )}

        {eyes === 'glasses' && (
          <g>
            <rect x="25" y="38" width="22" height="14" rx="4" fill="#0f172a" stroke="#ffffff" strokeWidth="3" />
            <rect x="53" y="38" width="22" height="14" rx="4" fill="#0f172a" stroke="#ffffff" strokeWidth="3" />
            <line x1="47" y1="45" x2="53" y2="45" stroke="#ffffff" strokeWidth="3" />
            <circle cx="36" cy="45" r="3" fill="#ffffff" />
            <circle cx="64" cy="45" r="3" fill="#ffffff" />
          </g>
        )}

        {eyes === 'wink' && (
          <g>
            <circle cx="36" cy="44" r="5" fill="#ffffff" />
            <path d="M58 45 L70 45" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {eyes === 'star' && (
          <g fill="#fef08a">
            <path d="M36 37 L38 43 L44 43 L39 46 L41 52 L36 48 L31 52 L33 46 L28 43 L34 43 Z" />
            <path d="M64 37 L66 43 L72 43 L67 46 L69 52 L64 48 L59 52 L61 46 L56 43 L62 43 Z" />
          </g>
        )}

        {eyes === 'cool' && (
          <g>
            {/* Sunglasses */}
            <path d="M24 40 L76 40 L70 54 L54 54 L50 48 L46 54 L30 54 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
            <line x1="28" y1="44" x2="44" y2="44" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          </g>
        )}

        {eyes === 'robot' && (
          <g>
            <rect x="26" y="40" width="48" height="10" rx="3" fill="#0f172a" />
            <rect x="30" y="43" width="16" height="4" rx="1" fill="#38bdf8" />
            <rect x="54" y="43" width="16" height="4" rx="1" fill="#38bdf8" />
          </g>
        )}

        {eyes === 'wide' && (
          <g>
            <circle cx="36" cy="44" r="9" fill="#ffffff" />
            <circle cx="64" cy="44" r="9" fill="#ffffff" />
            <circle cx="36" cy="44" r="4" fill="#0f172a" />
            <circle cx="64" cy="44" r="4" fill="#0f172a" />
          </g>
        )}

        {/* Mouth rendering */}
        {mouth === 'smile' && (
          <path d="M38 62 Q 50 72 62 62" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" />
        )}

        {mouth === 'open' && (
          <path d="M38 60 Q 50 78 62 60 Z" fill="#ffffff" />
        )}

        {mouth === 'smirk' && (
          <path d="M42 64 Q 56 68 62 58" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" />
        )}

        {mouth === 'teeth' && (
          <rect x="36" y="60" width="28" height="9" rx="3" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
        )}

        {mouth === 'cool' && (
          <line x1="40" y1="64" x2="60" y2="64" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        )}

        {mouth === 'neutral' && (
          <circle cx="50" cy="64" r="3" fill="#ffffff" />
        )}
      </g>

      {/* Accessories */}
      {accessory === 'headphones' && (
        <g stroke="#ffffff" strokeWidth="4" fill="none">
          <path d="M12 50 C 12 24 88 24 88 50" strokeLinecap="round" />
          <rect x="8" y="44" width="10" height="20" rx="4" fill="#0f172a" stroke="#ffffff" strokeWidth="3" />
          <rect x="82" y="44" width="10" height="20" rx="4" fill="#0f172a" stroke="#ffffff" strokeWidth="3" />
        </g>
      )}

      {accessory === 'crown' && (
        <path
          d="M32 18 L40 10 L50 18 L60 10 L68 18 L66 25 L34 25 Z"
          fill="#facc15"
          stroke="#ca8a04"
          strokeWidth="2"
        />
      )}

      {accessory === 'cap' && (
        <g>
          <path d="M28 22 C 28 10 72 10 72 22 Z" fill="#0f172a" />
          <path d="M22 22 L78 22 L86 28 L24 28 Z" fill="#1e293b" />
        </g>
      )}

      {accessory === 'horns' && (
        <g fill="#e11d48">
          <path d="M24 24 C 20 8 14 14 16 26 Z" />
          <path d="M76 24 C 80 8 86 14 84 26 Z" />
        </g>
      )}

      {accessory === 'halo' && (
        <ellipse cx="50" cy="14" rx="26" ry="6" fill="none" stroke="#facc15" strokeWidth="4" />
      )}

      {accessory === 'bandana' && (
        <path d="M16 32 Q 50 38 84 32 L84 24 Q 50 28 16 24 Z" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
      )}

      {accessory === 'antenna' && (
        <g stroke="#ffffff" strokeWidth="3">
          <line x1="50" y1="18" x2="50" y2="6" />
          <circle cx="50" cy="5" r="4" fill="#38bdf8" stroke="none" />
        </g>
      )}
    </svg>
  );
}
