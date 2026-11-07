import { create } from 'zustand';
import * as Haptics from 'expo-haptics';

interface CounterState {
  sessionCount: number;
  targetCount: number;
  dailyTotal: number;
  lifetimeTotal: number;
  streakDays: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  targetCompletedAnimation: boolean;

  increment: () => void;
  decrement: () => void;
  resetSession: () => void;
  setTarget: (target: number) => void;
  setStatsFromServer: (stats: {
    dailyCount: number;
    lifetimeCount: number;
    currentStreakDays: number;
  }) => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  dismissTargetAnimation: () => void;
}

export const useCounterStore = create<CounterState>((set, get) => ({
  sessionCount: 0,
  targetCount: 108,
  dailyTotal: 0,
  lifetimeTotal: 0,
  streakDays: 0,
  soundEnabled: true,
  vibrationEnabled: true,
  targetCompletedAnimation: false,

  increment: () => {
    const { sessionCount, targetCount, dailyTotal, lifetimeTotal, vibrationEnabled } = get();
    const newSession = sessionCount + 1;
    const isTargetReached = newSession === targetCount;

    if (vibrationEnabled) {
      try {
        if (isTargetReached) {
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
      targetCompletedAnimation: isTargetReached,
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

