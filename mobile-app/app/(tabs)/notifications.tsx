import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import {
  Bell,
  AlertTriangle,
  LifeBuoy,
  Shield,
  Clock,
  ArrowLeft,
  Check,
} from 'lucide-react-native';

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    title: 'RED ALERT: Extreme Heatwave Warning',
    body: 'Heat index has touched 48.2°C in Coastal Sector 4. High danger for elderly & infants. Stay in designated cooling shelters.',
    type: 'ALERT',
    timestamp: '10 mins ago',
    unread: true,
  },
  {
    id: '2',
    title: 'Paramedic Unit Dispatched for Case EC-2026-001',
    body: 'Mobile Critical Care Unit Alpha is en route with portable generator & oxygen reserve.',
    type: 'CASE',
    timestamp: '45 mins ago',
    unread: false,
  },
  {
    id: '3',
    title: 'Designated Shelter Opening',
    body: 'Marina Municipal Community Cyclone Shelter has opened with backup electricity and medical staff.',
    type: 'AUTHORITY',
    timestamp: '2 hours ago',
    unread: false,
  },
  {
    id: '4',
    title: 'Flash Flood Watch: Riverside Basin',
    body: 'Canal water level rising due to upstream rain. Residents on ground floors advised to prepare evacuation kits.',
    type: 'ALERT',
    timestamp: '5 hours ago',
    unread: false,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
        return <AlertTriangle size={18} color="#DC3545" />;
      case 'CASE':
        return <LifeBuoy size={18} color="#4F46E5" />;
      default:
        return <Shield size={18} color="#16A34A" />;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color="#10243A" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications & Directives</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadText}>Mark read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {notifications.map((item) => (
          <View
            key={item.id}
            style={[styles.itemCard, item.unread && styles.itemUnread]}
          >
            <View style={styles.iconCircle}>{getIcon(item.type)}</View>

            <View style={styles.itemContent}>
              <View style={styles.titleRow}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.unread && <View style={styles.unreadDot} />}
              </View>

              <Text style={styles.itemBody}>{item.body}</Text>

              <View style={styles.timeRow}>
                <Clock size={12} color="#94A3B8" />
                <Text style={styles.timeText}>{item.timestamp}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10243A',
  },
  markReadText: {
    fontSize: 12,
    color: '#DC3545',
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
  },
  itemUnread: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10243A',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC3545',
    marginLeft: 6,
  },
  itemBody: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 17,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  timeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
});
