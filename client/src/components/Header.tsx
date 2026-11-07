import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../theme/colors';
import { useThemeStore } from '../store/themeStore';
import { OmSymbol } from './OmSymbol';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  fallbackRoute?: string;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack,
  onBack,
  fallbackRoute = '/(tabs)/wallet',
  rightAction,
}) => {
  const { mode, language, setLanguage, toggleTheme, t } = useThemeStore();
  const theme = Colors[mode];

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {}

    // On Web, try browser history back if available
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      window.history &&
      window.history.length > 1
    ) {
      window.history.back();
      return;
    }

    // Default safe fallback route
    router.replace(fallbackRoute as any);
  };

  const cycleLanguage = () => {
    if (language === 'en') setLanguage('hi');
    else if (language === 'hi') setLanguage('gu');
    else setLanguage('en');
  };

  const langLabel = language === 'en' ? 'EN' : language === 'hi' ? 'हि' : 'ગુ';

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        )}

        <View style={styles.brandRow}>
          {!showBack && <OmSymbol size={18} badgeSize={32} />}
          <Text
            style={[
              styles.brandTitle,
              {
                color: showBack ? theme.textPrimary : Colors.primary,
                fontSize: showBack ? 18 : 20,
              },
            ]}
            numberOfLines={1}
          >
            {title || t('appName')}
          </Text>
        </View>
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
  backButton: {
    padding: 6,
    marginRight: 8,
    borderRadius: 8,
  },
});


