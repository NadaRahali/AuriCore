import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, gradients } from '../config/theme';
import { getSleepStages, getSleepQualityMetrics } from '../lib/sleepStages';
import { getNutritionData, getTriggerFoodWarnings } from '../lib/nutrition';
import { generateDoctorReport } from '../lib/reports';
import { checkPremiumStatus } from '../lib/premium';

const TABS = ['Sleep', 'Nutrition', 'Reports', 'Premium'];

export default function InsightsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Sleep');
  const [sleepPeriod, setSleepPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [sleepData, setSleepData] = useState(null);
  const [sleepLoading, setSleepLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [lastReportDate, setLastReportDate] = useState(null);

  useEffect(() => {
    loadData();
    checkPremium();
  }, []);

  useEffect(() => {
    if (activeTab === 'Sleep') {
      loadSleepData();
    }
  }, [sleepPeriod]);

  const loadData = async () => {
    await Promise.all([
      loadSleepData(),
      loadNutritionData(),
    ]);
  };

  const loadSleepData = async () => {
    try {
      setSleepLoading(true);
      const result = await getSleepStages(null, { period: sleepPeriod });
      if (result.data) {
        setSleepData(result.data);
      }
    } catch (error) {
      console.error('Error loading sleep data:', error);
    } finally {
      setSleepLoading(false);
    }
  };

  const loadNutritionData = async () => {
    try {
      setNutritionLoading(true);
      const result = await getNutritionData(null, new Date());
      if (result.data) {
        setNutritionData(result.data);
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setNutritionLoading(false);
    }
  };

  const checkPremium = async () => {
    try {
      const result = await checkPremiumStatus(null);
      setIsPremium(result.isPremium || false);
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      const result = await generateDoctorReport(null, {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date(),
      });
      
      if (result.success) {
        setLastReportDate(new Date());
        Alert.alert(
          'Report Generated',
          'Your doctor report has been generated successfully! Check your downloads.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const renderSleepStages = () => {
    if (sleepLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    const stages = sleepData?.stages || [];
    const metrics = sleepData?.metrics || {};

    return (
      <View style={styles.sectionContent}>
        {/* Sleep Quality Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.duration || '7.5'}h</Text>
            <Text style={styles.metricLabel}>Duration</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{metrics.efficiency || '85'}%</Text>
            <Text style={styles.metricLabel}>Efficiency</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit={true} minimumFontScale={0.7}>
              {metrics.consistency === 'Excellent' ? 'Great' : metrics.consistency || 'Good'}
            </Text>
            <Text style={styles.metricLabel}>Consistency</Text>
          </View>
        </View>

        {/* Sleep Stages Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionSubtitle}>
            Sleep Stages {sleepPeriod === 'daily' ? '(Today)' : sleepPeriod === 'weekly' ? '(Last 7 Days)' : '(Last 30 Days)'}
          </Text>
          <View style={styles.stagesList}>
            {stages.map((stage, index) => (
              <View key={index} style={styles.stageItem}>
                <View style={styles.stageInfo}>
                  <View style={[styles.stageColor, { backgroundColor: stage.color }]} />
                  <View style={styles.stageDetails}>
                    <Text style={styles.stageName}>{stage.name}</Text>
                    <Text style={styles.stageTime}>{stage.duration} hours</Text>
                  </View>
                </View>
                <Text style={styles.stagePercentage}>{stage.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[styles.toggleButton, sleepPeriod === 'daily' && styles.toggleButtonActive]}
            onPress={() => setSleepPeriod('daily')}
          >
            <Text style={[styles.toggleButtonText, sleepPeriod === 'daily' && styles.toggleButtonTextActive]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, sleepPeriod === 'weekly' && styles.toggleButtonActive]}
            onPress={() => setSleepPeriod('weekly')}
          >
            <Text style={[styles.toggleButtonText, sleepPeriod === 'weekly' && styles.toggleButtonTextActive]}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, sleepPeriod === 'monthly' && styles.toggleButtonActive]}
            onPress={() => setSleepPeriod('monthly')}
          >
            <Text style={[styles.toggleButtonText, sleepPeriod === 'monthly' && styles.toggleButtonTextActive]}>Monthly</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderNutrition = () => {
    if (nutritionLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    const daily = nutritionData?.daily || {};
    const meals = nutritionData?.meals || [];
    const warnings = nutritionData?.warnings || [];

    return (
      <View style={styles.sectionContent}>
        {/* Daily Macros */}
        <View style={styles.macrosContainer}>
          <Text style={styles.sectionSubtitle}>Daily Nutrition</Text>
          <View style={styles.macroCard}>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: '#FF6B6B', width: `${daily.carbs || 45}%` }]} />
              <Text style={styles.macroLabel}>Carbs: {daily.carbs || 45}%</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: '#4ECDC4', width: `${daily.protein || 30}%` }]} />
              <Text style={styles.macroLabel}>Protein: {daily.protein || 30}%</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, { backgroundColor: '#FFE66D', width: `${daily.fat || 25}%` }]} />
              <Text style={styles.macroLabel}>Fat: {daily.fat || 25}%</Text>
            </View>
          </View>
        </View>

        {/* Water Intake */}
        <View style={styles.waterContainer}>
          <Text style={styles.sectionSubtitle}>Water Intake</Text>
          <View style={styles.waterCard}>
            <Ionicons name="water-outline" size={32} color={colors.primary} />
            <Text style={styles.waterAmount}>{nutritionData?.water || 6} / 8</Text>
            <Text style={styles.waterLabel}>glasses today</Text>
          </View>
        </View>

        {/* Meals */}
        <View style={styles.mealsContainer}>
          <Text style={styles.sectionSubtitle}>Today's Meals</Text>
          {meals.map((meal, index) => (
            <View key={index} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Ionicons name={meal.icon} size={20} color={colors.primary} />
                <Text style={styles.mealName}>{meal.name}</Text>
              </View>
              <Text style={styles.mealDetails}>{meal.details}</Text>
              <Text style={styles.mealCalories}>{meal.calories} calories</Text>
            </View>
          ))}
        </View>

        {/* Trigger Food Warnings */}
        {warnings.length > 0 && (
          <View style={styles.warningsContainer}>
            <Text style={styles.sectionSubtitle}>Trigger Food Warnings</Text>
            {warnings.map((warning, index) => (
              <View key={index} style={styles.warningCard}>
                <Ionicons name="warning-outline" size={20} color={colors.warning} />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addMealButton}>
          <Ionicons name="add-circle-outline" size={24} color={colors.textWhite} />
          <Text style={styles.addMealText}>Log Meal</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReports = () => {
    return (
      <View style={styles.sectionContent}>
        <View style={styles.reportInfoCard}>
          <Ionicons name="document-text-outline" size={48} color={colors.primary} />
          <Text style={styles.reportInfoTitle}>Doctor Report</Text>
          <Text style={styles.reportInfoText}>
            Generate comprehensive reports for your doctor including migraine diary, 
            health data, and insights. Available in Excel and PDF formats.
          </Text>
        </View>

        {lastReportDate && (
          <View style={styles.lastReportCard}>
            <Text style={styles.lastReportLabel}>Last Generated:</Text>
            <Text style={styles.lastReportDate}>
              {lastReportDate.toLocaleDateString()} at {lastReportDate.toLocaleTimeString()}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.generateButton, generatingReport && styles.generateButtonDisabled]}
          onPress={handleGenerateReport}
          disabled={generatingReport}
        >
          {generatingReport ? (
            <ActivityIndicator size="small" color={colors.textWhite} />
          ) : (
            <>
              <Ionicons name="download-outline" size={24} color={colors.textWhite} />
              <Text style={styles.generateButtonText}>Generate Doctor Report</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.reportDetailsCard}>
          <Text style={styles.reportDetailsTitle}>Report Includes:</Text>
          <View style={styles.reportDetailsList}>
            <View style={styles.reportDetailItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.reportDetailText}>30-minute interval health data</Text>
            </View>
            <View style={styles.reportDetailItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.reportDetailText}>Complete migraine diary</Text>
            </View>
            <View style={styles.reportDetailItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.reportDetailText}>Trigger analysis and patterns</Text>
            </View>
            <View style={styles.reportDetailItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.reportDetailText}>Sleep and nutrition insights</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPremium = () => {
    return (
      <View style={styles.sectionContent}>
        <View style={styles.premiumHeader}>
          <Ionicons name="star" size={48} color={colors.primary} />
          <Text style={styles.premiumTitle}>Premium Features</Text>
          <Text style={styles.premiumSubtitle}>
            Unlock advanced features to better manage your migraine journey
          </Text>
        </View>

        {/* Prescription Management Card */}
        <TouchableOpacity
          style={styles.premiumCard}
          onPress={() => navigation.navigate('Prescription')}
        >
          <View style={styles.premiumCardHeader}>
            <Ionicons name="medical-outline" size={32} color={colors.primary} />
            {!isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            )}
          </View>
          <Text style={styles.premiumCardTitle}>Prescription Management</Text>
          <Text style={styles.premiumCardDescription}>
            Request prescription refills, communicate with your doctor, and manage medications without long waits.
          </Text>
          {!isPremium && (
            <View style={styles.premiumLock}>
              <Ionicons name="lock-closed" size={20} color={colors.textLight} />
              <Text style={styles.premiumLockText}>Upgrade to unlock</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Nutritionist Card */}
        <TouchableOpacity
          style={styles.premiumCard}
          onPress={() => navigation.navigate('Nutritionist')}
        >
          <View style={styles.premiumCardHeader}>
            <Ionicons name="restaurant-outline" size={32} color={colors.primary} />
            {!isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            )}
          </View>
          <Text style={styles.premiumCardTitle}>Nutritionist Consultation</Text>
          <Text style={styles.premiumCardDescription}>
            Get personalized meal plans, AI recommendations, and connect with certified nutritionists.
          </Text>
          {!isPremium && (
            <View style={styles.premiumLock}>
              <Ionicons name="lock-closed" size={20} color={colors.textLight} />
              <Text style={styles.premiumLockText}>Upgrade to unlock</Text>
            </View>
          )}
        </TouchableOpacity>

        {!isPremium && (
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Sleep':
        return renderSleepStages();
      case 'Nutrition':
        return renderNutrition();
      case 'Reports':
        return renderReports();
      case 'Premium':
        return renderPremium();
      default:
        return renderSleepStages();
    }
  };

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Insights</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </LinearGradient>
    </View>
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
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
    textAlign: 'center',
    minHeight: 28, // Ensure consistent height
  },
  metricLabel: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionSubtitle: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.md,
  },
  stagesList: {
    gap: spacing.sm,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  stageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stageColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  stageDetails: {
    flex: 1,
  },
  stageName: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
  },
  stageTime: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  stagePercentage: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.small,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  toggleButtonTextActive: {
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  macrosContainer: {
    marginBottom: spacing.lg,
  },
  macroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    gap: spacing.md,
  },
  macroItem: {
    gap: spacing.xs,
  },
  macroBar: {
    height: 8,
    borderRadius: 4,
  },
  macroLabel: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
  },
  waterContainer: {
    marginBottom: spacing.lg,
  },
  waterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    alignItems: 'center',
  },
  waterAmount: {
    fontSize: fontSizes.huge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginTop: spacing.sm,
  },
  waterLabel: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  mealsContainer: {
    marginBottom: spacing.lg,
  },
  mealCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  mealName: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  mealDetails: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  mealCalories: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.primary,
  },
  warningsContainer: {
    marginBottom: spacing.lg,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 167, 38, 0.2)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    gap: spacing.sm,
  },
  addMealText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  reportInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  reportInfoTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  reportInfoText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  lastReportCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  lastReportLabel: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  lastReportDate: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  reportDetailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
  },
  reportDetailsTitle: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.md,
  },
  reportDetailsList: {
    gap: spacing.sm,
  },
  reportDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reportDetailText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    flex: 1,
  },
  premiumHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  premiumTitle: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  premiumSubtitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  premiumCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  premiumCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  premiumBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.small,
  },
  premiumBadgeText: {
    fontSize: fontSizes.tiny,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  premiumCardTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  premiumCardDescription: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 20,
  },
  premiumLock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  premiumLockText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  upgradeButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
});

