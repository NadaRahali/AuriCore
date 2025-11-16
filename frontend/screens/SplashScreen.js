import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { gradients, borderRadius, fonts, fontSizes, colors } from '../config/theme';
import { screenStyles, headerStyles } from '../config/styles';

export default function SplashScreen({ navigation }) {
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation for text
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000, // 2 seconds for slow fade in
      useNativeDriver: true,
    }).start();

    // Navigate to login after video ends or if video fails to load
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 5000); // Fallback timeout in case video doesn't play

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim]);

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      // Video is loaded and ready
      if (!isVideoReady && (status.isPlaying || status.positionMillis > 0)) {
        setIsVideoReady(true);
      }
      // Video finished playing, navigate to login
      if (status.didJustFinish) {
        navigation.replace('Login');
      }
    }
  };

  const handleLoad = () => {
    // Video has loaded, ensure it plays
    if (videoRef.current) {
      videoRef.current.playAsync().catch(() => {
        // If play fails, still show video
        setIsVideoReady(true);
      });
    }
  };

  return (
    <View style={[screenStyles.container, styles.splashContainer]}>
      {!isVideoReady && <View style={styles.videoPlaceholder} />}
      <Video
        ref={videoRef}
        source={require('../assets/splash-screen.mov')}
        style={[styles.video, !isVideoReady && styles.videoHidden]}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        isLooping={false}
        isMuted={false}
        useNativeControls={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onLoad={handleLoad}
      />
      <View style={styles.overlayContainer}>
        <Animated.Text style={[headerStyles.appName, { opacity: fadeAnim }]}>
          AURICORE
        </Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
          PREDICT & PREVENT YOUR MIGRAINE
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.large,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  videoHidden: {
    opacity: 0,
  },
  videoPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tagline: {
    fontSize: fontSizes.tiny, // 12
    fontFamily: fonts.geologica.light,
    color: colors.textWhite,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

