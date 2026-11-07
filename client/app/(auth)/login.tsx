import React, { useState, useEffect } from 'react';
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

export default function LoginScreen() {
  const params = useLocalSearchParams<{ registeredEmail?: string }>();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registrationBanner, setRegistrationBanner] = useState('');

  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (params?.registeredEmail) {
      setIdentifier(params.registeredEmail);
      setRegistrationBanner(
        `Registration successful! Please enter your password to log in with ${params.registeredEmail}`,
      );
    }
  }, [params?.registeredEmail]);

  const handleLogin = async () => {
    const finalId = identifier.toLowerCase().trim();
    const finalPass = password;

    if (!finalId) {
      setErrorMsg('Please enter your email ID');
      return;
    }

    if (!finalPass) {
      setErrorMsg('Please enter your password');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res: any = await apiClient.post('/auth/login', {
        identifier: finalId,
        password: finalPass,
      });

      const payload = res.data || res;
      const user = payload.user || payload.data?.user;
      const accessToken = payload.accessToken || payload.data?.accessToken;
      const refreshToken = payload.refreshToken || payload.data?.refreshToken;

      if (!user || !accessToken) {
        throw new Error('Authentication data missing in response');
      }

      setAuth(user, accessToken, refreshToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Devotee Login</Text>
          <Text style={styles.subtitle}>Enter your sacred spiritual sanctuary</Text>
        </View>

        {/* Registration Welcome Banner */}
        {registrationBanner ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.successText}>{registrationBanner}</Text>
          </View>
        ) : null}

        {/* Error Banner */}
        {errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={Colors.error} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.errorText}>{errorMsg}</Text>
              {(errorMsg.toLowerCase().includes('register') || errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('invalid credentials')) ? (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/(auth)/register',
                      params: { initialEmail: identifier.trim() },
                    })
                  }
                  style={styles.registerPromptBtn}
                >
                  <Text style={styles.registerPromptBtnText}>Click here to Register this email first ➔</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email ID</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#FF7A00" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="devotee@example.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
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

          <TouchableOpacity
            onPress={handleLogin}
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

        {/* Register Prompt */}
        <View style={styles.registerPromptBox}>
          <Text style={styles.promptTitle}>Don't have an account?</Text>
          <Text style={styles.promptDesc}>
            Register with your email to start your spiritual journey.
          </Text>
          <TouchableOpacity
            style={styles.registerFirstBtn}
            onPress={() => router.push('/(auth)/register')}
          >
            <Ionicons name="person-add-outline" size={16} color={Colors.primary} />
            <Text style={styles.registerFirstBtnText}>Create Devotee Account</Text>
          </TouchableOpacity>
        </View>
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
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  successText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
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
  },
  registerPromptBtn: {
    backgroundColor: '#FFE4E6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  registerPromptBtnText: {
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
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
    marginTop: 6,
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
  registerPromptBox: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3E8D8',
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  promptDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  registerFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  registerFirstBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
});
