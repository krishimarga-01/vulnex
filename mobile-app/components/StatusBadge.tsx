import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { RiskLevel, EmergencyStatus, EmergencyPriority, WeatherSeverity } from '../types';

interface StatusBadgeProps {
  type: 'risk' | 'caseStatus' | 'priority' | 'severity';
  value: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  if (type === 'risk') {
    const risk = value as RiskLevel;
    const isHigh = risk === 'HIGH';
    const isMed = risk === 'MEDIUM';

    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: isHigh
              ? Colors.emergencyRedLight
              : isMed
              ? Colors.warningOrangeLight
              : Colors.safeGreenLight,
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              color: isHigh
                ? Colors.emergencyRed
                : isMed
                ? Colors.warningOrange
                : Colors.safeGreen,
            },
          ]}
        >
          {risk} RISK
        </Text>
      </View>
    );
  }

  if (type === 'priority') {
    const p = value as EmergencyPriority;
    const isCrit = p === 'CRITICAL';
    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: isCrit ? Colors.emergencyRed : Colors.warningOrangeLight,
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: isCrit ? Colors.white : Colors.warningOrange },
          ]}
        >
          {p}
        </Text>
      </View>
    );
  }

  if (type === 'caseStatus') {
    const status = value as EmergencyStatus;
    const isResolved = status === 'RESOLVED';
    const isAssigned = status === 'ASSIGNED';
    const isInProgress = status === 'IN_PROGRESS';

    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: isResolved
              ? Colors.safeGreenLight
              : isAssigned || isInProgress
              ? '#EEF2FF'
              : '#EFF6FF',
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              color: isResolved
                ? Colors.safeGreen
                : isAssigned || isInProgress
                ? '#4F46E5'
                : '#2563EB',
            },
          ]}
        >
          {status.replace('_', ' ')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: '#F1F5F9' }]}>
      <Text style={[styles.badgeText, { color: Colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
