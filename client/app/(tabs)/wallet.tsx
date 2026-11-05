import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  RefreshControl,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { WalletBalanceCard } from '../../src/components/WalletBalanceCard';
import { TransactionItem } from '../../src/components/TransactionItem';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { TransactionSummary, WalletDashboard } from '../../src/types';

export default function WalletScreen() {
  const { user } = useAuthStore();
  const { mode, t } = useThemeStore();
  const theme = Colors[mode];

  const [wallet, setWallet] = useState<WalletDashboard | null>(null);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const fetchWalletAndTransactions = async () => {
    try {
      const [walletRes, txRes]: any = await Promise.all([
        apiClient.get('/wallet/dashboard'),
        apiClient.get(`/wallet/transactions?filter=${filter}&limit=30`),
      ]);

      if (walletRes.data) {
        setWallet(walletRes.data);
      }
      if (txRes.data?.items) {
        setTransactions(txRes.data.items);
      }
    } catch {
      // offline / demo fallback
    }
  };

  useEffect(() => {
    fetchWalletAndTransactions();
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletAndTransactions();
    setRefreshing(false);
  };

  const handleShareAccount = async () => {
    try {
      await Share.share({
        message: `🕉️ Send me sacred Mala on the MALA App!\nMy Devotee Username: @${user?.username}\nUser ID: ${user?.id}`,
      });
    } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Mala Wallet" />

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
        {/* Authoritative Ledger Balance Card */}
        <WalletBalanceCard
          balance={wallet?.balance ?? (user?.walletBalance || 0)}
          totalReceived={wallet?.totalReceived}
          totalSent={wallet?.totalSent}
          username={user?.username}
          onReceivePress={() => setShowQrModal(true)}
        />

        {/* Ledger Security Guarantee Banner */}
        <View style={styles.securityBanner}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.accentGoldDark} />
          <Text style={styles.securityBannerText}>
            Protected by Double-Entry Ledger Bookkeeping & Row Concurrency Locks
          </Text>
        </View>

        {/* Filter Tabs Bar (All, Sent, Received) */}
        <View style={styles.filterRow}>
          {(['all', 'sent', 'received'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setFilter(tab)}
                style={[
                  styles.filterTab,
                  isActive
                    ? { backgroundColor: Colors.primary, borderColor: Colors.primary }
                    : { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: isActive ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transaction Ledger Items */}
        <View style={styles.transactionsList}>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                item={tx}
                onPress={() => setSelectedTx(tx)}
              />
            ))
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="receipt-outline" size={36} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No {filter !== 'all' ? filter : ''} transactions recorded in ledger.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Receive QR Code Modal */}
      <Modal visible={showQrModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Receive Mala
              </Text>
              <TouchableOpacity onPress={() => setShowQrModal(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* QR Simulation Box with Saffron Accents */}
            <View style={styles.qrBox}>
              <View style={styles.qrInner}>
                <Ionicons name="qr-code-outline" size={160} color={Colors.primaryDark} />
              </View>
              <Text style={styles.qrUsername}>@{user?.username}</Text>
              <Text style={styles.qrUserId}>ID: {user?.id}</Text>
            </View>

            <Text style={[styles.qrInstructions, { color: theme.textSecondary }]}>
              Scan this code or share your devotee username to receive Mala from friends.
            </Text>

            <TouchableOpacity onPress={handleShareAccount} style={styles.shareBtn}>
              <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share My Devotee ID</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transaction Detail Receipt Modal */}
      <Modal visible={!!selectedTx} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Transaction Receipt
              </Text>
              <TouchableOpacity onPress={() => setSelectedTx(null)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedTx && (
              <View style={styles.receiptBody}>
                <View style={styles.receiptBadgeRow}>
                  <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
                  <Text style={[styles.receiptAmount, { color: Colors.success }]}>
                    {selectedTx.amount} Mala
                  </Text>
                  <Text style={styles.receiptStatusText}>Verified Ledger Transfer</Text>
                </View>

                <View style={[styles.receiptTable, { borderColor: theme.border }]}>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Transaction ID</Text>
                    <Text style={styles.receiptVal} numberOfLines={1}>
                      {selectedTx.id}
                    </Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Counterparty</Text>
                    <Text style={styles.receiptVal}>
                      @{selectedTx.counterparty?.username || 'Devotee'}
                    </Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Direction</Text>
                    <Text style={styles.receiptVal}>{selectedTx.direction}</Text>
                  </View>

                  {selectedTx.note && (
                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>Devotee Note</Text>
                      <Text style={styles.receiptVal}>"{selectedTx.note}"</Text>
                    </View>
                  )}

                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Date & Time</Text>
                    <Text style={styles.receiptVal}>
                      {new Date(selectedTx.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setSelectedTx(null)}
              style={styles.closeReceiptBtn}
            >
              <Text style={styles.closeReceiptText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  securityBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A6D1C',
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  transactionsList: {
    gap: 6,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  qrBox: {
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  qrInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  qrUsername: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  qrUserId: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  qrInstructions: {
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 14,
    lineHeight: 18,
  },
  shareBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  receiptBody: {
    alignItems: 'center',
    marginVertical: 10,
  },
  receiptBadgeRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptAmount: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  receiptStatusText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  receiptTable: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '60%',
  },
  closeReceiptBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeReceiptText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

