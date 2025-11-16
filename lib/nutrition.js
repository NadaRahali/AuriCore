/**
 * Nutrition Service
 * Handles nutrition tracking and meal logging
 * Supports both manual entry and food tracking app integration
 * Currently returns dummy data
 */

import { supabase } from './supabase';
import { getMigraineEpisodes } from './migraineEpisodes';

/**
 * Get nutrition data for a specific date
 * @param {string} userId - User ID (null for current user)
 * @param {Date} date - Date to get nutrition for
 * @returns {Promise<{data: Object, error?: string}>}
 */
export const getNutritionData = async (userId = null, date = new Date()) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // TODO: Replace with actual nutrition data from database or food tracking app
    // const { data, error } = await supabase
    //   .from('nutrition_logs')
    //   .select('*')
    //   .eq('user_id', userId || user.id)
    //   .eq('date', date.toISOString().split('T')[0])
    //   .single();

    // Mock data
    const mockDaily = {
      carbs: 45,
      protein: 30,
      fat: 25,
      calories: 1850,
      fiber: 25,
      sugar: 45,
    };

    const mockMeals = [
      {
        name: 'Breakfast',
        icon: 'sunny-outline',
        details: 'Oatmeal with berries and almonds',
        calories: 420,
        time: '08:00',
      },
      {
        name: 'Lunch',
        icon: 'partly-sunny-outline',
        details: 'Grilled chicken salad with olive oil',
        calories: 580,
        time: '13:00',
      },
      {
        name: 'Dinner',
        icon: 'moon-outline',
        details: 'Salmon with quinoa and vegetables',
        calories: 650,
        time: '19:00',
      },
      {
        name: 'Snack',
        icon: 'cafe-outline',
        details: 'Greek yogurt with honey',
        calories: 200,
        time: '15:30',
      },
    ];

    const mockWarnings = await getTriggerFoodWarnings(userId || user.id);

    return {
      data: {
        daily: mockDaily,
        meals: mockMeals,
        water: 6,
        warnings: mockWarnings.data || [],
        date: date.toISOString(),
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Log a meal
 * @param {Object} mealData - Meal data
 * @returns {Promise<{data: Object, error?: string}>}
 */
export const logMeal = async (mealData) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // TODO: Replace with actual database insert
    // const { data, error } = await supabase
    //   .from('nutrition_logs')
    //   .insert({
    //     user_id: user.id,
    //     meal_type: mealData.mealType,
    //     food_items: mealData.foodItems,
    //     calories: mealData.calories,
    //     macros: mealData.macros,
    //     date: mealData.date || new Date().toISOString(),
    //   })
    //   .select()
    //   .single();

    // Mock response
    const mockMeal = {
      id: 'new-meal-id',
      ...mealData,
      created_at: new Date().toISOString(),
    };

    return { data: mockMeal, error: null };
  } catch (error) {
    console.error('Error logging meal:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get trigger food warnings based on migraine patterns
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array<string>, error?: string}>}
 */
export const getTriggerFoodWarnings = async (userId) => {
  try {
    // Get user's migraine episodes to analyze triggers
    const { data: episodes } = await getMigraineEpisodes({ limit: 50 });

    // Common trigger foods
    const commonTriggers = [
      'Chocolate',
      'Aged cheese',
      'Processed meats',
      'Red wine',
      'Caffeine',
      'Artificial sweeteners',
      'MSG',
      'Citrus fruits',
      'Nuts',
      'Dairy products',
    ];

    // Analyze episodes for food-related triggers
    const foodTriggers = [];
    if (episodes && episodes.length > 0) {
      episodes.forEach(episode => {
        if (episode.suspected_triggers) {
          episode.suspected_triggers.forEach(trigger => {
            const lowerTrigger = trigger.toLowerCase();
            commonTriggers.forEach(food => {
              if (lowerTrigger.includes(food.toLowerCase()) && !foodTriggers.includes(food)) {
                foodTriggers.push(food);
              }
            });
          });
        }
      });
    }

    // Generate warnings
    const warnings = foodTriggers.map(food => 
      `Consider avoiding ${food} - it may be a trigger based on your migraine history.`
    );

    // Add some default warnings if no triggers found
    if (warnings.length === 0) {
      warnings.push('Keep track of your meals to identify potential trigger foods.');
    }

    return { data: warnings, error: null };
  } catch (error) {
    console.error('Error getting trigger food warnings:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Get nutrition history for a date range
 * @param {string} userId - User ID (null for current user)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<{data: Array, error?: string}>}
 */
export const getNutritionHistory = async (userId = null, startDate, endDate) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // TODO: Replace with actual database query
    // const { data, error } = await supabase
    //   .from('nutrition_logs')
    //   .select('*')
    //   .eq('user_id', userId || user.id)
    //   .gte('date', startDate.toISOString().split('T')[0])
    //   .lte('date', endDate.toISOString().split('T')[0])
    //   .order('date', { ascending: false });

    // Mock data
    return { data: [], error: null };
  } catch (error) {
    console.error('Error fetching nutrition history:', error);
    return { data: null, error: error.message };
  }
};

