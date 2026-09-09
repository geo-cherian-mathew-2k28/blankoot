# 🚀 Blankspace Live Classroom Quiz Arena

A real-time, Kahoot-style classroom quiz platform built with a bold **Neo-Brutalist** aesthetic, animated 3D mascots, live student gamepads, synchronized projector leaderboards, and a cinematic championship podium reveal.

---

## ⚡ Quick Start (The Easiest Way to Run)

To run Blankspace Quiz, you need **two terminal windows**:
1. **Terminal 1**: The WebSocket Real-Time Game Server
2. **Terminal 2**: The Frontend Web App

---

### Step 1: Install Bun (If you don't have it yet)

We use **Bun** because it is ultra-fast and handles both the backend WebSocket server and frontend compilation natively.

#### **Windows (PowerShell)**:
Open PowerShell and run:
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

#### **Mac / Linux**:
Open Terminal and run:
```bash
curl -fsSL https://bun.sh/install | bash
```

*(You can verify it is installed by running `bun -v`)*

---

### Step 2: Install Project Dependencies

In your terminal, navigate into the project folder (`BLANKS-QUIZ`) and run:
```bash
bun install
```
*(This installs all required packages like GSAP, Confetti, Lucide Icons, and Firebase in seconds.)*

---

### Step 3: Start the Backend WebSocket Server (Terminal 1)

Open **Terminal 1** in the project directory and run:
```bash
bun run server
```

✅ You should see:
```
🚀 [QUIZ WS SERVER] Listening on ws://0.0.0.0:3001
```
> **Keep this terminal window running!** This server handles real-time player connections, answer synchronization, score calculation, and leaderboard updates.

---

### Step 4: Start the Frontend Web App (Terminal 2)

Open **Terminal 2** in the same project directory and run:
```bash
bun run dev
```

✅ You will see a local URL, typically:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

👉 Click or open **http://localhost:5173** in your web browser.

---

## 🎮 How to Play / Demo the Quiz

### 1. Presenter Screen (Projector / Main Screen)
1. Go to: **[http://localhost:5173/host](http://localhost:5173/host)**
2. Click **"Sign in with Authorized Google Account"** (e.g. `blankspacecommunity@gmail.com`).
   > *Tip: You can authorize your own Gmail address by adding it to `VITE_HOST_EMAILS` in a `.env` file or directly inside `src/lib/authConfig.ts`.*
3. You will see the **6-digit Classroom Game PIN** (e.g., `123 456`) and the connected player roster.
4. Once students have joined, click **"Start Quiz Round"**.

### 2. Student Screen (Phone / Second Browser Tab)
1. Open an Incognito window, second tab, or your phone browser: **[http://localhost:5173/](http://localhost:5173/)**
2. Enter the **6-digit Game PIN** shown on the host screen.
3. Choose your name and pick your favorite **3D animated mascot avatar**.
4. Click **"Enter Classroom Lobby"**.
5. When the presenter starts the question:
   - Your phone displays the **4 large neo-brutalist tactile colored pads** (Red Triangle, Blue Diamond, Yellow Circle, Green Square).
   - Tap your answer before the timer runs out!
   - Your answer locks in instantly, showing live animated status and feedback.

### 3. Leaderboard & Cinematic Finale
- After each question round, the presenter can click **"Reveal Results"** to show correctness and distribution.
- Click **"Leaderboard 🚀"** to reveal the animated neo-brutalist classroom standings.
- On the final round, clicking **"Show Final Podium"** triggers:
  - 🏆 **Suspense Ceremony**: Cinematic dark overlay with suspense ticks and animated scoring tabulations.
  - 🥉 **Bronze Reveal (#3)**: Animated GSAP entry with bounce physics.
  - 🥈 **Silver Reveal (#2)**: Staggered entrance.
  - 🥁 **Gold Champion Reveal (#1)**: Drumroll suspense followed by elastic bounce animation, synthesizer victory fanfare chords, and 3 consecutive waves of celebration confetti!

---

## 🛠️ Common Troubleshooting

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| **"Could not connect to game server"** | Backend server is not running | Make sure you ran `bun run server` in Terminal 1 and it shows port `3001`. |
| **"Access Denied: ... is not authorized"** | Logged into `/host` with an unauthorized email | Add your email to `AUTHORIZED_HOST_EMAILS` inside `src/lib/authConfig.ts`. |
| **Playing from phones on the same Wi-Fi** | Vite running only on localhost | Run `bun run dev -- --host` so devices on your Wi-Fi can open your computer's local IP (e.g., `http://192.168.1.50:5173`). |

---

## 🏗️ Production Build

To build the static distribution bundle for deployment:
```bash
bun run build
```
To preview the production bundle locally:
```bash
bun run preview
```

Enjoy hosting your classroom quizzes! 🚀
