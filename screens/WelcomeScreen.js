import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from '../config/theme';
import { hasSeenWelcome, markWelcomeSeen, hasCompletedOnboarding, hasGrantedPermissions, getNextScreenAfterAuth } from '../lib/navigationHelper';

export default function WelcomeScreen({ navigation }) {
  const { user } = useAuth();
  
  // Extract first name from user metadata or email
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                    user?.email?.split('@')[0] || 
                    'there';

  // Check if user should see this screen
  useEffect(() => {
    const checkAndRedirect = async () => {
      const welcomeSeen = await hasSeenWelcome();
      if (welcomeSeen) {
        // User has already seen welcome, skip to next screen
        const nextScreen = await getNextScreenAfterAuth();
        navigation.replace(nextScreen);
      } else {
        // Mark welcome as seen when screen is displayed
        await markWelcomeSeen();
      }
    };
    
    checkAndRedirect();
  }, [navigation]);

  const handleStart = () => {
    // Navigate to chatbot screen for onboarding
    navigation.replace('Chat');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          'rgba(180, 103, 255, 1)',   // #B467FF - 7%
          'rgba(95, 57, 139, 1)',     // #5F398B - 29%
          'rgba(74, 46, 110, 1)',     // #4A2E6E - 35%
          'rgba(53, 35, 81, 1)',      // #352351 - 45%
          'rgba(31, 23, 52, 1)',      // #1F1734 - 63%
          'rgba(10, 12, 23, 1)',      // #0A0C17 - 100%
        ]}
        locations={[0.07, 0.29, 0.35, 0.45, 0.63, 1]}
        // Approximating the iOS transform with diagonal gradient
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          {/* Greeting */}
          <Text style={styles.greeting}>Hi {firstName},</Text>

          {/* Illustration placeholder - will be replaced with actual illustration */}
          <View style={styles.illustrationContainer}>
            {/* Doctor illustration placeholder */}
            <View style={styles.illustrationPlaceholder}>
              {/* This will be replaced with actual SVG/image illustration */}
              <View style={styles.doctorPlaceholder}>
                <View style={styles.doctorHead} />
                <View style={styles.doctorBody} />
              </View>
              
              {/* Medical icons around doctor */}
              <View style={styles.iconBubble1}>
                <Text style={styles.iconText}>📄</Text>
              </View>
              <View style={styles.iconBubble2}>
                <Text style={styles.iconText}>🏥</Text>
              </View>
              <View style={styles.iconBubble3}>
                <Text style={styles.iconText}>💓</Text>
              </View>
              <View style={styles.iconBubble4}>
                <Text style={styles.iconText}>💊</Text>
              </View>
            </View>
          </View>

          {/* Welcome Message */}
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.welcomeSubtext}>to AURICORE AI chatbot!</Text>
          </View>

          {/* Descriptive Text */}
          <Text style={styles.description}>
            I'll learn your pattern, guide you through your triggers and help you navigate every day with more comfort!
          </Text>

          {/* Start Button */}
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl + 60,
    paddingBottom: spacing.xl + 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  illustrationPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  doctorPlaceholder: {
    width: 120,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  doctorHead: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 10,
  },
  doctorBody: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
  },
  iconBubble1: {
    position: 'absolute',
    top: 20,
    left: '20%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(173, 216, 230, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubble2: {
    position: 'absolute',
    top: 20,
    right: '20%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(173, 216, 230, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubble3: {
    position: 'absolute',
    bottom: 40,
    left: '20%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(173, 216, 230, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubble4: {
    position: 'absolute',
    bottom: 40,
    right: '20%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(173, 216, 230, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  welcomeText: {
    fontSize: fontSizes.huge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: fontSizes.xxlarge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  startButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  startButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
});

