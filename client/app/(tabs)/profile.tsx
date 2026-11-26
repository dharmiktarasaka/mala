import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Platform,
  RefreshControl,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { useCounterStore } from '../../src/store/counterStore';
import { apiClient } from '../../src/api/client';
import { AchievementItem } from '../../src/types';
import { MALA_POCKETS } from '../../src/constants/malaTypes';
import WebThreads from '../../src/components/WebThreads';
import { NARAYAN_LOGO_DATA_URI } from '../../src/components/narayanLogoData';

export default function ProfileScreen() {
  const { user, logout, updateWalletBalance } = useAuthStore();
  const { mode, language, setLanguage, toggleTheme, t } = useThemeStore();
  const theme = Colors[mode];

  const { lifetimeTotal, streakDays } = useCounterStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Privacy toggles
  const [isPrivate, setIsPrivate] = useState(false);
  const [showMalaCount, setShowMalaCount] = useState(true);
  const [showWalletBalance, setShowWalletBalance] = useState(false);

  // Avatar and Profile Edit state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showEditBioModal, setShowEditBioModal] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState('');

  const currentAvatarUrl = user?.avatarUrl || profileData?.profile?.avatarUrl;

  const fetchProfileAndAchievements = async () => {
    try {
      const [profRes, achRes]: any = await Promise.all([
        apiClient.get('/users/me'),
        apiClient.get('/achievements'),
      ]);

      if (profRes.data) {
        setProfileData(profRes.data);
        if (profRes.data.wallet?.balance !== undefined) {
          updateWalletBalance(profRes.data.wallet.balance);
        }
        if (profRes.data.wallet?.pockets) {
          useAuthStore.getState().updatePockets(profRes.data.wallet.pockets);
        }
        if (profRes.data.profile?.avatarUrl && !user?.avatarUrl) {
          useAuthStore.getState().updateUser({ avatarUrl: profRes.data.profile.avatarUrl });
        }
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

  useEffect(() => {
    fetchProfileAndAchievements();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfileAndAchievements();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileAndAchievements();
    setRefreshing(false);
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

  const showFeedback = (msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => setStatusFeedback(''), 3500);
  };

  // Save Avatar URL to backend and auth store
  const saveAvatar = async (avatarUrl: string) => {
    setUploadingAvatar(true);
    try {
      await apiClient.put('/users/me/profile', { avatarUrl });
      useAuthStore.getState().updateUser({ avatarUrl });
      setProfileData((prev: any) => ({
        ...prev,
        profile: {
          ...prev?.profile,
          avatarUrl,
        },
      }));
      setShowAvatarModal(false);
      showFeedback(avatarUrl ? 'Sacred profile photo updated!' : 'Custom photo removed.');
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update photo';
      if (Platform.OS === 'web') {
        alert('Could not save avatar: ' + errMsg);
      } else {
        Alert.alert('Error', errMsg);
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Pick custom photo from user's local system/device
  const handlePickAvatar = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) return;

        // Limit size to max 8MB raw
        if (file.size > 8 * 1024 * 1024) {
          alert('Please choose an image under 8MB');
          return;
        }

        setUploadingAvatar(true);
        try {
          const reader = new FileReader();
          reader.onload = (readerEvent: any) => {
            const rawDataUrl = readerEvent.target?.result as string;
            // Optimize and compress using HTML5 canvas to max 320x320 at 0.85 quality
            const img = new (window as any).Image();
            img.onload = async () => {
              try {
                const canvas = document.createElement('canvas');
                const MAX_DIM = 320;
                let w = img.width;
                let h = img.height;
                if (w > h) {
                  if (w > MAX_DIM) {
                    h = Math.round((h * MAX_DIM) / w);
                    w = MAX_DIM;
                  }
                } else {
                  if (h > MAX_DIM) {
                    w = Math.round((w * MAX_DIM) / h);
                    h = MAX_DIM;
                  }
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0, w, h);
                  const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                  await saveAvatar(optimizedDataUrl);
                } else {
                  await saveAvatar(rawDataUrl);
                }
              } catch {
                await saveAvatar(rawDataUrl);
              }
            };
            img.onerror = () => {
              setUploadingAvatar(false);
              alert('Could not load the chosen image file.');
            };
            img.src = rawDataUrl;
          };
          reader.readAsDataURL(file);
        } catch (err: any) {
          setUploadingAvatar(false);
          alert('Error reading image: ' + (err?.message || 'unknown error'));
        }
      };
      input.click();
    } else {
      Alert.alert('Upload Photo', 'Please use a web browser to upload from your local system.');
    }
  };

  const handleSetNarayanPreset = () => {
    saveAvatar(NARAYAN_LOGO_DATA_URI);
  };

  const handleCopyDevoteeId = () => {
    const dId = user?.devoteeId || profileData?.devoteeId || user?.id || '';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('#' + dId);
      setCopiedId(true);
      showFeedback(`Devotee ID #${dId} copied!`);
      setTimeout(() => setCopiedId(false), 2500);
    } else {
      Alert.alert('Devotee ID', `#${dId}`);
    }
  };

  const handleOpenEditBio = () => {
    setEditDisplayName(user?.displayName || profileData?.profile?.displayName || '');
    setEditBio(profileData?.profile?.bio || 'Dedicated practitioner of Mindful Japa Meditation.');
    setShowEditBioModal(true);
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const newName = editDisplayName.trim() || user?.displayName || 'Devotee';
      const newBio = editBio.trim();
      await apiClient.put('/users/me/profile', {
        displayName: newName,
        bio: newBio,
      });
      useAuthStore.getState().updateUser({ displayName: newName });
      setProfileData((prev: any) => ({
        ...prev,
        displayName: newName,
        profile: {
          ...prev?.profile,
          displayName: newName,
          bio: newBio,
        },
      }));
      setShowEditBioModal(false);
      showFeedback('Profile details updated successfully!');
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update profile';
      if (Platform.OS === 'web') {
        alert(errMsg);
      } else {
        Alert.alert('Error', errMsg);
      }
    } finally {
      setSavingBio(false);
    }
  };

  const handleLogout = () => {
    const performLogout = () => {
      logout();
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined'
          ? window.confirm('Are you sure you wish to exit your sanctuary?')
          : true;
      if (confirmed) {
        performLogout();
      }
      return;
    }

    Alert.alert('Confirm Logout', 'Are you sure you wish to exit your sanctuary?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  };

  const cardBgStyle = {
    backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.88)' : 'rgba(24, 28, 38, 0.86)',
    borderColor: mode === 'light' ? 'rgba(212, 175, 55, 0.35)' : 'rgba(212, 175, 55, 0.25)',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Interactive WebThreads Cosmic Weave Background */}
      <View style={styles.webThreadsBackground} pointerEvents="none">
        <WebThreads
          colors={['#FF7A00', '#5227FF', '#FF9FFC', '#FFA347', '#D4AF37']}
          coreColor="#FFFFFF"
          threadCount={7}
          spread={0.25}
          speed={0.22}
          thickness={1.3}
          glow={0.03}
          brightness={0.7}
          lightMode={mode === 'light'}
          mouseInteraction={true}
          pulseOnClick={true}
        />
      </View>

      <Header title="Devotee Sanctuary" />

      {/* Floating Status Feedback Toast */}
      {statusFeedback !== '' && (
        <View style={styles.feedbackToast}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.feedbackToastText}>{statusFeedback}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Sacred Profile Medallion Card */}
        <View style={[styles.profileCard, cardBgStyle]}>
          {/* Radiant Medallion Avatar with Camera Button */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowAvatarModal(true)}
              style={[
                styles.avatarLarge,
                {
                  backgroundColor: mode === 'light' ? '#FFF9F2' : '#2A2016',
                  borderColor: Colors.accentGold,
                },
              ]}
            >
              {currentAvatarUrl ? (
                <Image
                  source={{ uri: currentAvatarUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarLargeText}>
                  {user?.displayName?.[0]?.toUpperCase() || '🕉️'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.avatarCameraBadge}
              onPress={() => setShowAvatarModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Action Pill: Set/Change Profile Photo */}
          <TouchableOpacity
            style={styles.setPhotoPill}
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="cloud-upload-outline" size={14} color={Colors.primary} />
            <Text style={styles.setPhotoPillText}>
              {currentAvatarUrl ? 'Change Profile Photo' : 'Set Custom Profile Photo'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.displayName, { color: theme.textPrimary }]}>
            {user?.displayName || profileData?.displayName || user?.email?.split('@')[0] || 'Devotee'}
          </Text>

          <Text style={[styles.username, { color: Colors.primary }]}>
            @{user?.username}
          </Text>

          {/* Devotee ID Copyable Badge & Spiritual Title */}
          <View style={styles.badgesRow}>
            <TouchableOpacity
              style={styles.devoteeIdBadge}
              onPress={handleCopyDevoteeId}
              activeOpacity={0.7}
            >
              <Ionicons name="card-outline" size={13} color={Colors.accentGoldDark} />
              <Text style={styles.devoteeIdBadgeText}>
                Devotee ID: #{user?.devoteeId || profileData?.devoteeId || user?.id}
              </Text>
              <Ionicons
                name={copiedId ? 'checkmark-circle' : 'copy-outline'}
                size={12}
                color={copiedId ? Colors.success : Colors.accentGoldDark}
              />
            </TouchableOpacity>

            <View style={styles.practitionerBadge}>
              <Text style={styles.practitionerBadgeText}>✦ Dedicated Sadhaka ✦</Text>
            </View>
          </View>

          <Text style={[styles.bio, { color: theme.textSecondary }]}>
            {profileData?.profile?.bio || 'Dedicated practitioner of Mindful Japa Meditation.'}
          </Text>

          <TouchableOpacity
            style={[styles.editBioBtn, { borderColor: theme.border }]}
            onPress={handleOpenEditBio}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={14} color={Colors.primary} />
            <Text style={[styles.editBioBtnText, { color: Colors.primary }]}>
              Edit Sanctuary Details
            </Text>
          </TouchableOpacity>

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
                {profileData?.friendsCount ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Devotee Sangha
              </Text>
            </View>
          </View>
        </View>

        {/* Sacred Mala Offerings & Balance Card */}
        <View style={[styles.walletCard, cardBgStyle]}>
          <View style={styles.walletHeader}>
            <View style={styles.walletHeaderLeft}>
              <View style={styles.walletIconCircle}>
                <Ionicons name="sparkles" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={[styles.walletCardTitle, { color: theme.textPrimary }]}>
                  Sacred Mala Offerings
                </Text>
                <Text style={[styles.walletCardSub, { color: theme.textSecondary }]}>
                  Transferable Devotion & Blessings
                </Text>
              </View>
            </View>

            <View style={styles.balancePill}>
              <Text style={styles.balancePillNumber}>
                {profileData?.wallet?.balance ?? user?.walletBalance ?? 0}
              </Text>
              <Text style={styles.balancePillUnit}>Mala</Text>
            </View>
          </View>

          {/* Offerings Stats Grid: Received vs Offered */}
          <View style={[styles.walletStatsRow, { borderColor: theme.border }]}>
            <View style={styles.walletStatItem}>
              <View style={styles.walletStatHeader}>
                <Ionicons name="arrow-down-circle" size={16} color="#10B981" />
                <Text style={[styles.walletStatLabel, { color: theme.textSecondary }]}>
                  Received
                </Text>
              </View>
              <Text style={[styles.walletStatVal, { color: '#10B981' }]}>
                {profileData?.wallet?.totalReceived ?? 0} Mala
              </Text>
            </View>

            <View style={styles.walletStatDivider} />

            <View style={styles.walletStatItem}>
              <View style={styles.walletStatHeader}>
                <Ionicons name="arrow-up-circle" size={16} color={Colors.primary} />
                <Text style={[styles.walletStatLabel, { color: theme.textSecondary }]}>
                  Offered
                </Text>
              </View>
              <Text style={[styles.walletStatVal, { color: Colors.primary }]}>
                {profileData?.wallet?.totalSent ?? 0} Mala
              </Text>
            </View>
          </View>

          {/* 6 Mala Pockets Breakdown Mini Grid */}
          <View style={styles.pocketsMiniGrid}>
            {MALA_POCKETS.map((pkt) => {
              const count = (profileData?.wallet?.pockets || (user?.pockets as any))?.[pkt.id] ?? 0;
              return (
                <View
                  key={pkt.id}
                  style={[
                    styles.pocketMiniPill,
                    { backgroundColor: pkt.bgLight, borderColor: pkt.borderColor },
                  ]}
                >
                  <Text style={{ fontSize: 13 }}>{pkt.symbol}</Text>
                  <View style={{ flex: 1, marginHorizontal: 4 }}>
                    <Text style={[styles.pocketMiniName, { color: pkt.color }]} numberOfLines={1}>
                      {pkt.title}
                    </Text>
                  </View>
                  <Text style={[styles.pocketMiniCount, { color: pkt.color }]}>
                    {count}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Action Buttons: Send Mala & Full Wallet */}
          <View style={styles.walletActionsRow}>
            <TouchableOpacity
              style={styles.sendMalaButton}
              onPress={() => router.push('/transfer/send' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="gift-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.sendMalaButtonText}>Send Mala Offering</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewWalletButton, { borderColor: Colors.primary }]}
              onPress={() => router.push('/(tabs)/wallet' as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="wallet-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.viewWalletButtonText, { color: Colors.primary }]}>
                Wallet & Ledger
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Tier Banner */}
        <TouchableOpacity
          onPress={() => router.push('/subscription/index' as any)}
          style={styles.subBanner}
          activeOpacity={0.88}
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
                    backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(28, 32, 42, 0.9)',
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

        {/* Privacy Controls */}
        <View style={[styles.settingsCard, cardBgStyle]}>
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
        <View style={[styles.settingsCard, cardBgStyle]}>
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
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#C62828" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E232E',
                borderColor: Colors.accentGold,
              },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="camera-outline" size={22} color={Colors.primary} />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Devotee Profile Photo
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAvatarModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Personalize your sanctuary presence with a photo from your local system or sacred presets.
            </Text>

            {/* Current Avatar Preview */}
            <View style={styles.previewAvatarBox}>
              <View
                style={[
                  styles.avatarLarge,
                  {
                    backgroundColor: mode === 'light' ? '#FFF9F2' : '#2A2016',
                    borderColor: Colors.accentGold,
                    marginBottom: 0,
                  },
                ]}
              >
                {currentAvatarUrl ? (
                  <Image
                    source={{ uri: currentAvatarUrl }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.avatarLargeText}>
                    {user?.displayName?.[0]?.toUpperCase() || '🕉️'}
                  </Text>
                )}
              </View>
            </View>

            {uploadingAvatar ? (
              <View style={styles.modalLoadingBox}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={[styles.modalLoadingText, { color: theme.textPrimary }]}>
                  Optimizing and saving your profile photo...
                </Text>
              </View>
            ) : (
              <View style={styles.modalActionsList}>
                {/* 1. Upload from local system / device */}
                <TouchableOpacity
                  style={styles.modalActionPrimary}
                  onPress={handlePickAvatar}
                  activeOpacity={0.85}
                >
                  <Ionicons name="laptop-outline" size={20} color="#FFFFFF" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalActionPrimaryText}>
                      Upload from My System / Device
                    </Text>
                    <Text style={styles.modalActionPrimarySub}>
                      Select JPG, PNG or WEBP file from your computer
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                </TouchableOpacity>

                {/* 2. Set The Narayan Presence Lotus Preset */}
                <TouchableOpacity
                  style={[
                    styles.modalActionSecondary,
                    {
                      backgroundColor: mode === 'light' ? '#FFF7ED' : '#2A241A',
                      borderColor: '#FED7AA',
                    },
                  ]}
                  onPress={handleSetNarayanPreset}
                  activeOpacity={0.85}
                >
                  <Ionicons name="flower-outline" size={20} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalActionSecondaryText, { color: Colors.primaryDark }]}>
                      Use Narayan Lotus Emblem
                    </Text>
                    <Text style={[styles.modalActionSecondarySub, { color: theme.textSecondary }]}>
                      Sacred brand emblem with golden aura
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                </TouchableOpacity>

                {/* 3. Remove custom photo and reset to initials */}
                {currentAvatarUrl ? (
                  <TouchableOpacity
                    style={styles.modalActionRemove}
                    onPress={() => saveAvatar('')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="trash-outline" size={18} color="#C62828" />
                    <Text style={styles.modalActionRemoveText}>
                      Remove Custom Photo (Reset to Initials)
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            <TouchableOpacity
              style={[styles.modalCancelBtn, { borderColor: theme.border }]}
              onPress={() => setShowAvatarModal(false)}
            >
              <Text style={[styles.modalCancelBtnText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit Bio & Name Modal */}
      {showEditBioModal && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E232E',
                borderColor: Colors.accentGold,
              },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="create-outline" size={22} color={Colors.primary} />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Edit Sanctuary Profile
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEditBioModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                Devotee Display Name
              </Text>
              <TextInput
                value={editDisplayName}
                onChangeText={setEditDisplayName}
                placeholder="Enter your sacred name or handle"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.textInput,
                  {
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceSubtle,
                  },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                Spiritual Bio / Mantra
              </Text>
              <TextInput
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Share your spiritual aspiration, mantra or dedication"
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                style={[
                  styles.textInput,
                  styles.textInputMultiline,
                  {
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceSubtle,
                  },
                ]}
              />
            </View>

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { flex: 1, borderColor: theme.border }]}
                onPress={() => setShowEditBioModal(false)}
                disabled={savingBio}
              >
                <Text style={[styles.modalCancelBtnText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, { flex: 1 }]}
                onPress={handleSaveBio}
                disabled={savingBio}
                activeOpacity={0.85}
              >
                {savingBio ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
                    <Text style={styles.modalSaveBtnText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webThreadsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    opacity: 0.88,
  },
  feedbackToast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    zIndex: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  feedbackToastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    zIndex: 1,
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Colors.accentGold,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  avatarLargeText: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  setPhotoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },
  setPhotoPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  devoteeIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF8F0',
    borderColor: '#FED7AA',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  devoteeIdBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9A3412',
  },
  practitionerBadge: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  practitionerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.4,
  },
  bio: {
    fontSize: 13.5,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  editBioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  editBioBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 16,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EBE5DC',
  },
  subBanner: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
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
    marginBottom: 18,
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
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
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
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginTop: 8,
  },
  logoutText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '700',
  },
  walletCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  walletHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  walletCardSub: {
    fontSize: 11,
    marginTop: 1,
  },
  balancePill: {
    alignItems: 'flex-end',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  balancePillNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  balancePillUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9A3412',
    textTransform: 'uppercase',
  },
  walletStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginBottom: 14,
  },
  walletStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  walletStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  walletStatLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  walletStatVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  walletStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#EBE5DC',
  },
  pocketsMiniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pocketMiniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  pocketMiniName: {
    fontSize: 11,
    fontWeight: '700',
  },
  pocketMiniCount: {
    fontSize: 12,
    fontWeight: '800',
  },
  walletActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sendMalaButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  sendMalaButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  viewWalletButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
  },
  viewWalletButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Modals Styling
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSub: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 16,
  },
  previewAvatarBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalLoadingBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  modalLoadingText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalActionsList: {
    gap: 10,
    marginBottom: 16,
  },
  modalActionPrimary: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  modalActionPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalActionPrimarySub: {
    color: '#FFE0B2',
    fontSize: 11,
    marginTop: 2,
  },
  modalActionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalActionSecondaryText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  modalActionSecondarySub: {
    fontSize: 11,
    marginTop: 2,
  },
  modalActionRemove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  modalActionRemoveText: {
    color: '#C62828',
    fontSize: 12.5,
    fontWeight: '700',
  },
  modalCancelBtn: {
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textInputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalButtonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalSaveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
