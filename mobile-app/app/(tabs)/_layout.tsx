import React from 'react';
import { Tabs } from 'expo-router';
import { Home, CloudRain, LifeBuoy, UserPlus, ClipboardList, User } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#DC3545',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#10243A',
          borderTopColor: '#173B5E',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: 'Weather',
          tabBarIcon: ({ color, size }) => <CloudRain size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: 'SOS / Help',
          tabBarIcon: ({ color, size }) => <LifeBuoy size={size || 22} color="#DC3545" />,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '800',
            color: '#DC3545',
          },
        }}
      />
      <Tabs.Screen
        name="register-vulnerable"
        options={{
          title: 'Register',
          tabBarIcon: ({ color, size }) => <UserPlus size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: 'Tracking',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size || 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // access through home header
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size || 20} color={color} />,
        }}
      />
    </Tabs>
  );
}
