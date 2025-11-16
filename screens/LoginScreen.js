import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { colors, gradients } from '../config/theme';
import { screenStyles, headerStyles, formStyles, inputDarkStyles, buttonCommonStyles, linkStyles, socialStyles } from '../config/styles';
import Logo from '../components/Logo';
import { GoogleIcon, FacebookIcon, AppleIcon } from '../components/SocialIcons';
import { getNextScreenAfterAuth } from '../lib/navigationHelper';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { data, error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      // Navigate to appropriate screen based on user's progress
      const nextScreen = await getNextScreenAfterAuth();
      navigation.replace(nextScreen);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={screenStyles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={gradients.primary.colors}
        locations={gradients.primary.locations}
        start={gradients.primary.start}
        end={gradients.primary.end}
        style={screenStyles.container}
      >
        <ScrollView 
          contentContainerStyle={screenStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={headerStyles.container}>
            <Text style={headerStyles.appName}>AURICORE</Text>
            <Logo width={70} height={71} style={headerStyles.logo} />
            <Text style={headerStyles.subtitle}>Please log in to your existing account</Text>
          </View>

          {/* Form Section */}
          <View style={formStyles.container}>
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Email</Text>
              <TextInput
                style={inputDarkStyles.input}
                placeholder="Enter your email"
                placeholderTextColor={inputDarkStyles.placeholderColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Password</Text>
              <View style={inputDarkStyles.passwordContainer}>
                <TextInput
                  style={inputDarkStyles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={inputDarkStyles.placeholderColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  style={inputDarkStyles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={inputDarkStyles.eyeIconColor} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={linkStyles.forgotPassword}
              onPress={() => {
                // Navigate to forgot password when implemented
                Alert.alert('Forgot Password', 'Feature coming soon');
              }}
            >
              <Text style={linkStyles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={buttonCommonStyles.primary}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={buttonCommonStyles.primaryText}>Log In</Text>
              )}
            </TouchableOpacity>

            <Text style={socialStyles.orText}>Or continue with</Text>

            <View style={socialStyles.container}>
              <TouchableOpacity style={[socialStyles.button, socialStyles.google]}>
                <GoogleIcon size={socialStyles.iconSize} />
              </TouchableOpacity>
              <TouchableOpacity style={[socialStyles.button, socialStyles.facebook]}>
                <FacebookIcon size={socialStyles.iconSize} />
              </TouchableOpacity>
              <TouchableOpacity style={[socialStyles.button, socialStyles.apple]}>
                <AppleIcon size={socialStyles.iconSize} color={colors.textWhite} />
              </TouchableOpacity>
            </View>

            <View style={linkStyles.signupRow}>
              <Text style={linkStyles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={linkStyles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}


