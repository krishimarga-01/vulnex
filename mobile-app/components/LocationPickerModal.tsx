import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  MapPin,
  Crosshair,
  Search,
  X,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useLocation, INDIAN_DISTRICT_PRESETS, IndianDistrictOption } from '../context/LocationContext';

export default function LocationPickerModal() {
  const {
    location,
    isPickerVisible,
    closeLocationPicker,
    setManualLocation,
    detectGpsLocation,
    isLoading,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All');

  const states = ['All', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Maharashtra', 'Odisha', 'Assam', 'Delhi NCR'];

  const filteredPresets = INDIAN_DISTRICT_PRESETS.filter((item) => {
    const matchesState = selectedState === 'All' || item.state === selectedState;
    const matchesSearch =
      item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pincode.includes(searchQuery);
    return matchesState && matchesSearch;
  });

  const handleUseGps = async () => {
    const success = await detectGpsLocation();
    if (success) {
      closeLocationPicker();
    }
  };

  const handleSelectDistrict = (item: IndianDistrictOption) => {
    setManualLocation(item);
  };

  return (
    <Modal
      visible={isPickerVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeLocationPicker}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Monitored Location</Text>
              <Text style={styles.subtitle}>
                India Meteorological Department (IMD) Ground Monitoring
              </Text>
            </View>
            <TouchableOpacity onPress={closeLocationPicker} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* GPS Auto-detect Button */}
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleUseGps}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Crosshair size={18} color={Colors.white} />
            )}
            <View style={styles.gpsTextWrapper}>
              <Text style={styles.gpsButtonText}>
                {isLoading ? 'Detecting Satellite GPS...' : 'Use Precise GPS Satellite Location'}
              </Text>
              <Text style={styles.gpsSub}>
                Automatically links to nearest IMD radar station
              </Text>
            </View>
          </TouchableOpacity>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Search size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Indian District, State or PIN code..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* State Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.stateFilterRow}
            contentContainerStyle={styles.stateFilterContent}
          >
            {states.map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.statePill,
                  selectedState === st && styles.statePillActive,
                ]}
                onPress={() => setSelectedState(st)}
              >
                <Text
                  style={[
                    styles.statePillText,
                    selectedState === st && styles.statePillTextActive,
                  ]}
                >
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* District List */}
          <ScrollView style={styles.districtList} showsVerticalScrollIndicator={false}>
            {filteredPresets.map((item, idx) => {
              const isSelected =
                location.district.toLowerCase() === item.district.toLowerCase();

              return (
                <TouchableOpacity
                  key={`${item.state}-${item.district}-${idx}`}
                  style={[
                    styles.districtCard,
                    isSelected && styles.districtCardSelected,
                  ]}
                  onPress={() => handleSelectDistrict(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.districtLeft}>
                    <MapPin
                      size={18}
                      color={isSelected ? '#DC3545' : '#173B5E'}
                    />
                    <View>
                      <Text
                        style={[
                          styles.districtName,
                          isSelected && styles.districtNameSelected,
                        ]}
                      >
                        {item.district}
                      </Text>
                      <Text style={styles.districtSub}>
                        {item.state} • PIN {item.pincode}
                      </Text>
                    </View>
                  </View>

                  {isSelected ? (
                    <CheckCircle2 size={18} color="#DC3545" />
                  ) : (
                    <ChevronRight size={16} color="#CBD5E1" />
                  )}
                </TouchableOpacity>
              );
            })}

            {filteredPresets.length === 0 && (
              <View style={styles.emptyState}>
                <ShieldAlert size={32} color="#94A3B8" />
                <Text style={styles.emptyText}>No matching districts found</Text>
                <Text style={styles.emptySub}>
                  Try searching by state name or PIN code.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 36, 58, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10243A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  gpsButton: {
    backgroundColor: '#166534',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  gpsTextWrapper: {
    flex: 1,
  },
  gpsButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  gpsSub: {
    color: '#BBF7D0',
    fontSize: 10,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#10243A',
    padding: 0,
  },
  stateFilterRow: {
    marginBottom: 12,
    maxHeight: 36,
  },
  stateFilterContent: {
    gap: 8,
    paddingRight: 10,
  },
  statePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statePillActive: {
    backgroundColor: '#10243A',
    borderColor: '#10243A',
  },
  statePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  statePillTextActive: {
    color: Colors.white,
  },
  districtList: {
    maxHeight: 340,
  },
  districtCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  districtCardSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  districtLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  districtName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10243A',
  },
  districtNameSelected: {
    color: '#DC3545',
  },
  districtSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  emptySub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
