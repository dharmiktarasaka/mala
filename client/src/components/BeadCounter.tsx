import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useCounterStore } from '../store/counterStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { MALA_POCKETS, MalaPocketId } from '../constants/malaTypes';

const { width } = Dimensions.get('window');
const COUNTER_SIZE = Math.min(width * 0.72, 280);

interface BeadCounterProps {
  onSaveSession?: () => void;
}

export const BeadCounter: React.FC<BeadCounterProps> = ({ onSaveSession }) => {
  const { mode, t } = useThemeStore();
  const theme = Colors[mode];
  const { user } = useAuthStore();

  const {
    sessionCount,
    targetCount,
    increment,
    decrement,
    resetSession,
    setTarget,
    soundEnabled,
    vibrationEnabled,
    toggleSound,
    toggleVibration,
    targetCompletedAnimation,
    dismissTargetAnimation,
    selectedMalaType,
    setSelectedMalaType,
  } = useCounterStore();

  const activePocket = MALA_POCKETS.find((p) => p.id === selectedMalaType) || MALA_POCKETS[5];
  const pocketCount = (user?.pockets as any)?.[selectedMalaType] ?? 0;

  const targets = [11, 21, 51, 108, 1008];
  const progressPercent = Math.min(100, Math.round((sessionCount / targetCount) * 100));

  return (
    <View style={styles.container}>
      {/* 6 Mala Jaap Categories & Pockets Selector Bar */}
      <View style={styles.pocketsSection}>
        <View style={styles.pocketsHeader}>
          <Text style={[styles.pocketsSectionTitle, { color: theme.textPrimary }]}>
            Select Mala Jaap Type
          </Text>
          <Text style={[styles.pocketsSectionSub, { color: activePocket.color }]}>
            {activePocket.symbol} {activePocket.hindiTitle}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pocketsScroll}
        >
          {MALA_POCKETS.map((pocket) => {
            const isSelected = selectedMalaType === pocket.id;
            const count = (user?.pockets as any)?.[pocket.id] ?? 0;
            return (
              <TouchableOpacity
                key={pocket.id}
                onPress={() => setSelectedMalaType(pocket.id)}
                activeOpacity={0.8}
                style={[
                  styles.pocketChip,
                  {
                    backgroundColor: isSelected ? pocket.bgLight : theme.surface,
                    borderColor: isSelected ? pocket.color : theme.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <Text style={styles.pocketChipSymbol}>{pocket.symbol}</Text>
                <View style={styles.pocketChipInfo}>
                  <Text
                    style={[
                      styles.pocketChipTitle,
                      { color: isSelected ? pocket.color : theme.textPrimary },
                    ]}
                  >
                    {pocket.title}
                  </Text>
                  <Text style={[styles.pocketChipHindi, { color: theme.textSecondary }]}>
                    {pocket.hindiTitle}
                  </Text>
                </View>
                <View
                  style={[
                    styles.pocketBadge,
                    {
                      backgroundColor: isSelected ? pocket.color : theme.surfaceSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pocketBadgeText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Mala Details Card */}
        <View
          style={[
            styles.activeMalaCard,
            {
              backgroundColor: activePocket.bgLight,
              borderColor: activePocket.borderColor,
            },
          ]}
        >
          <View style={styles.activeMalaRow}>
            <Text style={styles.activeMalaIcon}>{activePocket.symbol}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.activeMalaTitleRow}>
                <Text style={[styles.activeMalaTitle, { color: activePocket.color }]}>
                  {activePocket.title} ({activePocket.hindiTitle})
                </Text>
                <View style={[styles.pocketCountPill, { backgroundColor: activePocket.color }]}>
                  <Text style={styles.pocketCountPillText}>
                    Vault: {pocketCount} Mala
                  </Text>
                </View>
              </View>
              <Text style={styles.activeMalaDesc}>{activePocket.description}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Target celebration banner */}
      {targetCompletedAnimation && (
        <View style={styles.celebrationCard}>
          <Text style={styles.celebrationOm}>🕉️ {activePocket.symbol} 🕉️</Text>
          <Text style={styles.celebrationTitle}>Target Reached: {targetCount} Mala!</Text>
          <Text style={styles.celebrationSub}>
            Divine blessings credited to your {activePocket.title} Pocket!
          </Text>
          <TouchableOpacity onPress={dismissTargetAnimation} style={styles.dismissBtn}>
            <Text style={styles.dismissText}>Continue Sadhana</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Target selector pills */}
      <View style={styles.targetsRow}>
        {targets.map((tgt) => {
          const isSelected = targetCount === tgt;
          return (
            <TouchableOpacity
              key={tgt}
              onPress={() => setTarget(tgt)}
              style={[
                styles.targetPill,
                isSelected
                  ? { backgroundColor: activePocket.color, borderColor: activePocket.color }
                  : { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text
                style={[
                  styles.targetPillText,
                  { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                {tgt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Circular Bead Counter Touch Target */}
      <View style={styles.counterWrapper}>
        {/* Outer decorative bead ring */}
        <View
          style={[
            styles.beadRing,
            { borderColor: activePocket.color, backgroundColor: theme.surfaceSubtle },
          ]}
        >
          {/* Main Tap-to-Count Circle */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={increment}
            style={[
              styles.counterCircle,
              { backgroundColor: theme.surface, shadowColor: activePocket.color },
            ]}
          >
            <Text style={[styles.targetSmall, { color: activePocket.color }]}>
              {activePocket.title} • {t('target')}: {targetCount}
            </Text>
            <Text style={[styles.largeCountNumber, { color: theme.textPrimary }]}>
              {sessionCount}
            </Text>
            <Text style={[styles.tapLabel, { color: theme.textSecondary }]}>
              {t('tapToCount')}
            </Text>

            {/* Progress indicator */}
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%`, backgroundColor: activePocket.color },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: activePocket.color }]}>
              {progressPercent}% Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Controls Row (-1 Undo, Reset, Save, Sound/Vibration) */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={decrement}
          style={[styles.controlBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name="arrow-undo" size={20} color={Colors.warning} />
          <Text style={[styles.controlBtnText, { color: theme.textPrimary }]}>
            {t('undo')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetSession}
          style={[styles.controlBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name="refresh-outline" size={20} color={Colors.error} />
          <Text style={[styles.controlBtnText, { color: theme.textPrimary }]}>
            {t('resetSession')}
          </Text>
        </TouchableOpacity>

        {onSaveSession && (
          <TouchableOpacity
            onPress={onSaveSession}
            style={[styles.controlBtn, styles.saveBtn, { backgroundColor: activePocket.color, borderColor: activePocket.color }]}
          >
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            <Text style={[styles.controlBtnText, { color: '#FFFFFF' }]}>
              {t('saveSession')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Toggles Bar: Audio & Vibration */}
      <View style={styles.togglesBar}>
        <TouchableOpacity onPress={toggleSound} style={styles.toggleItem}>
          <Ionicons
            name={soundEnabled ? 'volume-high-outline' : 'volume-mute-outline'}
            size={20}
            color={soundEnabled ? activePocket.color : theme.textMuted}
          />
          <Text style={[styles.toggleText, { color: theme.textSecondary }]}>
            Sound {soundEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        <View style={[styles.toggleDivider, { backgroundColor: theme.border }]} />

        <TouchableOpacity onPress={toggleVibration} style={styles.toggleItem}>
          <Ionicons
            name={vibrationEnabled ? 'radio-outline' : 'radio-button-off-outline'}
            size={20}
            color={vibrationEnabled ? activePocket.color : theme.textMuted}
          />
          <Text style={[styles.toggleText, { color: theme.textSecondary }]}>
            Haptic {vibrationEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  pocketsSection: {
    width: '100%',
    marginBottom: 16,
  },
  pocketsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  pocketsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pocketsSectionSub: {
    fontSize: 13,
    fontWeight: '800',
  },
  pocketsScroll: {
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  pocketChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 8,
  },
  pocketChipSymbol: {
    fontSize: 18,
  },
  pocketChipInfo: {
    justifyContent: 'center',
  },
  pocketChipTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  pocketChipHindi: {
    fontSize: 10,
    fontWeight: '500',
  },
  pocketBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  pocketBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeMalaCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
  },
  activeMalaRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  activeMalaIcon: {
    fontSize: 26,
  },
  activeMalaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  activeMalaTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  pocketCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pocketCountPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  activeMalaDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
  targetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  targetPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  targetPillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  counterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  beadRing: {
    width: COUNTER_SIZE + 24,
    height: COUNTER_SIZE + 24,
    borderRadius: (COUNTER_SIZE + 24) / 2,
    borderWidth: 4,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterCircle: {
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    borderRadius: COUNTER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    padding: 16,
  },
  targetSmall: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  largeCountNumber: {
    fontSize: 68,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tapLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 10,
  },
  progressBarBg: {
    width: '70%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  saveBtn: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  controlBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  togglesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 18,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  toggleDivider: {
    width: 1,
    height: 16,
  },
  celebrationCard: {
    width: '90%',
    backgroundColor: '#FFF9E6',
    borderColor: Colors.accentGold,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  celebrationOm: {
    fontSize: 24,
    marginBottom: 4,
  },
  celebrationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  celebrationSub: {
    fontSize: 12,
    color: '#8A6D1C',
    textAlign: 'center',
    marginVertical: 4,
  },
  dismissBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dismissText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

