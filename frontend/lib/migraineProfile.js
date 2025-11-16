/**
 * Migraine Profile Service
 * Handles saving and retrieving user onboarding data for migraine prediction
 */

import { supabase } from './supabase';
import { syncMigraineProfileToFirebase } from './firebase';

/**
 * Save onboarding responses to migraine_profiles table
 * @param {Object} answers - Object containing all onboarding answers
 * @returns {Promise<{data, error}>}
 */
export const saveMigraineProfile = async (answers) => {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Prepare responses as JSONB
    const responses = {
      ...answers,
      saved_at: new Date().toISOString(),
    };

    // Call the upsert function
    const { data, error } = await supabase.rpc('upsert_migraine_profile', {
      p_user_id: user.id,
      p_responses: responses,
    });

    if (error) {
      console.error('Error saving migraine profile:', error);
      return { data: null, error };
    }

    // Sync to Firebase for ML pipeline
    if (data) {
      try {
        // Get the full profile data including all fields
        const { data: fullProfile, error: fetchError } = await supabase
          .from('migraine_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!fetchError && fullProfile) {
          await syncMigraineProfileToFirebase(fullProfile, user.id);
        }
      } catch (firebaseError) {
        console.error('Error syncing migraine profile to Firebase:', firebaseError);
        // Don't block save if Firebase sync fails
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception saving migraine profile:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Get user's migraine profile
 * @returns {Promise<{data, error}>}
 */
export const getMigraineProfile = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await supabase
      .from('migraine_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Not found is okay (user hasn't completed onboarding)
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception getting migraine profile:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Get ML-ready feature vector for a user
 * @param {string} userId - Optional user ID (defaults to current user)
 * @returns {Promise<{data, error}>}
 */
export const getMigraineFeatures = async (userId = null) => {
  try {
    let targetUserId = userId;
    
    if (!targetUserId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }
      targetUserId = user.id;
    }

    const { data, error } = await supabase.rpc('get_migraine_features', {
      p_user_id: targetUserId,
    });

    if (error) {
      console.error('Error getting migraine features:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception getting migraine features:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Check if user has completed onboarding
 * @returns {Promise<boolean>}
 */
export const hasCompletedOnboarding = async () => {
  try {
    const { data, error } = await getMigraineProfile();
    
    if (error || !data) {
      return false;
    }

    return data.onboarding_completed === true;
  } catch (error) {
    console.error('Exception checking onboarding status:', error);
    return false;
  }
};

/**
 * Update specific fields in migraine profile
 * @param {Object} updates - Partial updates to migraine profile
 * @returns {Promise<{data, error}>}
 */
export const updateMigraineProfile = async (updates) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await supabase
      .from('migraine_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating migraine profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception updating migraine profile:', error);
    return { data: null, error: { message: error.message } };
  }
};

