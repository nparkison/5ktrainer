Treadmill Tactician

A React-based interval training application designed for treadmill use, featuring a high-visibility "Cockpit" mode and custom pacing configurations.

Local Setup (Windows/WSL)

This project is best scaffolded using Vite with Tailwind CSS.

1. Scaffold Project

Run the following in your terminal (PowerShell or WSL):

npm create vite@latest treadmill-tactician -- --template react
cd treadmill-tactician
npm install


2. Install Dependencies

Install the required UI icons and Firebase SDK:

npm install lucide-react firebase clsx tailwind-merge


3. Tailwind Configuration

Initialize Tailwind CSS:

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p


Update tailwind.config.js to include your files:

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


4. Code Migration & Environment Variables

Copy the content of TreadmillTactician.jsx into src/App.jsx.

CRITICAL: The Canvas code uses injected variables (__firebase_config). You must replace this block in src/App.jsx with your actual Firebase configuration.

Replace this:

const firebaseConfig = JSON.parse(__firebase_config);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';


With this (using .env):
Create a .env.local file in your root:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
...


Then update src/App.jsx:

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... rest of config
};
const appId = "treadmill-tactician-v1"; // Static ID for local use


5. Git Initialization & Push

git init
git add .
git commit -m "Initial commit: Treadmill Tactician core logic"
git branch -M main
git remote add origin [https://github.com/YOUR_USERNAME/treadmill-tactician.git](https://github.com/YOUR_USERNAME/treadmill-tactician.git)
git push -u origin main


Features

Athlete-Tier 5k Plan: Skips walking phases, focuses on HIIT and Incline.

Cockpit Mode: High-contrast UI for visibility while running.

Persistence: Firebase Firestore integration for workout history.