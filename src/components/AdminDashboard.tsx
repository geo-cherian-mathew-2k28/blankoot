import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Edit3,
  Copy,
  Check,
  LogOut,
  Save,
  Radio,
  Layers,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { isSuperAdmin } from '../lib/authConfig';
import {
  fetchRemoteQuizConfig,
  saveRemoteQuizConfig,
  subscribeToQuizConfig,
  getLocalPasskey,
  getLocalQuestions,
} from '../lib/quizConfigSync';
import { Question } from '../App';
import { HostQuestionEditor } from './HostQuestionEditor';
import { Shell } from './Shell';
import { quizClient } from '../utils/socketClient';
import { sfx } from '../utils/sfx';

export function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  // Admin Config State
  const [hostPasskey, setHostPasskey] = useState<string>(getLocalPasskey());
  const [passkeySaved, setPasskeySaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Question Deck State
  const [questions, setQuestions] = useState<Question[]>(getLocalQuestions());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Monitor Google Authentication
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Sync with Firestore & Server Config on mount and listen in real-time
  useEffect(() => {
    // Initial fetch
    fetchRemoteQuizConfig().then((config) => {
      if (config.hostPasskey) setHostPasskey(config.hostPasskey);
      if (Array.isArray(config.questions) && config.questions.length > 0) {
        setQuestions(config.questions);
      }
    });

    // Real-time Firestore subscription
    const unsubFirestore = subscribeToQuizConfig((config) => {
      if (config.hostPasskey) setHostPasskey(config.hostPasskey);
      if (Array.isArray(config.questions) && config.questions.length > 0) {
        setQuestions(config.questions);
      }
    });

    // WebSocket sync
    quizClient.connect();
    const unsubConfig = quizClient.on('QUIZ_CONFIG_DATA', (data: any) => {
      if (data?.hostPasskey) setHostPasskey(data.hostPasskey);
      if (Array.isArray(data?.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    });

    const unsubUpdated = quizClient.on('CONFIG_UPDATED', (data: any) => {
      if (data?.hostPasskey) setHostPasskey(data.hostPasskey);
      if (Array.isArray(data?.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    });

    quizClient.send('GET_QUIZ_CONFIG', {});

    return () => {
      unsubFirestore();
      unsubConfig();
      unsubUpdated();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      setUnauthorizedDomain(null);
      const result = await signInWithPopup(auth, googleProvider);
      if (!isSuperAdmin(result.user.email)) {
        await signOut(auth);
        setAuthError(`Access Denied: ${result.user.email || 'This account'} is not in the Super Admin authorized list.`);
      }
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setUnauthorizedDomain(window.location.hostname);
        setAuthError(`Domain "${window.location.hostname}" is not yet added to Firebase Console Authorized Domains.`);
      } else {
        setAuthError(err?.message || 'Login failed.');
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleSavePasskey = async () => {
    const cleanKey = hostPasskey.trim().toUpperCase();
    if (!cleanKey) return;

    setHostPasskey(cleanKey);

    // Save to Firestore, localStorage, and REST API
    await saveRemoteQuizConfig(cleanKey, questions, user?.email || 'geocherianmathew@gmail.com');

    // Broadcast via WebSocket
    quizClient.send('ADMIN_UPDATE_CONFIG', {
      hostPasskey: cleanKey,
      adminEmail: user?.email || 'geocherianmathew@gmail.com',
    });

    sfx.correct();
    setPasskeySaved(true);
    setStatusMessage(`Smartboard Passkey updated to "${cleanKey}". All classroom smartboards synchronized!`);
    setTimeout(() => {
      setPasskeySaved(false);
      setStatusMessage('');
    }, 4000);
  };

  const handleCopyPasskey = () => {
    navigator.clipboard.writeText(hostPasskey);
    sfx.tick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDomain = () => {
    if (unauthorizedDomain) {
      navigator.clipboard.writeText(unauthorizedDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const handleSaveQuestions = async (newQList: Question[]) => {
    setQuestions(newQList);

    // Save to Firestore, localStorage, and REST API
    await saveRemoteQuizConfig(hostPasskey, newQList, user?.email || 'geocherianmathew@gmail.com');

    // Broadcast via WebSocket
    quizClient.send('ADMIN_UPDATE_CONFIG', {
      questions: newQList,
      adminEmail: user?.email || 'geocherianmathew@gmail.com',
    });

    sfx.podiumFanfare();
    setStatusMessage(`Successfully published ${newQList.length} questions to all classroom smartboards via Cloud Firestore!`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  if (authLoading) {
    return (
      <Shell hideBrandTag>
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <div className="brand-badge">AUTHENTICATING SUPER ADMIN...</div>
        </div>
      </Shell>
    );
  }

  // Super Admin Login Guard (Strictly Google OAuth for geocherianmathew@gmail.com)
  const isSuperAdminAuthed = Boolean(user && isSuperAdmin(user.email));

  if (!isSuperAdminAuthed) {
    return (
      <Shell hideBrandTag>
        <div
          className="solid-card"
          style={{
            maxWidth: '480px',
            margin: '50px auto 0',
            padding: '38px 28px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '2px solid var(--accent-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ShieldCheck size={30} color="var(--accent-purple)" />
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 900, marginBottom: '6px' }}>
            Super Admin Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.5 }}>
            Restricted to Super Admin (<strong>geocherianmathew@gmail.com</strong>). Manage quiz questions and dynamic smartboard passkeys.
          </p>

          {authError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#4c0519',
                border: '1px solid #9f1239',
                color: '#fecdd3',
                fontSize: '12px',
                marginBottom: '20px',
                fontWeight: 600,
                textAlign: 'left',
                lineHeight: 1.45,
              }}
            >
              {authError}
            </div>
          )}

          {unauthorizedDomain && (
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c4b5fd', fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>
                <Globe size={16} /> Firebase Whitelist Setup Required:
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
                To enable Google Login on this domain, add it to your Firebase Console:
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px' }}>
                <code style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#fff' }}>
                  {unauthorizedDomain}
                </code>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  style={{
                    background: 'var(--accent-purple)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {copiedDomain ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <li>Open <strong>Firebase Console</strong> &gt; project <code>blankoot-4ae7c</code>.</li>
                <li>Go to <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized domains</strong>.</li>
                <li>Click <strong>Add domain</strong> and paste <code>{unauthorizedDomain}</code>.</li>
              </ol>
            </div>
          )}

          {/* Super Admin Google Sign-In */}
          <button
            onClick={handleGoogleLogin}
            className="tactile-btn btn-white"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <ShieldCheck size={20} color="var(--accent-purple)" />
            Sign in with Super Admin Google Account
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell hideBrandTag>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Admin Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontWeight: 800 }}>
              <ShieldCheck size={16} /> SUPER ADMIN CONTROL ROOM
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, marginTop: '2px' }}>
              Quiz & Smartboard Command
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Logged in as: <strong style={{ color: '#fff' }}>{user?.email || 'Super Admin'}</strong>
            </div>
            <button onClick={handleLogout} className="tactile-btn btn-surface" style={{ padding: '8px 14px', fontSize: '12px' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(38, 137, 12, 0.2)',
              border: '2px solid #26890c',
              color: '#86efac',
              fontSize: '14px',
              fontWeight: 700,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Check size={18} /> {statusMessage}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          {/* Card 1: Dynamic Smartboard Host Passkey Controller */}
          <div className="solid-card" style={{ padding: '24px', background: 'var(--bg-surface-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid var(--accent-purple)' }}>
                <KeyRound size={20} color="var(--accent-purple)" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Smartboard Host Passkey</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Classrooms unlock /host with this active passkey</p>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                CURRENT ACTIVE PASSKEY (SYNCED TO CLOUD)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={hostPasskey}
                  onChange={(e) => setHostPasskey(e.target.value.toUpperCase())}
                  placeholder="e.g. BLANK2026"
                  style={{
                    flex: 1,
                    background: 'var(--bg-input)',
                    border: '2px solid var(--border-medium)',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '18px',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    color: '#fff',
                    padding: '10px 14px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSavePasskey}
                  className="tactile-btn btn-pink"
                  style={{ padding: '0 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={14} /> {passkeySaved ? 'Saved!' : 'Save & Sync'}
                </button>
              </div>
            </div>

            {/* Quick Presets & 1-Click Copy */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['BLANK2026', 'ORIENTATION', 'HOST2026'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setHostPasskey(preset);
                      sfx.click();
                    }}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyPasskey}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? '#4ade80' : 'var(--accent-purple)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy Passkey'}
              </button>
            </div>
          </div>

          {/* Card 2: Question Deck Overview */}
          <div className="solid-card" style={{ padding: '24px', background: 'var(--bg-surface-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid var(--accent-pink)' }}>
                <Layers size={20} color="var(--accent-pink)" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Master Question Deck</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Centralized quiz deck loaded by all smartboards</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {questions.length}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Active Questions in Deck
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>
                  ● Cloud Firestore Synced
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Live push to smartboards
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditorOpen(true)}
              className="tactile-btn btn-purple"
              style={{ width: '100%', padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Edit3 size={16} /> Open Master Question Studio ({questions.length})
            </button>
          </div>
        </div>

        {/* Classroom Smartboard Instruction Guide */}
        <div className="solid-card" style={{ padding: '24px', background: 'rgba(12, 13, 18, 0.6)' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="var(--accent-purple)" /> How Smartboard Presenters Host the Quiz:
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>1. Smartboard Opens /host</strong>
              Presenter visits <code style={{ color: 'var(--accent-purple)' }}>/host</code> on the classroom smartboard screen.
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>2. Enter Passkey: {hostPasskey}</strong>
              Presenter types the active passkey to unlock the host console (zero Google login required on smartboard).
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>3. Students Join with PIN</strong>
              The smartboard displays the 6-digit PIN and runs your {questions.length} published questions.
            </div>
          </div>
        </div>

        {/* Master Question Editor Modal */}
        {isEditorOpen && (
          <HostQuestionEditor
            questions={questions}
            onSaveQuestions={handleSaveQuestions}
            onClose={() => setIsEditorOpen(false)}
          />
        )}
      </div>
    </Shell>
  );
}
