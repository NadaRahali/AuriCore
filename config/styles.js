// Master styles file - Common styles used across screens
// Based on LoginScreen design as baseline

import { StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from './theme';

// Common screen container styles
export const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

// Header styles
export const headerStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl + 20,
    paddingBottom: spacing.xl,
  },
  withBackButton: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    position: 'relative',
  },
  appName: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.geologica.regular,
    color: colors.textWhite,
    letterSpacing: 1,
  },
  title: {
    fontSize: fontSizes.huge,
    fontWeight: 'bold',
    fontFamily: fonts.extraBold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.lg,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
  logo: {
    marginBottom: spacing.md,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.xxxl,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.textWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Form styles
export const formStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSizes.small,
    fontFamily: fonts.montserrat.regular,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  labelUppercase: {
    fontSize: fontSizes.tiny,
    fontWeight: '600',
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
});

// Input styles (dark theme - for gradient backgrounds)
export const inputDarkStyles = StyleSheet.create({
  input: {
    backgroundColor: colors.inputDarkBackground,
    borderRadius: borderRadius.round,
    paddingVertical: 18,
    paddingHorizontal: 19,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    borderWidth: 1,
    borderColor: colors.inputDarkBorder,
  },
  passwordInput: {
    backgroundColor: colors.inputDarkBackground,
    borderRadius: borderRadius.round,
    paddingVertical: 18,
    paddingHorizontal: 19,
    paddingRight: 50,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    borderWidth: 1,
    borderColor: colors.inputDarkBorder,
  },
  placeholderColor: colors.placeholderDark,
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 19,
    top: 15,
    padding: 4,
  },
  eyeIconColor: colors.eyeIconColor,
});

// Input styles (light theme - for white backgrounds)
export const inputLightStyles = StyleSheet.create({
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.medium,
    paddingVertical: 22,
    paddingHorizontal: 19,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    ...shadows.small,
  },
  passwordInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.medium,
    paddingVertical: 22,
    paddingHorizontal: 19,
    paddingRight: 50,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    ...shadows.small,
  },
  placeholderColor: colors.inputPlaceholder,
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 19,
    top: 22,
  },
  eyeIconColor: colors.textSecondary,
  error: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.tiny,
    fontFamily: fonts.regular,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

// Button styles
export const buttonCommonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  primaryText: {
    color: colors.textWhite,
    fontSize: fontSizes.medium,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 18,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: fontSizes.medium,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
  },
});

// Link styles
export const linkStyles = StyleSheet.create({
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    color: colors.textWhite,
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginTop: spacing.lg,
  },
  signupText: {
    color: colors.textMutedDark,
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
  },
  signupLink: {
    color: colors.textWhite,
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
  },
});

// Social login styles
export const socialStyles = StyleSheet.create({
  orText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    marginBottom: spacing.lg,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.socialBorder,
  },
  google: {
    backgroundColor: '#21242E',
  },
  facebook: {
    backgroundColor: '#21242E',
    borderColor: colors.socialBorder,
  },
  apple: {
    backgroundColor: '#21242E',
    borderColor: colors.socialBorder,
  },
  iconSize: 24,
});

// Content section styles (for white card overlays)
export const contentStyles = StyleSheet.create({
  container: {
    flex: 0.7,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xlarge,
    borderTopRightRadius: borderRadius.xlarge,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 20,
  },
});

