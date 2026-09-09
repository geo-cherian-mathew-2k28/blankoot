import React, { useState } from 'react';
import {
  AvatarConfig,
  AVATAR_PALETTES,
  AVATAR_SHAPES,
  AVATAR_EYES,
  AVATAR_MOUTHS,
  AVATAR_ACCESSORIES,
} from '../data/avatarSystem';
import { CustomAvatar } from './CustomAvatar';
import { Shuffle, Check, Sparkles } from 'lucide-react';
import { sfx } from '../utils/sfx';

interface AvatarStudioProps {
  config: AvatarConfig;
  onChange: (cfg: AvatarConfig) => void;
}

export function AvatarStudio({ config, onChange }: AvatarStudioProps) {
  const [activeTab, setActiveTab] = useState<'color' | 'shape' | 'eyes' | 'mouth' | 'accessory'>('color');

  const randomize = () => {
    sfx.click();
    onChange({
      baseColor: AVATAR_PALETTES[Math.floor(Math.random() * AVATAR_PALETTES.length)],
      shape: AVATAR_SHAPES[Math.floor(Math.random() * AVATAR_SHAPES.length)],
      eyes: AVATAR_EYES[Math.floor(Math.random() * AVATAR_EYES.length)],
      mouth: AVATAR_MOUTHS[Math.floor(Math.random() * AVATAR_MOUTHS.length)],
      accessory: AVATAR_ACCESSORIES[Math.floor(Math.random() * AVATAR_ACCESSORIES.length)],
      pattern: 'none',
    });
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Live Preview & Randomize */}
      <div
        className="solid-card"
        style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: '16px',
              background: 'var(--bg-input)',
              border: '2px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CustomAvatar config={config} size={88} />
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }}>
              Live Avatar Preview
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Millions of unique combinations for 100+ player sessions
            </div>
          </div>
        </div>

        <button
          onClick={randomize}
          className="solid-btn btn-surface"
          style={{ padding: '10px 18px', fontSize: '14px' }}
        >
          <Shuffle size={16} /> Randomize
        </button>
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px',
        }}
      >
        {(['color', 'shape', 'eyes', 'mouth', 'accessory'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              sfx.click();
              setActiveTab(tab);
            }}
            className="solid-btn"
            style={{
              background: activeTab === tab ? '#ffffff' : 'var(--bg-surface-elevated)',
              color: activeTab === tab ? '#0d0e12' : 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              fontSize: '13px',
              padding: '8px 16px',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Options Panel */}
      <div className="solid-card" style={{ padding: '20px', minHeight: '160px' }}>
        {activeTab === 'color' && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Base Palette ({AVATAR_PALETTES.length} Solid Colors)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px' }}>
              {AVATAR_PALETTES.map((hex) => (
                <button
                  key={hex}
                  onClick={() => {
                    sfx.click();
                    onChange({ ...config, baseColor: hex });
                  }}
                  style={{
                    height: '42px',
                    borderRadius: '8px',
                    background: hex,
                    border: config.baseColor === hex ? '3px solid #ffffff' : '1px solid rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                  }}
                >
                  {config.baseColor === hex && <Check size={18} color="#fff" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shape' && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Body Geometry
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {AVATAR_SHAPES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    sfx.click();
                    onChange({ ...config, shape: s });
                  }}
                  className="solid-btn btn-surface"
                  style={{
                    padding: '16px 10px',
                    flexDirection: 'column',
                    gap: '10px',
                    border: config.shape === s ? '2px solid #ffffff' : '1px solid var(--border-medium)',
                  }}
                >
                  <CustomAvatar config={{ ...config, shape: s, accessory: 'none' }} size={44} />
                  <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'eyes' && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Eye Expressions ({AVATAR_EYES.length} Options)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {AVATAR_EYES.map((eye) => (
                <button
                  key={eye}
                  onClick={() => {
                    sfx.click();
                    onChange({ ...config, eyes: eye });
                  }}
                  className="solid-btn btn-surface"
                  style={{
                    padding: '14px 10px',
                    flexDirection: 'column',
                    gap: '8px',
                    border: config.eyes === eye ? '2px solid #ffffff' : '1px solid var(--border-medium)',
                  }}
                >
                  <CustomAvatar config={{ ...config, eyes: eye, accessory: 'none' }} size={40} />
                  <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{eye}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mouth' && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Mouth Expressions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {AVATAR_MOUTHS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    sfx.click();
                    onChange({ ...config, mouth: m });
                  }}
                  className="solid-btn btn-surface"
                  style={{
                    padding: '14px 10px',
                    flexDirection: 'column',
                    gap: '8px',
                    border: config.mouth === m ? '2px solid #ffffff' : '1px solid var(--border-medium)',
                  }}
                >
                  <CustomAvatar config={{ ...config, mouth: m, accessory: 'none' }} size={40} />
                  <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{m}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'accessory' && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Headwear & Accessories
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {AVATAR_ACCESSORIES.map((acc) => (
                <button
                  key={acc}
                  onClick={() => {
                    sfx.click();
                    onChange({ ...config, accessory: acc });
                  }}
                  className="solid-btn btn-surface"
                  style={{
                    padding: '14px 10px',
                    flexDirection: 'column',
                    gap: '8px',
                    border: config.accessory === acc ? '2px solid #ffffff' : '1px solid var(--border-medium)',
                  }}
                >
                  <CustomAvatar config={{ ...config, accessory: acc }} size={40} />
                  <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{acc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
