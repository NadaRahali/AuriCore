import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, gradients } from '../config/theme';
import { checkPremiumStatus } from '../lib/premium';
import { getAIMealPlan, getNutritionistRecommendations, bookConsultation, getConsultationHistory } from '../lib/nutritionist';

export default function NutritionistScreen({ navigation }) {
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'consultation'
  const [mealPlan, setMealPlan] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [nutritionists, setNutritionists] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      checkPremium(),
      loadAIData(),
      loadConsultationData(),
    ]);
  };

  const checkPremium = async () => {
    try {
      const result = await checkPremiumStatus(null);
      setIsPremium(result.isPremium || false);
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const loadAIData = async () => {
    try {
      setLoading(true);
      const [mealPlanResult, recommendationsResult] = await Promise.all([
        getAIMealPlan(null, {}),
        getNutritionistRecommendations(null),
      ]);

      if (mealPlanResult.data) {
        setMealPlan(mealPlanResult.data);
      }
      if (recommendationsResult.data) {
        setRecommendations(recommendationsResult.data);
      }
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConsultationData = async () => {
    try {
      const [historyResult] = await Promise.all([
        getConsultationHistory(null),
      ]);

      if (historyResult.data) {
        setConsultations(historyResult.data);
      }

      // Mock nutritionists list
      setNutritionists([
        { id: '1', name: 'Dr. Sarah Johnson', specialization: 'Migraine Nutrition', rating: 4.9, available: true },
        { id: '2', name: 'Dr. Michael Chen', specialization: 'Wellness & Diet', rating: 4.8, available: true },
        { id: '3', name: 'Dr. Emily Rodriguez', specialization: 'Holistic Nutrition', rating: 4.7, available: false },
      ]);
    } catch (error) {
      console.error('Error loading consultation data:', error);
    }
  };

  const handleBookConsultation = (nutritionistId) => {
    Alert.alert(
      'Book Consultation',
      'Consultation booking feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  if (!isPremium) {
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
            <Text style={styles.headerTitle}>Nutritionist Consultation</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.premiumLockContainer}>
            <Ionicons name="lock-closed" size={64} color={colors.primary} />
            <Text style={styles.premiumLockTitle}>Premium Feature</Text>
            <Text style={styles.premiumLockText}>
              Upgrade to Premium to access personalized meal plans, AI recommendations, and connect with certified nutritionists.
            </Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Nutritionist Consultation</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ai' && styles.tabActive]}
            onPress={() => setActiveTab('ai')}
          >
            <Text style={[styles.tabText, activeTab === 'ai' && styles.tabTextActive]}>
              AI Recommendations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'consultation' && styles.tabActive]}
            onPress={() => setActiveTab('consultation')}
          >
            <Text style={[styles.tabText, activeTab === 'consultation' && styles.tabTextActive]}>
              Connect with Nutritionist
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'ai' ? renderAIRecommendations() : renderConsultation()}
        </ScrollView>
      </LinearGradient>
    </View>
  );

  function renderAIRecommendations() {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      );
    }

    return (
      <View style={styles.sectionContent}>
        {/* Weekly Meal Plan */}
        {mealPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Weekly Meal Plan</Text>
            {mealPlan.weeklyMeals && mealPlan.weeklyMeals.map((day, index) => (
              <View key={index} style={styles.dayCard}>
                <Text style={styles.dayName}>{day.day}</Text>
                <View style={styles.mealsList}>
                  {day.meals.map((meal, mealIndex) => (
                    <View key={mealIndex} style={styles.mealItem}>
                      <Ionicons name={meal.icon} size={16} color={colors.primary} />
                      <Text style={styles.mealItemText}>{meal.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recipe Suggestions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipe Suggestions</Text>
          {mealPlan?.recipes && mealPlan.recipes.map((recipe, index) => (
            <TouchableOpacity key={index} style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.recipeDescription}>{recipe.description}</Text>
              <View style={styles.recipeTags}>
                {recipe.tags.map((tag, tagIndex) => (
                  <View key={tagIndex} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Shopping List */}
        {mealPlan?.shoppingList && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shopping List</Text>
            <View style={styles.shoppingListCard}>
              {mealPlan.shoppingList.map((item, index) => (
                <View key={index} style={styles.shoppingItem}>
                  <Ionicons name="checkbox-outline" size={20} color={colors.textMuted} />
                  <Text style={styles.shoppingItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }

  function renderConsultation() {
    return (
      <View style={styles.sectionContent}>
        {/* Available Nutritionists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Nutritionists</Text>
          {nutritionists.map((nutritionist) => (
            <TouchableOpacity
              key={nutritionist.id}
              style={styles.nutritionistCard}
              onPress={() => handleBookConsultation(nutritionist.id)}
            >
              <View style={styles.nutritionistInfo}>
                <View style={styles.nutritionistAvatar}>
                  <Text style={styles.nutritionistInitial}>
                    {nutritionist.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.nutritionistDetails}>
                  <Text style={styles.nutritionistName}>{nutritionist.name}</Text>
                  <Text style={styles.nutritionistSpecialization}>{nutritionist.specialization}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color={colors.warning} />
                    <Text style={styles.ratingText}>{nutritionist.rating}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.nutritionistActions}>
                {nutritionist.available ? (
                  <View style={styles.availableBadge}>
                    <Text style={styles.availableText}>Available</Text>
                  </View>
                ) : (
                  <View style={styles.unavailableBadge}>
                    <Text style={styles.unavailableText}>Busy</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Consultation History */}
        {consultations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consultation History</Text>
            {consultations.map((consultation) => (
              <View key={consultation.id} style={styles.consultationCard}>
                <View style={styles.consultationHeader}>
                  <Text style={styles.consultationDate}>
                    {new Date(consultation.consultation_date).toLocaleDateString()}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(consultation.status) + '30' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(consultation.status) }]}>
                      {consultation.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {consultation.notes && (
                  <Text style={styles.consultationNotes}>{consultation.notes}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* In-App Messaging (Dummy) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Messages</Text>
          <View style={styles.messageCard}>
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>
                Based on your migraine triggers, I recommend increasing your magnesium intake. Try adding more leafy greens and nuts to your diet.
              </Text>
              <Text style={styles.messageTime}>Dr. Sarah Johnson • 2 hours ago</Text>
            </View>
          </View>
          <View style={styles.messageCard}>
            <View style={[styles.messageBubble, styles.messageBubbleUser]}>
              <Text style={styles.messageText}>
                Thank you! I'll try that. Should I avoid any specific foods?
              </Text>
              <Text style={styles.messageTime}>You • 1 hour ago</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  function getStatusColor(status) {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'scheduled':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textMuted;
    }
  }
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
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  tabTextActive: {
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionContent: {
    gap: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  dayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dayName: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  mealsList: {
    gap: spacing.xs,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mealItemText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    lineHeight: 20,
  },
  recipeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recipeName: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  recipeDescription: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primary + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  tagText: {
    fontSize: fontSizes.tiny,
    fontFamily: fonts.regular,
    color: colors.primary,
  },
  shoppingListCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    gap: spacing.sm,
  },
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shoppingItemText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
  },
  nutritionistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  nutritionistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nutritionistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  nutritionistInitial: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  nutritionistDetails: {
    flex: 1,
  },
  nutritionistName: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  nutritionistSpecialization: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
  },
  nutritionistActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  availableBadge: {
    backgroundColor: colors.success + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  availableText: {
    fontSize: fontSizes.tiny,
    fontFamily: fonts.bold,
    color: colors.success,
  },
  unavailableBadge: {
    backgroundColor: colors.error + '30',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  unavailableText: {
    fontSize: fontSizes.tiny,
    fontFamily: fonts.bold,
    color: colors.error,
  },
  consultationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  consultationDate: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  statusText: {
    fontSize: fontSizes.tiny,
    fontFamily: fonts.bold,
  },
  consultationNotes: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 20,
  },
  messageCard: {
    marginBottom: spacing.md,
  },
  messageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    maxWidth: '80%',
  },
  messageBubbleUser: {
    backgroundColor: colors.primary + '40',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  messageTime: {
    fontSize: fontSizes.tiny,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  premiumLockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  premiumLockTitle: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  premiumLockText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  upgradeButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
});

