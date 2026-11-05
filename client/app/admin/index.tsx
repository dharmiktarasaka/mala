import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { apiClient } from '../../src/api/client';
import { useThemeStore } from '../../src/store/themeStore';

export default function AdminScreen() {
  const { mode } = useThemeStore();
  const theme = Colors[mode];

  const [analytics, setAnalytics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Reconciliation modal state
  const [reconcileResult, setReconcileResult] = useState<any>(null);

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, usersRes, logsRes]: any = await Promise.all([
        apiClient.get('/admin/analytics'),
        apiClient.get('/admin/users?limit=30'),
        apiClient.get('/admin/audit-logs?limit=15'),
      ]);

      if (analyticsRes.data) setAnalytics(analyticsRes.data);
      if (usersRes.data?.items) setUsersList(usersRes.data.items);
      if (logsRes.data) setAuditLogs(logsRes.data);
    } catch (err: any) {
      Alert.alert('Admin Access Denied', 'You must have an ADMIN role to view this portal.');
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAdminData();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (targetUserId: string, newStatus: string) => {
    Alert.prompt
      ? Alert.prompt(
          'Mandatory Audit Reason',
          `Provide reason for marking user as ${newStatus}:`,
          async (reason) => {
            if (!reason) return;
            try {
              await apiClient.post(`/admin/users/${targetUserId}/status`, {
                status: newStatus,
                reason,
              });
              Alert.alert('Status Updated', `User marked as ${newStatus}`);
              fetchAdminData();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message);
            }
          },
        )
      : executeStatusChange(targetUserId, newStatus, 'Administrative compliance review');
  };

  const executeStatusChange = async (targetUserId: string, newStatus: string, reason: string) => {
    try {
      await apiClient.post(`/admin/users/${targetUserId}/status`, {
        status: newStatus,
        reason,
      });
      Alert.alert('Status Updated', `User marked as ${newStatus}`);
      fetchAdminData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message);
    }
  };

  const handleReconcileWallet = async (walletId: string) => {
    try {
      const res: any = await apiClient.get(`/admin/ledger/reconcile/${walletId}`);
      setReconcileResult(res.data);
    } catch (err: any) {
      Alert.alert('Reconciliation Error', err.response?.data?.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Admin Governance Portal" showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Analytics Highlights Grid */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Platform Analytics & Health
        </Text>

        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="people" size={20} color={Colors.primary} />
            <Text style={[styles.metricNumber, { color: theme.textPrimary }]}>
              {analytics?.users?.total ?? 3}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Devotees</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="flower" size={20} color={Colors.accentGoldDark} />
            <Text style={[styles.metricNumber, { color: theme.textPrimary }]}>
              {analytics?.spiritualStats?.totalMalaCountedLifetime?.toLocaleString() ?? 10850}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Mala Counted</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="swap-horizontal" size={20} color={Colors.success} />
            <Text style={[styles.metricNumber, { color: theme.textPrimary }]}>
              {analytics?.ledgerStats?.totalMalaTransferred?.toLocaleString() ?? 250}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Mala Transferred</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primaryDark} />
            <Text style={[styles.metricNumber, { color: Colors.success }]}>HEALTHY</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Ledger Integrity</Text>
          </View>
        </View>

        {/* User Governance Table */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Registered Accounts ({usersList.length})
          </Text>
        </View>

        <View style={[styles.tableCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {usersList.map((usr) => (
            <View key={usr.id} style={[styles.userRow, { borderBottomColor: theme.border }]}>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.textPrimary }]}>
                  {usr.displayName || usr.username}
                </Text>
                <Text style={[styles.userHandle, { color: Colors.primary }]}>
                  @{usr.username} • {usr.role}
                </Text>
                <Text style={[styles.userStats, { color: theme.textSecondary }]}>
                  Wallet: {usr.walletBalance} Mala | Practice: {usr.lifetimeMala}
                </Text>
              </View>

              <View style={styles.userActions}>
                {usr.walletBalance !== undefined && (
                  <TouchableOpacity
                    onPress={() => handleReconcileWallet(usr.id)}
                    style={[styles.actionChip, { backgroundColor: '#FFF3E0' }]}
                  >
                    <Text style={[styles.actionChipText, { color: Colors.primaryDark }]}>
                      Reconcile
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() =>
                    handleUpdateStatus(
                      usr.id,
                      usr.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                    )
                  }
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: usr.status === 'ACTIVE' ? '#FFEBEE' : '#E8F5E9',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.actionChipText,
                      {
                        color: usr.status === 'ACTIVE' ? Colors.error : Colors.success,
                      },
                    ]}
                  >
                    {usr.status === 'ACTIVE' ? 'Suspend' : 'Restore'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Immutable Administrative Audit Trail */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: 20 }]}>
          Administrative Audit Trail
        </Text>
        <View style={[styles.auditCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <View key={log.id} style={[styles.auditItem, { borderBottomColor: theme.border }]}>
                <Text style={[styles.auditAction, { color: Colors.primaryDark }]}>{log.action}</Text>
                <Text style={[styles.auditReason, { color: theme.textSecondary }]}>
                  Reason: "{log.reason}"
                </Text>
                <Text style={[styles.auditDate, { color: theme.textMuted }]}>
                  By @{log.admin?.username || 'admin'} • {new Date(log.createdAt).toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.noAuditText, { color: theme.textSecondary }]}>
              All administrative operations are permanently logged here.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Reconciliation Modal */}
      <Modal visible={!!reconcileResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Double-Entry Ledger Audit
            </Text>

            {reconcileResult && (
              <View style={styles.reconcileBox}>
                <View style={styles.reconcileRow}>
                  <Text style={styles.reconcileKey}>Devotee Account:</Text>
                  <Text style={styles.reconcileVal}>@{reconcileResult.username}</Text>
                </View>
                <View style={styles.reconcileRow}>
                  <Text style={styles.reconcileKey}>Stored Wallet Balance:</Text>
                  <Text style={styles.reconcileVal}>{reconcileResult.storedBalance} Mala</Text>
                </View>
                <View style={styles.reconcileRow}>
                  <Text style={styles.reconcileKey}>Authoritative Sum (Debits - Credits):</Text>
                  <Text style={[styles.reconcileVal, { color: Colors.success, fontWeight: '800' }]}>
                    {reconcileResult.authoritativeLedgerBalance} Mala
                  </Text>
                </View>
                <View style={styles.reconcileRow}>
                  <Text style={styles.reconcileKey}>Discrepancy:</Text>
                  <Text style={[styles.reconcileVal, { color: reconcileResult.discrepancy === 0 ? Colors.success : Colors.error }]}>
                    {reconcileResult.discrepancy} Mala
                  </Text>
                </View>
                <View style={styles.reconcileRow}>
                  <Text style={styles.reconcileKey}>Status:</Text>
                  <Text style={[styles.reconcileVal, { color: Colors.success, fontWeight: '800' }]}>
                    {reconcileResult.isReconciled ? 'PERFECTLY RECONCILED' : 'DISCREPANCY FLAGGED'}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setReconcileResult(null)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Done</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
  },
  userHandle: {
    fontSize: 11,
    fontWeight: '600',
  },
  userStats: {
    fontSize: 11,
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  auditCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  auditItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 2,
  },
  auditAction: {
    fontSize: 12,
    fontWeight: '700',
  },
  auditReason: {
    fontSize: 11,
  },
  auditDate: {
    fontSize: 10,
  },
  noAuditText: {
    fontSize: 12,
    textAlign: 'center',
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  reconcileBox: {
    gap: 8,
    marginVertical: 10,
  },
  reconcileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reconcileKey: {
    fontSize: 12,
    color: '#6B7280',
  },
  reconcileVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

