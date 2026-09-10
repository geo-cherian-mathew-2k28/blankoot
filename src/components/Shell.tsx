import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sfx } from '../utils/sfx';
import { AvatarConfig, deserializeAvatar } from '../data/avatarSystem';
import { CustomAvatar } from './CustomAvatar';
import { FloatingReactions } from './FloatingReactions';

interface ShellProps {
  children: React.ReactNode;
  hideBrandTag?: boolean;
  arenaTheme?: boolean;
  podiumTheme?: boolean;
}

export function Shell({ children, hideBrandTag, arenaTheme = false, podiumTheme = false }: ShellProps) {
  const [muted, setMuted] = useState(!sfx.enabled);

  const toggleSound = () => {
    sfx.enabled = !sfx.enabled;
    setMuted(!sfx.enabled);
    if (sfx.enabled) sfx.click();
  };

  const backdropClass = podiumTheme
    ? 'game-backdrop podium-backdrop'
    : arenaTheme
    ? 'game-backdrop arena-backdrop'
    : 'game-backdrop';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className={backdropClass} />
      <FloatingReactions />

      {/* Authentic Blankspace Floating Capsule Navbar */}
      <header className="blankspace-header">
        <nav className="blankspace-capsule-nav">
          {/* Logo & Brand Identity */}
          <div className="blankspace-brand-group">
            <img
              src="/logo.svg"
              alt="Blankspace"
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            />
            <div style={{ lineHeight: 1.15, textAlign: 'left' }}>
              <p style={{ color: '#ffffff', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.01em' }}>
                Blankspace
              </p>
              <p style={{ color: 'var(--accent-purple)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Community
              </p>
            </div>
            {!hideBrandTag && (
              <span className="blankspace-live-badge">
                QUIZ ARENA
              </span>
            )}
          </div>

          {/* Sound / Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="sound-toggle-btn"
              onClick={toggleSound}
              title={muted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {muted ? <VolumeX size={16} color="#94a3b8" /> : <Volume2 size={16} color="var(--accent-pink)" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Game Stage */}
      <main
        style={{
          maxWidth: podiumTheme ? '100%' : '1100px',
          width: '100%',
          margin: '0 auto',
          padding: podiumTheme ? '0' : '100px 16px 60px',
          flex: 1,
          display: podiumTheme ? 'flex' : 'block',
          flexDirection: 'column',
        }}
      >
        {children}
      </main>

      {/* Official Blankspace Minimalist Footer (Hidden during podium ceremony) */}
      {!podiumTheme && (
        <footer className="blankspace-footer">
          <div className="blankspace-footer-light-leak" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
            <span>&copy; {new Date().getFullYear()}</span>
            <strong style={{ color: '#94a3b8' }}>Blankspace Community</strong>
            <span>&bull;</span>
            <span style={{ fontStyle: 'italic', color: '#64748b' }}>Built with passion & precision.</span>
          </div>
          <div className="blankspace-footer-links">
            <a href="https://github.com/blankspacecommunity" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://instagram.com/blankspacecommunity" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://linkedin.com/company/blankspacecommunity" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </footer>
      )}
    </div>
  );
}

import { getMascotById } from '../data/mascotSystem';
import { getEmojiAvatarById, isEmojiAvatar } from '../data/emojiAvatars';

export function AvatarDisplay({
  avatar,
  size = 56,
}: {
  avatar: string | AvatarConfig;
  size?: number;
}) {
  // 1. If avatar is a 3D Emoji Avatar
  if (typeof avatar === 'string' && (isEmojiAvatar(avatar) || avatar.startsWith('/emojis/'))) {
    const emoji = getEmojiAvatarById(avatar);
    const imgSrc = avatar.startsWith('/') ? avatar : emoji.image;

    return (
      <div
        className="emoji-avatar-container"
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(10, Math.round(size * 0.28)) + 'px',
          background: `radial-gradient(circle, ${emoji.color}25 0%, rgba(20, 24, 35, 0.75) 100%)`,
          border: `2px solid ${emoji.color}66`,
          boxShadow: `0 4px 16px ${emoji.color}20`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          overflow: 'visible',
          padding: Math.max(2, Math.round(size * 0.05)) + 'px',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <img
          src={imgSrc}
          alt={emoji.name}
          className="interactive-emoji-img"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.45))',
          }}
        />
      </div>
    );
  }

  // 2. If avatar is a 3D Mascot ID or image path
  if (typeof avatar === 'string') {
    const mascot = getMascotById(avatar);
    const isMascotId = avatar.startsWith('/ai_avatars/') || avatar.startsWith('/avatars/') || mascot.id === avatar;
    const imgSrc = avatar.startsWith('/') ? avatar : mascot.image;

    if (isMascotId) {
      return (
        <div
          className="mascot-avatar-container"
          style={{
            width: size,
            height: size,
            borderRadius: '16px',
            background: `radial-gradient(circle, ${mascot.color}25 0%, rgba(26,29,40,0.6) 100%)`,
            border: `2px solid ${mascot.color}55`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            overflow: 'visible',
            padding: '2px',
          }}
        >
          <img
            src={imgSrc}
            alt={mascot.name}
            className="interactive-mascot-img"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
            }}
          />
        </div>
      );
    }
  }

  // 3. Fallback to procedural SVG avatar
  const config = typeof avatar === 'string' ? deserializeAvatar(avatar) : avatar;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '12px',
        border: '2px solid var(--border-medium)',
        background: 'var(--bg-input)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <CustomAvatar config={config} size={size * 0.9} />
    </div>
  );
}
