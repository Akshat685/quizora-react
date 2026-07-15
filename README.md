# Quizora — React Quiz Player

A responsive, timed quiz application built with React.js for the React Practical Assignment. Users can browse quizzes, answer timed questions, view detailed results, and compete on a per-quiz leaderboard powered by Firebase Firestore.

**Live Demo:** [https://quizora-react.vercel.app/](https://quizora-react.vercel.app/)

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 (Vite) | Core UI framework + fast dev/build tooling |
| Tailwind CSS v4 | Utility-first styling |
| React Router v7 | Client-side routing |
| Framer Motion | Page, question, and UI animations |
| Firebase Firestore | Leaderboard data storage |
| canvas-confetti | Confetti effect on high scores |
| Web Audio API | Lightweight sound effects (no audio files needed) |

---

## Features

### Core (Required)

- **Quiz listing page** — all quizzes displayed as cards showing title, description, category, difficulty badge, total questions, time per question, and a Play Quiz button.
- **Quiz player** — shows question number, an animated progress bar, a circular countdown timer (reads `timePerQuestion` from quiz data), the question text, four options, and a Next button. Next stays disabled until the user picks an option. Timer auto-advances when it hits zero. Users cannot go back to previous questions.
- **Smooth animations** — page transitions (fade + slide), question transitions (slide in/out), option selection (scale + color shift with animated check/cross SVGs), progress bar (spring animation), and result screen (scale-in, count-up numbers, animated percentage ring).
- **Result screen** — displays total score, correct answers, wrong answers, percentage (animated SVG ring), a performance message based on score tier, and a Play Again button.
- **Firebase leaderboard** — after finishing a quiz, the user enters their name. The app saves `name`, `quizId`, `quizTitle`, `score`, `percentage`, and `completedAt` (server timestamp) to a Firestore `leaderboard` collection. It then displays the Top 10 scores for that quiz, sorted by score descending and most recent completion time.

### Bonus (All Implemented)

- **Shuffle questions & options** — Fisher-Yates shuffle on every play, so each attempt feels different.
- **Dark mode** — toggle in the header, persists to localStorage, respects system preference on first visit. No flash on load thanks to an inline script in `index.html`.
- **Confetti on high score** — dual-angle confetti burst triggers when the user scores 80% or above.
- **Sound effects** — Web Audio API generates short tones for option select, correct/wrong feedback, timer tick (last 5 seconds), quiz complete, and button clicks. No external audio files.
- **Keyboard navigation** — press `1`–`4` to select an option, `Enter` or `Space` to advance. Hints shown on desktop, hidden on mobile.

### Additional Touches

- Answer review section on the results page (collapsible, shows your answer vs. correct answer)
- Skeleton loading screens and empty states with illustrations
- Branded image fallback when quiz thumbnails fail to load
- Cloudinary image optimization with responsive `srcSet`
- Correct/wrong visual feedback (1.2s delay with animated checkmark/cross) before auto-advancing
- Accessibility: ARIA labels on timer, progress bar, options; `focus-visible` outlines for keyboard users
- Code splitting with `React.lazy` for quiz player and results pages
- Manual chunk splitting in Vite config (firebase, framer-motion, confetti, router, react)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Akshat685/quizora-react.git
cd quizora-react
npm install
```

### 2. Set up Firebase (for leaderboard)

The quiz functionality works without Firebase — you only need this if you want the leaderboard.

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Firestore Database** (start in test mode, then apply the rules below).
3. Add a **Web app** and copy the config values.
4. Create a `.env` file from the template:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

5. Fill in your Firebase credentials in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

6. Go to **Firestore → Rules** in the console and paste the contents of `firestore.rules` from this repo. These rules allow public read + validated create on the `leaderboard` collection, and block update/delete.

7. When you first query the leaderboard, Firestore may prompt you to create a composite index (`quizId` ASC + `score` DESC). Click the link in the browser console error to create it automatically.

> **Note:** Restart `npm run dev` after editing `.env` — Vite only reads environment variables at startup.

Without Firebase keys, everything still works. The leaderboard section shows a setup message and the submit button stays disabled.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production build

```bash
npm run build
npm run preview
```

---

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import the project on [Vercel](https://vercel.com/).
3. Add the `VITE_FIREBASE_*` environment variables under **Project → Settings → Environment Variables**.
4. Deploy. The `vercel.json` file already handles SPA route rewrites.

---

## Project Structure

```
src/
├── components/     # Reusable UI — Header, QuizCard, Timer, ProgressBar,
│                   #   OptionButton, Leaderboard, LoadingState
├── pages/          # Route-level components — HomePage, QuizPlayerPage, ResultsPage
├── hooks/          # Custom hooks — useCountdown
├── lib/            # External integrations — firebase config, leaderboard API,
│                   #   sound effects, Cloudinary helpers
├── utils/          # Pure functions — shuffle, scoring, performance messages,
│                   #   difficulty styles, date formatting
├── data/           # quiz.json (quiz data), quizzes-list.json (card metadata)
├── context/        # ThemeContext for dark mode
├── index.css       # Tailwind config, design tokens, custom animations
└── App.jsx         # Routes, layout, page transitions

public/
└── favicon.svg
```

---

## How It Works

1. **Home page** loads quiz metadata from `quizzes-list.json` and renders cards in a responsive grid.
2. Clicking **Play Quiz** navigates to `/quiz/:quizId`. The app looks up the full quiz data from `quiz.json`, shuffles questions and options, and starts the timer.
3. The user selects one option per question. After selecting, they click **Next** (or press Enter). A 1.2-second feedback phase highlights the correct answer before advancing.
4. If the timer hits zero, the app auto-advances — any unanswered question counts as wrong.
5. After the last question, the app navigates to `/quiz/:quizId/results` with the session data passed via `location.state`.
6. The **results page** shows an animated score breakdown, a collapsible answer review, and the leaderboard. Users can submit their name to save their score to Firestore.
7. **Play Again** generates a fresh `restartToken` so the quiz re-shuffles and resets cleanly.

---

## AI Usage

As encouraged by the assignment, I used AI tools during development:

- **Tools used:** Cursor (Composer), Antigravity IDE, Claude
- **Where AI helped:** Setting up the initial Vite + React + Tailwind project structure, wiring Firebase Firestore read/write operations, learning Framer Motion animation patterns (AnimatePresence, spring configs, SVG path animations), and building responsive Tailwind layouts.
- **What I implemented and decided myself:** The quiz timer logic and edge cases (double-fire prevention, locked state during feedback, ref-based stale closure handling), scoring system, Fisher-Yates shuffle implementation, leaderboard query design with client-side secondary sort for tie-breaking, Cloudinary integration for hosting and optimizing quiz thumbnail images (auto-format, responsive `srcSet`, LCP-aware loading), accessibility attributes, the env-based Firebase approach that degrades gracefully without credentials, answer review UI, and overall UX flow decisions.

---

## Manual Testing Checklist

- [x] Home page lists all 5 quizzes with complete metadata and responsive card layout
- [x] Play Quiz opens the player; options are selectable; Next button stays disabled until an option is picked
- [x] Countdown timer counts down correctly; at zero, auto-advances to next question (counts as wrong if unanswered)
- [x] Users cannot navigate back to previous questions
- [x] After the last question, results show total score, correct/wrong counts, percentage, and performance message
- [x] Play Again reshuffles questions/options and restarts; All Quizzes returns to home
- [x] Dark mode toggle works and persists across page refreshes
- [x] Keyboard shortcuts: 1–4 to select options, Enter to advance
- [x] Scoring ≥80% triggers confetti animation
- [x] With Firebase configured: submitting a name saves the score and it appears in the Top 10 leaderboard
- [x] Layout looks correct at ~375px (mobile), ~768px (tablet), and ~1280px (desktop)
