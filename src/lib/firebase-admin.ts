import * as admin from 'firebase-admin';

// Initialize firebase admin only if credentials are set and it's not initialized
let isInitialized = false;

if (!admin.apps.length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      isInitialized = true;
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
    }
  } else {
    console.warn('Firebase admin credentials missing in environment. Email triggers will be mocked locally.');
  }
} else {
  isInitialized = true;
}

/**
 * Safely retrieves the Firestore Database instance.
 * Returns null if Firebase Admin was not initialized due to missing credentials.
 */
export function getFirestoreDb() {
  if (!isInitialized && !admin.apps.length) {
    return null;
  }
  try {
    return admin.firestore();
  } catch (err) {
    console.error('Failed to get Firestore instance:', err);
    return null;
  }
}

/**
 * Safely retrieves the Firebase Auth admin instance.
 */
export function getAuthAdmin() {
  if (!isInitialized && !admin.apps.length) {
    return null;
  }
  try {
    return admin.auth();
  } catch (err) {
    console.error('Failed to get Firebase Auth instance:', err);
    return null;
  }
}
