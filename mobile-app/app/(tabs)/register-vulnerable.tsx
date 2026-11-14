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
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowLeft,
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
    sub: string;
    icon: any;
  }[] = [
    { key: 'ELDERLY', title: 'Elderly', sub: '(60+)', icon: User },
    { key: 'CHILD', title: 'Child', sub: '(0–12)', icon: Baby },
    { key: 'PREGNANT', title: 'Pregnant', sub: 'Woman', icon: Heart },
    { key: 'DISABILITY', title: 'Person with', sub: 'Disability', icon: Accessibility },
  ];

  return (
    <View style={styles.screenWrapper}>
      {/* Top Header with Back Arrow (Matching Screen 8) */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Register Vulnerable Member</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 3-Step Stepper (Matching Screen 8) */}
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

        {/* STEP 1: PERSONAL DETAILS (Matching Screen 8) */}
        {step === 1 && (
          <View style={styles.stepForm}>
            <Text style={styles.sectionHeaderTitle}>Personal Details</Text>

            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="E.g. Suresh Kumar"
              placeholderTextColor="#64748B"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.inputLabel}>Age *</Text>
            <View style={styles.ageInputRow}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                placeholder="Select or enter age"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
              <ChevronDown size={18} color="#94A3B8" style={styles.ageDropdownIcon} />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Category *</Text>
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
                    <IconComp size={24} color={isSelected ? '#DC2626' : '#94A3B8'} style={{ marginBottom: 6 }} />
                    <Text style={[styles.categoryTitle, isSelected && styles.categoryTitleSelected]}>
                      {cat.title}
                    </Text>
                    <Text style={styles.categorySub}>{cat.sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.primaryNextBtn}
              onPress={handleNextFromStep1}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryNextText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: HEALTH & MOBILITY */}
        {step === 2 && (
          <View style={styles.stepForm}>
            <Text style={styles.sectionHeaderTitle}>Health & Mobility Requirements</Text>

            <Text style={styles.inputLabel}>Mobility Level</Text>
            <View style={styles.mobilityGrid}>
              {(
                [
                  { key: 'BEDRIDDEN', label: 'Bedridden', sub: 'Non-ambulatory' },
                  { key: 'WHEELCHAIR', label: 'Wheelchair', sub: 'Ramp required' },
                  { key: 'ASSISTED', label: 'Assisted', sub: 'Walker/cane' },
                  { key: 'INDEPENDENT', label: 'Independent', sub: 'Slow movement' },
                ] as const
              ).map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.mobilityCard, mobility === m.key && styles.mobilityCardSelected]}
                  onPress={() => setMobility(m.key as MobilityStatus)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.mobilityTitle, mobility === m.key && styles.mobilityTitleSelected]}>
                    {m.label}
                  </Text>
                  <Text style={styles.mobilitySub}>{m.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Medical Conditions & Critical Needs *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="e.g. Oxygen concentrator dependent (10 L/min), Insulin refrigeration required, Dialysis..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
              value={medicalConditions}
              onChangeText={setMedicalConditions}
            />

            <View style={styles.stepButtonRow}>
              <TouchableOpacity
                style={styles.secondaryBackBtn}
                onPress={() => setStep(1)}
                activeOpacity={0.8}
              >
                <ChevronLeft size={18} color="#94A3B8" />
                <Text style={styles.secondaryBackText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryNextBtn, { flex: 1, marginTop: 0 }]}
                onPress={handleNextFromStep2}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryNextText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: LOCATION & CONTACT */}
        {step === 3 && (
          <View style={styles.stepForm}>
            <Text style={styles.sectionHeaderTitle}>Location & Emergency Contact</Text>

            <Text style={styles.inputLabel}>Residential Address *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Door / Flat No, Street, Landmark..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={2}
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.inputLabel}>Emergency Contact Person *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor="#64748B"
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
            />

            <Text style={styles.inputLabel}>Emergency Phone Number *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="+91 98765 43210"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
            />

            {/* Consent Switch */}
            <View style={styles.consentRow}>
              <Switch
                value={consentGiven}
                onValueChange={setConsentGiven}
                trackColor={{ false: '#1E2F46', true: '#DC2626' }}
                thumbColor={consentGiven ? '#FFFFFF' : '#94A3B8'}
              />
              <Text style={styles.consentLabel}>
                Authorize disaster responders (NDRF / SDRF) to access coordinates during alerts.
              </Text>
            </View>

            <View style={styles.stepButtonRow}>
              <TouchableOpacity
                style={styles.secondaryBackBtn}
                onPress={() => setStep(2)}
                activeOpacity={0.8}
              >
                <ChevronLeft size={18} color="#94A3B8" />
                <Text style={styles.secondaryBackText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryNextBtn, { flex: 1, marginTop: 0 }]}
                onPress={handleSubmit}
                disabled={mutation.isPending}
                activeOpacity={0.85}
              >
                {mutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryNextText}>Submit Registration</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E2F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#DC2626',
  },
  stepCircleText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  stepCircleTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
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
    marginTop: -14,
  },
  stepLineActive: {
    backgroundColor: '#DC2626',
  },
  stepForm: {
    backgroundColor: '#111D2D',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
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
    marginBottom: 12,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  ageInputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  ageDropdownIcon: {
    position: 'absolute',
    right: 14,
    top: 13,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
    marginBottom: 20,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#0B131E',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  categoryCardSelected: {
    borderColor: '#DC2626',
    backgroundColor: '#1A141E',
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
  },
  categoryTitleSelected: {
    color: '#FFFFFF',
  },
  categorySub: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  primaryNextBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryNextText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  stepButtonRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1E2F46',
  },
  secondaryBackText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  mobilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  mobilityCard: {
    width: '48%',
    backgroundColor: '#0B131E',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  mobilityCardSelected: {
    borderColor: '#DC2626',
    backgroundColor: '#1A141E',
  },
  mobilityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  mobilityTitleSelected: {
    color: '#FFFFFF',
  },
  mobilitySub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0B131E',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginVertical: 14,
  },
  consentLabel: {
    flex: 1,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
});
