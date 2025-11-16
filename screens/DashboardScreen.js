import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, gradients } from '../config/theme';
import { fetchCalendarData, getCurrentLocation } from '../lib/healthData';
import * as Calendar from 'expo-calendar';
import { getLastMigraineDate } from '../lib/migraineEpisodes';
import { getMigraineRisk } from '../lib/migrainePrediction';
import { getCurrentWeather, getWeatherIconName } from '../lib/weather';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import BrainIcon from '../components/BrainIcon';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [calendarData, setCalendarData] = useState(null);
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [migraineRisk, setMigraineRisk] = useState(75);
  const [riskLoading, setRiskLoading] = useState(true);
  const [lastMigraine, setLastMigraine] = useState(null);
  const [lastMigraineLoading, setLastMigraineLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Extract first name from user metadata or email
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                    user?.email?.split('@')[0] || 
                    'there';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Load last migraine date
    try {
      setLastMigraineLoading(true);
      const { data: lastDate } = await getLastMigraineDate();
      if (lastDate) {
        const date = new Date(lastDate);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        setLastMigraine({
          day: date.getDate(),
          month: months[date.getMonth()],
        });
      } else {
        setLastMigraine(null);
      }
    } catch (error) {
      console.error('Error loading last migraine date:', error);
    } finally {
      setLastMigraineLoading(false);
    }

    // Load migraine risk
    try {
      setRiskLoading(true);
      const { data: riskData } = await getMigraineRisk(null, { timeframe: 'hourly' });
      if (riskData) {
        setMigraineRisk(riskData.risk);
      }
    } catch (error) {
      console.error('Error loading migraine risk:', error);
    } finally {
      setRiskLoading(false);
    }

    // Load calendar data
    try {
      const { data } = await fetchCalendarData({ daysAhead: 1 });
      if (data) {
        setCalendarData(data);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }

    // Load location and weather
    try {
      setWeatherLoading(true);
      const loc = await getCurrentLocation();
      if (loc.latitude && loc.longitude) {
        setLocation(loc);
        
        // Fetch weather data
        const { data: weather } = await getCurrentWeather(loc.latitude, loc.longitude);
        if (weather) {
          setWeatherData(weather);
        }
      }
    } catch (error) {
      console.error('Error loading location/weather:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Check if calendar is packed today
  const isCalendarPacked = () => {
    if (!calendarData) return false;
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = calendarData.events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === today;
    });
    return todayEvents.length >= 3 || calendarData.stressIndicators.hasBackToBackMeetings;
  };

  // Get calendar insight message
  const getCalendarInsight = () => {
    if (!calendarData) {
      return "Connect your calendar to get insights about your schedule.";
    }
    
    if (isCalendarPacked()) {
      return "Your calendar is packed today. This could contribute to migraine stress triggers.";
    }
    
    if (calendarData.stressIndicators.hasLongDays) {
      return "You have long days scheduled this week. Remember to take breaks.";
    }
    
    return "Your schedule looks balanced today.";
  };

  // Request calendar permission and reload data
  const handleRequestCalendarPermission = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status === 'granted') {
        // Reload calendar data after permission is granted
        const { data } = await fetchCalendarData({ daysAhead: 1 });
        if (data) {
          setCalendarData(data);
        }
        Alert.alert(
          'Calendar Connected',
          'Your calendar has been connected successfully!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'Calendar permission is required to provide schedule insights. You can enable it in Settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting calendar permission:', error);
      Alert.alert(
        'Error',
        'Failed to request calendar permission. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Get current time and date
  const getCurrentTimeDate = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const day = now.getDate();
    const month = now.getMonth() + 1;
    return { time: `${hours}:${minutes}`, date: `${day}/${month}` };
  };

  const { time, date } = getCurrentTimeDate();
  const locationName = weatherData?.location?.name || location ? 'Location' : 'Location';
  const temperature = weatherData?.temperature || 12;
  const weatherIcon = weatherData?.icon ? getWeatherIconName(weatherData.icon) : 'sunny';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[
          '#0A0C17',  // Darkest at start (top right)
          '#1F1734',  // At 33.19%
          '#352351',  // At 51.79% (lighter at bottom left)
        ]}
        locations={[0, 0.3319, 0.5179]}
        start={{ x: 1, y: 0 }}  // Top right (darker)
        end={{ x: 0, y: 1 }}    // Bottom left (lighter)
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Hi, {firstName}</Text>
            <Text style={styles.welcomeText}>Welcome To Auricore!</Text>
          </View>

          {/* Top Row Cards */}
          <View style={styles.topRow}>
            {/* Last Migraine Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Last migraine</Text>
              {lastMigraineLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.textWhite} />
                </View>
              ) : lastMigraine ? (
                <View style={styles.migraineDateContainer}>
                  <Text style={styles.migraineDay}>{lastMigraine.day}</Text>
                  <Text style={styles.migraineMonth}>{lastMigraine.month}</Text>
                </View>
              ) : (
                <Text style={styles.noDataText}>No episodes yet</Text>
              )}
            </View>

            {/* Migraine Risk Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Migraine risk hourly</Text>
              <View style={styles.riskContainer}>
                {riskLoading ? (
                  <ActivityIndicator size="small" color={colors.textWhite} />
                ) : (
                  <CircularProgress value={migraineRisk} />
                )}
              </View>
            </View>
          </View>

          {/* Water Reminder Card */}
          <View style={styles.reminderCard}>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Don't forget to drink water</Text>
              <Text style={styles.reminderSubtitle}>Looks like you haven't taken enough water today</Text>
            </View>
            <View style={styles.waterDropContainer}>
              <View style={styles.waterDrop}>
                <Ionicons name="water" size={40} color="#CEA7FF" />
              </View>
            </View>
          </View>

          {/* Calendar Insight Card */}
          {!calendarData ? (
            <TouchableOpacity 
              style={styles.calendarCard}
              onPress={handleRequestCalendarPermission}
              activeOpacity={0.7}
            >
              <View style={styles.calendarIconContainer}>
                <Ionicons name="calendar-outline" size={40} color={colors.textWhite} />
              </View>
              <View style={styles.calendarTextContainer}>
                <Text style={styles.calendarText}>{getCalendarInsight()}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.calendarCard}>
              <View style={styles.calendarIconContainer}>
                <Ionicons name="calendar-outline" size={40} color={colors.textWhite} />
              </View>
              <View style={styles.calendarTextContainer}>
                <Text style={styles.calendarText}>{getCalendarInsight()}</Text>
              </View>
            </View>
          )}

          {/* Weather Card */}
          <View style={styles.weatherCard}>
            <View style={styles.weatherLeft}>
              <Text style={styles.locationText}>{locationName}</Text>
              <Text style={styles.timeDateText}>{time} • {date}</Text>
              {weatherLoading ? (
                <ActivityIndicator size="small" color={colors.textWhite} style={{ marginTop: spacing.sm }} />
              ) : (
                <Text style={styles.temperatureText}>{temperature}°</Text>
              )}
            </View>
            <View style={styles.weatherIconContainer}>
              <View style={styles.weatherIcon}>
                <Ionicons name={weatherIcon} size={48} color="#FFA500" />
              </View>
            </View>
          </View>

          {/* Insights Card */}
          <TouchableOpacity
            style={styles.insightsCard}
            onPress={() => navigation.navigate('Insights')}
            activeOpacity={0.7}
          >
            <View style={styles.insightsCardContent}>
              <View style={styles.insightsIconContainer}>
                <Ionicons name="sparkles" size={32} color={colors.primary} />
              </View>
              <View style={styles.insightsTextContainer}>
                <Text style={styles.insightsCardTitle}>View Insights</Text>
                <Text style={styles.insightsCardSubtitle}>
                  Sleep stages, nutrition tracking, and doctor reports
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textWhite} />
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableIcon 
            name="home-outline" 
            active={true}
            showDot={true}
            onPress={() => navigation.navigate('Dashboard')} 
          />
          <TouchableIcon 
            name="sparkles-outline" 
            onPress={() => navigation.navigate('Insights')} 
          />
          <TouchableIcon 
            name="brain" 
            isBrain={true}
            isFocused={true}
            onPress={() => navigation.navigate('BrainMeditation')} 
          />
          <TouchableIcon 
            name="globe-outline" 
            onPress={() => navigation.navigate('Community')} 
          />
          <TouchableIcon 
            name="person-outline" 
            onPress={() => navigation.navigate('Profile')} 
          />
        </View>
      </LinearGradient>
    </View>
  );
}

// Circular Progress Component
function CircularProgress({ value }) {
  const size = 105; // Increased from 70 to match Figma design
  const strokeWidth = 20; // Increased from 6 to make it fatter (matches Figma: border: 20px)
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const remaining = circumference - progress;

  return (
    <View style={styles.progressContainer}>
      <Svg width={size} height={size} style={styles.progressSvg}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={remaining}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <Text style={styles.riskPercentage}>{value}%</Text>
    </View>
  );
}

// Navigation Icon Component
function TouchableIcon({ name, active = false, onPress, isBrain = false, isFocused = false, showDot = false }) {
  return (
    <TouchableOpacity 
      style={styles.navIconContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isBrain && isFocused ? (
        <View style={styles.brainIconWrapper}>
          <View style={styles.brainGlowCircle}>
            <BrainIcon width={28} height={28} color={colors.textWhite} />
          </View>
        </View>
      ) : (
        <View style={styles.navIcon}>
          {isBrain ? (
            <BrainIcon width={24} height={24} color={colors.textWhite} />
          ) : (
            <Ionicons 
              name={name} 
              size={24} 
              color={colors.textWhite}
            />
          )}
          {showDot && active && (
            <View style={styles.activeDot} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl + 20,
    paddingBottom: 100, // Space for bottom nav
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  welcomeText: {
    fontSize: fontSizes.large,
    fontFamily: fonts.regular,
    color: colors.textWhite,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(74, 46, 110, 0.3)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#B467FF',
    ...shadows.medium,
  },
  cardTitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  migraineDateContainer: {
    alignItems: 'flex-start',
  },
  migraineDay: {
    fontSize: fontSizes.huge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    lineHeight: fontSizes.huge * 1.2,
  },
  migraineMonth: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    opacity: 0.8,
  },
  riskContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  progressContainer: {
    width: 105,
    height: 105,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressSvg: {
    position: 'absolute',
  },
  riskPercentage: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    position: 'absolute',
    zIndex: 1,
  },
  reminderCard: {
    height: 75,
    backgroundColor: 'rgba(74, 46, 110, 0.3)', // rgba(0.289, 0.181, 0.431, 0.3)
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#B467FF', // rgba(0.706, 0.404, 1, 1)
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.medium,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  reminderSubtitle: {
    fontSize: fontSizes.tiny,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    lineHeight: 14,
    textAlign: 'left',
  },
  waterDropContainer: {
    marginLeft: spacing.md,
  },
  waterDrop: {
    width: 50,
    height: 50,
    borderRadius: 7,
    backgroundColor: 'rgba(108, 62, 153, 0.5)', // Radial gradient effect approximation
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  calendarCard: {
    backgroundColor: 'rgba(74, 46, 110, 0.3)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B467FF',
    ...shadows.medium,
  },
  calendarIconContainer: {
    marginRight: spacing.md,
  },
  calendarTextContainer: {
    flex: 1,
  },
  calendarText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    lineHeight: fontSizes.medium * 1.4,
  },
  weatherCard: {
    backgroundColor: 'rgba(74, 46, 110, 0.3)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B467FF',
    ...shadows.medium,
  },
  weatherLeft: {
    flex: 1,
  },
  locationText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  timeDateText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    opacity: 0.8,
    marginBottom: spacing.sm,
  },
  temperatureText: {
    fontSize: fontSizes.huge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  weatherIconContainer: {
    marginLeft: spacing.md,
  },
  weatherIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightsCard: {
    backgroundColor: 'rgba(74, 46, 110, 0.3)',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#B467FF',
    ...shadows.medium,
  },
  insightsCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.medium,
    backgroundColor: 'rgba(180, 103, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  insightsTextContainer: {
    flex: 1,
  },
  insightsCardTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  insightsCardSubtitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    opacity: 0.8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(31, 23, 52, 0.95)', // Dark purple-blue color
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(180, 103, 255, 0.3)',
    ...shadows.large,
  },
  navIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  navIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textWhite,
    marginTop: 4,
  },
  brainIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainGlowCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(95, 58, 139, 0.8)', // Purple glow color
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B467FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    opacity: 0.7,
    marginTop: spacing.sm,
  },
});

