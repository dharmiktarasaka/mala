import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { OmSymbol } from './OmSymbol';

interface AuthShowcaseProps {
  compact?: boolean;
  onExploreClick?: () => void;
}

export const AuthShowcase: React.FC<AuthShowcaseProps> = ({
  compact = false,
  onExploreClick,
}) => {
  // Animation states
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  // Step highlight cycle
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Pulsating halo behind the sacred Om badge
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 2600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(glowAnim, {
            toValue: 0.85,
            duration: 2600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 2600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ])
    );
    pulseLoop.start();

    // Floating particles
    const float1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -8,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    float1.start();

    // Cycle through the steps every 4s
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4200);

    return () => {
      pulseLoop.stop();
      float1.stop();
      clearInterval(stepTimer);
    };
  }, []);

  const steps = [
    {
      id: 0,
      stepNumber: '01',
      title: 'Sacred Japa Counter',
      subtitle: 'Mindful 108 Bead Meditation',
      description:
        'Chant with authentic haptic bead feedback, traditional temple chimes, and automatic daily streak recording.',
      icon: 'flower-outline' as const,
      tag: '108 Beads = 1 Mala',
      color: '#4ADE80',
    },
    {
      id: 1,
      stepNumber: '02',
      title: '6 Sacred Mala Pockets',
      subtitle: 'Divya Mahamala, Jackpot, Ram-Ram & More',
      description:
        'Store and balance your malas across 6 dedicated spiritual pockets: Mahamala, Jackpot, Ram-Ram, Extra, Bonus, and Daily Sankalp.',
      icon: 'wallet-outline' as const,
      tag: '6 Sacred Pockets',
      color: '#F59E0B',
    },
    {
      id: 2,
      stepNumber: '03',
      title: 'Date-wise Sadhana Calendar',
      subtitle: 'Historical Log & Visual Progress',
      description:
        'Record every day’s completed rounds on an interactive calendar. Review your streaks, total beads chanted, and personal spiritual notes.',
      icon: 'calendar-outline' as const,
      tag: 'Daily Calendar',
      color: '#38BDF8',
    },
    {
      id: 3,
      stepNumber: '04',
      title: 'Peer-to-Peer Offerings',
      subtitle: 'Double-Entry Sacred Ledger',
      description:
        'Gift and transfer sacred Mala to fellow seekers globally using their 6-digit Devotee ID (#108429) or username with immutable history.',
      icon: 'paper-plane-outline' as const,
      tag: 'Instant & Immutable',
      color: '#A855F7',
    },
  ];

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {/* Top Glass Pill Badge */}
        <View style={styles.topBadgePill}>
          <View style={styles.glowingDot} />
          <Text style={styles.topBadgeText}>THE SACRED SANCTUARY & DEVOTEE ENGINE</Text>
        </View>

        <View style={styles.compactHeaderRow}>
          <View style={styles.compactOmWrapper}>
            <OmSymbol size={26} badgeSize={50} color="#4ADE80" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.compactTitle}>
              Digital Sadhana <Text style={styles.limeItalicText}>& Devotion</Text>
            </Text>
            <Text style={styles.compactSub}>Mindful Japa • 6 Pockets • Sadhana Calendar</Text>
          </View>
        </View>

        {/* Compact Step Indicator Card */}
        <View style={styles.compactStepCard}>
          <View style={styles.compactStepHeader}>
            <View
              style={[
                styles.stepNumberBadge,
                { backgroundColor: steps[activeStep].color },
              ]}
            >
              <Text style={styles.stepNumberText}>{steps[activeStep].stepNumber}</Text>
            </View>
            <Text style={styles.compactStepTitle}>{steps[activeStep].title}</Text>
          </View>
          <Text style={styles.compactStepDesc}>{steps[activeStep].description}</Text>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {steps.map((s, idx) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setActiveStep(idx)}
                style={[
                  styles.dot,
                  activeStep === idx && {
                    backgroundColor: '#4ADE80',
                    width: 20,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.showcaseWrapper}>
      {/* Top Glass Pill Badge (Identical to Screenshot) */}
      <View style={styles.topBadgePill}>
        <View style={styles.glowingDot} />
        <Text style={styles.topBadgeText}>THE SACRED SANCTUARY & DEVOTEE ENGINE</Text>
      </View>

      {/* Main Bold Headline Section matching Screenshot Typography */}
      <View style={styles.heroSection}>
        <Text style={styles.mainHeadline}>Digital Sadhana for Devotees</Text>
        <Text style={styles.subHeadlineScript}>
          who want to be{' '}
          <Text style={styles.limeItalicHighlight}>centered, connected & blessed.</Text>
        </Text>

        <Text style={styles.heroDescription}>
          Count authentic 108 beads with live audio & haptics. Store malas across 6 sacred
          pockets, track daily progress on your Sadhana Calendar, and offer malas seamlessly with
          immutable ledger security.
        </Text>
      </View>

      {/* Devotee Perks & Trust Badges Row */}
      <View style={styles.trustBadgesRow}>
        <View style={styles.trustItem}>
          <Ionicons name="sparkles" size={14} color="#4ADE80" />
          <Text style={styles.trustText}>Authentic 108 Sadhana</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Ionicons name="wallet-outline" size={14} color="#F59E0B" />
          <Text style={styles.trustText}>6 Sacred Pockets</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark" size={14} color="#38BDF8" />
          <Text style={styles.trustText}>Encrypted Ledger</Text>
        </View>
      </View>

      {/* Working Flow Section Header */}
      <View style={styles.flowHeaderRow}>
        <View style={styles.flowIconBox}>
          <Ionicons name="git-network-outline" size={14} color="#4ADE80" />
        </View>
        <Text style={styles.flowHeaderTitle}>How Devotee Sanctuary Works</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.livePillText}>Live Ecosystem</Text>
        </View>
      </View>

      {/* 4 Interactive Flow Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          return (
            <TouchableOpacity
              key={step.id}
              activeOpacity={0.88}
              onPress={() => setActiveStep(idx)}
              style={[
                styles.stepCard,
                isActive && styles.stepCardActive,
                isActive && { borderColor: `${step.color}90` },
              ]}
            >
              {/* Left Step Badge */}
              <View style={styles.stepLeftCol}>
                <View
                  style={[
                    styles.stepBadge,
                    {
                      backgroundColor: isActive ? step.color : 'rgba(255, 255, 255, 0.08)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepBadgeText,
                      { color: isActive ? '#052E16' : '#94A3B8' },
                    ]}
                  >
                    {step.stepNumber}
                  </Text>
                </View>

                {idx < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepConnectorLine,
                      isActive && { backgroundColor: step.color },
                    ]}
                  />
                )}
              </View>

              {/* Right Step Body */}
              <View style={styles.stepBody}>
                <View style={styles.stepTitleRow}>
                  <View style={styles.stepTitleLeft}>
                    <Ionicons
                      name={step.icon}
                      size={16}
                      color={isActive ? step.color : '#94A3B8'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.stepTitle,
                        isActive && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      {step.title}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.stepTag,
                      isActive && { backgroundColor: `${step.color}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepTagText,
                        isActive && { color: step.color },
                      ]}
                    >
                      {step.tag}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.stepDesc,
                    isActive && styles.stepDescActive,
                  ]}
                  numberOfLines={isActive ? 3 : 2}
                >
                  {step.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sacred Mantra Subhashita Footer */}
      <View style={styles.quoteCard}>
        <Text style={styles.sanskritQuote}>
          "ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ।"
        </Text>
        <Text style={styles.quoteTranslation}>
          "Lead us from darkness to light. Chant with mindfulness, store in devotion, illuminate the path."
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  showcaseWrapper: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    position: 'relative',
    maxWidth: 620,
  },

  // Top Glass Pill Badge matching screenshot
  topBadgePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(10px)' } as any)
      : {}),
  },
  glowingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 1.2,
  },

  // Main Headline Section
  heroSection: {
    marginBottom: 22,
  },
  mainHeadline: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    lineHeight: 42,
  },
  subHeadlineScript: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: 38,
    marginTop: 2,
  },
  limeItalicHighlight: {
    color: '#4ADE80',
    fontStyle: 'italic',
    fontWeight: '900',
    textShadowColor: 'rgba(74, 222, 128, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  heroDescription: {
    fontSize: 13.5,
    color: '#94A3B8',
    marginTop: 12,
    lineHeight: 21,
  },

  // Trust Badges Row
  trustBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(10px)' } as any)
      : {}),
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  trustDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  // Flow Section Header
  flowHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  flowIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E2E8F0',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 'auto',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4ADE80',
  },

  // Flow Steps List
  stepsContainer: {
    gap: 10,
    marginBottom: 18,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(12px)',
          transition: 'all 0.25s ease',
        } as any)
      : {}),
  },
  stepCardActive: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: '#4ADE80',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    transform: [{ translateX: 4 }],
  },
  stepLeftCol: {
    alignItems: 'center',
    marginRight: 10,
    width: 28,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  stepConnectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
    borderRadius: 1,
  },
  stepBody: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  stepTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  stepTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  stepTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepDesc: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },
  stepDescActive: {
    color: '#CBD5E1',
  },

  // Quote
  quoteCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderLeftWidth: 3,
    borderLeftColor: '#4ADE80',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sanskritQuote: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#4ADE80',
    fontStyle: 'italic',
  },
  quoteTranslation: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },

  // Compact Mobile Styles
  compactContainer: {
    padding: 16,
    paddingBottom: 8,
    width: '100%',
    maxWidth: 480,
  },
  compactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  compactOmWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  limeItalicText: {
    color: '#4ADE80',
    fontStyle: 'italic',
  },
  compactSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  compactStepCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  compactStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#052E16',
    fontSize: 10,
    fontWeight: '900',
  },
  compactStepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  compactStepDesc: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
