import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LiveConnectionState } from '../types';
import {
  subscribeConnectionStatus,
  setForcedDemoMode,
  getForcedDemoMode,
  apiService,
} from '../services/api';

interface LiveConnectionContextType {
  status: LiveConnectionState;
  isDemoMode: boolean;
  toggleDemoMode: (enabled: boolean) => void;
  lastSyncTime: Date;
  isTabActive: boolean;
  reconnect: () => Promise<void>;
}

const LiveConnectionContext = createContext<LiveConnectionContextType | undefined>(undefined);

export const LiveConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<LiveConnectionState>(() =>
    getForcedDemoMode() ? 'DEMO' : 'LIVE'
  );
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => getForcedDemoMode());
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isTabActive, setIsTabActive] = useState<boolean>(true);

  // Subscribe to API layer status changes
  useEffect(() => {
    const unsubscribe = subscribeConnectionStatus((newStatus) => {
      setStatus(newStatus);
      setLastSyncTime(new Date());
    });
    return unsubscribe;
  }, []);

  // Listen to visibility change to pause polling when inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Periodically check live connectivity if not forced into demo
  const reconnect = useCallback(async () => {
    setStatus('RECONNECTING');
    const reachable = await apiService.pingBackend();
    setLastSyncTime(new Date());
    if (!reachable && !isDemoMode) {
      setStatus('OFFLINE');
    }
  }, [isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    // Initial ping
    reconnect();
    const interval = setInterval(() => {
      if (document.hidden) return;
      apiService.pingBackend();
    }, 30000);
    return () => clearInterval(interval);
  }, [isDemoMode, reconnect]);

  const toggleDemoMode = (enabled: boolean) => {
    setForcedDemoMode(enabled);
    setIsDemoMode(enabled);
    if (!enabled) {
      reconnect();
    }
  };

  return (
    <LiveConnectionContext.Provider
      value={{
        status,
        isDemoMode,
        toggleDemoMode,
        lastSyncTime,
        isTabActive,
        reconnect,
      }}
    >
      {children}
    </LiveConnectionContext.Provider>
  );
};

export const useLiveConnection = () => {
  const context = useContext(LiveConnectionContext);
  if (!context) {
    throw new Error('useLiveConnection must be used within a LiveConnectionProvider');
  }
  return context;
};
