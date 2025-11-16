/**
 * Migraine Prediction Service
 * Placeholder structure for ML model integration
 * Currently returns mock data based on calendar/health data
 * Ready for API integration when ML model is available
 */

import { supabase } from './supabase';
import { fetchCalendarData } from './healthData';
import { getMigraineProfile } from './migraineProfile';
import { getLastMigraineDate } from './migraineEpisodes';

/**
 * Get migraine risk percentage for a user
 * @param {string} userId - Optional user ID (defaults to current user)
 * @param {Object} options - Options for prediction
 * @param {string} options.timeframe - 'hourly', 'daily', or 'weekly' (default: 'hourly')
 * @returns {Promise<{data: {risk: number, triggers: string[], confidence: number}, error}>}
 */
export const getMigraineRisk = async (userId = null, options = {}) => {
  try {
    const { timeframe = 'hourly' } = options;
    
    // Get current user if not provided
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }
      targetUserId = user.id;
    }

    // Get user's health data and profile
    const [profileResult, calendarResult, lastMigraineResult] = await Promise.all([
      getMigraineProfile(),
      fetchCalendarData({ daysAhead: 7 }),
      getLastMigraineDate(),
    ]);

    const profile = profileResult.data;
    const calendarData = calendarResult.data;
    const lastMigraine = lastMigraineResult.data;

    // Calculate mock risk based on available data
    let risk = 30; // Base risk
    const triggers = [];
    let confidence = 0.5; // Base confidence

    // Factor 1: Calendar stress (busy schedule)
    if (calendarData) {
      if (calendarData.stressIndicators.hasBackToBackMeetings) {
        risk += 20;
        triggers.push('Busy schedule');
      }
      if (calendarData.stressIndicators.hasLongDays) {
        risk += 15;
        triggers.push('Long work days');
      }
      if (calendarData.stressIndicators.hasEarlyMornings || calendarData.stressIndicators.hasLateNights) {
        risk += 10;
        triggers.push('Irregular sleep schedule');
      }
      if (calendarData.busyDays > 5) {
        risk += 10;
        triggers.push('High stress week');
      }
    }

    // Factor 2: Profile-based triggers
    if (profile) {
      if (profile.stress_frequency === 'Often' || profile.stress_frequency === 'Daily') {
        risk += 15;
        triggers.push('High stress frequency');
      }
      if (profile.sleep_hours === 'Less than 5' || profile.sleep_regularity === 'Very irregular') {
        risk += 15;
        triggers.push('Poor sleep patterns');
      }
      if (profile.weather_trigger === 'Yes') {
        // Weather trigger would need actual weather data
        risk += 5;
        triggers.push('Weather sensitivity');
      }
    }

    // Factor 3: Time since last migraine (if recent, lower risk; if long time, higher risk)
    if (lastMigraine) {
      const daysSince = (new Date() - lastMigraine) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) {
        risk -= 10; // Very recent migraine, lower immediate risk
      } else if (daysSince > 14) {
        risk += 10; // Long time since last, pattern might be building
      }
    }

    // Adjust for timeframe
    if (timeframe === 'daily') {
      risk = Math.min(risk * 1.2, 100);
    } else if (timeframe === 'weekly') {
      risk = Math.min(risk * 1.5, 100);
    }

    // Cap risk at 100
    risk = Math.min(Math.max(risk, 0), 100);

    // Increase confidence if we have more data
    if (profile && calendarData) {
      confidence = 0.7;
    }
    if (profile && calendarData && lastMigraine) {
      confidence = 0.85;
    }

    // TODO: Replace with actual ML model API call
    // Example structure:
    // const response = await fetch(`${ML_PREDICTION_API_URL}/predict`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     user_id: targetUserId,
    //     timeframe,
    //     profile,
    //     calendar_data: calendarData,
    //     health_data: healthData,
    //   }),
    // });
    // const prediction = await response.json();
    // return { data: prediction, error: null };

    return {
      data: {
        risk: Math.round(risk),
        triggers: [...new Set(triggers)], // Remove duplicates
        confidence,
        timeframe,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error getting migraine risk:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Predict likely triggers for upcoming migraines
 * @param {string} userId - Optional user ID (defaults to current user)
 * @returns {Promise<{data: string[], error}>}
 */
export const predictMigraineTriggers = async (userId = null) => {
  try {
    const riskResult = await getMigraineRisk(userId, { timeframe: 'daily' });
    
    if (riskResult.error) {
      return riskResult;
    }

    return {
      data: riskResult.data.triggers || [],
      error: null,
    };
  } catch (error) {
    console.error('Error predicting migraine triggers:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Get prediction history for a user
 * @param {string} userId - Optional user ID (defaults to current user)
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of predictions to return
 * @returns {Promise<{data, error}>}
 */
export const getPredictionHistory = async (userId = null, options = {}) => {
  try {
    const { limit = 30 } = options;
    
    // Get current user if not provided
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from('migraine_predictions')
      .select('*')
      .eq('user_id', targetUserId)
      .order('prediction_date', { ascending: false })
      .limit(limit);

    if (error) {
      // Table might not exist yet, return empty array
      if (error.code === '42P01') {
        return { data: [], error: null };
      }
      console.error('Error getting prediction history:', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Exception getting prediction history:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Save a prediction to the database
 * @param {Object} predictionData - Prediction data
 * @returns {Promise<{data, error}>}
 */
export const savePrediction = async (predictionData) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const prediction = {
      user_id: user.id,
      prediction_date: predictionData.prediction_date || new Date().toISOString(),
      risk_percentage: predictionData.risk_percentage,
      timeframe: predictionData.timeframe || 'hourly',
      predicted_triggers: predictionData.predicted_triggers || [],
      confidence_score: predictionData.confidence_score || 0.5,
      actual_outcome: predictionData.actual_outcome || null,
    };

    const { data, error } = await supabase
      .from('migraine_predictions')
      .insert(prediction)
      .select()
      .single();

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        console.warn('migraine_predictions table does not exist yet');
        return { data: null, error: null }; // Don't fail, just skip saving
      }
      console.error('Error saving prediction:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception saving prediction:', error);
    return { data: null, error: { message: error.message } };
  }
};

