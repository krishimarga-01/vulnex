import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
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
} from 'lucide-react-native';

export default function WeatherScreen() {
  const {
    data: weather,
    isLoading: weatherLoading,
    refetch: refetchWeather,
  } = useQuery({
    queryKey: ['mobile-weather-detail'],
    queryFn: () => mobileApi.getCurrentWeather(),
    refetchInterval: 12000,
  });

  const {
    data: alerts = [],
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['mobile-alerts-all'],
    queryFn: () => mobileApi.getNearbyAlerts(),
  });

  const onRefresh = () => {
    refetchWeather();
    refetchAlerts();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={weatherLoading} onRefresh={onRefresh} />}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.sourcePill}>
          <Radio size={12} color="#16A34A" />
          <Text style={styles.sourceText}>Live Telemetry: Open-Meteo & IMD</Text>
        </View>
        <Text style={styles.title}>Weather Hazard Monitor</Text>
        <Text style={styles.subtitle}>
          Continuous meteorological tracking for extreme thermal, inundation, and wind events.
        </Text>
      </View>

      {/* Main Thermal Severity Card */}
      <View style={styles.mainCard}>
        <View style={styles.mainTop}>
          <View>
            <View style={styles.locationPill}>
              <MapPin size={12} color="#F59E0B" />
              <Text style={styles.locationText}>{weather?.regionName || 'Coastal Ward Sector 4'}</Text>
            </View>
            <Text style={styles.conditionText}>
              {weather?.weatherCondition || 'Extreme Heatwave & Swell'}
            </Text>
          </View>
          <View style={styles.tempBox}>
            <Text style={styles.tempText}>{weather?.temperature || 43.5}°</Text>
            <Text style={styles.feelsLikeText}>Feels like {weather?.feelsLike || 48.2}°C</Text>
          </View>
        </View>

        <View style={styles.gaugeGrid}>
          <View style={styles.gaugeItem}>
            <Thermometer size={18} color="#DC3545" />
            <Text style={styles.gaugeLabel}>Temperature</Text>
            <Text style={styles.gaugeValue}>{weather?.temperature || 43.5}°C</Text>
          </View>
          <View style={styles.gaugeItem}>
            <Droplets size={18} color="#2563EB" />
            <Text style={styles.gaugeLabel}>Humidity</Text>
            <Text style={styles.gaugeValue}>{weather?.humidity || 78}%</Text>
          </View>
          <View style={styles.gaugeItem}>
            <CloudRain size={18} color="#0891B2" />
            <Text style={styles.gaugeLabel}>Rainfall</Text>
            <Text style={styles.gaugeValue}>{weather?.precipitation || 0} mm</Text>
          </View>
          <View style={styles.gaugeItem}>
            <Wind size={18} color="#475569" />
            <Text style={styles.gaugeLabel}>Wind Speed</Text>
            <Text style={styles.gaugeValue}>{weather?.windSpeed || 32} km/h</Text>
          </View>
        </View>
      </View>

      {/* Extreme Weather Warnings List */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Active Official Weather Warnings</Text>

        {alerts.map((alert) => (
          <View
            key={alert.id}
            style={[
              styles.alertCard,
              alert.severity === 'EXTREME' ? styles.alertRed : styles.alertOrange,
            ]}
          >
            <View style={styles.alertTopRow}>
              <View style={styles.alertTagRow}>
                <AlertTriangle size={14} color={Colors.white} />
                <Text style={styles.alertBadgeText}>{alert.severity} ALERT</Text>
              </View>
              <Text style={styles.alertCodeText}>{alert.alertCode}</Text>
            </View>

            <Text style={styles.alertHeading}>{alert.headline}</Text>
            <Text style={styles.alertDescription}>{alert.description}</Text>

            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>Safety Instructions:</Text>
              <Text style={styles.instructionsText}>{alert.safetyInstructions}</Text>
            </View>

            <View style={styles.alertFooter}>
              <Text style={styles.alertMeta}>Sector: {alert.affectedRegionName}</Text>
              <Text style={styles.alertMeta}>
                Valid Until: {new Date(alert.effectiveUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Safety Advisories for High Heat / Flood */}
      <View style={styles.advisoryCard}>
        <Text style={styles.advisoryTitle}>Extreme Weather Precautions</Text>
        <Text style={styles.advisoryItem}>
          • Keep elderly persons in the coolest ground-floor room with active fan or air-conditioning.
        </Text>
        <Text style={styles.advisoryItem}>
          • Ensure pediatric hydration with oral rehydration solution (ORS).
        </Text>
        <Text style={styles.advisoryItem}>
          • If oxygen concentrator power fails, tap the SOS button immediately for emergency generator dispatch.
        </Text>
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
  header: {
    marginBottom: 16,
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10243A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 18,
  },
  mainTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 14,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10243A',
    marginTop: 4,
  },
  tempBox: {
    alignItems: 'flex-end',
  },
  tempText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#DC3545',
  },
  feelsLikeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  gaugeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gaugeItem: {
    alignItems: 'center',
    flex: 1,
  },
  gaugeLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  gaugeValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10243A',
    marginTop: 2,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#10243A',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  alertCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  alertRed: {
    backgroundColor: '#DC3545',
  },
  alertOrange: {
    backgroundColor: '#D97706',
  },
  alertTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  alertBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  alertCodeText: {
    color: '#F8D7DA',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  alertHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 2,
  },
  alertDescription: {
    fontSize: 11,
    color: '#F8D7DA',
    marginTop: 4,
    lineHeight: 16,
  },
  instructionsBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  instructionsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  instructionsText: {
    fontSize: 11,
    color: Colors.white,
    lineHeight: 15,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  alertMeta: {
    fontSize: 10,
    color: '#F8D7DA',
  },
  advisoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  advisoryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10243A',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  advisoryItem: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 6,
  },
});
