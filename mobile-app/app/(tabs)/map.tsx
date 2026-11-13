import React, { useState } from 'react';
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
} from 'lucide-react-native';
import { IndiaDisasterMapRegion } from '../../types';

export default function IndiaDisasterMapScreen() {
  const router = useRouter();
  const [selectedRegionId, setSelectedRegionId] = useState<string>('MAP-IN-KA-KDG');
  const [activeLayer, setActiveLayer] = useState<'ALERTS' | 'SHELTERS'>('ALERTS');

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

  const selectedRegion =
    regions.find((r) => r.id === selectedRegionId) || regions[0];

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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

        {/* Map Container with Vector Outlines & Legend */}
        <View style={styles.mapCard}>
          {/* Top Layer Info */}
          <View style={styles.layerInfoRow}>
            <View style={styles.layerTag}>
              <Layers size={13} color="#38BDF8" />
              <Text style={styles.layerTagText}>
                {activeLayer === 'ALERTS' ? 'IMD MULTI-HAZARD WARNINGS' : 'RELIEF SHELTER NETWORK'}
              </Text>
            </View>
            <Text style={styles.sourceText}>NDMA / IMD</Text>
          </View>

          {/* India Vector Graphic Illustration */}
          <View style={styles.mapGraphicWrapper}>
            <Svg viewBox="0 0 400 440" style={styles.svgMap}>
              {/* Outer boundary stylized silhouette of India */}
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

              {/* State Zone Overlays */}
              {/* North Zone (Green / Safe) */}
              <Path
                d="M 180 40 Q 220 35, 235 65 Q 215 95, 170 85 Q 155 60, 180 40 Z"
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10B981"
                strokeWidth="1.2"
              />

              {/* Central Plains / North Interior (Yellow) */}
              <Path
                d="M 155 130 Q 230 125, 250 160 Q 230 205, 160 195 Q 130 160, 155 130 Z"
                fill="rgba(234, 179, 8, 0.35)"
                stroke="#EAB308"
                strokeWidth="1.2"
              />

              {/* Eastern Bay of Bengal & Assam (Orange) */}
              <Path
                d="M 280 125 Q 360 130, 365 160 Q 320 175, 285 160 Z"
                fill="rgba(245, 158, 11, 0.45)"
                stroke="#F59E0B"
                strokeWidth="1.2"
              />

              {/* Western Ghats & Karnataka / Kerala (Orange & Red) */}
              <Path
                d="M 140 270 Q 185 260, 190 320 Q 170 380, 155 350 Q 135 305, 140 270 Z"
                fill="rgba(220, 38, 38, 0.55)"
                stroke="#DC2626"
                strokeWidth="1.5"
              />

              {/* Hotspot Radar Pulse Circles */}
              {regions.map((r, i) => {
                const isRed = r.alertLevel === 'RED';
                const isOrange = r.alertLevel === 'ORANGE';
                const color = isRed ? '#EF4444' : isOrange ? '#F59E0B' : '#EAB308';

                // Map rough GPS to SVG coordinates
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

            {/* Map Legend (Matching Screen 4) */}
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

        {/* Monitored Indian Districts List */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>Active Regional Bulletins ({regions.length})</Text>

          {regions.map((item) => {
            const isSelected = item.id === selectedRegionId;
            const badgeBg =
              item.alertLevel === 'RED'
                ? '#DC2626'
                : item.alertLevel === 'ORANGE'
                ? '#D97706'
                : '#CA8A04';

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.regionRow, isSelected && styles.regionRowActive]}
                onPress={() => setSelectedRegionId(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.regionRowLeft}>
                  <MapPin size={16} color={badgeBg} />
                  <View>
                    <Text style={styles.regionRowDistrict}>
                      {item.district}, {item.state}
                    </Text>
                    <Text style={styles.regionRowHeadline} numberOfLines={1}>
                      {item.headline}
                    </Text>
                  </View>
                </View>

                <View style={[styles.rowBadge, { backgroundColor: badgeBg }]}>
                  <Text style={styles.rowBadgeText}>{item.alertLevel}</Text>
                </View>
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
    paddingBottom: 28,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mapCard: {
    backgroundColor: '#111D2D',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2F46',
    padding: 16,
    marginBottom: 16,
  },
  layerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  layerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  layerTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  sourceText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  mapGraphicWrapper: {
    position: 'relative',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgMap: {
    width: '100%',
    height: '100%',
  },
  legendBox: {
    position: 'absolute',
    right: 8,
    bottom: 12,
    backgroundColor: 'rgba(11, 19, 30, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2F46',
    gap: 6,
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
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    gap: 12,
    marginBottom: 18,
  },
  highlightRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  highlightOrange: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  highlightYellow: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  highlightLeftIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0B131E',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  highlightSub: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
  },
  listSection: {
    gap: 8,
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  regionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111D2D',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  regionRowActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#16253A',
  },
  regionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  regionRowDistrict: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  regionRowHeadline: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  rowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rowBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
