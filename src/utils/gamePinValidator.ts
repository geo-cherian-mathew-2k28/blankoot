// Enterprise-grade Game PIN Validator for Multi-Device Session Guarding
import { quizClient } from './socketClient';

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

  // 1. Primary Check: Fast HTTP REST Endpoint
  try {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.host;

    let res = await fetch(`${protocol}//${host}/validate-pin?pin=${cleaned}`);

    // If Vite development server has a separate backend port
    if (!res.ok && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      res = await fetch(`http://${window.location.hostname}:3001/validate-pin?pin=${cleaned}`);
    }

    if (res.ok) {
      const data = await res.json();
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
  } catch (httpErr) {
    console.warn('HTTP validation endpoint unreachable, attempting WebSocket verification...', httpErr);
  }

  // 2. Secondary Check: Real-time WebSocket verification if HTTP proxy fails
  try {
    if (!quizClient.isConnected) {
      await quizClient.connect();
    }

    const wsResult = await new Promise<PinValidationResponse>((resolve) => {
      const timeout = setTimeout(() => {
        unsub();
        resolve({
          valid: false,
          message: 'Cannot connect to the game server. Please ensure the host has started the session.',
        });
      }, 2500);

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

    return wsResult;
  } catch (wsErr) {
    console.error('WebSocket validation failed:', wsErr);
    return {
      valid: false,
      message: 'Cannot reach the live game server. Please make sure the host has started the quiz.',
    };
  }
}
