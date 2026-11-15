import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Svg, { Path, G, Circle, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { mobileApi } from '../../services/mobileApi';
import { Colors } from '../../constants/Colors';
import {
  Layers,
  MapPin,
  ChevronRight,
  Flame,
  AlertTriangle,
  CloudRain,
  ShieldAlert,
  ArrowLeft,
  SlidersHorizontal,
  Compass,
  Globe,
  Crosshair,
} from 'lucide-react-native';
import { IndiaDisasterMapRegion } from '../../types';
import { useLocation } from '../../context/LocationContext';
import LiveGoogleMap, { LiveGoogleMapRef } from '../../components/LiveGoogleMap';

export default function IndiaDisasterMapScreen() {
  const router = useRouter();
  const { location, detectGpsLocation } = useLocation();
  const mapRef = useRef<LiveGoogleMapRef>(null);

  const [selectedRegionId, setSelectedRegionId] = useState<string>('MAP-IN-KA-KDG');
  const [activeLayer, setActiveLayer] = useState<'ALERTS' | 'SHELTERS'>('ALERTS');
  const [mapViewMode, setMapViewMode] = useState<'GOOGLE_MAPS' | 'INDIA_VECTOR'>('GOOGLE_MAPS');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'RED' | 'ORANGE' | 'YELLOW'>('ALL');

  const {
    data: regions = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['india-disaster-map-screen'],
    queryFn: () => mobileApi.getIndiaDisasterMap(),
    refetchInterval: 60000,
  });

  const { data: intel } = useQuery({
    queryKey: ['live-intelligence-map', location.district, location.latitude, location.longitude],
    queryFn: () =>
      mobileApi.getLiveIntelligence(
        location.latitude,
        location.longitude,
        location.state,
        location.district
      ),
  });

  const filteredRegions = regions.filter((r) => {
    if (filterLevel === 'ALL') return true;
    return r.alertLevel === filterLevel;
  });

  const selectedRegion =
    regions.find((r) => r.id === selectedRegionId) || regions[0];

  const handleSelectRegion = (item: IndiaDisasterMapRegion) => {
    setSelectedRegionId(item.id);
    if (mapRef.current) {
      mapRef.current.focusRegion(item.latitude, item.longitude, 10);
    }
  };

  const handleFocusMyLocation = async () => {
    await detectGpsLocation();
    if (mapRef.current) {
      mapRef.current.focusMyLocation();
    }
  };

  const handleFitAllIndia = () => {
    if (mapRef.current) {
      mapRef.current.resetToAllIndia();
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#DC2626"
            colors={['#DC2626']}
          />
        }
      >
        {/* Header (Matching Screen 4) */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.title}>Disaster Map (India)</Text>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() =>
              setActiveLayer(activeLayer === 'ALERTS' ? 'SHELTERS' : 'ALERTS')
            }
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Mode Switcher */}
        <View style={styles.modeSwitcher}>
          <TouchableOpacity
            style={[styles.modeBtn, mapViewMode === 'GOOGLE_MAPS' && styles.modeBtnActive]}
            onPress={() => setMapViewMode('GOOGLE_MAPS')}
            activeOpacity={0.8}
          >
            <Globe size={14} color={mapViewMode === 'GOOGLE_MAPS' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.modeBtnText, mapViewMode === 'GOOGLE_MAPS' && styles.modeBtnTextActive]}>
              Live Interactive Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, mapViewMode === 'INDIA_VECTOR' && styles.modeBtnActive]}
            onPress={() => setMapViewMode('INDIA_VECTOR')}
            activeOpacity={0.8}
          >
            <Compass size={14} color={mapViewMode === 'INDIA_VECTOR' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.modeBtnText, mapViewMode === 'INDIA_VECTOR' && styles.modeBtnTextActive]}>
              India Overview
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hazard Quick Filter Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, filterLevel === 'ALL' && styles.filterChipActive]}
            onPress={() => setFilterLevel('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, filterLevel === 'ALL' && styles.filterChipTextActive]}>
              All Zones ({regions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterLevel === 'RED' && styles.filterChipActiveRed]}
            onPress={() => setFilterLevel('RED')}
            activeOpacity={0.7}
          >
            <View style={[styles.filterDot, { backgroundColor: '#DC2626' }]} />
            <Text style={[styles.filterChipText, filterLevel === 'RED' && styles.filterChipTextActive]}>
              Red Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterLevel === 'ORANGE' && styles.filterChipActiveOrange]}
            onPress={() => setFilterLevel('ORANGE')}
            activeOpacity={0.7}
          >
            <View style={[styles.filterDot, { backgroundColor: '#EA580C' }]} />
            <Text style={[styles.filterChipText, filterLevel === 'ORANGE' && styles.filterChipTextActive]}>
              Orange Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterLevel === 'YELLOW' && styles.filterChipActiveYellow]}
            onPress={() => setFilterLevel('YELLOW')}
            activeOpacity={0.7}
          >
            <View style={[styles.filterDot, { backgroundColor: '#EAB308' }]} />
            <Text style={[styles.filterChipText, filterLevel === 'YELLOW' && styles.filterChipTextActive]}>
              Yellow Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterChipAction}
            onPress={handleFocusMyLocation}
            activeOpacity={0.7}
          >
            <Crosshair size={13} color="#38BDF8" />
            <Text style={styles.filterChipActionText}>My GPS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterChipAction}
            onPress={handleFitAllIndia}
            activeOpacity={0.7}
          >
            <Globe size={13} color="#10B981" />
            <Text style={styles.filterChipActionText}>All India</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* VIEW MODE 1: REAL-WORLD LIVE INTERACTIVE MAP */}
        {mapViewMode === 'GOOGLE_MAPS' ? (
          <View style={styles.googleMapWrapper}>
            <View style={styles.layerInfoRow}>
              <View style={styles.layerTag}>
                <MapPin size={13} color="#38BDF8" />
                <Text style={styles.layerTagText}>
                  LIVE INDIA DISASTER SATELLITE RADAR
                </Text>
              </View>
              <Text style={styles.sourceText}>IMD / NDMA / CPCB</Text>
            </View>

            {/* Touch isolation wrapper prevents ScrollView from hijacking map zoom/pan */}
            <View
              style={styles.mapTouchWrapper}
              onTouchStart={() => setScrollEnabled(false)}
              onTouchEnd={() => setScrollEnabled(true)}
              onTouchCancel={() => setScrollEnabled(true)}
            >
              <LiveGoogleMap
                ref={mapRef}
                latitude={location.latitude}
                longitude={location.longitude}
                district={location.district}
                state={location.state}
                disasterRegions={filteredRegions}
                shelters={intel?.nearbyShelters || []}
                alertLevel={intel?.districtAlert?.imdColorCode || 'YELLOW'}
                alertHeadline={intel?.districtAlert?.headline || 'Active Monitoring Zone'}
                height={420}
              />
            </View>

            {/* Map Controls Legend */}
            <View style={styles.gmapLegend}>
              <View style={styles.gmapLegendItem}>
                <View style={[styles.gmapDot, { backgroundColor: '#38BDF8' }]} />
                <Text style={styles.gmapLegendText}>Your GPS</Text>
              </View>
              <View style={styles.gmapLegendItem}>
                <View style={[styles.gmapDot, { backgroundColor: '#DC2626' }]} />
                <Text style={styles.gmapLegendText}>Red Alert</Text>
              </View>
              <View style={styles.gmapLegendItem}>
                <View style={[styles.gmapDot, { backgroundColor: '#EA580C' }]} />
                <Text style={styles.gmapLegendText}>Orange Alert</Text>
              </View>
              <View style={styles.gmapLegendItem}>
                <View style={[styles.gmapDot, { backgroundColor: '#EAB308' }]} />
                <Text style={styles.gmapLegendText}>Yellow Alert</Text>
              </View>
              <View style={styles.gmapLegendItem}>
                <View style={[styles.gmapDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.gmapLegendText}>Shelter</Text>
              </View>
            </View>
          </View>
        ) : (
          /* VIEW MODE 2: INDIA OVERVIEW VECTOR MAP (Matching Screen 4) */
          <View style={styles.mapCard}>
            <View style={styles.layerInfoRow}>
              <View style={styles.layerTag}>
                <Layers size={13} color="#38BDF8" />
                <Text style={styles.layerTagText}>
                  {activeLayer === 'ALERTS' ? 'IMD MULTI-HAZARD WARNINGS' : 'RELIEF SHELTER NETWORK'}
                </Text>
              </View>
              <Text style={styles.sourceText}>NDMA / IMD</Text>
            </View>

            <View style={styles.mapGraphicWrapper}>
              <Svg viewBox="0 0 400 440" style={styles.svgMap}>
                {/* Silhouette of India */}
                <Path
                  d="M 180 30 
                     Q 210 20, 240 40 
                     Q 260 70, 250 110 
                     Q 330 110, 370 120 
                     Q 390 140, 360 170 
                     Q 330 160, 300 170 
                     Q 280 200, 260 220 
                     Q 280 260, 260 300 
                     Q 230 360, 200 410 
                     Q 180 430, 175 410 
                     Q 150 350, 140 300 
                     Q 110 260, 90 220 
                     Q 70 180, 80 140 
                     Q 110 120, 130 90 
                     Q 150 60, 180 30 Z"
                  fill="#132338"
                  stroke="#1E3A5F"
                  strokeWidth="2"
                />

                {/* North Zone (Green) */}
                <Path
                  d="M 180 40 Q 220 35, 235 65 Q 215 95, 170 85 Q 155 60, 180 40 Z"
                  fill="rgba(16, 185, 129, 0.25)"
                  stroke="#10B981"
                  strokeWidth="1.2"
                />

                {/* Central Plains (Yellow) */}
                <Path
                  d="M 155 130 Q 230 125, 250 160 Q 230 205, 160 195 Q 130 160, 155 130 Z"
                  fill="rgba(234, 179, 8, 0.35)"
                  stroke="#EAB308"
                  strokeWidth="1.2"
                />

                {/* Eastern Bengal & Assam (Orange) */}
                <Path
                  d="M 280 125 Q 360 130, 365 160 Q 320 175, 285 160 Z"
                  fill="rgba(245, 158, 11, 0.45)"
                  stroke="#F59E0B"
                  strokeWidth="1.2"
                />

                {/* Western Ghats & Karnataka / Kerala (Red Alert) */}
                <Path
                  d="M 140 270 Q 185 260, 190 320 Q 170 380, 155 350 Q 135 305, 140 270 Z"
                  fill="rgba(220, 38, 38, 0.55)"
                  stroke="#DC2626"
                  strokeWidth="1.5"
                />

                {/* Regional Alert Markers */}
                {regions.map((r, i) => {
                  const isRed = r.alertLevel === 'RED';
                  const isOrange = r.alertLevel === 'ORANGE';
                  const color = isRed ? '#EF4444' : isOrange ? '#F59E0B' : '#EAB308';

                  const cx = 100 + ((r.longitude - 72) / (90 - 72)) * 200;
                  const cy = 400 - ((r.latitude - 8) / (32 - 8)) * 360;

                  return (
                    <G key={r.id || i}>
                      <Circle
                        cx={Math.max(100, Math.min(300, cx))}
                        cy={Math.max(60, Math.min(390, cy))}
                        r={selectedRegionId === r.id ? 9 : 6}
                        fill={color}
                        stroke="#FFFFFF"
                        strokeWidth={selectedRegionId === r.id ? 2 : 1}
                      />
                    </G>
                  );
                })}
              </Svg>

              {/* Map Legend */}
              <View style={styles.legendBox}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
                  <Text style={styles.legendLabel}>Red Alert</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.legendLabel}>Orange Alert</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
                  <Text style={styles.legendLabel}>Yellow Alert</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendLabel}>No Alert</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Selected Region Highlight Card (Matching Screen 4 Bottom Card) */}
        {selectedRegion && (
          <TouchableOpacity
            style={[
              styles.highlightCard,
              selectedRegion.alertLevel === 'RED'
                ? styles.highlightRed
                : selectedRegion.alertLevel === 'ORANGE'
                ? styles.highlightOrange
                : styles.highlightYellow,
            ]}
            onPress={() => router.push('/(tabs)/alert-details')}
            activeOpacity={0.85}
          >
            <View style={styles.highlightLeftIcon}>
              <Flame
                size={22}
                color={
                  selectedRegion.alertLevel === 'RED'
                    ? '#EF4444'
                    : selectedRegion.alertLevel === 'ORANGE'
                    ? '#F59E0B'
                    : '#EAB308'
                }
              />
            </View>
            <View style={styles.highlightContent}>
              <Text style={styles.highlightState}>{selectedRegion.state}</Text>
              <Text style={styles.highlightHeadline}>
                {selectedRegion.hazardType.replace('_', ' ')} Warning
              </Text>
              <Text style={styles.highlightSub}>
                {selectedRegion.district} Sector • {selectedRegion.affectedVulnerableCount} Vulnerable Citizens
              </Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}

        {/* Monitored Indian Disaster Hotspots List */}
        <View style={styles.listSection}>
          <View style={styles.listSectionHeader}>
            <Text style={styles.listTitle}>
              Disaster Affected Hotspots ({filteredRegions.length})
            </Text>
            <Text style={styles.listSubTitle}>Tap hotspot to fly & zoom map</Text>
          </View>

          {filteredRegions.map((item) => {
            const isSelected = item.id === selectedRegionId;
            const badgeBg =
              item.alertLevel === 'RED'
                ? '#DC2626'
                : item.alertLevel === 'ORANGE'
                ? '#EA580C'
                : '#EAB308';

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.regionRow, isSelected && styles.regionRowActive]}
                onPress={() => handleSelectRegion(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.badgeIndicator, { backgroundColor: badgeBg }]} />
                <View style={styles.regionInfo}>
                  <View style={styles.rowTitleWrap}>
                    <Text style={styles.regionName}>
                      {item.district}, {item.state}
                    </Text>
                    <View style={[styles.microBadge, { backgroundColor: badgeBg }]}>
                      <Text style={styles.microBadgeText}>{item.alertLevel}</Text>
                    </View>
                  </View>
                  <Text style={styles.regionAlert} numberOfLines={1}>
                    {item.hazardType.replace('_', ' ')} • {item.headline}
                  </Text>
                </View>
                <ChevronRight size={16} color="#64748B" />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#111D2D',
    borderWidth: 1,
    borderColor: '#1E2F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modeSwitcher: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#111D2D',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: '#DC2626',
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111D2D',
    borderWidth: 1,
    borderColor: '#1E2F46',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#1E2F46',
    borderColor: '#38BDF8',
  },
  filterChipActiveRed: {
    backgroundColor: '#2A1215',
    borderColor: '#DC2626',
  },
  filterChipActiveOrange: {
    backgroundColor: '#2A1A12',
    borderColor: '#EA580C',
  },
  filterChipActiveYellow: {
    backgroundColor: '#2A2512',
    borderColor: '#EAB308',
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterChipAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162335',
    borderWidth: 1,
    borderColor: '#263D5C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  filterChipActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  googleMapWrapper: {
    marginBottom: 16,
  },
  mapTouchWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gmapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#111D2D',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginTop: 8,
  },
  gmapLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gmapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gmapLegendText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  mapCard: {
    backgroundColor: '#111D2D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginBottom: 16,
  },
  layerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  layerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E2F46',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  layerTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  sourceText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  mapGraphicWrapper: {
    position: 'relative',
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070D15',
    borderRadius: 12,
    overflow: 'hidden',
  },
  svgMap: {
    width: '100%',
    height: '100%',
  },
  legendBox: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(17, 29, 45, 0.92)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2F46',
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  highlightRed: {
    backgroundColor: '#1E1419',
    borderColor: '#DC2626',
  },
  highlightOrange: {
    backgroundColor: '#1F1A14',
    borderColor: '#F59E0B',
  },
  highlightYellow: {
    backgroundColor: '#1E1D14',
    borderColor: '#EAB308',
  },
  highlightLeftIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  highlightContent: {
    flex: 1,
  },
  highlightState: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  highlightHeadline: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  highlightSub: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
  listSection: {
    backgroundColor: '#111D2D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 12,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2F46',
  },
  regionRowActive: {
    backgroundColor: '#1E2F46',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  badgeIndicator: {
    width: 6,
    height: 24,
    borderRadius: 3,
    marginRight: 10,
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  regionAlert: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  alertTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  highlightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertLevelPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  alertLevelPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  listSectionHeader: {
    marginBottom: 12,
  },
  listSubTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rowTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  microBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  microBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
