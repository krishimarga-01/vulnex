import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LiveConnectionProvider } from './contexts/LiveConnectionContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { CitizenLayout } from './layouts/CitizenLayout';

// Authority Pages
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { RiskMap } from './pages/RiskMap';
import { ResponsePriorityPlan } from './pages/ResponsePriorityPlan';
import { VulnerablePopulation } from './pages/VulnerablePopulation';
import { WeatherMonitoring } from './pages/WeatherMonitoring';
import { EmergencyAlerts } from './pages/EmergencyAlerts';
import { EmergencyCases } from './pages/EmergencyCases';
import { Shelters } from './pages/Shelters';
import { ResponseTeams } from './pages/ResponseTeams';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { CitizenRegisterVulnerability } from './pages/citizen/CitizenRegisterVulnerability';
import { CitizenShelters } from './pages/citizen/CitizenShelters';
import { CitizenMyRequests } from './pages/citizen/CitizenMyRequests';
import { CitizenSafety } from './pages/citizen/CitizenSafety';
import { CitizenProfile } from './pages/citizen/CitizenProfile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 5000,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono tracking-wider text-slate-300">
            CONNECTING TO VULNEX EMERGENCY GRID...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LiveConnectionProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Login & Registration */}
              <Route path="/login" element={<Login />} />

              {/* Citizen Portal Routes */}
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute>
                    <CitizenLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CitizenDashboard />} />
                <Route path="register-vulnerable" element={<CitizenRegisterVulnerability />} />
                <Route path="shelters" element={<CitizenShelters />} />
                <Route path="my-requests" element={<CitizenMyRequests />} />
                <Route path="safety" element={<CitizenSafety />} />
                <Route path="profile" element={<CitizenProfile />} />
              </Route>

              {/* Authority Command Centre Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Overview />} />
                <Route path="risk-map" element={<RiskMap />} />
                <Route path="priority-plan" element={<ResponsePriorityPlan />} />
                <Route path="vulnerable-population" element={<VulnerablePopulation />} />
                <Route path="weather-monitoring" element={<WeatherMonitoring />} />
                <Route path="alerts" element={<EmergencyAlerts />} />
                <Route path="emergency-cases" element={<EmergencyCases />} />
                <Route path="shelters" element={<Shelters />} />
                <Route path="response-teams" element={<ResponseTeams />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LiveConnectionProvider>
    </QueryClientProvider>
  );
};

export default App;
