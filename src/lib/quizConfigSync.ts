import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Question } from '../App';
import { blankspaceMasterQuestions } from '../data/quizQuestions';

const QUIZ_CONFIG_DOC = 'quiz_config/main';
const STORAGE_PASSKEY_KEY = 'blankspace_dynamic_host_passkey';
const STORAGE_QUESTIONS_KEY = 'blankspace_custom_questions';

export interface QuizConfigData {
  hostPasskey: string;
  questions: Question[];
  updatedAt: number;
  updatedBy?: string;
}

export function getLocalPasskey(): string {
  try {
    return localStorage.getItem(STORAGE_PASSKEY_KEY) || 'BLANK2026';
  } catch {
    return 'BLANK2026';
  }
}

export function getLocalQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_QUESTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return blankspaceMasterQuestions;
}

export function saveLocalConfig(passkey: string, questions: Question[]): void {
  try {
    if (passkey) localStorage.setItem(STORAGE_PASSKEY_KEY, passkey.trim().toUpperCase());
    if (questions && questions.length > 0) {
      localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(questions));
    }
  } catch {}
}

/**
 * Fetch the latest quiz configuration from Firestore (with fallbacks to API & localStorage)
 */
export async function fetchRemoteQuizConfig(): Promise<QuizConfigData> {
  try {
    const configDocRef = doc(db, 'quiz_config', 'main');
    const snap = await getDoc(configDocRef);
    if (snap.exists()) {
      const data = snap.data() as QuizConfigData;
      if (data.hostPasskey) saveLocalConfig(data.hostPasskey, data.questions);
      return {
        hostPasskey: data.hostPasskey || getLocalPasskey(),
        questions: (Array.isArray(data.questions) && data.questions.length > 0) ? data.questions : getLocalQuestions(),
        updatedAt: data.updatedAt || Date.now(),
        updatedBy: data.updatedBy,
      };
    }
  } catch (err) {
    console.warn('[Firestore Sync] Using fallback config:', err);
  }

  // Fallback: try server endpoint
  try {
    const res = await fetch('/api/quiz-config');
    if (res.ok) {
      const data = await res.json();
      if (data.hostPasskey) saveLocalConfig(data.hostPasskey, data.questions);
      return {
        hostPasskey: data.hostPasskey || getLocalPasskey(),
        questions: (Array.isArray(data.questions) && data.questions.length > 0) ? data.questions : getLocalQuestions(),
        updatedAt: data.updatedAt || Date.now(),
      };
    }
  } catch {}

  return {
    hostPasskey: getLocalPasskey(),
    questions: getLocalQuestions(),
    updatedAt: Date.now(),
  };
}

/**
 * Save updated quiz configuration to Firestore, local storage, and server API
 */
export async function saveRemoteQuizConfig(
  passkey: string,
  questions: Question[],
  adminEmail: string
): Promise<void> {
  const cleanPasskey = passkey.trim().toUpperCase();
  const configData: QuizConfigData = {
    hostPasskey: cleanPasskey,
    questions,
    updatedAt: Date.now(),
    updatedBy: adminEmail,
  };

  saveLocalConfig(cleanPasskey, questions);

  // 1. Save to Firestore
  try {
    const configDocRef = doc(db, 'quiz_config', 'main');
    await setDoc(configDocRef, configData, { merge: true });
  } catch (err) {
    console.warn('[Firestore Sync] Could not write to Firestore:', err);
  }

  // 2. Save to backend REST API if available
  try {
    await fetch('/api/quiz-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostPasskey: cleanPasskey,
        questions,
        adminEmail,
      }),
    });
  } catch {}
}

/**
 * Subscribe to real-time configuration changes from Firestore
 */
export function subscribeToQuizConfig(
  onUpdate: (data: QuizConfigData) => void
): () => void {
  try {
    const configDocRef = doc(db, 'quiz_config', 'main');
    const unsubscribe = onSnapshot(
      configDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as QuizConfigData;
          saveLocalConfig(data.hostPasskey, data.questions);
          onUpdate({
            hostPasskey: data.hostPasskey || getLocalPasskey(),
            questions: (Array.isArray(data.questions) && data.questions.length > 0) ? data.questions : getLocalQuestions(),
            updatedAt: data.updatedAt || Date.now(),
            updatedBy: data.updatedBy,
          });
        }
      },
      (error) => {
        console.warn('[Firestore Sync] Realtime listener error:', error);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
}
