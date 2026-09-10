// Enterprise-Grade Hybrid Real-Time Transport Client (WebSocket + Local Broadcast Sync)
import { localSync } from './localSessionSync';

export class QuizClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();
  public isConnected: boolean = false;
  private isConnecting: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 5;
  private retryTimeout: any = null;

  private messageQueue: Array<{ type: string; payload: any }> = [];

  private pingInterval: any = null;

  constructor() {
    // Listen to local BroadcastChannel fallback events
    if (typeof window !== 'undefined') {
      localSync.on('*', (data: any) => {
        if (data?.type) {
          this.emit(data.type, data.payload, false);
        }
      });
    }
  }

  connect(serverUrl?: string): Promise<boolean> {
    if (this.isConnected || this.isConnecting) {
      return Promise.resolve(this.isConnected);
    }

    this.isConnecting = true;

    return new Promise((resolve) => {
      // Priority 1: explicitly passed serverUrl
      // Priority 2: VITE_WS_URL environment variable
      // Priority 3: auto-detected domain / localhost
      const envWs = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_WS_URL as string) : undefined;
      const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = typeof window !== 'undefined' ? window.location.host : 'localhost:5173';
      const isTunnelOrDomain =
        typeof window !== 'undefined' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1' &&
        !window.location.hostname.startsWith('192.168.');

      const defaultHost = isTunnelOrDomain
        ? `${protocol}//${host}/ws`
        : `${protocol}//${window.location.hostname}:3001/ws`;

      const targetUrl = serverUrl || envWs || defaultHost;

      try {
        const socket = new WebSocket(targetUrl);
        this.ws = socket;

        const connectTimeout = setTimeout(() => {
          if (this.ws === socket && !this.isConnected) {
            this.isConnecting = false;
            try {
              socket.close();
            } catch {}
            resolve(false);
          }
        }, 3000);

        socket.onopen = () => {
          clearTimeout(connectTimeout);
          this.isConnected = true;
          this.isConnecting = false;
          this.retryCount = 0;
          this.emit('CONNECTED', true, false);

          // Start heartbeat ping every 15s to keep connections alive
          clearInterval(this.pingInterval);
          this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({ type: 'PING', payload: { timestamp: Date.now() } }));
            }
          }, 15000);

          // Flush pending queued packets
          while (this.messageQueue.length > 0) {
            const pending = this.messageQueue.shift();
            if (pending && socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(pending));
            }
          }
          resolve(true);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type) {
              if (data.type === 'PONG') return; // Heartbeat handled silently
              this.emit(data.type, data.payload, false);
            }
          } catch (e) {
            console.error('Failed to parse WS packet:', e);
          }
        };

        socket.onclose = () => {
          clearTimeout(connectTimeout);
          clearInterval(this.pingInterval);
          this.isConnected = false;
          this.isConnecting = false;
          this.emit('DISCONNECTED', false, false);

          // Exponential backoff retry (up to maxRetries)
          if (this.retryCount < this.maxRetries) {
            const delay = Math.min(15000, 1000 * Math.pow(1.5, this.retryCount));
            this.retryCount++;
            clearTimeout(this.retryTimeout);
            this.retryTimeout = setTimeout(() => {
              this.connect(serverUrl);
            }, delay);
          }
        };

        socket.onerror = () => {
          clearTimeout(connectTimeout);
          clearInterval(this.pingInterval);
          this.isConnecting = false;
          resolve(false);
        };
      } catch (err) {
        clearInterval(this.pingInterval);
        this.isConnecting = false;
        resolve(false);
      }
    });
  }

  send(type: string, payload: any) {
    // 1. Send via WebSocket if available
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type, payload }));
      } catch (e) {
        console.warn('WS send failed, queuing:', e);
        this.messageQueue.push({ type, payload });
      }
    } else {
      this.messageQueue.push({ type, payload });
    }

    // 2. Dual-broadcast via local sync bus for guaranteed zero-delay local handling
    localSync.broadcast(type, payload);
  }

  on(type: string, callback: (payload: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Also register on local sync bus
    const unsubLocal = localSync.on(type, callback);

    return () => {
      this.listeners.get(type)?.delete(callback);
      unsubLocal();
    };
  }

  private emit(type: string, payload: any, broadcastLocally: boolean = true) {
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (e) {
          console.error(`Error in event listener for ${type}:`, e);
        }
      });
    }

    if (broadcastLocally) {
      localSync.broadcast(type, payload);
    }
  }

  disconnect() {
    clearTimeout(this.retryTimeout);
    clearInterval(this.pingInterval);
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
  }
}

export const quizClient = new QuizClient();
