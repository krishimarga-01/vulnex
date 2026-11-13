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
import { ChevronRight, MapPin, Crosshair, ShieldCheck, ArrowRight } from 'lucide-react-native';
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
  const { location, isLocationConfigured, detectGpsLocation, openLocationPicker, isLoading } = useLocation();

  const [videoFinished, setVideoFinished] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const proceedToApp = useCallback(() => {
    hasPlayedIntroSession = true;
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(tabs)'); // Direct access to live public disaster intelligence
    }
  }, [isAuthenticated, router]);

  // If already played this session and location is ready, bypass directly
  useEffect(() => {
    if (hasPlayedIntroSession) {
      proceedToApp();
    }
  }, [proceedToApp]);

  // Handle when video finishes playing
  const handleVideoDone = useCallback(() => {
    if (videoFinished) return;
    setVideoFinished(true);

    if (isLocationConfigured) {
      proceedToApp();
    } else {
      setShowLocationPrompt(true);
    }
  }, [videoFinished, isLocationConfigured, proceedToApp]);

  // Safety fallback timer: if playback doesn't complete within 20 seconds, prompt location
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!videoFinished) {
        handleVideoDone();
      }
    }, 20000);

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

  const handleGpsEnable = async () => {
    const success = await detectGpsLocation();
    proceedToApp();
  };

  const handleManualPick = () => {
    openLocationPicker();
  };

  // If location becomes configured while modal was open, proceed
  useEffect(() => {
    if (showLocationPrompt && isLocationConfigured) {
      proceedToApp();
    }
  }, [showLocationPrompt, isLocationConfigured, proceedToApp]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Fullscreen Video Player */}
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

      {/* Skip Intro Button */}
      {!videoFinished && (
        <TouchableOpacity
          style={[styles.skipButton, { top: Math.max(insets.top + 14, 32) }]}
          activeOpacity={0.7}
          onPress={handleVideoDone}
          accessibilityRole="button"
          accessibilityLabel="Skip intro video"
        >
          <Text style={styles.skipText}>Skip Intro</Text>
          <ChevronRight size={14} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Location Permission & Setup Step Overlay */}
      {showLocationPrompt && (
        <View style={styles.locationOverlay}>
          <View style={styles.promptCard}>
            <View style={styles.promptIconWrapper}>
              <MapPin size={32} color="#DC3545" />
            </View>

            <Text style={styles.promptTitle}>Location-Aware Disaster Shield</Text>
            <Text style={styles.promptSubtitle}>
              VULNEX uses your district to monitor official IMD Cyclone, Flood, and Heatwave warnings
              and connect vulnerable dependents to local relief shelters.
            </Text>

            <View style={styles.detectedPill}>
              <ShieldCheck size={16} color="#166534" />
              <Text style={styles.detectedText}>
                Active District: {location.district}, {location.state}
              </Text>
            </View>

            {/* GPS Enable Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGpsEnable}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Crosshair size={18} color={Colors.white} />
              )}
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Detecting GPS Satellite...' : 'Detect GPS Location Automatically'}
              </Text>
            </TouchableOpacity>

            {/* Manual District Picker Button */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleManualPick}
              activeOpacity={0.8}
            >
              <MapPin size={16} color="#10243A" />
              <Text style={styles.secondaryButtonText}>
                Select Indian District Manually
              </Text>
            </TouchableOpacity>

            {/* Direct Proceed */}
            <TouchableOpacity
              style={styles.skipLocationBtn}
              onPress={proceedToApp}
              activeOpacity={0.7}
            >
              <Text style={styles.skipLocationText}>
                Continue with {location.district}
              </Text>
              <ArrowRight size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reusable Location Picker Modal */}
      <LocationPickerModal />
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071320',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
    backgroundColor: '#071320',
  },
  skipButton: {
    position: 'absolute',
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 36, 58, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    gap: 4,
    zIndex: 20,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  locationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 19, 32, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 30,
  },
  promptCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  promptIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10243A',
    textAlign: 'center',
  },
  promptSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  detectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  detectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#DC3545',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 14,
  },
  secondaryButtonText: {
    color: '#10243A',
    fontSize: 13,
    fontWeight: '700',
  },
  skipLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  skipLocationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
});
