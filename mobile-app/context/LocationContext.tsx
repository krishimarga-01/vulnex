import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';

export interface IndianLocation {
  state: string;
  district: string;
  locality: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isGpsDetected: boolean;
}

export interface IndianDistrictOption {
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  pincode: string;
}

export const INDIAN_DISTRICT_PRESETS: IndianDistrictOption[] = [
  // Karnataka (Primary Monitored State)
  { state: 'Karnataka', district: 'Kodagu', latitude: 12.4244, longitude: 75.7382, pincode: '571201' },
  { state: 'Karnataka', district: 'Bengaluru Urban', latitude: 12.9716, longitude: 77.5946, pincode: '560001' },
  { state: 'Karnataka', district: 'Uttara Kannada', latitude: 14.8185, longitude: 74.1303, pincode: '581301' },
  { state: 'Karnataka', district: 'Udupi', latitude: 13.3409, longitude: 74.7421, pincode: '576101' },
  { state: 'Karnataka', district: 'Kalaburagi', latitude: 17.3297, longitude: 76.8343, pincode: '585101' },
  { state: 'Karnataka', district: 'Dakshina Kannada (Mangaluru)', latitude: 12.9141, longitude: 74.8560, pincode: '575001' },
  { state: 'Karnataka', district: 'Mysuru', latitude: 12.2958, longitude: 76.6394, pincode: '570001' },
  { state: 'Karnataka', district: 'Belagavi', latitude: 15.8497, longitude: 74.4977, pincode: '590001' },

  // Tamil Nadu
  { state: 'Tamil Nadu', district: 'Chennai', latitude: 13.0827, longitude: 80.2707, pincode: '600001' },
  { state: 'Tamil Nadu', district: 'The Nilgiris', latitude: 11.4102, longitude: 76.6950, pincode: '643001' },
  { state: 'Tamil Nadu', district: 'Coimbatore', latitude: 11.0168, longitude: 76.9558, pincode: '641001' },
  { state: 'Tamil Nadu', district: 'Cuddalore', latitude: 11.7480, longitude: 79.7714, pincode: '607001' },

  // Kerala
  { state: 'Kerala', district: 'Wayanad', latitude: 11.6854, longitude: 76.1320, pincode: '673121' },
  { state: 'Kerala', district: 'Idukki', latitude: 9.8530, longitude: 76.9740, pincode: '685603' },
  { state: 'Kerala', district: 'Ernakulam (Kochi)', latitude: 9.9312, longitude: 76.2673, pincode: '682001' },

  // Maharashtra
  { state: 'Maharashtra', district: 'Mumbai', latitude: 19.0760, longitude: 72.8777, pincode: '400001' },
  { state: 'Maharashtra', district: 'Raigad', latitude: 18.5158, longitude: 73.1812, pincode: '402107' },
  { state: 'Maharashtra', district: 'Pune', latitude: 18.5204, longitude: 73.8567, pincode: '411001' },

  // Odisha
  { state: 'Odisha', district: 'Puri', latitude: 19.8135, longitude: 85.8312, pincode: '752001' },
  { state: 'Odisha', district: 'Bhubaneswar', latitude: 20.2961, longitude: 85.8245, pincode: '751001' },

  // Assam
  { state: 'Assam', district: 'Kamrup Metropolitan (Guwahati)', latitude: 26.1445, longitude: 91.7362, pincode: '781001' },

  // Delhi NCR
  { state: 'Delhi NCR', district: 'New Delhi', latitude: 28.6139, longitude: 77.2090, pincode: '110001' },

  // Gujarat
  { state: 'Gujarat', district: 'Kutch', latitude: 23.7337, longitude: 69.8597, pincode: '370001' },
  { state: 'Gujarat', district: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, pincode: '380001' },
];

interface LocationContextType {
  location: IndianLocation;
  isLoading: boolean;
  permissionGranted: boolean | null;
  isLocationConfigured: boolean;
  detectGpsLocation: () => Promise<boolean>;
  setManualLocation: (preset: IndianDistrictOption) => void;
  openLocationPicker: () => void;
  closeLocationPicker: () => void;
  isPickerVisible: boolean;
}

const DEFAULT_LOCATION: IndianLocation = {
  state: 'Karnataka',
  district: 'Kodagu',
  locality: 'Madikeri Hills Basin',
  pincode: '571201',
  latitude: 12.4244,
  longitude: 75.7382,
  isGpsDetected: false,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<IndianLocation>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isLocationConfigured, setIsLocationConfigured] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const detectGpsLocation = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionGranted(false);
        setIsLoading(false);
        return false;
      }

      setPermissionGranted(true);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode
      const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocoded && geocoded.length > 0) {
        const item = geocoded[0];
        const state = item.region || 'Karnataka';
        const district = item.subregion || item.city || item.district || 'Kodagu';
        const locality = item.name || item.street || district;
        const pincode = item.postalCode || '571201';

        setLocation({
          state,
          district,
          locality,
          pincode,
          latitude,
          longitude,
          isGpsDetected: true,
        });
      } else {
        setLocation((prev) => ({
          ...prev,
          latitude,
          longitude,
          isGpsDetected: true,
        }));
      }

      setIsLocationConfigured(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.warn('GPS location detection failed:', err);
      setIsLoading(false);
      return false;
    }
  };

  const setManualLocation = (preset: IndianDistrictOption) => {
    setLocation({
      state: preset.state,
      district: preset.district,
      locality: `${preset.district} District Center`,
      pincode: preset.pincode,
      latitude: preset.latitude,
      longitude: preset.longitude,
      isGpsDetected: false,
    });
    setIsLocationConfigured(true);
    setIsPickerVisible(false);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        permissionGranted,
        isLocationConfigured,
        detectGpsLocation,
        setManualLocation,
        openLocationPicker: () => setIsPickerVisible(true),
        closeLocationPicker: () => setIsPickerVisible(false),
        isPickerVisible,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
