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
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
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
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user, token, refreshToken }),
        );
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
      if (typeof window !== 'undefined' && window.localStorage && updatedUser && state.token) {
        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              user: updatedUser,
              token: state.token,
              refreshToken: state.refreshToken,
            }),
          );
        } catch {}
      }
      return { user: updatedUser };
    }),

  updateWalletBalance: (balance) =>
    set((state) => {
      const updatedUser = state.user ? { ...state.user, walletBalance: balance } : null;
      if (typeof window !== 'undefined' && window.localStorage && updatedUser && state.token) {
        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              user: updatedUser,
              token: state.token,
              refreshToken: state.refreshToken,
            }),
          );
        } catch {}
      }
      return { user: updatedUser };
    }),

  logout: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
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
