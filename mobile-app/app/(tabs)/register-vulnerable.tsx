import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApi } from '../../services/mobileApi';
import { Colors } from '../../constants/Colors';
import {
  VulnerabilityCategory,
  MobilityStatus,
  VulnerablePersonRequest,
} from '../../types';
import { UserPlus, MapPin, HeartPulse, CheckSquare } from 'lucide-react-native';
import { useLocation } from '../../context/LocationContext';

export default function RegisterVulnerableScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { location } = useLocation();

  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [category, setCategory] = useState<VulnerabilityCategory>('ELDERLY');
  const [mobility, setMobility] = useState<MobilityStatus>('BEDRIDDEN');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [assistanceRequirements, setAssistanceRequirements] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState(
    `${location.locality}, ${location.district}, ${location.state} - PIN ${location.pincode}`
  );
  const [latitude, setLatitude] = useState(String(location.latitude));
  const [longitude, setLongitude] = useState(String(location.longitude));
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: VulnerablePersonRequest) => mobileApi.registerVulnerablePerson(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['vulnerable-persons-list'] });
      queryClient.invalidateQueries({ queryKey: ['mobile-vulnerable-my'] });
      Alert.alert(
        'Registration Submitted',
        `Successfully registered ${res.fullName}. The record has been transmitted to Municipal Disaster Management for prioritization.`,
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );
    },
    onError: (err: any) => {
      Alert.alert(
        'Submission Failed',
        err.response?.data?.message || 'Could not register vulnerable profile.'
      );
    },
  });

  const handleSubmit = () => {
    if (!fullName || !nationalId || !age || !medicalConditions || !address || !emergencyContactPhone) {
      Alert.alert('Required Fields Missing', 'Please fill in all required fields indicated by *.');
      return;
    }

    if (!consentGiven) {
      Alert.alert(
        'Consent Required',
        'You must grant emergency data sharing consent to allow disaster responders and ambulance teams to access location and medical information during extreme weather alerts.'
      );
      return;
    }

    mutation.mutate({
      fullName,
      nationalId,
      age: Number(age),
      gender,
      vulnerabilityCategory: category,
      mobilityStatus: mobility,
      medicalConditions,
      assistanceRequirements: assistanceRequirements || 'General evacuation support',
      contactNumber: contactNumber || emergencyContactPhone,
      address,
      latitude: parseFloat(latitude) || 13.0827,
      longitude: parseFloat(longitude) || 80.2707,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship: emergencyContactRelationship || 'Caregiver',
      consentGiven: true,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <UserPlus size={28} color="#DC3545" />
        <Text style={styles.title}>Register Vulnerable Individual</Text>
        <Text style={styles.subtitle}>
          Ensure priority evacuation, air-conditioned shelter transport, and emergency oxygen for vulnerable family members.
        </Text>
      </View>

      <View style={styles.formCard}>
        {/* Full Name & National ID */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Legal Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Eleanor Vance"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>National / Govt ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="NAT-ID-1005"
              value={nationalId}
              onChangeText={setNationalId}
            />
          </View>
          <View style={[styles.inputGroup, { width: 90 }]}>
            <Text style={styles.label}>Age (Years) *</Text>
            <TextInput
              style={styles.input}
              placeholder="82"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Vulnerability Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vulnerability Category *</Text>
          <View style={styles.optionGrid}>
            {(
              [
                'ELDERLY',
                'CHILD',
                'DISABILITY',
                'PREGNANT',
                'MEDICAL_ASSISTANCE',
              ] as VulnerabilityCategory[]
            ).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.optionPill, category === cat && styles.optionPillActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.optionText, category === cat && styles.optionTextActive]}>
                  {cat.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mobility Status */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobility Status *</Text>
          <View style={styles.optionGrid}>
            {(['INDEPENDENT', 'ASSISTED', 'WHEELCHAIR', 'BEDRIDDEN'] as MobilityStatus[]).map(
              (m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.optionPill, mobility === m && styles.optionPillActive]}
                  onPress={() => setMobility(m)}
                >
                  <Text style={[styles.optionText, mobility === m && styles.optionTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Medical Conditions */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medical Diagnosis & Life-Support Dependency *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g. Supplemental oxygen concentrator dependency, congestive heart failure, severe asthma..."
            value={medicalConditions}
            onChangeText={setMedicalConditions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Assistance Requirements */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specific Assistance Requirements</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g. Stretcher evacuation van, uninterrupted power supply, wheelchair ramp..."
            value={assistanceRequirements}
            onChangeText={setAssistanceRequirements}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Residential Address */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Residential Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="House/Apt No., Street, Sector, Landmark"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* GPS Coordinates */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>GPS Latitude</Text>
            <TextInput
              style={styles.input}
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>GPS Longitude</Text>
            <TextInput
              style={styles.input}
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.sectionDivider}>
          <Text style={styles.sectionHeader}>Emergency Contact & Caregiver</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mary Johnson"
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+1-555-0102"
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              keyboardType="phone-pad"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Relationship</Text>
            <TextInput
              style={styles.input}
              placeholder="Daughter / Guardian"
              value={emergencyContactRelationship}
              onChangeText={setEmergencyContactRelationship}
            />
          </View>
        </View>

        {/* Consent Checkbox */}
        <View style={styles.consentRow}>
          <Switch
            value={consentGiven}
            onValueChange={setConsentGiven}
            trackColor={{ false: '#CBD5E1', true: '#DC3545' }}
            thumbColor={Colors.white}
          />
          <Text style={styles.consentText}>
            I confirm consent to securely transmit this vulnerable individual's medical and geospatial profile to authorized Municipal Disaster Authorities for life-saving emergency intervention.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={mutation.isPending}
        >
          <Text style={styles.submitButtonText}>
            {mutation.isPending ? 'Transmitting to Authorities...' : 'Register for Disaster Priority'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10243A',
    marginTop: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10243A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    backgroundColor: '#F8FAFC',
    color: '#10243A',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  optionPillActive: {
    backgroundColor: '#10243A',
    borderColor: '#10243A',
  },
  optionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  optionTextActive: {
    color: Colors.white,
  },
  sectionDivider: {
    marginTop: 10,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#173B5E',
    textTransform: 'uppercase',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  consentText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#DC3545',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#DC3545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
