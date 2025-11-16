/**
 * Migraine Episodes Service
 * Handles saving and retrieving user migraine episodes for tracking and ML model training
 */

import { supabase } from './supabase';

/**
 * Save a new migraine episode
 * @param {Object} episodeData - Episode data object
 * @returns {Promise<{data, error}>}
 */
export const saveMigraineEpisode = async (episodeData) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    // Prepare episode data
    const episode = {
      user_id: user.id,
      episode_date: episodeData.episode_date || new Date().toISOString(),
      severity: episodeData.severity,
      duration_hours: episodeData.duration_hours || null,
      suspected_triggers: episodeData.suspected_triggers || [],
      symptoms: episodeData.symptoms || [],
      medication_taken: episodeData.medication_taken || false,
      medication_names: episodeData.medication_names || [],
      pain_location: episodeData.pain_location || [],
      has_aura: episodeData.has_aura || false,
      nausea: episodeData.nausea || false,
      vomiting: episodeData.vomiting || false,
      light_sensitivity: episodeData.light_sensitivity || false,
      sound_sensitivity: episodeData.sound_sensitivity || false,
      sleep_quality_night_before: episodeData.sleep_quality_night_before || null,
      stress_level_before: episodeData.stress_level_before || null,
      relief_methods_tried: episodeData.relief_methods_tried || [],
      location: episodeData.location || null,
      weather_at_time: episodeData.weather_at_time || null,
      notes: episodeData.notes || null,
    };

    const { data, error } = await supabase
      .from('migraine_episodes')
      .insert(episode)
      .select()
      .single();

    if (error) {
      console.error('Error saving migraine episode:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception saving migraine episode:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Get user's migraine episodes with optional filtering
 * @param {Object} options - Filtering options
 * @param {number} options.limit - Maximum number of episodes to return
 * @param {number} options.offset - Offset for pagination
 * @param {string} options.orderBy - Column to order by (default: episode_date)
 * @param {boolean} options.orderAsc - Order ascending (default: false, newest first)
 * @returns {Promise<{data, error}>}
 */
export const getMigraineEpisodes = async (options = {}) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const {
      limit = 100,
      offset = 0,
      orderBy = 'episode_date',
      orderAsc = false,
    } = options;

    let query = supabase
      .from('migraine_episodes')
      .select('*')
      .eq('user_id', user.id)
      .order(orderBy, { ascending: orderAsc })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error getting migraine episodes:', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Exception getting migraine episodes:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Get the most recent migraine episode date
 * @returns {Promise<{data, error}>} Returns date object or null
 */
export const getLastMigraineDate = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await supabase
      .from('migraine_episodes')
      .select('episode_date')
      .eq('user_id', user.id)
      .order('episode_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No episodes found is okay
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      console.error('Error getting last migraine date:', error);
      return { data: null, error };
    }

    return { data: data?.episode_date ? new Date(data.episode_date) : null, error: null };
  } catch (error) {
    console.error('Exception getting last migraine date:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Get episodes within a date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Promise<{data, error}>}
 */
export const getEpisodesByDateRange = async (startDate, endDate) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const start = startDate instanceof Date ? startDate.toISOString() : startDate;
    const end = endDate instanceof Date ? endDate.toISOString() : endDate;

    const { data, error } = await supabase
      .from('migraine_episodes')
      .select('*')
      .eq('user_id', user.id)
      .gte('episode_date', start)
      .lte('episode_date', end)
      .order('episode_date', { ascending: false });

    if (error) {
      console.error('Error getting episodes by date range:', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Exception getting episodes by date range:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Update an existing migraine episode
 * @param {string} id - Episode ID
 * @param {Object} updates - Partial updates to episode
 * @returns {Promise<{data, error}>}
 */
export const updateMigraineEpisode = async (id, updates) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await supabase
      .from('migraine_episodes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this episode
      .select()
      .single();

    if (error) {
      console.error('Error updating migraine episode:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception updating migraine episode:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Delete a migraine episode
 * @param {string} id - Episode ID
 * @returns {Promise<{success, error}>}
 */
export const deleteMigraineEpisode = async (id) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: { message: 'User not authenticated' } };
    }

    const { error } = await supabase
      .from('migraine_episodes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns this episode

    if (error) {
      console.error('Error deleting migraine episode:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Exception deleting migraine episode:', error);
    return { success: false, error: { message: error.message } };
  }
};

