import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateUser: (partial: Partial<User>) => void;
  updateWalletBalance: (balance: number) => void;
  logout: () => void;
  hydrate: () => void;
}

const STORAGE_KEY = 'mala_auth_session';

const loadSavedAuth = () => {
  if (typeof window !== 'undefined') {
    // 1. Check tab-isolated sessionStorage first so different tabs/windows can run different devotee accounts
    try {
      const tabSaved = window.sessionStorage?.getItem(STORAGE_KEY);
      if (tabSaved) {
        const parsed = JSON.parse(tabSaved);
        if (parsed?.token && parsed?.user) {
          return {
            user: parsed.user,
            token: parsed.token,
            refreshToken: parsed.refreshToken || null,
            isAuthenticated: true,
          };
        }
      }
    } catch {}

    // 2. Fall back to persistent localStorage
    try {
      const saved = window.localStorage?.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token && parsed?.user) {
          try {
            window.sessionStorage?.setItem(STORAGE_KEY, saved);
          } catch {}
          return {
            user: parsed.user,
            token: parsed.token,
            refreshToken: parsed.refreshToken || null,
            isAuthenticated: true,
          };
        }
      }
    } catch {}
  }

  return {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
  };
};

const initialAuth = loadSavedAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialAuth.user,
  token: initialAuth.token,
  refreshToken: initialAuth.refreshToken,
  isAuthenticated: initialAuth.isAuthenticated,
  isLoading: false,
  isHydrated: true,

  setAuth: (user, token, refreshToken) => {
    const payload = JSON.stringify({ user, token, refreshToken });
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage?.setItem(STORAGE_KEY, payload);
      } catch {}
      try {
        window.localStorage?.setItem(STORAGE_KEY, payload);
      } catch {}
    }
    set({
      user,
      token,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
      isHydrated: true,
    });
  },

  updateUser: (partial) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, ...partial } : null;
      if (typeof window !== 'undefined' && updatedUser && state.token) {
        const payload = JSON.stringify({
          user: updatedUser,
          token: state.token,
          refreshToken: state.refreshToken,
        });
        try {
          window.sessionStorage?.setItem(STORAGE_KEY, payload);
        } catch {}
        try {
          window.localStorage?.setItem(STORAGE_KEY, payload);
        } catch {}
      }
      return { user: updatedUser };
    }),

  updateWalletBalance: (balance) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, walletBalance: balance } : null;
      if (typeof window !== 'undefined' && updatedUser && state.token) {
        const payload = JSON.stringify({
          user: updatedUser,
          token: state.token,
          refreshToken: state.refreshToken,
        });
        try {
          window.sessionStorage?.setItem(STORAGE_KEY, payload);
        } catch {}
        try {
          window.localStorage?.setItem(STORAGE_KEY, payload);
        } catch {}
      }
      return { user: updatedUser };
    }),

  logout: () => {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage?.removeItem(STORAGE_KEY);
      } catch {}
      try {
        window.localStorage?.removeItem(STORAGE_KEY);
      } catch {}
    }
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: true,
    });
  },

  hydrate: () => {
    const fresh = loadSavedAuth();
    set({
      user: fresh.user,
      token: fresh.token,
      refreshToken: fresh.refreshToken,
      isAuthenticated: fresh.isAuthenticated,
      isHydrated: true,
    });
  },
}));
