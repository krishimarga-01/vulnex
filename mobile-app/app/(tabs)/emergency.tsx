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
  Apple,
  Phone,
  ChevronRight,
  ArrowLeft,
  Plus,
} from 'lucide-react-native';

const CATEGORIES: {
  key: EmergencyCategory;
  label: string;
  icon: any;
  priority: EmergencyPriority;
}[] = [
  { key: 'MEDICAL_ASSISTANCE', label: 'Medical', icon: Plus, priority: 'CRITICAL' },
  { key: 'EVACUATION', label: 'Evacuation', icon: Waves, priority: 'HIGH' },
  { key: 'FOOD_WATER', label: 'Food & Water', icon: Apple, priority: 'MEDIUM' },
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

  // Sync location
  useEffect(() => {
    setAddress(`${location.locality}, ${location.district}, ${location.state} - PIN ${location.pincode}`);
    setLatitude(String(location.latitude));
    setLongitude(String(location.longitude));
  }, [location]);

  // Query user's real cases
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
        `Incident Case: ${res.caseNumber}\n\nYour emergency request has been ingested by District Disaster Command (${location.district}). First responders and NDRF/SDRF units are mobilizing.`,
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

  return (
    <View style={styles.screenWrapper}>
      {/* Top Header with Back Arrow (Matching Screen 9) */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Emergency SOS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Giant Glowing Red SOS Button (Matching Screen 9) */}
        <View style={styles.sosButtonSection}>
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
                    <Phone size={36} color="#FFFFFF" style={{ marginBottom: 4 }} />
                    <Text style={styles.sosText}>SOS</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.sosInstructionText}>
            Tap to request immediate assistance
          </Text>
        </View>

        {/* 3 Quick Category Pills (Matching Screen 9) */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.catPill, isSelected && styles.catPillSelected]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Icon size={16} color={isSelected ? '#FFFFFF' : '#94A3B8'} />
                <Text style={[styles.catPillText, isSelected && styles.catPillTextSelected]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Situation Details */}
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Emergency Description (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe immediate threat or specific needs..."
            placeholderTextColor="#64748B"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Active Request Tracking Card (Matching Screen 9 Bottom Card) */}
        <TouchableOpacity
          style={styles.myRequestCard}
          onPress={() => router.push('/(tabs)/tracking')}
          activeOpacity={0.85}
        >
          <View style={styles.requestTopRow}>
            <Text style={styles.requestTitle}>My Request</Text>
            <View style={styles.inProgressBadge}>
              <Text style={styles.inProgressText}>
                {latestCase?.status || 'In Progress'}
              </Text>
            </View>
          </View>

          <Text style={styles.caseNumberText}>
            {latestCase?.caseNumber || lastSubmittedCase || 'EC-2026-0187'}
          </Text>

          <View style={styles.requestBottomRow}>
            <Text style={styles.etaText} numberOfLines={1}>
              {latestCase?.assignedTeamName
                ? `Rescue team en route • ETA: ~18 mins`
                : 'Rescue team en route • ETA: ~18 mins'}
            </Text>
            <ChevronRight size={18} color="#94A3B8" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#0B131E',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2F46',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111D2D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  sosButtonSection: {
    alignItems: 'center',
    marginVertical: 18,
  },
  sosOuterRing2: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosOuterRing1: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(220, 38, 38, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sosInstructionText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 14,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
    marginVertical: 14,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111D2D',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  catPillSelected: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  catPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  catPillTextSelected: {
    color: '#FFFFFF',
  },
  detailCard: {
    width: '100%',
    backgroundColor: '#111D2D',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginVertical: 12,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#0B131E',
    borderWidth: 1,
    borderColor: '#1E2F46',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
    height: 48,
  },
  myRequestCard: {
    width: '100%',
    backgroundColor: '#111D2D',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginTop: 8,
  },
  requestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  inProgressBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  inProgressText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  caseNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
    fontFamily: 'monospace',
  },
  requestBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  etaText: {
    fontSize: 12,
    color: '#CBD5E1',
    flex: 1,
  },
});
