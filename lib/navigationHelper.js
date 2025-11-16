/**
 * Navigation Helper
 * Determines which screen to show based on user's progress
 */

import { hasCompletedOnboarding } from './migraineProfile';
import { supabase } from './supabase';

/**
 * Check if user has seen the welcome screen
 * We'll use a flag in user metadata or a separate table
 * For now, we'll check if onboarding is completed (if onboarding is done, welcome was seen)
 */
export const hasSeenWelcome = async () => {
  try {
    // If onboarding is completed, user has definitely seen welcome
    const onboardingCompleted = await hasCompletedOnboarding();
    if (onboardingCompleted) {
      return true;
    }

    // Check if there's a welcome_seen flag in user metadata
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.welcome_seen) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking welcome status:', error);
    return false;
  }
};

/**
 * Mark welcome screen as seen
 */
export const markWelcomeSeen = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: { welcome_seen: true },
    });

    if (error) {
      console.error('Error marking welcome as seen:', error);
    }
  } catch (error) {
    console.error('Exception marking welcome as seen:', error);
  }
};

/**
 * Check if user has granted health permissions
 */
export const hasGrantedPermissions = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if health_data exists (means permissions were granted at least once)
    const { data, error } = await supabase
      .from('health_data')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    // If data exists, permissions were granted
    if (data && !error) {
      return true;
    }

    // Also check user metadata for permission flag
    if (user?.user_metadata?.permissions_granted) {
      return true;
    }

    return false;
  } catch (error) {
    // If table doesn't exist or error, assume not granted
    if (error.code === 'PGRST116') {
      return false; // No rows found
    }
    console.error('Error checking permissions status:', error);
    return false;
  }
};

/**
 * Mark permissions as granted
 */
export const markPermissionsGranted = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: { permissions_granted: true },
    });

    if (error) {
      console.error('Error marking permissions as granted:', error);
    }
  } catch (error) {
    console.error('Exception marking permissions as granted:', error);
  }
};

/**
 * Determine the next screen after login/verification
 * @returns {Promise<string>} Screen name to navigate to
 */
export const getNextScreenAfterAuth = async () => {
  try {
    // Check if user has seen welcome
    const welcomeSeen = await hasSeenWelcome();
    if (!welcomeSeen) {
      return 'Welcome';
    }

    // Check if onboarding is completed
    const onboardingCompleted = await hasCompletedOnboarding();
    if (!onboardingCompleted) {
      return 'Chat';
    }

    // Check if permissions are granted
    const permissionsGranted = await hasGrantedPermissions();
    if (!permissionsGranted) {
      return 'AuthorizeAccess';
    }

    // All steps completed - navigate to dashboard
    return 'Dashboard';
  } catch (error) {
    console.error('Error determining next screen:', error);
    // Default to Welcome on error
    return 'Welcome';
  }
};

