/**
 * Local Data Export Script
 *
 * Exports your workout data from Firebase Firestore to a JSON file
 *
 * Usage:
 *   node scripts/export-data.js <userId>
 *
 * Requirements:
 *   npm install firebase-admin
 *
 * Setup:
 *   1. Go to Firebase Console → Project Settings → Service Accounts
 *   2. Click "Generate new private key"
 *   3. Save as scripts/serviceAccountKey.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const APP_ID = 'treadmill-tactician-v1';

async function exportUserData(userId) {
  try {
    console.log(`Exporting data for user: ${userId}`);

    const userRef = db.collection('artifacts')
      .doc(APP_ID)
      .collection('users')
      .doc(userId);

    // Get settings
    const settingsDoc = await userRef.collection('settings').doc('profile').get();
    const settings = settingsDoc.exists ? settingsDoc.data() : null;

    // Get all workouts
    const workoutsSnapshot = await userRef.collection('workouts')
      .orderBy('completedAt', 'desc')
      .get();

    const workouts = [];
    workoutsSnapshot.forEach(doc => {
      const data = doc.data();
      workouts.push({
        id: doc.id,
        workoutId: data.workoutId,
        completedAt: data.completedAt?.toDate().toISOString(),
        speedsUsed: data.speedsUsed
      });
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      settings,
      workouts,
      totalWorkouts: workouts.length
    };

    // Write to file
    const filename = `treadmill-tactician-export-${userId}-${Date.now()}.json`;
    const filepath = path.join(__dirname, filename);

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    console.log(`\n✅ Export successful!`);
    console.log(`📁 File: ${filepath}`);
    console.log(`📊 Total workouts: ${workouts.length}`);

    if (settings) {
      console.log(`⚙️  Settings: ${JSON.stringify(settings.speeds)}`);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// Get userId from command line
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Error: Please provide a userId');
  console.log('\nUsage: node export-data.js <userId>');
  console.log('\nTo find your userId:');
  console.log('1. Open your app in browser');
  console.log('2. Open DevTools → Console');
  console.log('3. Type: localStorage.getItem("firebase:authUser:...")');
  console.log('4. Look for the "uid" field');
  process.exit(1);
}

exportUserData(userId);
