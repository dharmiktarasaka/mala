import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { TransactionSummary } from '../types';
import { useThemeStore } from '../store/themeStore';

interface TransactionItemProps {
  item: TransactionSummary;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ item, onPress }) => {
  const { mode } = useThemeStore();
  const theme = Colors[mode];

  const isReceived = item.direction === 'RECEIVED';
  const iconColor = isReceived ? Colors.success : Colors.error;
  const amountPrefix = isReceived ? '+' : '-';
  const amountColor = isReceived ? Colors.success : theme.textPrimary;

  const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: isReceived ? '#E8F5E9' : '#FFEBEE' }]}>
        <Ionicons
          name={isReceived ? 'arrow-down-outline' : 'arrow-up-outline'}
          size={20}
          color={iconColor}
        />
      </View>

      <View style={styles.centerInfo}>
        <Text style={[styles.nameText, { color: theme.textPrimary }]} numberOfLines={1}>
          {isReceived
            ? `From @${item.counterparty?.username || 'Devotee'}`
            : `To @${item.counterparty?.username || 'Devotee'}`}
        </Text>
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>{dateStr}</Text>
        {item.note && (
          <Text style={[styles.noteText, { color: Colors.accentGoldDark }]} numberOfLines={1}>
            "{item.note}"
          </Text>
        )}
      </View>

      <View style={styles.rightInfo}>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {amountPrefix}{item.amount} Mala
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 4,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
    marginTop: 2,
  },
  noteText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.success,
    textTransform: 'uppercase',
  },
});

