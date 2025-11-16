import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { colors, gradients, fonts } from '../config/theme';
import { screenStyles, headerStyles, formStyles, buttonCommonStyles, linkStyles } from '../config/styles';
import { authConfig } from '../config/app';
import Logo from '../components/Logo';
import { getNextScreenAfterAuth } from '../lib/navigationHelper';

export default function VerificationScreen({ navigation, route }) {
  const email = route?.params?.email || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { verifyOtp, resendOtp } = useAuth();
  const inputRefs = useRef([]);

  const handleCodeChange = (text, index) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      // If pasting multiple digits, fill all inputs
      const digits = numericText.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      
      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(index + digits.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      // Single digit input
      const newCode = [...code];
      newCode[index] = numericText;
      setCode(newCode);
      
      // Auto-focus next input
      if (numericText && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    
    setError('');
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email not found. Please sign up again.');
      navigation.navigate('Signup');
      return;
    }

    setLoading(true);
    setError('');
    
    const { data, error: verifyError } = await verifyOtp(email, codeString);
    setLoading(false);

    if (verifyError) {
      setError(verifyError.message || 'Invalid verification code. Please try again.');
    } else {
      // Navigate to appropriate screen based on user's progress
      const nextScreen = await getNextScreenAfterAuth();
      navigation.replace(nextScreen);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found. Please sign up again.');
      return;
    }

    setLoading(true);
    const { error: resendError } = await resendOtp(email);
    setLoading(false);

    if (resendError) {
      Alert.alert('Error', resendError.message || 'Failed to resend code. Please try again.');
    } else {
      Alert.alert('Success', 'Verification code has been resent to your email.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
            <Text style={headerStyles.subtitle}>Enter the 6-digit code sent to your email</Text>
          </View>

          {/* Form Section */}
          <View style={formStyles.container}>
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.codeInput,
                    code[index] && styles.codeInputFilled,
                    error && styles.codeInputError
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <TouchableOpacity 
              style={buttonCommonStyles.primary}
              onPress={handleVerify}
              disabled={loading || code.join('').length !== 6}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={buttonCommonStyles.primaryText}>Verify</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity 
                onPress={handleResendCode}
                disabled={loading}
              >
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  codeInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: colors.inputDarkBorder,
    backgroundColor: colors.inputDarkBackground,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginHorizontal: 6,
  },
  codeInputFilled: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  codeInputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontFamily: fonts.regular,
    marginBottom: 16,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  resendLink: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
});

