/**
 * Nutritionist Service
 * Handles AI meal planning and nutritionist consultations
 * Currently returns dummy data
 */

import { supabase } from './supabase';
import { getMigraineEpisodes } from './migraineEpisodes';
import { getSleepStages } from './sleepStages';

/**
 * Get AI-generated meal plan
 * @param {string} userId - User ID (null for current user)
 * @param {Object} preferences - User preferences
 * @returns {Promise<{data: Object, error?: string}>}
 */
export const getAIMealPlan = async (userId = null, preferences = {}) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Get user's migraine triggers and health data to personalize meal plan
    const { data: episodes } = await getMigraineEpisodes({ limit: 10 });
    const { data: sleepData } = await getSleepStages(userId, { days: 7 });

    // Analyze triggers to avoid trigger foods
    const triggers = [];
    if (episodes && episodes.length > 0) {
      episodes.forEach(episode => {
        if (episode.suspected_triggers) {
          triggers.push(...episode.suspected_triggers);
        }
      });
    }

    // TODO: Replace with actual AI meal plan generation
    // This would integrate with an AI service or use ML model
    // For now, return mock personalized meal plan

    const mockMealPlan = {
      weeklyMeals: [
        {
          day: 'Monday',
          meals: [
            { name: 'Oatmeal with berries', icon: 'sunny-outline' },
            { name: 'Grilled chicken salad', icon: 'partly-sunny-outline' },
            { name: 'Salmon with quinoa', icon: 'moon-outline' },
          ],
        },
        {
          day: 'Tuesday',
          meals: [
            { name: 'Greek yogurt parfait', icon: 'sunny-outline' },
            { name: 'Turkey wrap', icon: 'partly-sunny-outline' },
            { name: 'Vegetable stir-fry', icon: 'moon-outline' },
          ],
        },
        {
          day: 'Wednesday',
          meals: [
            { name: 'Smoothie bowl', icon: 'sunny-outline' },
            { name: 'Quinoa salad', icon: 'partly-sunny-outline' },
            { name: 'Baked cod with vegetables', icon: 'moon-outline' },
          ],
        },
        {
          day: 'Thursday',
          meals: [
            { name: 'Scrambled eggs with spinach', icon: 'sunny-outline' },
            { name: 'Lentil soup', icon: 'partly-sunny-outline' },
            { name: 'Chicken and sweet potato', icon: 'moon-outline' },
          ],
        },
        {
          day: 'Friday',
          meals: [
            { name: 'Avocado toast', icon: 'sunny-outline' },
            { name: 'Mediterranean bowl', icon: 'partly-sunny-outline' },
            { name: 'Grilled vegetables', icon: 'moon-outline' },
          ],
        },
        {
          day: 'Saturday',
          meals: [
            { name: 'Pancakes with fruit', icon: 'sunny-outline' },
            { name: 'Caesar salad', icon: 'partly-sunny-outline' },
            { name: 'Pasta with vegetables', icon: 'moon-outline' },
          ],
        },
        {
          day: 'Sunday',
          meals: [
            { name: 'Breakfast burrito', icon: 'sunny-outline' },
            { name: 'Soup and sandwich', icon: 'partly-sunny-outline' },
            { name: 'Roasted chicken', icon: 'moon-outline' },
          ],
        },
      ],
      recipes: [
        {
          name: 'Magnesium-Rich Smoothie',
          description: 'A delicious smoothie packed with magnesium to help prevent migraines',
          tags: ['High Magnesium', 'Quick', 'Breakfast'],
        },
        {
          name: 'Anti-Inflammatory Salmon Bowl',
          description: 'Omega-3 rich meal to reduce inflammation',
          tags: ['Anti-Inflammatory', 'High Protein', 'Dinner'],
        },
        {
          name: 'Hydration-Boosting Salad',
          description: 'Fresh vegetables to keep you hydrated',
          tags: ['Hydrating', 'Light', 'Lunch'],
        },
      ],
      shoppingList: [
        'Spinach',
        'Salmon',
        'Quinoa',
        'Berries',
        'Almonds',
        'Greek yogurt',
        'Sweet potatoes',
        'Leafy greens',
        'Olive oil',
        'Chicken breast',
      ],
      personalizedNotes: triggers.length > 0
        ? `Based on your migraine patterns, this meal plan avoids common trigger foods. Focus on magnesium-rich foods and stay hydrated.`
        : 'This meal plan focuses on balanced nutrition and migraine prevention.',
    };

    return { data: mockMealPlan, error: null };
  } catch (error) {
    console.error('Error generating AI meal plan:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get personalized nutritionist recommendations
 * @param {string} userId - User ID (null for current user)
 * @returns {Promise<{data: Array<string>, error?: string}>}
 */
export const getNutritionistRecommendations = async (userId = null) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Get user data for personalized recommendations
    const { data: episodes } = await getMigraineEpisodes({ limit: 10 });
    const { data: sleepData } = await getSleepStages(userId, { days: 7 });

    // Generate recommendations based on patterns
    const recommendations = [
      'Increase magnesium intake through leafy greens and nuts',
      'Stay hydrated - aim for 8 glasses of water daily',
      'Eat regular meals to maintain stable blood sugar',
      'Consider adding omega-3 rich foods like salmon',
      'Limit processed foods and artificial sweeteners',
    ];

    // Add sleep-based recommendations
    if (sleepData && sleepData.metrics && sleepData.metrics.efficiency < 80) {
      recommendations.push('Improve sleep quality - avoid heavy meals before bedtime');
    }

    return { data: recommendations, error: null };
  } catch (error) {
    console.error('Error getting nutritionist recommendations:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Book a consultation with a nutritionist
 * @param {string} nutritionistId - Nutritionist ID
 * @param {Date} date - Consultation date
 * @returns {Promise<{data: Object, error?: string}>}
 */
export const bookConsultation = async (nutritionistId, date) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // TODO: Replace with actual database insert
    // const { data, error } = await supabase
    //   .from('nutritionist_consultations')
    //   .insert({
    //     user_id: user.id,
    //     nutritionist_id: nutritionistId,
    //     consultation_date: date.toISOString(),
    //     status: 'scheduled',
    //   })
    //   .select()
    //   .single();

    // Mock response
    const mockConsultation = {
      id: 'new-consultation-id',
      user_id: user.id,
      nutritionist_id: nutritionistId,
      consultation_date: date.toISOString(),
      status: 'scheduled',
      created_at: new Date().toISOString(),
    };

    return { data: mockConsultation, error: null };
  } catch (error) {
    console.error('Error booking consultation:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Get consultation history
 * @param {string} userId - User ID (null for current user)
 * @returns {Promise<{data: Array, error?: string}>}
 */
export const getConsultationHistory = async (userId = null) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const targetUserId = userId || user.id;

    // TODO: Replace with actual database query
    // const { data, error } = await supabase
    //   .from('nutritionist_consultations')
    //   .select(`
    //     *,
    //     nutritionist:nutritionist_id (
    //       name,
    //       specialization
    //     )
    //   `)
    //   .eq('user_id', targetUserId)
    //   .order('consultation_date', { ascending: false });

    // Mock data
    const mockConsultations = [
      {
        id: '1',
        nutritionist_id: '1',
        consultation_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        notes: 'Discussed magnesium-rich diet and hydration strategies',
      },
    ];

    return { data: mockConsultations, error: null };
  } catch (error) {
    console.error('Error fetching consultation history:', error);
    return { data: [], error: error.message };
  }
};

