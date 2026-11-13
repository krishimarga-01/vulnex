import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApi } from '../../services/mobileApi';
import { Colors } from '../../constants/Colors';
import { EmergencyCategory, EmergencyPriority, EmergencyCaseRequest } from '../../types';
import { useLocation } from '../../context/LocationContext';
import {
  LifeBuoy,
  HeartPulse,
  Waves,
  Truck,
  Apple,
  HelpCircle,
  MapPin,
  Send,
  Phone,
  ShieldCheck,
  Crosshair,
} from 'lucide-react-native';

const CATEGORIES: {
  key: EmergencyCategory;
  label: string;
  icon: any;
  priority: EmergencyPriority;
}[] = [
  { key: 'MEDICAL_ASSISTANCE', label: 'Medical Assistance', icon: HeartPulse, priority: 'CRITICAL' },
  { key: 'EVACUATION', label: 'Flood Evacuation', icon: Waves, priority: 'HIGH' },
  { key: 'RESCUE', label: 'Trapped / Rescue', icon: LifeBuoy, priority: 'CRITICAL' },
  { key: 'FOOD_WATER', label: 'Emergency Water & Food', icon: Apple, priority: 'MEDIUM' },
  { key: 'TRANSPORTATION', label: 'Accessible Transport', icon: Truck, priority: 'HIGH' },
  { key: 'OTHER', label: 'Other Urgent Support', icon: HelpCircle, priority: 'MEDIUM' },
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

  const mutation = useMutation({
    mutationFn: (req: EmergencyCaseRequest) => mobileApi.submitEmergencyRequest(req),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-cases-my'] });
      queryClient.invalidateQueries({ queryKey: ['emergency-cases-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setLastSubmittedCase(res.caseNumber);
      Alert.alert(
        'EMERGENCY REQUEST DISPATCHED',
        `Incident Case ID: ${res.caseNumber}\n\nYour SOS call has been ingested by Disaster Operations Command for ${location.district}. First responders and emergency units are being routed to your coordinates.`,
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

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Description Required', 'Please briefly describe the emergency situation.');
      return;
    }

    const categoryItem = CATEGORIES.find((c) => c.key === selectedCategory);

    mutation.mutate({
      emergencyCategory: selectedCategory,
      description,
      address,
      latitude: parseFloat(latitude) || location.latitude,
      longitude: parseFloat(longitude) || location.longitude,
      priority: categoryItem?.priority || 'HIGH',
    });
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert('Call Failed', `Could not dial ${number} on this device.`);
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Red Alert Header */}
      <View style={styles.header}>
        <View style={styles.sosEmblem}>
          <LifeBuoy size={42} color={Colors.white} />
        </View>
        <Text style={styles.title}>EMERGENCY ASSISTANCE (SOS)</Text>
        <Text style={styles.subtitle}>
          Direct priority dispatch to State & District Disaster Response Forces (SDRF/NDRF)
        </Text>
      </View>

      {/* Confirmation of Recent Case */}
      {lastSubmittedCase && (
        <View style={styles.caseBadge}>
          <ShieldCheck size={18} color="#16A34A" />
          <Text style={styles.caseBadgeText}>
            ACTIVE DISPATCH CASE #{lastSubmittedCase} — Responders Mobilized
          </Text>
        </View>
      )}

      {/* Category Grid */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>1. Select Emergency Type</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.catCard, isSelected && styles.catCardSelected]}
                onPress={() => setSelectedCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Icon size={24} color={isSelected ? Colors.white : '#DC3545'} />
                <Text style={[styles.catLabel, isSelected && styles.catLabelSelected]}>
                  {cat.label}
                </Text>
                <Text style={[styles.catPriority, isSelected && styles.catPrioritySelected]}>
                  {cat.priority}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Situation Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>2. Describe Immediate Threat</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe symptoms, trapped status, water level, power failure, or oxygen dependence..."
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Geolocation & Address */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>3. Location Coordinates for Dispatch</Text>
        <View style={styles.locationRow}>
          <Crosshair size={18} color="#DC3545" />
          <Text style={styles.gpsCoords}>
            GPS Lat: {latitude}, Lon: {longitude} ({location.district})
          </Text>
        </View>
        <TextInput
          style={[styles.textInput, { marginTop: 10 }]}
          placeholder="Street address / Landmark"
          placeholderTextColor="#94A3B8"
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {/* Giant Submit Button */}
      <TouchableOpacity
        style={styles.dispatchButton}
        onPress={handleSubmit}
        disabled={mutation.isPending}
        activeOpacity={0.85}
      >
        <Send size={20} color={Colors.white} />
        <Text style={styles.dispatchButtonText}>
          {mutation.isPending ? 'TRANSMITTING SOS...' : 'TRANSMIT SOS DISPATCH'}
        </Text>
      </TouchableOpacity>

      {/* Immediate Helplines Callout */}
      <View style={styles.helplineCard}>
        <Text style={styles.helplineTitle}>Official Indian Emergency Helplines</Text>
        <View style={styles.helplineRow}>
          <TouchableOpacity style={styles.callBadge} onPress={() => handleCall('112')}>
            <Phone size={13} color="#166534" />
            <Text style={styles.callBadgeText}>112 (Emergency)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callBadge} onPress={() => handleCall('1078')}>
            <Phone size={13} color="#166534" />
            <Text style={styles.callBadgeText}>1078 (NDRF)</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.helplineRow, { marginTop: 6 }]}>
          <TouchableOpacity style={styles.callBadge} onPress={() => handleCall('108')}>
            <Phone size={13} color="#166534" />
            <Text style={styles.callBadgeText}>108 (Ambulance)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callBadge} onPress={() => handleCall('101')}>
            <Phone size={13} color="#166534" />
            <Text style={styles.callBadgeText}>101 (Fire/Rescue)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callBadge} onPress={() => handleCall('1091')}>
            <Phone size={13} color="#166534" />
            <Text style={styles.callBadgeText}>1091 (Women)</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  sosEmblem: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#DC3545',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#DC3545',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DC3545',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  caseBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  caseBadgeText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '700',
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10243A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  catCardSelected: {
    backgroundColor: '#DC3545',
    borderColor: '#DC3545',
  },
  catLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10243A',
    textAlign: 'center',
    marginTop: 6,
  },
  catLabelSelected: {
    color: Colors.white,
  },
  catPriority: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC3545',
    marginTop: 3,
  },
  catPrioritySelected: {
    color: '#F8D7DA',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    backgroundColor: '#F8FAFC',
    color: '#10243A',
    textAlignVertical: 'top',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsCoords: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#475569',
  },
  dispatchButton: {
    backgroundColor: '#DC3545',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    shadowColor: '#DC3545',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  dispatchButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  helplineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helplineTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10243A',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  helplineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  callBadge: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  callBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
});
