import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useMobileAuth } from '../../context/MobileAuthContext';
import { mobileApi } from '../../services/mobileApi';
import { Colors } from '../../constants/Colors';
import { StatusBadge } from '../../components/StatusBadge';
import {
  User,
  Phone,
  MapPin,
  Bell,
  Database,
  LogOut,
  Users,
  Shield,
  ChevronRight,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useMobileAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [criticalSirensEnabled, setCriticalSirensEnabled] = useState(true);
  const [demoMode, setDemoMode] = useState(mobileApi.getDemoMode());

  const { data: myVulnerable = [] } = useQuery({
    queryKey: ['mobile-vulnerable-my'],
    queryFn: () => mobileApi.getMyVulnerablePersons(),
  });

  const handleToggleDemo = (val: boolean) => {
    setDemoMode(val);
    mobileApi.setDemoMode(val);
    Alert.alert(
      val ? 'Demo Mode Active' : 'Live API Active',
      val
        ? 'Using simulation dataset with local offline reactivity.'
        : 'Connecting to Spring Boot REST API at ' +
            (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1')
    );
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your safety account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>
            {user?.fullName ? user.fullName.charAt(0) : 'J'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.fullName || 'John Doe'}</Text>
        <Text style={styles.userRole}>
          {user?.role ? user.role.replace('ROLE_', '') : 'CITIZEN'} • ACTIVE
        </Text>
        <Text style={styles.userEmail}>{user?.email || 'john.citizen@example.com'}</Text>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Primary Emergency Contacts</Text>
        <View style={styles.card}>
          <View style={styles.contactRow}>
            <View>
              <Text style={styles.contactName}>
                {user?.emergencyContactName || 'Jane Doe'} (Next of Kin)
              </Text>
              <Text style={styles.contactPhone}>
                {user?.emergencyContactPhone || '+1-555-0111'}
              </Text>
            </View>
            <TouchableOpacity style={styles.callPill}>
              <Phone size={14} color="#16A34A" />
              <Text style={styles.callPillText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Registered Vulnerable Individuals */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Registered Vulnerable Dependents ({myVulnerable.length})
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/register-vulnerable')}>
            <Text style={styles.addText}>+ Add New</Text>
          </TouchableOpacity>
        </View>

        {myVulnerable.slice(0, 3).map((person) => (
          <View key={person.id} style={styles.dependentCard}>
            <View style={styles.dependentHeader}>
              <Text style={styles.dependentName}>{person.fullName}</Text>
              <StatusBadge type="risk" value={person.currentRiskLevel} />
            </View>
            <Text style={styles.dependentCategory}>
              {person.vulnerabilityCategory} • {person.age} yrs • {person.mobilityStatus}
            </Text>
            <Text style={styles.dependentMedical} numberOfLines={1}>
              {person.medicalConditions}
            </Text>
          </View>
        ))}
      </View>

      {/* Notification Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert & Siren Preferences</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>Push Weather Alerts</Text>
              <Text style={styles.switchSub}>Receive official municipal warning bulletins</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#CBD5E1', true: '#10243A' }}
            />
          </View>

          <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 }]}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>Critical Siren Override</Text>
              <Text style={styles.switchSub}>Sound audible alarm for RED category heatwaves & flash floods</Text>
            </View>
            <Switch
              value={criticalSirensEnabled}
              onValueChange={setCriticalSirensEnabled}
              trackColor={{ false: '#CBD5E1', true: '#DC3545' }}
            />
          </View>
        </View>
      </View>

      {/* Network & Backend Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Source & Demonstration</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchTitle}>Offline Demonstration Mode</Text>
              <Text style={styles.switchSub}>
                Simulate backend data and live SOS dispatch independently
              </Text>
            </View>
            <Switch
              value={demoMode}
              onValueChange={handleToggleDemo}
              trackColor={{ false: '#CBD5E1', true: '#0891B2' }}
            />
          </View>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={16} color="#DC3545" />
        <Text style={styles.logoutText}>Sign Out of Safety Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  content: {
    padding: 16,
    paddingTop: 48,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#10243A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10243A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#173B5E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 10,
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F59E0B',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  userRole: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10243A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC3545',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10243A',
  },
  contactPhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  callPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  callPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  dependentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  dependentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dependentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10243A',
  },
  dependentCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  dependentMedical: {
    fontSize: 10,
    color: '#DC3545',
    marginTop: 4,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchInfo: {
    flex: 1,
    paddingRight: 10,
  },
  switchTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10243A',
  },
  switchSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC3545',
  },
});
