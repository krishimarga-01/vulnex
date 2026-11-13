import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { mobileApi } from '../../services/mobileApi';
import { Colors } from '../../constants/Colors';
import {
  ShieldAlert,
  Flame,
  CloudRain,
  MapPin,
  Bell,
  LifeBuoy,
  ShieldCheck,
  Building2,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react-native';
import { useMobileAuth } from '../../context/MobileAuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useMobileAuth();

  const {
    data: weather,
    isLoading: weatherLoading,
    refetch: refetchWeather,
  } = useQuery({
    queryKey: ['mobile-weather'],
    queryFn: () => mobileApi.getCurrentWeather(),
    refetchInterval: 15000,
  });

  const {
    data: alerts = [],
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['mobile-alerts-nearby'],
    queryFn: () => mobileApi.getNearbyAlerts(),
    refetchInterval: 10000,
  });

  const onRefresh = () => {
    refetchWeather();
    refetchAlerts();
  };

  const primaryAlert = alerts[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={weatherLoading} onRefresh={onRefresh} />}
    >
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View>
          <View style={styles.locationRow}>
            <MapPin size={14} color="#F59E0B" />
            <Text style={styles.locationText}>Coastal Ward Sector 4 (Marina Zone)</Text>
          </View>
          <Text style={styles.greeting}>
            Hello, {user?.fullName || 'John Doe'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => router.push('/(tabs)/notifications')}
        >
          <Bell size={20} color={Colors.white} />
          {alerts.length > 0 && <View style={styles.bellDot} />}
        </TouchableOpacity>
      </View>

      {/* Safety Status Pill */}
      <View style={styles.safetyCard}>
        <View style={styles.safetyStatus}>
          <ShieldCheck size={18} color="#16A34A" />
          <Text style={styles.safetyText}>Personal Safety Status: SAFE AT HOME</Text>
        </View>
        <Text style={styles.safetySub}>
          1 Dependents Registered • 0 Active SOS Requests
        </Text>
      </View>

      {/* Weather Warning Level Banner */}
      {primaryAlert && (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={() => router.push('/(tabs)/weather')}
        >
          <View style={styles.alertHeader}>
            <View style={styles.alertTag}>
              <Flame size={14} color={Colors.white} />
              <Text style={styles.alertTagText}>RED ALERT IN EFFECT</Text>
            </View>
            <Text style={styles.alertTime}>Live Hazard</Text>
          </View>
          <Text style={styles.alertTitle}>{primaryAlert.headline}</Text>
          <Text style={styles.alertDesc} numberOfLines={2}>
            {primaryAlert.description}
          </Text>
        </TouchableOpacity>
      )}

      {/* Weather Condition Snapshot */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherLeft}>
          <Text style={styles.weatherCity}>{weather?.regionName || 'Coastal Sector 4'}</Text>
          <Text style={styles.weatherCondition}>
            {weather?.weatherCondition || 'Extreme Heatwave'}
          </Text>
          <Text style={styles.weatherMetrics}>
            Humidity {weather?.humidity || 78}% • Wind {weather?.windSpeed || 32} km/h
          </Text>
        </View>
        <View style={styles.weatherRight}>
          <Text style={styles.weatherTemp}>{weather?.temperature || 43.5}°</Text>
          <Text style={styles.weatherFeels}>Feels {weather?.feelsLike || 48.2}°C</Text>
        </View>
      </View>

      {/* Prominent Quick Emergency Assistance (SOS) Button */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => router.push('/(tabs)/emergency')}
        activeOpacity={0.85}
      >
        <View style={styles.sosInner}>
          <LifeBuoy size={32} color={Colors.white} />
          <View style={styles.sosTextContainer}>
            <Text style={styles.sosTitle}>REQUEST EMERGENCY ASSISTANCE (SOS)</Text>
            <Text style={styles.sosSub}>
              One-tap dispatch for medical, evacuation & food rescue
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Nearby Emergency Shelters */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Designated Emergency Shelters Nearby</Text>

        <View style={styles.shelterCard}>
          <View style={styles.shelterIcon}>
            <Building2 size={20} color="#173B5E" />
          </View>
          <View style={styles.shelterInfo}>
            <Text style={styles.shelterName}>Marina Municipal Community Cyclone Shelter</Text>
            <Text style={styles.shelterDetails}>
              0.8 km away • Air-conditioned cooling hall • Backup oxygen power
            </Text>
            <Text style={styles.shelterCapacity}>Capacity: 450 / 800 occupied</Text>
          </View>
        </View>

        <View style={styles.shelterCard}>
          <View style={styles.shelterIcon}>
            <Building2 size={20} color="#173B5E" />
          </View>
          <View style={styles.shelterInfo}>
            <Text style={styles.shelterName}>District Central Relief Camp 2</Text>
            <Text style={styles.shelterDetails}>
              1.6 km away • High ground flood refuge • Paramedic post
            </Text>
            <Text style={styles.shelterCapacity}>Capacity: 210 / 500 occupied</Text>
          </View>
        </View>
      </View>

      {/* Quick Access Grid */}
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => router.push('/(tabs)/register-vulnerable')}
        >
          <Text style={styles.gridCardTitle}>Register Vulnerable Family</Text>
          <Text style={styles.gridCardDesc}>Enroll elderly, infants, or oxygen dependents</Text>
          <ChevronRight size={16} color="#64748B" style={styles.gridArrow} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => router.push('/(tabs)/tracking')}
        >
          <Text style={styles.gridCardTitle}>Track Active Rescue Cases</Text>
          <Text style={styles.gridCardDesc}>Live status of your submitted emergency requests</Text>
          <ChevronRight size={16} color="#64748B" style={styles.gridArrow} />
        </TouchableOpacity>
      </View>
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
  topBar: {
    backgroundColor: '#10243A',
    marginHorizontal: -16,
    marginTop: -48,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '700',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 2,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#173B5E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC3545',
    position: 'absolute',
    top: 9,
    right: 10,
  },
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  safetyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  safetyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  safetySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginLeft: 24,
  },
  alertBanner: {
    backgroundColor: '#DC3545',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#DC3545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B02A37',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  alertTagText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  alertTime: {
    color: '#F8D7DA',
    fontSize: 11,
    fontWeight: '600',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 4,
  },
  alertDesc: {
    fontSize: 11,
    color: '#F8D7DA',
    marginTop: 3,
    lineHeight: 16,
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  weatherLeft: {
    flex: 1,
  },
  weatherCity: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10243A',
  },
  weatherCondition: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  weatherMetrics: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
    fontWeight: '600',
  },
  weatherRight: {
    alignItems: 'flex-end',
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: '900',
    color: '#DC3545',
  },
  weatherFeels: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  sosButton: {
    backgroundColor: '#DC3545',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#DC3545',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  sosInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  sosTitle: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sosSub: {
    color: '#F8D7DA',
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#10243A',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  shelterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  shelterIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E4ECF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shelterInfo: {
    flex: 1,
  },
  shelterName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10243A',
  },
  shelterDetails: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  shelterCapacity: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '700',
    marginTop: 2,
  },
  quickGrid: {
    gap: 10,
    marginBottom: 20,
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  gridCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10243A',
  },
  gridCardDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    paddingRight: 20,
  },
  gridArrow: {
    position: 'absolute',
    right: 14,
    top: 18,
  },
});
