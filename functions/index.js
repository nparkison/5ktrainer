const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

const APP_ID = "treadmill-tactician-v1";

/**
 * API Endpoint: Get all workouts for a user
 * GET /api/workouts?userId=<userId>
 *
 * Example:
 * curl "https://your-region-your-project.cloudfunctions.net/api/workouts?userId=abc123"
 */
exports.getWorkouts = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const userId = req.query.userId;

      if (!userId) {
        return res.status(400).json({
          error: "Missing userId query parameter"
        });
      }

      const workoutsRef = db.collection('artifacts')
        .doc(APP_ID)
        .collection('users')
        .doc(userId)
        .collection('workouts');

      const snapshot = await workoutsRef.orderBy('completedAt', 'desc').get();

      const workouts = [];
      snapshot.forEach(doc => {
        workouts.push({
          id: doc.id,
          ...doc.data(),
          completedAt: doc.data().completedAt?.toDate().toISOString()
        });
      });

      return res.json({
        userId,
        count: workouts.length,
        workouts
      });

    } catch (error) {
      console.error("Error fetching workouts:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: error.message
      });
    }
  });
});

/**
 * API Endpoint: Get user settings
 * GET /api/settings?userId=<userId>
 */
exports.getSettings = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const userId = req.query.userId;

      if (!userId) {
        return res.status(400).json({
          error: "Missing userId query parameter"
        });
      }

      const settingsDoc = await db.collection('artifacts')
        .doc(APP_ID)
        .collection('users')
        .doc(userId)
        .collection('settings')
        .doc('profile')
        .get();

      if (!settingsDoc.exists) {
        return res.status(404).json({
          error: "Settings not found for this user"
        });
      }

      return res.json({
        userId,
        settings: settingsDoc.data()
      });

    } catch (error) {
      console.error("Error fetching settings:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: error.message
      });
    }
  });
});

/**
 * API Endpoint: Get workout statistics
 * GET /api/stats?userId=<userId>
 */
exports.getStats = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const userId = req.query.userId;

      if (!userId) {
        return res.status(400).json({
          error: "Missing userId query parameter"
        });
      }

      const workoutsRef = db.collection('artifacts')
        .doc(APP_ID)
        .collection('users')
        .doc(userId)
        .collection('workouts');

      const snapshot = await workoutsRef.get();

      const workouts = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        workouts.push({
          workoutId: data.workoutId,
          completedAt: data.completedAt?.toDate(),
          speedsUsed: data.speedsUsed
        });
      });

      // Calculate statistics
      const totalWorkouts = workouts.length;
      const workoutsByType = {};

      workouts.forEach(w => {
        const workoutId = w.workoutId;
        workoutsByType[workoutId] = (workoutsByType[workoutId] || 0) + 1;
      });

      // Get date range
      const dates = workouts.map(w => w.completedAt).filter(d => d);
      const firstWorkout = dates.length > 0 ? new Date(Math.min(...dates)) : null;
      const lastWorkout = dates.length > 0 ? new Date(Math.max(...dates)) : null;

      return res.json({
        userId,
        totalWorkouts,
        workoutsByType,
        firstWorkout: firstWorkout?.toISOString(),
        lastWorkout: lastWorkout?.toISOString(),
        daysActive: firstWorkout && lastWorkout
          ? Math.ceil((lastWorkout - firstWorkout) / (1000 * 60 * 60 * 24)) + 1
          : 0
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: error.message
      });
    }
  });
});

/**
 * API Endpoint: Export all user data
 * GET /api/export?userId=<userId>
 * Returns complete data dump in JSON format
 */
exports.exportData = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const userId = req.query.userId;

      if (!userId) {
        return res.status(400).json({
          error: "Missing userId query parameter"
        });
      }

      const userRef = db.collection('artifacts')
        .doc(APP_ID)
        .collection('users')
        .doc(userId);

      // Get settings
      const settingsDoc = await userRef.collection('settings').doc('profile').get();
      const settings = settingsDoc.exists ? settingsDoc.data() : null;

      // Get all workouts
      const workoutsSnapshot = await userRef.collection('workouts').get();
      const workouts = [];
      workoutsSnapshot.forEach(doc => {
        workouts.push({
          id: doc.id,
          ...doc.data(),
          completedAt: doc.data().completedAt?.toDate().toISOString()
        });
      });

      return res.json({
        exportedAt: new Date().toISOString(),
        userId,
        settings,
        workouts,
        totalWorkouts: workouts.length
      });

    } catch (error) {
      console.error("Error exporting data:", error);
      return res.status(500).json({
        error: "Internal server error",
        message: error.message
      });
    }
  });
});
