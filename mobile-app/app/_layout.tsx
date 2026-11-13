import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MobileAuthProvider } from '../context/MobileAuthContext';
import { LocationProvider } from '../context/LocationContext';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <MobileAuthProvider>
        <LocationProvider>
          <StatusBar style="light" backgroundColor="#0B131E" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </LocationProvider>
      </MobileAuthProvider>
    </QueryClientProvider>
  );
}
