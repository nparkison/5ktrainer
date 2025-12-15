# Deployment Guide

## Free Hosting & Storage Setup

### Step 1: Firebase Setup (Free Storage)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Name: `treadmill-tactician` (or your choice)
   - Disable Google Analytics (optional for personal use)

2. **Enable Firestore**
   - In Firebase Console → Build → Firestore Database
   - Click "Create database"
   - Start in **production mode**
   - Choose a location close to you

3. **Set Firestore Rules**
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /artifacts/treadmill-tactician-v1/users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

4. **Enable Anonymous Authentication**
   - Firebase Console → Build → Authentication
   - Click "Get started"
   - Enable "Anonymous" sign-in method

5. **Get Firebase Config**
   - Firebase Console → Project Settings (gear icon)
   - Scroll to "Your apps" → Web app
   - Click the `</>` icon to add a web app
   - Copy the config values

6. **Create `.env.local` file**
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Step 2: Vercel Deployment (Free Hosting)

1. **Install Vercel CLI** (optional, can also use web interface)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via GitHub (Recommended)**
   - Push your code to GitHub
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "Add New Project"
   - Import your repository
   - Vercel auto-detects Vite config
   - Add environment variables from `.env.local` in Vercel dashboard
   - Deploy!

3. **Or Deploy via CLI**
   ```bash
   npm run build
   vercel
   ```

### Step 3: Add API Endpoints (Optional)

To create REST API endpoints for external data access:

1. **Install Firebase Functions**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init functions
   ```

2. **See `functions/index.js` for API endpoint examples**

3. **Deploy Functions**
   ```bash
   firebase deploy --only functions
   ```

## Free Tier Limits

### Vercel
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains

### Firebase
- ✅ 1GB Firestore storage
- ✅ 50,000 document reads/day
- ✅ 20,000 document writes/day
- ✅ Unlimited anonymous auth
- ✅ 125K function invocations/day (if using Cloud Functions)

**For personal use tracking workouts, you'll never hit these limits.**

## Accessing Your Data

### Option 1: Firebase Console
- Firebase Console → Firestore Database
- Browse collections manually

### Option 2: REST API (if you set up Functions)
- `GET https://your-region-your-project.cloudfunctions.net/api/workouts`
- Returns your completed workouts as JSON

### Option 3: Export Script
See `scripts/export-data.js` for a Node.js script to export your data to JSON.

## Post-Deployment

1. Update `manifest.json` with your Vercel URL:
   ```json
   {
     "start_url": "https://your-app.vercel.app/",
     "scope": "https://your-app.vercel.app/"
   }
   ```

2. Test PWA installation on mobile

3. Your app is now accessible at `https://your-app.vercel.app`!
