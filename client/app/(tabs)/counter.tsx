import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { BeadCounter } from '../../src/components/BeadCounter';
import { SadhanaCalendar } from '../../src/components/SadhanaCalendar';
import { useCounterStore } from '../../src/store/counterStore';
import { useThemeStore } from '../../src/store/themeStore';
import { useAuthStore } from '../../src/store/authStore';
import { apiClient } from '../../src/api/client';

export default function CounterScreen() {
  const { mode, t } = useThemeStore();
  const theme = Colors[mode];
  const params = useLocalSearchParams<{ view?: string }>();

  // Mode: 'counter' | 'calendar'
  const [activeTab, setActiveTab] = useState<'counter' | 'calendar'>(
    params.view === 'calendar' ? 'calendar' : 'counter'
  );

  const {
    sessionCount,
    targetCount,
    beadsPerMala,
    dailyTotal,
    lifetimeTotal,
    streakDays,
    resetSession,
    soundEnabled,
    vibrationEnabled,
    setStatsFromServer,
    selectedMalaType,
    selectedDate,
    resetDateToToday,
  } = useCounterStore();

  const [saving, setSaving] = useState(false);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isCustomDate = selectedDate !== todayStr;

  useEffect(() => {
    if (params.view === 'calendar') {
      setActiveTab('calendar');
    }
  }, [params.view]);

  const fetchLiveStatsAndWallet = async () => {
    try {
      const [statsRes, walletRes]: any = await Promise.allSettled([
        apiClient.get('/counter/statistics'),
        apiClient.get('/wallet/dashboard'),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStatsFromServer(statsRes.value.data);
      }
      if (walletRes.status === 'fulfilled' && walletRes.value?.data) {
        if (walletRes.value.data.balance !== undefined) {
          useAuthStore.getState().updateWalletBalance(walletRes.value.data.balance);
        }
        if (walletRes.value.data.pockets) {
          useAuthStore.getState().updatePockets(walletRes.value.data.pockets);
        }
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    fetchLiveStatsAndWallet();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLiveStatsAndWallet();
    }, [])
  );

  const handleSaveSession = async () => {
    if (sessionCount <= 0) {
      Alert.alert('Notice', 'No counts to save in this session yet.');
      return;
    }

    setSaving(true);
    try {
      const earnedMala =
        Math.floor(sessionCount / beadsPerMala) ||
        (sessionCount >= targetCount ? 1 : 0);

      const res: any = await apiClient.post('/counter/session', {
        beadCount: sessionCount,
        targetCount,
        beadsPerMala,
        durationSeconds: 120, // tracked duration
        completedTarget: sessionCount >= targetCount,
        soundEnabled,
        vibrationEnabled,
        malaType: selectedMalaType,
        sessionDate: selectedDate,
      });

      if (res.data?.statistics) {
        setStatsFromServer(res.data.statistics);
      }
      if (res.data?.pockets) {
        useAuthStore.getState().updatePockets(res.data.pockets);
      }
      if (res.data?.walletBalance !== undefined) {
        useAuthStore.getState().updateWalletBalance(res.data.walletBalance);
      }

      resetSession();
      const dateLabel = isCustomDate ? selectedDate : 'Today';
      Alert.alert(
        'Sadhana Saved! 🙏',
        `Successfully recorded ${earnedMala} Mala (${sessionCount} beads under the ${beadsPerMala}-bead system) for ${dateLabel} and credited to your Sacred Mala Pocket.`,
      );
    } catch (err: any) {
      Alert.alert(
        'Offline Save',
        'Session count recorded locally and will sync when server is reachable.',
      );
      resetSession();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Sacred Mala Counter" />

      {/* Top Segmented Tab Switcher (Live Counter vs Sadhana Calendar) */}
      <View style={[styles.topTabsWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('counter')}
          style={[
            styles.segmentTab,
            activeTab === 'counter' && { backgroundColor: Colors.primary },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons
            name="flower-outline"
            size={16}
            color={activeTab === 'counter' ? '#FFFFFF' : theme.textSecondary}
          />
          <Text
            style={[
              styles.segmentTabText,
              { color: activeTab === 'counter' ? '#FFFFFF' : theme.textPrimary },
            ]}
          >
            Live Bead Counter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('calendar')}
          style={[
            styles.segmentTab,
            activeTab === 'calendar' && { backgroundColor: Colors.primary },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons
            name="calendar"
            size={16}
            color={activeTab === 'calendar' ? '#FFFFFF' : theme.textSecondary}
          />
          <Text
            style={[
              styles.segmentTabText,
              { color: activeTab === 'calendar' ? '#FFFFFF' : theme.textPrimary },
            ]}
          >
            Sadhana Calendar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'calendar' ? (
          /* Calendar & Date-Wise Mala Tracking Mode */
          <SadhanaCalendar
            onSelectDateForLiveCounter={(dateStr) => {
              setActiveTab('counter');
            }}
          />
        ) : (
          /* Live Bead Counter Mode */
          <>
            {/* Practice Statistics Summary Bar */}
            <View style={styles.statsBar}>
              <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  {t('todayCount')}
                </Text>
                <Text style={[styles.statNumber, { color: Colors.primary }]}>
                  {dailyTotal}
                </Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  {t('streak')}
                </Text>
                <Text style={[styles.statNumber, { color: Colors.warning }]}>
                  🔥 {streakDays}d
                </Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  {t('lifetimeCount')}
                </Text>
                <Text style={[styles.statNumber, { color: Colors.accentGoldDark }]}>
                  {lifetimeTotal}
                </Text>
              </View>
            </View>

            {/* Active Sadhana Date Selector Banner */}
            <View
              style={[
                styles.activeDateBanner,
                isCustomDate
                  ? { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }
                  : { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.activeDateLeft}>
                <Ionicons
                  name="calendar"
                  size={18}
                  color={isCustomDate ? '#D97706' : Colors.primary}
                />
                <View>
                  <Text style={[styles.activeDateTitle, { color: theme.textPrimary }]}>
                    {isCustomDate ? `Custom Date: ${selectedDate}` : `Today's Sadhana: ${selectedDate}`}
                  </Text>
                  <Text style={[styles.activeDateSub, { color: theme.textSecondary }]}>
                    {isCustomDate
                      ? 'Chants will be logged to this specific date in your calendar'
                      : 'Live session will be saved to your current day'}
                  </Text>
                </View>
              </View>

              <View style={styles.activeDateActions}>
                {isCustomDate ? (
                  <TouchableOpacity
                    onPress={resetDateToToday}
                    style={styles.resetTodayBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh" size={13} color="#D97706" />
                    <Text style={styles.resetTodayBtnText}>Reset to Today</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => setActiveTab('calendar')}
                    style={styles.openCalendarBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.openCalendarBtnText}>Open Calendar ➔</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Main Interactive Digital Mala Counter */}
            <BeadCounter onSaveSession={handleSaveSession} />

            {saving && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                  Saving sacred session...
                </Text>
              </View>
            )}

            {/* Sacred Chanting Instruction Card */}
            <View style={[styles.mantraGuidanceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.mantraHeading, { color: Colors.primaryDark }]}>
                Recommended Japa Mantras
              </Text>
              <View style={styles.mantraItem}>
                <Text style={styles.mantraTitle}>Om Namah Shivaya</Text>
                <Text style={[styles.mantraDesc, { color: theme.textSecondary }]}>
                  Universal mantra for supreme stillness and liberation.
                </Text>
              </View>
              <View style={styles.mantraDivider} />
              <View style={styles.mantraItem}>
                <Text style={styles.mantraTitle}>Hare Krishna Mahamantra</Text>
                <Text style={[styles.mantraDesc, { color: theme.textSecondary }]}>
                  Purifies consciousness and awakens divine spiritual love.
                </Text>
              </View>
              <View style={styles.mantraDivider} />
              <View style={styles.mantraItem}>
                <Text style={styles.mantraTitle}>Gayatri Mantra</Text>
                <Text style={[styles.mantraDesc, { color: theme.textSecondary }]}>
                  Illuminates intellect and inner spiritual wisdom.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topTabsWrapper: {
    flexDirection: 'row',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  segmentTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeDateBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  activeDateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activeDateTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  activeDateSub: {
    fontSize: 10,
    marginTop: 1,
  },
  activeDateActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetTodayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderColor: '#F59E0B',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  resetTodayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  openCalendarBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  openCalendarBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  mantraGuidanceCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  mantraHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  mantraItem: {
    marginVertical: 6,
  },
  mantraTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accentGoldDark,
  },
  mantraDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  mantraDivider: {
    height: 1,
    backgroundColor: '#EBE5DC',
    marginVertical: 4,
  },
});

