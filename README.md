# QuizForge

Desktop quiz application for web development topics. Built with Electron, React, and Node.js.

## Tech Stack

**Client:**
- Electron 31 (desktop shell)
- React 18 + TypeScript
- Tailwind CSS (dark theme, purple accent)
- Zustand (state management)
- React Router 6 (HashRouter for Electron)
- Lucide React (icons)
- Socket.IO Client (real-time battles)

**Server:**
- Node.js + Express
- Prisma ORM + SQLite
- Socket.IO (real-time communication)
- JWT authentication
- bcryptjs (password hashing)

## Features

- Single-player quiz modes: Classic, Timed, Marathon
- Real-time PvP battles with matchmaking
- Adaptive difficulty algorithm (skill-level tracking)
- Leaderboard with All Time / Month / Week filters
- Achievement system (10 achievements)
- Player profiles with game history
- Admin panel: dashboard, question management, user management
- NSIS installer for Windows

## Project Structure

```
QuizForge/
  client/                   # Electron + React frontend
    electron/               # Electron main process
      main.ts               # Window creation, menu, lifecycle
      preload.ts            # Context bridge IPC
      updater.ts            # Auto-update stub
    src/
      components/           # Shared UI components
        Layout.tsx           # Sidebar + top bar
        BattleCard.tsx       # Player card for battles
        CountdownOverlay.tsx # 3-2-1 overlay
        Modal.tsx            # Universal modal
        Toast.tsx            # Toast notifications
        Skeleton.tsx         # Loading skeletons
        PageTransition.tsx   # Fade-in wrapper
      pages/                # Route pages
        Login.tsx, Register.tsx
        Home.tsx, QuizSetup.tsx, Quiz.tsx, QuizResult.tsx
        BattleLobby.tsx, Battle.tsx, BattleResult.tsx
        Leaderboard.tsx, Profile.tsx, Admin.tsx
      stores/               # Zustand state
        authStore.ts         # Auth + user state
        battleStore.ts       # Battle state machine
        toastStore.ts        # Toast notifications
      App.tsx                # Routes + protected routes
      main.tsx               # React entry (HashRouter)
      index.css              # Tailwind + custom animations
    public/
      icon.png               # App icon 256x256
  server/                   # Express API server
    src/
      controllers/          # Route handlers
      middleware/            # Auth + admin guards
      routes/               # Express routers
      services/             # Business logic
    prisma/
      schema.prisma          # Database schema
      seed.ts                # Seed achievements + admin user
```

## Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Setup database
cd server
npx prisma db push
npx tsx prisma/seed.ts

# Start dev mode (two terminals)
# Terminal 1 - server:
cd server && npm run dev

# Terminal 2 - client (Electron + Vite):
cd client && npm run dev
```

### Default Admin Account
- Email: `admin@quizforge.com`
- Password: `admin123`

## Build Installer (.exe)

```bash
cd client
npm run dist
```

The NSIS installer will be in `client/release/`.

## Screenshots

*Screenshots coming soon*

