import React, { useState, useMemo } from 'react';
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
  Modal,
  FlatList,
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
  Search,
  Car,
  Users,
  Compass,
  Building2,
  Check,
  ShieldAlert,
} from 'lucide-react-native';
import { useLocation } from '../../context/LocationContext';
import { INDIA_POLICE_DIRECTORY } from '../../data/policeStationsData';

// 1. Vulnerability Options
interface VulnerabilityOption {
  key: string;
  label: string;
  sub: string;
  backendCategory: VulnerabilityCategory;
}

const VULNERABILITY_OPTIONS: VulnerabilityOption[] = [
  {
    key: 'NORMAL',
    label: 'Normal / Healthy Citizen',
    sub: 'No specialized mobility or medical impairment',
    backendCategory: 'MEDICAL_ASSISTANCE',
  },
  {
    key: 'PREGNANT',
    label: 'Pregnant Woman',
    sub: 'Trimester care, obstetric & neonatal evacuation priority',
    backendCategory: 'PREGNANT',
  },
  {
    key: 'INFANT',
    label: 'Infant / Toddler (Under 5)',
    sub: 'Pediatric care & emergency infant supplies needed',
    backendCategory: 'CHILD',
  },
  {
    key: 'DISABLED',
    label: 'Disabled / Mobility Impaired',
    sub: 'Physical / sensory disability, ramp/wheelchair reliant',
    backendCategory: 'DISABILITY',
  },
  {
    key: 'ELDERLY',
    label: 'Elderly / Senior Citizen (60+)',
    sub: 'Geriatric assistance, chronic ailments, slow mobility',
    backendCategory: 'ELDERLY',
  },
];

// 2. Family Caregiver Options
const CAREGIVER_OPTIONS = [
  {
    key: 'YES',
    label: 'Yes - Family caregiver available full-time',
    sub: 'Family member resides in the same home to assist',
  },
  {
    key: 'PARTIAL',
    label: 'Partial - Caregiver elderly or working away during day',
    sub: 'Cannot provide unassisted evacuation under emergency',
  },
  {
    key: 'NO',
    label: 'No - Living alone / No caregiver available',
    sub: 'Immediate first responder rescue deployment required',
  },
];

// 3. Vehicle Availability Options
const VEHICLE_OPTIONS = [
  {
    key: 'FOUR_WHEELER',
    label: 'Yes - 4-Wheeler (Car / SUV / Jeep)',
    sub: 'Family member can drive family to relief camp',
  },
  {
    key: 'TWO_WHEELER',
    label: 'Yes - 2-Wheeler (Motorcycle / Scooter)',
    sub: 'Limited capacity for solo or single passenger',
  },
  {
    key: 'UTILITY_VEHICLE',
    label: 'Yes - Commercial / Tractor / Utility Vehicle',
    sub: 'Capable of navigating flooded/rough terrain',
  },
  {
    key: 'NO_VEHICLE',
    label: 'No - Dependent on Emergency Transport',
    sub: 'Rescue boat, ambulance, or NDRF truck required',
  },
];

// 4. Evacuation Ease Options
const EVACUATION_EASE_OPTIONS = [
  {
    key: 'EASY',
    label: 'Easy - Ground level, wide paved road access',
    sub: 'Vehicles can reach doorstep without barrier',
  },
  {
    key: 'MODERATE',
    label: 'Moderate - Stairs, narrow alley, or upper floor',
    sub: 'Stretcher or carry-assist needed to reach road',
  },
  {
    key: 'DIFFICULT',
    label: 'Difficult - Flood plain / Landslide slope / Bottleneck',
    sub: 'High vulnerability zone; specialized evacuation gear needed',
  },
];

// Generic Dropdown Modal Component
interface DropdownModalProps {
  visible: boolean;
  title: string;
  options: { key: string; label: string; sub?: string }[];
  selectedKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
  showSearch?: boolean;
}

function DropdownModal({
  visible,
  title,
  options,
  selectedKey,
  onSelect,
  onClose,
  showSearch = false,
}: DropdownModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.sub && o.sub.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          {showSearch && (
            <View style={styles.modalSearchRow}>
              <Search size={16} color="#94A3B8" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearchText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.key}
            style={styles.modalList}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => {
              const isSelected = item.key === selectedKey;
              return (
                <TouchableOpacity
                  style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                  onPress={() => {
                    onSelect(item.key);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalItemTextCol}>
                    <Text style={[styles.modalItemLabel, isSelected && styles.modalItemLabelSelected]}>
                      {item.label}
                    </Text>
                    {item.sub && <Text style={styles.modalItemSub}>{item.sub}</Text>}
                  </View>
                  {isSelected && <Check size={18} color="#38BDF8" />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function RegisterVulnerableScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { location } = useLocation();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State: Step 1 Personal Details & Vulnerability
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [selectedVulnerabilityKey, setSelectedVulnerabilityKey] = useState<string>('ELDERLY');

  // Form State: Step 2 Family, Vehicle, Evacuation & Health
  const [caregiverStatusKey, setCaregiverStatusKey] = useState<string>('YES');
  const [vehicleStatusKey, setVehicleStatusKey] = useState<string>('FOUR_WHEELER');
  const [evacuationEaseKey, setEvacuationEaseKey] = useState<string>('EASY');
  const [mobility, setMobility] = useState<MobilityStatus>('INDEPENDENT');
  const [medicalConditions, setMedicalConditions] = useState('');

  // Form State: Step 3 Police Station & Location
  const [selectedState, setSelectedState] = useState<string>(
    location.state || 'Karnataka'
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    location.district || 'Kodagu'
  );
  const [selectedPoliceStation, setSelectedPoliceStation] = useState<string>(
    'Madikeri Town Police Station'
  );
  const [customPoliceStation, setCustomPoliceStation] = useState('');
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

  // Dropdown Modals Visibility
  const [modalType, setModalType] = useState<
    'VULNERABILITY' | 'CAREGIVER' | 'VEHICLE' | 'EVACUATION' | 'STATE' | 'DISTRICT' | 'POLICE_STATION' | null
  >(null);

  // Derived Police Directory Data
  const currentStateObj = useMemo(() => {
    return (
      INDIA_POLICE_DIRECTORY.find((s) => s.state.toLowerCase() === selectedState.toLowerCase()) ||
      INDIA_POLICE_DIRECTORY[0]
    );
  }, [selectedState]);

  const currentDistrictObj = useMemo(() => {
    if (!currentStateObj) return null;
    return (
      currentStateObj.districts.find(
        (d) => d.district.toLowerCase() === selectedDistrict.toLowerCase()
      ) || currentStateObj.districts[0]
    );
  }, [currentStateObj, selectedDistrict]);

  const stateOptions = useMemo(() => {
    return INDIA_POLICE_DIRECTORY.map((s) => ({
      key: s.state,
      label: s.state,
    }));
  }, []);

  const districtOptions = useMemo(() => {
    if (!currentStateObj) return [];
    return currentStateObj.districts.map((d) => ({
      key: d.district,
      label: d.district,
    }));
  }, [currentStateObj]);

  const policeStationOptions = useMemo(() => {
    if (!currentDistrictObj) return [];
    return currentDistrictObj.policeStations.map((ps) => ({
      key: ps,
      label: ps,
      sub: `${currentDistrictObj.district}, ${currentStateObj.state}`,
    }));
  }, [currentDistrictObj, currentStateObj]);

  // Labels for currently selected items
  const currentVulnerability =
    VULNERABILITY_OPTIONS.find((v) => v.key === selectedVulnerabilityKey) || VULNERABILITY_OPTIONS[0];
  const currentCaregiver =
    CAREGIVER_OPTIONS.find((c) => c.key === caregiverStatusKey) || CAREGIVER_OPTIONS[0];
  const currentVehicle =
    VEHICLE_OPTIONS.find((v) => v.key === vehicleStatusKey) || VEHICLE_OPTIONS[0];
  const currentEvacuationEase =
    EVACUATION_EASE_OPTIONS.find((e) => e.key === evacuationEaseKey) || EVACUATION_EASE_OPTIONS[0];

  const mutation = useMutation({
    mutationFn: (data: VulnerablePersonRequest) => mobileApi.registerVulnerablePerson(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['vulnerable-persons-list'] });
      queryClient.invalidateQueries({ queryKey: ['mobile-vulnerable-my'] });
      Alert.alert(
        'Vulnerability Record Registered',
        `Successfully registered ${res.fullName} with District Disaster Management Authority & ${selectedPoliceStation}.\n\nEvacuation Profile: ${currentVulnerability.label}\nCaregiver: ${currentCaregiver.label}\nNearest PS: ${selectedPoliceStation}`,
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
      Alert.alert('Full Name Required', 'Please enter the citizen’s full name.');
      return;
    }
    if (!age.trim() || isNaN(Number(age))) {
      Alert.alert('Valid Age Required', 'Please enter a valid age in years.');
      return;
    }
    setStep(2);
  };

  const handleNextFromStep2 = () => {
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

    const finalPoliceStation = customPoliceStation.trim() || selectedPoliceStation;

    // Structured metadata packed into assistanceRequirements and medicalConditions
    const structuredAssistance = [
      `Vulnerability: ${currentVulnerability.label}`,
      `Caregiver: ${currentCaregiver.label}`,
      `Vehicle: ${currentVehicle.label}`,
      `Evacuation: ${currentEvacuationEase.label}`,
      `Nearest Police Station: ${finalPoliceStation} (${selectedDistrict}, ${selectedState})`,
    ].join(' | ');

    mutation.mutate({
      fullName: fullName.trim(),
      nationalId: nationalId.trim() || `IND-${Date.now().toString().slice(-6)}`,
      age: Number(age),
      gender,
      vulnerabilityCategory: currentVulnerability.backendCategory,
      mobilityStatus: mobility,
      medicalConditions: medicalConditions.trim() || 'No chronic medical condition reported',
      assistanceRequirements: structuredAssistance,
      contactNumber: contactNumber.trim() || emergencyContactPhone.trim(),
      address: `${address.trim()} (PS: ${finalPoliceStation})`,
      latitude: parseFloat(latitude) || location.latitude,
      longitude: parseFloat(longitude) || location.longitude,
      emergencyContactName: emergencyContactName.trim() || 'Primary Caregiver',
      emergencyContactPhone: emergencyContactPhone.trim(),
      emergencyContactRelationship: emergencyContactRelationship.trim() || 'Family',
      consentGiven: true,
    });
  };

  return (
    <View style={styles.screenWrapper}>
      {/* Top Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Citizen Vulnerability Registration</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 3-Step Stepper */}
        <View style={styles.stepperContainer}>
          {/* Step 1 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
              <Text style={[styles.stepCircleText, step >= 1 && styles.stepCircleTextActive]}>1</Text>
            </View>
            <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Category</Text>
          </View>

          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />

          {/* Step 2 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
              <Text style={[styles.stepCircleText, step >= 2 && styles.stepCircleTextActive]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Evacuation</Text>
          </View>

          <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />

          {/* Step 3 */}
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step === 3 && styles.stepCircleActive]}>
              <Text style={[styles.stepCircleText, step === 3 && styles.stepCircleTextActive]}>3</Text>
            </View>
            <Text style={[styles.stepLabel, step === 3 && styles.stepLabelActive]}>Police & GPS</Text>
          </View>
        </View>

        {/* ==================================================================== */}
        {/* STEP 1: CITIZEN DETAILS & VULNERABILITY LEVEL                        */}
        {/* ==================================================================== */}
        {step === 1 && (
          <View style={styles.stepForm}>
            <Text style={styles.sectionHeaderTitle}>Citizen & Vulnerability Details</Text>
            <Text style={styles.sectionSubtitle}>
              Register vulnerable citizens so government disaster units prioritize evacuation
            </Text>

            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Ramesh Chandra"
              placeholderTextColor="#64748B"
              value={fullName}
              onChangeText={setFullName}
            />

            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Age *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 68"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {(['FEMALE', 'MALE', 'OTHER'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderBtn, gender === g && styles.genderBtnSelected]}
                      onPress={() => setGender(g)}
                    >
                      <Text
                        style={[
                          styles.genderBtnText,
                          gender === g && styles.genderBtnTextSelected,
                        ]}
                      >
                        {g === 'FEMALE' ? 'F' : g === 'MALE' ? 'M' : 'O'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Dropdown 1: How Vulnerable Are They */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>
              How Vulnerable Are They? (Category) *
            </Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setModalType('VULNERABILITY')}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeftCol}>
                <Text style={styles.dropdownSelectedLabel}>
                  {currentVulnerability.label}
                </Text>
                <Text style={styles.dropdownSelectedSub} numberOfLines={1}>
                  {currentVulnerability.sub}
                </Text>
              </View>
              <ChevronDown size={20} color="#38BDF8" />
            </TouchableOpacity>

            {/* Quick Cards for Visual Selection */}
            <View style={styles.categoriesGrid}>
              {VULNERABILITY_OPTIONS.map((opt) => {
                const isSelected = selectedVulnerabilityKey === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                    onPress={() => setSelectedVulnerabilityKey(opt.key)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoryTitle,
                        isSelected && styles.categoryTitleSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {opt.label}
                    </Text>
                    <Text style={styles.categorySub} numberOfLines={2}>
                      {opt.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.primaryNextBtn}
              onPress={handleNextFromStep1}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryNextText}>Continue to Evacuation Details</Text>
              <ChevronRight size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: CAREGIVER, VEHICLE, EVACUATION EASE & HEALTH                 */}
        {/* ==================================================================== */}
        {step === 2 && (
          <View style={styles.stepForm}>
            <Text style={styles.sectionHeaderTitle}>Evacuation & Caregiver Readiness</Text>
            <Text style={styles.sectionSubtitle}>
              Essential logistics for first responders to organize immediate transport
            </Text>

            {/* Dropdown 2: Family Caregiver */}
            <Text style={styles.inputLabel}>
              Is there anyone in their family to take care of them? *
            </Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setModalType('CAREGIVER')}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeftCol}>
                <Text style={styles.dropdownSelectedLabel}>
                  {currentCaregiver.label}
                </Text>
                <Text style={styles.dropdownSelectedSub} numberOfLines={1}>
                  {currentCaregiver.sub}
                </Text>
              </View>
              <ChevronDown size={20} color="#38BDF8" />
            </TouchableOpacity>

            {/* Dropdown 3: Vehicle Availability */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>
              Does they have vehicle so the member can drive it? *
            </Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setModalType('VEHICLE')}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeftCol}>
                <Text style={styles.dropdownSelectedLabel}>
                  {currentVehicle.label}
                </Text>
                <Text style={styles.dropdownSelectedSub} numberOfLines={1}>
                  {currentVehicle.sub}
                </Text>
              </View>
              <ChevronDown size={20} color="#38BDF8" />
            </TouchableOpacity>

            {/* Dropdown 4: Evacuation Ease */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>
              Is their place can be evacuated easily? *
            </Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setModalType('EVACUATION')}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeftCol}>
                <Text style={styles.dropdownSelectedLabel}>
                  {currentEvacuationEase.label}
                </Text>
                <Text style={styles.dropdownSelectedSub} numberOfLines={1}>
                  {currentEvacuationEase.sub}
                </Text>
              </View>
              <ChevronDown size={20} color="#38BDF8" />
            </TouchableOpacity>

            {/* Mobility Status */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Mobility Level</Text>
            <View style={styles.mobilityGrid}>
              {(
                [
                  { key: 'INDEPENDENT', label: 'Independent', sub: 'Walks freely' },
                  { key: 'ASSISTED', label: 'Assisted', sub: 'Walker/cane' },
                  { key: 'WHEELCHAIR', label: 'Wheelchair', sub: 'Ramp required' },
                  { key: 'BEDRIDDEN', label: 'Bedridden', sub: 'Stretcher only' },
                ] as const
              ).map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.mobilityCard, mobility === m.key && styles.mobilityCardSelected]}
                  onPress={() => setMobility(m.key as MobilityStatus)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.mobilityTitle,
                      mobility === m.key && styles.mobilityTitleSelected,
                    ]}
                  >
                    {m.label}
                  </Text>
                  <Text style={styles.mobilitySub}>{m.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Medical Conditions */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>
              Medical Conditions & Critical Needs (Optional)
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="e.g. Oxygen cylinder required, Insulin cold storage, dialysis..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={2}
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
                <Text style={styles.primaryNextText}>Continue to Police Station & GPS</Text>
                <ChevronRight size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: NEAREST POLICE STATION (STATE -> DISTRICT -> PS) & CONTACT  */}
        {/* ==================================================================== */}
        {step === 3 && (
          <View style={styles.stepForm}>
            <Text style={styles.sectionHeaderTitle}>Nearest Police Station & Dispatch</Text>
            <Text style={styles.sectionSubtitle}>
              Select your State and District to connect with your local jurisdiction police station
            </Text>

            {/* Step A: State Dropdown */}
            <Text style={styles.inputLabel}>1. Select State *</Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setModalType('STATE')}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeftCol}>
                <Text style={styles.dropdownSelectedLabel}>{selectedState}</Text>
                <Text style={styles.dropdownSelectedSub}>Tap to change State</Text>
              </View>
              <ChevronDown size={20} color="#38BDF8" />
            </TouchableOpacity>

            {/* Step B: District Dropdown */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>
              2. Select District (in {selectedState}) *
            </Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setModalType('DISTRICT')}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeftCol}>
                <Text style={styles.dropdownSelectedLabel}>{selectedDistrict}</Text>
                <Text style={styles.dropdownSelectedSub}>Tap to change District</Text>
              </View>
              <ChevronDown size={20} color="#38BDF8" />
            </TouchableOpacity>

            {/* Step C: Search Nearest Police Station Dropdown */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>
              3. Nearest Police Station Name (Search & Select) *
            </Text>
            <TouchableOpacity
              style={styles.dropdownSelector}
              onPress={() => setModalType('POLICE_STATION')}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownLeftCol}>
                <Text style={styles.dropdownSelectedLabel}>
                  {customPoliceStation || selectedPoliceStation}
                </Text>
                <Text style={styles.dropdownSelectedSub}>
                  Jurisdiction Police Station in {selectedDistrict}
                </Text>
              </View>
              <Search size={18} color="#38BDF8" />
            </TouchableOpacity>

            {/* Custom Police Station Input (if not in preloaded list) */}
            <Text style={[styles.inputLabel, { marginTop: 10, fontSize: 11, color: '#64748B' }]}>
              Or type custom Police Station name if unlisted:
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Kushalnagar Rural Police Station"
              placeholderTextColor="#64748B"
              value={customPoliceStation}
              onChangeText={setCustomPoliceStation}
            />

            {/* Residential Address */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Residential Address *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Door / Flat No, Street, Landmark..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={2}
              value={address}
              onChangeText={setAddress}
            />

            {/* Emergency Contact */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>
              Emergency Contact Person Name *
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Sunil Kumar"
              placeholderTextColor="#64748B"
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
            />

            <Text style={styles.inputLabel}>Emergency Contact Phone Number *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="+91 98765 43210"
              placeholderTextColor="#64748B"
              keyboardType="phone-pad"
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
            />

            {/* Live GPS Coordinates Confirmation */}
            <View style={styles.gpsConfirmCard}>
              <MapPin size={18} color="#10B981" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.gpsConfirmTitle}>Registered GPS Geolocation</Text>
                <Text style={styles.gpsConfirmCoords}>
                  Lat: {Number(latitude || location.latitude).toFixed(4)}, Lng:{' '}
                  {Number(longitude || location.longitude).toFixed(4)}
                </Text>
              </View>
            </View>

            {/* Consent Switch */}
            <View style={styles.consentCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.consentTitle}>Authorize Disaster Response Forces</Text>
                <Text style={styles.consentSub}>
                  I consent to sharing this vulnerability profile with NDRF, SDRF, and{' '}
                  {customPoliceStation || selectedPoliceStation} for emergency evacuation.
                </Text>
              </View>
              <Switch
                value={consentGiven}
                onValueChange={setConsentGiven}
                thumbColor={consentGiven ? '#38BDF8' : '#64748B'}
                trackColor={{ false: '#1E293B', true: '#0C4A6E' }}
              />
            </View>

            {/* Submit Action */}
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
                style={[
                  styles.submitBtn,
                  mutation.isPending && { opacity: 0.6 },
                ]}
                onPress={handleSubmit}
                disabled={mutation.isPending}
                activeOpacity={0.85}
              >
                {mutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <CheckCircle size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.submitBtnText}>Submit Registration</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ==================================================================== */}
      {/* DROPDOWN MODALS                                                      */}
      {/* ==================================================================== */}

      {/* Dropdown Modal: Vulnerability Level */}
      <DropdownModal
        visible={modalType === 'VULNERABILITY'}
        title="Select Vulnerability Category"
        options={VULNERABILITY_OPTIONS.map((v) => ({
          key: v.key,
          label: v.label,
          sub: v.sub,
        }))}
        selectedKey={selectedVulnerabilityKey}
        onSelect={(key) => setSelectedVulnerabilityKey(key)}
        onClose={() => setModalType(null)}
      />

      {/* Dropdown Modal: Family Caregiver */}
      <DropdownModal
        visible={modalType === 'CAREGIVER'}
        title="Family Caregiver Status"
        options={CAREGIVER_OPTIONS}
        selectedKey={caregiverStatusKey}
        onSelect={(key) => setCaregiverStatusKey(key)}
        onClose={() => setModalType(null)}
      />

      {/* Dropdown Modal: Vehicle Availability */}
      <DropdownModal
        visible={modalType === 'VEHICLE'}
        title="Vehicle for Evacuation"
        options={VEHICLE_OPTIONS}
        selectedKey={vehicleStatusKey}
        onSelect={(key) => setVehicleStatusKey(key)}
        onClose={() => setModalType(null)}
      />

      {/* Dropdown Modal: Evacuation Ease */}
      <DropdownModal
        visible={modalType === 'EVACUATION'}
        title="Ease of Evacuation"
        options={EVACUATION_EASE_OPTIONS}
        selectedKey={evacuationEaseKey}
        onSelect={(key) => setEvacuationEaseKey(key)}
        onClose={() => setModalType(null)}
      />

      {/* Dropdown Modal: Select State */}
      <DropdownModal
        visible={modalType === 'STATE'}
        title="Select State"
        options={stateOptions}
        selectedKey={selectedState}
        onSelect={(key) => {
          setSelectedState(key);
          const st = INDIA_POLICE_DIRECTORY.find((s) => s.state === key);
          if (st && st.districts.length > 0) {
            setSelectedDistrict(st.districts[0].district);
            if (st.districts[0].policeStations.length > 0) {
              setSelectedPoliceStation(st.districts[0].policeStations[0]);
            }
          }
        }}
        onClose={() => setModalType(null)}
        showSearch={true}
      />

      {/* Dropdown Modal: Select District */}
      <DropdownModal
        visible={modalType === 'DISTRICT'}
        title={`Select District (${selectedState})`}
        options={districtOptions}
        selectedKey={selectedDistrict}
        onSelect={(key) => {
          setSelectedDistrict(key);
          const dist = currentStateObj?.districts.find((d) => d.district === key);
          if (dist && dist.policeStations.length > 0) {
            setSelectedPoliceStation(dist.policeStations[0]);
          }
        }}
        onClose={() => setModalType(null)}
        showSearch={true}
      />

      {/* Dropdown Modal: Search Nearest Police Station */}
      <DropdownModal
        visible={modalType === 'POLICE_STATION'}
        title={`Nearest Police Station (${selectedDistrict})`}
        options={policeStationOptions}
        selectedKey={selectedPoliceStation}
        onSelect={(key) => {
          setSelectedPoliceStation(key);
          setCustomPoliceStation('');
        }}
        onClose={() => setModalType(null)}
        showSearch={true}
      />
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111D2D',
    borderWidth: 2,
    borderColor: '#1E2F46',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  stepCircleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  stepCircleTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#1E2F46',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: '#DC2626',
  },
  stepForm: {
    backgroundColor: '#0F1A2A',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#0B131E',
    borderWidth: 1,
    borderColor: '#1E2F46',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6,
    height: 44,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: '#0B131E',
    borderWidth: 1,
    borderColor: '#1E2F46',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnSelected: {
    backgroundColor: '#0C4A6E',
    borderColor: '#38BDF8',
  },
  genderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  genderBtnTextSelected: {
    color: '#38BDF8',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B131E',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownLeftCol: {
    flex: 1,
    marginRight: 8,
  },
  dropdownSelectedLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  dropdownSelectedSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  categoriesGrid: {
    gap: 8,
    marginTop: 12,
  },
  categoryCard: {
    backgroundColor: '#111D2D',
    borderWidth: 1,
    borderColor: '#1E2F46',
    borderRadius: 12,
    padding: 10,
  },
  categoryCardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0C2640',
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  categoryTitleSelected: {
    color: '#38BDF8',
  },
  categorySub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  mobilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mobilityCard: {
    width: '48%',
    backgroundColor: '#111D2D',
    borderWidth: 1,
    borderColor: '#1E2F46',
    borderRadius: 12,
    padding: 10,
  },
  mobilityCardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0C2640',
  },
  mobilityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  mobilityTitleSelected: {
    color: '#38BDF8',
  },
  mobilitySub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  primaryNextBtn: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryNextText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  stepButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  secondaryBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111D2D',
    borderWidth: 1,
    borderColor: '#1E2F46',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  secondaryBackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 4,
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  gpsConfirmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C2720',
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  gpsConfirmTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399',
  },
  gpsConfirmCoords: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 2,
  },
  consentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111D2D',
    borderWidth: 1,
    borderColor: '#1E2F46',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginTop: 14,
  },
  consentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  consentSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
    lineHeight: 14,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0D1724',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: '#1E2F46',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2F46',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111D2D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B131E',
    borderWidth: 1,
    borderColor: '#1E2F46',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 12,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
  },
  clearSearchText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  modalList: {
    marginTop: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#142030',
  },
  modalItemSelected: {
    backgroundColor: '#0C2640',
  },
  modalItemTextCol: {
    flex: 1,
    marginRight: 10,
  },
  modalItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  modalItemLabelSelected: {
    color: '#38BDF8',
  },
  modalItemSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
});
