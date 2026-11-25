import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useCounterStore } from '../store/counterStore';
import { apiClient } from '../api/client';
import { MALA_POCKETS, MalaPocketId } from '../constants/malaTypes';

interface DayData {
  date: string;
  totalBeads: number;
  totalMalas: number;
  sessionsCount: number;
  pockets: Record<string, number>;
  sessions: Array<{
    id: string;
    beadCount: number;
    targetCount: number;
    durationSeconds: number;
    completedTarget: boolean;
    malaType: string;
    note?: string;
    time?: string;
    completedAt?: string;
  }>;
}

interface CalendarMonthData {
  month: string; // YYYY-MM
  totalMalasInMonth: number;
  totalBeadsInMonth: number;
  activeDaysInMonth: number;
  days: Record<string, DayData>;
}

interface SadhanaCalendarProps {
  onSelectDateForLiveCounter?: (dateStr: string) => void;
}

export const SadhanaCalendar: React.FC<SadhanaCalendarProps> = ({
  onSelectDateForLiveCounter,
}) => {
  const { mode, t } = useThemeStore();
  const theme = Colors[mode];
  const { updateWalletBalance, updatePockets } = useAuthStore();
  const { setSelectedDate } = useCounterStore();

  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-indexed

  // Today string YYYY-MM-DD
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDateState] = useState(todayStr);

  const [calendarData, setCalendarData] = useState<CalendarMonthData | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal for logging Mala count for a date
  const [showLogModal, setShowLogModal] = useState(false);
  const [logMalaAmount, setLogMalaAmount] = useState('1'); // 1 Mala
  const [logPocket, setLogPocket] = useState<MalaPocketId>('daily_sankalp');
  const [logNote, setLogNote] = useState('');
  const [submittingLog, setSubmittingLog] = useState(false);

  const monthParam = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(`/counter/calendar?month=${monthParam}`);
      if (res.data) {
        setCalendarData(res.data);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  }, [monthParam]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateState(todayStr);
  };

  // Generate calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Cells before day 1
  const leadingBlanks = Array.from({ length: firstDayWeekday }, (_, i) => i);
  // Month days
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Selected day details
  const selectedDayData: DayData | undefined = calendarData?.days?.[selectedDate];

  // Quick Mala presets for logging modal
  const malaPresets = [1, 2, 5, 11, 21, 51, 108];

  const handleSaveLogForDate = async () => {
    const parsedMalas = parseInt(logMalaAmount, 10);
    if (isNaN(parsedMalas) || parsedMalas <= 0) {
      Alert.alert('Notice', 'Please enter a valid whole number of Mala.');
      return;
    }

    setSubmittingLog(true);
    try {
      const res: any = await apiClient.post('/counter/log-date', {
        date: selectedDate,
        malas: parsedMalas,
        beads: parsedMalas * 108,
        malaType: logPocket,
        note: logNote.trim() || undefined,
      });

      if (res.data?.walletBalance !== undefined) {
        updateWalletBalance(res.data.walletBalance);
      }
      if (res.data?.pockets) {
        updatePockets(res.data.pockets);
      }

      setShowLogModal(false);
      setLogNote('');
      Alert.alert(
        'Sadhana Saved to Calendar! 🙏',
        `Successfully logged ${parsedMalas} Mala (${parsedMalas * 108} beads) on ${selectedDate} to your ${logPocket.replace('_', ' ').toUpperCase()} pocket.`
      );
      fetchCalendar();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save count to calendar date.');
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleStartLiveCounterForDate = () => {
    setSelectedDate(selectedDate);
    if (onSelectDateForLiveCounter) {
      onSelectDateForLiveCounter(selectedDate);
    }
  };

  const formatDisplayDate = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dStr;
    }
  };

  return (
    <View style={styles.container}>
      {/* Month Navigation & Controls Header */}
      <View style={[styles.headerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={handlePrevMonth}
            style={[styles.navBtn, { borderColor: theme.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.monthTitleBox}>
            <Text style={[styles.monthTitleText, { color: theme.textPrimary }]}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <Text style={styles.sanskritMonthSub}>मासिक साधना पंचांग</Text>
          </View>

          <TouchableOpacity
            onPress={handleNextMonth}
            style={[styles.navBtn, { borderColor: theme.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickJumpRow}>
          <TouchableOpacity
            onPress={handleJumpToToday}
            style={[styles.todayJumpBtn, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}
            activeOpacity={0.8}
          >
            <Ionicons name="today-outline" size={15} color={Colors.primary} />
            <Text style={styles.todayJumpText}>Jump to Today</Text>
          </TouchableOpacity>
        </View>

        {/* Monthly Summary Statistics Banner */}
        <View style={[styles.monthlyStatsBanner, { backgroundColor: theme.surfaceSubtle }]}>
          <View style={styles.monthStatItem}>
            <Text style={styles.monthStatNumber}>
              {calendarData?.totalMalasInMonth ?? 0}
            </Text>
            <Text style={[styles.monthStatLabel, { color: theme.textSecondary }]}>
              Month Malas 📿
            </Text>
          </View>

          <View style={styles.monthStatDivider} />

          <View style={styles.monthStatItem}>
            <Text style={[styles.monthStatNumber, { color: Colors.accentGoldDark }]}>
              {(calendarData?.totalBeadsInMonth ?? 0).toLocaleString()}
            </Text>
            <Text style={[styles.monthStatLabel, { color: theme.textSecondary }]}>
              Total Beads
            </Text>
          </View>

          <View style={styles.monthStatDivider} />

          <View style={styles.monthStatItem}>
            <Text style={[styles.monthStatNumber, { color: '#EA580C' }]}>
              {calendarData?.activeDaysInMonth ?? 0}
            </Text>
            <Text style={[styles.monthStatLabel, { color: theme.textSecondary }]}>
              Chanted Days 🔥
            </Text>
          </View>
        </View>
      </View>

      {/* Interactive Calendar Grid */}
      <View style={[styles.calendarCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Weekday Labels Header */}
        <View style={styles.weekdaysRow}>
          {weekdayNames.map((w, idx) => (
            <View key={w} style={styles.weekdayCell}>
              <Text
                style={[
                  styles.weekdayText,
                  idx === 0 || idx === 6 ? { color: Colors.primary } : { color: theme.textSecondary },
                ]}
              >
                {w}
              </Text>
            </View>
          ))}
        </View>

        {loading ? (
          <View style={styles.calendarLoadingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={[styles.loadingNotice, { color: theme.textSecondary }]}>
              Loading Sadhana Dates...
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {/* Blank offset cells */}
            {leadingBlanks.map((b) => (
              <View key={`blank-${b}`} style={styles.dayCellEmpty} />
            ))}

            {/* Days in Month */}
            {monthDays.map((dayNum) => {
              const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDate === dateKey;
              const isToday = todayStr === dateKey;
              const dayRecord = calendarData?.days?.[dateKey];
              const hasChanted = Boolean(dayRecord && dayRecord.totalMalas > 0);

              return (
                <TouchableOpacity
                  key={`day-${dayNum}`}
                  onPress={() => setSelectedDateState(dateKey)}
                  activeOpacity={0.7}
                  style={[
                    styles.dayCell,
                    isSelected && {
                      backgroundColor: '#FFF7ED',
                      borderColor: Colors.primary,
                      borderWidth: 2,
                    },
                    !isSelected && isToday && {
                      borderColor: '#FDBA74',
                      borderWidth: 1.5,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumberText,
                      isSelected && { color: Colors.primary, fontWeight: '800' },
                      !isSelected && isToday && { color: Colors.primary, fontWeight: '700' },
                      !isSelected && !isToday && { color: theme.textPrimary },
                    ]}
                  >
                    {dayNum}
                  </Text>

                  {/* Mala Count Pill / Indicator on this date */}
                  {hasChanted ? (
                    <View style={styles.malaCountBadge}>
                      <Text style={styles.malaCountBadgeText}>
                        {dayRecord!.totalMalas}📿
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.malaPlaceholderDot} />
                  )}

                  {isToday && <View style={styles.todayIndicatorBar} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Selected Date Details & Actions Card */}
      <View style={[styles.detailCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.detailHeaderRow}>
          <View>
            <View style={styles.detailDateTag}>
              <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
              <Text style={styles.detailDateTagText}>Selected Sadhana Date</Text>
            </View>
            <Text style={[styles.detailDateTitle, { color: theme.textPrimary }]}>
              {formatDisplayDate(selectedDate)}
            </Text>
          </View>

          {/* Quick Log button */}
          <TouchableOpacity
            onPress={() => setShowLogModal(true)}
            style={styles.addMalaDateBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle" size={18} color="#FFFFFF" />
            <Text style={styles.addMalaDateBtnText}>Log Mala</Text>
          </TouchableOpacity>
        </View>

        {selectedDayData && selectedDayData.totalMalas > 0 ? (
          <View style={styles.dayStatsContainer}>
            {/* Total Count Summary */}
            <View style={[styles.dayTotalBanner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <View style={styles.dayTotalLeft}>
                <Text style={{ fontSize: 24 }}>📿</Text>
                <View>
                  <Text style={styles.dayTotalTitle}>
                    {selectedDayData.totalMalas} Mala Counted
                  </Text>
                  <Text style={styles.dayTotalSub}>
                    {selectedDayData.totalBeads} beads completed in {selectedDayData.sessionsCount} session(s)
                  </Text>
                </View>
              </View>
            </View>

            {/* 6 Sacred Pockets Breakdown on this date */}
            <Text style={[styles.pocketsBreakdownTitle, { color: theme.textSecondary }]}>
              Sacred Pockets Credited on this Date:
            </Text>
            <View style={styles.pocketsMiniGrid}>
              {MALA_POCKETS.map((pkt) => {
                const count = selectedDayData.pockets?.[pkt.id] || 0;
                if (count <= 0) return null;
                return (
                  <View
                    key={pkt.id}
                    style={[
                      styles.pocketPillItem,
                      { backgroundColor: pkt.bgLight, borderColor: pkt.borderColor },
                    ]}
                  >
                    <Text style={{ fontSize: 14 }}>{pkt.symbol}</Text>
                    <Text style={[styles.pocketPillText, { color: pkt.color }]}>
                      {pkt.title}: <Text style={{ fontWeight: '800' }}>{count} Mala</Text>
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Sessions Timeline on this date */}
            <Text style={[styles.timelineTitle, { color: theme.textSecondary }]}>
              Recorded Japa Sessions:
            </Text>
            {selectedDayData.sessions.map((sess, idx) => (
              <View key={sess.id || idx} style={[styles.sessionRow, { borderColor: theme.border }]}>
                <View style={styles.sessionTimeBadge}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.sessionTimeText}>{sess.time || 'Completed'}</Text>
                </View>
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                  <Text style={[styles.sessionBeadsText, { color: theme.textPrimary }]}>
                    {sess.beadCount} beads ({Math.floor(sess.beadCount / 108) || 1} Mala)
                  </Text>
                  {sess.note && (
                    <Text style={[styles.sessionNoteText, { color: Colors.accentGoldDark }]}>
                      "{sess.note}"
                    </Text>
                  )}
                </View>
                <View style={[styles.sessionPocketTag, { backgroundColor: '#FFF7ED' }]}>
                  <Text style={styles.sessionPocketTagText}>
                    {sess.malaType.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyDayNotice}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🕉️</Text>
            <Text style={[styles.emptyDayText, { color: theme.textSecondary }]}>
              No Mala counted on this date yet.
            </Text>
            <Text style={[styles.emptyDaySub, { color: theme.textMuted }]}>
              Tap "Log Mala" above to record sadhana for this date, or switch to Live Counter!
            </Text>
          </View>
        )}

        {/* Live Counter Shortcut Button for Selected Date */}
        <TouchableOpacity
          onPress={handleStartLiveCounterForDate}
          style={[styles.countOnLiveBtn, { backgroundColor: Colors.primary }]}
          activeOpacity={0.88}
        >
          <Ionicons name="flower-outline" size={18} color="#FFFFFF" />
          <Text style={styles.countOnLiveBtnText}>
            Open Live Bead Counter for {selectedDate === todayStr ? 'Today' : selectedDate}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ----------------- LOG MALA COUNT MODAL ----------------- */}
      <Modal visible={showLogModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <Text style={{ fontSize: 20 }}>📅</Text>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                    Save Mala to Calendar Date
                  </Text>
                  <Text style={[styles.modalSub, { color: Colors.primary }]}>
                    {formatDisplayDate(selectedDate)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowLogModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Mala Amount Presets */}
              <Text style={[styles.modalFieldLabel, { color: theme.textPrimary }]}>
                Number of Mala to Save (1 Mala = 108 beads)
              </Text>
              <View style={styles.presetsRow}>
                {malaPresets.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setLogMalaAmount(String(p))}
                    style={[
                      styles.presetChip,
                      logMalaAmount === String(p)
                        ? { backgroundColor: Colors.primary, borderColor: Colors.primary }
                        : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        { color: logMalaAmount === String(p) ? '#FFFFFF' : theme.textPrimary },
                      ]}
                    >
                      {p} Mala
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Input */}
              <View style={[styles.inputBox, { borderColor: theme.border, backgroundColor: theme.surfaceSubtle }]}>
                <Text style={{ fontSize: 16 }}>📿</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.textPrimary }]}
                  keyboardType="number-pad"
                  value={logMalaAmount}
                  onChangeText={setLogMalaAmount}
                  placeholder="Enter number of Mala"
                  placeholderTextColor={theme.textMuted}
                />
                <Text style={{ fontSize: 12, color: theme.textSecondary, fontWeight: '700' }}>
                  = {((parseInt(logMalaAmount, 10) || 0) * 108).toLocaleString()} Beads
                </Text>
              </View>

              {/* Select Pocket */}
              <Text style={[styles.modalFieldLabel, { color: theme.textPrimary, marginTop: 14 }]}>
                Select Sacred Mala Pocket to Credit:
              </Text>
              <View style={styles.pocketsSelectGrid}>
                {MALA_POCKETS.map((pkt) => {
                  const isChosen = logPocket === pkt.id;
                  return (
                    <TouchableOpacity
                      key={pkt.id}
                      onPress={() => setLogPocket(pkt.id)}
                      style={[
                        styles.pocketOptionCard,
                        {
                          backgroundColor: isChosen ? pkt.bgLight : theme.surfaceSubtle,
                          borderColor: isChosen ? pkt.color : theme.border,
                          borderWidth: isChosen ? 2 : 1,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 16 }}>{pkt.symbol}</Text>
                      <View style={{ flex: 1, marginLeft: 6 }}>
                        <Text
                          style={[
                            styles.pocketOptionTitle,
                            { color: isChosen ? pkt.color : theme.textPrimary },
                          ]}
                          numberOfLines={1}
                        >
                          {pkt.title}
                        </Text>
                        <Text style={[styles.pocketOptionHindi, { color: theme.textSecondary }]}>
                          {pkt.hindiTitle}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Optional Note */}
              <Text style={[styles.modalFieldLabel, { color: theme.textPrimary, marginTop: 14 }]}>
                Devotional Note / Mantra (Optional)
              </Text>
              <TextInput
                style={[
                  styles.noteInput,
                  { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surfaceSubtle },
                ]}
                placeholder="e.g. Om Namah Shivaya morning sadhana 🙏"
                placeholderTextColor={theme.textMuted}
                value={logNote}
                onChangeText={setLogNote}
              />

              {/* Submit Save Button */}
              <TouchableOpacity
                onPress={handleSaveLogForDate}
                disabled={submittingLog}
                style={[styles.saveDateBtn, { backgroundColor: Colors.primary }]}
                activeOpacity={0.88}
              >
                {submittingLog ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                    <Text style={styles.saveDateBtnText}>
                      Save {logMalaAmount} Mala to {selectedDate}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    gap: 16,
  },
  headerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleBox: {
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sanskritMonthSub: {
    fontSize: 11,
    color: Colors.accentGoldDark,
    fontWeight: '700',
    marginTop: 2,
  },
  quickJumpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  todayJumpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  todayJumpText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  monthlyStatsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  monthStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  monthStatNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  monthStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  monthStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  calendarCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  weekdaysRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
  },
  calendarLoadingBox: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  loadingNotice: {
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 8,
  },
  dayCellEmpty: {
    width: `${100 / 7}%`,
    height: 52,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    position: 'relative',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  malaCountBadge: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    marginTop: 2,
  },
  malaCountBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  malaPlaceholderDot: {
    height: 14,
  },
  todayIndicatorBar: {
    position: 'absolute',
    bottom: 2,
    width: 14,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  detailCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  detailDateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  detailDateTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  detailDateTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  addMalaDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addMalaDateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dayStatsContainer: {
    gap: 10,
  },
  dayTotalBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayTotalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayTotalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
  },
  dayTotalSub: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 1,
  },
  pocketsBreakdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  pocketsMiniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pocketPillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  pocketPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sessionTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sessionTimeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  sessionBeadsText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sessionNoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 1,
  },
  sessionPocketTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sessionPocketTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  emptyDayNotice: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyDayText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyDaySub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  countOnLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  countOnLiveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    paddingTop: 14,
    gap: 10,
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    padding: 0,
  },
  pocketsSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pocketOptionCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
  },
  pocketOptionTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  pocketOptionHindi: {
    fontSize: 10,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  saveDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  saveDateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
