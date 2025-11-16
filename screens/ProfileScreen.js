import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows, gradients } from '../config/theme';

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthSyncEnabled, setHealthSyncEnabled] = useState(true);
  const [calendarEnabled, setCalendarEnabled] = useState(true);

  // Extract user info
  const firstName = (user?.user_metadata?.full_name && typeof user.user_metadata.full_name === 'string' && user.user_metadata.full_name.split(' ')[0]) || 
                    (user?.email && typeof user.email === 'string' && user.email.split('@')[0]) || 
                    'User';
  const email = (user?.email && typeof user.email === 'string') ? user.email : '';
  const fullName = (user?.user_metadata?.full_name && typeof user.user_metadata.full_name === 'string') ? user.user_metadata.full_name : '';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
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
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.backButton} /> 
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {String(firstName && firstName.length > 0 ? firstName.charAt(0).toUpperCase() : 'U')}
                </Text>
              </View>
            </View>
            <Text style={styles.nameText}>{String(fullName || firstName || 'User')}</Text>
            <Text style={styles.emailText}>{String(email || 'No email')}</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Settings</Text>

            {/* Notification Settings */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={24} color={colors.textWhite} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Notifications</Text>
                  <Text style={styles.settingSubtitle}>Migraine alerts and reminders</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: colors.primary }}
                thumbColor={colors.textWhite}
              />
            </View>

            {/* Health Data Sync */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="heart-outline" size={24} color={colors.textWhite} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Health Data Sync</Text>
                  <Text style={styles.settingSubtitle}>Sync with HealthKit and wearables</Text>
                </View>
              </View>
              <Switch
                value={healthSyncEnabled}
                onValueChange={setHealthSyncEnabled}
                trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: colors.primary }}
                thumbColor={colors.textWhite}
              />
            </View>

            {/* Calendar Integration */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="calendar-outline" size={24} color={colors.textWhite} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Calendar Integration</Text>
                  <Text style={styles.settingSubtitle}>Track busy schedules for predictions</Text>
                </View>
              </View>
              <Switch
                value={calendarEnabled}
                onValueChange={setCalendarEnabled}
                trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: colors.primary }}
                thumbColor={colors.textWhite}
              />
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Account</Text>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.textWhite} />
              <Text style={styles.menuItemText}>Privacy & Security</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textWhite} style={{ opacity: 0.5 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="help-circle-outline" size={24} color={colors.textWhite} />
              <Text style={styles.menuItemText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textWhite} style={{ opacity: 0.5 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="document-text-outline" size={24} color={colors.textWhite} />
              <Text style={styles.menuItemText}>Terms & Conditions</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textWhite} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: fontSizes.huge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  nameText: {
    fontSize: fontSizes.xlarge,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },
  emailText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    opacity: 0.8,
    marginBottom: spacing.md,
  },
  editButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.textWhite,
  },
  editButtonText: {
    fontSize: fontSizes.small,
    fontFamily: fonts.bold,
    color: colors.textWhite,
  },
  settingsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.large,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.textWhite,
    marginBottom: spacing.xs / 2,
  },
  settingSubtitle: {
    fontSize: fontSizes.small,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    opacity: 0.7,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  menuItemText: {
    flex: 1,
    fontSize: fontSizes.medium,
    fontFamily: fonts.regular,
    color: colors.textWhite,
    marginLeft: spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  logoutButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fonts.bold,
    color: colors.error,
    marginLeft: spacing.sm,
  },
});

