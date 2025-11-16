// App configuration
export const appConfig = {
  // App Information
  appName: 'AURICORE',
  appVersion: '1.0.0',
  
  // Supabase Configuration
  supabase: {
    url: 'https://dbxujfpdufpnofxoqmqq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieHVqZnBkdWZwbm9meG9xbXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTc2MzUsImV4cCI6MjA3NTU3MzYzNX0.j5ooRL-yARuZOqAd7dlh7E33U1kdtxOPMhTENP5NFH8',
  },
  
  // Stream Chat Configuration
  streamChat: {
    apiKey: 'ykycjfh6zw33', // Get from https://getstream.io/dashboard/
  },
  
  // Authentication Settings
  auth: {
    // Minimum password length
    minPasswordLength: 6,
    
    // OTP settings
    otpLength: 6,
    otpResendTimeout: 60, // seconds
    
    // Session settings
    persistSession: true,
    autoRefreshToken: true,
  },
  
  // Onboarding Settings
  onboarding: {
    splashDuration: 2000, // milliseconds
    skipEnabled: true,
  },
  
  // UI Settings
  ui: {
    animationDuration: 300, // milliseconds
    toastDuration: 3000, // milliseconds
  },
  
  // Chat Settings
  chat: {
    messageEditTimeLimit: 5, // minutes - messages can only be edited/deleted within this time
    messagesPerPage: 50, // number of messages to load per page
  },
  
  // Coach Types
  coachTypes: {
    JOBSEEKER_ADVISOR: 'jobseeker_advisor',
    SKILL_DEVELOPER: 'skill_developer',
    ENTREPRENEURSHIP_ADVISOR: 'entrepreneurship_advisor',
  },
  
  // Coach Type Display Names
  coachTypeLabels: {
    jobseeker_advisor: 'Career Coaching',
    skill_developer: 'Skills Development',
    entrepreneurship_advisor: 'Entrepreneurship',
  },
  
  // Weather API Configuration
  weather: {
    apiKey: '2d0a7b8175429dda3d7ac8e4f835b1a4',
    apiBaseUrl: 'https://api.openweathermap.org/data/2.5',
  },
  
  // Karma System Configuration
  karma: {
    // Max karma limits
    maxImpactKarma: 400,
    maxConnectionKarma: 250,
    maxWisdomKarma: 200,
    maxEngagementXP: 150,
    maxTotalKarma: 1000,
    
    // Session settings
    defaultSessionDuration: 60, // minutes
    minSessionsForStreak: 2, // sessions per week for active streak
    
    // XP bonuses
    reflectionBonus: 5,
    sessionAttendanceBonus: 20,
    feedbackGivenBonus: 10,
    referralBonus: 30,
    streakBonus: 10,
    streakPenalty: -5,
    
    // Vibe types
    vibes: {
      FOCUS: 'focus',
      ENCOURAGING: 'encouraging',
      BREAKTHROUGH: 'breakthrough',
      OKAY: 'okay',
      DISAPPOINTING: 'disappointing',
    },
    
    // Vibe labels with emojis
    vibeLabels: {
      focus: '🎯 Made me focus',
      encouraging: '🌱 Felt encouraging',
      breakthrough: '⚡ Breakthrough moment!',
      okay: '🌤️ Okay but not sure yet',
      disappointing: '🌧️ Didn\'t meet my expectations',
    },
    
    // Session types
    sessionTypes: [
      'Resume & Interview',
      'Confidence Building',
      'Job Search Strategy',
      'Industry Insight',
      'Skill Development',
      'Business Planning',
      'Networking Tips',
      'Career Transition',
    ],
  },
};

// Export individual configs for convenience
export const { 
  supabase: supabaseConfig,
  streamChat: streamChatConfig,
  auth: authConfig,
  chat: chatConfig,
  coachTypes,
  coachTypeLabels,
  karma: karmaConfig,
} = appConfig;

