import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Alert, ActivityIndicator, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Line, Defs, RadialGradient, Stop, G, ClipPath } from 'react-native-svg';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from '../config/theme';
import Logo from '../components/Logo';
import { requestHealthPermissions, syncAllHealthData } from '../lib/healthData';
import { hasGrantedPermissions, markPermissionsGranted, getNextScreenAfterAuth } from '../lib/navigationHelper';

export default function AuthorizeAccessScreen({ navigation }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Check if permissions are already granted
  useEffect(() => {
    const checkPermissionsStatus = async () => {
      const granted = await hasGrantedPermissions();
      if (granted) {
        // Permissions already granted, skip to next screen
        const nextScreen = await getNextScreenAfterAuth();
        navigation.replace(nextScreen);
      }
    };
    
    checkPermissionsStatus();
  }, [navigation]);

  useEffect(() => {
    // Create a gentle, slow bounce animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 2000, // 2 seconds to go down
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000, // 2 seconds to go back up
          useNativeDriver: true,
        }),
      ])
    );

    bounceAnimation.start();

    return () => {
      bounceAnimation.stop();
    };
  }, [bounceAnim]);

  // Interpolate the bounce value to a gentle vertical movement (8px range)
  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8], // Gentle 8px bounce
  });

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    
    try {
      // Request all health permissions
      const { success, permissions, error } = await requestHealthPermissions();
      
      if (!success) {
        Alert.alert(
          'Permissions Required',
          'Please grant permissions to access your health data for better migraine predictions. You can enable them in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {
              // Open device settings
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }},
          ]
        );
        setIsAuthorizing(false);
        return;
      }

      // Show what permissions were granted
      const grantedPermissions = [];
      if (permissions.location) grantedPermissions.push('Location');
      if (permissions.healthKit) grantedPermissions.push('Health App & Apple Watch');
      
      if (grantedPermissions.length === 0) {
        Alert.alert(
          'No Permissions Granted',
          'Please grant at least one permission to continue.',
          [{ text: 'OK' }]
        );
        setIsAuthorizing(false);
        return;
      }

      // Sync health data
      Alert.alert(
        'Permissions Granted',
        `Successfully connected to: ${grantedPermissions.join(', ')}. Syncing your health data...`,
        [{ text: 'OK' }]
      );

      // Sync all available health data
      const syncResult = await syncAllHealthData();
      
      if (syncResult.success) {
        // Mark permissions as granted
        await markPermissionsGranted();
        
        Alert.alert(
          'Success!',
          'Your health data has been synced. We\'ll use this information to provide better migraine predictions.',
          [
            {
              text: 'Continue',
              onPress: async () => {
                // Navigate to next screen (home/dashboard when ready)
                const nextScreen = await getNextScreenAfterAuth();
                navigation.replace(nextScreen);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Sync Incomplete',
          syncResult.error || 'Some data may not have synced. You can try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error during authorization:', error);
      Alert.alert(
        'Error',
        'An error occurred while setting up health data access. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsAuthorizing(false);
    }
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
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={styles.gradient}
      >
        {/* Starry background effect */}
        <View style={styles.starsContainer}>
          {Array.from({ length: 50 }).map((_, i) => (
            <AnimatedStar
              key={i}
              left={Math.random() * 100}
              top={Math.random() * 100}
              delay={Math.random() * 2000}
              duration={1500 + Math.random() * 1000}
            />
          ))}
        </View>

        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            <Logo width={70} height={71} style={styles.logo} />
          </Animated.View>

          {/* Description Text */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              One platform to understand your complete
              health story. Connect your health apps and
              get migraine-powered insights.
            </Text>
          </View>

          {/* Feature Cards */}
          <View style={styles.cardsContainer}>
            {/* Card 1: Migraine-powered Insights */}
            <View style={styles.card}>
              <View style={styles.cardIconContainer}>
                <MigraineInsightsIcon />
              </View>
              <Text style={styles.cardTitle}>Migraine-powered Insights</Text>
              <Text style={styles.cardSubtitle}>Personalized health migraine predictions</Text>
            </View>

            {/* Card 2: Trend Analysis */}
            <View style={styles.card}>
              <View style={styles.cardIconContainer}>
                <TrendAnalysisIcon />
              </View>
              <Text style={styles.cardTitle}>Trend Analysis</Text>
              <Text style={styles.cardSubtitle}>Track your progress over time</Text>
            </View>

            {/* Card 3: Security */}
            <View style={styles.card}>
              <View style={styles.cardIconContainer}>
                <SecurityIcon />
              </View>
              <Text style={styles.cardTitle}>Security</Text>
              <Text style={styles.cardSubtitle}>Stored with end-to-end encryption</Text>
            </View>
          </View>

          {/* Authorize Access Button */}
          <TouchableOpacity
            style={[styles.authorizeButton, isAuthorizing && styles.authorizeButtonDisabled]}
            onPress={handleAuthorize}
            activeOpacity={0.8}
            disabled={isAuthorizing}
          >
            {isAuthorizing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.textWhite} size="small" />
                <Text style={styles.authorizeButtonText}>Authorizing...</Text>
              </View>
            ) : (
              <Text style={styles.authorizeButtonText}>Authorize Access</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

// Animated Star Component with gentle shine effect
const AnimatedStar = ({ left, top, delay, duration }) => {
  const opacityAnim = useRef(new Animated.Value(0.2)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Create a twinkling animation with opacity and scale
    const twinkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.2,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );

    twinkleAnimation.start();

    return () => {
      twinkleAnimation.stop();
    };
  }, [opacityAnim, scaleAnim, delay, duration]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: `${left}%`,
          top: `${top}%`,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

// Brain Icon Component
const BrainIcon = () => (
  <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
    <Path
      d="M40 10C30 10 22 18 22 28C22 32 24 35 26 37C24 39 22 42 22 46C22 56 30 64 40 64C50 64 58 56 58 46C58 42 56 39 54 37C56 35 58 32 58 28C58 18 50 10 40 10Z"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M32 28C32 32 36 35 40 35C44 35 48 32 48 28"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M30 40C30 42 32 44 34 44C36 44 38 42 38 40"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M42 40C42 42 44 44 46 44C48 44 50 42 50 40"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="35" cy="28" r="2" fill="#FFFFFF" />
    <Circle cx="45" cy="28" r="2" fill="#FFFFFF" />
    <Path
      d="M26 20C24 18 20 18 18 20"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M62 20C64 18 68 18 70 20"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

// Migraine-powered Insights Icon Component
const MigraineInsightsIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Defs>
      <RadialGradient
        id="paint0_radial_107_402"
        cx="0"
        cy="0"
        r="1"
        gradientTransform="matrix(18.2051 20.9877 -20.9486 16.4752 21.7949 19.0123)"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset="0.389423" stopColor="#6C3E99" />
        <Stop offset="0.663462" stopColor="#9052CC" />
        <Stop offset="0.841346" stopColor="#A25DE6" />
        <Stop offset="0.927885" stopColor="#AC66F0" />
      </RadialGradient>
    </Defs>
    <Rect width="40" height="40" rx="7" fill="url(#paint0_radial_107_402)" />
    <Path
      d="M15.2051 9.19433C15.1612 9.24316 14.8584 9.82422 14.5264 10.4834L13.9307 11.6846L12.583 11.875C11.2891 12.0557 11.2305 12.0703 11.0938 12.2021C10.8399 12.4512 10.8936 12.5342 12.0117 13.6279L13.0078 14.6045L12.7686 15.9473C12.5733 17.0459 12.544 17.3145 12.5879 17.4268C12.6465 17.5781 12.7637 17.6562 12.9297 17.6562C12.9932 17.6562 13.5889 17.3682 14.2578 17.0215L15.4737 16.3818L15.8203 16.5625C16.0108 16.6602 16.5576 16.9482 17.0313 17.2021C17.5049 17.4512 17.9492 17.6562 18.0127 17.6562C18.2032 17.6562 18.3887 17.4805 18.3887 17.2998C18.3887 17.2119 18.291 16.5723 18.169 15.874L17.9492 14.6045L18.9502 13.6035C19.8242 12.7295 19.9512 12.583 19.9512 12.4512C19.9512 12.3633 19.9121 12.2461 19.8633 12.1875C19.7852 12.0898 19.6289 12.0557 18.3936 11.8799L17.0117 11.6748L16.3867 10.4248C16.0401 9.73633 15.7227 9.16016 15.6787 9.14062C15.5225 9.08203 15.2783 9.11133 15.2051 9.19433ZM16.543 12.3486C16.6065 12.3877 17.0752 12.4756 17.583 12.5488C18.0957 12.6221 18.5596 12.6904 18.6182 12.7002C18.711 12.7197 18.6133 12.832 17.9639 13.4717C17.5489 13.877 17.1875 14.2627 17.168 14.3213C17.1387 14.3848 17.1826 14.7705 17.2949 15.3906C17.3877 15.9277 17.461 16.4014 17.461 16.4502C17.461 16.5186 17.2754 16.4404 16.5186 16.0449C15.9961 15.7764 15.5225 15.5566 15.4639 15.5566C15.4053 15.5566 14.9365 15.7764 14.4239 16.0498C13.916 16.3184 13.4912 16.5332 13.4815 16.5234C13.4717 16.5137 13.5352 16.0645 13.628 15.5322C13.7207 14.9951 13.7989 14.4922 13.7989 14.4092C13.7989 14.2822 13.6865 14.1553 13.0078 13.4961C12.2754 12.793 12.2217 12.7295 12.334 12.7051C12.4024 12.6904 12.8614 12.6172 13.3594 12.5488C13.8574 12.4756 14.3115 12.4023 14.3701 12.3779C14.4483 12.3486 14.6192 12.0654 14.9756 11.3477L15.4688 10.3564L15.9522 11.3184C16.25 11.9092 16.4795 12.3096 16.543 12.3486Z"
      fill="white"
    />
    <Path
      d="M24.2529 16.1768C24.1748 16.2305 23.8184 16.8945 23.2324 18.0908C22.7393 19.1016 22.3242 19.9365 22.3145 19.9463C22.3096 19.9512 21.3623 20.0977 20.2148 20.2637C18.2861 20.5469 18.125 20.5762 18.042 20.6787C17.9883 20.7422 17.9492 20.8594 17.9492 20.9424C17.9492 21.1084 17.8174 20.9668 19.8682 22.9688L20.9814 24.0527L20.6348 26.0596C20.4492 27.1582 20.293 28.1006 20.293 28.1494C20.293 28.1982 20.3369 28.2959 20.3955 28.3691C20.5811 28.6035 20.6787 28.5693 22.5439 27.5879C23.4961 27.085 24.3164 26.6553 24.375 26.6309C24.4629 26.5918 24.7803 26.7432 26.2939 27.5391C27.4951 28.1738 28.1592 28.4961 28.2568 28.4961C28.4033 28.4961 28.6426 28.3154 28.6426 28.1982C28.6426 28.1641 28.4863 27.2412 28.3008 26.1377C28.1104 25.0391 27.959 24.1064 27.9688 24.0723C27.9785 24.0332 28.6328 23.374 29.4238 22.6074C30.2148 21.8359 30.8936 21.1426 30.9326 21.0693C31.0156 20.9033 30.957 20.7324 30.7813 20.6152C30.7129 20.5713 29.9268 20.4395 28.7647 20.2734C27.7197 20.1221 26.8018 19.9854 26.7334 19.9707C26.6211 19.9512 26.499 19.7266 25.6885 18.0908C25.1807 17.0654 24.7266 16.2061 24.668 16.167C24.5361 16.0693 24.3945 16.0742 24.2529 16.1768ZM25.2686 19.0088C25.6934 19.8633 26.0742 20.5908 26.1133 20.625C26.1572 20.6592 26.958 20.8008 27.9395 20.9424C28.9063 21.084 29.6875 21.2109 29.6826 21.2354C29.6729 21.2549 29.126 21.8018 28.4619 22.4512C27.793 23.1006 27.2217 23.6865 27.1875 23.7598C27.1289 23.8721 27.1533 24.0869 27.417 25.6152C27.5781 26.5674 27.7051 27.3535 27.6904 27.3633C27.6807 27.373 26.9775 27.0166 26.1328 26.5723C25.2686 26.1182 24.5361 25.7617 24.4629 25.7617C24.3897 25.7617 23.6572 26.1182 22.7979 26.5723C21.9531 27.0166 21.25 27.3682 21.2354 27.3535C21.2207 27.3438 21.3428 26.5576 21.5039 25.6152C21.709 24.4434 21.7871 23.8623 21.7578 23.7891C21.7383 23.7305 21.1523 23.125 20.459 22.4512C19.7656 21.7773 19.209 21.2158 19.2236 21.2061C19.2334 21.1963 19.9902 21.084 20.9033 20.9521C21.8164 20.8252 22.6318 20.6885 22.7148 20.6592C22.8467 20.6055 22.9492 20.4297 23.6523 18.999C24.0918 18.1201 24.458 17.4121 24.4727 17.4268C24.4873 17.4414 24.8486 18.1543 25.2686 19.0088Z"
      fill="white"
    />
    <Path
      d="M12.6514 23.9502C12.4805 24.0234 12.3926 24.1602 11.9434 25.0879L11.5088 26.001L11.2744 26.0352C9.10156 26.3525 9.11133 26.3477 9.11133 26.6846C9.11133 26.8457 9.17481 26.9238 9.90723 27.6562L10.708 28.4521L10.5225 29.5312C10.3516 30.5029 10.3418 30.6201 10.4053 30.7422C10.5615 31.0498 10.7227 31.0156 11.7969 30.4492C12.3047 30.1807 12.7441 29.9609 12.7783 29.9609C12.8076 29.9609 13.2471 30.1807 13.7549 30.4492C14.2871 30.7324 14.7363 30.9375 14.8145 30.9375C14.9854 30.9375 15.1465 30.8252 15.1807 30.6787C15.2002 30.6201 15.127 30.0928 15.0293 29.5117L14.8438 28.4521L15.6396 27.6562C16.4209 26.875 16.4404 26.8555 16.4258 26.6699C16.4014 26.3623 16.3086 26.3232 15.1221 26.1523C14.5459 26.0742 14.0674 26.001 14.0625 25.9912C14.0527 25.9814 13.8281 25.5371 13.5596 24.9951C13.1201 24.1113 13.0566 24.0088 12.915 23.96C12.8271 23.9307 12.7588 23.9062 12.7539 23.9111C12.749 23.9111 12.7051 23.9307 12.6514 23.9502ZM13.1396 25.9131C13.3301 26.2939 13.5254 26.6357 13.584 26.6699C13.6426 26.709 14.0283 26.7871 14.4482 26.8457L15.2148 26.9531L14.6289 27.5439C14.1455 28.0371 14.043 28.1641 14.043 28.2812C14.043 28.3643 14.0967 28.7354 14.165 29.1064C14.2285 29.4775 14.2773 29.79 14.2676 29.8047C14.2578 29.8145 13.916 29.6484 13.5107 29.4385L12.7783 29.0576L12.041 29.4434C11.6309 29.6533 11.2939 29.8145 11.2842 29.8047C11.2744 29.7998 11.3232 29.4824 11.3867 29.1064C11.4502 28.7305 11.5039 28.3594 11.5039 28.2812C11.5039 28.1641 11.4014 28.0322 10.9326 27.5635C10.6201 27.2461 10.3711 26.9775 10.3857 26.9678C10.3955 26.958 10.7324 26.8994 11.1328 26.8408C11.5332 26.7871 11.9092 26.709 11.9629 26.6699C12.0215 26.6357 12.2168 26.2939 12.4072 25.9131C12.5928 25.5371 12.7588 25.2246 12.7734 25.2246C12.7881 25.2246 12.9541 25.5371 13.1396 25.9131Z"
      fill="white"
    />
  </Svg>
);

// Trend Analysis Icon Component
const TrendAnalysisIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Defs>
      <RadialGradient
        id="paint0_radial_107_405"
        cx="0"
        cy="0"
        r="1"
        gradientTransform="matrix(18.2051 20.9877 -20.9486 16.4752 21.7949 19.0123)"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset="0.389423" stopColor="#6C3E99" />
        <Stop offset="0.663462" stopColor="#9052CC" />
        <Stop offset="0.841346" stopColor="#A25DE6" />
        <Stop offset="0.927885" stopColor="#AC66F0" />
      </RadialGradient>
      <ClipPath id="clip0_107_405">
        <Rect width="25" height="25" x="7.5" y="7.5" fill="white" />
      </ClipPath>
    </Defs>
    <Rect width="40" height="40" rx="7" fill="url(#paint0_radial_107_405)" />
    <G clipPath="url(#clip0_107_405)">
      <Path
        d="M16.7286 7.57813C14.3897 7.85645 12.3633 8.81837 10.6788 10.4541C9.30181 11.792 8.39849 13.3057 7.89556 15.1172C7.52935 16.4404 7.42681 17.7295 7.57329 19.0576C7.9688 22.6172 10.1221 25.6787 13.3301 27.2461C14.8194 27.9785 16.2208 28.3008 17.9297 28.3057C19.7754 28.3106 21.5674 27.832 23.1104 26.9238C23.3301 26.7969 23.5254 26.6895 23.545 26.6895C23.5694 26.6895 24.8047 27.9053 26.2989 29.3945C29.2969 32.3828 29.2383 32.334 29.9903 32.4561C31.1573 32.6465 32.2608 31.8262 32.461 30.625C32.5293 30.21 32.461 29.7705 32.2559 29.3359C32.1143 29.0332 31.8946 28.7988 29.3848 26.2842C27.0606 23.9551 26.6749 23.5498 26.7188 23.4766C28.3838 20.8008 28.7745 17.5977 27.793 14.6533C27.5586 13.9453 27.2413 13.2422 26.8995 12.6611L26.6749 12.2754L27.085 11.8652L27.4952 11.4551L27.7637 11.5576C28.3057 11.7676 29.0235 11.6211 29.4532 11.2207C29.6387 11.0547 29.8487 10.7324 29.8926 10.5567L29.9219 10.4297H31.211H32.5V10.0147V9.59962H31.2305H29.961L29.8438 9.34083C29.2676 8.06153 27.4952 8.0127 26.8555 9.26759C26.67 9.6338 26.6358 10.1953 26.7823 10.5762L26.8848 10.8447L26.5284 11.2012L26.1719 11.5576L25.7471 11.0693C23.5352 8.52052 20.0733 7.18263 16.7286 7.57813ZM19.0284 8.3838C22.5782 8.83302 25.5274 11.1133 26.8409 14.4141C27.5733 16.2647 27.6905 18.5107 27.1485 20.4443C26.6895 22.1045 25.8399 23.54 24.6094 24.7461C23.2715 26.0596 21.6797 26.9043 19.795 27.3047C19.0528 27.4609 17.6319 27.5195 16.8262 27.4268C12.9737 26.9873 9.75103 24.2578 8.69145 20.5371C8.27642 19.0918 8.21782 17.3731 8.53032 15.9229C9.30181 12.3731 11.9092 9.6045 15.3858 8.65724C15.8008 8.54005 16.5479 8.39845 16.9239 8.36427C17.334 8.32032 18.6524 8.33497 19.0284 8.3838ZM28.5694 9.21388C28.9454 9.3213 29.2334 9.7754 29.1553 10.1514C29.1065 10.3809 28.9356 10.6055 28.7256 10.7275C28.5743 10.8106 28.4815 10.8252 28.2715 10.8106C27.8321 10.7715 27.5684 10.5078 27.5293 10.0733C27.5049 9.78028 27.5831 9.58497 27.8028 9.37989C28.0127 9.1797 28.2569 9.12599 28.5694 9.21388ZM26.7872 24.8584L27.3487 25.4199L26.3819 26.3818L25.42 27.3486L24.8584 26.7871C24.3262 26.2598 24.2334 26.1328 24.3458 26.0938C24.4727 26.0498 25.3272 25.2441 25.7178 24.7998C25.962 24.5264 26.1768 24.2969 26.1963 24.2969C26.211 24.2969 26.4795 24.5508 26.7872 24.8584ZM31.5284 29.7168C31.6895 30.0195 31.6944 30.625 31.5381 30.9131C31.1866 31.5723 30.3614 31.8506 29.712 31.5234C29.5704 31.4502 28.9112 30.8301 27.7491 29.6777L26.0059 27.9395L26.9678 26.9727L27.9346 26.0059L29.6729 27.749C30.8106 28.8867 31.4551 29.5752 31.5284 29.7168Z"
        fill="white"
      />
      <Path
        d="M17.1924 9.20896C13.5254 9.5117 10.4443 12.0947 9.47754 15.6787C9.10156 17.0752 9.10156 18.7353 9.47754 20.1465C10.2246 22.9638 12.2803 25.1855 15.0439 26.1719C16.5625 26.7138 18.4521 26.7969 20.0635 26.3916C22.5781 25.7617 24.7656 23.9502 25.835 21.6162C26.4111 20.3564 26.6455 19.2871 26.6455 17.9248C26.6455 14.8633 25.1074 12.0996 22.5 10.4834C20.9424 9.51658 19.0381 9.0576 17.1924 9.20896ZM19.2188 10.122C20.6592 10.3564 22.0654 11.0254 23.125 11.9775C23.6328 12.4316 24.3457 13.2324 24.3457 13.3398C24.3457 13.3642 24.1211 13.6084 23.8477 13.8818L23.3447 14.3799L23.0762 14.2871C22.3584 14.0381 21.5625 14.2871 21.1523 14.8877C20.8252 15.3662 20.7568 15.9765 20.9766 16.4648L21.0645 16.665L19.7119 18.0176L18.3545 19.3701L18.042 19.2676C17.666 19.1357 17.2119 19.1504 16.8701 19.3017L16.6455 19.4043L15.708 18.4668L14.7705 17.5293L14.8633 17.3095C15.21 16.499 14.8486 15.5517 14.043 15.1709C13.8135 15.0635 13.7061 15.0439 13.335 15.0439C12.9541 15.0439 12.8613 15.0635 12.6172 15.1806C12.2852 15.3418 11.9385 15.7129 11.8164 16.0205L11.7334 16.2402H10.9619H10.1904L10.3076 15.8105C10.5322 14.9756 10.9277 14.1357 11.4404 13.4033C13.1836 10.9033 16.2061 9.624 19.2188 10.122ZM25.0684 14.5654C25.6006 15.7031 25.8154 16.6699 25.8154 17.9199C25.8105 20.6347 24.4727 23.0957 22.2021 24.5654C21.416 25.0732 20.4688 25.4638 19.5215 25.6689C18.8379 25.8154 17.4707 25.8496 16.7773 25.7422C15.9326 25.6054 15.4004 25.4492 14.6533 25.1172C12.9883 24.3701 11.5234 22.9297 10.7812 21.3183C10.2002 20.0439 9.99512 18.9941 10.0293 17.4463L10.0391 17.0703H10.8838H11.7236L11.8408 17.3437C11.9922 17.6904 12.2852 17.9931 12.6514 18.1738C12.9053 18.2959 12.998 18.3154 13.335 18.3154C13.623 18.3105 13.7842 18.2861 13.9502 18.208L14.1748 18.1054L15.1123 19.0429L16.0498 19.9853L15.9473 20.2978C15.6738 21.1035 16.0449 21.9726 16.8213 22.3388C17.0508 22.4463 17.1631 22.4658 17.5098 22.4658C17.8564 22.4658 17.9688 22.4463 18.1934 22.3388C18.5352 22.1777 18.8574 21.8554 19.0186 21.5136C19.1797 21.167 19.1943 20.5908 19.0527 20.2246L18.96 19.9902L20.3174 18.6328L21.6748 17.2754L21.875 17.3633C22.3633 17.583 22.9736 17.5146 23.4521 17.1875C24.0527 16.7724 24.3164 15.9424 24.0527 15.2539L23.9551 14.9951L24.3799 14.5703C24.6143 14.331 24.8193 14.1406 24.8389 14.1406C24.8535 14.1406 24.9561 14.331 25.0684 14.5654ZM22.9639 15.1465C23.1885 15.3174 23.2861 15.4883 23.3105 15.7715C23.3887 16.7236 22.0752 17.0166 21.7334 16.1181C21.5869 15.7422 21.7383 15.332 22.0996 15.1172C22.3193 14.9853 22.7686 15 22.9639 15.1465ZM13.667 15.9179C13.7549 15.9521 13.8867 16.0547 13.96 16.1377C14.3359 16.5869 14.1748 17.2314 13.6279 17.4414C13.0811 17.6465 12.5293 17.2558 12.5293 16.6553C12.5293 16.0644 13.1104 15.6836 13.667 15.9179ZM17.8174 20.0683C18.1641 20.2099 18.3936 20.6299 18.3203 20.9863C18.2471 21.3525 17.876 21.6601 17.5098 21.6601C17.2461 21.6601 16.9385 21.4844 16.8018 21.25C16.4062 20.5761 17.1045 19.7656 17.8174 20.0683Z"
        fill="white"
      />
    </G>
  </Svg>
);

// Security Icon Component
const SecurityIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Defs>
      <RadialGradient
        id="paint0_radial_107_408"
        cx="0"
        cy="0"
        r="1"
        gradientTransform="matrix(18.2051 20.9877 -20.9486 16.4752 21.7949 19.0123)"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset="0.389423" stopColor="#6C3E99" />
        <Stop offset="0.663462" stopColor="#9052CC" />
        <Stop offset="0.841346" stopColor="#A25DE6" />
        <Stop offset="0.927885" stopColor="#AC66F0" />
      </RadialGradient>
      <ClipPath id="clip0_107_408">
        <Rect width="25" height="25" x="7.5" y="7.5" fill="white" />
      </ClipPath>
    </Defs>
    <Rect width="40" height="40" rx="7" fill="url(#paint0_radial_107_408)" />
    <G clipPath="url(#clip0_107_408)">
      <Path
        d="M19.624 7.60742C19.5117 7.6709 19.2139 7.90039 18.9649 8.125C16.836 10.0293 14.3653 10.9717 11.1426 11.1084C10.083 11.1523 9.93166 11.1963 9.69728 11.5381C9.57521 11.7139 9.57521 11.7383 9.53615 13.1104C9.47756 15.0879 9.5215 18.2764 9.61916 19.2676C9.8926 22.0459 10.4785 24.1895 11.46 25.9668C12.832 28.457 14.961 30.3662 17.8321 31.6846C18.711 32.0898 19.7998 32.5 20 32.5C20.083 32.5 20.4492 32.3877 20.8154 32.251C23.1787 31.3672 25.1123 30.1465 26.5918 28.6133C28.8233 26.2939 29.9707 23.4668 30.3809 19.2676C30.4785 18.2764 30.5225 15.0879 30.4639 13.1104C30.4248 11.7383 30.4248 11.7139 30.3028 11.5381C30.0684 11.1963 29.917 11.1523 28.8574 11.1084C25.5957 10.9717 23.0469 9.98047 20.9082 8.02246C20.3125 7.48047 20.0293 7.3877 19.624 7.60742ZM20.4688 9.95117C21.6602 10.9082 23.1006 11.6797 24.585 12.1582C25.6201 12.4951 26.5674 12.6758 27.9053 12.7979C28.3203 12.8369 28.6719 12.8809 28.6865 12.9004C28.75 12.959 28.7158 18.5449 28.6524 19.1699C28.3936 21.6748 27.9785 23.2617 27.1631 24.8584C25.8643 27.4072 23.6377 29.2822 20.4297 30.5273L20 30.6934L19.5752 30.5273C16.6748 29.4043 14.4727 27.6758 13.2031 25.5322C12.1582 23.7695 11.6406 21.9922 11.3477 19.1699C11.2842 18.5449 11.25 12.959 11.3135 12.9004C11.3281 12.8809 11.6797 12.8369 12.0947 12.7979C13.4326 12.6758 14.3799 12.4951 15.4151 12.1582C16.8994 11.6797 18.3203 10.918 19.5313 9.95117C19.7705 9.75586 19.9854 9.59961 20 9.59961C20.0147 9.59961 20.2295 9.75586 20.4688 9.95117Z"
        fill="white"
      />
      <Path
        d="M23.2715 16.7822C23.2031 16.8067 22.168 17.8125 20.9668 19.0137L18.7793 21.1914L17.7686 20.1856C16.8018 19.2285 16.7432 19.1797 16.5235 19.1455C15.8447 19.043 15.3223 19.6875 15.5567 20.3272C15.625 20.5078 18.2227 23.1152 18.4229 23.2031C18.6914 23.3203 19.0235 23.291 19.2725 23.1299C19.6192 22.9053 24.3262 18.1543 24.419 17.9395C24.6631 17.3389 24.2627 16.7236 23.6279 16.7334C23.501 16.7334 23.3399 16.7578 23.2715 16.7822Z"
        fill="white"
      />
    </G>
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xxxl + 40 : spacing.xxxl,
    paddingBottom: spacing.xl + 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  brainIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: 'rgba(180, 103, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    // Logo styles are handled by the Logo component
  },
  descriptionContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.lg,
  },
  descriptionText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: 'rgba(74, 46, 110, 0.3)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#B467FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconContainer: {
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  authorizeButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  authorizeButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
});

