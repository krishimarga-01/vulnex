import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldAlert } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useMobileAuth } from '../context/MobileAuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useMobileAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <View style={styles.brandingContainer}>
        {/* Emblem */}
        <View style={styles.iconCircle}>
          <ShieldAlert size={48} color={Colors.white} />
        </View>

        {/* Application Name */}
        <Text style={styles.appName}>EXTREME WEATHER SAFETY</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          "Protecting Lives Before Disasters Strike"
        </Text>

        <Text style={styles.subtext}>
          Municipal Disaster Management & Vulnerability Emergency Response
        </Text>
      </View>

      {/* Loading Animation & Telemetry Sync */}
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#F59E0B" />
        <Text style={styles.loadingText}>
          Connecting to Emergency Telemetry Hub...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10243A',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  brandingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DC3545',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#DC3545',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#F59E0B',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 16,
  },
  footerContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 10,
    fontFamily: 'monospace',
  },
});
