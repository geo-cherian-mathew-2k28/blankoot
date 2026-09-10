import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Sparkles, RotateCcw, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { Player } from '../types';
import { AvatarDisplay } from './Shell';
import { sfx } from '../utils/sfx';
import confetti from 'canvas-confetti';

interface PodiumCeremonyProps {
  players: Player[];
  isHost?: boolean;
  myPlayerId?: string;
  roomCode?: string;
  onRestart?: () => void;
}

function launchGrandVictoryConfetti() {
  // Professional metallic gold and vibrant festive streamers
  const end = Date.now() + 2.5 * 1000;
  const colors = ['#ffd700', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#ffffff'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  // Main center celebratory blast
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { x: 0.5, y: 0.45 },
      colors: ['#ffd700', '#ffffff', '#f59e0b', '#ec4899', '#00f2fe'],
    });
  }, 300);
}

export function PodiumCeremony({
  players,
  isHost = false,
  myPlayerId,
  roomCode,
  onRestart,
}: PodiumCeremonyProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const top1 = sorted[0];
  const top2 = sorted[1];
  const top3 = sorted[2];
  const runnerUps = sorted.slice(3, 5);

  const [revealedRank, setRevealedRank] = useState<number>(0);
  const [showTop5, setShowTop5] = useState<boolean>(false);

  // Find personal standing for student view
  const myPlayer = myPlayerId ? sorted.find((p) => p.id === myPlayerId) : undefined;
  const myRank = myPlayerId ? sorted.findIndex((p) => p.id === myPlayerId) + 1 : undefined;

  // Step-by-step esports reveal sequence
  useEffect(() => {
    // Reveal #3 Bronze
    const t3 = setTimeout(() => {
      setRevealedRank(3);
      if (top3) sfx.riserStep(3);
    }, 600);

    // Reveal #2 Silver
    const t2 = setTimeout(() => {
      setRevealedRank(2);
      if (top2) sfx.riserStep(2);
    }, 1500);

    // Reveal #1 Gold Champion with fanfare and confetti
    const t1 = setTimeout(() => {
      setRevealedRank(1);
      sfx.podiumFanfare();
      sfx.cheer();
      launchGrandVictoryConfetti();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="podium-ceremony-root">
      {/* Dynamic Victory Light Rays & Ambient Atmosphere */}
      <div className="podium-light-atmosphere" aria-hidden="true">
        <div className="podium-spotlight-beam" />
        <div className="podium-ambient-glow" />
      </div>

      {/* Top Header / Status Pill */}
      <div className="podium-top-bar">
        <div className="podium-tournament-tag">
          <Sparkles size={13} color="#fef08a" />
          <span>TOURNAMENT CONCLUDED {roomCode ? `• PIN #${roomCode}` : ''}</span>
          <Sparkles size={13} color="#fef08a" />
        </div>

        {/* Personalized Student Standing Banner */}
        {!isHost && myPlayer && myRank && (
          <div
            className={`podium-personal-banner ${
              myRank === 1 ? 'gold-badge' : myRank === 2 ? 'silver-badge' : myRank === 3 ? 'bronze-badge' : 'participant-badge'
            }`}
          >
            <div className="podium-personal-content">
              <span className="personal-rank-icon">
                {myRank === 1 ? <Crown size={24} color="#ffd700" fill="#ffd700" /> : myRank === 2 ? <Award size={24} color="#fbcfe8" /> : myRank === 3 ? <Award size={24} color="#bfdbfe" /> : <Award size={24} color="#a1a1aa" />}
              </span>
              <div>
                <div className="personal-rank-title">
                  {myRank === 1
                    ? '1ST PLACE CHAMPION'
                    : myRank === 2
                    ? '2ND PLACE RUNNER UP'
                    : myRank === 3
                    ? '3RD PLACE PODIUM'
                    : `CLASSROOM RANK #${myRank}`}
                </div>
                <div className="personal-rank-score">
                  {myPlayer.name} &bull; {myPlayer.score.toLocaleString()} PTS
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3D ALIGNED PODIUM STAGE (Plaques sit directly on circled blocks 2, 1, 3) */}
      {/* ========================================================================= */}
      <div className="podium-stage-wrapper">
        <div className="podium-stage-grid">
          {/* ------------------------------------------------------------- */}
          {/* PEDESTAL #2 (LEFT - SILVER RUNNER UP)                         */}
          {/* ------------------------------------------------------------- */}
          <div className="podium-column column-silver">
            {revealedRank <= 2 && top2 ? (
              <div className="podium-pedestal-unit silver-unit rise-in">
                {/* Floating Avatar & Laurel */}
                <div className="pedestal-character-zone">
                  <div className="character-avatar-bubble silver-aura">
                    <AvatarDisplay avatar={top2.avatar} size={58} />
                  </div>
                  <div className="character-speech-tag silver-tag">#2 2ND</div>
                </div>

                {/* Nameplate placed right on the circled block #2 */}
                <div className="pedestal-nameplate silver-plate">
                  <div className="pedestal-plate-badge silver-plate-badge">2ND PLACE</div>
                  <div className="pedestal-team-name" title={top2.name}>
                    {top2.name}
                  </div>
                  <div className="pedestal-team-score">
                    {top2.score.toLocaleString()} <span className="pts-label">PTS</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="podium-pedestal-unit silver-unit waiting-unit">
                <div className="pedestal-nameplate silver-plate placeholder-plate">
                  <div className="plate-placeholder-number">2</div>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PEDESTAL #1 (CENTER - GOLD CHAMPION, TALLEST)                 */}
          {/* ------------------------------------------------------------- */}
          <div className="podium-column column-gold">
            {revealedRank <= 1 && top1 ? (
              <div className="podium-pedestal-unit gold-unit rise-in gold-champion-highlight">
                {/* Crown & Floating Avatar */}
                <div className="pedestal-character-zone">
                  <div className="floating-crown-badge">
                    <Crown size={28} color="#ffd700" fill="#ffd700" className="animated-crown" />
                  </div>
                  <div className="character-avatar-bubble gold-aura">
                    <AvatarDisplay avatar={top1.avatar} size={76} />
                  </div>
                  <div className="character-speech-tag gold-tag">
                    <Trophy size={13} color="#ffd700" /> 1ST CHAMPION
                  </div>
                </div>

                {/* Nameplate placed right on the circled block #1 */}
                <div className="pedestal-nameplate gold-plate">
                  <div className="pedestal-plate-badge gold-plate-badge">1ST CHAMPION</div>
                  <div className="pedestal-team-name gold-name" title={top1.name}>
                    {top1.name}
                  </div>
                  <div className="pedestal-team-score gold-score">
                    {top1.score.toLocaleString()} <span className="pts-label">PTS</span>
                  </div>
                  <div className="gold-plate-shine" />
                </div>
              </div>
            ) : (
              <div className="podium-pedestal-unit gold-unit waiting-unit">
                <div className="pedestal-nameplate gold-plate placeholder-plate">
                  <div className="plate-placeholder-number gold-placeholder">1</div>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PEDESTAL #3 (RIGHT - BRONZE 3RD PLACE)                       */}
          {/* ------------------------------------------------------------- */}
          <div className="podium-column column-bronze">
            {revealedRank <= 3 && top3 ? (
              <div className="podium-pedestal-unit bronze-unit rise-in">
                {/* Floating Avatar */}
                <div className="pedestal-character-zone">
                  <div className="character-avatar-bubble bronze-aura">
                    <AvatarDisplay avatar={top3.avatar} size={58} />
                  </div>
                  <div className="character-speech-tag bronze-tag">#3 3RD</div>
                </div>

                {/* Nameplate placed right on the circled block #3 */}
                <div className="pedestal-nameplate bronze-plate">
                  <div className="pedestal-plate-badge bronze-plate-badge">3RD PLACE</div>
                  <div className="pedestal-team-name" title={top3.name}>
                    {top3.name}
                  </div>
                  <div className="pedestal-team-score">
                    {top3.score.toLocaleString()} <span className="pts-label">PTS</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="podium-pedestal-unit bronze-unit waiting-unit">
                <div className="pedestal-nameplate bronze-plate placeholder-plate">
                  <div className="plate-placeholder-number">3</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional Top 5 Toggle / Host Controls */}
      <div className="podium-bottom-actions">
        {runnerUps.length > 0 && (
          <div className="top5-drawer-wrapper">
            <button
              onClick={() => setShowTop5(!showTop5)}
              className="top5-toggle-btn"
            >
              <span>Classroom Top 5</span>
              {showTop5 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTop5 && (
              <div className="top5-list-popup">
                {runnerUps.map((p, idx) => (
                  <div key={p.id} className="top5-item">
                    <span className="top5-rank">#{idx + 4}</span>
                    <AvatarDisplay avatar={p.avatar} size={28} />
                    <span className="top5-name">{p.name}</span>
                    <span className="top5-score">{p.score.toLocaleString()} PTS</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isHost && onRestart && (
          <button onClick={onRestart} className="host-play-again-btn">
            <RotateCcw size={16} /> Play Again
          </button>
        )}
      </div>
    </div>
  );
}
