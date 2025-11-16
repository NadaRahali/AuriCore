/**
 * Firebase Realtime Database Service
 * Syncs user data, migraine profiles, and health data to Firebase for ML pipeline
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

// Firebase configuration
// Using Realtime Database URL for ML pipeline integration
const firebaseConfig = {
  databaseURL: 'https://migraine-personal-predict-default-rtdb.europe-west1.firebasedatabase.app/',
  // Note: If you need additional config (apiKey, authDomain, projectId), add them here
  // These are typically found in Firebase Console > Project Settings > General
};

// Initialize Firebase
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create a mock database object to prevent crashes
  database = null;
}

/**
 * Sync user data to Firebase
 * Creates or updates user entry in Firebase
 * @param {Object} user - Supabase user object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const syncUserToFirebase = async (user) => {
  try {
    if (!database) {
      console.warn('Firebase database not initialized');
      return { success: false, error: 'Firebase not initialized' };
    }

    if (!user || !user.id) {
      return { success: false, error: 'Invalid user data' };
    }

    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      created_at: user.created_at,
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Check if user already exists in Firebase
    const userRef = ref(database, `users/${user.id}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      // Update existing user (update last_login and updated_at)
      await set(ref(database, `users/${user.id}`), {
        ...snapshot.val(),
        ...userData,
        created_at: snapshot.val().created_at || userData.created_at, // Preserve original created_at
      });
    } else {
      // Create new user
      await set(userRef, userData);
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing user to Firebase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sync migraine profile (chat/questionnaire data) to Firebase
 * @param {Object} profileData - Migraine profile data from Supabase
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const syncMigraineProfileToFirebase = async (profileData, userId) => {
  try {
    if (!database) {
      console.warn('Firebase database not initialized');
      return { success: false, error: 'Firebase not initialized' };
    }

    if (!userId || !profileData) {
      return { success: false, error: 'Invalid profile data' };
    }

    const profileRef = ref(database, `migraine_profiles/${userId}`);
    
    // Get existing profile to preserve created_at if it exists
    const snapshot = await get(profileRef);
    const existingData = snapshot.exists() ? snapshot.val() : null;

    const dataToSave = {
      user_id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
      created_at: existingData?.created_at || new Date().toISOString(),
    };

    await set(profileRef, dataToSave);

    return { success: true };
  } catch (error) {
    console.error('Error syncing migraine profile to Firebase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sync health data to Firebase
 * @param {Object} healthData - Health data from Supabase
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const syncHealthDataToFirebase = async (healthData, userId) => {
  try {
    if (!database) {
      console.warn('Firebase database not initialized');
      return { success: false, error: 'Firebase not initialized' };
    }

    if (!userId || !healthData) {
      return { success: false, error: 'Invalid health data' };
    }

    const healthRef = ref(database, `health_data/${userId}`);
    
    // Get existing health data to preserve created_at if it exists
    const snapshot = await get(healthRef);
    const existingData = snapshot.exists() ? snapshot.val() : null;

    const dataToSave = {
      user_id: userId,
      ...healthData,
      updated_at: new Date().toISOString(),
      created_at: existingData?.created_at || new Date().toISOString(),
    };

    await set(healthRef, dataToSave);

    return { success: true };
  } catch (error) {
    console.error('Error syncing health data to Firebase:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user exists in Firebase
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const userExistsInFirebase = async (userId) => {
  try {
    if (!database) {
      return false;
    }

    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking user in Firebase:', error);
    return false;
  }
};

export default database;

