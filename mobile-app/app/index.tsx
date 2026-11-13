import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronRight,
  MapPin,
  Building2,
  Zap,
  Radio,
  Crosshair,
  ShieldAlert,
} from 'lucide-react-native';
import { useMobileAuth } from '../context/MobileAuthContext';
import { useLocation } from '../context/LocationContext';
import LocationPickerModal from '../components/LocationPickerModal';
import { Colors } from '../constants/Colors';

let hasPlayedIntroSession = false;

export default function IntroSplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const videoRef = useRef<Video>(null);
  const { isAuthenticated } = useMobileAuth();
  const {
    location,
    isLocationConfigured,
    detectGpsLocation,
    openLocationPicker,
    isLoading,
  } = useLocation();

  const [videoFinished, setVideoFinished] = useState(false);
  const [showLocationScreen, setShowLocationScreen] = useState(false);

  const proceedToApp = useCallback(() => {
    hasPlayedIntroSession = true;
    router.replace('/(tabs)');
  }, [router]);

  // If already played this session, skip intro directly
  useEffect(() => {
    if (hasPlayedIntroSession) {
      proceedToApp();
    }
  }, [proceedToApp]);

  const handleVideoDone = useCallback(() => {
    if (videoFinished) return;
    setVideoFinished(true);

    if (isLocationConfigured) {
      proceedToApp();
    } else {
      setShowLocationScreen(true);
    }
  }, [videoFinished, isLocationConfigured, proceedToApp]);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!videoFinished) {
        handleVideoDone();
      }
    }, 18000);
    return () => clearTimeout(safetyTimer);
  }, [videoFinished, handleVideoDone]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if ('error' in status && status.error) {
        handleVideoDone();
      }
      return;
    }
    if (status.didJustFinish) {
      handleVideoDone();
    }
  };

  const handleAllowLocation = async () => {
    await detectGpsLocation();
    proceedToApp();
  };

  const handleManualLocation = () => {
    openLocationPicker();
  };

  // When location configured via modal, proceed
  useEffect(() => {
    if (showLocationScreen && isLocationConfigured) {
      proceedToApp();
    }
  }, [showLocationScreen, isLocationConfigured, proceedToApp]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Screen 1: Intro Splash / Video */}
      {!videoFinished && (
        <View style={styles.videoWrapper}>
          <Video
            ref={videoRef}
            source={require('../assets/intro.mp4')}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={!hasPlayedIntroSession && !videoFinished}
            isLooping={false}
            isMuted={false}
            useNativeControls={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onError={() => handleVideoDone()}
          />

          {/* Non-intrusive Skip Intro Button */}
          <TouchableOpacity
            style={[styles.skipButton, { top: Math.max(insets.top + 14, 34) }]}
            activeOpacity={0.7}
            onPress={handleVideoDone}
          >
            <Text style={styles.skipText}>Skip</Text>
            <ChevronRight size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Screen 2: Location Permission (Matching UI Design Reference 2) */}
      {showLocationScreen && (
        <View style={[styles.permissionContainer, { paddingTop: insets.top + 40 }]}>
          {/* Glowing Radar Circle with Location Pin */}
          <View style={styles.radarOuterRing}>
            <View style={styles.radarMiddleRing}>
              <View style={styles.radarInnerCircle}>
                <MapPin size={36} color="#38BDF8" fill="#38BDF8" />
              </View>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.permissionTitle}>Allow Location Access?</Text>
          <Text style={styles.permissionSubtitle}>
            VULNEX needs your location to provide real-time weather, disaster alerts and nearby emergency support.
          </Text>

          {/* 3 Benefit Cards */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitCard}>
              <View style={styles.benefitIconBox}>
                <Radio size={20} color="#38BDF8" />
              </View>
              <Text style={styles.benefitText}>
                Live weather & warnings from IMD for your area
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconBox}>
                <Building2 size={20} color="#38BDF8" />
              </View>
              <Text style={styles.benefitText}>
                Nearby shelters & emergency relief resources
              </Text>
            </View>

            <View style={styles.benefitCard}>
              <View style={styles.benefitIconBox}>
                <Zap size={20} color="#38BDF8" />
              </View>
              <Text style={styles.benefitText}>
                Faster emergency dispatch in case of a disaster
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.allowButton}
              onPress={handleAllowLocation}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.allowButtonText}>Allow Location Access</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.manualButton}
              onPress={handleManualLocation}
              activeOpacity={0.7}
            >
              <Text style={styles.manualButtonText}>Use Manual Location Instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Global Location Picker Modal */}
      <LocationPickerModal />
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B131E',
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: '#070D15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 29, 45, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2F46',
    gap: 4,
    zIndex: 20,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0B131E',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  radarOuterRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  radarMiddleRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarInnerCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#0D2744',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0284C7',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
  },
  permissionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  benefitsList: {
    width: '100%',
    gap: 12,
    marginVertical: 24,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111D2D',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E2F46',
    gap: 14,
  },
  benefitIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    color: '#E2E8F0',
    fontWeight: '600',
    lineHeight: 18,
  },
  bottomActions: {
    width: '100%',
    gap: 14,
    alignItems: 'center',
  },
  allowButton: {
    width: '100%',
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
  allowButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  manualButton: {
    paddingVertical: 6,
  },
  manualButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
