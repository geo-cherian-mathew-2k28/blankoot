// Enterprise-grade Game PIN Validator for Multi-Device Session Guarding
import { quizClient } from './socketClient';
import { localSync } from './localSessionSync';

export interface PinValidationResponse {
  valid: boolean;
  message?: string;
  code?: string;
  title?: string;
  status?: string;
}

export async function validateGamePin(pin: string): Promise<PinValidationResponse> {
  const cleaned = pin.trim().replace(/\s/g, '');

  if (cleaned.length < 4) {
    return {
      valid: false,
      message: 'Please enter the 6-digit Game PIN shown on the main screen.',
    };
  }

  // 1. Check Local / Shared Active Sessions (Instant 0ms lookup)
  const localCheck = localSync.isRoomActive(cleaned);
  if (localCheck.active) {
    if (localCheck.status === 'ended') {
      return {
        valid: false,
        message: 'This game session has already ended.',
      };
    }
    return {
      valid: true,
      code: cleaned,
      title: localCheck.title,
      status: localCheck.status,
    };
  }

  // 2. Check HTTP REST Endpoint if WebSocket server is reachable
  try {
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:5173';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch(`${protocol}//${host}/validate-pin?pin=${cleaned}`, {
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.valid) {
        if (data.status === 'ended') {
          return {
            valid: false,
            message: 'This game session has already ended.',
          };
        }
        return {
          valid: true,
          code: cleaned,
          title: data.title,
          status: data.status,
        };
      } else {
        return {
          valid: false,
          message: "We didn't find a game with that PIN. Please check the main screen and try again.",
        };
      }
    }
  } catch {}

  // 3. Check WebSocket protocol if connected
  if (quizClient.isConnected) {
    try {
      const wsResult = await new Promise<PinValidationResponse>((resolve) => {
        const timeout = setTimeout(() => {
          unsub();
          resolve({
            valid: false,
            message: "We didn't find a game with that PIN. Please check the main screen and try again.",
          });
        }, 1500);

        const unsub = quizClient.on('PIN_VALIDATION_RESULT', (payload: any) => {
          if (payload?.code === cleaned) {
            clearTimeout(timeout);
            unsub();
            if (payload.valid) {
              resolve({
                valid: true,
                code: cleaned,
                title: payload.title,
                status: payload.status,
              });
            } else {
              resolve({
                valid: false,
                message: "We didn't find a game with that PIN. Please check the main screen and try again.",
              });
            }
          }
        });

        quizClient.send('VALIDATE_PIN', { code: cleaned });
      });

      if (wsResult.valid) return wsResult;
    } catch {}
  }

  // Final check: Not found in any active session store
  return {
    valid: false,
    message: "We didn't find a game with that PIN. Please check the main screen and try again.",
  };
}
