import React, { useState } from 'react';
import { getMascotById, OFFICIAL_MASCOTS } from '../data/mascotSystem';
import { sfx } from '../utils/sfx';

interface InteractiveMascotProps {
  id?: string;
  size?: number;
  floating?: boolean;
  peeking?: 'left' | 'right' | 'top' | 'bottom';
  message?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function MascotCompanion({
  id = 'sparky_purple',
  size = 110,
  floating = true,
  peeking,
  message,
  className = '',
  style = {},
}: InteractiveMascotProps) {
  const [bounced, setBounced] = useState(false);
  const [showSpeech, setShowSpeech] = useState(Boolean(message));
  const mascot = getMascotById(id);

  const handlePoke = () => {
    sfx.pop();
    setBounced(true);
    setTimeout(() => setBounced(false), 450);
  };

  let peekStyles: React.CSSProperties = {};
  if (peeking === 'left') {
    peekStyles = {
      position: 'absolute',
      left: '-45px',
      bottom: '10px',
      zIndex: 10,
    };
  } else if (peeking === 'right') {
    peekStyles = {
      position: 'absolute',
      right: '-45px',
      bottom: '10px',
      zIndex: 10,
    };
  }

  return (
    <div
      className={`mascot-companion-root ${peeking ? `peeking-${peeking}` : ''} ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        userSelect: 'none',
        ...peekStyles,
        ...style,
      }}
    >
      {/* Speech Bubble on click or hover */}
      {message && (
        <div
          className="mascot-speech-bubble"
          style={{
            background: 'var(--bg-surface-elevated)',
            border: `1.5px solid ${mascot.color}`,
            borderRadius: '12px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 800,
            color: '#ffffff',
            boxShadow: `0 8px 20px ${mascot.color}33`,
            marginBottom: '8px',
            whiteSpace: 'nowrap',
            animation: 'speechPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: 'none',
          }}
        >
          {message}
        </div>
      )}

      {/* 3D Mascot Image with Spring Physics & Bounce */}
      <div
        onClick={handlePoke}
        title={`Poke ${mascot.name}!`}
        style={{
          width: size,
          height: size,
          cursor: 'pointer',
          transform: bounced ? 'scale(1.28) rotate(-6deg)' : undefined,
          transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <img
          src={mascot.image}
          alt={mascot.name}
          className={floating ? 'mascot-hero-bounce' : ''}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.45))',
          }}
        />
      </div>
    </div>
  );
}
