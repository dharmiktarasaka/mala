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
  Animated,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme/colors';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { OmSymbol } from '../../src/components/OmSymbol';
import { AuthShowcase } from '../../src/components/AuthShowcase';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 860;

  const params = useLocalSearchParams<{ registeredEmail?: string; tab?: string }>();

  // Active form mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>(
    params?.tab === 'register' ? 'register' : 'login'
  );

  // Login form states
  const [identifier, setIdentifier] = useState(params?.registeredEmail || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState('');
  const [registrationBanner, setRegistrationBanner] = useState('');

  // Register form states
  const [regEmail, setRegEmail] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regErrorMsg, setRegErrorMsg] = useState('');
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  // Focused input states for subtle glowing borders
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (params?.registeredEmail) {
      setIdentifier(params.registeredEmail);
      setRegistrationBanner(
        `Registration successful! Enter your password to enter your sanctuary.`
      );
      setMode('login');
    }
  }, [params?.registeredEmail]);

  // LOGIN HANDLER
  const handleLogin = async () => {
    const finalId = identifier.toLowerCase().trim();
    const finalPass = loginPassword;

    if (!finalId) {
      setLoginErrorMsg('Please enter your devotee email ID');
      return;
    }
    if (!finalPass) {
      setLoginErrorMsg('Please enter your password');
      return;
    }

    setLoginLoading(true);
    setLoginErrorMsg('');

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
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setLoginErrorMsg('The cloud server is waking up. Please click "Enter Sanctuary" once more! 🙏');
      } else {
        const msg = err.response?.data?.message || err.message || 'Login failed';
        setLoginErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // REGISTER HANDLER
  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleRegister = async () => {
    setRegErrorMsg('');
    const cleanEmail = regEmail.toLowerCase().trim();
    const cleanName = regDisplayName.trim();

    if (!cleanEmail) {
      setRegErrorMsg('Please enter your email ID');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setRegErrorMsg('Please enter a valid email address (e.g. devotee@example.com)');
      return;
    }
    if (!cleanName) {
      setRegErrorMsg('Please enter your full name or spiritual name');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegErrorMsg('Password must be at least 6 characters');
      return;
    }

    setRegLoading(true);
    try {
      const res: any = await apiClient.post('/auth/register', {
        email: cleanEmail,
        displayName: cleanName,
        password: regPassword,
        username: regUsername.trim() ? regUsername.toLowerCase().trim() : undefined,
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
        setRegErrorMsg('The cloud server is waking up. Please click "Register Devotee Account" once more! 🙏');
      } else {
        const msg = err.response?.data?.message || err.message || 'Registration failed';
        setRegErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    } finally {
      setRegLoading(false);
    }
  };

  const proceedToSanctuary = () => {
    if (registeredUser) {
      setAuth(registeredUser.user, registeredUser.accessToken, registeredUser.refreshToken);
      router.replace('/(tabs)');
    }
  };

  return (
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
            {/* Header Om badge on Mobile / Top Branding */}
            {!isWide && (
              <View style={styles.mobileOmHeader}>
                <OmSymbol size={28} badgeSize={58} />
              </View>
            )}

            {/* Segmented Mode Switcher */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                onPress={() => {
                  setMode('login');
                  setLoginErrorMsg('');
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
                  color={mode === 'login' ? Colors.primary : '#6B7280'}
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

              <TouchableOpacity
                onPress={() => {
                  setMode('register');
                  setRegErrorMsg('');
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
                  color={mode === 'register' ? Colors.primary : '#6B7280'}
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
            </View>

            {/* Subtitle */}
            <View style={styles.panelTitleBox}>
              <Text style={styles.panelTitle}>
                {mode === 'login' ? 'Enter Sacred Sanctuary' : 'Register as Devotee'}
              </Text>
              <Text style={styles.panelSubtitle}>
                {mode === 'login'
                  ? 'Access your mindful sadhana, digital mala & sacred ledger'
                  : 'Start your authentic digital sadhana with live bead counting & sacred pockets'}
              </Text>
            </View>

            {/* ----------------- LOGIN FORM ----------------- */}
            {mode === 'login' && (
              <View style={styles.formContent}>
                {/* Registration Welcome Banner */}
                {registrationBanner ? (
                  <View style={styles.successBox}>
                    <Ionicons name="checkmark-circle" size={18} color="#166534" />
                    <Text style={styles.successText}>{registrationBanner}</Text>
                  </View>
                ) : null}

                {/* Error Banner */}
                {loginErrorMsg ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color={Colors.error} />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.errorText}>{loginErrorMsg}</Text>
                      {loginErrorMsg.toLowerCase().includes('register') ||
                      loginErrorMsg.toLowerCase().includes('not found') ? (
                        <TouchableOpacity
                          onPress={() => {
                            setRegEmail(identifier.trim());
                            setMode('register');
                          }}
                          style={styles.registerPromptBtn}
                        >
                          <Text style={styles.registerPromptBtnText}>
                            Click here to Register this email first ➔
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
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
                      color={focusedField === 'loginEmail' ? Colors.primary : '#9CA3AF'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={identifier}
                      onChangeText={setIdentifier}
                      placeholder="devotee@example.com"
                      placeholderTextColor="#9CA3AF"
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
                      color={focusedField === 'loginPass' ? Colors.primary : '#9CA3AF'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showLoginPassword}
                      onFocus={() => setFocusedField('loginPass')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowLoginPassword(!showLoginPassword)}
                      style={styles.eyeBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showLoginPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color="#6B7280"
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

                {/* Quick Toggle to Register */}
                <View style={styles.bottomPrompt}>
                  <Text style={styles.promptDesc}>
                    New to digital sadhana?{' '}
                    <Text
                      style={styles.promptLink}
                      onPress={() => {
                        setMode('register');
                        setRegErrorMsg('');
                      }}
                    >
                      Create Devotee Account ➔
                    </Text>
                  </Text>
                </View>
              </View>
            )}

            {/* ----------------- REGISTER FORM ----------------- */}
            {mode === 'register' && (
              <View style={styles.formContent}>
                {registeredUser ? (
                  /* Celebration Success Box */
                  <View style={styles.regSuccessCard}>
                    <View style={styles.successIconBadge}>
                      <Ionicons name="checkmark-circle" size={44} color="#166534" />
                    </View>
                    <Text style={styles.successTitle}>Devotee Account Created! 🙏</Text>
                    <Text style={styles.successSubtitle}>
                      Welcome to the sacred sangha,{' '}
                      <Text style={{ fontWeight: '800' }}>
                        {registeredUser.user.displayName}
                      </Text>
                      !
                    </Text>

                    {/* Allocated 6-digit Devotee ID Badge */}
                    <View style={styles.allocatedIdBadge}>
                      <Ionicons name="card-outline" size={18} color="#9A3412" />
                      <Text style={styles.allocatedIdText}>
                        Your Devotee ID: #{registeredUser.user.devoteeId || registeredUser.user.id}
                      </Text>
                    </View>

                    {/* Sacred Devotee Wallet Ready Notice */}
                    <View style={styles.starterMalaBanner}>
                      <Ionicons name="sparkles" size={16} color="#FF7A00" />
                      <Text style={styles.starterMalaText}>
                        Sacred Devotee Wallet initialized & double-entry protected!
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
                        setIdentifier(registeredUser.user.email);
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
                    {regErrorMsg ? (
                      <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={18} color={Colors.error} />
                        <Text style={styles.errorText}>{regErrorMsg}</Text>
                      </View>
                    ) : null}

                    {/* Sadhana Security Badge */}
                    <View style={styles.welcomeGiftBadge}>
                      <Ionicons name="shield-checkmark-outline" size={14} color="#9A3412" />
                      <Text style={styles.welcomeGiftText}>
                        Authentic digital sadhana • Double-entry ledger protected
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
                          focusedField === 'regEmail' && styles.inputWrapperFocused,
                        ]}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={18}
                          color={focusedField === 'regEmail' ? Colors.primary : '#9CA3AF'}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          value={regEmail}
                          onChangeText={setRegEmail}
                          placeholder="devotee@example.com"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          onFocus={() => setFocusedField('regEmail')}
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
                          focusedField === 'regName' && styles.inputWrapperFocused,
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color={focusedField === 'regName' ? Colors.primary : '#9CA3AF'}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          value={regDisplayName}
                          onChangeText={setRegDisplayName}
                          placeholder="e.g. Radha Devotee"
                          placeholderTextColor="#9CA3AF"
                          onFocus={() => setFocusedField('regName')}
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
                          focusedField === 'regPass' && styles.inputWrapperFocused,
                        ]}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={18}
                          color={focusedField === 'regPass' ? Colors.primary : '#9CA3AF'}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          value={regPassword}
                          onChangeText={setRegPassword}
                          placeholder="••••••••"
                          placeholderTextColor="#9CA3AF"
                          secureTextEntry={!showRegPassword}
                          onFocus={() => setFocusedField('regPass')}
                          onBlur={() => setFocusedField(null)}
                        />
                        <TouchableOpacity
                          onPress={() => setShowRegPassword(!showRegPassword)}
                          style={styles.eyeBtn}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={showRegPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={18}
                            color="#6B7280"
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
                          focusedField === 'regUser' && styles.inputWrapperFocused,
                        ]}
                      >
                        <Ionicons
                          name="at-outline"
                          size={18}
                          color={focusedField === 'regUser' ? Colors.primary : '#9CA3AF'}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          value={regUsername}
                          onChangeText={setRegUsername}
                          placeholder="e.g. bhakt_radha"
                          placeholderTextColor="#9CA3AF"
                          autoCapitalize="none"
                          autoCorrect={false}
                          onFocus={() => setFocusedField('regUser')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </View>
                    </View>

                    {/* Submit Register Button */}
                    <TouchableOpacity
                      onPress={handleRegister}
                      disabled={regLoading}
                      style={[styles.submitBtn, regLoading && { opacity: 0.7 }]}
                      activeOpacity={0.88}
                    >
                      {regLoading ? (
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
                            setLoginErrorMsg('');
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

            {/* Trust Footer */}
            <View style={styles.cardFooter}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.cardFooterText}>
                Encrypted & Authenticated • MALA Sacred Sanctuary
              </Text>
            </View>
          </View>
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
  },
  mainLayoutWide: {
    flexDirection: 'row',
    maxWidth: 1140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  leftColumn: {
    flex: 1.15,
    maxWidth: 580,
  },
  rightColumn: {
    flex: 0.95,
    width: '100%',
    maxWidth: 480,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1.5,
    borderColor: '#F3E8D8',
    shadowColor: '#C47D17',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 28,
    elevation: 5,
  },
  mobileOmHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F7F3EC',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EFE7DA',
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#C47D17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#1F2937',
    fontWeight: '800',
  },
  panelTitleBox: {
    marginBottom: 18,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  panelSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 17,
  },
  formContent: {
    gap: 14,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: 4,
  },
  successText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 4,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  registerPromptBtn: {
    backgroundColor: '#FFE4E6',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  registerPromptBtnText: {
    color: Colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  welcomeGiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  welcomeGiftText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A3412',
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
    color: '#374151',
  },
  labelHint: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF9',
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFCF8',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    height: 48,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  bottomPrompt: {
    marginTop: 10,
    alignItems: 'center',
  },
  promptDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  promptLink: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  // Register Success Card Styles
  regSuccessCard: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  successIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#166534',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
  },
  allocatedIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    width: '100%',
    justifyContent: 'center',
  },
  allocatedIdText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
  },
  starterMalaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  starterMalaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  enterDirectlyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    width: '100%',
    marginTop: 4,
  },
  enterDirectlyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  loginInsteadBtn: {
    paddingVertical: 6,
  },
  loginInsteadBtnText: {
    color: '#6B7280',
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
    borderTopColor: '#F3E8D8',
  },
  cardFooterText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
