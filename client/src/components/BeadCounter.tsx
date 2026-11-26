import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useCounterStore } from '../store/counterStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { MALA_POCKETS, MalaPocketId } from '../constants/malaTypes';
import WebThreads from './WebThreads';

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
    beadsPerMala,
    setBeadsPerMala,
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

  const MALA_SYSTEMS = [
    { count: 21, name: '21 Beads', hindi: 'लघु (21)', badge: '21' },
    { count: 56, name: '56 Beads', hindi: 'छप्पन (56)', badge: '56' },
    { count: 108, name: '108 Beads', hindi: 'महामाला (108)', badge: '108' },
  ];

  const targets = [1, 2, 5, 11, 21].map((m) => m * beadsPerMala);
  const completedMalas = Math.floor(sessionCount / beadsPerMala);
  const beadsInCurrentRound = sessionCount % beadsPerMala;
  const roundPercent = Math.min(
    100,
    sessionCount > 0 && beadsInCurrentRound === 0
      ? 100
      : Math.round((beadsInCurrentRound / beadsPerMala) * 100)
  );

  return (
    <View style={styles.container}>
      {/* Interactive WebThreads Cosmic Weave Background */}
      <View style={styles.webThreadsBackground} pointerEvents="none">
        <WebThreads
          colors={['#FF7A00', '#5227FF', '#FF9FFC', '#FFA347', '#D4AF37']}
          coreColor="#FFFFFF"
          threadCount={7}
          spread={0.25}
          speed={0.22}
          thickness={1.3}
          glow={0.03}
          brightness={0.7}
          lightMode={mode === 'light'}
          mouseInteraction={true}
          pulseOnClick={true}
        />
      </View>

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

      {/* 3-System Mala Counting Mode (21 Beads, 56 Beads, 108 Beads) */}
      <View style={styles.systemSection}>
        <View style={styles.systemHeader}>
          <Text style={[styles.systemTitle, { color: theme.textPrimary }]}>
            Mala Counting System
          </Text>
          <View style={[styles.systemActivePill, { backgroundColor: activePocket.color }]}>
            <Text style={styles.systemActivePillText}>
              1 Mala = {beadsPerMala} Beads
            </Text>
          </View>
        </View>

        <View style={styles.systemOptionsRow}>
          {MALA_SYSTEMS.map((sys) => {
            const isSelected = beadsPerMala === sys.count;
            return (
              <TouchableOpacity
                key={sys.count}
                onPress={() => setBeadsPerMala(sys.count)}
                activeOpacity={0.8}
                style={[
                  styles.systemOptionBtn,
                  {
                    backgroundColor: isSelected ? activePocket.bgLight : theme.surface,
                    borderColor: isSelected ? activePocket.color : theme.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.systemBadgeRow}>
                  <Text
                    style={[
                      styles.systemCountBadge,
                      { color: isSelected ? activePocket.color : theme.textPrimary },
                    ]}
                  >
                    {sys.badge}
                  </Text>
                  <Text style={{ fontSize: 13 }}>📿</Text>
                </View>
                <Text
                  style={[
                    styles.systemName,
                    { color: isSelected ? activePocket.color : theme.textPrimary },
                  ]}
                >
                  {sys.name}
                </Text>
                <Text style={[styles.systemHindi, { color: theme.textSecondary }]}>
                  {sys.hindi}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Target celebration banner */}
      {targetCompletedAnimation && (
        <View style={styles.celebrationCard}>
          <Text style={styles.celebrationOm}>🕉️ {activePocket.symbol} 🕉️</Text>
          <Text style={styles.celebrationTitle}>
            Mala Completed: {completedMalas || 1} Mala!
          </Text>
          <Text style={styles.celebrationSub}>
            {sessionCount} beads chanted under the {beadsPerMala}-bead system. Blessings credited to your {activePocket.title} Pocket!
          </Text>
          <TouchableOpacity onPress={dismissTargetAnimation} style={styles.dismissBtn}>
            <Text style={styles.dismissText}>Continue Sadhana</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Target selector pills */}
      <View style={styles.targetsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.targetsScroll}
        >
          {targets.map((tgt) => {
            const isSelected = targetCount === tgt;
            const targetMala = tgt / beadsPerMala;
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
                  {targetMala} Mala ({tgt}b)
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
            <View
              style={[
                styles.completedMalaBadge,
                {
                  backgroundColor: activePocket.bgLight,
                  borderColor: activePocket.borderColor,
                },
              ]}
            >
              <Text style={[styles.completedMalaBadgeText, { color: activePocket.color }]}>
                📿 {completedMalas} Mala Completed
              </Text>
            </View>

            <Text style={[styles.largeCountNumber, { color: theme.textPrimary }]}>
              {sessionCount}
            </Text>

            <Text style={[styles.roundBeadsText, { color: activePocket.color }]}>
              Round: {beadsInCurrentRound} / {beadsPerMala} beads
            </Text>

            <Text style={[styles.tapLabel, { color: theme.textSecondary }]}>
              {t('tapToCount')}
            </Text>

            {/* Progress indicator */}
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${roundPercent}%`, backgroundColor: activePocket.color },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: activePocket.color }]}>
              {roundPercent}% of Round • Target: {Math.round(targetCount / beadsPerMala)} Mala
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
    position: 'relative',
    overflow: 'hidden',
  },
  webThreadsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    opacity: 0.88,
  },
  pocketsSection: {
    width: '100%',
    marginBottom: 16,
    zIndex: 2,
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
  systemSection: {
    width: '100%',
    marginBottom: 16,
    zIndex: 2,
  },
  systemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  systemTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  systemActivePill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  systemActivePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  systemOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  systemOptionBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  systemCountBadge: {
    fontSize: 16,
    fontWeight: '800',
  },
  systemName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 1,
  },
  systemHindi: {
    fontSize: 10,
    fontWeight: '500',
  },
  targetsRow: {
    width: '100%',
    marginBottom: 18,
    zIndex: 2,
  },
  targetsScroll: {
    gap: 8,
    paddingHorizontal: 2,
  },
  targetPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  targetPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  counterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    zIndex: 2,
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
  completedMalaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  completedMalaBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  largeCountNumber: {
    fontSize: 66,
    fontWeight: '800',
    letterSpacing: -1,
  },
  roundBeadsText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 4,
  },
  tapLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
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
    zIndex: 2,
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
    zIndex: 2,
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
    zIndex: 5,
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

