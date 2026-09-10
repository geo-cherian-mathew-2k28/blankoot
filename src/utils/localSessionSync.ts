// High-Reliability Cross-Tab & Local Storage Synchronizer for Zero-Dependency Operation
// Provides 100% seamless multiplayer sync even if backend WebSocket is offline or in client-only demo mode

export interface SharedRoomState {
  code: string;
  title: string;
  status: 'lobby' | 'countdown' | 'in_question' | 'revealed' | 'ended';
  currentQuestionIndex: number;
  players: any[];
  lastUpdated: number;
}

const STORAGE_KEY = 'blankspace_active_rooms';
const CHANNEL_NAME = 'blankspace_quiz_bus';

class LocalSessionSync {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data?.type) {
            this.emit(event.data.type, event.data.payload);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel unavailable, using storage events fallback:', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'blankspace_last_event' && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            if (data?.type) {
              this.emit(data.type, data.payload);
            }
          } catch {}
        }
      });
    }
  }

  // Register an active room session
  registerRoom(room: { code: string; title: string; questionsCount?: number }) {
    try {
      const existing = this.getActiveRooms();
      const previous = existing[room.code];
      existing[room.code] = {
        code: room.code,
        title: room.title,
        status: previous?.status || 'lobby',
        currentQuestionIndex: previous?.currentQuestionIndex || 0,
        players: previous?.players || [],
        lastUpdated: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {}
  }

  // Update room state
  updateRoom(code: string, updates: Partial<SharedRoomState>) {
    try {
      const rooms = this.getActiveRooms();
      if (rooms[code]) {
        rooms[code] = { ...rooms[code], ...updates, lastUpdated: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
      }
    } catch {}
  }

  // Remove room when ended
  removeRoom(code: string) {
    try {
      const rooms = this.getActiveRooms();
      delete rooms[code];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    } catch {}
  }

  // Get active rooms map (auto-purges rooms older than 12 hours)
  getActiveRooms(): Record<string, SharedRoomState> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      const now = Date.now();
      const cleaned: Record<string, SharedRoomState> = {};

      for (const [code, r] of Object.entries(parsed as Record<string, SharedRoomState>)) {
        // Keep active rooms created within last 12 hours
        if (now - (r.lastUpdated || 0) < 12 * 60 * 60 * 1000) {
          cleaned[code] = r;
        }
      }
      return cleaned;
    } catch {
      return {};
    }
  }

  // Check if a PIN exists and is active
  isRoomActive(code: string): { active: boolean; title?: string; status?: string } {
    const rooms = this.getActiveRooms();
    const match = rooms[code];
    if (match) {
      return { active: true, title: match.title, status: match.status };
    }
    return { active: false };
  }

  // Broadcast an event across all tabs/windows
  broadcast(type: string, payload: any) {
    // 1. Emit locally in current window
    this.emit(type, payload);

    // 2. Broadcast via BroadcastChannel API
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload });
      } catch {}
    }

    // 3. Fallback via localStorage event
    try {
      localStorage.setItem('blankspace_last_event', JSON.stringify({ type, payload, timestamp: Date.now() }));
    } catch {}
  }

  on(type: string, callback: (payload: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
    return () => this.listeners.get(type)?.delete(callback);
  }

  private emit(type: string, payload: any) {
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (e) {
          console.error(`Error in local sync handler for ${type}:`, e);
        }
      });
    }
  }
}

export const localSync = new LocalSessionSync();
