import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'flower',
    title: 'Count Your Daily Mala Digitally',
    desc: 'Perform your sacred japa and meditation with peaceful digital beads, gentle haptics, and custom counting targets.',
  },
  {
    icon: 'send',
    title: 'Send & Receive Mala From Friends',
    desc: 'Share your counted spiritual blessings through an ultra-secure, double-entry banking ledger wallet.',
  },
  {
    icon: 'people',
    title: 'Build Your Spiritual Community',
    desc: 'Connect with fellow seekers, share your daily sadhana achievements, and engage in mindful satsang.',
  },
  {
    icon: 'trophy',
    title: 'Track Your Journey & Milestones',
    desc: 'Earn sacred badges from 108 Mala to 10,000 milestones with daily consistency streaks.',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      {/* Top Brand Logo */}
      <View style={styles.topHeader}>
        <View style={styles.logoBadge}>
          <Text style={styles.omSymbol}>🕉️</Text>
        </View>
        <Text style={styles.brandTitle}>MALA</Text>
        <Text style={styles.brandTagline}>Sacred Digital Devotion</Text>
      </View>

      {/* Main Slide Card */}
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name={slide.icon as any} size={54} color={Colors.primary} />
        </View>

        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDesc}>{slide.desc}</Text>

        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentSlide
                  ? { backgroundColor: Colors.primary, width: 24 }
                  : { backgroundColor: '#E0E0E0' },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomSection}>
        <TouchableOpacity onPress={nextSlide} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.authLinksRow}>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.linkText}>Existing Devotee? <Text style={styles.linkBold}>Login</Text></Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
            <Text style={[styles.linkText, { color: Colors.primary }]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    justifyContent: 'space-between',
    padding: 24,
  },
  topHeader: {
    alignItems: 'center',
    marginTop: 36,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  omSymbol: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primaryDark,
    letterSpacing: 2,
    marginTop: 10,
  },
  brandTagline: {
    fontSize: 13,
    color: '#8A6D1C',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0E5D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#FFE0B2',
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  slideDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomSection: {
    gap: 16,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  authLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  linkText: {
    fontSize: 13,
    color: '#6B7280',
  },
  linkBold: {
    fontWeight: '700',
    color: Colors.primaryDark,
  },
});

