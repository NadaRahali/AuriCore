import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { colors, gradients } from '../config/theme';
import { screenStyles, headerStyles, formStyles, inputDarkStyles, inputLightStyles, buttonCommonStyles, linkStyles } from '../config/styles';
import { authConfig } from '../config/app';
import Logo from '../components/Logo';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signUp } = useAuth();

  const handleSignup = async () => {
    // Reset errors
    setErrors({});

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    if (password.length < authConfig.minPasswordLength) {
      setErrors({ password: `Password must be at least ${authConfig.minPasswordLength} characters.` });
      return;
    }

    setLoading(true);
    const { data, error } = await signUp(email, password, name);
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setErrors({ email: 'This email is already registered.' });
      }
      Alert.alert('Signup Failed', error.message);
    } else {
      // Navigate to verification screen with email
      navigation.navigate('Verification', { email });
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
          <View style={headerStyles.withBackButton}>
            <TouchableOpacity 
              style={headerStyles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textWhite} style={{ marginLeft: -2 }} />
            </TouchableOpacity>
            <Text style={headerStyles.appName}>AURICORE</Text>
            <Logo width={70} height={71} style={headerStyles.logo} />
            <Text style={headerStyles.subtitle}>Create an account to get started</Text>
          </View>

          {/* Form Section */}
          <View style={formStyles.container}>
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Name</Text>
              <TextInput
                style={inputDarkStyles.input}
                placeholder="John Doe"
                placeholderTextColor={inputDarkStyles.placeholderColor}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Email</Text>
              <TextInput
                style={[inputDarkStyles.input, errors.email && inputLightStyles.error]}
                placeholder="Enter your email"
                placeholderTextColor={inputDarkStyles.placeholderColor}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={inputLightStyles.errorText}>{errors.email}</Text>}
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

            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Re-type Password</Text>
              <View style={inputDarkStyles.passwordContainer}>
                <TextInput
                  style={[inputDarkStyles.passwordInput, errors.confirmPassword && inputLightStyles.error]}
                  placeholder="Enter your password"
                  placeholderTextColor={inputDarkStyles.placeholderColor}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  style={inputDarkStyles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={inputDarkStyles.eyeIconColor} 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={inputLightStyles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity 
              style={buttonCommonStyles.primary}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={buttonCommonStyles.primaryText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={linkStyles.signupRow}>
              <Text style={linkStyles.signupText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={linkStyles.signupLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}


