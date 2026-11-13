import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { mobileApi } from '../../services/mobileApi';
import { Colors } from '../../constants/Colors';
import {
  ArrowLeft,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  ExternalLink,
  PhoneCall,
  Share2,
} from 'lucide-react-native';
import { useLocation } from '../../context/LocationContext';

export default function AlertDetailsScreen() {
  const router = useRouter();
  const { location } = useLocation();

  const { data: intel } = useQuery({
    queryKey: ['live-intelligence-alert-detail', location.district],
    queryFn: () =>
      mobileApi.getLiveIntelligence(
        location.latitude,
        location.longitude,
        location.state,
        location.district
      ),
  });

  const alert = intel?.districtAlert;
  const isRed = alert?.imdColorCode === 'RED';
  const isOrange = alert?.imdColorCode === 'ORANGE';
  const bannerColor = isRed ? '#DC2626' : isOrange ? '#D97706' : '#16A34A';

  const defaultInstructions = [
    'Avoid low-lying areas and active river banks.',
    'Be prepared for surface waterlogging and sudden water level rises.',
    'Keep emergency power batteries and prescribed medicines accessible.',
    'Follow official district disaster management directives and verified advisories.',
  ];

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Official Weather Alert</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Large Alert Banner (Matching Screen 5) */}
        <View style={[styles.mainBanner, { backgroundColor: bannerColor }]}>
          <View style={styles.bannerIconBox}>
            <Flame size={24} color="#FFFFFF" />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>
              {alert?.headline || 'Heavy Rainfall Warning'}
            </Text>
            <Text style={styles.bannerSub}>
              IMD • District Level Bulletin
            </Text>
          </View>
        </View>

        {/* Metadata Details Card */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>State</Text>
            <Text style={styles.metaValue}>{alert?.state || location.state}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Affected Districts</Text>
            <Text style={styles.metaValue}>{alert?.district || location.district}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Severity</Text>
            <Text style={[styles.metaValue, { color: isRed ? '#EF4444' : '#F59E0B' }]}>
              {alert?.imdColorCode || 'ORANGE'} ({alert?.severityLevel || 'Take Action'})
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Valid Till</Text>
            <Text style={styles.metaValue}>
              {alert?.validUntil
                ? new Date(alert.validUntil).toLocaleString([], {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '14 Nov 2026, 08:30 PM'}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Issued At</Text>
            <Text style={styles.metaValue}>
              {alert?.publishedAt
                ? new Date(alert.publishedAt).toLocaleString([], {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '13 Nov 2026, 11:00 AM'}
            </Text>
          </View>
        </View>

        {/* Safety Instructions (Matching Screen 5) */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Safety Instructions</Text>

          <View style={styles.bulletList}>
            {defaultInstructions.map((inst, index) => (
              <View key={index} style={styles.bulletRow}>
                <AlertTriangle size={16} color="#DC2626" style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}>{inst}</Text>
              </View>
            ))}
          </View>

          {alert?.safetyInstructions && (
            <View style={styles.specificBox}>
              <Text style={styles.specificTitle}>DISTRICT SPECIFIC DIRECTIVE:</Text>
              <Text style={styles.specificText}>{alert.safetyInstructions}</Text>
            </View>
          )}
        </View>

        {/* Bottom Actions */}
        <TouchableOpacity
          style={styles.sosCta}
          onPress={() => router.push('/(tabs)/emergency')}
          activeOpacity={0.85}
        >
          <Text style={styles.sosCtaText}>Request Priority Rescue / Assistance</Text>
        </TouchableOpacity>
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#111D2D',
    borderWidth: 1,
    borderColor: '#1E2F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mainBanner: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  bannerSub: {
    fontSize: 11,
    color: '#FEE2E2',
    marginTop: 2,
    fontWeight: '600',
  },
  metaCard: {
    backgroundColor: '#111D2D',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E2F46',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1A2A3E',
  },
  instructionCard: {
    backgroundColor: '#111D2D',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E2F46',
    padding: 16,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  bulletList: {
    gap: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    fontWeight: '500',
  },
  specificBox: {
    backgroundColor: '#0B131E',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  specificTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 4,
  },
  specificText: {
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  sosCta: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sosCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
