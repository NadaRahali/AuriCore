// Theme configuration for AURICORE app
// Based on gradient design system with purple-to-dark gradient

export const colors = {
  // Primary Gradient Colors (from light to dark)
  gradientStart: '#B467FF',      // Light purple - UIColor(red: 0.706, green: 0.404, blue: 1)
  gradient1: '#5F398B',          // Medium purple - UIColor(red: 0.373, green: 0.225, blue: 0.545)
  gradient2: '#54347C',           // Dark purple - UIColor(red: 0.331, green: 0.203, blue: 0.488)
  gradient3: '#4A2E6E',          // Darker purple - UIColor(red: 0.289, green: 0.181, blue: 0.431)
  gradient4: '#352351',          // Very dark purple - UIColor(red: 0.206, green: 0.136, blue: 0.318)
  gradient5: '#1F1734',          // Almost black purple - UIColor(red: 0.123, green: 0.092, blue: 0.204)
  gradientEnd: '#0A0C17',        // Darkest - UIColor(red: 0.039, green: 0.047, blue: 0.09)
  
  // Primary Colors (derived from gradient)
  primary: '#B467FF',            // Main brand color (lightest gradient)
  primaryDark: '#5F398B',        // Darker variant
  primaryDarker: '#352351',      // Darkest variant
  
  // Background Colors
  background: '#FFFFFF',         // White background for content areas
  backgroundGray: '#F0F5FA',     // Light gray for inputs
  backgroundLight: '#F8F8F8',    // Very light gray
  backgroundDark: '#0A0C17',     // Dark background (gradient end)
  
  // Text Colors
  textPrimary: '#333333',        // Dark text on light backgrounds
  textSecondary: '#666666',      // Secondary text
  textLight: '#999999',          // Light text
  textWhite: '#FFFFFF',          // White text on dark backgrounds
  textOnGradient: '#FFFFFF',     // Text color on gradient backgrounds
  
  // Input Colors
  inputBackground: '#F0F5FA',    // Light gray background
  inputBorder: '#E0E0E0',         // Light border
  inputPlaceholder: '#999999',   // Placeholder text
  inputFocus: '#B467FF',         // Focus border color (primary)
  
  // Social/Brand Colors
  linkedin: '#0077B5',
  google: '#4285F4',
  apple: '#000000',
  
  // Status Colors
  error: '#FF6B6B',              // Error red
  success: '#4CAF50',            // Success green
  warning: '#FFA726',            // Warning orange
  
  // Gradient Overlay Colors
  gradientOverlayDark: 'rgba(0, 0, 0, 0.2)',
  gradientOverlayLight: 'rgba(255, 255, 255, 0.1)',
  
  // Screen-specific colors (from LoginScreen design)
  inputDarkBackground: '#1A1D27',      // Dark input background
  inputDarkBorder: '#313438',          // Dark input border
  placeholderDark: '#50555C',          // Placeholder text on dark inputs
  textMuted: '#F5E1E1',                // Muted text color (subtitle, orText)
  textMutedDark: '#50555C',            // Dark muted text
  eyeIconColor: 'rgba(255, 255, 255, 0.5)',  // Eye icon color
  socialBorder: 'rgba(255, 255, 255, 0.2)',   // Social button border
  facebook: '#1877F2',                 // Facebook brand color
};

// Font families
export const fonts = {
  // Sen font (for body text, subtitles)
  regular: 'Sen_400Regular',
  bold: 'Sen_700Bold',
  extraBold: 'Sen_800ExtraBold',
  // Geologica font (for headings like AURICORE)
  geologica: {
    light: 'Geologica_300Light',
    regular: 'Geologica_400Regular',
    medium: 'Geologica_500Medium',
    semiBold: 'Geologica_600SemiBold',
    bold: 'Geologica_700Bold',
  },
  // Montserrat font (for labels like Email, Password)
  montserrat: {
    regular: 'Montserrat_400Regular',
    medium: 'Montserrat_500Medium',
    semiBold: 'Montserrat_600SemiBold',
    bold: 'Montserrat_700Bold',
  },
};

// Font sizes
export const fontSizes = {
  tiny: 12,
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 24,
  xxlarge: 28,
  huge: 36,
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 60,
};

// Border radius
export const borderRadius = {
  small: 4,
  medium: 12,
  large: 20,
  xlarge: 24,
  round: 25,
};

// Shadows (iOS)
export const shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2, // Android
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4, // Android
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6, // Android
  },
};

// Common input styles
export const inputStyles = {
  default: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.medium,
    paddingVertical: 22,
    paddingHorizontal: 19,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    ...shadows.small,
  },
  error: {
    borderColor: colors.error,
    borderWidth: 2,
  },
};

// Common button styles
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
    ...shadows.medium,
  },
  primaryText: {
    color: colors.textWhite,
    fontSize: fontSizes.medium,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
  },
  // Secondary button (outlined)
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.primary,
    fontSize: fontSizes.medium,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
  },
};

// Gradient configuration
// Based on design system: 7-color gradient with specific locations and transform
export const gradients = {
  // Main primary gradient (7 colors) - Linear from top right to bottom left
  primary: {
    colors: [
      colors.gradientStart,  // #B467FF - 7%
      colors.gradient1,     // #5F398B - 24%
      colors.gradient2,     // #54347C - 29%
      colors.gradient3,     // #4A2E6E - 35%
      colors.gradient4,     // #352351 - 45%
      colors.gradient5,     // #1F1734 - 63%
      colors.gradientEnd,   // #0A0C17 - 100%
    ],
    locations: [0.07, 0.24, 0.29, 0.35, 0.45, 0.63, 1],
    start: { x: 1, y: 0 },  // Top right
    end: { x: 0, y: 1 },    // Bottom left
  },
  
  // Simplified 2-color gradient for quick use - Linear from top right to bottom left
  primarySimple: {
    colors: [colors.gradientStart, colors.gradientEnd],
    locations: [0, 1],
    start: { x: 1, y: 0 },  // Top right
    end: { x: 0, y: 1 },   // Bottom left
  },
  
  // Overlay gradient for content on top of primary gradient
  overlay: {
    colors: [colors.gradientOverlayDark, 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    locations: [0, 1],
  },
  
  // Light overlay for subtle effects
  overlayLight: {
    colors: ['transparent', colors.gradientOverlayLight],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    locations: [0, 1],
  },
};

