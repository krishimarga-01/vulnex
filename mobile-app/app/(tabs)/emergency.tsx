import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mobileApi } from '../../services/mobileApi';
import { EmergencyCategory, EmergencyPriority, EmergencyCaseRequest } from '../../types';
import { useLocation } from '../../context/LocationContext';
import {
  HeartPulse,
  Waves,
  LifeBuoy,
  Apple,
  MapPin,
  Phone,
  ChevronRight,
  ShieldCheck,
  Radio,
  AlertCircle,
  Truck,
  HelpCircle,
} from 'lucide-react-native';

const CATEGORIES: {
  key: EmergencyCategory;
  label: string;
  sub: string;
  icon: any;
  priority: EmergencyPriority;
}[] = [
  { key: 'MEDICAL_ASSISTANCE', label: 'Medical', sub: 'Urgent Care', icon: HeartPulse, priority: 'CRITICAL' },
  { key: 'EVACUATION', label: 'Evacuation', sub: 'Rising Water', icon: Waves, priority: 'HIGH' },
  { key: 'RESCUE', label: 'Rescue', sub: 'Trapped / Flooded', icon: LifeBuoy, priority: 'CRITICAL' },
  { key: 'FOOD_WATER', label: 'Food & Water', sub: 'Supplies Needed', icon: Apple, priority: 'MEDIUM' },
];

export default function EmergencyScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { location } = useLocation();

  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('MEDICAL_ASSISTANCE');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(
    `${location.locality}, ${location.district}, ${location.state} - PIN ${location.pincode}`
  );
  const [latitude, setLatitude] = useState(String(location.latitude));
  const [longitude, setLongitude] = useState(String(location.longitude));
  const [lastSubmittedCase, setLastSubmittedCase] = useState<string | null>(null);

  // Sync if location changes
  useEffect(() => {
    setAddress(`${location.locality}, ${location.district}, ${location.state} - PIN ${location.pincode}`);
    setLatitude(String(location.latitude));
    setLongitude(String(location.longitude));
  }, [location]);

  // Query recent cases
  const { data: myCases = [] } = useQuery({
    queryKey: ['mobile-cases-my'],
    queryFn: () => mobileApi.getMyEmergencyCases(),
    refetchInterval: 15000,
  });

  const latestCase = myCases[0];

  const mutation = useMutation({
    mutationFn: (req: EmergencyCaseRequest) => mobileApi.submitEmergencyRequest(req),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-cases-my'] });
      queryClient.invalidateQueries({ queryKey: ['emergency-cases-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setLastSubmittedCase(res.caseNumber);
      Alert.alert(
        'EMERGENCY DISPATCH TRANSMITTED',
        `Incident Case: ${res.caseNumber}\n\nYour emergency beacon has been ingested by District Disaster Command (${location.district}). First responders and NDRF/SDRF units are being alerted.`,
        [
          {
            text: 'Track Live Status',
            onPress: () => router.push('/(tabs)/tracking'),
          },
        ]
      );
    },
    onError: (err: any) => {
      Alert.alert('Dispatch Error', err.response?.data?.message || 'Failed to submit SOS request.');
    },
  });

  const handleTriggerSOS = () => {
    const categoryItem = CATEGORIES.find((c) => c.key === selectedCategory);
    const desc = description.trim() || `Urgent ${categoryItem?.label || 'Emergency'} assistance needed in ${location.district}.`;

    mutation.mutate({
      emergencyCategory: selectedCategory,
      description: desc,
      address,
      latitude: parseFloat(latitude) || location.latitude,
      longitude: parseFloat(longitude) || location.longitude,
      priority: categoryItem?.priority || 'CRITICAL',
    });
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert('Call Failed', `Could not dial ${number} on this device.`);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <Text style={styles.headerSubtitle}>
          Immediate satellite & mobile dispatch to District Disaster Operations and NDRF / SDRF teams.
        </Text>
      </View>

      {/* Hero Pulsing SOS Button (Screen 9) */}
      <View style={styles.sosOuterRing2}>
        <View style={styles.sosOuterRing1}>
          <TouchableOpacity
            style={[styles.sosButton, mutation.isPending && { opacity: 0.7 }]}
            onPress={handleTriggerSOS}
            disabled={mutation.isPending}
            activeOpacity={0.85}
          >
            {mutation.isPending ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <>
                <Radio size={36} color="#FFFFFF" />
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.sosSubtext}>TAP TO DISPATCH</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Category Selector Cards */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardSectionTitle}>Select Emergency Nature</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.catIconBox, isSelected && styles.catIconBoxSelected]}>
                  <Icon size={20} color={isSelected ? '#DC2626' : '#94A3B8'} />
                </View>
                <Text style={[styles.catLabel, isSelected && styles.catLabelSelected]}>
                  {cat.label}
                </Text>
                <Text style={styles.catSub}>{cat.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Situation Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardSectionTitle}>Immediate Threat Description</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Elderly person trapped on 1st floor, rising water, requires oxygen concentrator..."
          placeholderTextColor="#64748B"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Location display */}
        <View style={styles.locationPill}>
          <MapPin size={14} color="#DC2626" />
          <Text style={styles.locationPillText} numberOfLines={1}>
            {location.district}, {location.state} ({Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)})
          </Text>
        </View>
      </View>

      {/* Screen 9 "My Request" Live Tracking Card */}
      {(latestCase || lastSubmittedCase) && (
        <TouchableOpacity
          style={styles.activeRequestCard}
          onPress={() => router.push('/(tabs)/tracking')}
          activeOpacity={0.85}
        >
          <View style={styles.requestCardTop}>
            <View style={styles.requestCaseInfo}>
              <Text style={styles.requestLabel}>ACTIVE SOS REQUEST</Text>
              <Text style={styles.requestCode}>
                {latestCase?.caseNumber || lastSubmittedCase || 'EC-2026-LIVE'}
              </Text>
            </View>
            <View style={styles.requestStatusBadge}>
              <Text style={styles.requestStatusText}>
                {latestCase?.status || 'DISPATCHED'}
              </Text>
            </View>
          </View>

          <View style={styles.requestCardBottom}>
            <Text style={styles.requestDescText} numberOfLines={1}>
              {latestCase?.assignedTeamName
                ? `Assigned: ${latestCase.assignedTeamName} • Rescue en route`
                : 'Disaster Operations Command alerted • Routing nearest NDRF team'}
            </Text>
            <ChevronRight size={18} color="#94A3B8" />
          </View>
        </TouchableOpacity>
      )}

      {/* Indian Emergency Helplines Callout */}
      <View style={styles.helplineSection}>
        <Text style={styles.helplineSectionTitle}>Direct Emergency Helplines</Text>
        <View style={styles.helplineRow}>
          <TouchableOpacity style={styles.helplineBtn} onPress={() => handleCall('112')}>
            <Phone size={14} color="#10B981" />
            <Text style={styles.helplineBtnText}>112 National</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helplineBtn} onPress={() => handleCall('1078')}>
            <Phone size={14} color="#10B981" />
            <Text style={styles.helplineBtnText}>1078 NDRF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helplineBtn} onPress={() => handleCall('108')}>
            <Phone size={14} color="#10B981" />
            <Text style={styles.helplineBtnText}>108 Ambulance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helplineBtn} onPress={() => handleCall('101')}>
            <Phone size={14} color="#10B981" />
            <Text style={styles.helplineBtnText}>101 Fire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B131E',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  // Pulsing Double Rings for SOS
  sosOuterRing2: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  sosOuterRing1: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(220, 38, 38, 0.18)',
    borderWidth: 2,
    borderColor: 'rgba(220, 38, 38, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 2,
  },
  sosSubtext: {
    color: '#FEE2E2',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  sectionCard: {
    width: '100%',
    backgroundColor: '#111D2D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: '48.5%',
    backgroundColor: '#0B131E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  categoryCardSelected: {
    borderColor: '#DC2626',
    backgroundColor: '#1E1622',
  },
  catIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111D2D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  catIconBoxSelected: {
    backgroundColor: '#DC262622',
  },
  catLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  catLabelSelected: {
    color: '#FFFFFF',
  },
  catSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  textInput: {
    backgroundColor: '#0B131E',
    borderWidth: 1,
    borderColor: '#1E2F46',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    height: 70,
    textAlignVertical: 'top',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#0B131E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  locationPillText: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
  },
  activeRequestCard: {
    width: '100%',
    backgroundColor: '#111D2D',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DC2626',
    marginBottom: 16,
  },
  requestCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestCaseInfo: {},
  requestLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  requestCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  requestStatusBadge: {
    backgroundColor: '#10B98122',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  requestStatusText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  requestCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E2F46',
  },
  requestDescText: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
  },
  helplineSection: {
    width: '100%',
    marginTop: 8,
  },
  helplineSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
    textAlign: 'center',
  },
  helplineRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  helplineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111D2D',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  helplineBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
  },
});
