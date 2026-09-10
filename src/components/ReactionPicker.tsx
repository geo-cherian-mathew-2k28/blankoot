import React, { useState } from 'react';
import { quizClient } from '../utils/socketClient';
import { triggerLocalReaction } from './FloatingReactions';
import { sfx } from '../utils/sfx';

const REACTION_EMOJIS = ['🔥', '❤️', '😂', '👏', '🎉', '🚀', '🤯', '⚡'];

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
      className={`reaction-picker-bar ${compact ? 'reaction-picker-compact' : ''} ${className}`}
      style={style}
    >
      {REACTION_EMOJIS.map((emoji) => {
        const isBouncing = lastClicked === emoji;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => handleSendReaction(emoji)}
            className={`reaction-btn ${isBouncing ? 'reaction-btn-active' : ''}`}
            title={emoji}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}

