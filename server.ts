import { blankspaceMasterQuestions } from './src/data/quizQuestions';

interface PlayerSession {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  answered: boolean;
  selectedAnswer?: number;
  connected: boolean;
  disconnectTimeout?: any;
}

interface Room {
  code: string;
  hostWs: any;
  hostEmail?: string;
  title: string;
  status: 'lobby' | 'countdown' | 'in_question' | 'revealed' | 'ended';
  currentQuestionIndex: number;
  questions: any[];
  players: Map<string, PlayerSession>;
  questionStartedAt?: number;
  createdAt: number;
}

const rooms = new Map<string, Room>();
const port = Number(process.env.PORT) || 3001;

// Centralized Super Admin Configuration State
const globalQuizConfig = {
  hostPasskey: process.env.VITE_PRESENTER_PASSCODE || 'BLANK2026',
  questions: [...blankspaceMasterQuestions],
  adminEmail: 'geocherianmathew@gmail.com',
  updatedAt: Date.now(),
};

const server = Bun.serve<{ roomId?: string; isHost?: boolean; playerId?: string; isAdmin?: boolean }>({
  port,
  async fetch(req, server) {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      });
    }

    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req, {
        data: {
          roomId: url.searchParams.get('room') || undefined,
          isHost: url.searchParams.get('role') === 'host',
          isAdmin: url.searchParams.get('role') === 'admin',
          playerId: url.searchParams.get('playerId') || undefined,
        },
      });
      if (upgraded) return undefined;
    }

    if (url.pathname === '/api/quiz-config') {
      if (req.method === 'GET') {
        return new Response(JSON.stringify(globalQuizConfig), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (req.method === 'POST') {
        try {
          const body: any = await req.json();
          if (body.hostPasskey) globalQuizConfig.hostPasskey = String(body.hostPasskey).trim().toUpperCase();
          if (Array.isArray(body.questions) && body.questions.length > 0) globalQuizConfig.questions = body.questions;
          if (body.adminEmail) globalQuizConfig.adminEmail = body.adminEmail;
          globalQuizConfig.updatedAt = Date.now();

          server.publish(
            'admin:global',
            JSON.stringify({
              type: 'CONFIG_UPDATED',
              payload: globalQuizConfig,
            })
          );

          return new Response(JSON.stringify({ success: true, config: globalQuizConfig }), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err?.message || 'Invalid request' }), { status: 400 });
        }
      }
    }

    if (url.pathname === '/validate-pin') {
      const pin = url.searchParams.get('pin');
      const room = pin ? rooms.get(pin) : undefined;
      return new Response(
        JSON.stringify({
          valid: !!room,
          code: pin,
          title: room?.title,
          status: room?.status,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          uptime: process.uptime(),
          activeRooms: rooms.size,
          roomsSummary: Array.from(rooms.values()).map((r) => ({
            code: r.code,
            title: r.title,
            playersCount: r.players.size,
            status: r.status,
          })),
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        name: 'Blankspace Live Quiz Engine',
        version: '2.0.0',
        status: 'online',
        websocketEndpoint: `/ws`,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  },

  websocket: {
    maxPayloadLength: 32 * 1024 * 1024, // 32MB payload buffer for base64 visual questions and large decks
    open(ws) {
      ws.subscribe('admin:global');
    },

    message(ws, rawMessage) {
      try {
        const text = typeof rawMessage === 'string' ? rawMessage : new TextDecoder().decode(rawMessage);
        const msg = JSON.parse(text);
        const { type, payload } = msg;

        // 0. Heartbeat PING / PONG
        if (type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', payload: { timestamp: Date.now() } }));
          return;
        }

        // 0.5 Get Global Quiz Config
        if (type === 'GET_QUIZ_CONFIG') {
          ws.send(JSON.stringify({ type: 'QUIZ_CONFIG_DATA', payload: globalQuizConfig }));
          return;
        }

        // 0.6 Admin Updates Quiz Config (Passkey or Questions)
        if (type === 'ADMIN_UPDATE_CONFIG') {
          if (payload?.hostPasskey) globalQuizConfig.hostPasskey = String(payload.hostPasskey).trim().toUpperCase();
          if (Array.isArray(payload?.questions) && payload.questions.length > 0) globalQuizConfig.questions = payload.questions;
          if (payload?.adminEmail) globalQuizConfig.adminEmail = payload.adminEmail;
          globalQuizConfig.updatedAt = Date.now();

          server.publish(
            'admin:global',
            JSON.stringify({
              type: 'CONFIG_UPDATED',
              payload: globalQuizConfig,
            })
          );

          ws.send(JSON.stringify({ type: 'ADMIN_UPDATE_SUCCESS', payload: globalQuizConfig }));
          console.log(`[Admin Push] Passkey: ${globalQuizConfig.hostPasskey} | Deck: ${globalQuizConfig.questions.length} questions`);
          return;
        }

        // 1. Host creates / attaches to classroom room
        if (type === 'CREATE_ROOM') {
          const { code, questions, title, hostEmail } = payload;
          const activeQuestions = (Array.isArray(questions) && questions.length > 0) ? questions : globalQuizConfig.questions;
          let room = rooms.get(code);

          if (room) {
            room.hostWs = ws;
            room.hostEmail = hostEmail || room.hostEmail;
            room.title = title || room.title;
            if (activeQuestions && activeQuestions.length > 0) room.questions = activeQuestions;
          } else {
            room = {
              code,
              hostWs: ws,
              hostEmail,
              title: title || 'Blankspace Live Quiz',
              status: 'lobby',
              currentQuestionIndex: 0,
              questions: activeQuestions || [],
              players: new Map(),
              createdAt: Date.now(),
            };
            rooms.set(code, room);
          }

          ws.data.roomId = code;
          ws.data.isHost = true;
          ws.subscribe(`room:${code}`);

          ws.send(
            JSON.stringify({
              type: 'ROOM_CREATED',
              payload: {
                code,
                title: room.title,
                questionsCount: room.questions.length,
                playersCount: room.players.size,
              },
            })
          );
          console.log(`[Room Active] PIN: ${code} | Host: ${hostEmail || 'Admin'} | Questions: ${room.questions.length}`);
          return;
        }

        // 1.5 Quick PIN validation
        if (type === 'VALIDATE_PIN') {
          const { code } = payload;
          const room = rooms.get(code);
          ws.send(
            JSON.stringify({
              type: 'PIN_VALIDATION_RESULT',
              payload: {
                code,
                valid: !!room,
                title: room?.title,
                status: room?.status,
              },
            })
          );
          return;
        }

        // 2. Student joins / reconnects to classroom PIN
        if (type === 'JOIN_ROOM') {
          const { code, playerId, name, avatar } = payload;
          const room = rooms.get(code);

          if (!room) {
            ws.send(
              JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Game PIN not found. Make sure you entered the code shown on the screen.' },
              })
            );
            return;
          }

          let player = room.players.get(playerId);
          if (player) {
            // Reconnecting existing player
            if (player.disconnectTimeout) {
              clearTimeout(player.disconnectTimeout);
              player.disconnectTimeout = undefined;
            }
            player.connected = true;
            if (name) player.name = name;
            if (avatar) player.avatar = avatar;
          } else {
            // New player session
            player = {
              id: playerId,
              name: name || 'Player',
              avatar: avatar || '1:1:1:1:1:1:1',
              score: 0,
              streak: 0,
              answered: false,
              connected: true,
            };
            room.players.set(playerId, player);
          }

          ws.data.roomId = code;
          ws.data.playerId = playerId;
          ws.data.isHost = false;
          ws.subscribe(`room:${code}`);

          // Confirmation to player
          ws.send(
            JSON.stringify({
              type: 'JOINED_SUCCESS',
              payload: {
                code,
                status: room.status,
                currentQuestionIndex: room.currentQuestionIndex,
                player,
              },
            })
          );

          // Broadcast roster update
          const playerList = Array.from(room.players.values());
          server.publish(
            `room:${code}`,
            JSON.stringify({
              type: 'ROSTER_UPDATE',
              payload: { players: playerList, count: playerList.length },
            })
          );
          return;
        }

        // 3. Host starts question
        if (type === 'START_QUESTION') {
          const roomId = ws.data.roomId || payload?.code;
          const room = rooms.get(roomId || '');
          if (!room) return;

          const qIndex = payload?.questionIndex ?? room.currentQuestionIndex;
          room.currentQuestionIndex = qIndex;
          room.status = 'in_question';
          room.questionStartedAt = Date.now();

          // Reset round answers
          for (const p of room.players.values()) {
            p.answered = false;
            p.selectedAnswer = undefined;
          }

          const q = room.questions[qIndex];
          if (!q) return;

          // Broadcast question start to all students in room
          server.publish(
            `room:${room.code}`,
            JSON.stringify({
              type: 'QUESTION_START',
              payload: {
                questionIndex: qIndex,
                totalQuestions: room.questions.length,
                text: q.text,
                options: q.options,
                timeLimit: q.timeLimit || 20,
                multiplier: q.multiplier || 1,
                startedAt: room.questionStartedAt,
              },
            })
          );
          return;
        }

        // 4. Student submits answer with Millisecond Kahoot Scoring
        if (type === 'SUBMIT_ANSWER') {
          const roomId = ws.data.roomId || payload?.code;
          const playerId = ws.data.playerId || payload?.playerId;

          const room = rooms.get(roomId || '');
          if (!room) return;

          const player = room.players.get(playerId || '');
          if (!player || player.answered) return;

          const { optionIndex } = payload;
          const currentQ = room.questions[room.currentQuestionIndex];
          if (!currentQ) return;

          player.answered = true;
          player.selectedAnswer = optionIndex;

          const isCorrect = optionIndex === currentQ.correctAnswer;
          const now = Date.now();
          const qStart = room.questionStartedAt || (now - 5000);
          const responseTimeMs = Math.max(50, now - qStart);
          const timeLimitMs = (currentQ.timeLimit || 20) * 1000;
          const speedRatio = Math.max(0, Math.min(1, responseTimeMs / timeLimitMs));

          // Real Kahoot formula: max 1000 base pts scaled by speed (500 to 1000) + streak bonus (up to 500)
          const multiplier = currentQ.multiplier || 1;
          const basePoints = 1000 * multiplier;
          const speedPoints = Math.round((1 - speedRatio / 2) * basePoints);
          const streakBonus = Math.min(500, player.streak * 100);
          const pointsEarned = isCorrect ? (speedPoints + streakBonus) : 0;

          if (isCorrect) {
            player.score += pointsEarned;
            player.streak += 1;
          } else {
            player.streak = 0;
          }

          // Lock answer acknowledgment
          ws.send(
            JSON.stringify({
              type: 'ANSWER_LOCKED',
              payload: {
                optionIndex,
                pointsEarned,
                isCorrect,
                currentScore: player.score,
                streak: player.streak,
              },
            })
          );

          // Broadcast answer velocity to room & host
          const playerList = Array.from(room.players.values());
          const answeredCount = playerList.filter((p) => p.answered).length;
          server.publish(
            `room:${room.code}`,
            JSON.stringify({
              type: 'ANSWER_PROGRESS',
              payload: {
                answeredCount,
                totalPlayers: room.players.size,
                players: playerList,
              },
            })
          );
          return;
        }

        // 5. Host reveals results
        if (type === 'REVEAL_RESULTS') {
          const room = rooms.get(ws.data.roomId || '');
          if (!room || !ws.data.isHost) return;

          room.status = 'revealed';
          const currentQ = room.questions[room.currentQuestionIndex];
          const playerList = Array.from(room.players.values());

          server.publish(
            `room:${room.code}`,
            JSON.stringify({
              type: 'ROUND_REVEALED',
              payload: {
                correctAnswer: currentQ?.correctAnswer ?? 0,
                players: playerList,
              },
            })
          );
          return;
        }

        // 6. Host triggers final podium
        if (type === 'SHOW_FINAL_PODIUM') {
          const room = rooms.get(ws.data.roomId || '');
          if (!room || !ws.data.isHost) return;

          room.status = 'ended';
          const sorted = Array.from(room.players.values()).sort((a, b) => b.score - a.score);

          server.publish(
            `room:${room.code}`,
            JSON.stringify({
              type: 'GAME_OVER',
              payload: {
                standings: sorted,
              },
            })
          );
          return;
        }

        // 7. Live Emoji Reactions
        if (type === 'SEND_REACTION') {
          const roomId = ws.data.roomId || payload?.code;
          if (!roomId) return;

          const { emoji, senderName } = payload;
          server.publish(
            `room:${roomId}`,
            JSON.stringify({
              type: 'ROOM_REACTION',
              payload: {
                id: Math.random().toString(36).substring(2, 9),
                emoji,
                senderName: senderName || 'Player',
                timestamp: Date.now(),
              },
            })
          );
          return;
        }
      } catch (err) {
        console.error('WS Processing Error:', err);
      }
    },

    close(ws) {
      const { roomId, playerId, isHost } = ws.data;
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room) return;

      if (isHost) {
        server.publish(
          `room:${roomId}`,
          JSON.stringify({
            type: 'HOST_DISCONNECTED',
            payload: { message: 'The presenter has closed the session.' },
          })
        );
        rooms.delete(roomId);
        console.log(`[Session Ended] Room ${roomId}`);
      } else if (playerId) {
        const player = room.players.get(playerId);
        if (player) {
          player.connected = false;
          // 90s grace window before removing from lobby if game not started
          player.disconnectTimeout = setTimeout(() => {
            if (!player.connected && room.status === 'lobby') {
              room.players.delete(playerId);
              const playerList = Array.from(room.players.values());
              server.publish(
                `room:${roomId}`,
                JSON.stringify({
                  type: 'ROSTER_UPDATE',
                  payload: { players: playerList, count: playerList.length },
                })
              );
            }
          }, 90000);
        }
      }
    },
  },
});

console.log(`🚀 Blankspace Live Quiz Server running on port ${port} (ws://localhost:${port}/ws)`);
