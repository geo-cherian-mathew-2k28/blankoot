import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Sparkles, RotateCcw, ChevronDown, ChevronUp, Medal } from 'lucide-react';
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
  const colors = ['#ffd700', '#ffffff', '#fbbf24', '#f59e0b', '#ec4899', '#38bdf8'];
  
  // Left and Right celebratory cannon blasts
  confetti({
    particleCount: 70,
    angle: 60,
    spread: 60,
    origin: { x: 0.1, y: 0.65 },
    colors,
  });
  confetti({
    particleCount: 70,
    angle: 120,
    spread: 60,
    origin: { x: 0.9, y: 0.65 },
    colors,
  });

  // Center grand gold shower
  setTimeout(() => {
    confetti({
      particleCount: 110,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#ffd700', '#fef08a', '#ffffff', '#f59e0b', '#e2e8f0'],
    });
  }, 250);
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

  // Reveal flags: Bronze (step 1), Silver (step 2), Gold (step 3)
  const [showBronze, setShowBronze] = useState(false);
  const [showSilver, setShowSilver] = useState(false);
  const [showGold, setShowGold] = useState(false);
  const [showTop5, setShowTop5] = useState(false);

  // Find personal standing for student view
  const myPlayer = myPlayerId ? sorted.find((p) => p.id === myPlayerId) : undefined;
  const myRank = myPlayerId ? sorted.findIndex((p) => p.id === myPlayerId) + 1 : undefined;

  // Timed reveal sequence
  useEffect(() => {
    // 1. Reveal Bronze
    const t3 = setTimeout(() => {
      setShowBronze(true);
      if (top3) sfx.riserStep(3);
    }, 400);

    // 2. Reveal Silver
    const t2 = setTimeout(() => {
      setShowSilver(true);
      if (top2) sfx.riserStep(2);
    }, 1200);

    // 3. Reveal Gold Champion
    const t1 = setTimeout(() => {
      setShowGold(true);
      sfx.podiumFanfare();
      sfx.cheer();
      launchGrandVictoryConfetti();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="podium-ceremony-root">
      {/* Dynamic Victory Light Atmosphere */}
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
                {myRank === 1 ? <Crown size={24} color="#ffd700" fill="#ffd700" /> : myRank === 2 ? <Medal size={24} color="#e2e8f0" /> : myRank === 3 ? <Medal size={24} color="#fed7aa" /> : '🎖️'}
              </span>
              <div>
                <div className="personal-rank-title">
                  {myRank === 1
                    ? '1ST PLACE CHAMPION!'
                    : myRank === 2
                    ? '2ND PLACE SILVER RUNNER UP!'
                    : myRank === 3
                    ? '3RD PLACE BRONZE PODIUM!'
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
      {/* 3D ALIGNED PODIUM STAGE (Gold, Silver, Bronze on Blocks 2, 1, 3)         */}
      {/* ========================================================================= */}
      <div className="podium-stage-wrapper">
        <div className="podium-stage-grid">
          {/* ------------------------------------------------------------- */}
          {/* PEDESTAL #2 (LEFT - AUTHENTIC SILVER / PLATINUM)             */}
          {/* ------------------------------------------------------------- */}
          <div className="podium-column column-silver">
            <div className={`podium-pedestal-unit silver-unit ${showSilver ? 'rise-in' : 'waiting-unit'}`}>
              {/* Avatar & Rank Header */}
              <div className="pedestal-character-zone">
                <div className="character-avatar-bubble silver-aura">
                  <AvatarDisplay avatar={top2?.avatar || 'avatar_2'} size={56} />
                </div>
                <div className="character-speech-tag silver-tag">
                  🥈 #2 SILVER
                </div>
              </div>

              {/* Silver Metallic Nameplate on Block #2 */}
              <div className="pedestal-nameplate silver-plate">
                <div className="pedestal-plate-badge silver-plate-badge">2ND PLACE</div>
                <div className="pedestal-team-name silver-name" title={top2 ? top2.name : 'Runner Up'}>
                  {top2 ? top2.name : 'Runner Up'}
                </div>
                <div className="pedestal-team-score silver-score">
                  {top2 ? top2.score.toLocaleString() : '0'} <span className="pts-label">PTS</span>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PEDESTAL #1 (CENTER - AUTHENTIC 24K GOLD CHAMPION)           */}
          {/* ------------------------------------------------------------- */}
          <div className="podium-column column-gold">
            <div className={`podium-pedestal-unit gold-unit ${showGold ? 'rise-in gold-champion-highlight' : 'waiting-unit'}`}>
              {/* Floating 3D Gold Crown & Avatar */}
              <div className="pedestal-character-zone">
                <div className="floating-crown-badge">
                  <Crown size={28} color="#ffd700" fill="#ffd700" className="animated-crown" />
                </div>
                <div className="character-avatar-bubble gold-aura">
                  <AvatarDisplay avatar={top1?.avatar || 'avatar_1'} size={72} />
                </div>
                <div className="character-speech-tag gold-tag">
                  <Trophy size={13} color="#ffd700" /> 🏆 #1 GOLD
                </div>
              </div>

              {/* Gold Metallic Nameplate on Block #1 */}
              <div className="pedestal-nameplate gold-plate">
                <div className="pedestal-plate-badge gold-plate-badge">1ST CHAMPION</div>
                <div className="pedestal-team-name gold-name" title={top1 ? top1.name : 'Champion'}>
                  {top1 ? top1.name : 'Champion'}
                </div>
                <div className="pedestal-team-score gold-score">
                  {top1 ? top1.score.toLocaleString() : '0'} <span className="pts-label">PTS</span>
                </div>
                <div className="gold-plate-shine" />
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PEDESTAL #3 (RIGHT - AUTHENTIC METALLIC BRONZE)              */}
          {/* ------------------------------------------------------------- */}
          <div className="podium-column column-bronze">
            <div className={`podium-pedestal-unit bronze-unit ${showBronze ? 'rise-in' : 'waiting-unit'}`}>
              {/* Avatar & Rank Header */}
              <div className="pedestal-character-zone">
                <div className="character-avatar-bubble bronze-aura">
                  <AvatarDisplay avatar={top3?.avatar || 'avatar_3'} size={56} />
                </div>
                <div className="character-speech-tag bronze-tag">
                  🥉 #3 BRONZE
                </div>
              </div>

              {/* Bronze Metallic Nameplate on Block #3 */}
              <div className="pedestal-nameplate bronze-plate">
                <div className="pedestal-plate-badge bronze-plate-badge">3RD PLACE</div>
                <div className="pedestal-team-name bronze-name" title={top3 ? top3.name : 'Bronze'}>
                  {top3 ? top3.name : 'Bronze'}
                </div>
                <div className="pedestal-team-score bronze-score">
                  {top3 ? top3.score.toLocaleString() : '0'} <span className="pts-label">PTS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Honors / Host Actions */}
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
