import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts, fontSizes, spacing, borderRadius, gradients, shadows } from '../config/theme';
import { saveMigraineProfile } from '../lib/migraineProfile';
import { hasCompletedOnboarding, hasGrantedPermissions, getNextScreenAfterAuth } from '../lib/navigationHelper';

// Onboarding flow configuration
// Note: ask_name step removed since user is already registered
const ONBOARDING_STEPS = [
  {
    id: "intro_hello",
    type: "message",
    // Text will be personalized with user's first name
    text: "", // Will be set dynamically
    next: "ask_age"
  },
  {
    id: "ask_age",
    type: "input",
    inputType: "number",
    text: "Nice to meet you! How old are you?",
    saveAs: "age",
    next: "ask_gender"
  },
  {
    id: "ask_gender",
    type: "options",
    text: "What is your gender?",
    saveAs: "gender",
    options: [
      "Female",
      "Male",
      "Non-binary",
      "Genderqueer",
      "Genderfluid",
      "Agender",
      "Transgender Woman",
      "Transgender Man",
      "Two-Spirit",
      "Intersex",
      "Prefer not to say"
    ],
    next: "ask_country"
  },
  {
    id: "ask_country",
    type: "input",
    inputType: "text",
    text: "Which country do you live in?",
    saveAs: "country",
    next: "sleep_hours"
  },
  {
    id: "sleep_hours",
    type: "options",
    text: "Let's start with your sleep. How many hours do you usually sleep per night?",
    saveAs: "sleep_hours",
    options: ["Less than 5", "5–7", "7–9", "More than 9"],
    next: "sleep_regular"
  },
  {
    id: "sleep_regular",
    type: "options",
    text: "Is your sleep schedule regular or does it change often?",
    saveAs: "sleep_regular",
    options: ["Very regular", "Somewhat regular", "Very irregular"],
    next: "hydration"
  },
  {
    id: "hydration",
    type: "options",
    text: "How much water do you drink daily?",
    saveAs: "hydration",
    options: ["Less than 1L", "1–2L", "2–3L", "More than 3L"],
    next: "meal_pattern"
  },
  {
    id: "meal_pattern",
    type: "options",
    text: "Do you often skip meals?",
    saveAs: "meal_pattern",
    options: ["Never", "Sometimes", "Often", "Daily"],
    next: "stress_frequency"
  },
  {
    id: "stress_frequency",
    type: "options",
    text: "How often do you feel stressed?",
    saveAs: "stress_frequency",
    options: ["Rarely", "Sometimes", "Often", "Daily"],
    next: "screen_trigger"
  },
  {
    id: "screen_trigger",
    type: "options",
    text: "Does screen time trigger your headaches?",
    saveAs: "screen_trigger",
    options: ["Yes", "No", "Sometimes"],
    next: "weather_trigger"
  },
  {
    id: "weather_trigger",
    type: "conditional",
    rules: [
      {
        condition: { country: "Finland" },
        question: {
          type: "options",
          text: "Does winter darkness or artificial light affect your headaches?",
          saveAs: "weather_trigger",
          options: ["Yes", "No", "Sometimes"]
        }
      },
      {
        condition: { country_group: "hot_climates" },
        question: {
          type: "options",
          text: "Do heat or humidity trigger your migraines?",
          saveAs: "weather_trigger",
          options: ["Yes", "No", "Sometimes"]
        }
      },
      {
        condition: "default",
        question: {
          type: "options",
          text: "Do weather changes affect your migraines?",
          saveAs: "weather_trigger",
          options: ["Yes", "No", "Sometimes"]
        }
      }
    ],
    next: "female_questions"
  },
  {
    id: "female_questions",
    type: "conditional",
    rules: [
      {
        condition: { gender: "Female" },
        question: {
          type: "options",
          text: "Do your migraines occur around your menstrual cycle?",
          saveAs: "cycle_trigger",
          options: ["Yes", "No", "Not sure"]
        }
      },
      {
        condition: { gender: "Transgender Woman" },
        question: {
          type: "options",
          text: "Are you currently taking estrogen or hormone therapy?",
          saveAs: "hormone_therapy",
          options: ["Yes", "No", "Prefer not to say"]
        }
      },
      {
        condition: { gender: "Transgender Man" },
        question: {
          type: "options",
          text: "Are you currently taking testosterone therapy?",
          saveAs: "hormone_therapy",
          options: ["Yes", "No", "Prefer not to say"]
        }
      },
      {
        condition: "default",
        skip: true
      }
    ],
    next: "medication"
  },
  {
    id: "medication",
    type: "options",
    text: "Are you taking any daily medications right now?",
    saveAs: "medications",
    options: ["Yes", "No"],
    next: "exercise"
  },
  {
    id: "exercise",
    type: "options",
    text: "How often do you exercise?",
    saveAs: "exercise",
    options: ["Rarely", "1–2 times a week", "3–5 times a week", "Daily"],
    next: "caffeine"
  },
  {
    id: "caffeine",
    type: "options",
    text: "How many caffeinated drinks do you usually have per day?",
    saveAs: "caffeine",
    options: ["0", "1–2", "3–4", "5+"],
    next: "summary"
  },
  {
    id: "summary",
    type: "message",
    text: "Thank you! I'll use all this information to learn your personal triggers and build your migraine prediction profile.",
    next: null
  }
];

// Hot climate countries (simplified list)
const HOT_CLIMATE_COUNTRIES = ['India', 'Thailand', 'Brazil', 'Mexico', 'Egypt', 'Saudi Arabia', 'UAE', 'Australia'];

// Custom Send Icon Component
const SendIcon = ({ color = '#171228', size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
    <Path
      d="M21 1L10 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 1L14 21L10 12L1 8L21 1Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Typing Indicator Styles (defined before component)
const typingStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '80%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textWhite,
    marginHorizontal: 3,
  },
});

// Typing Indicator Component
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Create staggered animation for three dots
    const animateDot = (dot, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      animateDot(dot1, 0),
      animateDot(dot2, 200),
      animateDot(dot3, 400),
    ];

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={typingStyles.container}>
      <View style={typingStyles.messageContainer}>
        {/* AI Avatar */}
        <View style={styles.aiAvatar}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#4A90E2" />
        </View>
        {/* Typing Bubble */}
        <View style={typingStyles.typingBubble}>
          <Animated.View style={[typingStyles.dot, { opacity: dot1 }]} />
          <Animated.View style={[typingStyles.dot, { opacity: dot2 }]} />
          <Animated.View style={[typingStyles.dot, { opacity: dot3 }]} />
        </View>
      </View>
    </View>
  );
};

export default function ChatScreen({ navigation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentStepId, setCurrentStepId] = useState('intro_hello');
  const [currentQuestion, setCurrentQuestion] = useState(null); // For conditional questions
  const [answers, setAnswers] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const scrollViewRef = useRef(null);

  // Extract first name from user metadata or email
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                    user?.email?.split('@')[0] || 
                    'there';

  // Check if onboarding is already completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const completed = await hasCompletedOnboarding();
      if (completed) {
        // Onboarding already completed, skip to next screen
        const nextScreen = await getNextScreenAfterAuth();
        navigation.replace(nextScreen);
      }
    };
    
    checkOnboardingStatus();
  }, [navigation]);

  // Initialize with first message
  useEffect(() => {
    const firstStep = ONBOARDING_STEPS.find(s => s.id === 'intro_hello');
    if (firstStep) {
      // Personalize the intro message with user's first name
      const personalizedText = `Hello ${firstName}! I'm your AI Bubbly. I'm here to support you throughout your migraine journey. I learn your patterns and help predict future migraines.`;
      const initialMessage = {
        id: '1',
        text: personalizedText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      // Auto-advance message type steps
      setTimeout(() => {
        processStep(firstStep.next);
      }, 1500);
    }
  }, [firstName]);

  // Scroll to bottom when new message is added or typing indicator appears
  useEffect(() => {
    if (scrollViewRef.current && (messages.length > 0 || showTypingIndicator)) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, showTypingIndicator]);

  // Get current step
  const getCurrentStep = () => {
    return ONBOARDING_STEPS.find(step => step.id === currentStepId);
  };

  // Process conditional step
  const processConditionalStep = (step) => {
    // First, check all specific rules (non-default)
    for (const rule of step.rules) {
      if (rule.condition === "default") {
        continue; // Skip default rule for now
      }
      
      // Check if this specific rule matches
      let ruleMatches = false;
      
      if (rule.condition.country && answers.country) {
        ruleMatches = answers.country.toLowerCase() === rule.condition.country.toLowerCase();
      } else if (rule.condition.country_group && answers.country) {
        if (rule.condition.country_group === "hot_climates") {
          ruleMatches = HOT_CLIMATE_COUNTRIES.some(c => 
            answers.country.toLowerCase().includes(c.toLowerCase())
          );
        }
      } else if (rule.condition.gender && answers.gender) {
        ruleMatches = answers.gender === rule.condition.gender;
      }
      
      // If specific rule matches, process it immediately
      if (ruleMatches) {
        if (rule.skip) {
          return { shouldSkip: true, nextStepId: step.next };
        } else if (rule.question) {
          return { shouldSkip: false, nextStepId: processQuestion(rule.question, step.next) };
        }
      }
    }
    
    // If no specific rule matched, check for default rule
    const defaultRule = step.rules.find(r => r.condition === "default");
    if (defaultRule) {
      if (defaultRule.skip) {
        return { shouldSkip: true, nextStepId: step.next };
      } else if (defaultRule.question) {
        return { shouldSkip: false, nextStepId: processQuestion(defaultRule.question, step.next) };
      }
    }
    
    // Fallback: if no rule matches, skip to next
    return { shouldSkip: true, nextStepId: step.next };
  };

  // Process a question step (can receive either a step object or a question object)
  const processQuestion = (questionOrStep, nextStepId) => {
    const questionText = questionOrStep.text;
    const questionId = questionOrStep.saveAs;
    
    // Add delay before showing question (simulating typing)
    const typingDelay = 1500 + Math.random() * 1000; // 1.5-2.5 seconds
    
    setTimeout(() => {
      setShowTypingIndicator(false); // Hide typing indicator
      const aiMessage = {
        id: Date.now().toString(),
        text: questionText,
        sender: 'ai',
        timestamp: new Date(),
        questionId: questionId,
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      // Store the question object if it's from a conditional step (has options but no id in ONBOARDING_STEPS)
      if (questionOrStep.options) {
        setCurrentQuestion(questionOrStep);
      } else {
        setCurrentQuestion(null);
      }
      
      setIsProcessing(false);
    }, typingDelay);
    
    return nextStepId;
  };

  // Process next step
  const processStep = (stepId) => {
    if (!stepId) return;
    
    setIsProcessing(true);
    setShowTypingIndicator(true); // Show typing indicator
    
    const step = ONBOARDING_STEPS.find(s => s.id === stepId);
    if (!step) {
      setIsProcessing(false);
      setShowTypingIndicator(false);
      return;
    }

    // Add delay before showing message (simulating typing)
    const typingDelay = 1500 + Math.random() * 1000; // 1.5-2.5 seconds

    if (step.type === "message") {
      setTimeout(() => {
        setShowTypingIndicator(false); // Hide typing indicator
        const aiMessage = {
          id: Date.now().toString(),
          text: step.text,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setCurrentStepId(step.next || '');
        setIsProcessing(false);
        
        // Check if this is the final summary message (no next step)
        if (!step.next) {
          setIsComplete(true);
          // Save all collected answers to database
          handleSaveOnboardingData();
        } else if (step.next) {
          setTimeout(() => processStep(step.next), 1500);
        }
      }, typingDelay);
    } else if (step.type === "conditional") {
      const result = processConditionalStep(step);
      
      if (result.shouldSkip) {
        setShowTypingIndicator(false);
        setIsProcessing(false);
        setCurrentStepId(result.nextStepId || '');
        setCurrentQuestion(null);
        if (result.nextStepId) {
          setTimeout(() => {
            processStep(result.nextStepId);
          }, 500);
        }
      } else {
        // Show a question, keep the conditional step ID so we can track it
        setCurrentStepId(stepId); // Keep the conditional step ID
        // Note: result.nextStepId contains the next step after user answers
        // processQuestion will handle hiding typing indicator
      }
    } else {
      // input or options type
      const nextId = processQuestion(step, step.next);
      setCurrentStepId(stepId);
      setCurrentQuestion(null); // Clear conditional question
      // processQuestion will handle hiding typing indicator and isProcessing
    }
  };

  // Handle answer submission
  const handleAnswer = (answer, stepOrQuestion) => {
    if (!answer || !answer.trim()) return;

    // Save answer
    const newAnswers = { ...answers, [stepOrQuestion.saveAs]: answer.trim() };
    setAnswers(newAnswers);

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: answer.trim(),
      sender: 'user',
      timestamp: new Date(),
      read: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    
    // Move to next step
    // For conditional questions, we need to get the next step from the parent conditional step
    const currentStep = getCurrentStep();
    let nextStepId = null;
    
    // If we're on a conditional step, get the next from the conditional step
    if (currentStep && currentStep.type === 'conditional') {
      nextStepId = currentStep.next;
    } else if (stepOrQuestion.next) {
      // For regular steps, use the step's next field
      nextStepId = stepOrQuestion.next;
    }
    
    // Clear conditional question after answer
    setCurrentQuestion(null);
    
    if (nextStepId) {
      // Show typing indicator before processing next step
      setTimeout(() => {
        processStep(nextStepId);
      }, 500);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option, step) => {
    handleAnswer(option, step);
  };

  // Handle send for text/number inputs
  const handleSend = () => {
    if (!inputText.trim() || isProcessing) return;

    const currentStep = getCurrentStep();
    if (!currentStep || currentStep.type !== 'input') return;

    handleAnswer(inputText, currentStep);
  };

  // Save onboarding data to Supabase
  const handleSaveOnboardingData = async () => {
    try {
      const { data, error } = await saveMigraineProfile(answers);
      
      if (error) {
        console.error('Failed to save onboarding data:', error);
        // Optionally show error to user, but don't block UI
        // You might want to retry or show a notification
      } else {
        console.log('Onboarding data saved successfully:', data);
      }
    } catch (error) {
      console.error('Exception saving onboarding data:', error);
    }
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const renderMessage = (message) => {
    const isAI = message.sender === 'ai';
    const currentStep = getCurrentStep();
    
    // Check if we should show options
    // Either from a regular options step or from a conditional question
    let questionToShow = null;
    if (currentStep && currentStep.type === 'options' && message.questionId === currentStep.saveAs) {
      questionToShow = currentStep;
    } else if (currentQuestion && message.questionId === currentQuestion.saveAs) {
      questionToShow = currentQuestion;
    }
    
    const showOptions = isAI && questionToShow && questionToShow.options;
    
    return (
      <View key={message.id}>
        <View
          style={[
            styles.messageContainer,
            isAI ? styles.messageContainerLeft : styles.messageContainerRight,
          ]}
        >
          {isAI ? (
            <>
              {/* AI Avatar */}
              <View style={styles.aiAvatar}>
                <Ionicons name="chatbubble-ellipses" size={18} color="#4A90E2" />
              </View>
              {/* AI Message Bubble */}
              <View style={styles.aiBubble}>
                <Text style={styles.aiMessageText}>{message.text}</Text>
                <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
              </View>
            </>
          ) : (
            <>
              {/* User Message Bubble */}
              <View style={styles.userBubble}>
                <Text style={styles.userMessageText}>{message.text}</Text>
                <View style={styles.messageFooter}>
                  <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
                  {message.read && (
                    <Ionicons name="checkmark-done" size={14} color={colors.primary} style={styles.readIcon} />
                  )}
                </View>
              </View>
              {/* User Avatar */}
              <View style={styles.userAvatar}>
                {user?.user_metadata?.avatar_url ? (
                  <Text style={styles.avatarText}>
                    {user.user_metadata.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </Text>
                ) : (
                  <Text style={styles.avatarText}>
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
        {/* Render options if this is the current question */}
        {showOptions && questionToShow && questionToShow.options && (
          <View style={styles.optionsContainer}>
            {questionToShow.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleOptionSelect(option, questionToShow)}
                disabled={isProcessing}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={gradients.primary.colors}
        locations={gradients.primary.locations}
        start={gradients.primary.start}
        end={gradients.primary.end}
        style={styles.gradient}
      >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your migraine buddy</Text>
          </View>

          {/* Messages List */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(renderMessage)}
            {/* Typing Indicator */}
            {showTypingIndicator && <TypingIndicator />}
          </ScrollView>

          {/* Input Field - Only show for input type steps */}
          {getCurrentStep()?.type === 'input' && !isComplete && (
            <View style={styles.inputContainer}>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Write something..."
                  placeholderTextColor="#999999"
                  value={inputText}
                  onChangeText={setInputText}
                  maxLength={500}
                  keyboardType={getCurrentStep()?.inputType === 'number' ? 'numeric' : 'default'}
                  onSubmitEditing={handleSend}
                  editable={!isProcessing}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSend}
                  disabled={!inputText.trim() || isProcessing}
                >
                  <View style={styles.sendButtonCircle}>
                    <SendIcon
                      size={22}
                      color={inputText.trim() && !isProcessing ? '#171228' : '#999999'}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Continue Button - Show when onboarding is complete */}
          {isComplete && (
            <View style={styles.continueButtonContainer}>
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={async () => {
                  // Navigate to next screen based on progress
                  const nextScreen = await getNextScreenAfterAuth();
                  navigation.replace(nextScreen);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? spacing.xxxl + 20 : spacing.xxxl,
    paddingBottom: spacing.md,
    minHeight: 60,
  },
  headerTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  messageContainerLeft: {
    justifyContent: 'flex-start',
  },
  messageContainerRight: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  avatarText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  aiBubble: {
    maxWidth: '75%',
    backgroundColor: '#F0F5FA',
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopLeftRadius: 4,
    marginRight: spacing.xs,
  },
  userBubble: {
    maxWidth: '75%',
    backgroundColor: '#E0C7FF', // Lighter purple for user messages
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopRightRadius: 4,
    marginLeft: spacing.xs,
  },
  aiMessageText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: '#32343E',
    lineHeight: 20,
  },
  userMessageText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: '#32343E',
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: fontSizes.tiny,
    fontFamily: fonts.regular,
    color: '#666666',
    marginTop: spacing.xs / 2,
  },
  readIcon: {
    marginLeft: spacing.xs / 2,
    marginTop: spacing.xs / 2,
  },
  inputContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    backgroundColor: 'transparent',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 245, 250, 1)', // #F0F5FA
    borderRadius: 50,
    height: 62,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: '#333333',
    paddingRight: spacing.xs,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  optionText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: '#32343E',
    textAlign: 'center',
  },
  continueButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
  },
  continueButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  continueButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
});

