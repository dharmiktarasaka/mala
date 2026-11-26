export interface MalaPocketConfig {
  id: 'divya_mahamala' | 'jackpot' | 'ram_ram' | 'extra' | 'bonus' | 'daily_sankalp' | 'daily_21';
  title: string;
  hindiTitle: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  bgLight: string;
  borderColor: string;
  symbol: string;
}

export const MALA_POCKETS: MalaPocketConfig[] = [
  {
    id: 'divya_mahamala',
    title: 'Divya Mahamala',
    hindiTitle: 'दिव्य महामाला',
    subtitle: 'Supreme Divine Chanting',
    description: 'Chant supreme divine mantras for inner illumination, cosmic peace, and highest spiritual elevation.',
    icon: 'flower-outline',
    color: '#D4AF37', // Royal Gold
    bgLight: '#FFFDF0',
    borderColor: '#FDE68A',
    symbol: '🌸',
  },
  {
    id: 'jackpot',
    title: 'Jackpot Mala',
    hindiTitle: 'जैकपॉट माला',
    subtitle: 'Auspicious Abundance',
    description: 'Special high-vibration multiplier sadhana bringing divine grace and auspicious spiritual abundance.',
    icon: 'trophy-outline',
    color: '#8B5CF6', // Royal Violet
    bgLight: '#F5F3FF',
    borderColor: '#DDD6FE',
    symbol: '🎰',
  },
  {
    id: 'ram_ram',
    title: 'Ram-Ram Mala',
    hindiTitle: 'राम-राम माला',
    subtitle: 'Sacred Ram Naam Jaap',
    description: 'The supreme tarak mantra "राम-राम". Calms the mind, removes obstacles, and grants absolute protection.',
    icon: 'flame-outline',
    color: '#FF7A00', // Sacred Deep Saffron
    bgLight: '#FFF7ED',
    borderColor: '#FED7AA',
    symbol: '🚩',
  },
  {
    id: 'extra',
    title: 'General',
    hindiTitle: 'सामान्य',
    subtitle: 'Samanya Sadhana',
    description: 'General chanting for everyday sadhana and spiritual practice.',
    icon: 'add-circle-outline',
    color: '#F59E0B', // Radiant Amber
    bgLight: '#FFFBEB',
    borderColor: '#FDE68A',
    symbol: '⚡',
  },
  {
    id: 'bonus',
    title: 'Bonus Mala',
    hindiTitle: 'बोनस माला',
    subtitle: 'Spiritual Grace Blessings',
    description: 'Special grace Mala earned through unwavering devotion, milestones, and peer-to-peer offerings.',
    icon: 'gift-outline',
    color: '#10B981', // Vedic Emerald
    bgLight: '#ECFDF5',
    borderColor: '#A7F3D0',
    symbol: '🎁',
  },
  {
    id: 'daily_sankalp',
    title: 'Daily Sankalp',
    hindiTitle: 'दैनिक संकल्प',
    subtitle: 'Sacred Vow Discipline',
    description: 'Your sacred daily vow and unbroken routine of morning and evening mindful Japa sadhana.',
    icon: 'shield-checkmark-outline',
    color: '#0284C7', // Sky Blue Devotion
    bgLight: '#F0F9FF',
    borderColor: '#BAE6FD',
    symbol: '🌅',
  },
  {
    id: 'daily_21',
    title: 'Daily 21',
    hindiTitle: 'दैनिक 21',
    subtitle: '21 Bead Daily Practice',
    description: 'Daily 21-bead mala practice for a quick, focused and consistent spiritual sadhana.',
    icon: 'today-outline',
    color: '#E11D48', // Devotional Rose
    bgLight: '#FFF1F2',
    borderColor: '#FECDD3',
    symbol: '🌺',
  },
];

export type MalaPocketId = typeof MALA_POCKETS[number]['id'];

export interface DevoteePockets {
  divya_mahamala: number;
  jackpot: number;
  ram_ram: number;
  extra: number;
  bonus: number;
  daily_sankalp: number;
  daily_21: number;
}

export const DEFAULT_POCKETS: DevoteePockets = {
  divya_mahamala: 0,
  jackpot: 0,
  ram_ram: 0,
  extra: 0,
  bonus: 0,
  daily_sankalp: 0,
  daily_21: 0,
};
