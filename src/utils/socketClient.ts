// Client WebSocket Controller for real-time multi-device multiplayer
export class QuizClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(payload: any) => void>> = new Map();
  public isConnected: boolean = false;

  private messageQueue: Array<{ type: string; payload: any }> = [];

  connect(serverUrl?: string): Promise<void> {
    return new Promise((resolve) => {
      // Auto-detect host IP / localhost or custom WS_URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const isTunnelOrDomain = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && !window.location.hostname.startsWith('192.168.');
      const defaultHost = isTunnelOrDomain
        ? `${protocol}//${window.location.host}/ws`
        : `${protocol}//${window.location.hostname}:3001/ws`;
      const targetUrl = serverUrl || defaultHost;

      try {
        this.ws = new WebSocket(targetUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.emit('CONNECTED', true);
          // Flush pending queued packets
          while (this.messageQueue.length > 0) {
            const pending = this.messageQueue.shift();
            if (pending) {
              this.ws?.send(JSON.stringify(pending));
            }
          }
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type) {
              this.emit(data.type, data.payload);
            }
          } catch (e) {
            console.error('Failed to parse WS packet:', e);
          }
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.emit('DISCONNECTED', false);
          // Auto-reconnect after 1.5s
          setTimeout(() => {
            this.connect(serverUrl);
          }, 1500);
        };

        this.ws.onerror = (err) => {
          this.emit('ERROR', err);
          resolve();
        };
      } catch (err) {
        console.error('WS connection failed:', err);
        resolve();
      }
    });
  }

  send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      // Buffer if socket is connecting
      this.messageQueue.push({ type, payload });
    }
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
      handlers.forEach((fn) => fn(payload));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const quizClient = new QuizClient();
