import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, gradients } from '../config/theme';
import { getChannels } from '../lib/community';

export default function CommunityScreen({ navigation }) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const result = await getChannels();
      if (result.data) {
        setChannels(result.data);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelPress = (channelId) => {
    // TODO: Navigate to channel detail screen with posts
    console.log('Navigate to channel:', channelId);
  };

  const handleCreatePost = () => {
    // TODO: Navigate to create post screen
    console.log('Create new post');
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
          <Text style={styles.headerTitle}>Community & Support</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome to Our Community</Text>
            <Text style={styles.welcomeText}>
              A safe space to share experiences, discuss triggers, and support each other on your wellness journey.
            </Text>
          </View>

          {/* Create Post Button */}
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={handleCreatePost}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.textWhite} />
            <Text style={styles.createPostText}>Create Post</Text>
          </TouchableOpacity>

          {/* Channels Section */}
          <View style={styles.channelsSection}>
            <Text style={styles.sectionTitle}>Browse Channels</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.channelsList}>
                {channels.map((channel) => (
                  <TouchableOpacity
                    key={channel.id}
                    style={styles.channelCard}
                    onPress={() => handleChannelPress(channel.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.channelIconContainer}>
                      <Text style={styles.channelIcon}>{channel.icon}</Text>
                    </View>
                    <View style={styles.channelContent}>
                      <Text style={styles.channelName}>{channel.name}</Text>
                      <Text style={styles.channelDescription}>{channel.description}</Text>
                      <View style={styles.channelStats}>
                        <View style={styles.statItem}>
                          <Ionicons name="people-outline" size={14} color={colors.textLight} />
                          <Text style={styles.statText}>{channel.member_count || 0} members</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="chatbubbles-outline" size={14} color={colors.textLight} />
                          <Text style={styles.statText}>{channel.post_count || 0} posts</Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Community Guidelines */}
          <View style={styles.guidelinesSection}>
            <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
            <View style={styles.guidelinesList}>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={styles.guidelineText}>Be respectful and supportive</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={styles.guidelineText}>Share experiences, not medical advice</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={styles.guidelineText}>Keep discussions wellness-focused</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={styles.guidelineText}>Respect privacy and confidentiality</Text>
              </View>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerSection}>
            <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
            <Text style={styles.disclaimerText}>
              This is a wellness community, not medical advice. Always consult healthcare professionals for medical concerns.
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  welcomeSection: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.large,
    ...shadows.medium,
  },
  welcomeTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 22,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  createPostText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginLeft: spacing.sm,
  },
  channelsSection: {
    marginBottom: spacing.xl,
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
  channelsList: {
    gap: spacing.md,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    ...shadows.small,
  },
  channelIconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(180, 103, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  channelIcon: {
    fontSize: 24,
  },
  channelContent: {
    flex: 1,
  },
  channelName: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  channelDescription: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  channelStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSizes.tiny,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  guidelinesSection: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.medium,
  },
  guidelinesTitle: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.md,
  },
  guidelinesList: {
    gap: spacing.sm,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  guidelineText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    flex: 1,
  },
  disclaimerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: 'rgba(255, 167, 38, 0.1)',
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
  },
  disclaimerText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
});

