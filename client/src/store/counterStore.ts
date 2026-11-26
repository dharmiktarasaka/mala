import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { MalaPocketId } from '../constants/malaTypes';

interface CounterState {
  sessionCount: number;
  targetCount: number;
  beadsPerMala: number; // 21 | 56 | 108
  dailyTotal: number;
  lifetimeTotal: number;
  streakDays: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  targetCompletedAnimation: boolean;
  selectedMalaType: MalaPocketId;
  selectedDate: string; // YYYY-MM-DD

  increment: () => void;
  decrement: () => void;
  resetSession: () => void;
  setTarget: (target: number) => void;
  setBeadsPerMala: (system: number) => void;
  setSelectedMalaType: (type: MalaPocketId) => void;
  setSelectedDate: (date: string) => void;
  resetDateToToday: () => void;
  setStatsFromServer: (stats: {
    dailyCount: number;
    lifetimeCount: number;
    currentStreakDays: number;
  }) => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  dismissTargetAnimation: () => void;
}

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useCounterStore = create<CounterState>((set, get) => ({
  sessionCount: 0,
  targetCount: 108,
  beadsPerMala: 108, // Default 108, supports 21, 56, 108
  dailyTotal: 0,
  lifetimeTotal: 0,
  streakDays: 0,
  soundEnabled: true,
  vibrationEnabled: true,
  targetCompletedAnimation: false,
  selectedMalaType: 'daily_sankalp',
  selectedDate: getTodayDateString(),

  increment: () => {
    const { sessionCount, targetCount, beadsPerMala, dailyTotal, lifetimeTotal, vibrationEnabled } = get();
    const newSession = sessionCount + 1;
    const isMalaCompleted = newSession % beadsPerMala === 0;
    const isTargetReached = newSession >= targetCount && isMalaCompleted;

    if (vibrationEnabled) {
      try {
        if (isMalaCompleted || isTargetReached) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } catch {
        // Fallback for web / simulators without hardware haptics
      }
    }

    set({
      sessionCount: newSession,
      dailyTotal: dailyTotal + 1,
      lifetimeTotal: lifetimeTotal + 1,
      targetCompletedAnimation: isMalaCompleted,
    });
  },

  decrement: () => {
    const { sessionCount, dailyTotal, lifetimeTotal, vibrationEnabled } = get();
    if (sessionCount <= 0) return;

    if (vibrationEnabled) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }

    set({
      sessionCount: Math.max(0, sessionCount - 1),
      dailyTotal: Math.max(0, dailyTotal - 1),
      lifetimeTotal: Math.max(0, lifetimeTotal - 1),
    });
  },

  resetSession: () => set({ sessionCount: 0, targetCompletedAnimation: false }),

  setTarget: (target) => set({ targetCount: target }),

  setBeadsPerMala: (system) => {
    const validSystems = [21, 56, 108];
    const newSystem = validSystems.includes(system) ? system : 108;
    set((state) => ({
      beadsPerMala: newSystem,
      targetCount: [21, 56, 108].includes(state.targetCount) ? newSystem : state.targetCount,
    }));
  },

  setSelectedMalaType: (type) => set({ selectedMalaType: type }),

  setSelectedDate: (date: string) => set({ selectedDate: date }),

  resetDateToToday: () => set({ selectedDate: getTodayDateString() }),

  setStatsFromServer: (stats) =>
    set({
      dailyTotal: stats.dailyCount,
      lifetimeTotal: stats.lifetimeCount,
      streakDays: stats.currentStreakDays,
    }),

  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
  dismissTargetAnimation: () => set({ targetCompletedAnimation: false }),
}));

