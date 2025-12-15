# Quick Start Guide

Get your Treadmill Tactician app deployed with free hosting and storage in under 30 minutes.

## Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub account (free)
- Google account (free)

## Step-by-Step Setup

### 1. Firebase Setup (10 minutes)

#### Create Project
1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get Started" → "Add Project"
3. Project name: `treadmill-tactician`
4. Disable Google Analytics (optional)
5. Click "Create Project"

#### Enable Firestore
1. Left sidebar → Build → **Firestore Database**
2. Click "Create database"
3. Start in **Production mode**
4. Choose location closest to you (e.g., `us-central1`)
5. Click "Enable"

#### Set Security Rules
1. Go to Firestore Database → Rules tab
2. Paste this:
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
3. Click "Publish"

#### Enable Authentication
1. Left sidebar → Build → **Authentication**
2. Click "Get started"
3. Click "Anonymous" → Toggle Enable → Save

#### Get Config
1. Left sidebar → Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click Web icon `</>`
4. App nickname: `treadmill-tactician-web`
5. Don't check "Firebase Hosting"
6. Click "Register app"
7. **Copy the config values** (you'll need these next)

### 2. Configure Your App (2 minutes)

Create `.env.local` in your project root:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Replace the values with what you copied from Firebase.

### 3. Test Locally (2 minutes)

```bash
npm install
npm run dev
```

Open http://localhost:5173

- Create a workout
- Complete it
- Check if it saves (should see checkmark)
- Open Firebase Console → Firestore
- Verify you see data under: `artifacts/treadmill-tactician-v1/users/[your-id]`

### 4. Deploy to Vercel (5 minutes)

#### Push to GitHub
```bash
git add .
git commit -m "Configure for deployment"
git push origin main
```

#### Deploy via Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Vercel auto-detects Vite config ✓
6. Click "Environment Variables"
7. Add all your `VITE_*` variables from `.env.local`
8. Click "Deploy"
9. Wait ~2 minutes
10. Done! Your app is live at `https://your-app.vercel.app`

### 5. Install as PWA (2 minutes)

**On iPhone:**
1. Open your Vercel URL in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

**On Android:**
1. Open your Vercel URL in Chrome
2. Tap menu (⋮)
3. Tap "Install app" or "Add to Home Screen"

Now you have a native-feeling app!

---

## Optional: Set Up API Access (10 minutes)

If you want to access your data from external services:

### Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Initialize Functions
```bash
firebase init functions
```
- Use existing project → select your project
- JavaScript (or TypeScript if you prefer)
- ESLint? No (or Yes if you want)
- Install dependencies? Yes

This creates a `functions/` directory. The functions are already written in `functions/index.js`.

### Install CORS dependency
```bash
cd functions
npm install cors
cd ..
```

### Deploy Functions
```bash
firebase deploy --only functions
```

Wait ~3 minutes. You'll get URLs like:
```
✔  functions[getWorkouts(us-central1)]: https://us-central1-project.cloudfunctions.net/getWorkouts
```

### Test API
```bash
# Replace with your function URL and userId
curl "https://us-central1-your-project.cloudfunctions.net/getWorkouts?userId=YOUR_USER_ID"
```

To find your userId:
1. Open app in browser
2. DevTools → Console
3. Type: `localStorage`
4. Look for `firebase:authUser:...` key
5. Copy the `uid` value

---

## Costs

**Total: $0/month** for personal use

- **Vercel:** Free tier includes unlimited deployments, 100GB bandwidth
- **Firebase Firestore:** Free tier includes 1GB storage, 50K reads/day, 20K writes/day
- **Firebase Functions:** Free tier includes 125K invocations/day
- **Firebase Auth:** Unlimited anonymous auth

You won't hit these limits with personal workout tracking.

---

## What You Get

✅ **Free hosting** at a custom URL (optional custom domain)
✅ **Free cloud storage** - access from any device
✅ **PWA** - Install on phone/tablet like a native app
✅ **Offline support** - Works without internet (syncs when back online)
✅ **API access** - Pull data into other tools
✅ **Automatic backups** - Data stored in Firebase
✅ **HTTPS & CDN** - Fast, secure, global delivery

---

## Next Steps

- **Custom Domain:** Vercel Settings → Domains → Add your domain
- **Analytics:** Add Google Analytics if desired
- **Backup:** Run `node scripts/export-data.js YOUR_USER_ID` monthly
- **Share:** Send Vercel URL to training partners

---

## Troubleshooting

**"Firebase not configured"**
- Check `.env.local` file exists
- Verify all `VITE_*` variables are set in Vercel

**"Permission denied" in Firestore**
- Verify Firestore rules are published
- Check Anonymous auth is enabled

**Data not saving**
- Open browser DevTools → Console
- Look for red error messages
- Check Firebase Console → Firestore for data

**App not installing as PWA**
- Must be accessed via HTTPS (Vercel provides this)
- Check `manifest.json` has correct URLs

---

## Support

- Firebase Docs: [firebase.google.com/docs](https://firebase.google.com/docs)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Issues: GitHub repository issues tab
