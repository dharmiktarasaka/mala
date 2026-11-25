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
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { NarayanPresenceMedallion } from '../../src/components/NarayanPresenceLogo';
import { AuthShowcase } from '../../src/components/AuthShowcase';
import { WireframeBackground } from '../../src/components/WireframeBackground';

export default function RegisterScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 860;

  const params = useLocalSearchParams<{ initialEmail?: string; tab?: string }>();

  // Active form mode: 'register' | 'login'
  const [mode, setMode] = useState<'register' | 'login'>(
    params?.tab === 'login' ? 'login' : 'register'
  );

  // Register form states
  const [email, setEmail] = useState(params?.initialEmail || '');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  // Login form states (for instant in-panel toggle)
  const [loginEmail, setLoginEmail] = useState(params?.initialEmail || '');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Focused field tracker
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const setAuth = useAuthStore((s) => s.setAuth);

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // REGISTER
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
    if (!password || password.length < 6) {
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

  // LOGIN
  const handleLogin = async () => {
    const finalId = loginEmail.toLowerCase().trim();
    const finalPass = loginPass;

    if (!finalId) {
      setLoginError('Please enter your email ID');
      return;
    }
    if (!finalPass) {
      setLoginError('Please enter your password');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

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
      setLoginError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const proceedToSanctuary = () => {
    if (registeredUser) {
      setAuth(registeredUser.user, registeredUser.accessToken, registeredUser.refreshToken);
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.rootWrapper}>
      {/* High-tech Wireframe Saffron Background */}
      <WireframeBackground />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          isWide && styles.scrollContainerWide,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.mainLayout, isWide && styles.mainLayoutWide]}>
          {/* ================= LEFT SIDE: WORKING FLOW & EXPLANATION ================= */}
          {isWide ? (
            <View style={styles.leftColumn}>
              <AuthShowcase />
            </View>
          ) : (
            <AuthShowcase compact />
          )}

          {/* ================= RIGHT SIDE: AUTHENTICATION PANEL ================= */}
          <View style={styles.rightColumn}>
            <View style={styles.cardContainer}>
              {/* The Narayan Presence Card Header */}
              <View style={styles.cardBrandHeader}>
                <NarayanPresenceMedallion size={isWide ? 52 : 46} />
                <Text style={styles.cardBrandTitle}>
                  The Narayan <Text style={styles.cardBrandGold}>Presence</Text>
                </Text>
                <Text style={styles.cardBrandSub}>Official Devotee Sanctuary</Text>
              </View>

              {/* Segmented Mode Switcher */}
              <View style={styles.tabSwitcher}>
                <TouchableOpacity
                  onPress={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  style={[
                    styles.tabButton,
                    mode === 'register' && styles.tabButtonActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={16}
                    color={mode === 'register' ? '#FF7A00' : '#94A3B8'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabButtonText,
                      mode === 'register' && styles.tabButtonTextActive,
                    ]}
                  >
                    New Devotee
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setMode('login');
                    setLoginError('');
                  }}
                  style={[
                    styles.tabButton,
                    mode === 'login' && styles.tabButtonActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="log-in-outline"
                    size={16}
                    color={mode === 'login' ? '#FF7A00' : '#94A3B8'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabButtonText,
                      mode === 'login' && styles.tabButtonTextActive,
                    ]}
                  >
                    Devotee Login
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Subtitle */}
              <View style={styles.panelTitleBox}>
                <Text style={styles.panelTitle}>
                  {mode === 'register' ? 'Register as Devotee' : 'Enter Sacred Sanctuary'}
                </Text>
                <Text style={styles.panelSubtitle}>
                  {mode === 'register'
                    ? 'Join the global sangha and begin your authentic digital sadhana'
                    : 'Access your mindful sadhana, 6 pockets & sacred ledger'}
                </Text>
              </View>

              {/* ----------------- REGISTER FORM ----------------- */}
              {mode === 'register' && (
                <View style={styles.formContent}>
                  {registeredUser ? (
                    /* Celebration Success Box */
                    <View style={styles.regSuccessCard}>
                      <View style={styles.successIconBadge}>
                        <Ionicons name="checkmark-circle" size={44} color="#FF7A00" />
                      </View>
                      <Text style={styles.successTitle}>Devotee Account Created! 🙏</Text>
                      <Text style={styles.successSubtitle}>
                        Welcome to the sacred sangha,{' '}
                        <Text style={{ fontWeight: '800', color: '#FFFFFF' }}>
                          {registeredUser.user.displayName}
                        </Text>
                        !
                      </Text>

                      {/* Allocated 6-digit Devotee ID Badge */}
                      <View style={styles.allocatedIdBadge}>
                        <Ionicons name="card-outline" size={18} color="#FF7A00" />
                        <Text style={styles.allocatedIdText}>
                          Your Devotee ID: #{registeredUser.user.devoteeId || registeredUser.user.id}
                        </Text>
                      </View>

                      {/* Sacred Devotee Wallet Ready Notice */}
                      <View style={styles.starterMalaBanner}>
                        <Ionicons name="sparkles" size={16} color="#D4AF37" />
                        <Text style={styles.starterMalaText}>
                          6 Sacred Pockets initialized & ledger protected!
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.enterDirectlyBtn}
                        onPress={proceedToSanctuary}
                        activeOpacity={0.88}
                      >
                        <Text style={styles.enterDirectlyBtnText}>Enter Sanctuary Directly</Text>
                        <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.loginInsteadBtn}
                        onPress={() => {
                          setLoginEmail(registeredUser.user.email);
                          setRegisteredUser(null);
                          setMode('login');
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.loginInsteadBtnText}>Or Log In with Email</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      {/* Error Banner */}
                      {errorMsg ? (
                        <View style={styles.errorBox}>
                          <Ionicons name="alert-circle" size={18} color="#F87171" />
                          <Text style={styles.errorText}>{errorMsg}</Text>
                        </View>
                      ) : null}

                      {/* Sadhana Security Badge */}
                      <View style={styles.welcomeGiftBadge}>
                        <Ionicons name="shield-checkmark-outline" size={14} color="#FF7A00" />
                        <Text style={styles.welcomeGiftText}>
                          Authentic 108 sadhana • 6 pockets • Double-entry protected
                        </Text>
                      </View>

                      {/* Email Field */}
                      <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                          <Text style={styles.label}>Your Email ID *</Text>
                          <Text style={styles.labelHint}>Used to sign in</Text>
                        </View>
                        <View
                          style={[
                            styles.inputWrapper,
                            focusedField === 'email' && styles.inputWrapperFocused,
                          ]}
                        >
                          <Ionicons
                            name="mail-outline"
                            size={18}
                            color={focusedField === 'email' ? '#FF7A00' : '#94A3B8'}
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="devotee@example.com"
                            placeholderTextColor="#64748B"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </View>
                      </View>

                      {/* Full / Spiritual Name */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name / Spiritual Name *</Text>
                        <View
                          style={[
                            styles.inputWrapper,
                            focusedField === 'name' && styles.inputWrapperFocused,
                          ]}
                        >
                          <Ionicons
                            name="person-outline"
                            size={18}
                            color={focusedField === 'name' ? '#FF7A00' : '#94A3B8'}
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="e.g. Radha Devotee"
                            placeholderTextColor="#64748B"
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </View>
                      </View>

                      {/* Password */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password (Min 6 characters) *</Text>
                        <View
                          style={[
                            styles.inputWrapper,
                            focusedField === 'pass' && styles.inputWrapperFocused,
                          ]}
                        >
                          <Ionicons
                            name="lock-closed-outline"
                            size={18}
                            color={focusedField === 'pass' ? '#FF7A00' : '#94A3B8'}
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#64748B"
                            secureTextEntry={!showPassword}
                            onFocus={() => setFocusedField('pass')}
                            onBlur={() => setFocusedField(null)}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeBtn}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={18}
                              color="#94A3B8"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Optional Username */}
                      <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                          <Text style={styles.label}>Devotee Username (Optional)</Text>
                          <Text style={styles.labelHint}>Auto-created if empty</Text>
                        </View>
                        <View
                          style={[
                            styles.inputWrapper,
                            focusedField === 'user' && styles.inputWrapperFocused,
                          ]}
                        >
                          <Ionicons
                            name="at-outline"
                            size={18}
                            color={focusedField === 'user' ? '#FF7A00' : '#94A3B8'}
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="e.g. bhakt_radha"
                            placeholderTextColor="#64748B"
                            autoCapitalize="none"
                            autoCorrect={false}
                            onFocus={() => setFocusedField('user')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </View>
                      </View>

                      {/* Submit Register Button */}
                      <TouchableOpacity
                        onPress={handleRegister}
                        disabled={loading}
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                        activeOpacity={0.88}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <>
                            <Text style={styles.submitBtnText}>Register Devotee Account</Text>
                            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                          </>
                        )}
                      </TouchableOpacity>

                      {/* Quick Switch to Sign In */}
                      <View style={styles.bottomPrompt}>
                        <Text style={styles.promptDesc}>
                          Already registered?{' '}
                          <Text
                            style={styles.promptLink}
                            onPress={() => {
                              setMode('login');
                              setLoginError('');
                            }}
                          >
                            Log in with your email ➔
                          </Text>
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              )}

              {/* ----------------- LOGIN FORM ----------------- */}
              {mode === 'login' && (
                <View style={styles.formContent}>
                  {/* Error Banner */}
                  {loginError ? (
                    <View style={styles.errorBox}>
                      <Ionicons name="alert-circle" size={18} color="#F87171" />
                      <Text style={styles.errorText}>{loginError}</Text>
                    </View>
                  ) : null}

                  {/* Email Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Devotee Email ID</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === 'loginEmail' && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color={focusedField === 'loginEmail' ? '#FF7A00' : '#94A3B8'}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={loginEmail}
                        onChangeText={setLoginEmail}
                        placeholder="devotee@example.com"
                        placeholderTextColor="#64748B"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        onFocus={() => setFocusedField('loginEmail')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>

                  {/* Password Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedField === 'loginPass' && styles.inputWrapperFocused,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color={focusedField === 'loginPass' ? '#FF7A00' : '#94A3B8'}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={loginPass}
                        onChangeText={setLoginPass}
                        placeholder="••••••••"
                        placeholderTextColor="#64748B"
                        secureTextEntry={!showLoginPass}
                        onFocus={() => setFocusedField('loginPass')}
                        onBlur={() => setFocusedField(null)}
                      />
                      <TouchableOpacity
                        onPress={() => setShowLoginPass(!showLoginPass)}
                        style={styles.eyeBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showLoginPass ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="#94A3B8"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Submit Login Button */}
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loginLoading}
                    style={[styles.submitBtn, loginLoading && { opacity: 0.7 }]}
                    activeOpacity={0.88}
                  >
                    {loginLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.submitBtnText}>Enter Sanctuary</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Quick Switch to Register */}
                  <View style={styles.bottomPrompt}>
                    <Text style={styles.promptDesc}>
                      New to digital sadhana?{' '}
                      <Text
                        style={styles.promptLink}
                        onPress={() => {
                          setMode('register');
                          setErrorMsg('');
                        }}
                      >
                        Create Devotee Account ➔
                      </Text>
                    </Text>
                  </View>
                </View>
              )}

              {/* Trust Footer */}
              <View style={styles.cardFooter}>
                <Ionicons name="shield-checkmark" size={14} color="#FF7A00" />
                <Text style={styles.cardFooterText}>
                  The Narayan Presence • Encrypted Sacred Ledger
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: '#070A12',
    position: 'relative',
    minHeight: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: '100%',
  },
  scrollContainerWide: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  mainLayout: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  mainLayoutWide: {
    flexDirection: 'row',
    maxWidth: 1160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  leftColumn: {
    flex: 1.15,
    maxWidth: 600,
  },
  rightColumn: {
    flex: 0.95,
    width: '100%',
    maxWidth: 480,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: 'rgba(13, 21, 38, 0.92)',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 122, 0, 0.22)',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(20px)' } as any)
      : {}),
  },
  cardBrandHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardBrandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 6,
    letterSpacing: -0.2,
    fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : undefined,
  },
  cardBrandGold: {
    color: '#D4AF37',
    fontStyle: 'italic',
  },
  cardBrandSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 122, 0, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.45)',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabButtonTextActive: {
    color: '#FFA347',
    fontWeight: '800',
  },
  panelTitleBox: {
    marginBottom: 18,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  panelSubtitle: {
    fontSize: 12.5,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  formContent: {
    gap: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 4,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  welcomeGiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 122, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  welcomeGiftText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFA347',
  },
  inputGroup: {
    gap: 5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  labelHint: {
    fontSize: 10,
    color: '#64748B',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    ...(Platform.OS === 'web'
      ? ({ transition: 'border-color 0.2s, background-color 0.2s' } as any)
      : {}),
  },
  inputWrapperFocused: {
    borderColor: '#FF7A00',
    backgroundColor: 'rgba(255, 122, 0, 0.08)',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
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
    backgroundColor: '#FF7A00',
    height: 48,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  bottomPrompt: {
    marginTop: 10,
    alignItems: 'center',
  },
  promptDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  promptLink: {
    color: '#FFA347',
    fontWeight: '800',
  },
  regSuccessCard: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  successIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 122, 0, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFA347',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
  },
  allocatedIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 122, 0, 0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 122, 0, 0.45)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    width: '100%',
    justifyContent: 'center',
  },
  allocatedIdText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFA347',
  },
  starterMalaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  starterMalaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FDE68A',
  },
  enterDirectlyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF7A00',
    height: 48,
    borderRadius: 12,
    width: '100%',
    marginTop: 4,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  enterDirectlyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  loginInsteadBtn: {
    paddingVertical: 6,
  },
  loginInsteadBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardFooterText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
});
