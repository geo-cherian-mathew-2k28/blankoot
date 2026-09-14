# 🚀 Blankspace Live Classroom Quiz Arena

A modern, cloud-synchronized, Kahoot-style classroom quiz platform built with a bold **Neo-Brutalist** aesthetic, animated 3D mascots, live mobile gamepads, synchronized smartboard/projector leaderboards, and a cinematic championship podium ceremony.

Powered by **React 19**, **TypeScript**, **Vite**, and **Firebase Firestore** for real-time multiplayer synchronization across devices with zero backend server overhead.

---

## ✨ Key Features

### 👑 1. Admin Management Console (`/admin`)
- **Secure Google Authentication**: Protected access restricted to designated admin (`geocherianmathew@gmail.com`).
- **Interactive Question Bank**:
  - Create, edit, reorder, and delete quiz questions.
  - **Image Support**: Upload custom images or diagrams per question with instant preview.
  - Set custom time limits (e.g., 10s, 20s, 30s) and multi-option configurations.
- **Dynamic Host Passkey Configuration**:
  - Admin sets and updates the secure passkey required for classroom smartboard presenters.

### 📺 2. Host & Smartboard Presenter View (`/host`)
- **Passkey-Protected Smartboard Access**:
  - Presenters on classroom smartboards/projectors unlock the session using the Admin-configured passkey without needing personal Google logins.
- **Dynamic 6-Digit Game PIN**:
  - Instant session generation with QR code and easy-to-read room PIN for students.
- **Real-Time Lobby & Gameplay Control**:
  - Live player roster with selected 3D mascot avatars.
  - Synchronized question countdown timers with immersive audio effects.
  - Real-time answer submission counters and live distribution bar charts.
  - Animated leaderboard standings between rounds.

### 📱 3. Student / Player Gamepad View (`/`)
- **Mobile-First Neo-Brutalist Gamepad**:
  - Enter 6-digit Game PIN and pick a 3D animated mascot avatar.
  - **Team / Player Name Limits**: Strictly enforced 2 to 15 character limit with live character counters.
  - 4 large tactile answer pads (Red Triangle, Blue Diamond, Yellow Circle, Green Square).
- **Fast-Answer Bonus & Streak Scoring**:
  - Real-time score calculation factoring in response speed and consecutive correct answers.
  - Instant tactile feedback and locked-in animations.

### 🏆 4. Cinematic Podium Ceremony & Finale
- **Grand Finale Reveals**:
  - 🥉 **Bronze (#3)**: Animated entrance onto the 3D pedestal.
  - 🥈 **Silver (#2)**: Staggered spotlight reveal.
  - 🥇 **Gold Champion (#1)**: Suspense drumroll, victory fanfare chords, and celebration confetti waves.
- **Smart Pedestal Alignment**:
  - Perfectly calibrated layout anchoring winner cards onto 3D podium bases with automatic name truncation to prevent overlapping.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router
- **Real-Time Database & Auth**: Firebase Firestore & Firebase Authentication
- **Animations & FX**: Framer Motion, GSAP, Canvas Confetti, Web Audio API
- **Icons & Styling**: Lucide React, Custom Neo-Brutalist Glassmorphism CSS

---

## ⚡ Getting Started (Local Development)

### Prerequisites
Make sure you have **Node.js (v18+)** or **Bun** installed on your system.

### 1. Clone the Repository
```bash
git clone https://github.com/geo-cherian-mathew-2k28/blankoot.git
cd blankoot
```

### 2. Install Dependencies
Using **npm**:
```bash
npm install
```
*Or using **Bun**:*
```bash
bun install
```

### 3. Configure Firebase
Ensure your Firebase configuration in [`src/firebase.ts`](src/firebase.ts) points to your Firebase Project with Firestore and Google Authentication enabled:

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 4. Run Development Server
```bash
npm run dev
```
To test on your mobile phone on the same Wi-Fi network:
```bash
npm run dev -- --host
```

---

## 🎮 How to Run a Live Classroom Quiz

```
+------------------------------------+
|       👑 Admin Portal (/admin)     |
|   • Add / Edit Qs + Images         |
|   • Set Host Passkey               |
+-----------------+------------------+
                  | (Sync via Firestore)
                  v
+------------------------------------+
|          🔥 Firebase DB             |
+-----------------+------------------+
                  |
        +---------+---------+
        |                   |
        v                   v
+----------------+  +----------------+
|  📺 Host Panel |  | 📱 Student Pad |
|    (/host)     |  |      (/)       |
| • Smartboard   |  | • 4 Colors     |
| • Timer & PIN  |  | • Live Streaks |
+----------------+  +----------------+
```

1. **Admin Setup (`/admin`)**:
   - Log in with the authorized Google Account (`geocherianmathew@gmail.com`).
   - Create or edit questions (optionally attach images) and set the **Host Passkey**.
2. **Smartboard / Presenter Screen (`/host`)**:
   - Open `/host` on the classroom smartboard/projector.
   - Enter the passkey set by the admin to unlock the host room.
   - Display the **6-digit Game PIN** on the smartboard.
3. **Student Devices (`/`)**:
   - Students navigate to the site URL on their phones.
   - Enter the Game PIN, set their team name (2–15 chars), and choose their 3D mascot.
4. **Host Starts Game**:
   - Questions appear on the smartboard while colored response pads appear on student phones.
   - Reveal results, show real-time leaderboards, and conclude with the 3D podium ceremony.

---

## 🏗️ Production Build & Deployment

To compile the production build:
```bash
npm run build
```

To test the production build locally:
```bash
npm run preview
```

### Deploying to Vercel
1. Push your latest code to GitHub:
   ```bash
   git push origin main
   ```
2. Import the repository into [Vercel](https://vercel.com).
3. Set the Framework Preset to **Vite** with Build Command `npm run build` and Output Directory `dist`.
4. Deploy! Real-time synchronization works out of the box through Firebase Firestore.

---

## 📄 License

This project is licensed under the MIT License - feel free to customize and use it for your events, orientations, and classroom quizzes!

