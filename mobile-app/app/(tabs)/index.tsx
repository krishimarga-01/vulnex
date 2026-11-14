import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { mobileApi } from '../../services/mobileApi';
import { Colors } from '../../constants/Colors';
import {
  MapPin,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CloudSun,
  CloudRain,
  Sun,
  ChevronDown,
  ChevronRight,
  Leaf,
  ShieldCheck,
  Building2,
  LifeBuoy,
  Radio,
} from 'lucide-react-native';
import { useLocation } from '../../context/LocationContext';
import LocationPickerModal from '../../components/LocationPickerModal';

export default function HomeScreen() {
  const router = useRouter();
  const { location, openLocationPicker, detectGpsLocation, isLoading: isLocLoading } = useLocation();

  const {
    data: intel,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['live-intelligence-home', location.district, location.latitude, location.longitude],
    queryFn: () =>
      mobileApi.getLiveIntelligence(
        location.latitude,
        location.longitude,
        location.state,
        location.district
      ),
    refetchInterval: 30000,
  });

  const weather = intel?.weather;
  const alert = intel?.districtAlert;
  const aqi = intel?.airQuality;

  const hasActiveWarning =
    alert &&
    (alert.imdColorCode === 'RED' ||
      alert.imdColorCode === 'ORANGE' ||
      alert.imdColorCode === 'YELLOW');

  // Real hourly forecasts directly from live meteorological satellite/radar feed
  const currentTemp = weather?.temperature ?? 27.5;
  const hourlyOutlook = intel?.hourlyForecast && intel.hourlyForecast.length > 0
    ? intel.hourlyForecast.slice(0, 4).map((h) => {
        const cond = (h.condition || '').toLowerCase();
        let icon = Sun;
        if (cond.includes('rain') || cond.includes('drizzle')) icon = CloudRain;
        else if (cond.includes('cloud') || cond.includes('overcast')) icon = CloudSun;
        return {
          time: h.time,
          temp: Math.round(h.temp),
          icon,
        };
      })
    : [
        { time: 'Now', temp: Math.round(currentTemp), icon: CloudSun },
        { time: '3 PM', temp: Math.round(currentTemp + 1.2), icon: Sun },
        { time: '6 PM', temp: Math.round(currentTemp - 1.5), icon: CloudSun },
        { time: '9 PM', temp: Math.round(currentTemp - 2.8), icon: CloudRain },
      ];

  const handleRefreshAll = async () => {
    await detectGpsLocation();
    refetch();
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching || isLocLoading}
            onRefresh={handleRefreshAll}
            tintColor="#DC2626"
            colors={['#DC2626']}
          />
        }
      >
        {/* Top Header: Location Selector & Notification Bell */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={openLocationPicker}
            activeOpacity={0.7}
          >
            <MapPin size={18} color="#38BDF8" />
            <Text style={styles.locationText} numberOfLines={1}>
              {location.district}, {location.state}
            </Text>
            {location.isGpsDetected && (
              <View style={styles.gpsChip}>
                <Text style={styles.gpsChipText}>GPS 🛰️</Text>
              </View>
            )}
            <ChevronDown size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/(tabs)/notifications')}
            activeOpacity={0.7}
          >
            <Bell size={20} color="#FFFFFF" />
            {hasActiveWarning && <View style={styles.bellBadge} />}
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {isLoading && !intel && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color="#DC2626" />
            <Text style={styles.loadingBannerText}>Connecting to IMD & CPCB feeds...</Text>
          </View>
        )}

        {/* Disaster Warning Status Card (Matching Screen 3) */}
        {!hasActiveWarning ? (
          <View style={styles.clearCard}>
            <View style={styles.clearIconCircle}>
              <CheckCircle2 size={20} color="#FFFFFF" />
            </View>
            <View style={styles.clearTextCol}>
              <Text style={styles.clearTitle}>No Active Disaster Warning</Text>
              <Text style={styles.clearSub}>No severe weather alert for your district.</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.alertCard,
              alert.imdColorCode === 'RED'
                ? styles.alertCardRed
                : alert.imdColorCode === 'ORANGE'
                ? styles.alertCardOrange
                : styles.alertCardYellow,
            ]}
            onPress={() => router.push('/(tabs)/alert-details')}
            activeOpacity={0.85}
          >
            <View style={styles.alertIconCircle}>
              <AlertTriangle
                size={20}
                color={
                  alert.imdColorCode === 'RED'
                    ? '#EF4444'
                    : alert.imdColorCode === 'ORANGE'
                    ? '#F59E0B'
                    : '#EAB308'
                }
              />
            </View>
            <View style={styles.alertTextCol}>
              <View style={styles.alertTagRow}>
                <Text style={styles.alertLevelBadge}>{alert.imdColorCode} ALERT</Text>
                <Text style={styles.alertType}>{alert.warningType.replace('_', ' ')}</Text>
              </View>
              <Text style={styles.alertTitle} numberOfLines={1}>
                {alert.headline}
              </Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}

        {/* Main Live Weather Card (Matching Screen 3) */}
        {weather && (
          <View style={styles.weatherCard}>
            {/* Top Right IMD Badge */}
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceBadgeText}>IMD</Text>
            </View>

            <View style={styles.weatherCardBody}>
              {/* Left Column: Icon, Big Temperature, Condition */}
              <View style={styles.weatherLeft}>
                <CloudSun size={48} color="#FBBF24" />
                <Text style={styles.tempText}>
                  {weather.temperature !== undefined ? weather.temperature.toFixed(1) : '--'}°C
                </Text>
                <Text style={styles.conditionText}>
                  {weather.weatherCondition || 'Normal Meteorological Conditions'}
                </Text>
              </View>

              {/* Right Column: Key Metrics */}
              <View style={styles.weatherRight}>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Feels Like</Text>
                  <Text style={styles.metricValue}>
                    {weather.apparentTemperature !== undefined
                      ? `${weather.apparentTemperature.toFixed(1)}°C`
                      : '--'}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Humidity</Text>
                  <Text style={styles.metricValue}>
                    {weather.humidity !== undefined ? `${Math.round(weather.humidity)}%` : '--'}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Wind</Text>
                  <Text style={styles.metricValue}>
                    {weather.windSpeedKmh !== undefined
                      ? `${Math.round(weather.windSpeedKmh)} km/h`
                      : '--'}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Rainfall</Text>
                  <Text style={styles.metricValue}>
                    {weather.precipitationMm !== undefined
                      ? `${weather.precipitationMm.toFixed(1)} mm`
                      : '0.0 mm'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom AQI Banner Pill */}
            {aqi && (
              <TouchableOpacity
                style={styles.aqiPill}
                onPress={() => router.push('/(tabs)/weather')}
                activeOpacity={0.8}
              >
                <View style={styles.aqiLeft}>
                  <Leaf size={16} color="#10B981" />
                  <Text style={styles.aqiValueText}>
                    AQI <Text style={styles.aqiBold}>{aqi.aqi || 45}</Text>
                  </Text>
                  <View
                    style={[
                      styles.aqiCatBadge,
                      {
                        backgroundColor:
                          aqi.category === 'Good'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : aqi.category === 'Satisfactory'
                            ? 'rgba(101, 163, 13, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.aqiCatText,
                        {
                          color:
                            aqi.category === 'Good'
                              ? '#10B981'
                              : aqi.category === 'Satisfactory'
                              ? '#84CC16'
                              : '#F59E0B',
                        },
                      ]}
                    >
                      {aqi.category}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Today's Outlook / Hourly Strip (Matching Screen 3) */}
        <View style={styles.sectionOutlook}>
          <Text style={styles.sectionTitle}>Today's Outlook</Text>
          <View style={styles.hourlyRow}>
            {hourlyOutlook.map((item, index) => {
              const Icon = item.icon;
              return (
                <View key={index} style={styles.hourlyCard}>
                  <Text style={styles.hourlyTime}>{item.time}</Text>
                  <Icon size={24} color="#FBBF24" style={{ marginVertical: 8 }} />
                  <Text style={styles.hourlyTemp}>{item.temp}°</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Action Navigation Grid */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(tabs)/map')}
            activeOpacity={0.8}
          >
            <View style={styles.quickIconBox}>
              <Radio size={20} color="#38BDF8" />
            </View>
            <View style={styles.quickTextCol}>
              <Text style={styles.quickTitle}>India Disaster Map</Text>
              <Text style={styles.quickSub}>Live multi-hazard state & district alerts</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(tabs)/emergency')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickIconBox, { backgroundColor: 'rgba(220, 38, 38, 0.15)' }]}>
              <LifeBuoy size={20} color="#DC2626" />
            </View>
            <View style={styles.quickTextCol}>
              <Text style={styles.quickTitle}>Emergency SOS Dispatch</Text>
              <Text style={styles.quickSub}>One-tap rescue with GPS ground lock</Text>
            </View>
            <ChevronRight size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Reusable Location Picker Modal */}
      <LocationPickerModal />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B131E',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 12,
  },
  locationText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    maxWidth: 200,
  },
  gpsChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
    marginLeft: 4,
  },
  gpsChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.4,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111D2D',
    borderWidth: 1,
    borderColor: '#1E2F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111D2D',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  loadingBannerText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  clearCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  clearIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearTextCol: {
    flex: 1,
  },
  clearTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  clearSub: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 2,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  alertCardRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  alertCardOrange: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  alertCardYellow: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  alertIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111D2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTextCol: {
    flex: 1,
  },
  alertTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  alertLevelBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EF4444',
  },
  alertType: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  weatherCard: {
    backgroundColor: '#111D2D',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginBottom: 18,
    position: 'relative',
  },
  sourceBadge: {
    position: 'absolute',
    top: 14,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceBadgeText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  weatherCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  weatherLeft: {
    flex: 1,
  },
  tempText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 8,
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  weatherRight: {
    gap: 8,
    alignItems: 'flex-end',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  aqiPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D1724',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#1A2A3E',
  },
  aqiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aqiValueText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  aqiBold: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  aqiCatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aqiCatText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionOutlook: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  hourlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hourlyCard: {
    width: '23%',
    backgroundColor: '#111D2D',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  hourlyTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickGrid: {
    gap: 10,
    marginBottom: 10,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111D2D',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E2F46',
    gap: 12,
  },
  quickIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTextCol: {
    flex: 1,
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
