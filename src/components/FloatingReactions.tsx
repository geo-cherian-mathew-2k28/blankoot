import React, { useState, useEffect, useCallback, useRef } from 'react';
import { quizClient } from '../utils/socketClient';
import { localSync } from '../utils/localSessionSync';

export interface ReactionParticle {
  id: string;
  emoji: string;
  x: number; // percentage across screen 10% - 90%
  size: number; // in px
  duration: number; // seconds
  swayDistance: number; // px left/right
  rotation: number; // deg
}

// Global emitter for locally spawned reactions (e.g. instant feedback before socket roundtrip)
type ReactionListener = (emoji: string) => void;
const reactionListeners = new Set<ReactionListener>();

export function triggerLocalReaction(emoji: string) {
  reactionListeners.forEach((fn) => fn(emoji));
}

export function FloatingReactions() {
  const [particles, setParticles] = useState<ReactionParticle[]>([]);
  const recentReactionsRef = useRef<Map<string, number>>(new Map());

  const spawnParticle = useCallback((emoji: string) => {
    // Quick debounce check to prevent echo duplicate if socket & localSync both fire within 35ms
    const now = Date.now();
    const lastTime = recentReactionsRef.current.get(emoji) || 0;
    if (now - lastTime < 35) {
      return;
    }
    recentReactionsRef.current.set(emoji, now);

    const newParticle: ReactionParticle = {
      id: Math.random().toString(36).substring(2, 9) + Date.now(),
      emoji,
      x: 15 + Math.random() * 70, // 15% to 85% width
      size: Math.floor(34 + Math.random() * 24), // 34px - 58px
      duration: 2.2 + Math.random() * 1.0, // 2.2s - 3.2s
      swayDistance: (Math.random() - 0.5) * 80, // -40px to +40px
      rotation: (Math.random() - 0.5) * 45, // -22.5deg to +22.5deg
    };

    setParticles((prev) => {
      // Keep max 40 active particles to maintain 120fps performance
      const slice = prev.length > 35 ? prev.slice(prev.length - 30) : prev;
      return [...slice, newParticle];
    });

    // Cleanup particle after its duration
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, newParticle.duration * 1000 + 100);
  }, []);

  useEffect(() => {
    // 1. Listen for real-time reactions from WebSocket room
    const unsubSocket = quizClient.on('ROOM_REACTION', (payload: { emoji: string }) => {
      if (payload?.emoji) {
        spawnParticle(payload.emoji);
      }
    });

    // 2. Listen for cross-tab / local storage reactions
    const unsubLocalSync = localSync.on('ROOM_REACTION', (payload: { emoji: string }) => {
      if (payload?.emoji) {
        spawnParticle(payload.emoji);
      }
    });

    // 3. Listen for local immediate reactions
    const localListener: ReactionListener = (emoji) => {
      spawnParticle(emoji);
    };
    reactionListeners.add(localListener);

    return () => {
      unsubSocket();
      unsubLocalSync();
      reactionListeners.delete(localListener);
    };
  }, [spawnParticle]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="floating-reaction-emoji"
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            ['--sway-x' as any]: `${p.swayDistance}px`,
            ['--rotate-deg' as any]: `${p.rotation}deg`,
          }}
        >
          {p.emoji.startsWith('/') ? (
            <img
              src={p.emoji}
              alt="Reaction"
              style={{
                width: `${p.size * 1.2}px`,
                height: `${p.size * 1.2}px`,
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
              }}
            />
          ) : (
            p.emoji
          )}
        </div>
      ))}
    </div>
  );
}
