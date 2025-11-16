import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, gradients } from '../config/theme';

export default function BrainMeditationScreen({ navigation }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [meditationTime, setMeditationTime] = useState(0); // in seconds
  const [selectedDuration, setSelectedDuration] = useState(5); // minutes
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // inhale, hold, exhale
  const [timerActive, setTimerActive] = useState(false);
  const timerInterval = useRef(null);
  const breathingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (timerActive) {
      timerInterval.current = setInterval(() => {
        setMeditationTime(prev => {
          const newTime = prev + 1;
          if (newTime >= selectedDuration * 60) {
            setTimerActive(false);
            setIsPlaying(false);
            return selectedDuration * 60;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [timerActive, selectedDuration]);

  // Breathing animation
  useEffect(() => {
    if (isPlaying) {
      const breathingCycle = () => {
        // Inhale (4 seconds)
        setBreathingPhase('inhale');
        Animated.timing(breathingAnimation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }).start(() => {
          // Hold (2 seconds)
          setBreathingPhase('hold');
          setTimeout(() => {
            // Exhale (4 seconds)
            setBreathingPhase('exhale');
            Animated.timing(breathingAnimation, {
              toValue: 0,
              duration: 4000,
              useNativeDriver: true,
            }).start(() => {
              // Loop
              if (isPlaying) {
                breathingCycle();
              }
            });
          }, 2000);
        });
      };

      breathingCycle();
    } else {
      breathingAnimation.setValue(0);
      setBreathingPhase('inhale');
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setTimerActive(false);
    } else {
      setIsPlaying(true);
      setTimerActive(true);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimerActive(false);
    setMeditationTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const scale = breathingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const opacity = breathingAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 0.6],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={gradients.primary.colors}
        locations={gradients.primary.locations}
        start={gradients.primary.start}
        end={gradients.primary.end}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{String('Brain Meditation')}</Text>
          <View style={styles.backButton} />
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Breathing Circle */}
          <View style={styles.breathingContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            >
              <View style={styles.innerCircle}>
                <Ionicons name="leaf" size={60} color={colors.textWhite} />
              </View>
            </Animated.View>
            {isPlaying && (
              <Text style={styles.breathingText}>
                {String(breathingPhase === 'inhale' ? 'Breathe In' : 
                 breathingPhase === 'hold' ? 'Breathe Hold' : 'Breathe Out')}
              </Text>
            )}
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{String(formatTime(meditationTime))}</Text>
            <Text style={styles.timerLabel}>/{String(selectedDuration)}:00</Text>
          </View>

          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>Duration</Text>
            <View style={styles.durationButtons}>
              {[5, 10, 15, 20].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    selectedDuration === duration && styles.durationButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedDuration(duration);
                    if (meditationTime >= duration * 60) {
                      setMeditationTime(0);
                    }
                  }}
                  disabled={isPlaying}
                >
                  <Text
                    style={[
                      styles.durationButtonText,
                      selectedDuration === duration && styles.durationButtonTextActive,
                    ]}
                  >
                    {String(duration)}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              disabled={meditationTime === 0}
            >
              <Ionicons 
                name="refresh" 
                size={24} 
                color={meditationTime === 0 ? colors.textWhite + '40' : colors.textWhite} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={40}
                color={colors.textWhite}
              />
            </TouchableOpacity>

            <View style={styles.resetButton} /> 
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Relaxation Tips</Text>
            <Text style={styles.instructionsText}>
              • Find a quiet, comfortable space{'\n'}
              • Close your eyes and focus on your breathing{'\n'}
              • Let go of tension with each exhale{'\n'}
              • If your mind wanders, gently return to your breath
            </Text>
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl + 20,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.xl,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  innerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingText: {
    marginTop: spacing.lg,
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xl,
  },
  timerText: {
    fontSize: fontSizes.huge * 1.5,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  timerLabel: {
    fontSize: fontSizes.large,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    opacity: 0.7,
    marginLeft: spacing.xs,
  },
  durationContainer: {
    marginBottom: spacing.xl,
  },
  durationLabel: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    opacity: 0.8,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  durationButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  durationButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  durationButtonTextActive: {
    color: colors.textWhite,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: spacing.xl,
    gap: spacing.xl,
  },
  resetButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.large,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  instructionsTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    opacity: 0.9,
    lineHeight: 20,
  },
});

