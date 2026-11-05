import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../theme/colors';
import { useThemeStore } from '../store/themeStore';

interface WalletCardProps {
  balance: number;
  totalReceived?: number;
  totalSent?: number;
  username?: string;
  onReceivePress?: () => void;
}

export const WalletBalanceCard: React.FC<WalletCardProps> = ({
  balance,
  totalReceived = 0,
  totalSent = 0,
  username,
  onReceivePress,
}) => {
  const { t } = useThemeStore();

  return (
    <View style={styles.cardContainer}>
      {/* Decorative Gold Header Bar */}
      <View style={styles.topRow}>
        <View style={styles.chipRow}>
          <View style={styles.simChip} />
          <Text style={styles.bankTag}>MALA SPIRITUAL WALLET</Text>
        </View>
        <Ionicons name="shield-checkmark" size={20} color={Colors.accentGold} />
      </View>

      {/* Main Balance Display */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>{t('availableBalance')}</Text>
        <View style={styles.balanceAmountRow}>
          <Text style={styles.malaSymbol}>🕉️</Text>
          <Text style={styles.balanceNumber}>{balance.toLocaleString()}</Text>
          <Text style={styles.malaUnit}>MALA</Text>
        </View>
        {username && <Text style={styles.devoteeTag}>Devotee: @{username}</Text>}
      </View>

      {/* Received & Sent Sub-stats */}
      <View style={styles.subStatsRow}>
        <View style={styles.subStatItem}>
          <Ionicons name="arrow-down-circle" size={16} color={Colors.successLight} />
          <Text style={styles.subStatLabel}>Recv: +{totalReceived}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.subStatItem}>
          <Ionicons name="arrow-up-circle" size={16} color="#FFCDD2" />
          <Text style={styles.subStatLabel}>Sent: -{totalSent}</Text>
        </View>
      </View>

      {/* Banking-style Action Shortcuts */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => router.push('/transfer/send' as any)}
          style={[styles.actionBtn, styles.sendBtn]}
        >
          <Ionicons name="send" size={16} color="#FFFFFF" />
          <Text style={styles.actionBtnText}>{t('sendMala')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onReceivePress || (() => router.push('/(tabs)/wallet' as any))}
          style={[styles.actionBtn, styles.receiveBtn]}
        >
          <Ionicons name="qr-code" size={16} color={Colors.primaryDark} />
          <Text style={[styles.actionBtnText, { color: Colors.primaryDark }]}>
            {t('receiveMala')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1E232A',
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.accentGold,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simChip: {
    width: 28,
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.accentGold,
  },
  bankTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentGold,
    letterSpacing: 1,
  },
  balanceSection: {
    marginVertical: 6,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  malaSymbol: {
    fontSize: 24,
  },
  balanceNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  malaUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accentGold,
    alignSelf: 'flex-end',
    marginBottom: 6,
  },
  devoteeTag: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A303C',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 12,
    justifyContent: 'space-around',
  },
  subStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subStatLabel: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#4B5563',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
  },
  receiveBtn: {
    backgroundColor: '#FFFFFF',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

