import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('user_a');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async (idToUse?: string, passToUse?: string) => {
    const finalId = idToUse || identifier;
    const finalPass = passToUse || password;

    if (!finalId || !finalPass) {
      setErrorMsg('Please enter both username and password');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res: any = await apiClient.post('/auth/login', {
        identifier: finalId,
        password: finalPass,
      });

      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const quickLoginAs = (userKey: 'user_a' | 'user_b' | 'user_c' | 'admin_devotee') => {
    const pass = userKey === 'admin_devotee' ? 'AdminPass@108' : 'Password@123';
    setIdentifier(userKey);
    setPassword(pass);
    handleLogin(userKey, pass);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.omBadge}>
          <Text style={styles.omSymbol}>🕉️</Text>
        </View>
        <Text style={styles.title}>Devotee Login</Text>
        <Text style={styles.subtitle}>Enter your sacred sanctuary</Text>
      </View>

      {/* Error Banner */}
      {errorMsg ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color={Colors.error} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Form Fields */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username, Email or Phone</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="e.g. user_a"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleLogin()}
          disabled={loading}
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Enter Sanctuary</Text>
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick 1-Click Test Devotee Accounts for Pair Programming & Demo */}
      <View style={styles.quickLoginSection}>
        <Text style={styles.quickLoginHeader}>1-CLICK TEST DEVOTEE PROFILES</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            onPress={() => quickLoginAs('user_a')}
            style={[styles.quickCard, { borderColor: Colors.primary }]}
          >
            <Text style={styles.quickRole}>User A (Arjun)</Text>
            <Text style={styles.quickBal}>100 Mala</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => quickLoginAs('user_b')}
            style={[styles.quickCard, { borderColor: Colors.accentGold }]}
          >
            <Text style={styles.quickRole}>User B (Bhakti)</Text>
            <Text style={styles.quickBal}>50 Mala</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => quickLoginAs('user_c')}
            style={[styles.quickCard, { borderColor: '#9E9E9E' }]}
          >
            <Text style={styles.quickRole}>User C (Chetan)</Text>
            <Text style={styles.quickBal}>0 Mala</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => quickLoginAs('admin_devotee')}
            style={[styles.quickCard, { borderColor: Colors.success }]}
          >
            <Text style={styles.quickRole}>Platform Admin</Text>
            <Text style={[styles.quickBal, { color: Colors.success }]}>Vault</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Register Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>New Devotee? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.footerLink}>Create a Sacred Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFDF9',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  omBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.secondary,
    borderWidth: 1.5,
    borderColor: Colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  omSymbol: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.errorLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    flex: 1,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  eyeBtn: {
    padding: 4,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  quickLoginSection: {
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EBE5DC',
  },
  quickLoginHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6D1C',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  quickCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  quickRole: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  quickBal: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});

