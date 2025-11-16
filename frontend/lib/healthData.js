/**
 * Health Data Service
 * Handles HealthKit, location, and wearable device data collection
 */

import { Platform } from 'react-native';
import { supabase } from './supabase';
import * as Location from 'expo-location';
import * as Calendar from 'expo-calendar';
import { syncHealthDataToFirebase } from './firebase';

/**
 * Request all health-related permissions
 * @returns {Promise<{success: boolean, permissions: object, error?: string}>}
 */
export const requestHealthPermissions = async () => {
  try {
    const permissions = {
      location: false,
      healthKit: false,
      calendar: false,
    };

    // Request location permission
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      permissions.location = status === 'granted';
      
      if (permissions.location) {
        // Also request background location for continuous tracking
        const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
        // Background permission is optional, we'll use foreground if background is denied
      }
    } catch (error) {
      console.error('Location permission error:', error);
    }

    // Request calendar permission
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      permissions.calendar = status === 'granted';
    } catch (error) {
      console.error('Calendar permission error:', error);
    }

    // HealthKit permissions (iOS only)
    if (Platform.OS === 'ios') {
      try {
        // Note: HealthKit requires native module
        // For now, we'll create a structure that can be extended
        // You'll need to install react-native-health or create a native module
        permissions.healthKit = await requestHealthKitPermissions();
      } catch (error) {
        console.error('HealthKit permission error:', error);
      }
    }

    return {
      success: permissions.location || permissions.healthKit || permissions.calendar,
      permissions,
    };
  } catch (error) {
    console.error('Error requesting health permissions:', error);
    return {
      success: false,
      permissions: {},
      error: error.message,
    };
  }
};

/**
 * Request HealthKit permissions
 * Note: This requires native iOS HealthKit integration
 * For Expo, you'll need to use a development build or eject
 */
const requestHealthKitPermissions = async () => {
  // TODO: Implement HealthKit permission request
  // This requires native code or a library like react-native-health
  // For now, return false and log that it needs native implementation
  console.warn('HealthKit requires native iOS implementation. Please install react-native-health or create a native module.');
  return false;
};

/**
 * Get current location
 * @returns {Promise<{latitude: number, longitude: number, error?: string}>}
 */
export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return { error: 'Location permission not granted' };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return { error: error.message };
  }
};

/**
 * Start location tracking
 * @returns {Promise<{subscription: object, error?: string}>}
 */
export const startLocationTracking = async (callback) => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return { error: 'Location permission not granted' };
    }

    // Start watching position
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 300000, // 5 minutes
        distanceInterval: 100, // 100 meters
      },
      (location) => {
        if (callback) {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().toISOString(),
          });
        }
      }
    );

    return { subscription };
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return { error: error.message };
  }
};

/**
 * Fetch calendar events for schedule analysis
 * Analyzes busy periods to predict stress-related migraine triggers
 * @param {Object} options - Options for fetching calendar data
 * @param {number} options.daysAhead - Number of days to look ahead (default: 30)
 * @returns {Promise<{data: object, error?: string}>}
 */
export const fetchCalendarData = async (options = {}) => {
  try {
    const { daysAhead = 30 } = options;
    
    // Check calendar permission
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== 'granted') {
      return { data: null, error: 'Calendar permission not granted' };
    }

    // Get all calendars
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    if (calendars.length === 0) {
      return { data: { events: [], busyDays: 0, totalEvents: 0 } };
    }

    // Calculate date range
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + daysAhead);

    // Fetch events from all calendars
    const allEvents = [];
    for (const calendar of calendars) {
      try {
        const events = await Calendar.getEventsAsync(
          [calendar.id],
          now,
          endDate
        );
        allEvents.push(...events);
      } catch (error) {
        console.warn(`Error fetching events from calendar ${calendar.id}:`, error);
      }
    }

    // Analyze schedule busyness
    const busyDays = analyzeScheduleBusyness(allEvents, now, endDate);
    
    // Calculate metrics for migraine prediction
    const calendarData = {
      events: allEvents.map(event => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        allDay: event.allDay,
        calendarId: event.calendarId,
      })),
      totalEvents: allEvents.length,
      busyDays: busyDays.total,
      averageEventsPerDay: busyDays.average,
      busiestDay: busyDays.busiest,
      consecutiveBusyDays: busyDays.maxConsecutive,
      // Stress indicators
      stressIndicators: {
        hasBackToBackMeetings: busyDays.hasBackToBack,
        hasLongDays: busyDays.hasLongDays,
        hasEarlyMornings: busyDays.hasEarlyMornings,
        hasLateNights: busyDays.hasLateNights,
      },
      dateRange: {
        start: now.toISOString(),
        end: endDate.toISOString(),
      },
    };

    return { data: calendarData };
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return { error: error.message };
  }
};

/**
 * Analyze schedule busyness for migraine prediction
 * @param {Array} events - Calendar events
 * @param {Date} startDate - Start of analysis period
 * @param {Date} endDate - End of analysis period
 * @returns {Object} Busyness metrics
 */
const analyzeScheduleBusyness = (events, startDate, endDate) => {
  // Group events by day
  const eventsByDay = {};
  const dayStart = new Date(startDate);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(endDate);
  dayEnd.setHours(23, 59, 59, 999);

  // Initialize all days in range
  for (let d = new Date(dayStart); d <= dayEnd; d.setDate(d.getDate() + 1)) {
    const dayKey = d.toISOString().split('T')[0];
    eventsByDay[dayKey] = {
      events: [],
      totalDuration: 0,
      eventCount: 0,
      hasEarlyMorning: false,
      hasLateNight: false,
    };
  }

  // Process events
  events.forEach(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const dayKey = eventStart.toISOString().split('T')[0];
    
    if (eventsByDay[dayKey]) {
      const duration = eventEnd - eventStart;
      eventsByDay[dayKey].events.push(event);
      eventsByDay[dayKey].totalDuration += duration;
      eventsByDay[dayKey].eventCount += 1;
      
      // Check for early morning (before 8 AM)
      if (eventStart.getHours() < 8) {
        eventsByDay[dayKey].hasEarlyMorning = true;
      }
      
      // Check for late night (after 9 PM)
      if (eventEnd.getHours() >= 21) {
        eventsByDay[dayKey].hasLateNight = true;
      }
    }
  });

  // Calculate metrics
  const days = Object.values(eventsByDay);
  const busyDays = days.filter(day => day.eventCount >= 3 || day.totalDuration >= 4 * 60 * 60 * 1000); // 3+ events or 4+ hours
  
  // Find busiest day
  const busiestDay = days.reduce((max, day) => 
    day.eventCount > max.eventCount ? day : max, 
    { eventCount: 0, totalDuration: 0 }
  );

  // Check for back-to-back meetings (events with < 30 min gap)
  let hasBackToBack = false;
  let hasLongDays = false;
  let hasEarlyMornings = false;
  let hasLateNights = false;
  let maxConsecutive = 0;
  let currentConsecutive = 0;

  days.forEach((day, index) => {
    const isBusy = day.eventCount >= 3 || day.totalDuration >= 4 * 60 * 60 * 1000;
    
    if (isBusy) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      
      if (day.totalDuration >= 8 * 60 * 60 * 1000) { // 8+ hours
        hasLongDays = true;
      }
      if (day.hasEarlyMorning) {
        hasEarlyMornings = true;
      }
      if (day.hasLateNight) {
        hasLateNights = true;
      }
    } else {
      currentConsecutive = 0;
    }

    // Check for back-to-back meetings
    if (day.events.length > 1) {
      const sortedEvents = [...day.events].sort((a, b) => 
        new Date(a.startDate) - new Date(b.startDate)
      );
      
      for (let i = 0; i < sortedEvents.length - 1; i++) {
        const gap = new Date(sortedEvents[i + 1].startDate) - new Date(sortedEvents[i].endDate);
        if (gap > 0 && gap < 30 * 60 * 1000) { // Less than 30 minutes
          hasBackToBack = true;
          break;
        }
      }
    }
  });

  return {
    total: busyDays.length,
    average: days.length > 0 ? days.reduce((sum, day) => sum + day.eventCount, 0) / days.length : 0,
    busiest: {
      eventCount: busiestDay.eventCount,
      totalDuration: busiestDay.totalDuration,
    },
    maxConsecutive,
    hasBackToBack,
    hasLongDays,
    hasEarlyMornings,
    hasLateNights,
  };
};

/**
 * Fetch HealthKit data
 * Note: This requires native HealthKit integration
 * @param {Array<string>} dataTypes - Types of health data to fetch
 * @returns {Promise<{data: object, error?: string}>}
 */
export const fetchHealthKitData = async (dataTypes = []) => {
  try {
    // TODO: Implement HealthKit data fetching
    // This requires native code or react-native-health library
    // Example data types: steps, heartRate, sleep, menstrualCycle, etc.
    
    const healthData = {
      steps: null,
      heartRate: null,
      sleep: null,
      menstrualCycle: null,
      workouts: null,
      activeEnergy: null,
      restingHeartRate: null,
      walkingHeartRate: null,
      bloodOxygen: null,
      bodyTemperature: null,
      respiratoryRate: null,
    };

    // Placeholder for actual HealthKit implementation
    console.warn('HealthKit data fetching requires native implementation');

    return { data: healthData };
  } catch (error) {
    console.error('Error fetching HealthKit data:', error);
    return { error: error.message };
  }
};

/**
 * Save health data to Supabase
 * Uses upsert to update existing record or create new one based on user_id
 * @param {Object} healthData - Health data object
 * @returns {Promise<{data, error}>}
 */
export const saveHealthData = async (healthData) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const dataToSave = {
      user_id: user.id,
      ...healthData,
      synced_at: new Date().toISOString(),
    };

    // Use upsert to update existing record or insert new one
    // onConflict: 'user_id' ensures we update if a record with this user_id exists
    const { data, error } = await supabase
      .from('health_data')
      .upsert(dataToSave, {
        onConflict: 'user_id',
        ignoreDuplicates: false, // We want to update, not ignore
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving health data:', error);
      return { data: null, error };
    }

    // Sync to Firebase for ML pipeline
    if (data) {
      try {
        // Get the full health data including all fields
        const { data: fullHealthData, error: fetchError } = await supabase
          .from('health_data')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!fetchError && fullHealthData) {
          await syncHealthDataToFirebase(fullHealthData, user.id);
        }
      } catch (firebaseError) {
        console.error('Error syncing health data to Firebase:', firebaseError);
        // Don't block save if Firebase sync fails
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception saving health data:', error);
    return { data: null, error: { message: error.message } };
  }
};

/**
 * Sync all health data (location, HealthKit, etc.)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const syncAllHealthData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const healthData = {
      user_id: user.id,
      synced_at: new Date().toISOString(),
    };

    // Get location
    const location = await getCurrentLocation();
    if (location.latitude && location.longitude) {
      healthData.location = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: new Date().toISOString(),
      };
    }

    // Get HealthKit data (if available)
    if (Platform.OS === 'ios') {
      const hkData = await fetchHealthKitData([
        'steps',
        'heartRate',
        'sleep',
        'menstrualCycle',
        'workouts',
        'activeEnergy',
        'restingHeartRate',
        'walkingHeartRate',
        'bloodOxygen',
        'bodyTemperature',
        'respiratoryRate',
      ]);
      
      if (hkData.data) {
        healthData.healthkit = hkData.data;
      }
    }

    // Get calendar data for schedule analysis
    const calendarData = await fetchCalendarData({ daysAhead: 30 });
    if (calendarData.data) {
      healthData.calendar = calendarData.data;
    }

    // Get weather data if location is available
    if (location.latitude && location.longitude) {
      try {
        const { getCurrentWeather } = await import('./weather');
        const weatherResult = await getCurrentWeather(location.latitude, location.longitude);
        if (weatherResult.data) {
          healthData.weather = weatherResult.data;
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        // Don't block save if weather fetch fails
      }
    }

    // Save to database
    const { error } = await saveHealthData(healthData);
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing health data:', error);
    return { success: false, error: error.message };
  }
};

