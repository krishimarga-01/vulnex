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
import { useLocation } from '../../context/LocationContext';
import LocationPickerModal from '../../components/LocationPickerModal';
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
  ShieldAlert,
  Radio,
  Info,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useMobileAuth();
  const { location, openLocationPicker } = useLocation();

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
      val ? 'Demo Simulation Active' : 'Live India API Active',
      val
        ? 'App is operating with local simulated telemetry.'
        : 'Connecting to Live Spring Boot REST API & IMD Doppler feed.'
    );
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your VULNEX account?', [
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
    <View style={styles.screenWrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Profile Header (Screen 10) */}
        <View style={styles.profileHeroCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'C'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.fullName || 'Registered Citizen'}</Text>
          <View style={styles.verifiedBadge}>
            <Shield size={12} color="#10B981" />
            <Text style={styles.verifiedBadgeText}>
              {user?.role ? user.role.replace('ROLE_', '') : 'CITIZEN'} • VERIFIED
            </Text>
          </View>
          <Text style={styles.userEmail}>{user?.email || 'citizen@disasterresponse.gov.in'}</Text>
        </View>

        {/* Current Active Location Card */}
        <TouchableOpacity
          style={styles.locationCard}
          onPress={openLocationPicker}
          activeOpacity={0.8}
        >
          <View style={styles.locationIconBox}>
            <MapPin size={20} color="#38BDF8" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>MONITORED DISTRICT</Text>
            <Text style={styles.locationName}>
              {location.district}, {location.state}
            </Text>
            <Text style={styles.locationPin}>PIN: {location.pincode}</Text>
          </View>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Settings Navigation List (Screen 10) */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>VULNERABILITY & RELIEF</Text>

          {/* Vulnerable Members */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/register-vulnerable')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#DC262622' }]}>
                <Users size={18} color="#DC2626" />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>Vulnerable Members</Text>
                <Text style={styles.menuItemSub}>Elderly, pediatric & medical dependents</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{myVulnerable.length}</Text>
              </View>
              <ChevronRight size={18} color="#64748B" />
            </View>
          </TouchableOpacity>

          {/* SOS Trackers */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/tracking')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#38BDF822' }]}>
                <Radio size={18} color="#38BDF8" />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>My Emergency Dispatches</Text>
                <Text style={styles.menuItemSub}>Live case tracking & responder ETA</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Notifications & Sound */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>ALERTS & NOTIFICATIONS</Text>

          <View style={styles.switchItem}>
            <View style={styles.switchLeft}>
              <Bell size={18} color="#94A3B8" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.switchTitle}>IMD Disaster Alerts</Text>
                <Text style={styles.switchSub}>Red/Orange flash warnings for your GPS area</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#1E2F46', true: '#DC2626' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#94A3B8'}
            />
          </View>

          <View style={styles.switchItem}>
            <View style={styles.switchLeft}>
              <ShieldAlert size={18} color="#94A3B8" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.switchTitle}>Critical Siren Alarm</Text>
                <Text style={styles.switchSub}>Sound high-volume alarm during RED evacuations</Text>
              </View>
            </View>
            <Switch
              value={criticalSirensEnabled}
              onValueChange={setCriticalSirensEnabled}
              trackColor={{ false: '#1E2F46', true: '#DC2626' }}
              thumbColor={criticalSirensEnabled ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* System & Mode */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>SYSTEM CONFIGURATION</Text>

          <View style={styles.switchItem}>
            <View style={styles.switchLeft}>
              <Database size={18} color="#94A3B8" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.switchTitle}>Offline Jury Simulation Mode</Text>
                <Text style={styles.switchSub}>Simulate disaster data when offline</Text>
              </View>
            </View>
            <Switch
              value={demoMode}
              onValueChange={handleToggleDemo}
              trackColor={{ false: '#1E2F46', true: '#38BDF8' }}
              thumbColor={demoMode ? '#FFFFFF' : '#94A3B8'}
            />
          </View>

          <View style={styles.aboutCard}>
            <Info size={16} color="#64748B" />
            <Text style={styles.aboutText}>
              VULNEX Mobile v2.4 • Powered by India Meteorological Department (IMD) Ground & Doppler Radar and CPCB Air Quality Network.
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <LogOut size={16} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Sign Out of VULNEX</Text>
        </TouchableOpacity>
      </ScrollView>

      <LocationPickerModal />
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#0B131E',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  profileHeroCard: {
    backgroundColor: '#111D2D',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E2F46',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
    marginBottom: 12,
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: '#38BDF8',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B98122',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  verifiedBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 12,
    color: '#94A3B8',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111D2D',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginBottom: 20,
  },
  locationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#38BDF822',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  locationPin: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111D2D',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111D2D',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginBottom: 8,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  switchSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0B131E',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginTop: 4,
  },
  aboutText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    lineHeight: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111D2D',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DC2626',
    marginTop: 10,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
});
