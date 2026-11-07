import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/theme/colors';

/**
 * Root Entry Point:
 * On first launch (or when unauthenticated), immediately prompts user to register or login.
 * Once logged in, directs user directly to their sacred sanctuary (tabs).
 */
export default function RootIndex() {
  const { isAuthenticated, token } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Not authenticated: send to registration/login
  if (!isAuthenticated || !token) {
    return <Redirect href="/(auth)/register" />;
  }

  // Authenticated devotee: send to sanctuary
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF7F2',
  },
});

