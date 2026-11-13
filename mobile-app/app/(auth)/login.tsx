import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Shield, Lock, User, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, quickEnterDemo, isLoading } = useMobileAuth();

  const [username, setUsername] = useState('john.citizen@example.com');
  const [password, setPassword] = useState('Password@123');

  const handleQuickDemo = async (role: 'CITIZEN' | 'AUTHORITY') => {
    try {
      await quickEnterDemo(role);
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your username and password.');
      return;
    }

    try {
      await login({ usernameOrEmail: username, password });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert(
        'Login Error',
        err.response?.data?.message || 'Authentication failed. Please verify credentials.'
      );
    }
  };

  const handlePreFill = (user: string) => {
    setUsername(user);
    setPassword('Password@123');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Top Emblem */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Shield size={36} color={Colors.white} />
        </View>
        <Text style={styles.title}>Citizen & Caregiver Access</Text>
        <Text style={styles.subtitle}>Extreme Weather Safety Network</Text>
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        {/* Quick Demo Mode (Jury Instant Entry) */}
        <View style={styles.quickDemoCard}>
          <View style={styles.quickDemoHeader}>
            <Text style={styles.quickDemoTitle}>🚨 Quick Demo Mode (Jury Access)</Text>
            <Text style={styles.quickDemoSubtitle}>1-Click instant entry • No password required</Text>
          </View>
          <View style={styles.quickDemoActions}>
            <TouchableOpacity
              style={[styles.quickDemoBtn, styles.citizenDemoBtn]}
              onPress={() => handleQuickDemo('CITIZEN')}
              disabled={isLoading}
            >
              <Text style={styles.quickDemoBtnText}>Enter Citizen Demo</Text>
              <Text style={styles.quickDemoSubText}>John Doe (Citizen SOS)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickDemoBtn, styles.authorityDemoBtn]}
              onPress={() => handleQuickDemo('AUTHORITY')}
              disabled={isLoading}
            >
              <Text style={styles.quickDemoBtnText}>Enter Authority Demo</Text>
              <Text style={styles.quickDemoSubText}>Rajesh Sharma (Triage)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR SECURE LOGIN</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username or Email</Text>
          <View style={styles.inputWrapper}>
            <User size={18} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. john.citizen@example.com"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.forgotContainer}>
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.loginButtonText}>Sign In</Text>
              <ArrowRight size={18} color={Colors.white} />
            </View>
          )}
        </TouchableOpacity>

        {/* Quick Demo Pre-Fill Accounts */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Instant Demo Credentials</Text>
          <View style={styles.demoRow}>
            <TouchableOpacity
              style={styles.demoBadge}
              onPress={() => handlePreFill('john.citizen@example.com')}
            >
              <Text style={styles.demoBadgeText}>Citizen John</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBadge}
              onPress={() => handlePreFill('mary.caregiver@example.com')}
            >
              <Text style={styles.demoBadgeText}>Caregiver Mary</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBadge}
              onPress={() => handlePreFill('officer.raj@disasterresponse.gov')}
            >
              <Text style={styles.demoBadgeText}>Officer Raj</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Link */}
        <View style={styles.footerLink}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#10243A',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#173B5E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10243A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#10243A',
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 12,
    color: '#173B5E',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#10243A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickDemoCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  quickDemoHeader: {
    marginBottom: 10,
  },
  quickDemoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickDemoSubtitle: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 2,
  },
  quickDemoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickDemoBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  citizenDemoBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  authorityDemoBtn: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  quickDemoBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
  },
  quickDemoSubText: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 8,
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  demoBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  demoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#173B5E',
  },
  footerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC3545',
  },
});
