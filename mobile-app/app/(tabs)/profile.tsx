import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  LogOut,
  Users,
  Shield,
  ChevronRight,
  ArrowLeft,
  LifeBuoy,
  Info,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useMobileAuth();
  const { location, openLocationPicker } = useLocation();

  const { data: myVulnerable = [] } = useQuery({
    queryKey: ['mobile-vulnerable-my'],
    queryFn: () => mobileApi.getMyVulnerablePersons(),
  });

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

  const handleInfo = () => {
    Alert.alert(
      'VULNEX Mobile v2.5',
      'Extreme Weather Vulnerability Identification & Emergency Response System.\n\nGrounded in official India Meteorological Department (IMD) Ground & Doppler Weather Feeds, CPCB National Air Quality Index, and NDMA Relief Operations.'
    );
  };

  const displayName = user?.fullName || 'John Doe';

  return (
    <View style={styles.screenWrapper}>
      {/* Top Header with Back Arrow (Matching Screen 10) */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card (Matching Screen 10) */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <User size={36} color="#38BDF8" />
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userRoleText}>Citizen • Verified</Text>
        </View>

        {/* Settings Navigation List (Matching Screen 10) */}
        <View style={styles.settingsList}>
          {/* 1. My Vulnerable Members */}
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push('/(tabs)/register-vulnerable')}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft}>
              <Users size={20} color="#94A3B8" />
              <Text style={styles.itemTitle}>My Vulnerable Members</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.countText}>{myVulnerable.length || 3}</Text>
              <ChevronRight size={18} color="#64748B" />
            </View>
          </TouchableOpacity>

          {/* 2. Emergency Contacts */}
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() =>
              Alert.alert(
                'Emergency Contacts',
                'Primary SOS Hotline: 112\nNDRF Disaster Line: 1078\nAmbulance: 108\nFire & Flood Squad: 101'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft}>
              <Phone size={20} color="#94A3B8" />
              <Text style={styles.itemTitle}>Emergency Contacts</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>

          {/* 3. My SOS Requests */}
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push('/(tabs)/tracking')}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft}>
              <LifeBuoy size={20} color="#94A3B8" />
              <Text style={styles.itemTitle}>My SOS Requests</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>

          {/* 4. Notification Preferences */}
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() =>
              Alert.alert(
                'Notification Preferences',
                'Official IMD Weather Alerts: Enabled (High Priority)\nAudible Siren Alarms: Enabled for RED category evacuations.'
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft}>
              <Bell size={20} color="#94A3B8" />
              <Text style={styles.itemTitle}>Notification Preferences</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>

          {/* 5. Change Location */}
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={openLocationPicker}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft}>
              <MapPin size={20} color="#94A3B8" />
              <Text style={styles.itemTitle}>Change Location</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>

          {/* 6. App Information */}
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={handleInfo}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft}>
              <Info size={20} color="#94A3B8" />
              <Text style={styles.itemTitle}>App Information</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Large Red Logout Button (Matching Screen 10) */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutBtnText}>Logout</Text>
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
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2F46',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111D2D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#132338',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRoleText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  settingsList: {
    backgroundColor: '#111D2D',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E2F46',
    overflow: 'hidden',
    marginBottom: 28,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2F46',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
