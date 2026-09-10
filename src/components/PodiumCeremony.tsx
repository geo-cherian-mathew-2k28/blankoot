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
      origin: { x: 0.5, y: 0.35 },
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
  // Only use actual active players with scores, sorted descending
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
    const t3 = setTimeout(() => {
      setShowBronze(true);
      if (top3) sfx.riserStep(3);
    }, 400);

    const t2 = setTimeout(() => {
      setShowSilver(true);
      if (top2) sfx.riserStep(2);
    }, 1100);

    const t1 = setTimeout(() => {
      setShowGold(true);
      sfx.podiumFanfare();
      sfx.cheer();
      launchGrandVictoryConfetti();
    }, 2000);

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

      {/* ========================================================================= */}
      {/* TOP HEADER CONGRATULATIONS BANNER (IN THE UPPER SKY OPEN AREA)           */}
      {/* ========================================================================= */}
      <div className="podium-top-bar">
        <div className="podium-tournament-tag">
          <Sparkles size={12} color="#fef08a" />
          <span>CLASSROOM TOURNAMENT FINALE {roomCode ? `• PIN #${roomCode}` : ''}</span>
          <Sparkles size={12} color="#fef08a" />
        </div>

        <div className="podium-grand-congrats">
          <h1 className="congrats-main-title">CONGRATULATIONS!</h1>
          {myPlayer && myRank ? (
            <div className="congrats-sub-badge">
              {myRank === 1
                ? '🏆 YOU CONQUERED 1ST PLACE CHAMPION! 🏆'
                : myRank === 2
                ? '🥈 2ND PLACE SILVER PODIUM FINISH!'
                : myRank === 3
                ? '🥉 3RD PLACE BRONZE PODIUM FINISH!'
                : `🎖️ RANK #${myRank} • GREAT EFFORT TODAY!`}
            </div>
          ) : (
            <div className="congrats-sub-badge">
              🎉 TO THE CLASSROOM CHAMPIONS! 🎉
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3D ALIGNED PODIUM STAGE (Gold, Silver, Bronze Placed on Block Faces)     */}
      {/* ========================================================================= */}
      <div className="podium-stage-wrapper">
        <div className="podium-stage-grid">
          {/* ------------------------------------------------------------- */}
          {/* PEDESTAL #2 (LEFT - AUTHENTIC SILVER / PLATINUM)             */}
          {/* ------------------------------------------------------------- */}
          <div className="podium-column column-silver">
            {top2 ? (
              <div className={`podium-pedestal-unit silver-unit ${showSilver ? 'rise-in' : 'waiting-unit'}`}>
                {/* Crown / Avatar Medallion Header */}
                <div className="pedestal-crest-zone">
                  <div className="pedestal-medallion silver-medallion">
                    <AvatarDisplay avatar={top2.avatar} size={38} />
                  </div>
                  <div className="character-speech-tag silver-tag">
                    <Medal size={11} color="#f8fafc" /> #2 SILVER
                  </div>
                </div>

                {/* Silver Metallic Nameplate on Block #2 */}
                <div className="pedestal-nameplate silver-plate">
                  <div className="pedestal-team-name silver-name" title={top2.name}>
                    {top2.name}
                  </div>
                  <div className="pedestal-team-score silver-score">
                    {top2.score.toLocaleString()} <span className="pts-label">PTS</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="podium-pedestal-unit silver-unit empty-tier">
                <div className="pedestal-empty-plate silver-empty">
                  <span>#2</span>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PEDESTAL #1 (CENTER - AUTHENTIC 24K GOLD CHAMPION)           */}
          {/* ------------------------------------------------------------- */}
          <div className="podium-column column-gold">
            {top1 ? (
              <div className={`podium-pedestal-unit gold-unit ${showGold ? 'rise-in gold-champion-highlight' : 'waiting-unit'}`}>
                {/* Floating Gold Crown & Avatar Medallion */}
                <div className="pedestal-crest-zone">
                  <div className="floating-crown-badge">
                    <Crown size={24} color="#ffd700" fill="#ffd700" className="animated-crown" />
                  </div>
                  <div className="pedestal-medallion gold-medallion">
                    <AvatarDisplay avatar={top1.avatar} size={46} />
                  </div>
                  <div className="character-speech-tag gold-tag">
                    <Trophy size={11} color="#ffd700" /> #1 CHAMPION
                  </div>
                </div>

                {/* Gold Metallic Nameplate on Block #1 */}
                <div className="pedestal-nameplate gold-plate">
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
              <div className="podium-pedestal-unit gold-unit empty-tier">
                <div className="pedestal-empty-plate gold-empty">
                  <span>#1</span>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PEDESTAL #3 (RIGHT - AUTHENTIC METALLIC BRONZE)              */}
          {/* ------------------------------------------------------------- */}
          <div className="podium-column column-bronze">
            {top3 ? (
              <div className={`podium-pedestal-unit bronze-unit ${showBronze ? 'rise-in' : 'waiting-unit'}`}>
                {/* Avatar Medallion Header */}
                <div className="pedestal-crest-zone">
                  <div className="pedestal-medallion bronze-medallion">
                    <AvatarDisplay avatar={top3.avatar} size={38} />
                  </div>
                  <div className="character-speech-tag bronze-tag">
                    <Medal size={11} color="#fed7aa" /> #3 BRONZE
                  </div>
                </div>

                {/* Bronze Metallic Nameplate on Block #3 */}
                <div className="pedestal-nameplate bronze-plate">
                  <div className="pedestal-team-name bronze-name" title={top3.name}>
                    {top3.name}
                  </div>
                  <div className="pedestal-team-score bronze-score">
                    {top3.score.toLocaleString()} <span className="pts-label">PTS</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="podium-pedestal-unit bronze-unit empty-tier">
                <div className="pedestal-empty-plate bronze-empty">
                  <span>#3</span>
                </div>
              </div>
            )}
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
