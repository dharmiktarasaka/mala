import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../theme/colors';
import { useThemeStore } from '../store/themeStore';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack, rightAction }) => {
  const { mode, language, setLanguage, toggleTheme, t } = useThemeStore();
  const theme = Colors[mode];

  const cycleLanguage = () => {
    if (language === 'en') setLanguage('hi');
    else if (language === 'hi') setLanguage('gu');
    else setLanguage('en');
  };

  const langLabel = language === 'en' ? 'EN' : language === 'hi' ? 'हि' : 'ગુ';

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <View style={styles.omBadge}>
              <Text style={styles.omText}>🕉️</Text>
            </View>
            <Text style={[styles.brandTitle, { color: Colors.primary }]}>
              {title || t('appName')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        {rightAction ? (
          rightAction
        ) : (
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={cycleLanguage} style={[styles.langBadge, { borderColor: theme.border }]}>
              <Text style={[styles.langText, { color: Colors.primary }]}>{langLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
              <Ionicons
                name={mode === 'light' ? 'moon-outline' : 'sunny-outline'}
                size={22}
                color={theme.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/notifications' as any)}
              style={styles.iconButton}
            >
              <Ionicons name="notifications-outline" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  omBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  omText: {
    fontSize: 16,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: Colors.secondary,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    padding: 6,
  },
});

