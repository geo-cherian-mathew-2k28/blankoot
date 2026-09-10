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

  // 1. Check Local / Shared Active Sessions (Instant 0ms lookup across tabs & windows)
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

  // 2. Check WebSocket Server if connected (Zero HTTP proxy overhead, zero 502s)
  if (quizClient.isConnected) {
    try {
      const wsResult = await new Promise<PinValidationResponse>((resolve) => {
        const timeout = setTimeout(() => {
          unsub();
          resolve({
            valid: false,
            message: "We didn't find a game with that PIN. Please check the main screen and try again.",
          });
        }, 1200);

        const unsub = quizClient.on('PIN_VALIDATION_RESULT', (payload: any) => {
          if (payload?.code === cleaned) {
            clearTimeout(timeout);
            unsub();
            if (payload.valid) {
              if (payload.status === 'ended') {
                resolve({
                  valid: false,
                  message: 'This game session has already ended.',
                });
              } else {
                resolve({
                  valid: true,
                  code: cleaned,
                  title: payload.title,
                  status: payload.status,
                });
              }
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

  // 3. Not found in any active session store
  return {
    valid: false,
    message: "We didn't find a game with that PIN. Please check the main screen and try again.",
  };
}
