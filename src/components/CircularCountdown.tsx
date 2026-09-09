import React from 'react';

interface CircularCountdownProps {
  remaining: number;
  total: number;
  size?: number;
}

export function CircularCountdown({ remaining, total, size = 76 }: CircularCountdownProps) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? remaining / total : 0;
  const strokeDashoffset = circumference - progress * circumference;
  const isUrgent = remaining <= 5;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx="38"
          cy="38"
          r={radius}
          stroke="#1e212d"
          strokeWidth="6"
          fill="none"
        />
        {/* Animated Progress Ring */}
        <circle
          cx="38"
          cy="38"
          r={radius}
          stroke={isUrgent ? '#e21b3c' : 'var(--accent-purple)'}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
          }}
        />
      </svg>

      {/* Center Digital Clock */}
      <span
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-mono)',
          fontWeight: 900,
          fontSize: size * 0.34,
          color: isUrgent ? '#ff6b81' : '#ffffff',
          animation: isUrgent ? 'pulseText 0.6s infinite alternate' : 'none',
        }}
      >
        {remaining}
      </span>
    </div>
  );
}
