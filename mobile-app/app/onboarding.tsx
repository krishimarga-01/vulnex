import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { CloudRain, Users, LifeBuoy, MapPin, ArrowRight } from 'lucide-react-native';

const SLIDES = [
  {
    title: 'Extreme Weather Monitoring',
    description:
      'Real-time meteorological warnings for severe heatwaves, riverbed flash floods, cyclones, and tropical storms direct from government radar.',
    icon: CloudRain,
    color: '#DC3545',
  },
  {
    title: 'Vulnerable Population Protection',
    description:
      'Specialized care registry for elderly family members, toddlers, pregnant women, and individuals requiring oxygen or medical power support.',
    icon: Users,
    color: '#173B5E',
  },
  {
    title: 'Rapid Emergency Assistance (SOS)',
    description:
      'One-tap GPS emergency dispatch for medical rescue, flood evacuation, and emergency food/water supply with dedicated responder units.',
    icon: LifeBuoy,
    color: '#DC3545',
  },
  {
    title: 'Location-Based Safety Directives',
    description:
      'Automated geofenced notifications alerting you and your family as severe weather conditions enter your neighborhood sector.',
    icon: MapPin,
    color: '#F59E0B',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const slide = SLIDES[currentSlide];
  const IconComponent = slide.icon;

  return (
    <View style={styles.container}>
      {/* Top Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Content */}
      <View style={styles.content}>
        <View style={[styles.iconWrapper, { backgroundColor: slide.color + '20' }]}>
          <IconComponent size={64} color={slide.color} />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>

        {/* Indicators */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.indicator,
                idx === currentSlide && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next Step'}
          </Text>
          <ArrowRight size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 50,
  },
  header: {
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    padding: 8,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10243A',
    textAlign: 'center',
    marginBottom: 14,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 36,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#10243A',
  },
  footer: {
    width: '100%',
  },
  nextButton: {
    backgroundColor: '#10243A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#10243A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
});
