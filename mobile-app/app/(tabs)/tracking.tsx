import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { mobileApi } from '../../services/mobileApi';
import { Colors } from '../../constants/Colors';
import { StatusBadge } from '../../components/StatusBadge';
import {
  LifeBuoy,
  Clock,
  MapPin,
  Shield,
  Phone,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
} from 'lucide-react-native';

const STATUS_STEPS = ['REPORTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

export default function TrackingScreen() {
  const {
    data: cases = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['mobile-cases-my'],
    queryFn: () => mobileApi.getMyEmergencyCases(),
    refetchInterval: 6000, // live tracking refresh every 6s
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <View style={styles.header}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live Telemetry Feed (6s)</Text>
        </View>
        <Text style={styles.title}>Emergency Incident Tracking</Text>
        <Text style={styles.subtitle}>
          Real-time responder dispatch progress, unit assignments, and case resolution timeline.
        </Text>
      </View>

      {cases.length === 0 ? (
        <View style={styles.emptyCard}>
          <LifeBuoy size={40} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Active SOS Requests</Text>
          <Text style={styles.emptySub}>
            When you submit an emergency assistance request, you can monitor the responder team in real time here.
          </Text>
        </View>
      ) : (
        cases.map((c) => {
          const currentStepIndex = STATUS_STEPS.indexOf(c.status);

          return (
            <View key={c.id} style={styles.caseCard}>
              {/* Card Header */}
              <View style={styles.caseHeader}>
                <View>
                  <Text style={styles.caseNumber}>{c.caseNumber}</Text>
                  <Text style={styles.caseCategory}>
                    {c.emergencyCategory.replace('_', ' ')}
                  </Text>
                </View>
                <StatusBadge type="caseStatus" value={c.status} />
              </View>

              <Text style={styles.descriptionText}>{c.description}</Text>

              {/* Status Timeline */}
              <View style={styles.timelineContainer}>
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <View key={step} style={styles.timelineStep}>
                      <View
                        style={[
                          styles.timelineCircle,
                          isCompleted && styles.timelineCircleDone,
                          isCurrent && styles.timelineCircleCurrent,
                        ]}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={12} color={Colors.white} />
                        ) : (
                          <Text style={styles.timelineIndex}>{idx + 1}</Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.timelineLabel,
                          isCompleted && styles.timelineLabelDone,
                        ]}
                      >
                        {step === 'IN_PROGRESS' ? 'IN PROG' : step}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Assigned Response Team Info */}
              {c.assignedTeamName ? (
                <View style={styles.teamCard}>
                  <View style={styles.teamLeft}>
                    <Shield size={18} color="#4F46E5" />
                    <View>
                      <Text style={styles.teamTitle}>Assigned Response Team</Text>
                      <Text style={styles.teamName}>{c.assignedTeamName}</Text>
                    </View>
                  </View>

                  {c.assignedTeamPhone && (
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => Linking.openURL(`tel:${c.assignedTeamPhone}`)}
                    >
                      <Phone size={14} color={Colors.white} />
                      <Text style={styles.callText}>Call Unit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.triageNote}>
                  <Clock size={14} color="#D97706" />
                  <Text style={styles.triageText}>
                    Incident ingested at Municipal Ops Command. Nearest response unit is being dispatched.
                  </Text>
                </View>
              )}

              {/* Resolution Notes if Resolved */}
              {c.resolutionNotes && (
                <View style={styles.resolutionCard}>
                  <Text style={styles.resolutionHeader}>Resolution Report:</Text>
                  <Text style={styles.resolutionText}>{c.resolutionNotes}</Text>
                </View>
              )}

              {/* Meta Address & Date */}
              <View style={styles.metaRow}>
                <View style={styles.locationMeta}>
                  <MapPin size={12} color="#64748B" />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {c.address}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  content: {
    padding: 16,
    paddingTop: 48,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10243A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10243A',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  caseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 10,
  },
  caseNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10243A',
    fontFamily: 'monospace',
  },
  caseCategory: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 14,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineCircleDone: {
    backgroundColor: '#16A34A',
  },
  timelineCircleCurrent: {
    backgroundColor: '#DC3545',
    transform: [{ scale: 1.15 }],
  },
  timelineIndex: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
  timelineLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },
  timelineLabelDone: {
    color: '#10243A',
  },
  teamCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  teamTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4338CA',
    textTransform: 'uppercase',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  callButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  triageNote: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  triageText: {
    fontSize: 11,
    color: '#92400E',
    flex: 1,
    lineHeight: 15,
  },
  resolutionCard: {
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  resolutionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
    textTransform: 'uppercase',
  },
  resolutionText: {
    fontSize: 11,
    color: '#14532D',
    marginTop: 2,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  addressText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  dateText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
});
