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
}

export const AuthShowcase: React.FC<AuthShowcaseProps> = ({ compact = false }) => {
  // Animation states
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  // Step highlight cycle
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Pulsating halo behind the sacred Om badge
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 2400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(glowAnim, {
            toValue: 0.9,
            duration: 2400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 2400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      ])
    );
    pulseLoop.start();

    // Floating beads
    const float1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -10,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    const float2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 12,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    float1.start();
    float2.start();

    // Cycle through the steps every 3.5s
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3800);

    return () => {
      pulseLoop.stop();
      float1.stop();
      float2.stop();
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
      color: '#FF7A00',
    },
    {
      id: 1,
      stepNumber: '02',
      title: 'Earn & Accumulate Mala',
      subtitle: 'Spiritual Effort to Sacred Currency',
      description:
        'Each completed 108-bead round automatically credits 1 transferable Mala into your personal sanctuary wallet.',
      icon: 'gift-outline' as const,
      tag: 'Automatic Reward',
      color: '#D4AF37',
    },
    {
      id: 2,
      stepNumber: '03',
      title: 'Peer-to-Peer Offerings',
      subtitle: 'Double-Entry Sacred Ledger',
      description:
        'Gift and transfer sacred Mala to fellow seekers globally using their 6-digit Devotee ID (#108429) or username.',
      icon: 'paper-plane-outline' as const,
      tag: 'Instant & Immutable',
      color: '#10B981',
    },
    {
      id: 3,
      stepNumber: '04',
      title: 'Sanctuary & Community',
      subtitle: 'Global Vedic Fellowship',
      description:
        'Connect with devotees, share daily sadhana blessings, unlock sacred achievement badges, and grow together.',
      icon: 'heart-outline' as const,
      tag: 'Devotee Community',
      color: '#F59E0B',
    },
  ];

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeaderRow}>
          <View style={styles.compactOmWrapper}>
            <OmSymbol size={26} badgeSize={52} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.brandBadge}>
              <Ionicons name="sparkles" size={11} color="#B38F24" />
              <Text style={styles.brandBadgeText}>DIGITAL VEDIC SANCTUARY</Text>
            </View>
            <Text style={styles.compactTitle}>MALA (माला)</Text>
            <Text style={styles.compactSub}>Mindful Japa & Sacred Mala Transfer</Text>
          </View>
        </View>

        {/* Compact Step Indicator Pill */}
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

          {/* Dots */}
          <View style={styles.dotsRow}>
            {steps.map((s, idx) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setActiveStep(idx)}
                style={[
                  styles.dot,
                  activeStep === idx && {
                    backgroundColor: Colors.primary,
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
      {/* Background Decorative Aura Elements */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            transform: [{ scale: pulseAnim }],
            opacity: glowAnim,
          },
        ]}
      />

      {/* Floating beads */}
      <Animated.View
        style={[
          styles.floatingParticle1,
          { transform: [{ translateY: floatAnim1 }] },
        ]}
      >
        <Text style={{ fontSize: 20, opacity: 0.65 }}>📿</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingParticle2,
          { transform: [{ translateY: floatAnim2 }] },
        ]}
      >
        <Text style={{ fontSize: 18, opacity: 0.7 }}>✨</Text>
      </Animated.View>

      {/* Hero Branding Section */}
      <View style={styles.heroSection}>
        <View style={styles.omContainer}>
          <Animated.View
            style={[
              styles.omPulsingRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: glowAnim,
              },
            ]}
          />
          <OmSymbol size={44} badgeSize={84} />
        </View>

        <View style={styles.heroTextCol}>
          <View style={styles.brandBadge}>
            <Ionicons name="sparkles" size={12} color="#9A3412" />
            <Text style={styles.brandBadgeText}>SACRED DEVOTION & JAPA ECOSYSTEM</Text>
          </View>

          <Text style={styles.heroTitle}>MALA <Text style={styles.heroTitleHindi}>• माला</Text></Text>
          <Text style={styles.heroSubtitle}>
            Transform your spiritual practice with authentic bead chanting, instant peer-to-peer Mala offerings, and banking-grade ledger security.
          </Text>
        </View>
      </View>

      {/* Working Flow Title */}
      <View style={styles.flowHeaderRow}>
        <View style={styles.flowIconBox}>
          <Ionicons name="git-network-outline" size={16} color={Colors.primary} />
        </View>
        <Text style={styles.flowHeaderTitle}>How Devotee Sanctuary Works</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.livePillText}>Live Flow</Text>
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
                isActive && { borderColor: step.color },
              ]}
            >
              {/* Left Step Indicator */}
              <View style={styles.stepLeftCol}>
                <View
                  style={[
                    styles.stepBadge,
                    {
                      backgroundColor: isActive ? step.color : '#F3ECE2',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepBadgeText,
                      { color: isActive ? '#FFFFFF' : '#8A7B68' },
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
                      size={18}
                      color={isActive ? step.color : '#6B7280'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.stepTitle,
                        isActive && { color: '#1F2937', fontWeight: '800' },
                      ]}
                    >
                      {step.title}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.stepTag,
                      isActive && { backgroundColor: `${step.color}15` },
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

      {/* Devotee Perks & Trust Badges Row */}
      <View style={styles.trustBadgesRow}>
        <View style={styles.trustItem}>
          <Ionicons name="gift-outline" size={15} color="#FF7A00" />
          <Text style={styles.trustText}>108 Starter Mala</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Ionicons name="card-outline" size={15} color="#D4AF37" />
          <Text style={styles.trustText}>6-Digit Devotee ID</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark-outline" size={15} color="#10B981" />
          <Text style={styles.trustText}>Atlas Cloud Encrypted</Text>
        </View>
      </View>

      {/* Sacred Mantra Subhashita Footer */}
      <View style={styles.quoteCard}>
        <Text style={styles.sanskritQuote}>
          "ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय ।"
        </Text>
        <Text style={styles.quoteTranslation}>
          "Chant with mindfulness, share with devotion, and illuminate the collective divine path."
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  showcaseWrapper: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    position: 'relative',
  },
  glowOrb: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFE8D1',
    zIndex: -1,
  },
  floatingParticle1: {
    position: 'absolute',
    top: 25,
    right: 40,
  },
  floatingParticle2: {
    position: 'absolute',
    bottom: 50,
    left: 20,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 20,
  },
  omContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  omPulsingRing: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: '#FF7A00',
    backgroundColor: '#FFF4E5',
    zIndex: -1,
  },
  heroTextCol: {
    flex: 1,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9A3412',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  heroTitleHindi: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
    lineHeight: 19,
  },
  flowHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  flowIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 'auto',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  stepsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EFE9DF',
    shadowColor: '#C47D17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    transitionDuration: '250ms',
  } as any,
  stepCardActive: {
    backgroundColor: '#FFFCF8',
    borderColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    transform: [{ translateX: 4 }],
  },
  stepLeftCol: {
    alignItems: 'center',
    marginRight: 12,
    width: 32,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepConnectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5DCCE',
    marginTop: 6,
    borderRadius: 1,
  },
  stepBody: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  stepTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  stepTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  stepDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
  stepDescActive: {
    color: '#374151',
  },
  trustBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EDE5D8',
    marginBottom: 18,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  trustDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#DACDC0',
  },
  quoteCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF9F2',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    borderRadius: 8,
  },
  sanskritQuote: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C2D12',
    fontStyle: 'italic',
  },
  quoteTranslation: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 16,
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
    gap: 14,
    marginBottom: 12,
  },
  compactOmWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2937',
  },
  compactSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  compactStepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3E8D8',
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
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  compactStepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  compactStepDesc: {
    fontSize: 11,
    color: '#4B5563',
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
    backgroundColor: '#D1D5DB',
  },
});
