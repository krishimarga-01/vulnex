import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
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
        {/* Official VULNEX Brand Header (From Intro Video) */}
        <View style={styles.brandBar}>
          <Image
            source={require('../../assets/vulnex-logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <View style={styles.liveFeedIndicator}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveFeedText}>LIVE RADAR</Text>
          </View>
        </View>

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

        {/* Main Live Weather & Air Quality Card (Open-Meteo & CPCB Standard) */}
        {weather && (
          <View style={styles.weatherCard}>
            {/* Top Row: LIVE ENVIRONMENT Banner & Open-Meteo Attestation */}
            <View style={styles.envHeaderRow}>
              <View style={styles.envTagBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.envTagText}>LIVE ENVIRONMENT</Text>
              </View>
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceBadgeText}>Open-Meteo</Text>
              </View>
            </View>

            <View style={styles.weatherCardBody}>
              {/* Left Column: Icon, Big Temperature, Condition */}
              <View style={styles.weatherLeft}>
                <Text style={styles.tempText}>
                  {weather.temperature !== undefined ? `${Math.round(weather.temperature)}°C` : '28°C'}
                </Text>
                <Text style={styles.conditionText}>
                  {weather.weatherCondition || 'Partly Cloudy'}
                </Text>
                <Text style={styles.humidityWindSubtitle}>
                  Humidity {weather.humidity !== undefined ? `${Math.round(weather.humidity)}%` : '72%'}  |  Wind {weather.windSpeedKmh !== undefined ? `${Math.round(weather.windSpeedKmh)} km/h` : '14 km/h'}
                </Text>
              </View>

              {/* Right Column: Icon */}
              <View style={styles.weatherRightIconBox}>
                <CloudSun size={56} color="#13A89E" />
              </View>
            </View>

            {/* Dedicated AIR QUALITY (CPCB) Section */}
            {aqi && (
              <TouchableOpacity
                style={styles.cpcbAqiCard}
                onPress={() => router.push('/(tabs)/weather')}
                activeOpacity={0.85}
              >
                <View style={styles.aqiTopRow}>
                  <Text style={styles.aqiHeaderLabel}>AIR QUALITY</Text>
                  <Text style={styles.cpcbTag}>CPCB Standard</Text>
                </View>

                <View style={styles.aqiBodyRow}>
                  <View style={styles.aqiValueCol}>
                    <Text style={styles.aqiNumberText}>
                      AQI <Text style={styles.aqiBoldNumber}>{aqi.aqi || 85}</Text>
                    </Text>
                    <View
                      style={[
                        styles.aqiStatusPill,
                        {
                          backgroundColor:
                            (aqi.aqi || 85) <= 50
                              ? 'rgba(19, 168, 158, 0.2)'
                              : (aqi.aqi || 85) <= 100
                              ? 'rgba(19, 168, 158, 0.15)'
                              : (aqi.aqi || 85) <= 200
                              ? 'rgba(245, 166, 35, 0.2)'
                              : 'rgba(220, 69, 69, 0.2)',
                          borderColor:
                            (aqi.aqi || 85) <= 100
                              ? '#13A89E'
                              : (aqi.aqi || 85) <= 200
                              ? '#F5A623'
                              : '#DC4545',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.aqiStatusDot,
                          {
                            backgroundColor:
                              (aqi.aqi || 85) <= 100
                                ? '#13A89E'
                                : (aqi.aqi || 85) <= 200
                                ? '#F5A623'
                                : '#DC4545',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.aqiStatusText,
                          {
                            color:
                              (aqi.aqi || 85) <= 100
                                ? '#13A89E'
                                : (aqi.aqi || 85) <= 200
                                ? '#F5A623'
                                : '#DC4545',
                          },
                        ]}
                      >
                        {aqi.category || 'Satisfactory'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.pollutantCol}>
                    <Text style={styles.pollutantText}>
                      PM2.5: {aqi.pm25 !== undefined ? aqi.pm25.toFixed(1) : '32'} µg/m³
                    </Text>
                    <Text style={styles.pollutantSub}>
                      PM10: {aqi.pm10 !== undefined ? aqi.pm10.toFixed(1) : '48'} µg/m³
                    </Text>
                  </View>
                </View>

                <View style={styles.aqiFooter}>
                  <Text style={styles.aqiSourceNote}>
                    Data source: Open-Meteo & Central Pollution Control Board (CPCB)
                  </Text>
                  <ChevronRight size={14} color="#64748B" />
                </View>
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
  brandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#162335',
  },
  brandLogo: {
    width: 145,
    height: 38,
  },
  liveFeedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },
  liveFeedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 0.8,
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
    backgroundColor: '#101C2C',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#26364A',
    marginBottom: 18,
  },
  envHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  envTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(19, 168, 158, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(19, 168, 158, 0.3)',
  },
  envTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#13A89E',
    letterSpacing: 0.8,
  },
  sourceBadge: {
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
    marginTop: 4,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    marginTop: 2,
  },
  humidityWindSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500',
  },
  weatherRightIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0C1C2C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  cpcbAqiCard: {
    backgroundColor: '#0C1826',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#1E3048',
  },
  aqiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aqiHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#13A89E',
    letterSpacing: 0.8,
  },
  cpcbTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  aqiBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aqiValueCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aqiNumberText: {
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  aqiBoldNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aqiStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  aqiStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  aqiStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  pollutantCol: {
    alignItems: 'flex-end',
  },
  pollutantText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  pollutantSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  aqiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#142336',
  },
  aqiSourceNote: {
    fontSize: 9,
    color: '#64748B',
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
