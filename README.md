# Treadmill Tactician

A React-based interval training application designed for treadmill use, featuring a high-visibility "Cockpit" mode and custom pacing configurations.

## Features

- **6-Week Athlete Training Plan** - Progressive program with intervals, hills, and endurance workouts
- **Cockpit Mode** - High-contrast UI optimized for visibility while running
- **Audio & Haptic Feedback** - Beeps and vibration alerts on segment transitions
- **Segment Navigation** - Skip forward/back through workout segments
- **Workout Preview** - Review all segments before starting
- **Screen Wake Lock** - Prevents screen from dimming during workouts
- **PWA Support** - Installable as a standalone app with offline capability
- **Persistence** - Firebase Firestore integration (with localStorage fallback)

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- Lucide React (icons)
- Firebase (optional)
- Web Audio API, Vibration API, Wake Lock API

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/nparkison/5ktrainer.git
cd 5ktrainer
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Firebase Configuration (Optional)

The app works without Firebase using localStorage for persistence. To enable cloud sync:

1. Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Set up Firestore rules in your Firebase console.

## Training Plan Overview

| Week | Focus | Workouts |
|------|-------|----------|
| 1 | Foundation & Speed Play | Rust Buster, Incline Intro, Steady State |
| 2 | Escalation | Pyramid Intervals, Rolling Hills, Long Run |
| 3 | Power Phase | Speed Repeats, The Mountain, Mock 5k Pace |
| 4 | Build Week | Tempo Intervals, Hill Endurance, Long Steady |
| 5 | Peak Week | Race Pace Repeats, Summit Assault, Peak Long Run |
| 6 | Taper & Race | Sharpener, Easy Hills, Race Day Prep |

## PWA Installation

On mobile devices, use your browser's "Add to Home Screen" option to install the app for a native-like experience.

## Deployment & API

### Quick Start
See [QUICKSTART.md](QUICKSTART.md) for step-by-step deployment instructions.

### Full Deployment Guide
See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive hosting and storage setup.

### API Documentation
See [API.md](API.md) for REST API endpoints to access your workout data.

## License

MIT
