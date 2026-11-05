import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { useCounterStore } from '../../src/store/counterStore';
import { apiClient } from '../../src/api/client';
import { AchievementItem } from '../../src/types';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { mode, language, setLanguage, toggleTheme, t } = useThemeStore();
  const theme = Colors[mode];

  const { lifetimeTotal, streakDays } = useCounterStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);

  // Privacy toggles
  const [isPrivate, setIsPrivate] = useState(false);
  const [showMalaCount, setShowMalaCount] = useState(true);
  const [showWalletBalance, setShowWalletBalance] = useState(false);

  useEffect(() => {
    fetchProfileAndAchievements();
  }, []);

  const fetchProfileAndAchievements = async () => {
    try {
      const [profRes, achRes]: any = await Promise.all([
        apiClient.get('/users/me'),
        apiClient.get('/achievements'),
      ]);

      if (profRes.data) {
        setProfileData(profRes.data);
        setIsPrivate(profRes.data.profile?.isPrivate || false);
        setShowMalaCount(profRes.data.profile?.showMalaCount ?? true);
        setShowWalletBalance(profRes.data.profile?.showWalletBalance ?? false);
      }
      if (achRes.data) {
        setAchievements(achRes.data);
      }
    } catch {
      // offline / mock fallback
    }
  };

  const handleUpdatePrivacy = async (
    field: 'isPrivate' | 'showMalaCount' | 'showWalletBalance',
    val: boolean,
  ) => {
    if (field === 'isPrivate') setIsPrivate(val);
    if (field === 'showMalaCount') setShowMalaCount(val);
    if (field === 'showWalletBalance') setShowWalletBalance(val);

    try {
      await apiClient.put('/users/me/privacy', {
        [field]: val,
      });
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you wish to exit your sanctuary?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Devotee Sanctuary" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {user?.displayName?.[0]?.toUpperCase() || '🕉️'}
            </Text>
          </View>

          <Text style={[styles.displayName, { color: theme.textPrimary }]}>
            {user?.displayName || 'Arjun Devotee'}
          </Text>
          <Text style={[styles.username, { color: Colors.primary }]}>
            @{user?.username}
          </Text>
          <Text style={[styles.bio, { color: theme.textSecondary }]}>
            {profileData?.profile?.bio || 'Dedicated practitioner of Mindful Japa Meditation.'}
          </Text>

          {/* Key Spiritual Statistics */}
          <View style={[styles.statsRow, { borderColor: theme.border }]}>
            <View style={styles.statCol}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>
                {profileData?.practiceStatistics?.lifetimeCount ?? lifetimeTotal}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('lifetimeCount')}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text style={[styles.statValue, { color: Colors.warning }]}>
                🔥 {streakDays}d
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('streak')}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Text style={[styles.statValue, { color: Colors.accentGoldDark }]}>
                {profileData?.friendsCount ?? 12}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Friends
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Tier Banner */}
        <TouchableOpacity
          onPress={() => router.push('/subscription/index' as any)}
          style={styles.subBanner}
        >
          <View style={styles.subLeft}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            <View>
              <Text style={styles.subTitle}>
                Plan: {profileData?.subscription?.plan || 'FREE'} DEVOTEE
              </Text>
              <Text style={styles.subDesc}>
                Tap to upgrade for Vedic Rudraksha Themes & Insights
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Spiritual Badges & Milestones */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t('achievements')}
          </Text>

          <View style={styles.achievementsGrid}>
            {(achievements.length > 0
              ? achievements
              : [
                  { id: '1', name: 'First Mala Step', iconName: 'flower-outline', isUnlocked: true, targetValue: 1 },
                  { id: '2', name: 'Sacred 108', iconName: 'sunny-outline', isUnlocked: true, targetValue: 108 },
                  { id: '3', name: '7-Day Devotion', iconName: 'flame-outline', isUnlocked: true, targetValue: 7 },
                  { id: '4', name: 'Grand 1,008', iconName: 'ribbon-outline', isUnlocked: false, targetValue: 1008 },
                ]
            ).map((ach) => (
              <View
                key={ach.id}
                style={[
                  styles.badgeCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: ach.isUnlocked ? Colors.accentGold : theme.border,
                    opacity: ach.isUnlocked ? 1 : 0.6,
                  },
                ]}
              >
                <Ionicons
                  name={(ach.iconName as any) || 'trophy-outline'}
                  size={26}
                  color={ach.isUnlocked ? Colors.primary : theme.textMuted}
                />
                <Text style={[styles.badgeName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {ach.name}
                </Text>
                <Text style={styles.badgeStatus}>
                  {ach.isUnlocked ? 'Unlocked 🌟' : `Target: ${ach.targetValue}`}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Controls (Section 16 Requirements) */}
        <View style={[styles.settingsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.settingsHeader, { color: theme.textPrimary }]}>
            Privacy & Isolation Controls
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                Private Profile
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Only mutual friends can view your spiritual activity
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={(v) => handleUpdatePrivacy('isPrivate', v)}
              trackColor={{ true: Colors.primary, false: '#E0E0E0' }}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                Show Counted Mala
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Display your total counted Mala on public profile
              </Text>
            </View>
            <Switch
              value={showMalaCount}
              onValueChange={(v) => handleUpdatePrivacy('showMalaCount', v)}
              trackColor={{ true: Colors.primary, false: '#E0E0E0' }}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                Show Wallet Balance
              </Text>
              <Text style={[styles.settingSub, { color: theme.textSecondary }]}>
                Private by default (keep off for banking security)
              </Text>
            </View>
            <Switch
              value={showWalletBalance}
              onValueChange={(v) => handleUpdatePrivacy('showWalletBalance', v)}
              trackColor={{ true: Colors.primary, false: '#E0E0E0' }}
            />
          </View>
        </View>

        {/* Language Selection */}
        <View style={[styles.settingsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.settingsHeader, { color: theme.textPrimary }]}>
            Language / भाषा / ભાષા
          </Text>
          <View style={styles.langPickerRow}>
            {(
              [
                { key: 'en', label: 'English' },
                { key: 'hi', label: 'हिन्दी' },
                { key: 'gu', label: 'ગુજરાતી' },
              ] as const
            ).map((l) => (
              <TouchableOpacity
                key={l.key}
                onPress={() => setLanguage(l.key)}
                style={[
                  styles.langOption,
                  language === l.key
                    ? { backgroundColor: Colors.primary, borderColor: Colors.primary }
                    : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    { color: language === l.key ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color="#C62828" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '800',
  },
  username: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bio: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 14,
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#EBE5DC',
  },
  subBanner: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subDesc: {
    fontSize: 11,
    color: '#FFE0B2',
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  badgeStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.accentGoldDark,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  settingsHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 11,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#EBE5DC',
    marginVertical: 6,
  },
  langPickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  langOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#FFEBEE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginTop: 8,
  },
  logoutText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '700',
  },
});

