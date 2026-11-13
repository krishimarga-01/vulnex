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
    backgroundColor: '#0B131E',
  },
  content: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: '#111D2D',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
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
    backgroundColor: '#111D2D',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E2F46',
    marginBottom: 16,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#1E2F46',
    paddingBottom: 10,
    marginBottom: 10,
  },
  caseNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },
  caseCategory: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 13,
    color: '#CBD5E1',
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
    backgroundColor: '#1E2F46',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineCircleDone: {
    backgroundColor: '#10B981',
  },
  timelineCircleCurrent: {
    backgroundColor: '#DC2626',
    transform: [{ scale: 1.15 }],
  },
  timelineIndex: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },
  timelineLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  timelineLabelDone: {
    color: '#F8FAFC',
  },
  teamCard: {
    backgroundColor: '#0B131E',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#1E2F46',
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
    color: '#38BDF8',
    textTransform: 'uppercase',
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  callButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  triageNote: {
    backgroundColor: '#1E1622',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  triageText: {
    fontSize: 11,
    color: '#FCA5A5',
    flex: 1,
    lineHeight: 15,
  },
  resolutionCard: {
    backgroundColor: '#064E3B22',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  resolutionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    textTransform: 'uppercase',
  },
  resolutionText: {
    fontSize: 11,
    color: '#6EE7B7',
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
    borderTopColor: '#1E2F46',
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  addressText: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
  },
  dateText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
  },
});
