import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';

import { NARAYAN_LOGO_DATA_URI } from './narayanLogoData';

interface NarayanPresenceMedallionProps {
  size?: number;
  pulse?: boolean;
}

export const NarayanPresenceMedallion: React.FC<NarayanPresenceMedallionProps> = ({
  size = 56,
  pulse = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(glowAnim, {
            toValue: 0.85,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const haloSize = size + 16;

  return (
    <View style={[styles.medallionOuter, { width: haloSize, height: haloSize }]}>
      {/* Radiant Golden Aura Halo */}
      {pulse && (
        <Animated.View
          style={[
            styles.haloRing,
            {
              width: haloSize,
              height: haloSize,
              borderRadius: haloSize / 2,
              transform: [{ scale: pulseAnim }],
              opacity: glowAnim,
            },
          ]}
        />
      )}

      {/* Luxury Golden Rimmed Medallion */}
      <View
        style={[
          styles.medallionFrame,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Image
          source={{ uri: NARAYAN_LOGO_DATA_URI }}
          style={{
            width: size * 0.95,
            height: size * 0.95,
            borderRadius: (size * 0.95) / 2,
          }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

interface NarayanPresenceHeaderProps {
  align?: 'left' | 'center';
  compact?: boolean;
}

export const NarayanPresenceHeader: React.FC<NarayanPresenceHeaderProps> = ({
  align = 'left',
  compact = false,
}) => {
  const isCenter = align === 'center';

  return (
    <View
      style={[
        styles.headerContainer,
        isCenter && { alignItems: 'center', textAlign: 'center' },
      ]}
    >
      <View style={[styles.headerRow, isCenter && { justifyContent: 'center' }]}>
        <NarayanPresenceMedallion size={compact ? 44 : 58} />

        <View style={[styles.titleCol, isCenter && { alignItems: 'center' }]}>
          {/* Subtitle tag */}
          <View style={styles.sacredTag}>
            <View style={styles.tagDot} />
            <Text style={styles.sacredTagText}>SACRED VEDIC SANCTUARY</Text>
          </View>

          {/* Grand Brand Name */}
          <Text style={[styles.brandTitleText, compact && { fontSize: 20 }]}>
            The Narayan <Text style={styles.brandTitleGold}>Presence</Text>
          </Text>

          <Text style={styles.brandSubtitle}>
            Mindful Sadhana • 6 Sacred Pockets • Digital Japa
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  medallionOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  haloRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#FFA347',
    backgroundColor: 'rgba(255, 122, 0, 0.14)',
  },
  medallionFrame: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  titleCol: {
    flex: 1,
  },
  sacredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 122, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FF7A00',
  },
  sacredTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFA347',
    letterSpacing: 0.8,
  },
  brandTitleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : undefined,
  },
  brandTitleGold: {
    color: '#D4AF37',
    fontStyle: 'italic',
  },
  brandSubtitle: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
});
