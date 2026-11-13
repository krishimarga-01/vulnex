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
  Wind,
  Droplets,
  Thermometer,
  Radio,
  Crosshair,
  Compass,
  PhoneCall,
  Activity,
  Calendar,
  Layers,
} from 'lucide-react-native';
import { useMobileAuth } from '../../context/MobileAuthContext';
import { useLocation } from '../../context/LocationContext';
import LocationPickerModal from '../../components/LocationPickerModal';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useMobileAuth();
  const { location, openLocationPicker } = useLocation();

  const {
    data: intel,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['live-intelligence', location.district, location.latitude, location.longitude],
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
  const shelters = intel?.nearbyShelters || [];
  const forecast = intel?.forecast || [];

  const isSevere = alert?.imdColorCode === 'RED' || alert?.imdColorCode === 'ORANGE';
  const alertBg =
    alert?.imdColorCode === 'RED'
      ? '#FEF2F2'
      : alert?.imdColorCode === 'ORANGE'
      ? '#FFFBEB'
      : '#F0FDF4';
  const alertBorder =
    alert?.imdColorCode === 'RED'
      ? '#F87171'
      : alert?.imdColorCode === 'ORANGE'
      ? '#FBBF24'
      : '#86EFAC';
  const alertColor =
    alert?.imdColorCode === 'RED'
      ? '#DC2626'
      : alert?.imdColorCode === 'ORANGE'
      ? '#D97706'
      : '#16A34A';

  return (
    <View style={styles.screenWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#FFFFFF"
            colors={['#DC3545']}
          />
        }
      >
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            {/* Interactive Location Selector Button */}
            <TouchableOpacity
              style={styles.locationButton}
              onPress={openLocationPicker}
              activeOpacity={0.8}
            >
              {location.isGpsDetected ? (
                <Crosshair size={13} color="#22C55E" />
              ) : (
                <MapPin size={13} color="#F59E0B" />
              )}
              <Text style={styles.locationText} numberOfLines={1}>
                {location.district}, {location.state}
              </Text>
              <View style={styles.changeBadge}>
                <Text style={styles.changeBadgeText}>Change</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.greeting}>
              Hello, {user?.fullName || 'Citizen Response Hub'}
            </Text>
            <Text style={styles.pincodeText}>
              Station Sector: PIN {location.pincode} • {location.isGpsDetected ? 'GPS Ground Lock' : 'Manual Regional Lock'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <Bell size={20} color={Colors.white} />
            {isSevere && <View style={styles.bellDot} />}
          </TouchableOpacity>
        </View>

        {/* Loading state indicator */}
        {isLoading && !intel && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#DC3545" />
            <Text style={styles.loadingText}>Connecting to IMD Radar & CPCB Telemetry...</Text>
          </View>
        )}

        {/* Dynamic Personal Safety Status Banner */}
        <View
          style={[
            styles.safetyCard,
            {
              backgroundColor: isSevere ? '#FEF2F2' : '#F0FDF4',
              borderColor: isSevere ? '#FCA5A5' : '#86EFAC',
            },
          ]}
        >
          <View style={styles.safetyHeader}>
            {isSevere ? (
              <ShieldAlert size={20} color="#DC2626" />
            ) : (
              <ShieldCheck size={20} color="#16A34A" />
            )}
            <Text
              style={[
                styles.safetyTitle,
                { color: isSevere ? '#991B1B' : '#166534' },
              ]}
            >
              {isSevere
                ? `HIGH CAUTION: ${alert?.imdColorCode} ALERT IN ${location.district.toUpperCase()}`
                : `MONITORED: ALL CLEAR IN ${location.district.toUpperCase()}`}
            </Text>
          </View>
          <Text style={styles.safetySub}>
            {isSevere
              ? `${alert?.affectedVulnerableCount || 0} registered vulnerable persons prioritized in your district. Automated dispatch active.`
              : 'Continuous automated meteorological monitoring active across district relief network.'}
          </Text>
        </View>

        {/* Official IMD District Early Warning Card */}
        {alert && (
          <View style={[styles.imdCard, { backgroundColor: alertBg, borderColor: alertBorder }]}>
            <View style={styles.imdHeader}>
              <View style={[styles.imdColorPill, { backgroundColor: alertColor }]}>
                <Radio size={12} color="#FFFFFF" />
                <Text style={styles.imdColorPillText}>
                  IMD {alert.imdColorCode} BULLETIN
                </Text>
              </View>
              <Text style={styles.imdSourceText}>mausam.imd.gov.in</Text>
            </View>

            <Text style={[styles.imdHeadline, { color: alertColor }]}>{alert.headline}</Text>
            <Text style={styles.imdDesc}>{alert.description}</Text>

            <View style={styles.instructionBox}>
              <Text style={styles.instructionTitle}>OFFICIAL SAFETY DIRECTIVE:</Text>
              <Text style={styles.instructionText}>{alert.safetyInstructions}</Text>
            </View>

            <View style={styles.imdFooter}>
              <Text style={styles.imdValidity}>
                Valid through: {new Date(alert.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
              </Text>
              <Text style={styles.imdAttribution}>Source: Indian Meteorological Department</Text>
            </View>
          </View>
        )}

        {/* Real Live Weather Snapshot */}
        {weather && (
          <View style={styles.weatherCard}>
            <View style={styles.weatherCardHeader}>
              <View style={styles.weatherSourceRow}>
                <View style={[styles.liveDot, { backgroundColor: (weather.isLive || weather.status === 'LIVE') ? '#22C55E' : '#94A3B8' }]} />
                <Text style={styles.weatherSourceText}>
                  {(weather.isLive || weather.status === 'LIVE') ? 'LIVE METEOROLOGICAL TELEMETRY' : 'VERIFIED REGIONAL TELEMETRY'}
                </Text>
              </View>
              <Text style={styles.obsTime}>
                Observed: {new Date(weather.observationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            <View style={styles.weatherMain}>
              <View style={styles.weatherMainLeft}>
                <Text style={styles.weatherCondition}>{weather.weatherCondition}</Text>
                <Text style={styles.weatherStation}>
                  IMD Doppler Sector: {location.district}
                </Text>
              </View>
              <View style={styles.weatherTempBox}>
                <Text style={styles.weatherTemp}>{weather.temperature?.toFixed(1)}°C</Text>
                <Text style={styles.weatherFeels}>
                  Feels like {weather.apparentTemperature?.toFixed(1)}°C
                </Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Droplets size={16} color="#0284C7" />
                <Text style={styles.metricLabel}>Humidity</Text>
                <Text style={styles.metricVal}>{weather.humidity?.toFixed(0)}%</Text>
              </View>
              <View style={styles.metricItem}>
                <CloudRain size={16} color="#0891B2" />
                <Text style={styles.metricLabel}>Rainfall</Text>
                <Text style={styles.metricVal}>{weather.precipitationMm?.toFixed(1)} mm</Text>
              </View>
              <View style={styles.metricItem}>
                <Wind size={16} color="#475569" />
                <Text style={styles.metricLabel}>Wind Speed</Text>
                <Text style={styles.metricVal}>{weather.windSpeedKmh?.toFixed(1)} km/h</Text>
              </View>
              <View style={styles.metricItem}>
                <Compass size={16} color="#D97706" />
                <Text style={styles.metricLabel}>Pressure</Text>
                <Text style={styles.metricVal}>{weather.surfacePressureHpa?.toFixed(0)} hPa</Text>
              </View>
            </View>

            <Text style={styles.weatherSourceAttribution}>
              Telemetry Grounding: {weather.source}
            </Text>
          </View>
        )}

        {/* Real CPCB Air Quality Index (NAQI) Card */}
        {aqi && (
          <View style={styles.aqiCard}>
            <View style={styles.aqiHeader}>
              <View style={styles.aqiTitleRow}>
                <Activity size={16} color={aqi.categoryColor} />
                <Text style={styles.aqiTitle}>Central Pollution Control Board (CPCB) NAQI</Text>
              </View>
              <View style={[styles.aqiBadge, { backgroundColor: aqi.categoryColor }]}>
                <Text style={styles.aqiBadgeText}>{aqi.category.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.aqiBody}>
              <View style={styles.aqiValueBox}>
                <Text style={[styles.aqiValue, { color: aqi.categoryColor }]}>{aqi.aqi}</Text>
                <Text style={styles.aqiValueUnit}>AQI Index</Text>
              </View>
              <View style={styles.aqiDetails}>
                <Text style={styles.aqiParamText}>
                  PM2.5: <Text style={styles.aqiParamBold}>{aqi.pm25?.toFixed(1)} µg/m³</Text>
                </Text>
                <Text style={styles.aqiParamText}>
                  PM10: <Text style={styles.aqiParamBold}>{aqi.pm10?.toFixed(1)} µg/m³</Text>
                </Text>
                <Text style={styles.aqiNoticeText}>
                  CPCB Standard: {aqi.cpcbClassificationNotice}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 3-Day Forecast Strip */}
        {forecast.length > 0 && (
          <View style={styles.forecastCard}>
            <View style={styles.forecastHeader}>
              <Calendar size={16} color="#173B5E" />
              <Text style={styles.forecastTitle}>3-Day District Meteorological Forecast</Text>
            </View>

            <View style={styles.forecastRow}>
              {forecast.map((f, i) => (
                <View key={i} style={styles.forecastItem}>
                  <Text style={styles.forecastDay}>{f.dayOfWeek}</Text>
                  <Text style={styles.forecastDate}>{f.dateStr}</Text>
                  <CloudRain size={20} color="#0284C7" style={{ marginVertical: 6 }} />
                  <Text style={styles.forecastTemps}>
                    {f.maxTemp?.toFixed(0)}° / {f.minTemp?.toFixed(0)}°
                  </Text>
                  <Text style={styles.forecastRain}>{f.rainProbability}% rain</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Access to India Multi-Hazard Disaster Map */}
        <TouchableOpacity
          style={styles.mapBanner}
          onPress={() => router.push('/(tabs)/weather')}
          activeOpacity={0.85}
        >
          <View style={styles.mapBannerLeft}>
            <Layers size={22} color="#10243A" />
            <View>
              <Text style={styles.mapBannerTitle}>India Disaster Intelligence Map</Text>
              <Text style={styles.mapBannerSub}>
                Real-time multi-hazard bulletins across Karnataka, Kerala, TN & Western Ghats
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#10243A" />
        </TouchableOpacity>

        {/* Prominent One-Touch Emergency SOS Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => router.push('/(tabs)/emergency')}
          activeOpacity={0.88}
        >
          <View style={styles.sosInner}>
            <LifeBuoy size={32} color={Colors.white} />
            <View style={styles.sosTextContainer}>
              <Text style={styles.sosTitle}>REQUEST EMERGENCY ASSISTANCE (SOS)</Text>
              <Text style={styles.sosSub}>
                Coordinates auto-attached: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} ({location.district})
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Verified Designated Nearby Shelters (From PostgreSQL) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Building2 size={18} color="#10243A" />
            <Text style={styles.sectionTitle}>
              Verified Relief Shelters Near {location.district}
            </Text>
          </View>

          {shelters.length === 0 ? (
            <View style={styles.noShelterCard}>
              <Text style={styles.noShelterText}>No active shelters recorded in immediate sector.</Text>
            </View>
          ) : (
            shelters.slice(0, 3).map((s, idx) => (
              <View key={s.shelterId || idx} style={styles.shelterCard}>
                <View style={styles.shelterIcon}>
                  <Building2 size={20} color="#173B5E" />
                </View>
                <View style={styles.shelterInfo}>
                  <Text style={styles.shelterName}>{s.shelterName}</Text>
                  <Text style={styles.shelterAddress}>
                    {s.address} • {s.district}
                  </Text>
                  <View style={styles.shelterFeatures}>
                    {s.hasMedicalFacility && (
                      <View style={styles.featurePill}>
                        <Text style={styles.featurePillText}>Paramedic Post</Text>
                      </View>
                    )}
                    {s.hasBackupPower && (
                      <View style={styles.featurePill}>
                        <Text style={styles.featurePillText}>Backup Power</Text>
                      </View>
                    )}
                    {s.isAccessibleDisabled && (
                      <View style={styles.featurePill}>
                        <Text style={styles.featurePillText}>Wheelchair Access</Text>
                      </View>
                    )}
                  </View>
                  {s.contactPhone && (
                    <Text style={styles.shelterContact}>
                      Emergency Line: <Text style={styles.contactBold}>{s.contactPhone}</Text>
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push('/(tabs)/register-vulnerable')}
            activeOpacity={0.8}
          >
            <Text style={styles.gridCardTitle}>Register Vulnerable Person</Text>
            <Text style={styles.gridCardDesc}>
              Protect elderly, infants, or oxygen-dependent patients in {location.district}
            </Text>
            <ChevronRight size={16} color="#64748B" style={styles.gridArrow} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => router.push('/(tabs)/tracking')}
            activeOpacity={0.8}
          >
            <Text style={styles.gridCardTitle}>Track Active Rescue Dispatches</Text>
            <Text style={styles.gridCardDesc}>
              Real-time response team assignment and rescue status
            </Text>
            <ChevronRight size={16} color="#64748B" style={styles.gridArrow} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Global Location Picker Modal */}
      <LocationPickerModal />
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  container: {
    flex: 1,
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
    alignItems: 'flex-start',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  topBarLeft: {
    flex: 1,
    marginRight: 10,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  locationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '800',
    maxWidth: 180,
  },
  changeBadge: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  changeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 8,
  },
  pincodeText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#173B5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC3545',
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  loadingText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  safetyCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  safetyTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  safetySub: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  imdCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  imdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  imdColorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  imdColorPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  imdSourceText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  imdHeadline: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 20,
  },
  imdDesc: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 17,
    marginBottom: 10,
  },
  instructionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#DC3545',
    marginBottom: 10,
  },
  instructionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '600',
    lineHeight: 16,
  },
  imdFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    paddingTop: 8,
  },
  imdValidity: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  imdAttribution: {
    fontSize: 9,
    color: '#64748B',
    fontStyle: 'italic',
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  weatherCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weatherSourceText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  obsTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  weatherMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  weatherMainLeft: {
    flex: 1,
  },
  weatherCondition: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10243A',
  },
  weatherStation: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  weatherTempBox: {
    alignItems: 'flex-end',
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: '900',
    color: '#10243A',
  },
  weatherFeels: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10243A',
  },
  weatherSourceAttribution: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  aqiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  aqiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aqiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  aqiTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10243A',
  },
  aqiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  aqiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  aqiBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aqiValueBox: {
    alignItems: 'center',
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  aqiValue: {
    fontSize: 30,
    fontWeight: '900',
  },
  aqiValueUnit: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
  aqiDetails: {
    flex: 1,
  },
  aqiParamText: {
    fontSize: 11,
    color: '#475569',
  },
  aqiParamBold: {
    fontWeight: '800',
    color: '#10243A',
  },
  aqiNoticeText: {
    fontSize: 8.5,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 12,
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  forecastTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10243A',
    textTransform: 'uppercase',
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  forecastItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  forecastDay: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10243A',
  },
  forecastDate: {
    fontSize: 10,
    color: '#64748B',
  },
  forecastTemps: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10243A',
  },
  forecastRain: {
    fontSize: 9,
    color: '#0284C7',
    fontWeight: '700',
    marginTop: 2,
  },
  mapBanner: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  mapBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  mapBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  mapBannerSub: {
    fontSize: 10,
    color: '#0C4A6E',
    marginTop: 2,
  },
  sosButton: {
    backgroundColor: '#DC3545',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#DC3545',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  sosInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sosTextContainer: {
    flex: 1,
  },
  sosTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  sosSub: {
    fontSize: 10,
    color: '#FEE2E2',
    marginTop: 3,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10243A',
    textTransform: 'uppercase',
  },
  noShelterCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noShelterText: {
    fontSize: 11,
    color: '#64748B',
  },
  shelterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    flexDirection: 'row',
    gap: 12,
  },
  shelterIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shelterInfo: {
    flex: 1,
  },
  shelterName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10243A',
  },
  shelterAddress: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  shelterFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  featurePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featurePillText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '700',
  },
  shelterContact: {
    fontSize: 10,
    color: '#166534',
    marginTop: 2,
  },
  contactBold: {
    fontWeight: '800',
  },
  quickGrid: {
    gap: 10,
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  gridCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10243A',
  },
  gridCardDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    marginRight: 24,
  },
  gridArrow: {
    position: 'absolute',
    right: 14,
    top: 18,
  },
});
