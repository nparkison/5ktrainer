# Treadmill Tactician API Documentation

## Overview

The Treadmill Tactician API allows you to access your workout data programmatically through Firebase Cloud Functions. This enables integration with external services, data analysis tools, or custom dashboards.

## Base URL

After deploying Firebase Functions, your base URL will be:
```
https://[REGION]-[PROJECT-ID].cloudfunctions.net
```

Example: `https://us-central1-treadmill-tactician-abc123.cloudfunctions.net`

## Authentication

All API endpoints require a `userId` query parameter. You can find your userId by:

1. Opening your app in a browser
2. Opening DevTools → Application → Local Storage
3. Looking for keys starting with `firebase:authUser:`
4. The `uid` field is your userId

**Security Note:** Keep your userId private as it grants access to your workout data.

## Endpoints

### 1. Get All Workouts

Retrieve all completed workouts for a user.

**Endpoint:** `GET /getWorkouts`

**Parameters:**
- `userId` (required): Your Firebase user ID

**Example Request:**
```bash
curl "https://us-central1-your-project.cloudfunctions.net/getWorkouts?userId=abc123xyz"
```

**Example Response:**
```json
{
  "userId": "abc123xyz",
  "count": 5,
  "workouts": [
    {
      "id": "w1d1_1702394823000",
      "workoutId": "w1d1",
      "completedAt": "2024-12-12T14:30:23.000Z",
      "speedsUsed": {
        "walk": 3.5,
        "jog": 5.5,
        "run": 7.0,
        "sprint": 9.0
      }
    },
    {
      "id": "w1d2_1702308423000",
      "workoutId": "w1d2",
      "completedAt": "2024-12-11T14:30:23.000Z",
      "speedsUsed": {
        "walk": 3.5,
        "jog": 5.5,
        "run": 7.0,
        "sprint": 9.0
      }
    }
  ]
}
```

---

### 2. Get User Settings

Retrieve user settings (speed configurations).

**Endpoint:** `GET /getSettings`

**Parameters:**
- `userId` (required): Your Firebase user ID

**Example Request:**
```bash
curl "https://us-central1-your-project.cloudfunctions.net/getSettings?userId=abc123xyz"
```

**Example Response:**
```json
{
  "userId": "abc123xyz",
  "settings": {
    "speeds": {
      "walk": 3.5,
      "jog": 5.5,
      "run": 7.0,
      "sprint": 9.0
    }
  }
}
```

---

### 3. Get Workout Statistics

Get aggregated statistics about your training.

**Endpoint:** `GET /getStats`

**Parameters:**
- `userId` (required): Your Firebase user ID

**Example Request:**
```bash
curl "https://us-central1-your-project.cloudfunctions.net/getStats?userId=abc123xyz"
```

**Example Response:**
```json
{
  "userId": "abc123xyz",
  "totalWorkouts": 12,
  "workoutsByType": {
    "w1d1": 2,
    "w1d2": 1,
    "w1d3": 1,
    "w2d1": 1,
    "w2d2": 1,
    "w2d3": 1,
    "w3d1": 2,
    "w3d2": 1,
    "w3d3": 2
  },
  "firstWorkout": "2024-11-01T10:00:00.000Z",
  "lastWorkout": "2024-12-15T10:00:00.000Z",
  "daysActive": 45
}
```

---

### 4. Export All Data

Export complete data dump in JSON format.

**Endpoint:** `GET /exportData`

**Parameters:**
- `userId` (required): Your Firebase user ID

**Example Request:**
```bash
curl "https://us-central1-your-project.cloudfunctions.net/exportData?userId=abc123xyz" > my-data.json
```

**Example Response:**
```json
{
  "exportedAt": "2024-12-15T12:00:00.000Z",
  "userId": "abc123xyz",
  "settings": {
    "speeds": {
      "walk": 3.5,
      "jog": 5.5,
      "run": 7.0,
      "sprint": 9.0
    }
  },
  "workouts": [
    // Array of all workouts
  ],
  "totalWorkouts": 12
}
```

---

## Error Responses

All endpoints return standard HTTP status codes:

**400 Bad Request:**
```json
{
  "error": "Missing userId query parameter"
}
```

**404 Not Found:**
```json
{
  "error": "Settings not found for this user"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

---

## CORS

All endpoints support CORS and can be called from any origin.

---

## Use Cases

### 1. Dashboard Integration
Create a custom web dashboard:
```javascript
const userId = 'your-user-id';
const response = await fetch(
  `https://your-region-project.cloudfunctions.net/getStats?userId=${userId}`
);
const stats = await response.json();
console.log(`Total workouts: ${stats.totalWorkouts}`);
```

### 2. Data Analysis
Export data for analysis in Python, R, or Excel:
```bash
curl "https://your-url/exportData?userId=abc123" | jq '.workouts' > workouts.json
```

### 3. Notion Integration
Use the API with Notion's database API to log workouts automatically.

### 4. Mobile App
Build a native mobile app that reads from the same data source.

### 5. Automation
Use tools like Zapier or Make.com to trigger actions when new workouts are completed.

---

## Rate Limits

Firebase Free Tier limits:
- 125,000 function invocations per day
- 40,000 GB-seconds of compute time per month
- 200,000 GB-seconds of memory per month

For personal use, these limits are more than sufficient.

---

## Local Testing

Test functions locally before deploying:

```bash
cd functions
npm install
firebase emulators:start --only functions
```

Then call:
```
http://localhost:5001/[PROJECT-ID]/us-central1/getWorkouts?userId=test
```

---

## Security Best Practices

1. **Never share your userId publicly** - it's like a password for your workout data
2. **Use environment variables** when integrating with external services
3. **Monitor Firebase Console** for unusual access patterns
4. **Set up billing alerts** in Firebase Console (though free tier should be sufficient)
5. **Regularly export backups** using the export endpoint

---

## Troubleshooting

### "Missing userId query parameter"
Make sure you're passing `?userId=your-id` in the URL.

### "Internal server error"
Check Firebase Functions logs:
```bash
firebase functions:log
```

### CORS errors
Make sure the `cors` package is installed in `functions/package.json`.

---

## Support

For issues or questions:
- Check Firebase Console → Functions → Logs
- Review Firestore security rules
- Verify your userId is correct
