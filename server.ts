// Ultra-fast, zero-dependency Bun native WebSocket Multi-Session Quiz Server
// Handles multiple parallel classes (e.g. Class A, Class B) isolated by 6-digit room PINs.
// Each room has isolated roster, scoring, and question lifecycle.

interface PlayerSession {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  answered: boolean;
  selectedAnswer?: number;
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
  startedAt?: number;
}

// Stores all active rooms across classes: Map<roomCode, Room>
const rooms = new Map<string, Room>();

const port = Number(process.env.PORT) || 3001;

const server = Bun.serve<{ roomId?: string; isHost?: boolean; playerId?: string }>({
  port,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req, {
        data: {
          roomId: url.searchParams.get('room') || undefined,
          isHost: url.searchParams.get('role') === 'host',
          playerId: url.searchParams.get('playerId') || undefined,
        },
      });
      if (upgraded) return undefined;
    }
    if (url.pathname === '/validate-pin') {
      const pin = url.searchParams.get('pin');
      const room = pin ? rooms.get(pin) : undefined;
      return new Response(JSON.stringify({
        valid: !!room,
        code: pin,
        title: room?.title,
        status: room?.status,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        activeRooms: rooms.size,
        roomsSummary: Array.from(rooms.values()).map(r => ({
          code: r.code,
          title: r.title,
          playersCount: r.players.size,
          status: r.status,
        })),
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    return new Response('Blankspace Live Quiz WebSocket Server is Running.', {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  },

  websocket: {
    open(ws) {
      // Socket connected
    },

    message(ws, rawMessage) {
      try {
        const msg = JSON.parse(typeof rawMessage === 'string' ? rawMessage : new TextDecoder().decode(rawMessage));
        const { type, payload } = msg;

        // 1. Host creates isolated classroom session
        if (type === 'CREATE_ROOM') {
          const { code, questions, title, hostEmail } = payload;
          const room: Room = {
            code,
            hostWs: ws,
            hostEmail,
            title: title || 'Blankspace Live Quiz',
            status: 'lobby',
            currentQuestionIndex: 0,
            questions: questions || [],
            players: new Map(),
          };
          rooms.set(code, room);
          ws.data.roomId = code;
          ws.data.isHost = true;
          ws.subscribe(`room:${code}`);

          ws.send(JSON.stringify({
            type: 'ROOM_CREATED',
            payload: { code, title: room.title, questionsCount: room.questions.length },
          }));
          console.log(`[New Isolated Session Created] PIN: ${code} | Host: ${hostEmail || 'Unknown'} | Active Sessions: ${rooms.size}`);
          return;
        }

        // 1.5 Validate PIN before joining
        if (type === 'VALIDATE_PIN') {
          const { code } = payload;
          const room = rooms.get(code);
          ws.send(JSON.stringify({
            type: 'PIN_VALIDATION_RESULT',
            payload: {
              code,
              valid: !!room,
              title: room?.title,
              status: room?.status,
            },
          }));
          return;
        }

        // 2. Student joins room using specific classroom PIN
        if (type === 'JOIN_ROOM') {
          const { code, playerId, name, avatar } = payload;
          const room = rooms.get(code);

          if (!room) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: 'Session PIN not found. Make sure you entered the code shown on your classroom screen.' }
            }));
            return;
          }

          const player: PlayerSession = {
            id: playerId,
            name,
            avatar,
            score: 0,
            streak: 0,
            answered: false,
          };

          room.players.set(playerId, player);
          ws.data.roomId = code;
          ws.data.playerId = playerId;
          ws.data.isHost = false;
          ws.subscribe(`room:${code}`);

          // Acknowledge to joining player
          ws.send(JSON.stringify({
            type: 'JOINED_SUCCESS',
            payload: {
              code,
              status: room.status,
              currentQuestionIndex: room.currentQuestionIndex,
              player,
            },
          }));

          // Broadcast roster update ONLY to this specific classroom room channel
          const playerList = Array.from(room.players.values());
          server.publish(`room:${code}`, JSON.stringify({
            type: 'ROSTER_UPDATE',
            payload: { players: playerList, count: playerList.length },
          }));
          return;
        }

        // 3. Host starts question
        if (type === 'START_QUESTION') {
          const room = rooms.get(ws.data.roomId || '');
          if (!room || !ws.data.isHost) return;

          const qIndex = payload?.questionIndex ?? room.currentQuestionIndex;
          room.currentQuestionIndex = qIndex;
          room.status = 'in_question';

          // Reset round answers for all students in this room
          for (const p of room.players.values()) {
            p.answered = false;
            p.selectedAnswer = undefined;
          }

          const q = room.questions[qIndex];
          if (!q) return;

          // Broadcast question to students in this session ONLY (without revealing answer index)
          server.publish(`room:${room.code}`, JSON.stringify({
            type: 'QUESTION_START',
            payload: {
              questionIndex: qIndex,
              totalQuestions: room.questions.length,
              text: q.text,
              options: q.options,
              timeLimit: q.timeLimit,
            },
          }));
          return;
        }

        // 4. Student submits answer
        if (type === 'SUBMIT_ANSWER') {
          const roomId = ws.data.roomId || payload?.code;
          const playerId = ws.data.playerId || payload?.playerId;

          const room = rooms.get(roomId || '');
          if (!room) {
            console.warn(`[SUBMIT_ANSWER Failed] Room not found: ${roomId}`);
            return;
          }

          // Ensure student is subscribed to room channel
          if (roomId) {
            ws.data.roomId = roomId;
            ws.data.playerId = playerId;
            ws.subscribe(`room:${roomId}`);
          }

          const player = room.players.get(playerId || '');
          if (!player) {
            console.warn(`[SUBMIT_ANSWER Failed] Player ${playerId} not in room ${roomId}`);
            return;
          }

          if (player.answered) return;

          const { optionIndex, remainingTime } = payload;
          const currentQ = room.questions[room.currentQuestionIndex];
          if (!currentQ) return;

          player.answered = true;
          player.selectedAnswer = optionIndex;

          const isCorrect = optionIndex === currentQ.correctAnswer;
          const speedRatio = Math.max(0.1, (remainingTime || 10) / (currentQ.timeLimit || 20));
          const pointsEarned = isCorrect ? Math.round(500 + 500 * speedRatio + player.streak * 100) : 0;

          if (isCorrect) {
            player.score += pointsEarned;
            player.streak += 1;
          } else {
            player.streak = 0;
          }

          console.log(`[Answer Received] Room: ${roomId} | Player: ${player.name} | Option: ${optionIndex} | Correct: ${isCorrect}`);

          // Private response confirmation to submitting player
          ws.send(JSON.stringify({
            type: 'ANSWER_LOCKED',
            payload: { optionIndex, pointsEarned, isCorrect },
          }));

          // Notify host and room of new answer velocity count with updated player list
          const answeredCount = Array.from(room.players.values()).filter((p) => p.answered).length;
          const playerList = Array.from(room.players.values());
          server.publish(`room:${room.code}`, JSON.stringify({
            type: 'ANSWER_PROGRESS',
            payload: {
              answeredCount,
              totalPlayers: room.players.size,
              players: playerList,
            },
          }));
          return;
        }

        // 5. Host reveals results for their classroom
        if (type === 'REVEAL_RESULTS') {
          const room = rooms.get(ws.data.roomId || '');
          if (!room || !ws.data.isHost) return;

          room.status = 'revealed';
          const currentQ = room.questions[room.currentQuestionIndex];
          const playerList = Array.from(room.players.values());

          server.publish(`room:${room.code}`, JSON.stringify({
            type: 'ROUND_REVEALED',
            payload: {
              correctAnswer: currentQ.correctAnswer,
              players: playerList,
            },
          }));
          return;
        }

        // 6. Host triggers final podium for their classroom
        if (type === 'SHOW_FINAL_PODIUM') {
          const room = rooms.get(ws.data.roomId || '');
          if (!room || !ws.data.isHost) return;

          room.status = 'ended';
          const sorted = Array.from(room.players.values()).sort((a, b) => b.score - a.score);

          server.publish(`room:${room.code}`, JSON.stringify({
            type: 'GAME_OVER',
            payload: {
              standings: sorted,
            },
          }));
          return;
        }

        // 7. Real-time live emoji reactions (Kahoot-style rising & dissolving emojis)
        if (type === 'SEND_REACTION') {
          const roomId = ws.data.roomId || payload?.code;
          if (!roomId) return;

          const { emoji, senderName } = payload;
          server.publish(`room:${roomId}`, JSON.stringify({
            type: 'ROOM_REACTION',
            payload: {
              id: Math.random().toString(36).substring(2, 9),
              emoji,
              senderName: senderName || 'Player',
              timestamp: Date.now(),
            },
          }));
          return;
        }
      } catch (err) {
        console.error('WS Error:', err);
      }
    },

    close(ws) {
      const { roomId, playerId, isHost } = ws.data;
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room) return;

      if (isHost) {
        server.publish(`room:${roomId}`, JSON.stringify({
          type: 'HOST_DISCONNECTED',
          payload: { message: 'The presenter has ended this classroom session.' },
        }));
        rooms.delete(roomId);
        console.log(`[Classroom Session Closed] PIN: ${roomId}`);
      } else if (playerId) {
        room.players.delete(playerId);
        const playerList = Array.from(room.players.values());
        server.publish(`room:${roomId}`, JSON.stringify({
          type: 'ROSTER_UPDATE',
          payload: { players: playerList, count: playerList.length },
        }));
      }
    },
  },
});

console.log(`🚀 Blankspace Multi-Session Quiz Server live on port ${port} (ws://localhost:${port}/ws)`);
