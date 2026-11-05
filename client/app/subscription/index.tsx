import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { apiClient } from '../../src/api/client';
import { useThemeStore } from '../../src/store/themeStore';

export default function SubscriptionScreen() {
  const { mode } = useThemeStore();
  const theme = Colors[mode];

  const [subData, setSubData] = useState<any>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const res: any = await apiClient.get('/subscriptions/current');
      if (res.data) setSubData(res.data);
    } catch {}
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      // Validates IAP receipt on backend
      const res: any = await apiClient.post('/subscriptions/upgrade', {
        platform: 'SYSTEM',
        purchaseToken: `token-iap-${Date.now()}`,
        productId: 'mala.premium.yearly',
      });

      Alert.alert('🌟 Premium Devotee Activated!', res.data?.message || 'Welcome to Devotee Premium.');
      fetchCurrentPlan();
    } catch (err: any) {
      Alert.alert('Upgrade Notice', err.response?.data?.message || 'Unable to complete purchase.');
    } finally {
      setUpgrading(false);
    }
  };

  const premiumFeatures = [
    'Advanced Mala Sadhana Analytics & Heatmaps',
    'Exclusive Rudraksha, Tulsi & Lotus Counter Themes',
    'Detailed Weekly & Monthly Devotion Practice Reports',
    'Golden Devotee Verified Profile Badge',
    'Custom Sacred Haptic Vibrations & Bells',
    'Priority Community Satsang Highlighting',
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Devotee Membership" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Golden Trophy Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroOmBadge}>
            <Text style={styles.heroOm}>🕉️</Text>
          </View>
          <Text style={styles.heroTitle}>MALA DEVOTEE PREMIUM</Text>
          <Text style={styles.heroSubtitle}>
            Deepen your spiritual sadhana with timeless sacred features
          </Text>
          <View style={styles.currentTierBadge}>
            <Text style={styles.currentTierText}>
              Current Status: {subData?.plan || 'FREE'} DEVOTEE
            </Text>
          </View>
        </View>

        {/* Feature Comparison */}
        <View style={[styles.featuresCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.featuresHeader, { color: theme.textPrimary }]}>
            What's Included in Premium
          </Text>

          {premiumFeatures.map((feat, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.accentGoldDark} />
              <Text style={[styles.featureText, { color: theme.textPrimary }]}>
                {feat}
              </Text>
            </View>
          ))}
        </View>

        {/* Pricing Plan Selector */}
        <View style={[styles.pricingCard, { backgroundColor: theme.surface, borderColor: Colors.accentGold }]}>
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>ANNUAL DEVOTION</Text>
          </View>
          <Text style={[styles.planTitle, { color: theme.textPrimary }]}>Annual Sadhana Pass</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceNumber, { color: Colors.primaryDark }]}>₹499</Text>
            <Text style={styles.pricePeriod}>/ year (₹41/mo)</Text>
          </View>
          <Text style={[styles.planNotes, { color: theme.textSecondary }]}>
            Includes full access to all themes, reports, and unlimited practice features.
          </Text>

          <TouchableOpacity
            onPress={handleUpgrade}
            disabled={upgrading || subData?.plan === 'PREMIUM'}
            style={[styles.upgradeBtn, (upgrading || subData?.plan === 'PREMIUM') && { opacity: 0.7 }]}
          >
            {upgrading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.upgradeBtnText}>
                {subData?.plan === 'PREMIUM' ? 'Active Premium Devotee ✨' : 'Unlock Sacred Premium'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.legalDisclaimer, { color: theme.textMuted }]}>
          * Important Spiritual Note: Mala points are non-cash spiritual activity units for personal devotion and cannot be purchased or redeemed for real money. Subscriptions unlock digital app themes and sadhana analytics.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#1E232A',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.accentGold,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroOmBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2A303C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroOm: {
    fontSize: 28,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.accentGold,
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 4,
  },
  currentTierBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  currentTierText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  featuresCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    gap: 12,
  },
  featuresHeader: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    flex: 1,
  },
  pricingCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  popularBadge: {
    backgroundColor: Colors.accentGold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 8,
  },
  priceNumber: {
    fontSize: 32,
    fontWeight: '900',
  },
  pricePeriod: {
    fontSize: 13,
    color: '#6B7280',
  },
  planNotes: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  legalDisclaimer: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
});

