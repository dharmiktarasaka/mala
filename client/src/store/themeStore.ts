import { create } from 'zustand';
import { Language, translations } from '../i18n/translations';

interface ThemeState {
  mode: 'light' | 'dark';
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  language: 'en',

  toggleTheme: () => set((s) => ({ mode: s.mode === 'light' ? 'dark' : 'light' })),
  setLanguage: (language) => set({ language }),

  t: (key) => {
    const lang = get().language;
    return translations[lang]?.[key] || translations['en'][key] || String(key);
  },
}));

