import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { TransferReceipt } from '../../src/types';

export default function SendMalaScreen() {
  const { user, updateWalletBalance } = useAuthStore();
  const { mode, t } = useThemeStore();
  const theme = Colors[mode];

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('10');
  const [note, setNote] = useState('Sacred Sadhana Blessing 🙏');
  const [loading, setLoading] = useState(false);

  // Verification & Confirmation state
  const [previewData, setPreviewData] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [receipt, setReceipt] = useState<TransferReceipt | null>(null);

  const quickAmounts = [5, 10, 21, 51, 108];

  const handleVerifyRecipient = async () => {
    const parsedAmount = parseInt(amount, 10);
    if (!recipient.trim()) {
      Alert.alert('Required', 'Please enter recipient username or User ID');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid whole number of Mala');
      return;
    }

    setLoading(true);
    try {
      const res: any = await apiClient.post('/wallet/verify-recipient', {
        identifier: recipient.trim(),
        amount: parsedAmount,
      });

      if (!res.data.canAfford) {
        Alert.alert(
          'Insufficient Balance',
          `You have ${res.data.currentBalance} Mala, but tried to send ${parsedAmount} Mala.`,
        );
        return;
      }

      setPreviewData(res.data);
      setShowConfirmModal(true);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTransfer = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      // Idempotency key to guarantee banking safety and prevent accidental double-submits
      const idempotencyKey = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const res: any = await apiClient.post('/wallet/transfer', {
        recipientIdentifier: recipient.trim(),
        amount: parseInt(amount, 10),
        note: note.trim() || undefined,
        idempotencyKey,
      });

      const receiptData: TransferReceipt = res.data;
      setReceipt(receiptData);

      // Update local wallet balance state
      updateWalletBalance(receiptData.sender.remainingBalance);
    } catch (err: any) {
      Alert.alert('Transfer Error', err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Send Mala Offering" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Available Balance Reminder */}
        <View style={[styles.balanceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>
            Your Transferable Mala Balance
          </Text>
          <Text style={[styles.balanceAmount, { color: Colors.primary }]}>
            {user?.walletBalance ?? 100} <Text style={{ fontSize: 14 }}>Mala</Text>
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
              Recipient Devotee (Username or ID) *
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Enter devotee username or ID"
                placeholderTextColor={theme.textMuted}
                value={recipient}
                onChangeText={setRecipient}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
              Number of Mala to Transfer *
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.malaSymbol}>🕉️</Text>
              <TextInput
                style={[styles.input, { color: theme.textPrimary, fontWeight: '700' }]}
                keyboardType="number-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Quick Amount Selector Chips */}
            <View style={styles.chipsRow}>
              {quickAmounts.map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => setAmount(String(q))}
                  style={[
                    styles.amountChip,
                    amount === String(q)
                      ? { backgroundColor: Colors.primary }
                      : { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: amount === String(q) ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {q} Mala
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>
              Spiritual Note / Blessing (Optional)
            </Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="sparkles-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Add a spiritual note or blessing (optional)"
                placeholderTextColor={theme.textMuted}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleVerifyRecipient}
            disabled={loading}
            style={[styles.verifyBtn, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.verifyBtnText}>Verify & Review Transfer</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirmation Dialog (Section 6 Requirement) */}
      <Modal visible={showConfirmModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Confirm Mala Transfer
            </Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Please verify recipient and remaining balance details
            </Text>

            {previewData && (
              <View style={[styles.previewCard, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                <View style={styles.recipientRow}>
                  <View style={styles.recipientAvatar}>
                    <Text style={styles.recipientAvatarText}>
                      {previewData.recipient.displayName?.[0]?.toUpperCase() || '🕉️'}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.recipientName, { color: theme.textPrimary }]}>
                      {previewData.recipient.displayName}
                    </Text>
                    <Text style={[styles.recipientUsername, { color: Colors.primary }]}>
                      @{previewData.recipient.username}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.previewDetailRow}>
                  <Text style={[styles.previewDetailLabel, { color: theme.textSecondary }]}>
                    Transfer Amount:
                  </Text>
                  <Text style={[styles.previewDetailVal, { color: Colors.primary }]}>
                    {previewData.transferAmount} Mala
                  </Text>
                </View>

                <View style={styles.previewDetailRow}>
                  <Text style={[styles.previewDetailLabel, { color: theme.textSecondary }]}>
                    Current Balance:
                  </Text>
                  <Text style={[styles.previewDetailVal, { color: theme.textPrimary }]}>
                    {previewData.currentBalance} Mala
                  </Text>
                </View>

                <View style={styles.previewDetailRow}>
                  <Text style={[styles.previewDetailLabel, { color: theme.textSecondary }]}>
                    Balance After Transfer:
                  </Text>
                  <Text style={[styles.previewDetailVal, { color: Colors.accentGoldDark }]}>
                    {previewData.remainingBalance} Mala
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowConfirmModal(false)}
                style={[styles.modalBtn, styles.cancelBtn]}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleExecuteTransfer}
                style={[styles.modalBtn, styles.confirmBtn]}
              >
                <Text style={styles.confirmBtnText}>Confirm Transfer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Transaction Receipt Dialog */}
      <Modal visible={!!receipt} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.successIconBadge}>
              <Ionicons name="checkmark-done" size={36} color="#FFFFFF" />
            </View>

            <Text style={[styles.modalTitle, { color: theme.textPrimary, textAlign: 'center', marginTop: 12 }]}>
              {t('transferSuccess')}
            </Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary, textAlign: 'center' }]}>
              Double-entry ledger transaction completed atomically.
            </Text>

            {receipt && (
              <View style={[styles.receiptBox, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptKey}>Transaction ID:</Text>
                  <Text style={styles.receiptValue} numberOfLines={1}>{receipt.receiptId}</Text>
                </View>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptKey}>Amount Sent:</Text>
                  <Text style={[styles.receiptValue, { color: Colors.success, fontWeight: '800' }]}>
                    {receipt.amount} Mala
                  </Text>
                </View>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptKey}>Recipient:</Text>
                  <Text style={styles.receiptValue}>@{receipt.recipient.username}</Text>
                </View>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptKey}>Your New Balance:</Text>
                  <Text style={[styles.receiptValue, { color: Colors.primary, fontWeight: '800' }]}>
                    {receipt.sender.remainingBalance} Mala
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                setReceipt(null);
                router.replace('/(tabs)/wallet');
              }}
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnText}>View in Wallet</Text>
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
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
  },
  balanceCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  malaSymbol: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          outline: 'none',
          boxShadow: 'none',
        } as any)
      : {}),
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  amountChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    gap: 8,
    marginTop: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recipientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accentGold,
  },
  recipientAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '700',
  },
  recipientUsername: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EBE5DC',
    marginVertical: 12,
  },
  previewDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  previewDetailLabel: {
    fontSize: 13,
  },
  previewDetailVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    color: '#374151',
    fontWeight: '700',
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.success,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginVertical: 14,
    gap: 8,
  },
  receiptLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptKey: {
    fontSize: 12,
    color: '#6B7280',
  },
  receiptValue: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '60%',
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

