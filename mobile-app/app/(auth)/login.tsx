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
  const { login, isLoading } = useMobileAuth();

  const [username, setUsername] = useState('citizen_john');
  const [password, setPassword] = useState('Password@123');

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
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username or Email</Text>
          <View style={styles.inputWrapper}>
            <User size={18} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. citizen_john"
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
          <Text style={styles.demoTitle}>Instant Demo Profiles</Text>
          <View style={styles.demoRow}>
            <TouchableOpacity
              style={styles.demoBadge}
              onPress={() => handlePreFill('citizen_john')}
            >
              <Text style={styles.demoBadgeText}>Citizen John</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBadge}
              onPress={() => handlePreFill('caregiver_mary')}
            >
              <Text style={styles.demoBadgeText}>Caregiver Mary</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBadge}
              onPress={() => handlePreFill('volunteer_sarah')}
            >
              <Text style={styles.demoBadgeText}>Volunteer Sarah</Text>
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
