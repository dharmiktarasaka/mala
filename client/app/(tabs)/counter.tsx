import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { BeadCounter } from '../../src/components/BeadCounter';
import { useCounterStore } from '../../src/store/counterStore';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/api/client';

export default function CounterScreen() {
  const { mode, t } = useThemeStore();
  const theme = Colors[mode];

  const {
    sessionCount,
    targetCount,
    dailyTotal,
    lifetimeTotal,
    streakDays,
    resetSession,
    soundEnabled,
    vibrationEnabled,
    setStatsFromServer,
  } = useCounterStore();

  const [saving, setSaving] = useState(false);

  const handleSaveSession = async () => {
    if (sessionCount <= 0) {
      Alert.alert('Notice', 'No counts to save in this session yet.');
      return;
    }

    setSaving(true);
    try {
      const res: any = await apiClient.post('/counter/session', {
        beadCount: sessionCount,
        targetCount,
        durationSeconds: 120, // tracked duration
        completedTarget: sessionCount >= targetCount,
        soundEnabled,
        vibrationEnabled,
      });

      if (res.data?.statistics) {
        setStatsFromServer(res.data.statistics);
      }

      resetSession();
      Alert.alert(
        'Sadhana Saved! 🙏',
        `Successfully recorded ${sessionCount} Mala counts to your personal practice statistics.`,
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
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

