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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileApi } from '../../services/mobileApi';
import {
  VulnerabilityCategory,
  MobilityStatus,
  VulnerablePersonRequest,
} from '../../types';
import {
  User,
  Heart,
  Baby,
  Accessibility,
  HeartPulse,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from 'lucide-react-native';
import { useLocation } from '../../context/LocationContext';

export default function RegisterVulnerableScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { location } = useLocation();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [category, setCategory] = useState<VulnerabilityCategory>('ELDERLY');
  const [mobility, setMobility] = useState<MobilityStatus>('ASSISTED');
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
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('Family');
  const [consentGiven, setConsentGiven] = useState(true);

  const mutation = useMutation({
    mutationFn: (data: VulnerablePersonRequest) => mobileApi.registerVulnerablePerson(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['vulnerable-persons-list'] });
      queryClient.invalidateQueries({ queryKey: ['mobile-vulnerable-my'] });
      Alert.alert(
        'Vulnerability Record Registered',
        `Successfully registered ${res.fullName} with District Disaster Management Authority (${location.district}). First responders will prioritize this profile in disaster alerts.`,
        [{ text: 'View on Home', onPress: () => router.push('/(tabs)') }]
      );
    },
    onError: (err: any) => {
      Alert.alert(
        'Registration Failed',
        err.response?.data?.message || 'Could not save vulnerable member profile.'
      );
    },
  });

  const handleNextFromStep1 = () => {
    if (!fullName.trim()) {
      Alert.alert('Full Name Required', 'Please enter the member’s full name.');
      return;
    }
    if (!age.trim() || isNaN(Number(age))) {
      Alert.alert('Valid Age Required', 'Please enter a valid age in years.');
      return;
    }
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!medicalConditions.trim()) {
      Alert.alert('Medical Info Required', 'Please describe any known medical conditions or enter "None".');
      return;
    }
    setStep(3);
  };

  const handleSubmit = () => {
    if (!emergencyContactPhone.trim()) {
      Alert.alert('Emergency Phone Required', 'Please provide a valid emergency contact phone number.');
      return;
    }
    if (!consentGiven) {
      Alert.alert(
        'Consent Required',
        'Authorization is required so disaster relief forces (NDRF/SDRF) can locate this vulnerable individual.'
      );
      return;
    }

    mutation.mutate({
      fullName: fullName.trim(),
      nationalId: nationalId.trim() || `GEN-${Date.now().toString().slice(-6)}`,
      age: Number(age),
      gender,
      vulnerabilityCategory: category,
      mobilityStatus: mobility,
      medicalConditions: medicalConditions.trim(),
      assistanceRequirements: assistanceRequirements.trim() || 'Evacuation and life-support priority',
      contactNumber: contactNumber.trim() || emergencyContactPhone.trim(),
      address: address.trim(),
      latitude: parseFloat(latitude) || location.latitude,
      longitude: parseFloat(longitude) || location.longitude,
      emergencyContactName: emergencyContactName.trim() || 'Primary Caregiver',
      emergencyContactPhone: emergencyContactPhone.trim(),
      emergencyContactRelationship: emergencyContactRelationship.trim() || 'Caregiver',
      consentGiven: true,
    });
  };

  const categories: {
    key: VulnerabilityCategory;
    title: string;
    subtitle: string;
    icon: any;
  }[] = [
    { key: 'ELDERLY', title: 'Elderly Citizen', subtitle: 'Age 60+ / Senior Care', icon: User },
    { key: 'CHILD', title: 'Infant / Child', subtitle: 'Age 0-12 / Pediatric Care', icon: Baby },
    { key: 'PREGNANT', title: 'Pregnant Woman', subtitle: 'Maternal Care & Newborn', icon: Heart },
    { key: 'DISABILITY', title: 'Person w/ Disability', subtitle: 'Physical or Sensory', icon: Accessibility },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Register Vulnerable Member</Text>
        <Text style={styles.headerSubtitle}>
          Ensure elderly, pregnant, or medically dependent relatives receive prioritized NDRF/SDRF rescue.
        </Text>
      </View>

      {/* 3-Step Stepper (Screen 8) */}
      <View style={styles.stepperContainer}>
        {/* Step 1 */}
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
            <Text style={[styles.stepCircleText, step >= 1 && styles.stepCircleTextActive]}>1</Text>
          </View>
          <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Details</Text>
        </View>

        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />

        {/* Step 2 */}
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
            <Text style={[styles.stepCircleText, step >= 2 && styles.stepCircleTextActive]}>2</Text>
          </View>
          <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Health</Text>
        </View>

        <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />

        {/* Step 3 */}
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, step === 3 && styles.stepCircleActive]}>
            <Text style={[styles.stepCircleText, step === 3 && styles.stepCircleTextActive]}>3</Text>
          </View>
          <Text style={[styles.stepLabel, step === 3 && styles.stepLabelActive]}>Location</Text>
        </View>
      </View>

      {/* STEP 1: PERSONAL DETAILS */}
      {step === 1 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepSectionTitle}>Select Vulnerability Category</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = category === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                  onPress={() => setCategory(cat.key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.catIconCircle, isSelected && styles.catIconCircleSelected]}>
                    <IconComp size={22} color={isSelected ? '#DC2626' : '#94A3B8'} />
                  </View>
                  <Text style={[styles.categoryTitle, isSelected && styles.categoryTitleSelected]}>
                    {cat.title}
                  </Text>
                  <Text style={styles.categorySub}>{cat.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Full Legal Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Kamala Devi"
            placeholderTextColor="#64748B"
            value={fullName}
            onChangeText={setFullName}
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Age (Years) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 74"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>
            <View style={{ flex: 1.2 }}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {(['FEMALE', 'MALE', 'OTHER'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                      {g === 'FEMALE' ? 'Female' : g === 'MALE' ? 'Male' : 'Other'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.inputLabel}>Aadhaar / National ID (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="XXXX-XXXX-XXXX"
            placeholderTextColor="#64748B"
            value={nationalId}
            onChangeText={setNationalId}
          />

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleNextFromStep1}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Next: Health Info</Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2: HEALTH & MOBILITY */}
      {step === 2 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepSectionTitle}>Mobility Level</Text>
          <View style={styles.mobilityRow}>
            {(
              [
                { key: 'BEDRIDDEN', label: 'Bedridden', sub: 'Non-ambulatory' },
                { key: 'WHEELCHAIR', label: 'Wheelchair', sub: 'Requires ramp' },
                { key: 'ASSISTED', label: 'Assisted', sub: 'Walks with aid' },
                { key: 'INDEPENDENT', label: 'Independent', sub: 'Slow walking' },
              ] as const
            ).map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.mobilityCard, mobility === m.key && styles.mobilityCardActive]}
                onPress={() => setMobility(m.key as MobilityStatus)}
              >
                <Text style={[styles.mobilityLabel, mobility === m.key && styles.mobilityLabelActive]}>
                  {m.label}
                </Text>
                <Text style={styles.mobilitySub}>{m.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Medical Conditions & Critical Needs *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="e.g. Oxygen concentrator dependent (10 L/min), Hypertension, Dialysis 3x weekly on Tuesdays..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={4}
            value={medicalConditions}
            onChangeText={setMedicalConditions}
          />

          <Text style={styles.inputLabel}>Specific Evacuation Assistance</Text>
          <TextInput
            style={[styles.textInput, { height: 46 }]}
            placeholder="e.g. Stretcher evacuation required, ground floor window access"
            placeholderTextColor="#64748B"
            value={assistanceRequirements}
            onChangeText={setAssistanceRequirements}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setStep(1)}
              activeOpacity={0.8}
            >
              <ChevronLeft size={18} color="#94A3B8" />
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1 }]}
              onPress={handleNextFromStep2}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Next: Location & Contact</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 3: LOCATION & CONTACT */}
      {step === 3 && (
        <View style={styles.stepCard}>
          <Text style={styles.stepSectionTitle}>Current Geographic Address</Text>

          <View style={styles.locationSummaryBox}>
            <MapPin size={16} color="#DC2626" />
            <Text style={styles.locationSummaryText}>
              Lat: {Number(latitude).toFixed(4)}, Lon: {Number(longitude).toFixed(4)} ({location.district})
            </Text>
          </View>

          <Text style={styles.inputLabel}>Residential Address *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Door No, Street Name, Landmark..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={3}
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.inputLabel}>Primary Emergency Contact Person *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Ramesh Devi (Son / Caregiver)"
            placeholderTextColor="#64748B"
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Emergency Phone *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={emergencyContactPhone}
                onChangeText={setEmergencyContactPhone}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Relationship</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Caregiver"
                placeholderTextColor="#64748B"
                value={emergencyContactRelationship}
                onChangeText={setEmergencyContactRelationship}
              />
            </View>
          </View>

          {/* Consent Switch */}
          <View style={styles.consentBox}>
            <Switch
              value={consentGiven}
              onValueChange={setConsentGiven}
              trackColor={{ false: '#334155', true: '#DC2626' }}
              thumbColor={consentGiven ? '#FFFFFF' : '#94A3B8'}
            />
            <Text style={styles.consentText}>
              I authorize Municipal Disaster Operations and Rescue Forces (NDRF/SDRF) to access this profile during natural disaster alerts.
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setStep(2)}
              activeOpacity={0.8}
            >
              <ChevronLeft size={18} color="#94A3B8" />
              <Text style={styles.secondaryBtnText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1 }, mutation.isPending && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={mutation.isPending}
              activeOpacity={0.85}
            >
              {mutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <CheckCircle size={18} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Submit Registration</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  },
  header: {
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E2F46',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepCircleActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  stepCircleText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 13,
  },
  stepCircleTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  stepLabelActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#1E2F46',
    marginHorizontal: 8,
    marginTop: -16,
  },
  stepLineActive: {
    backgroundColor: '#DC2626',
  },
  stepCard: {
    backgroundColor: '#111D2D',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  stepSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryCard: {
    width: '48.5%',
    backgroundColor: '#0B131E',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  categoryCardSelected: {
    borderColor: '#DC2626',
    backgroundColor: '#1E1622',
  },
  catIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111D2D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  catIconCircleSelected: {
    backgroundColor: '#DC262622',
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  categoryTitleSelected: {
    color: '#FFFFFF',
  },
  categorySub: {
    fontSize: 11,
    color: '#64748B',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: '#0B131E',
    borderWidth: 1,
    borderColor: '#1E2F46',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 1,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: '#0B131E',
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  genderBtnActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  genderText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  primaryBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1E2F46',
    marginTop: 24,
  },
  secondaryBtnText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  mobilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  mobilityCard: {
    width: '48.5%',
    backgroundColor: '#0B131E',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  mobilityCardActive: {
    borderColor: '#DC2626',
    backgroundColor: '#1E1622',
  },
  mobilityLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  mobilityLabelActive: {
    color: '#FFFFFF',
  },
  mobilitySub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  locationSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0B131E',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginBottom: 8,
  },
  locationSummaryText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  consentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0B131E',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginTop: 16,
  },
  consentText: {
    flex: 1,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
});
