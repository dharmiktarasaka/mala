import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { OmSymbol } from '../../src/components/OmSymbol';

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ initialEmail?: string }>();
  const [email, setEmail] = useState(params?.initialEmail || '');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const setAuth = useAuthStore((s) => s.setAuth);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleRegister = async () => {
    setErrorMsg('');

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = displayName.trim();

    if (!cleanEmail) {
      setErrorMsg('Please enter your email ID');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address (e.g. devotee@example.com)');
      return;
    }

    if (!cleanName) {
      setErrorMsg('Please enter your full name or spiritual name');
      return;
    }

    if (!password) {
      setErrorMsg('Please create a password');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res: any = await apiClient.post('/auth/register', {
        email: cleanEmail,
        displayName: cleanName,
        password,
        username: username.trim() ? username.toLowerCase().trim() : undefined,
      });

      const payload = res.data || res;
      const user = payload.user || payload.data?.user;
      const accessToken = payload.accessToken || payload.data?.accessToken;
      const refreshToken = payload.refreshToken || payload.data?.refreshToken;

      if (!user) {
        throw new Error('User details could not be retrieved from registration response');
      }

      setRegisteredUser({ user, accessToken, refreshToken });
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setErrorMsg('The cloud server is waking up. Please click "Register Devotee Account" once more! 🙏');
      } else {
        const msg = err.response?.data?.message || err.message || 'Registration failed';
        setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const proceedToSanctuary = () => {
    if (registeredUser) {
      setAuth(registeredUser.user, registeredUser.accessToken, registeredUser.refreshToken);
      router.replace('/(tabs)');
    }
  };

  const proceedToLogin = () => {
    router.push({
      pathname: '/(auth)/login',
      params: { registeredEmail: email.toLowerCase().trim() },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.cardContainer}>
        {/* Brand Header */}
        <View style={styles.header}>
          <OmSymbol size={32} badgeSize={64} />
          <Text style={styles.title}>Register as Devotee</Text>
          <Text style={styles.subtitle}>
            Create your account to start your digital sadhana
          </Text>
        </View>

        {/* Success Celebration Card */}
        {registeredUser ? (
          <View style={styles.successBox}>
            <View style={styles.successIconBadge}>
              <Ionicons name="checkmark-circle" size={44} color={Colors.success} />
            </View>
            <Text style={styles.successTitle}>Registration Successful! 🙏</Text>
            <Text style={styles.successDesc}>
              Welcome, <Text style={{ fontWeight: '700' }}>{registeredUser.user.displayName}</Text>!{'\n'}
              Your devotee account has been created for{'\n'}
              <Text style={{ fontWeight: '700', color: Colors.primaryDark }}>
                {registeredUser.user.email}
              </Text>
            </Text>

            <View style={styles.successActionColumn}>
              <TouchableOpacity style={styles.loginNowBtn} onPress={proceedToLogin}>
                <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                <Text style={styles.loginNowBtnText}>Log In with My Email</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.directEntryBtn} onPress={proceedToSanctuary}>
                <Text style={styles.directEntryBtnText}>Enter Sanctuary Directly ➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Form Fields */}
            <View style={styles.form}>
              {/* 1. Email ID (Required) */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Your Email ID *</Text>
                  <Text style={styles.labelHint}>Used to log in</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color="#FF7A00" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="devotee@example.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* 2. Full Name / Display Name (Required) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name / Spiritual Name *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="e.g. Radha Devotee"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* 3. Password (Required) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password (Min 6 characters) *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 4. Username (Optional) */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Devotee Username (Optional)</Text>
                  <Text style={styles.labelHint}>Auto-created if empty</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons name="at-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="e.g. bhakt_radha (optional)"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Submit Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Register Devotee Account</Text>
                    <Ionicons name="arrow-forward-outline" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer Link to Login */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already registered? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.footerLink}>Log in with your Email</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#F3E8D8',
    shadowColor: '#C47D17',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
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
  successBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginVertical: 10,
  },
  successIconBadge: {
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  successActionColumn: {
    width: '100%',
    gap: 12,
  },
  loginNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  loginNowBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  directEntryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  directEntryBtnText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  labelHint: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF9',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
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
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          outline: 'none',
          boxShadow: 'none',
        } as any)
      : {}),
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
