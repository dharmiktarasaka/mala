import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { WalletBalanceCard } from '../../src/components/WalletBalanceCard';
import { TransactionItem } from '../../src/components/TransactionItem';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { useCounterStore } from '../../src/store/counterStore';
import { apiClient } from '../../src/api/client';
import { WalletDashboard } from '../../src/types';

export default function HomeDashboard() {
  const { user } = useAuthStore();
  const { mode, t } = useThemeStore();
  const theme = Colors[mode];

  const { dailyTotal, targetCount, setStatsFromServer } = useCounterStore();
  const [walletData, setWalletData] = useState<WalletDashboard | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch wallet data
      const walletRes: any = await apiClient.get('/wallet/dashboard');
      if (walletRes.data) {
        setWalletData(walletRes.data);
      }

      // 2. Fetch practice counter statistics
      const statsRes: any = await apiClient.get('/counter/statistics');
      if (statsRes.data) {
        setStatsFromServer(statsRes.data);
      }
    } catch {
      // If server is starting up or in offline demo mode, keep local state
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const progressPercent = Math.min(100, Math.round((dailyTotal / targetCount) * 100));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header />

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
        {/* Top Devotee Greeting */}
        <View style={styles.greetingSection}>
          <View>
            <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>
              Namaste 🙏
            </Text>
            <Text style={[styles.greetingName, { color: theme.textPrimary }]}>
              {user?.displayName || 'Devotee Seeker'}
            </Text>
          </View>

          {/* Quick Counter Shortcut Badge */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/counter')}
            style={styles.quickCountBadge}
          >
            <Ionicons name="flower" size={16} color="#FFFFFF" />
            <Text style={styles.quickCountText}>Quick Count</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Mala Progress Card */}
        <View
          style={[
            styles.sadhanaCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.sadhanaTop}>
            <View>
              <Text style={[styles.sadhanaLabel, { color: theme.textSecondary }]}>
                {t('todayCount')}
              </Text>
              <Text style={[styles.sadhanaValue, { color: Colors.primary }]}>
                {dailyTotal}{' '}
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  / {targetCount} Mala
                </Text>
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={16} color="#FF7A00" />
              <Text style={styles.streakText}>Active Devotee</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercent}%`, backgroundColor: Colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressHint, { color: theme.textSecondary }]}>
            {progressPercent}% of daily japa target achieved today
          </Text>
        </View>

        {/* Banking-Style Digital Mala Wallet Card */}
        <WalletBalanceCard
          balance={walletData?.balance ?? (user?.walletBalance || 0)}
          totalReceived={walletData?.totalReceived}
          totalSent={walletData?.totalSent}
          username={user?.username}
        />

        {/* Daily Spiritual Thought / Quote */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteHeader}>
            <Ionicons name="sparkles" size={16} color={Colors.accentGold} />
            <Text style={styles.quoteTag}>{t('quotesHeading')}</Text>
          </View>
          <Text style={styles.quoteText}>
            "When the mind is engaged in the sacred repetition of the Divine Name, the heart fills with peace and wisdom."
          </Text>
          <Text style={styles.quoteAuthor}>— Shrimad Bhagavad Gita</Text>
        </View>

        {/* Quick Devotee Shortcuts Row */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            onPress={() => router.push('/friends/index' as any)}
            style={[styles.shortcutItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.shortcutIconBg, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="people-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.shortcutLabel, { color: theme.textPrimary }]}>
              Friends
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/community')}
            style={[styles.shortcutItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.shortcutIconBg, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="newspaper-outline" size={22} color={Colors.success} />
            </View>
            <Text style={[styles.shortcutLabel, { color: theme.textPrimary }]}>
              Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/chat' as any)}
            style={[styles.shortcutItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.shortcutIconBg, { backgroundColor: '#EDE7F6' }]}>
              <Ionicons name="chatbubbles-outline" size={22} color="#7E57C2" />
            </View>
            <Text style={[styles.shortcutLabel, { color: theme.textPrimary }]}>
              Satsang Chat
            </Text>
          </TouchableOpacity>

          {user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? (
            <TouchableOpacity
              onPress={() => router.push('/admin/index' as any)}
              style={[styles.shortcutItem, { backgroundColor: theme.surface, borderColor: Colors.accentGold }]}
            >
              <View style={[styles.shortcutIconBg, { backgroundColor: '#FFF8E1' }]}>
                <Ionicons name="shield-outline" size={22} color={Colors.accentGoldDark} />
              </View>
              <Text style={[styles.shortcutLabel, { color: Colors.accentGoldDark }]}>
                Admin
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/subscription/index' as any)}
              style={[styles.shortcutItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={[styles.shortcutIconBg, { backgroundColor: '#FFF8E1' }]}>
                <Ionicons name="star-outline" size={22} color={Colors.accentGold} />
              </View>
              <Text style={[styles.shortcutLabel, { color: theme.textPrimary }]}>
                Premium
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t('transactionHistory')}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/wallet')}>
            <Text style={styles.seeAllText}>View Ledger</Text>
          </TouchableOpacity>
        </View>

        {walletData?.recentTransactions && walletData.recentTransactions.length > 0 ? (
          walletData.recentTransactions.slice(0, 4).map((tx) => (
            <TransactionItem key={tx.id} item={tx} />
          ))
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="receipt-outline" size={32} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No transfers yet. Share your first Mala offering!
            </Text>
          </View>
        )}
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
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 13,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '800',
  },
  quickCountBadge: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  quickCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sadhanaCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  sadhanaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sadhanaLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sadhanaValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D96200',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 11,
    marginTop: 6,
  },
  quoteCard: {
    backgroundColor: '#FFFBEA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
    marginVertical: 10,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  quoteTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentGoldDark,
    letterSpacing: 0.5,
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    color: '#4B5563',
  },
  quoteAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D1C',
    textAlign: 'right',
    marginTop: 4,
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  shortcutItem: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  shortcutIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  shortcutLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});

