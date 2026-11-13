import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { useMobileAuth } from '../context/MobileAuthContext';

// Global session guard to guarantee the intro only plays once per app launch session
let hasPlayedIntroSession = false;

export default function IntroSplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const videoRef = useRef<Video>(null);
  const { isAuthenticated } = useMobileAuth();
  const [hasNavigated, setHasNavigated] = useState(false);

  const navigateNext = useCallback(() => {
    if (hasNavigated) return;
    setHasNavigated(true);
    hasPlayedIntroSession = true;

    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [hasNavigated, isAuthenticated, router]);

  // If already played this session, bypass directly
  useEffect(() => {
    if (hasPlayedIntroSession) {
      navigateNext();
    }
  }, [navigateNext]);

  // Safety fallback timer: if playback doesn't complete within 20 seconds, proceed
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!hasNavigated) {
        navigateNext();
      }
    }, 20000);

    return () => clearTimeout(safetyTimer);
  }, [hasNavigated, navigateNext]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if ('error' in status && status.error) {
        navigateNext();
      }
      return;
    }

    if (status.didJustFinish) {
      navigateNext();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Fullscreen Video Player with Aspect Ratio Preserved */}
      <Video
        ref={videoRef}
        source={require('../assets/intro.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={!hasPlayedIntroSession}
        isLooping={false}
        isMuted={false}
        useNativeControls={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={() => {
          navigateNext();
        }}
      />

      {/* Small, Non-intrusive Skip Intro Button */}
      <TouchableOpacity
        style={[styles.skipButton, { top: Math.max(insets.top + 14, 32) }]}
        activeOpacity={0.7}
        onPress={navigateNext}
        accessibilityRole="button"
        accessibilityLabel="Skip intro video"
      >
        <Text style={styles.skipText}>Skip Intro</Text>
        <ChevronRight size={14} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
    backgroundColor: '#0A0F1D',
  },
  skipButton: {
    position: 'absolute',
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 50,
    elevation: 6,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: 2,
  },
});
