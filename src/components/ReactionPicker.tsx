import React, { useState } from 'react';
import { quizClient } from '../utils/socketClient';
import { triggerLocalReaction } from './FloatingReactions';
import { sfx } from '../utils/sfx';

const REACTION_EMOJIS = ['❤️', '🔥', '😂', '👏', '🎉', '🚀', '🤯', '⚡', '🤩', '💯'];

interface ReactionPickerProps {
  roomCode: string;
  playerName?: string;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

export function ReactionPicker({
  roomCode,
  playerName,
  className = '',
  style,
  compact = false,
}: ReactionPickerProps) {
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  const handleSendReaction = (emoji: string) => {
    sfx.click();
    setLastClicked(emoji);
    setTimeout(() => setLastClicked(null), 250);

    // 1. Instant local trigger for 0ms delay
    triggerLocalReaction(emoji);

    // 2. Broadcast via WebSocket to everyone in the session
    if (roomCode) {
      quizClient.send('SEND_REACTION', {
        code: roomCode,
        emoji,
        senderName: playerName || 'Player',
      });
    }
  };

  return (
    <div
      className={`reaction-picker-bar ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? '4px' : '6px',
        padding: compact ? '6px 10px' : '8px 12px',
        background: 'rgba(21, 23, 32, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-medium)',
        borderRadius: '30px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55)',
        zIndex: 60,
        ...style,
      }}
    >
      {REACTION_EMOJIS.map((emoji) => {
        const isBouncing = lastClicked === emoji;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleSendReaction(emoji)}
            className="reaction-btn"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: compact ? '19px' : '22px',
              padding: compact ? '2px 4px' : '4px 6px',
              cursor: 'pointer',
              borderRadius: '10px',
              lineHeight: 1,
              outline: 'none',
              transform: isBouncing ? 'scale(1.45) translateY(-4px)' : 'scale(1)',
              transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            title={emoji}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}
