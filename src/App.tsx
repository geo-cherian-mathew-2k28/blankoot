import { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  Gamepad2,
  Play,
  ArrowRight,
  ArrowLeft,
  Users,
  Clock,
  Triangle,
  Diamond,
  Circle,
  Square,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  Lock,
  LogOut,
  ShieldCheck,
  Check,
  Crown,
  RotateCcw,
  Trophy,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

import { auth, googleProvider } from './lib/firebase';
import { isAuthorizedHost, validatePresenterPasscode } from './lib/authConfig';
import {
  AvatarConfig,
  generateAvatarFromSeed,
  serializeAvatar,
} from './data/avatarSystem';
import { getRandomEmojiAvatar } from './data/emojiAvatars';
import { Shell, AvatarDisplay } from './components/Shell';
import { AvatarStudio } from './components/AvatarStudio';
import { CircularCountdown } from './components/CircularCountdown';
import { ReactionPicker } from './components/ReactionPicker';
import { PodiumCeremony } from './components/PodiumCeremony';
import { HostQuestionEditor } from './components/HostQuestionEditor';
import { sfx } from './utils/sfx';
import { quizClient } from './utils/socketClient';
import { validateGamePin } from './utils/gamePinValidator';
import { localSync } from './utils/localSessionSync';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  image?: string;
  mediaUrl?: string;
  multiplier?: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  answered: boolean;
  selectedAnswer?: number;
}

import { blankspaceMasterQuestions } from './data/quizQuestions';

const KAHOOT_SOLID_OPTIONS = [
  { colorClass: 'choice-red', label: 'Triangle', Icon: Triangle, letter: 'A', bg: '#e21b3c', shadow: '#a0132b' },
  { colorClass: 'choice-blue', label: 'Diamond', Icon: Diamond, letter: 'B', bg: '#1368ce', shadow: '#0b4182' },
  { colorClass: 'choice-amber', label: 'Circle', Icon: Circle, letter: 'C', bg: '#d89e00', shadow: '#8c6600' },
  { colorClass: 'choice-emerald', label: 'Square', Icon: Square, letter: 'D', bg: '#26890c', shadow: '#195b08' },
];

function triggerCleanConfetti() {
  confetti({
    particleCount: 130,
    spread: 90,
    origin: { y: 0.65 },
    colors: ['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#ec4899', '#8b5cf6'],
  });
}

// ==========================================
// 1. STUDENT LANDING PAGE: DIRECT JOIN GAME
// ==========================================
function StudentPINEnter({ onJoinSuccess }: { onJoinSuccess: (code: string) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.stagger-in'),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  const handleNext = async () => {
    const cleaned = code.trim().replace(/\s/g, '');
    if (cleaned.length < 4) {
      sfx.wrong();
      setError('Please enter the 6-digit Game PIN shown on the main screen.');
      return;
    }

    setIsValidating(true);
    setError('');

    const res = await validateGamePin(cleaned);
    setIsValidating(false);

    if (res.valid) {
      sfx.correct();
      onJoinSuccess(cleaned);
      navigate('/character');
    } else {
      sfx.wrong();
      setError(res.message || "We didn't find a game with that PIN. Please check the main screen and try again.");
    }
  };

  return (
    <Shell>
      <div ref={containerRef} style={{ maxWidth: '440px', margin: '40px auto 0', textAlign: 'center' }}>
        <div className="stagger-in" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span
            style={{
              background: 'var(--accent-purple)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '999px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} /> BLANKSPACE LIVE QUIZ
          </span>
        </div>

        <h1
          className="stagger-in"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            margin: '0 auto 8px',
            color: '#ffffff',
          }}
        >
          Join Game
        </h1>

        <p
          className="stagger-in"
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.5,
          }}
        >
          Enter the 6-digit Game PIN shown on the main screen to enter.
        </p>

        <div className="stagger-in solid-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            GAME PIN
          </label>

          <input
            type="text"
            maxLength={6}
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: '2px solid var(--border-medium)',
              borderRadius: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(26px, 7vw, 36px)',
              fontWeight: 900,
              letterSpacing: 'clamp(0.08em, 2.5vw, 0.22em)',
              textAlign: 'center',
              color: '#fff',
              padding: '14px 10px',
              marginBottom: '16px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            placeholder="000 000"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ''));
              setError('');
              sfx.click();
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            autoFocus
          />

          {error && (
            <p style={{ color: '#f87171', fontSize: '12px', fontWeight: 600, marginBottom: '14px' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleNext}
            disabled={isValidating}
            className="tactile-btn btn-pink"
            style={{ width: '100%', padding: '15px', fontSize: '17px', opacity: isValidating ? 0.75 : 1 }}
          >
            {isValidating ? 'Verifying PIN...' : (
              <>
                Enter Game <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </Shell>
  );
}

// ==========================================
// 2. STUDENT CHARACTER SELECT (Avatar & Nickname)
// ==========================================
function StudentCharacterPick({
  roomCode,
  onPick,
}: {
  roomCode: string;
  onPick: (avatarString: string, name: string) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(() =>
    getRandomEmojiAvatar().image
  );
  const navigate = useNavigate();

  const handleFinish = () => {
    const finalName = name.trim();
    if (!finalName) {
      setError('Please enter your name or team name to continue.');
      sfx.click();
      return;
    }
    sfx.correct();
    onPick(selectedAvatar, finalName);
    navigate('/lobby');
  };

  return (
    <Shell>
      <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative' }}>
        {/* Top Header Card with strong contrast */}
        <div
          className="solid-card"
          style={{
            padding: '24px 28px',
            textAlign: 'center',
            marginBottom: '20px',
            background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(26, 29, 42, 0.96) 100%)',
            border: '1px solid var(--border-medium)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '10px' }}>
            <span className="brand-badge">
              GAME PIN: {roomCode}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 900,
              margin: '4px 0 6px',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            Choose Your Avatar
          </h1>

          <p style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 500, marginBottom: '22px' }}>
            Pick an emoji avatar and enter your name or team name to join the game.
          </p>

          <div style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'left' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 800,
                color: '#f1f5f9',
                marginBottom: '8px',
                letterSpacing: '0.04em',
              }}
            >
              YOUR NAME OR TEAM NAME <span style={{ color: '#ef4444' }}>*</span>
            </label>

            <input
              style={{
                width: '100%',
                background: '#0c0d14',
                border: error ? '2px solid #ef4444' : '2px solid var(--border-medium)',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                color: '#ffffff',
                textAlign: 'center',
                padding: '13px 16px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: error ? '0 0 12px rgba(239, 68, 68, 0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.4)',
              }}
              placeholder="Enter your name or team name..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleFinish()}
              autoFocus
            />

            {error && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px 14px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  fontSize: '13px',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        {/* The Full Avatar Customizer */}
        <AvatarStudio
          config={selectedAvatar}
          onChange={setSelectedAvatar}
        />

        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <button
            onClick={handleFinish}
            className="tactile-btn btn-purple btn-lg"
            style={{ padding: '16px 56px', fontSize: '18px', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)' }}
          >
            Ready to Play! <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </Shell>
  );
}

// ==========================================
// 3. STUDENT LOBBY
// ==========================================
function StudentLobby({
  roomCode,
  players,
}: {
  roomCode: string;
  players: Player[];
}) {
  return (
    <Shell>
      <div style={{ maxWidth: '800px', margin: '10px auto 30px', textAlign: 'center' }}>
        {/* Top Header Card with high contrast */}
        <div
          className="solid-card"
          style={{
            padding: '24px 28px',
            textAlign: 'center',
            marginBottom: '20px',
            background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(26, 29, 42, 0.96) 100%)',
            border: '1px solid var(--border-medium)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '10px' }}>
            <span className="brand-badge">
              CONNECTED &bull; PIN #{roomCode}
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '34px',
              fontWeight: 900,
              color: '#ffffff',
              margin: '4px 0 6px',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            You're in!
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>
            See your nickname on screen? Get ready to answer on this device when the game begins.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              borderRadius: '20px',
              color: 'var(--accent-purple)',
              fontSize: '14px',
              fontWeight: 800,
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-purple)', display: 'inline-block', boxShadow: '0 0 8px var(--accent-purple)' }} />
            Players in this game: {players.length}
          </div>
        </div>

        {/* Players Roster Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '10px',
            maxHeight: '320px',
            overflowY: 'auto',
            padding: '4px',
            marginBottom: '24px',
          }}
        >
          {players.map((p) => (
            <div
              key={p.id}
              className="solid-card"
              style={{
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <AvatarDisplay avatar={p.avatar} size={46} />
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  marginTop: '8px',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '110px',
                }}
              >
                {p.name}
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Kahoot-style Reaction Bar */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ReactionPicker roomCode={roomCode} />
        </div>
      </div>
    </Shell>
  );
}

// ==========================================
// 4. STUDENT GAMEPAD (Optimized for Mobile Phone Viewport)
// ==========================================
function StudentGamepad({
  roomCode,
  currentQuestion,
  questionIndex,
  totalQuestions,
  onAnswer,
  selectedAnswer,
  revealed,
  correctAnswer,
  countdown,
}: {
  roomCode?: string;
  currentQuestion: { text: string; options: string[]; timeLimit: number; image?: string; mediaUrl?: string; multiplier?: number } | null;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (index: number) => void;
  selectedAnswer?: number;
  revealed: boolean;
  correctAnswer?: number;
  countdown: number | null;
}) {
  if (!currentQuestion) {
    return (
      <Shell>
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <div className="brand-badge" style={{ marginBottom: '14px' }}>SESSION SYNC</div>
          <h2>Waiting for the next round...</h2>
        </div>
      </Shell>
    );
  }

  // 1. During Countdown: Hide all options, show sync countdown
  if (countdown !== null && countdown > 0) {
    return (
      <Shell arenaTheme>
        <div className="mobile-gamepad-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <div className="brand-badge" style={{ marginBottom: '16px' }}>
            QUESTION {questionIndex + 1} OF {totalQuestions}
          </div>
          <div
            style={{
              fontSize: '18px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              color: 'var(--accent-purple)',
              marginBottom: '12px',
              letterSpacing: '0.08em',
            }}
          >
            GET READY!
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(80px, 20vw, 120px)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1,
              marginBottom: '20px',
              textShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
              animation: 'pulseScale 0.8s ease-in-out infinite alternate',
            }}
          >
            {countdown}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '16px' }}>
            Look at the main screen!
          </p>
          <ReactionPicker roomCode={roomCode || ''} />
        </div>
      </Shell>
    );
  }

  // 2. Answer Selected and Not Yet Revealed: Kahoot-style locked in screen (options DISAPPEAR)
  if (selectedAnswer !== undefined && !revealed) {
    const chosenConf = KAHOOT_SOLID_OPTIONS[selectedAnswer];
    const ChosenIcon = chosenConf.Icon;

    return (
      <Shell arenaTheme>
        <div className="mobile-gamepad-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <div className="brand-badge" style={{ marginBottom: '18px', background: '#181b26', border: '2px solid #2d3345', boxShadow: '0 3px 0 #08090d', padding: '6px 14px', fontSize: '12px' }}>
            QUESTION {questionIndex + 1} OF {totalQuestions}
          </div>

          <div className={`neo-locked-card ${chosenConf.colorClass}`}>
            <div className="neo-result-icon-box">
              <ChosenIcon size={44} fill="#fff" stroke="#fff" />
            </div>

            <div>
              <div className="neo-result-title">
                Answer Locked In!
              </div>
              <div style={{ fontSize: '18px', color: '#ffffff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {chosenConf.label}
              </div>
            </div>
          </div>

          <div className="neo-waiting-pill">
            <div className="waiting-spinner" style={{ width: '16px', height: '16px', borderTopColor: 'var(--accent-purple)' }} />
            <span>Waiting for round timer...</span>
          </div>

          <ReactionPicker roomCode={roomCode || ''} style={{ marginTop: '16px' }} />
        </div>
      </Shell>
    );
  }

  // 3. Round Revealed Results (Kahoot feedback screen)
  if (revealed) {
    const isCorrect = selectedAnswer === correctAnswer;

    return (
      <Shell arenaTheme>
        <div className="mobile-gamepad-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <div className="brand-badge" style={{ marginBottom: '18px', background: '#181b26', border: '2px solid #2d3345', boxShadow: '0 3px 0 #08090d', padding: '6px 14px', fontSize: '12px' }}>
            QUESTION {questionIndex + 1} RESULT
          </div>

          <div className={`neo-result-card ${isCorrect ? 'neo-result-correct' : 'neo-result-incorrect'}`}>
            <div className="neo-result-icon-box">
              {isCorrect ? '🎉' : '❌'}
            </div>
            <div className="neo-result-title">
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </div>
            <div className="neo-result-desc">
              {isCorrect
                ? 'Great speed! Points added to your scoreboard.'
                : 'Better luck next round! Keep eyes on the board.'}
            </div>
          </div>

          <div className="neo-waiting-pill">
            <span>Look at the main screen for leaderboard</span>
          </div>

          <ReactionPicker roomCode={roomCode || ''} style={{ marginTop: '16px' }} />
        </div>
      </Shell>
    );
  }

  // 4. Active Question Gamepad (Options Visible & Interactive)
  return (
    <Shell arenaTheme>
      <div className="mobile-gamepad-container">
        {/* Compact Phone Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '10px' }}>
          <span className="brand-badge" style={{ fontSize: '11px', padding: '4px 10px' }}>
            Q {questionIndex + 1} / {totalQuestions}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 700 }}>
            Tap an Option
          </span>
        </div>

        {/* Optional Question Image for Mobile Gamepad */}
        {(currentQuestion.image || currentQuestion.mediaUrl) && (
          <div
            style={{
              width: '100%',
              maxHeight: '140px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '10px',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
              background: '#0a0b10',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={currentQuestion.image || currentQuestion.mediaUrl}
              alt="Question prompt"
              style={{
                maxWidth: '100%',
                maxHeight: '140px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* 4 Big Kahoot Tap Buttons: 2x2 Grid filling phone viewport ergonomically */}
        <div className="kahoot-mobile-grid">
          {currentQuestion.options.map((opt, oIdx) => {
            const conf = KAHOOT_SOLID_OPTIONS[oIdx];
            const Icon = conf.Icon;

            return (
              <button
                key={oIdx}
                disabled={selectedAnswer !== undefined || revealed}
                onClick={() => onAnswer(oIdx)}
                className={`kahoot-choice-btn ${conf.colorClass} kahoot-phone-btn`}
              >
                <div className="kahoot-shape-icon" style={{ width: 44, height: 44 }}>
                  <Icon size={28} fill="#fff" stroke="#fff" />
                </div>
                <span className="kahoot-phone-label">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Discrete floating reaction pill docked at the bottom center */}
        <div
          style={{
            position: 'fixed',
            bottom: '14px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 80,
            pointerEvents: 'auto',
            maxWidth: 'calc(100vw - 24px)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <ReactionPicker roomCode={roomCode || ''} compact />
        </div>
      </div>
    </Shell>
  );
}

// ==========================================
// 5. AUTHENTICATED CLASSROOM PRESENTER DISPLAY (/host)
// ==========================================
function HostPresenterScreen({
  roomCode,
  questions,
  players,
  setPlayers,
}: {
  roomCode: string;
  questions: Question[];
  players: Player[];
  setPlayers?: React.Dispatch<React.SetStateAction<Player[]>>;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isPasscodeAuthed, setIsPasscodeAuthed] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlKey = params.get('key') || params.get('hostKey') || params.get('passcode') || params.get('pin');
      if (urlKey && validatePresenterPasscode(urlKey)) {
        sessionStorage.setItem('blankspace_host_authenticated', 'true');
        return true;
      }
      return sessionStorage.getItem('blankspace_host_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [customQuestions, setCustomQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('blankspace_custom_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return questions && questions.length > 0 ? questions : blankspaceMasterQuestions;
  });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [remaining, setRemaining] = useState(customQuestions[0]?.timeLimit || 20);
  const [revealed, setRevealed] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [readyCountdown, setReadyCountdown] = useState<number | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [podiumPhase, setPodiumPhase] = useState<'idle' | 'suspense' | 'complete'>('idle');
  const [suspenseText, setSuspenseText] = useState('CALCULATING FINAL SCORES...');

  const headerRef = useRef<HTMLDivElement>(null);
  const currentQIndexRef = useRef(currentQIndex);
  useEffect(() => {
    currentQIndexRef.current = currentQIndex;
  }, [currentQIndex]);

  const persistentRosterRef = useRef<Player[]>([]);
  useEffect(() => {
    if (players && players.length > 0) {
      persistentRosterRef.current = players;
    }
  }, [players]);

  // Trigger dramatic podium reveal with suspense drumroll & confetti
  const runDramaticPodiumReveal = () => {
    setPodiumPhase('suspense');
    setSuspenseText('TABULATING FINAL SCORES...');
    sfx.tick(true);

    setTimeout(() => {
      setSuspenseText('THE CHAMPIONS HAVE EMERGED!');
      sfx.tick(true);
    }, 600);

    setTimeout(() => {
      setPodiumPhase('complete');
      sfx.podiumFanfare();
      triggerCleanConfetti();
      setTimeout(() => triggerCleanConfetti(), 500);
      setTimeout(() => triggerCleanConfetti(), 1200);
    }, 1200);
  };

  // Monitor Google Authentication
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handlePasscodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    if (validatePresenterPasscode(passcodeInput)) {
      sfx.correct();
      setIsPasscodeAuthed(true);
      try {
        sessionStorage.setItem('blankspace_host_authenticated', 'true');
      } catch {}
    } else {
      sfx.wrong();
      setAuthError('Invalid Presenter Passcode. Default is BLANK2026.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      const result = await signInWithPopup(auth, googleProvider);
      if (!isAuthorizedHost(result.user.email)) {
        await signOut(auth);
        setAuthError(`Access Denied: ${result.user.email} is not authorized to host classroom quiz sessions.`);
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err?.message || 'Login failed.');
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('blankspace_host_authenticated');
    } catch {}
    setIsPasscodeAuthed(false);
    signOut(auth);
  };

  // Register room in both WebSocket server and local session sync store (runs on roomCode/customQuestions setup)
  useEffect(() => {
    // 1. Register in local sync store immediately so students can validate PIN on any tab/window
    localSync.registerRoom({
      code: roomCode,
      title: 'Blankspace Orientation Classroom Quiz',
      questionsCount: customQuestions.length,
    });

    // 2. Send CREATE_ROOM via WebSocket
    quizClient.send('CREATE_ROOM', {
      code: roomCode,
      title: 'Blankspace Orientation Classroom Quiz',
      questions: customQuestions,
      hostEmail: user?.email || 'Presenter',
    });

    // 3. Listen to student joins for local sync fallback
    const unsubJoin = quizClient.on('JOIN_ROOM', (payload: any) => {
      if (payload?.code === roomCode && setPlayers) {
        setPlayers((prev: Player[]) => {
          const exists = prev.some((p: Player) => p.id === payload.playerId);
          if (exists) return prev;
          const updated: Player[] = [
            ...prev,
            {
              id: payload.playerId,
              name: payload.name,
              avatar: payload.avatar,
              score: 0,
              streak: 0,
              answered: false,
            },
          ];
          quizClient.send('ROSTER_UPDATE', { players: updated, count: updated.length });
          return updated;
        });
      }
    });

    // 4. Listen to student answers for local sync fallback
    const unsubAnswer = quizClient.on('SUBMIT_ANSWER', (payload: any) => {
      if (payload?.code === roomCode && setPlayers) {
        setPlayers((prev: Player[]) => {
          const target = prev.find((p: Player) => p.id === payload.playerId);
          if (!target || target.answered) return prev;

          const activeIdx = currentQIndexRef.current;
          const currentQ = customQuestions[activeIdx];
          const isCorrect = payload.optionIndex === currentQ?.correctAnswer;
          const pointsEarned = isCorrect ? Math.round(500 + 500 * (payload.remainingTime / 20) + target.streak * 100) : 0;

          const updated = prev.map((p: Player) => {
            if (p.id === payload.playerId) {
              return {
                ...p,
                answered: true,
                selectedAnswer: payload.optionIndex,
                score: isCorrect ? p.score + pointsEarned : p.score,
                streak: isCorrect ? p.streak + 1 : 0,
              };
            }
            return p;
          });

          quizClient.send('ANSWER_PROGRESS', {
            answeredCount: updated.filter((p: Player) => p.answered).length,
            totalPlayers: updated.length,
            players: updated,
          });

          return updated;
        });
      }
    });

    return () => {
      unsubJoin();
      unsubAnswer();
    };
  }, [user, roomCode, customQuestions]);

  // Round countdown
  useEffect(() => {
    if (!sessionStarted || revealed || readyCountdown !== null || gameEnded) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          sfx.wrong();
          handleRevealRound();
          return 0;
        }
        if (prev <= 5) sfx.tick(true);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStarted, revealed, readyCountdown, gameEnded]);

  const handleStartSession = () => {
    sfx.readyGo();
    setSessionStarted(true);
    setCurrentQIndex(0);
    setRemaining(customQuestions[0]?.timeLimit || 20);
    setRevealed(false);
    if (setPlayers) {
      setPlayers((prev) => prev.map((p) => ({ ...p, answered: false, selectedAnswer: undefined })));
    }
    localSync.updateRoom(roomCode, { status: 'in_question', currentQuestionIndex: 0 });

    // Send immediately so student phones receive the round instantly with 0ms lag
    quizClient.send('START_QUESTION', { code: roomCode, questionIndex: 0 });

    // 3-second animated projector overlay for visual hype
    setReadyCountdown(3);
    const readyInterval = setInterval(() => {
      setReadyCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(readyInterval);
          return null;
        }
        sfx.tick(false);
        return prev - 1;
      });
    }, 800);
  };

  const handleRevealRound = () => {
    setRevealed(true);
    sfx.correct(2);
    localSync.updateRoom(roomCode, { status: 'revealed' });
    quizClient.send('REVEAL_RESULTS', { code: roomCode });
  };

  const handleShowLeaderboard = () => {
    setShowLeaderboard(true);
    sfx.correct(3);
  };

  const handleNextRound = () => {
    if (currentQIndex >= customQuestions.length - 1) {
      setGameEnded(true);
      localSync.updateRoom(roomCode, { status: 'ended' });
      runDramaticPodiumReveal();
      const activeRoster = players.length > 0 ? players : persistentRosterRef.current;
      quizClient.send('SHOW_FINAL_PODIUM', { code: roomCode, standings: activeRoster });
      return;
    }

    const nextIdx = currentQIndex + 1;
    setCurrentQIndex(nextIdx);
    setRemaining(customQuestions[nextIdx]?.timeLimit || 20);
    setRevealed(false);
    setShowLeaderboard(false);
    if (setPlayers) {
      setPlayers((prev) => prev.map((p) => ({ ...p, answered: false, selectedAnswer: undefined })));
    }
    localSync.updateRoom(roomCode, { status: 'in_question', currentQuestionIndex: nextIdx });

    // Instant dispatch to student phones with 0ms lag
    quizClient.send('START_QUESTION', { code: roomCode, questionIndex: nextIdx });

    setReadyCountdown(3);
    const readyInterval = setInterval(() => {
      setReadyCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(readyInterval);
          return null;
        }
        sfx.tick(false);
        return prev - 1;
      });
    }, 800);
  };

  if (authLoading) {
    return (
      <Shell hideBrandTag>
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <div className="brand-badge">AUTHENTICATING PRESENTER...</div>
        </div>
      </Shell>
    );
  }

  // Enforce Host Authentication (Dual-Mode: Master Passcode for Smartboards + Google OAuth for Laptops)
  const isHostAuthed = isPasscodeAuthed || (user && isAuthorizedHost(user.email));

  if (!isHostAuthed) {
    return (
      <Shell hideBrandTag>
        <div className="solid-card" style={{ maxWidth: '480px', margin: '50px auto 0', padding: '36px 28px', textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '2px solid var(--accent-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Lock size={26} color="var(--accent-purple)" />
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
            Presenter Console
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.5 }}>
            Access is restricted to authorized Blankspace presenters. Students must join using the 6-digit Game PIN on their phones.
          </p>

          {authError && (
            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#4c0519',
                border: '1px solid #9f1239',
                color: '#fecdd3',
                fontSize: '13px',
                marginBottom: '20px',
                fontWeight: 600,
              }}
            >
              {authError}
            </div>
          )}

          {/* Quick Smartboard Master Passcode Unlock */}
          <form onSubmit={handlePasscodeSubmit} style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '8px', textAlign: 'left' }}>
              CLASSROOM SMARTBOARD MASTER PIN
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter Master PIN (e.g. BLANK2026)"
                style={{
                  flex: 1,
                  background: 'var(--bg-input)',
                  border: '2px solid var(--border-medium)',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '16px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: '#fff',
                  padding: '12px 14px',
                  outline: 'none',
                }}
                autoFocus
              />
              <button
                type="submit"
                className="tactile-btn btn-pink"
                style={{ padding: '0 20px', fontSize: '15px', whiteSpace: 'nowrap' }}
              >
                Unlock
              </button>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'left' }}>
              Default Smartboard PIN: <strong style={{ color: '#fff' }}>BLANK2026</strong>
            </div>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>OR GOOGLE LOGIN</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="tactile-btn btn-surface"
            style={{ width: '100%', padding: '13px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <ShieldCheck size={18} color="var(--accent-purple)" />
            Sign in with Authorized Google Account
          </button>
        </div>
      </Shell>
    );
  }

  // Active Presenter Big Screen
  const currentQ = customQuestions[currentQIndex] || customQuestions[0];
  const activeRoster = players && players.length > 0 ? players : persistentRosterRef.current;
  const answeredCount = activeRoster.filter((p) => p.answered).length;
  const sortedPlayers = [...activeRoster].sort((a, b) => b.score - a.score);

  if (gameEnded) {
    return (
      <Shell hideBrandTag podiumTheme>
        <PodiumCeremony
          players={sortedPlayers}
          isHost={true}
          roomCode={roomCode}
          onRestart={() => {
            setGameEnded(false);
            setSessionStarted(false);
            setCurrentQIndex(0);
            setRevealed(false);
            setShowLeaderboard(false);
            sfx.click();
          }}
        />
      </Shell>
    );
  }

  // Pre-Game Classroom Lobby Projection
  if (!sessionStarted) {
    return (
      <Shell hideBrandTag>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={16} color="var(--accent-purple)" />
              <span>Host: <strong>{user?.email || 'Classroom Presenter (Smartboard Mode)'}</strong></span>
            </div>
            <button onClick={handleLogout} className="tactile-btn btn-surface" style={{ padding: '6px 12px', fontSize: '12px' }}>
              <LogOut size={13} /> Logout
            </button>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 5.5vw, 36px)', fontWeight: 900, marginBottom: '16px' }}>
            Join Classroom Quiz on Your Phone
          </h1>

          {/* Big Classroom PIN Display */}
          <div className="pin-display-card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: 'var(--accent-purple)' }}>
              GAME PIN
            </div>
            <div
              className="pin-display-number"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(34px, 9vw, 64px)',
                fontWeight: 900,
                letterSpacing: 'clamp(0.04em, 1.8vw, 0.14em)',
                color: '#fff',
                margin: '6px 0',
                whiteSpace: 'nowrap',
              }}
            >
              {roomCode.slice(0, 3)} {roomCode.slice(3)}
            </div>
          </div>

          <div
            className="solid-card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '20px 0',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
              <Users size={22} color="var(--accent-purple)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '17px', fontWeight: 800 }}>{players.length} Students Connected</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Classroom Session Active • {customQuestions.length} Questions</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="tactile-btn btn-surface btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Edit3 size={18} /> Manage Questions ({customQuestions.length})
              </button>

              <button
                onClick={handleStartSession}
                disabled={players.length === 0}
                className="tactile-btn btn-pink btn-lg"
                style={{ minWidth: '180px' }}
              >
                <Play size={18} /> Start Quiz Round
              </button>
            </div>
          </div>

          {/* Roster */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
            {players.map((p) => (
              <div key={p.id} className="solid-card" style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-surface-elevated)' }}>
                <AvatarDisplay avatar={p.avatar} size={48} />
                <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                  {p.name}
                </div>
              </div>
            ))}
          </div>

          {/* Question Manager Modal */}
          {isEditorOpen && (
            <HostQuestionEditor
              questions={customQuestions}
              onSaveQuestions={(newQList) => {
                setCustomQuestions(newQList);
                try {
                  localStorage.setItem('blankspace_custom_questions', JSON.stringify(newQList));
                } catch {}
                localSync.registerRoom({
                  code: roomCode,
                  title: 'Blankspace Orientation Classroom Quiz',
                  questionsCount: newQList.length,
                });
                quizClient.send('CREATE_ROOM', {
                  code: roomCode,
                  title: 'Blankspace Orientation Classroom Quiz',
                  questions: newQList,
                  hostEmail: user?.email || 'Presenter',
                });
              }}
              onClose={() => setIsEditorOpen(false)}
            />
          )}
        </div>
      </Shell>
    );
  }

  // Active Question Round Display on Projector
  return (
    <Shell hideBrandTag arenaTheme>
      <div style={{ maxWidth: '1080px', margin: '0 auto', position: 'relative' }}>
        {/* 3-2-1 Ready Countdown Overlay */}
        {readyCountdown !== null && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              background: 'rgba(12, 13, 18, 0.92)',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 800, color: 'var(--accent-purple)', marginBottom: '10px' }}>
              GET READY!
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '96px',
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {readyCountdown}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '12px' }}>
              Round starting on student devices...
            </div>
          </div>
        )}

        <div
          className="solid-card"
          style={{
            padding: '30px 26px',
            marginBottom: '20px',
            background: 'rgba(12, 13, 18, 0.72)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Header Bar: Badge, Countdown, and Host Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="brand-badge">
                QUESTION {currentQIndex + 1} OF {customQuestions.length}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                PIN #{roomCode}
              </span>
            </div>

            <CircularCountdown remaining={remaining} total={currentQ.timeLimit} size={76} />

            <div style={{ display: 'flex', gap: '8px' }}>
              {!revealed ? (
                <button onClick={handleRevealRound} className="tactile-btn btn-surface" style={{ padding: '8px 18px', fontSize: '13px' }}>
                  Reveal Results
                </button>
              ) : !showLeaderboard ? (
                <button onClick={handleShowLeaderboard} className="tactile-btn btn-purple" style={{ padding: '8px 20px', fontSize: '13px' }}>
                  Leaderboard <ArrowRight size={14} />
                </button>
              ) : (
                <button onClick={handleNextRound} className="tactile-btn btn-purple" style={{ padding: '8px 20px', fontSize: '13px' }}>
                  {currentQIndex === customQuestions.length - 1 ? 'Show Final Podium' : 'Next Question'} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Big Projector Question Display or Kahoot Leaderboard */}
          {showLeaderboard ? (
            <div className="kahoot-leaderboard-card" style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 900, color: 'var(--accent-purple)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    ROUND {currentQIndex + 1} STANDINGS
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 900, marginTop: '4px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    Classroom Leaderboard 🚀
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="brand-badge" style={{ background: '#181b26', color: '#fff', border: '2px solid #2d3345', boxShadow: '0 3px 0 #08090d', fontSize: '13px', padding: '6px 14px' }}>
                    {players.length} {players.length === 1 ? 'Player' : 'Players'} Competing
                  </span>
                </div>
              </div>

              {/* Animated Vertical Rank Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {sortedPlayers.slice(0, 5).map((p, rankIdx) => (
                  <div
                    key={p.id}
                    className={`kahoot-row-bar ${rankIdx === 0 ? 'top-1' : rankIdx === 1 ? 'top-2' : rankIdx === 2 ? 'top-3' : ''}`}
                    style={{ animationDelay: `${rankIdx * 0.1}s` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className="kahoot-rank-number">
                        #{rankIdx + 1}
                      </span>
                      <AvatarDisplay avatar={p.avatar} size={48} />
                      <div>
                        <div className="kahoot-player-title" style={{ fontSize: '20px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {p.name}
                          {p.streak >= 2 && (
                            <span className="score-badge-pill">
                              🔥 {p.streak} STREAK
                            </span>
                          )}
                        </div>
                        <div className="kahoot-status-sub" style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px', opacity: 0.9 }}>
                          {p.answered ? (p.selectedAnswer === currentQ.correctAnswer ? '✓ Correct Answer' : '✗ Incorrect') : 'No Response'}
                        </div>
                      </div>
                    </div>

                    <div className="kahoot-score-counter">
                      <span>{p.score.toLocaleString()}</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.85 }}>pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Big Projector Question Display */}
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: (currentQ.image || currentQ.mediaUrl) ? '20px' : '28px 20px', textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, lineHeight: 1.25, marginBottom: (currentQ.image || currentQ.mediaUrl) ? '16px' : '0' }}>
                  {currentQ.text}
                </h2>
                {(currentQ.image || currentQ.mediaUrl) && (
                  <div
                    style={{
                      maxWidth: '560px',
                      maxHeight: '280px',
                      margin: '0 auto',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: '2px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                      background: '#0a0b10',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={currentQ.image || currentQ.mediaUrl}
                      alt="Question visual"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '280px',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Live Responses Velocity Bar */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  <span>
                    Answers Submitted: <strong style={{ color: '#fff', fontSize: '18px' }}>{answeredCount}</strong> / {players.length}
                  </span>
                  <span>&bull;</span>
                  <span>
                    Velocity: <strong style={{ color: 'var(--accent-purple)' }}>{players.length ? Math.round((answeredCount / players.length) * 100) : 0}%</strong>
                  </span>
                </div>
                <div style={{ height: '10px', background: 'var(--bg-input)', borderRadius: '999px', maxWidth: '440px', margin: '10px auto', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: answeredCount === players.length && players.length > 0 ? '#26890c' : 'var(--accent-purple)',
                      width: `${players.length ? (answeredCount / players.length) * 100 : 0}%`,
                      transition: 'width 0.25s ease',
                    }}
                  />
                </div>
              </div>

              {/* 4 Solid Kahoot Options on Presenter Screen */}
              <div className="kahoot-grid">
                {currentQ.options.map((opt, oIdx) => {
                  const conf = KAHOOT_SOLID_OPTIONS[oIdx];
                  const isCorrect = currentQ.correctAnswer === oIdx;
                  const Icon = conf.Icon;

                  let stateClass = '';
                  if (revealed) {
                    stateClass = isCorrect ? 'revealed-correct' : 'revealed-dim';
                  }

                  return (
                    <div key={oIdx} className={`kahoot-choice-btn ${conf.colorClass} ${stateClass}`} style={{ cursor: 'default', minHeight: '94px' }}>
                      <div className="kahoot-shape-icon">
                        <Icon size={22} fill="#fff" stroke="#fff" />
                      </div>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {revealed && isCorrect && <CheckCircle2 size={26} color="#fff" />}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Live Classroom Leaderboard Stats Bar (Only when answering questions, hidden during full Leaderboard stage) */}
        {!showLeaderboard && (
          <div className="solid-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
                CURRENT CLASSROOM LEADERBOARD TOP 5
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {players.length} Total Players
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {sortedPlayers.slice(0, 5).map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: idx === 0 ? '#f59e0b' : 'var(--text-secondary)' }}>
                    #{idx + 1}
                  </span>
                  <AvatarDisplay avatar={p.avatar} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontWeight: 700 }}>
                      {p.score} pts {p.answered ? '• ✓ locked' : ''}
                    </div>
                  </div>
                </div>
              ))}
              {sortedPlayers.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Waiting for students to join...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

// ==========================================
// ROOT APP
// ==========================================
export default function App() {
  const [sessionRoomCode, setSessionRoomCode] = useState(() => {
    // Check if URL has a ?pin= query or generate deterministic classroom session PIN
    const params = new URLSearchParams(window.location.search);
    return params.get('pin') || String(Math.floor(100000 + Math.random() * 900000));
  });

  const [studentJoinedCode, setStudentJoinedCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<{
    text: string;
    options: string[];
    timeLimit: number;
    image?: string;
    mediaUrl?: string;
    multiplier?: number;
  } | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(4);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>();
  const [revealed, setRevealed] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<number | undefined>();
  const [studentCountdown, setStudentCountdown] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Connect client to WebSocket server
  useEffect(() => {
    quizClient.connect();

    const unsubRoster = quizClient.on('ROSTER_UPDATE', (data: any) => {
      if (data?.players) setPlayers(data.players);
    });

    const unsubProgress = quizClient.on('ANSWER_PROGRESS', (data: any) => {
      // Real-time answer counter sync
      if (data?.players) setPlayers(data.players);
    });

    const unsubQStart = (data: any) => {
      setActiveQuestion({
        text: data.text,
        options: data.options,
        timeLimit: data.timeLimit,
        image: data.image || data.mediaUrl,
        mediaUrl: data.mediaUrl || data.image,
        multiplier: data.multiplier,
      });
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.totalQuestions);
      setSelectedAnswer(undefined);
      setRevealed(false);
      setCorrectAnswer(undefined);

      // Start 3-second countdown before options unlock so options are hidden during countdown
      setStudentCountdown(3);
      const timer = setInterval(() => {
        setStudentCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 900);

      // Only navigate to the player gamepad if the current view is NOT the host presentation screen
      if (!window.location.pathname.includes('/host')) {
        navigate('/play');
      }
    };
    const unsubQStartListener = quizClient.on('QUESTION_START', unsubQStart);

    const unsubReveal = quizClient.on('ROUND_REVEALED', (data: any) => {
      setRevealed(true);
      setStudentCountdown(null);
      setCorrectAnswer(data.correctAnswer);
      if (data.players) setPlayers(data.players);
    });

    const unsubOver = quizClient.on('GAME_OVER', (data: any) => {
      if (data.standings) setPlayers(data.standings);
      if (!window.location.pathname.includes('/host')) {
        navigate('/standings');
      }
    });

    const unsubError = quizClient.on('ERROR', (data: any) => {
      if (data?.message) {
        sfx.wrong();
        setStudentJoinedCode('');
        navigate('/', { replace: true });
      }
    });

    return () => {
      unsubRoster();
      unsubProgress();
      unsubQStartListener();
      unsubReveal();
      unsubOver();
      unsubError();
    };
  }, [navigate]);

  const [studentPlayerId, setStudentPlayerId] = useState(() => {
    return localStorage.getItem('blankspace_player_id') || `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  });

  const handleStudentPick = (avatarString: string, playerName: string) => {
    const pId = studentPlayerId || `s-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setStudentPlayerId(pId);
    localStorage.setItem('blankspace_player_id', pId);

    quizClient.send('JOIN_ROOM', {
      code: studentJoinedCode,
      playerId: pId,
      name: playerName,
      avatar: avatarString,
    });
  };

  const handleStudentAnswer = (optionIdx: number) => {
    sfx.lockAnswer();
    setSelectedAnswer(optionIdx);
    quizClient.send('SUBMIT_ANSWER', {
      code: studentJoinedCode,
      playerId: studentPlayerId,
      optionIndex: optionIdx,
      remainingTime: 12,
    });
  };

  return (
    <Routes>
      {/* 1. Normal Student Route: Direct PIN Entry */}
      <Route path="/" element={<StudentPINEnter onJoinSuccess={setStudentJoinedCode} />} />
      <Route
        path="/character"
        element={
          studentJoinedCode ? (
            <StudentCharacterPick roomCode={studentJoinedCode} onPick={handleStudentPick} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/lobby"
        element={
          studentJoinedCode ? (
            <StudentLobby roomCode={studentJoinedCode} players={players} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/play"
        element={
          <StudentGamepad
            roomCode={studentJoinedCode}
            currentQuestion={activeQuestion}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            onAnswer={handleStudentAnswer}
            selectedAnswer={selectedAnswer}
            revealed={revealed}
            correctAnswer={correctAnswer}
            countdown={studentCountdown}
          />
        }
      />
      <Route
        path="/standings"
        element={
          <Shell hideBrandTag podiumTheme>
            <PodiumCeremony
              players={players}
              isHost={false}
              myPlayerId={studentPlayerId}
              roomCode={studentJoinedCode || ''}
            />
            <div style={{ position: 'fixed', bottom: 12, left: 0, right: 0, zIndex: 60, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ pointerEvents: 'auto' }}>
                <ReactionPicker roomCode={studentJoinedCode || ''} />
              </div>
            </div>
          </Shell>
        }
      />

      {/* 2. Hidden Presenter Screen for Classrooms (Protected by Google Login & Host Email Whitelist) */}
      <Route
        path="/host"
        element={
          <HostPresenterScreen
            roomCode={sessionRoomCode}
            questions={blankspaceMasterQuestions}
            players={players}
            setPlayers={setPlayers}
          />
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
