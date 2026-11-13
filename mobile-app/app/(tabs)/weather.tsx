import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { mobileApi } from '../../services/mobileApi';
import { Colors } from '../../constants/Colors';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Flame,
  AlertTriangle,
  Compass,
  Radio,
  MapPin,
  Activity,
  Layers,
  ShieldAlert,
  Info,
  Calendar,
  Waves,
  Eye,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import { useLocation } from '../../context/LocationContext';
import LocationPickerModal from '../../components/LocationPickerModal';
import { IndiaDisasterMapRegion } from '../../types';

export default function WeatherScreen() {
  const { location, openLocationPicker } = useLocation();
  const [activeTab, setActiveTab] = useState<'METEOROLOGY' | 'INDIA_MAP'>('METEOROLOGY');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'ALL' | 'RED' | 'ORANGE' | 'YELLOW'>('ALL');
  const [selectedRegionModal, setSelectedRegionModal] = useState<IndiaDisasterMapRegion | null>(null);

  const {
    data: intel,
    isLoading: weatherLoading,
    refetch: refetchWeather,
    isRefetching,
  } = useQuery({
    queryKey: ['live-intelligence-weather', location.district, location.latitude, location.longitude],
    queryFn: () =>
      mobileApi.getLiveIntelligence(
        location.latitude,
        location.longitude,
        location.state,
        location.district
      ),
    refetchInterval: 30000,
  });

  const {
    data: indiaMap = [],
    isLoading: mapLoading,
    refetch: refetchMap,
  } = useQuery({
    queryKey: ['india-disaster-map'],
    queryFn: () => mobileApi.getIndiaDisasterMap(),
    refetchInterval: 60000,
  });

  const onRefresh = () => {
    refetchWeather();
    refetchMap();
  };

  const weather = intel?.weather;
  const aqi = intel?.airQuality;
  const alert = intel?.districtAlert;
  const forecast = intel?.forecast || [];

  const filteredMapRegions = indiaMap.filter((r) => {
    if (selectedSeverityFilter === 'ALL') return true;
    return r.alertLevel === selectedSeverityFilter;
  });

  const redCount = indiaMap.filter((r) => r.alertLevel === 'RED').length;
  const orangeCount = indiaMap.filter((r) => r.alertLevel === 'ORANGE').length;
  const yellowCount = indiaMap.filter((r) => r.alertLevel === 'YELLOW').length;

  return (
    <View style={styles.screenWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#DC3545']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.sourcePill}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: (weather?.isLive || weather?.status === 'LIVE') ? '#22C55E' : '#94A3B8' },
                ]}
              />
              <Text style={styles.sourceText}>
                {weather?.status === 'LIVE' ? 'LIVE OFFICIAL FEEDS' : 'CACHED TELEMETRY'} • IMD & CPCB
              </Text>
            </View>

            <TouchableOpacity
              style={styles.changeLocBtn}
              onPress={openLocationPicker}
              activeOpacity={0.8}
            >
              <MapPin size={12} color="#F59E0B" />
              <Text style={styles.changeLocText}>
                {location.district}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>India Disaster Intelligence</Text>
          <Text style={styles.subtitle}>
            Continuous Doppler radar tracking, Central Pollution Control Board telemetry, and multi-hazard bulletins.
          </Text>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'METEOROLOGY' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('METEOROLOGY')}
            >
              <Thermometer
                size={14}
                color={activeTab === 'METEOROLOGY' ? '#FFFFFF' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'METEOROLOGY' && styles.tabButtonTextActive,
                ]}
              >
                District Weather & AQI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'INDIA_MAP' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('INDIA_MAP')}
            >
              <Layers
                size={14}
                color={activeTab === 'INDIA_MAP' ? '#FFFFFF' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'INDIA_MAP' && styles.tabButtonTextActive,
                ]}
              >
                India Multi-Hazard Map ({indiaMap.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Spinner */}
        {weatherLoading && !intel && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#DC3545" />
            <Text style={styles.loadingBoxText}>Syncing ground meteorological data...</Text>
          </View>
        )}

        {/* TAB 1: DISTRICT METEOROLOGY & CPCB AQI */}
        {activeTab === 'METEOROLOGY' && (
          <View>
            {/* Primary Severe Thermal / Weather Card */}
            {weather && (
              <View style={styles.mainCard}>
                <View style={styles.cardTopRow}>
                  <View>
                    <View style={styles.locationTag}>
                      <MapPin size={12} color="#DC3545" />
                      <Text style={styles.locationTagText}>
                        {location.district}, {location.state}
                      </Text>
                    </View>
                    <Text style={styles.conditionText}>
                      {weather.weatherCondition}
                    </Text>
                    <Text style={styles.subtext}>
                      Observed at: {new Date(weather.observationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  <View style={styles.tempBox}>
                    <Text style={styles.tempText}>{weather.temperature?.toFixed(1)}°</Text>
                    <Text style={styles.feelsLikeText}>
                      Feels like {weather.apparentTemperature?.toFixed(1)}°C
                    </Text>
                  </View>
                </View>

                {/* 6-Metric Environmental Telemetry Grid */}
                <View style={styles.gaugeGrid}>
                  <View style={styles.gaugeItem}>
                    <Thermometer size={18} color="#DC3545" />
                    <Text style={styles.gaugeLabel}>Temperature</Text>
                    <Text style={styles.gaugeValue}>{weather.temperature?.toFixed(1)}°C</Text>
                  </View>
                  <View style={styles.gaugeItem}>
                    <Droplets size={18} color="#2563EB" />
                    <Text style={styles.gaugeLabel}>Rel. Humidity</Text>
                    <Text style={styles.gaugeValue}>{weather.humidity?.toFixed(0)}%</Text>
                  </View>
                  <View style={styles.gaugeItem}>
                    <CloudRain size={18} color="#0891B2" />
                    <Text style={styles.gaugeLabel}>Precipitation</Text>
                    <Text style={styles.gaugeValue}>{weather.precipitationMm?.toFixed(1)} mm</Text>
                  </View>
                  <View style={styles.gaugeItem}>
                    <Wind size={18} color="#475569" />
                    <Text style={styles.gaugeLabel}>Wind Speed</Text>
                    <Text style={styles.gaugeValue}>{weather.windSpeedKmh?.toFixed(1)} km/h</Text>
                  </View>
                  <View style={styles.gaugeItem}>
                    <Compass size={18} color="#7C3AED" />
                    <Text style={styles.gaugeLabel}>Wind Heading</Text>
                    <Text style={styles.gaugeValue}>{weather.windDirectionDeg?.toFixed(0)}°</Text>
                  </View>
                  <View style={styles.gaugeItem}>
                    <Activity size={18} color="#D97706" />
                    <Text style={styles.gaugeLabel}>Barometer</Text>
                    <Text style={styles.gaugeValue}>{weather.surfacePressureHpa?.toFixed(0)} hPa</Text>
                  </View>
                </View>

                {/* Data Provenance Badge */}
                <View style={styles.provenanceRow}>
                  <Info size={12} color="#64748B" />
                  <Text style={styles.provenanceText}>
                    Grounding: {weather.source}
                  </Text>
                </View>
              </View>
            )}

            {/* Central Pollution Control Board (CPCB) NAQI Deep Dive */}
            {aqi && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Activity size={16} color={aqi.categoryColor} />
                  <Text style={styles.sectionTitle}>
                    CPCB National Air Quality Index (NAQI)
                  </Text>
                </View>

                <View style={styles.aqiMetricRow}>
                  <View style={[styles.aqiPill, { borderColor: aqi.categoryColor }]}>
                    <Text style={[styles.aqiNumber, { color: aqi.categoryColor }]}>
                      {aqi.aqi}
                    </Text>
                    <Text style={[styles.aqiCatText, { color: aqi.categoryColor }]}>
                      {aqi.category.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.aqiDetailsCol}>
                    <View style={styles.aqiParamLine}>
                      <Text style={styles.aqiParamLabel}>Fine Particulate (PM2.5):</Text>
                      <Text style={styles.aqiParamVal}>{aqi.pm25?.toFixed(1)} µg/m³</Text>
                    </View>
                    <View style={styles.aqiParamLine}>
                      <Text style={styles.aqiParamLabel}>Coarse Particulate (PM10):</Text>
                      <Text style={styles.aqiParamVal}>{aqi.pm10?.toFixed(1)} µg/m³</Text>
                    </View>
                    <Text style={styles.aqiGuidelineNotice}>
                      Standard Scale: {aqi.cpcbClassificationNotice}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* 3-Day Forecast Table */}
            {forecast.length > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Calendar size={16} color="#10243A" />
                  <Text style={styles.sectionTitle}>
                    3-Day Meteorological Outlook for {location.district}
                  </Text>
                </View>

                {forecast.map((f, i) => (
                  <View key={i} style={styles.forecastRow}>
                    <View style={styles.forecastDayCol}>
                      <Text style={styles.forecastDayBold}>{f.dayOfWeek}</Text>
                      <Text style={styles.forecastDateMuted}>{f.dateStr}</Text>
                    </View>
                    <View style={styles.forecastCondCol}>
                      <CloudRain size={16} color="#0284C7" />
                      <Text style={styles.forecastCondText}>{f.condition}</Text>
                    </View>
                    <View style={styles.forecastTempsCol}>
                      <Text style={styles.forecastMax}>{f.maxTemp?.toFixed(0)}°C</Text>
                      <Text style={styles.forecastMin}>/ {f.minTemp?.toFixed(0)}°C</Text>
                    </View>
                    <View style={styles.forecastRainCol}>
                      <Text style={styles.forecastRainVal}>{f.rainProbability}%</Text>
                      <Text style={styles.forecastRainLabel}>precip</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TAB 2: INDIA MULTI-HAZARD DISASTER MAP */}
        {activeTab === 'INDIA_MAP' && (
          <View>
            {/* National Severity Summary Bar */}
            <View style={styles.summaryBar}>
              <View style={styles.summaryPill}>
                <View style={[styles.summaryDot, { backgroundColor: '#DC2626' }]} />
                <Text style={styles.summaryText}>RED ({redCount})</Text>
              </View>
              <View style={styles.summaryPill}>
                <View style={[styles.summaryDot, { backgroundColor: '#D97706' }]} />
                <Text style={styles.summaryText}>ORANGE ({orangeCount})</Text>
              </View>
              <View style={styles.summaryPill}>
                <View style={[styles.summaryDot, { backgroundColor: '#EAB308' }]} />
                <Text style={styles.summaryText}>YELLOW ({yellowCount})</Text>
              </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {(['ALL', 'RED', 'ORANGE', 'YELLOW'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterPill,
                    selectedSeverityFilter === filter && styles.filterPillActive,
                  ]}
                  onPress={() => setSelectedSeverityFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedSeverityFilter === filter && styles.filterPillTextActive,
                    ]}
                  >
                    {filter === 'ALL' ? 'All Alerts' : `${filter} Alerts`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Regional Alert Cards */}
            {filteredMapRegions.map((region) => {
              const cardBorder =
                region.alertLevel === 'RED'
                  ? '#F87171'
                  : region.alertLevel === 'ORANGE'
                  ? '#FBBF24'
                  : '#FDE047';
              const badgeColor =
                region.alertLevel === 'RED'
                  ? '#DC2626'
                  : region.alertLevel === 'ORANGE'
                  ? '#D97706'
                  : '#CA8A04';
              const isSelected = selectedRegionModal?.id === region.id;

              return (
                <TouchableOpacity
                  key={region.id}
                  style={[
                    styles.regionCard,
                    { borderColor: cardBorder },
                    isSelected && styles.regionCardSelected,
                  ]}
                  onPress={() =>
                    setSelectedRegionModal(isSelected ? null : region)
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.regionCardHeader}>
                    <View style={styles.regionTitleRow}>
                      <MapPin size={16} color={badgeColor} />
                      <Text style={styles.regionDistrict}>
                        {region.district}, {region.state}
                      </Text>
                    </View>

                    <View style={[styles.alertBadge, { backgroundColor: badgeColor }]}>
                      <Text style={styles.alertBadgeText}>
                        {region.alertLevel} ALERT
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.regionSector}>{region.regionName}</Text>
                  <Text style={styles.regionHeadline}>{region.headline}</Text>

                  {/* Quick stats strip */}
                  <View style={styles.regionStatsStrip}>
                    <Text style={styles.regionStatItem}>
                      Hazard: <Text style={styles.boldText}>{region.hazardType.replace('_', ' ')}</Text>
                    </Text>
                    <Text style={styles.regionStatItem}>
                      Vulnerable: <Text style={styles.boldText}>{region.affectedVulnerableCount} citizens</Text>
                    </Text>
                  </View>

                  {/* Expanded Advisory Details */}
                  {isSelected && (
                    <View style={styles.advisoryExpanded}>
                      <Text style={styles.advisoryTitle}>OFFICIAL DIRECTIVE:</Text>
                      <Text style={styles.advisoryText}>{region.advisory}</Text>
                      <View style={styles.affectedTags}>
                        {region.affectedCategories.map((cat, idx) => (
                          <View key={idx} style={styles.catTag}>
                            <Text style={styles.catTagText}>{cat.replace('_', ' ')}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.regionSource}>Source: {region.source}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Global Location Picker */}
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
  header: {
    backgroundColor: '#10243A',
    marginHorizontal: -16,
    marginTop: -48,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sourceText: {
    color: '#E2E8F0',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  changeLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  changeLocText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#071320',
    borderRadius: 14,
    padding: 4,
    marginTop: 14,
    gap: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#DC3545',
  },
  tabButtonText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: Colors.white,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  loadingBoxText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC3545',
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10243A',
  },
  subtext: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  tempBox: {
    alignItems: 'flex-end',
  },
  tempText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#10243A',
  },
  feelsLikeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  gaugeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  gaugeItem: {
    width: '30%',
    alignItems: 'center',
    gap: 2,
  },
  gaugeLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
  gaugeValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10243A',
  },
  provenanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  provenanceText: {
    fontSize: 9,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10243A',
    textTransform: 'uppercase',
  },
  aqiMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  aqiPill: {
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  aqiNumber: {
    fontSize: 26,
    fontWeight: '900',
  },
  aqiCatText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aqiDetailsCol: {
    flex: 1,
    gap: 2,
  },
  aqiParamLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aqiParamLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  aqiParamVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10243A',
  },
  aqiGuidelineNotice: {
    fontSize: 8.5,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 12,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  forecastDayCol: {
    width: 60,
  },
  forecastDayBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10243A',
  },
  forecastDateMuted: {
    fontSize: 9,
    color: '#94A3B8',
  },
  forecastCondCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  forecastCondText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  forecastTempsCol: {
    flexDirection: 'row',
    gap: 2,
  },
  forecastMax: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10243A',
  },
  forecastMin: {
    fontSize: 12,
    color: '#64748B',
  },
  forecastRainCol: {
    alignItems: 'flex-end',
    width: 50,
  },
  forecastRainVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  forecastRainLabel: {
    fontSize: 8,
    color: '#94A3B8',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10243A',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: '#10243A',
    borderColor: '#10243A',
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillTextActive: {
    color: Colors.white,
  },
  regionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  regionCardSelected: {
    backgroundColor: '#F8FAFC',
  },
  regionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  regionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  regionDistrict: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10243A',
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  alertBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  regionSector: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  regionHeadline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  regionStatsStrip: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },
  regionStatItem: {
    fontSize: 10,
    color: '#64748B',
  },
  boldText: {
    fontWeight: '800',
    color: '#10243A',
  },
  advisoryExpanded: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  advisoryTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC3545',
    marginBottom: 2,
  },
  advisoryText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    marginBottom: 8,
  },
  affectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  catTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catTagText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '700',
  },
  regionSource: {
    fontSize: 9,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
});
