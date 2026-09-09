import React, { useMemo } from 'react';
import {
  EMOJI_AVATARS,
  EmojiAvatarItem,
  getEmojiAvatarById,
  getRandomEmojiAvatar,
} from '../data/emojiAvatars';
import { Shuffle, Check } from 'lucide-react';
import { sfx } from '../utils/sfx';
import { AvatarConfig } from '../data/avatarSystem';

interface AvatarStudioProps {
  config: string | AvatarConfig;
  onChange: (avatarValue: string) => void;
}

export function AvatarStudio({ config, onChange }: AvatarStudioProps) {
  // Resolve currently selected emoji item reliably
  const currentAvatarStr = typeof config === 'string' ? config : '/emojis/emoji_1.webp';
  const currentEmoji: EmojiAvatarItem = useMemo(() => {
    return getEmojiAvatarById(currentAvatarStr);
  }, [currentAvatarStr]);

  const handlePickEmoji = (emoji: EmojiAvatarItem) => {
    sfx.click();
    onChange(emoji.image);
  };

  const handleRandomize = () => {
    sfx.click();
    // Pick a random emoji different from the current one if possible
    const candidates = EMOJI_AVATARS.filter((e) => e.id !== currentEmoji.id);
    const random = candidates.length > 0 
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : getRandomEmojiAvatar();
    onChange(random.image);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. HERO LIVE AVATAR PREVIEW CARD */}
      <div
        className="solid-card"
        style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          background: `linear-gradient(135deg, var(--bg-surface) 0%, rgba(26, 29, 42, 0.95) 100%)`,
          border: `1px solid var(--border-subtle)`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-40%',
            left: '15%',
            width: '240px',
            height: '240px',
            background: `radial-gradient(circle, ${currentEmoji.color}33 0%, transparent 70%)`,
            filter: 'blur(32px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '22px', position: 'relative', zIndex: 1 }}>
          {/* Avatar Showcase */}
          <div
            className="emoji-hero-float"
            style={{
              width: '104px',
              height: '104px',
              borderRadius: '26px',
              background: `radial-gradient(circle, ${currentEmoji.color}35 0%, rgba(15, 17, 26, 0.9) 100%)`,
              border: `3px solid ${currentEmoji.color}`,
              boxShadow: `0 0 24px ${currentEmoji.color}55, 0 10px 24px rgba(0,0,0,0.6)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              flexShrink: 0,
            }}
          >
            <img
              key={currentEmoji.id}
              src={currentEmoji.image}
              alt={currentEmoji.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: `${currentEmoji.color}25`,
                  color: currentEmoji.color,
                  border: `1px solid ${currentEmoji.color}44`,
                }}
              >
                LIVE AVATAR PREVIEW
              </span>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {currentEmoji.name}
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {currentEmoji.tagline}
            </div>
          </div>
        </div>

        {/* Shuffle / Randomize Button */}
        <button
          type="button"
          onClick={handleRandomize}
          className="solid-btn btn-surface"
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '12px',
            position: 'relative',
            zIndex: 1,
            cursor: 'pointer',
          }}
        >
          <Shuffle size={16} color="var(--accent-pink)" /> Randomize
        </button>
      </div>

      {/* 2. DIRECT EMOJI AVATAR GRID */}
      <div className="solid-card" style={{ padding: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Choose Your Avatar ({EMOJI_AVATARS.length} Emojis)
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Click an emoji to select
          </div>
        </div>

        <div className="emoji-selection-grid">
          {EMOJI_AVATARS.map((emoji) => {
            const isSelected = currentEmoji.id === emoji.id;

            return (
              <button
                key={emoji.id}
                type="button"
                onClick={() => handlePickEmoji(emoji)}
                className={`emoji-card-btn ${isSelected ? 'is-selected' : ''}`}
                style={{
                  borderColor: isSelected ? emoji.color : undefined,
                  boxShadow: isSelected ? `0 0 0 2px ${emoji.color}, 0 8px 20px ${emoji.color}40` : undefined,
                  background: isSelected ? `${emoji.color}18` : undefined,
                }}
              >
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: emoji.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={emoji.image}
                    alt={emoji.name}
                    className="interactive-emoji-img"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                    }}
                    loading="lazy"
                  />
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {emoji.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
