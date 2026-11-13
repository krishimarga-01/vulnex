import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  AuthRequest,
  AuthResponse,
  UserProfile,
  DashboardSummary,
  VulnerablePerson,
  WeatherObservation,
  WeatherAlert,
  EmergencyCase,
  ResponseTeam,
  GeographicalRegion,
  GeoJsonFeatureCollection,
  RiskAssessmentResult,
  WeatherAlertRequest,
  EmergencyStatus,
} from '../types';
import {
  DEMO_USERS,
  DEMO_VULNERABLE_PERSONS,
  DEMO_WEATHER_OBSERVATIONS,
  DEMO_WEATHER_ALERTS,
  DEMO_EMERGENCY_CASES,
  DEMO_RESPONSE_TEAMS,
  DEMO_REGIONS,
  DEMO_DASHBOARD_SUMMARY,
  DEMO_GEOJSON_COLLECTION,
  DEMO_RISK_ASSESSMENT,
} from '@shared/api-contracts/mockData';

const resolveApiBaseUrl = (): string => {
  const raw = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (!raw) {
    return 'http://localhost:8080/api/v1';
  }
  let url = raw;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = url.includes('localhost') ? `http://${url}` : `https://${url}`;
  }
  url = url.replace(/\/+$/, '');
  if (!url.includes('/api')) {
    url = `${url}/api/v1`;
  }
  return url;
};

const BASE_URL = resolveApiBaseUrl();

// In-memory demo state that can mutate during a live session (so adding an alert or changing case status works seamlessly!)
const loadPersistedDemoCases = (): any[] => {
  try {
    const saved = localStorage.getItem('vulnex_demo_cases');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...DEMO_EMERGENCY_CASES];
};

let demoEmergencyCases = loadPersistedDemoCases();
let demoWeatherAlerts = [...DEMO_WEATHER_ALERTS];
let demoVulnerablePersons = [...DEMO_VULNERABLE_PERSONS];
let demoResponseTeams = [...DEMO_RESPONSE_TEAMS];

const persistDemoCases = () => {
  try {
    localStorage.setItem('vulnex_demo_cases', JSON.stringify(demoEmergencyCases));
  } catch {}
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ew_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global connectivity state
let isDemoModeForced = localStorage.getItem('ew_force_demo_mode') === 'true';
let connectionStatus: 'LIVE' | 'RECONNECTING' | 'OFFLINE' | 'DEMO' = isDemoModeForced ? 'DEMO' : 'LIVE';

const listeners: ((status: 'LIVE' | 'RECONNECTING' | 'OFFLINE' | 'DEMO') => void)[] = [];

export function subscribeConnectionStatus(callback: (status: 'LIVE' | 'RECONNECTING' | 'OFFLINE' | 'DEMO') => void) {
  listeners.push(callback);
  callback(connectionStatus);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function updateConnectionStatus(newStatus: 'LIVE' | 'RECONNECTING' | 'OFFLINE' | 'DEMO') {
  if (connectionStatus !== newStatus) {
    connectionStatus = newStatus;
    listeners.forEach((cb) => cb(newStatus));
  }
}

export function setForcedDemoMode(enabled: boolean) {
  isDemoModeForced = enabled;
  localStorage.setItem('ew_force_demo_mode', enabled ? 'true' : 'false');
  updateConnectionStatus(enabled ? 'DEMO' : 'LIVE');
}

export function getForcedDemoMode(): boolean {
  return isDemoModeForced;
}

export function getConnectionStatus() {
  return connectionStatus;
}

// Helper to simulate slight async delay in demo mode for realism
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// Centralized API Service with Automatic Transparent Fallback
export const apiService = {
  // --------------------------------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------------------------------
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    if (isDemoModeForced) {
      await delay();
      const user = DEMO_USERS.find(
        (u) =>
          u.username.toLowerCase() === credentials.usernameOrEmail.toLowerCase() ||
          u.email.toLowerCase() === credentials.usernameOrEmail.toLowerCase()
      ) || DEMO_USERS[1]; // default officer_raj
      const response: AuthResponse = {
        token: `mock_jwt_token_${user.username}_${Date.now()}`,
        tokenType: 'Bearer',
        expiresInSeconds: 86400,
        userId: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };
      localStorage.setItem('ew_auth_token', response.token);
      localStorage.setItem('ew_user_profile', JSON.stringify(user));
      return response;
    }

    try {
      const res = await apiClient.post('/auth/login', credentials);
      updateConnectionStatus('LIVE');
      const data: AuthResponse = res.data.data;
      localStorage.setItem('ew_auth_token', data.token);
      return data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      // Fallback for demo credentials
      const user = DEMO_USERS.find(
        (u) =>
          u.username.toLowerCase() === credentials.usernameOrEmail.toLowerCase() ||
          u.email.toLowerCase() === credentials.usernameOrEmail.toLowerCase()
      ) || DEMO_USERS[1];
      const response: AuthResponse = {
        token: `mock_jwt_token_${user.username}`,
        tokenType: 'Bearer',
        expiresInSeconds: 86400,
        userId: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };
      localStorage.setItem('ew_auth_token', response.token);
      localStorage.setItem('ew_user_profile', JSON.stringify(user));
      return response;
    }
  },

  async getCurrentUser(): Promise<UserProfile> {
    if (isDemoModeForced) {
      const saved = localStorage.getItem('ew_user_profile');
      if (saved) return JSON.parse(saved);
      return DEMO_USERS[1];
    }

    try {
      const res = await apiClient.get('/auth/me');
      updateConnectionStatus('LIVE');
      const profile = res.data.data;
      localStorage.setItem('ew_user_profile', JSON.stringify(profile));
      return profile;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      const saved = localStorage.getItem('ew_user_profile');
      if (saved) return JSON.parse(saved);
      return DEMO_USERS[1];
    }
  },

  // --------------------------------------------------------------------------
  // DASHBOARD & SUMMARY
  // --------------------------------------------------------------------------
  async getDashboardSummary(): Promise<DashboardSummary> {
    if (isDemoModeForced) {
      await delay(200);
      return {
        ...DEMO_DASHBOARD_SUMMARY,
        recentEmergencyCases: demoEmergencyCases.slice(0, 5),
        recentWeatherAlerts: demoWeatherAlerts.filter((a) => a.isActive),
      };
    }

    try {
      const res = await apiClient.get('/authority/dashboard/summary');
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return {
        ...DEMO_DASHBOARD_SUMMARY,
        recentEmergencyCases: demoEmergencyCases.slice(0, 5),
        recentWeatherAlerts: demoWeatherAlerts.filter((a) => a.isActive),
      };
    }
  },

  // --------------------------------------------------------------------------
  // GEOGRAPHICAL & RISK MAP
  // --------------------------------------------------------------------------
  async getRiskRegions(): Promise<GeographicalRegion[]> {
    if (isDemoModeForced) {
      return DEMO_REGIONS;
    }

    try {
      const res = await apiClient.get('/authority/dashboard/risk-map/regions');
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return DEMO_REGIONS;
    }
  },

  async getVulnerableGeoJson(): Promise<GeoJsonFeatureCollection> {
    if (isDemoModeForced) {
      return {
        type: 'FeatureCollection',
        features: demoVulnerablePersons.map((p) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [p.longitude, p.latitude],
          },
          properties: {
            id: p.id,
            name: p.fullName,
            category: p.vulnerabilityCategory,
            riskLevel: p.currentRiskLevel,
            riskScore: p.currentRiskScore,
            mobility: p.mobilityStatus,
            address: p.address,
            contactNumber: p.contactNumber,
            verificationStatus: p.verificationStatus,
          },
        })),
      };
    }

    try {
      const res = await apiClient.get('/authority/dashboard/risk-map/vulnerable-geojson');
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return DEMO_GEOJSON_COLLECTION;
    }
  },

  // --------------------------------------------------------------------------
  // VULNERABLE POPULATION MANAGEMENT
  // --------------------------------------------------------------------------
  async getVulnerablePersons(): Promise<VulnerablePerson[]> {
    if (isDemoModeForced) {
      await delay(200);
      return [...demoVulnerablePersons];
    }

    try {
      const res = await apiClient.get('/authority/dashboard/vulnerable-people');
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return [...demoVulnerablePersons];
    }
  },

  async verifyVulnerablePerson(id: number): Promise<VulnerablePerson> {
    if (isDemoModeForced) {
      await delay();
      const person = demoVulnerablePersons.find((p) => p.id === id);
      if (person) {
        person.verificationStatus = 'VERIFIED';
        return { ...person };
      }
      throw new Error('Person not found');
    }

    try {
      const res = await apiClient.patch(`/vulnerable-persons/${id}/verify`);
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      const person = demoVulnerablePersons.find((p) => p.id === id);
      if (person) {
        person.verificationStatus = 'VERIFIED';
        return { ...person };
      }
      throw error;
    }
  },

  async getRiskAssessmentExplanation(personId: number): Promise<RiskAssessmentResult> {
    if (isDemoModeForced) {
      await delay(150);
      return {
        ...DEMO_RISK_ASSESSMENT,
        personId,
        personName: demoVulnerablePersons.find((p) => p.id === personId)?.fullName || 'Selected Citizen',
      };
    }

    try {
      const res = await apiClient.post(`/risk/assess/${personId}`);
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return {
        ...DEMO_RISK_ASSESSMENT,
        personId,
        personName: demoVulnerablePersons.find((p) => p.id === personId)?.fullName || 'Selected Citizen',
      };
    }
  },

  // --------------------------------------------------------------------------
  // WEATHER MONITORING & ALERTS
  // --------------------------------------------------------------------------
  async getWeatherObservations(): Promise<WeatherObservation[]> {
    if (isDemoModeForced) {
      return DEMO_WEATHER_OBSERVATIONS;
    }

    try {
      // In backend, observations are per region or through authority dashboard
      const res = await apiClient.get('/weather/observations/region/1');
      updateConnectionStatus('LIVE');
      return [res.data.data, ...DEMO_WEATHER_OBSERVATIONS.slice(1)];
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return DEMO_WEATHER_OBSERVATIONS;
    }
  },

  async getActiveWeatherAlerts(): Promise<WeatherAlert[]> {
    if (isDemoModeForced) {
      return demoWeatherAlerts.filter((a) => a.isActive);
    }

    try {
      const res = await apiClient.get('/authority/dashboard/alerts/active');
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return demoWeatherAlerts.filter((a) => a.isActive);
    }
  },

  async createWeatherAlert(request: WeatherAlertRequest): Promise<WeatherAlert> {
    if (isDemoModeForced) {
      await delay();
      const newAlert: WeatherAlert = {
        id: demoWeatherAlerts.length + 1,
        alertCode: `ALERT-${request.alertType.substring(0, 2)}-2026-${String(demoWeatherAlerts.length + 1).padStart(3, '0')}`,
        alertType: request.alertType,
        severity: request.severity,
        headline: request.headline,
        description: request.description,
        safetyInstructions: request.safetyInstructions,
        affectedRegionName: request.affectedRegionName,
        affectedRegionId: request.affectedRegionId || 1,
        effectiveFrom: new Date().toISOString(),
        effectiveUntil: new Date(Date.now() + request.validHours * 3600 * 1000).toISOString(),
        isActive: true,
        issuedByName: 'Rajesh Sharma (Authority)',
        createdAt: new Date().toISOString(),
      };
      demoWeatherAlerts.unshift(newAlert);
      return newAlert;
    }

    try {
      const res = await apiClient.post('/weather/alerts', request);
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      const newAlert: WeatherAlert = {
        id: demoWeatherAlerts.length + 1,
        alertCode: `ALERT-${request.alertType.substring(0, 2)}-2026-${String(demoWeatherAlerts.length + 1).padStart(3, '0')}`,
        alertType: request.alertType,
        severity: request.severity,
        headline: request.headline,
        description: request.description,
        safetyInstructions: request.safetyInstructions,
        affectedRegionName: request.affectedRegionName,
        effectiveFrom: new Date().toISOString(),
        effectiveUntil: new Date(Date.now() + request.validHours * 3600 * 1000).toISOString(),
        isActive: true,
        issuedByName: 'Disaster Authority',
        createdAt: new Date().toISOString(),
      };
      demoWeatherAlerts.unshift(newAlert);
      return newAlert;
    }
  },

  async deactivateWeatherAlert(id: number): Promise<void> {
    if (isDemoModeForced) {
      await delay();
      const alert = demoWeatherAlerts.find((a) => a.id === id);
      if (alert) alert.isActive = false;
      return;
    }

    try {
      await apiClient.patch(`/weather/alerts/${id}/deactivate`);
      updateConnectionStatus('LIVE');
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      const alert = demoWeatherAlerts.find((a) => a.id === id);
      if (alert) alert.isActive = false;
    }
  },

  // --------------------------------------------------------------------------
  // EMERGENCY CASES & TRIAGE
  // --------------------------------------------------------------------------
  async getEmergencyCases(): Promise<EmergencyCase[]> {
    const isDemoActive = localStorage.getItem('vulnex_demo_active') === 'true' || isDemoModeForced;
    if (isDemoActive) {
      await delay(150);
      return [...demoEmergencyCases];
    }

    try {
      const res = await apiClient.get('/authority/dashboard/cases');
      updateConnectionStatus('LIVE');
      const liveCases: EmergencyCase[] = res.data.data || [];
      const activeDemoCases = demoEmergencyCases.filter(c => (c as any).isDemo || String(c.id).startsWith('EC-DEMO'));
      return [...activeDemoCases, ...liveCases];
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return [...demoEmergencyCases];
    }
  },

  async updateEmergencyCaseStatus(id: string | number, status: EmergencyStatus, notes?: string): Promise<EmergencyCase> {
    const targetCase = demoEmergencyCases.find((c) => String(c.id) === String(id) || String(c.caseNumber) === String(id));
    if (targetCase) {
      targetCase.status = status;
      if (notes) targetCase.resolutionNotes = notes;
      targetCase.updatedAt = new Date().toISOString();
      persistDemoCases();
    }

    if (isDemoModeForced || localStorage.getItem('vulnex_demo_active') === 'true' || String(id).startsWith('EC-DEMO')) {
      await delay(150);
      if (targetCase) return { ...targetCase };
      throw new Error('Case not found');
    }

    try {
      const res = await apiClient.patch(`/emergency-cases/${id}/status`, { status, notes });
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      if (targetCase) return { ...targetCase };
      throw error;
    }
  },

  async assignResponseTeam(caseId: number | string, teamId: number | string, notes?: string): Promise<any> {
    const targetCase = demoEmergencyCases.find((c) => String(c.id) === String(caseId) || String(c.caseNumber) === String(caseId));
    const team = demoResponseTeams.find((t) => String(t.id) === String(teamId)) || demoResponseTeams[0];
    if (targetCase && team) {
      targetCase.assignedTeamId = team.id;
      targetCase.assignedTeamName = team.teamName;
      targetCase.assignedTeamPhone = team.contactPhone;
      targetCase.status = 'ASSIGNED';
      targetCase.updatedAt = new Date().toISOString();
      if (notes) targetCase.resolutionNotes = notes;
      persistDemoCases();
    }

    if (isDemoModeForced || localStorage.getItem('vulnex_demo_active') === 'true' || String(caseId).startsWith('EC-DEMO')) {
      await delay(150);
      return targetCase ? { ...targetCase } : { id: caseId, status: 'ASSIGNED', assignedTeamName: team?.teamName };
    }

    try {
      const res = await apiClient.post(`/emergency-cases/${caseId}/assign`, {
        responseTeamId: teamId,
        notes,
      });
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return targetCase ? { ...targetCase } : { id: caseId, status: 'ASSIGNED', assignedTeamName: team?.teamName };
    }
  },

  // --------------------------------------------------------------------------
  // RESPONSE TEAMS
  // --------------------------------------------------------------------------
  async getResponseTeams(): Promise<ResponseTeam[]> {
    if (isDemoModeForced) {
      return [...demoResponseTeams];
    }

    try {
      const res = await apiClient.get('/response-teams');
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return [...demoResponseTeams];
    }
  },

  async toggleTeamAvailability(teamId: number): Promise<ResponseTeam> {
    if (isDemoModeForced) {
      const team = demoResponseTeams.find((t) => t.id === teamId);
      if (team) {
        team.isAvailable = !team.isAvailable;
        return { ...team };
      }
      throw new Error('Team not found');
    }

    try {
      const res = await apiClient.patch(`/response-teams/${teamId}/availability`);
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      const team = demoResponseTeams.find((t) => t.id === teamId);
      if (team) {
        team.isAvailable = !team.isAvailable;
        return { ...team };
      }
      throw error;
    }
  },

  // Health check
  async pingBackend(): Promise<boolean> {
    try {
      await apiClient.get('/auth/me');
      updateConnectionStatus('LIVE');
      return true;
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        // Connected to backend, just unauthenticated!
        updateConnectionStatus('LIVE');
        return true;
      }
      updateConnectionStatus(isDemoModeForced ? 'DEMO' : 'OFFLINE');
      return false;
    }
  },

  // Official India Meteorological Department (IMD) Early Warning Feeds
  async getImdWarnings(): Promise<any[]> {
    try {
      const res = await apiClient.get('/authority/dashboard/imd-warnings');
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return [
        {
          state: 'Karnataka',
          district: 'Kodagu',
          colorCode: 'ORANGE',
          warningLevel: 'WARNING',
          hazardType: 'Flash Floods & Landslides',
          description: 'Official IMD Alert: Very Heavy to Extremely Heavy Rainfall expected in Western Ghats valleys.',
          source: 'Indian Meteorological Department (mausam.imd.gov.in)',
          vulnerableCount: 8,
          timestamp: new Date().toISOString(),
        },
        {
          state: 'Karnataka',
          district: 'Uttara Kannada',
          colorCode: 'ORANGE',
          warningLevel: 'WARNING',
          hazardType: 'Coastal Inundation & Squall',
          description: 'Official IMD Alert: Gale wind speed 55-65 kmph gusting to 75 kmph along and off coastal belt.',
          source: 'Indian Meteorological Department (mausam.imd.gov.in)',
          vulnerableCount: 6,
          timestamp: new Date().toISOString(),
        },
        {
          state: 'Karnataka',
          district: 'Bengaluru Urban',
          colorCode: 'YELLOW',
          warningLevel: 'WATCH',
          hazardType: 'Urban Flooding & Thunderstorms',
          description: 'Official IMD Alert: Thunderstorms with lightning and gusty winds 30-40 kmph.',
          source: 'Indian Meteorological Department (mausam.imd.gov.in)',
          vulnerableCount: 4,
          timestamp: new Date().toISOString(),
        },
      ];
    }
  },

  async getImdStatus(): Promise<any> {
    try {
      const res = await apiClient.get('/authority/dashboard/imd-status');
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      return {
        service: 'VULNEX India IMD Early Warning System',
        status: 'OPERATIONAL',
        monitoredDistricts: 5,
        matchedVulnerablePersons: 30,
        activeAlerts: 5,
        source: 'https://mausam.imd.gov.in/',
      };
    }
  },

  async syncImdWarnings(): Promise<any> {
    const res = await apiClient.post('/authority/dashboard/imd-sync');
    updateConnectionStatus('LIVE');
    return res.data;
  },

  // --------------------------------------------------------------------------
  // VULNEX RESPONSE PRIORITY & ACTION PLAN ENGINE
  // --------------------------------------------------------------------------
  async getResponsePriorityPlan(district?: string): Promise<any> {
    try {
      const url = district && district !== 'ALL'
        ? `/authority/dashboard/response-priority-plan?district=${encodeURIComponent(district)}`
        : '/authority/dashboard/response-priority-plan';
      const res = await apiClient.get(url);
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return {
        generatedAt: new Date().toISOString(),
        activeWarningsCount: 4,
        affectedDistricts: ['Kodagu', 'Uttara Kannada', 'Udupi', 'Bengaluru Urban'],
        totalVulnerableInAffectedZones: demoVulnerablePersons.length,
        criticalCasesCount: demoEmergencyCases.filter(c => c.priority === 'CRITICAL').length,
        availableTeamsCount: demoResponseTeams.filter(t => t.isAvailable).length,
        planItems: demoVulnerablePersons.map((p, idx) => ({
          rank: idx + 1,
          targetPersonId: p.id,
          targetPersonName: p.fullName,
          vulnerabilityCategory: p.vulnerabilityCategory,
          mobilityStatus: p.mobilityStatus,
          age: p.age,
          address: p.address,
          district: 'Karnataka',
          latitude: p.latitude,
          longitude: p.longitude,
          hasActiveSos: idx < 2,
          activeCaseId: idx < 2 ? demoEmergencyCases[idx]?.id : null,
          activeCaseNumber: idx < 2 ? demoEmergencyCases[idx]?.caseNumber : null,
          hazardName: idx < 8 ? 'IMD ORANGE Warning: HEAVY_RAINFALL' : 'Weather Watch',
          hazardSeverity: idx < 8 ? 'SEVERE' : 'MODERATE',
          distanceToHazardCenterKm: 3.5,
          priorityScore: Math.max(20, 100 - idx * 2.8),
          priorityLevel: idx < 5 ? 'CRITICAL_IMMEDIATE' : idx < 15 ? 'HIGH_PRIORITY' : 'URGENT_MONITOR',
          reasons: [
            idx < 2 ? 'CRITICAL DISTRESS: Active SOS assistance request filed' : 'Covered by regional weather alert',
            `${p.mobilityStatus} mobility requiring dedicated evacuation transport`,
            `Registered under ${p.vulnerabilityCategory} protocol`,
            p.age >= 75 ? `Advanced age (${p.age} yrs)` : 'Priority demographic index'
          ],
          recommendedAction: idx < 5
            ? 'Deploy immediate field rescue team. Evacuate to nearest designated emergency shelter'
            : 'Conduct proactive welfare check & prepare transport assistance to shelter',
          recommendedTeamId: demoResponseTeams[0]?.id,
          recommendedTeamName: demoResponseTeams[0]?.teamName,
          assignedTeamId: idx < 2 ? demoResponseTeams[0]?.id : null,
          assignedTeamName: idx < 2 ? demoResponseTeams[0]?.teamName : null,
          status: idx < 2 ? 'IN_PROGRESS' : 'PENDING_APPROVAL',
          nearbyShelterName: 'Madikeri General Hospital Evacuation Wing',
          nearbyShelterDistanceKm: 1.8
        }))
      };
    }
  },

  // --------------------------------------------------------------------------
  // SHELTERS & EVACUATION CENTERS
  // --------------------------------------------------------------------------
  async getShelters(district?: string): Promise<any[]> {
    try {
      const url = district && district !== 'ALL'
        ? `/shelters?district=${encodeURIComponent(district)}`
        : '/shelters';
      const res = await apiClient.get(url);
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return [
        {
          shelterId: '30000000-0000-0000-0000-000000000001',
          shelterCode: 'SHL-BLR-01',
          shelterName: 'Kanteerava Stadium Indoor Relief Center',
          district: 'Bengaluru Urban',
          taluk: 'Bengaluru South',
          address: 'Kasturba Road, Sampangi Rama Nagara',
          latitude: 12.9698,
          longitude: 77.5928,
          contactPersonName: 'Suresh Gowda',
          contactPhone: '+91-9845000101',
          isAccessibleDisabled: true,
          hasMedicalFacility: true,
          hasBackupPower: true,
          status: 'ACTIVE'
        },
        {
          shelterId: '30000000-0000-0000-0000-000000000004',
          shelterCode: 'SHL-KDG-04',
          shelterName: 'Madikeri General Hospital Evacuation Wing',
          district: 'Kodagu',
          taluk: 'Madikeri',
          address: 'College Road, Madikeri',
          latitude: 12.426,
          longitude: 75.739,
          contactPersonName: 'Dr. Muthappa',
          contactPhone: '+91-9845000104',
          isAccessibleDisabled: true,
          hasMedicalFacility: true,
          hasBackupPower: true,
          status: 'ACTIVE'
        },
        {
          shelterId: '30000000-0000-0000-0000-000000000002',
          shelterCode: 'SHL-UK-02',
          shelterName: 'Karwar Government Model High School',
          district: 'Uttara Kannada',
          taluk: 'Karwar',
          address: 'Near Kodibag Beach Road',
          latitude: 14.821,
          longitude: 74.135,
          contactPersonName: 'Shankar Naik',
          contactPhone: '+91-9845000102',
          isAccessibleDisabled: true,
          hasMedicalFacility: false,
          hasBackupPower: true,
          status: 'ACTIVE'
        },
        {
          shelterId: '30000000-0000-0000-0000-000000000005',
          shelterCode: 'SHL-UDP-05',
          shelterName: 'Malpe Fishermen Community Complex',
          district: 'Udupi',
          taluk: 'Udupi',
          address: 'Port Road, Malpe',
          latitude: 13.342,
          longitude: 74.745,
          contactPersonName: 'Ramesh Kotian',
          contactPhone: '+91-9845000105',
          isAccessibleDisabled: true,
          hasMedicalFacility: true,
          hasBackupPower: true,
          status: 'ACTIVE'
        },
        {
          shelterId: '30000000-0000-0000-0000-000000000003',
          shelterCode: 'SHL-KLB-03',
          shelterName: 'Gulbarga University Community Hall',
          district: 'Kalaburagi',
          taluk: 'Kalaburagi',
          address: 'Jnana Ganga Campus, Sedam Road',
          latitude: 17.331,
          longitude: 76.839,
          contactPersonName: 'Prof. Patil',
          contactPhone: '+91-9845000103',
          isAccessibleDisabled: true,
          hasMedicalFacility: false,
          hasBackupPower: true,
          status: 'ACTIVE'
        }
      ];
    }
  },

  // --------------------------------------------------------------------------
  // CITIZEN & MOBILE REST APIS
  // --------------------------------------------------------------------------
  async registerCitizen(data: any): Promise<any> {
    const res = await apiClient.post('/auth/register', {
      username: data.username || data.email,
      email: data.email,
      password: data.password || 'Password@123',
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      role: 'ROLE_CITIZEN',
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone
    });
    updateConnectionStatus('LIVE');
    if (res.data.data?.token) {
      localStorage.setItem('ew_auth_token', res.data.data.token);
    }
    return res.data.data;
  },

  async registerVulnerableDependent(data: any): Promise<any> {
    try {
      const res = await apiClient.post('/mobile/vulnerable-persons', data);
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      const newPerson = {
        id: demoVulnerablePersons.length + 1,
        ...data,
        currentRiskLevel: 'HIGH',
        currentRiskScore: 78.5,
        verificationStatus: 'PENDING'
      };
      demoVulnerablePersons.unshift(newPerson as any);
      return newPerson;
    }
  },

  async getMyDependents(): Promise<any[]> {
    try {
      const res = await apiClient.get('/mobile/vulnerable-persons/my');
      updateConnectionStatus('LIVE');
      return res.data.data || [];
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return demoVulnerablePersons.slice(0, 2);
    }
  },

  async submitSosRequest(data: any): Promise<any> {
    const isDemoActive = localStorage.getItem('vulnex_demo_active') === 'true' || isDemoModeForced;
    const newCase = {
      id: `EC-DEMO-${Date.now().toString().slice(-6)}`,
      caseNumber: `EC-DEMO-${Date.now().toString().slice(-6)}`,
      status: 'REPORTED',
      priority: data.priority || 'CRITICAL',
      emergencyCategory: data.emergencyCategory || 'EVACUATION',
      description: data.description || 'CRITICAL CITIZEN SOS: Evacuation assistance urgently requested.',
      address: data.address || 'Kodagu District, Karnataka (Citizen SOS Call)',
      latitude: data.latitude || 12.426,
      longitude: data.longitude || 75.739,
      reporterName: 'John Doe (Demo Citizen)',
      reporterPhone: '+91-9876543210',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: true,
      ...data,
    };

    demoEmergencyCases.unshift(newCase as any);
    persistDemoCases();

    if (!isDemoModeForced) {
      try {
        const res = await apiClient.post('/mobile/emergency-cases', data);
        updateConnectionStatus('LIVE');
        if (res.data?.data) {
          newCase.id = res.data.data.id || newCase.id;
          newCase.caseNumber = res.data.data.caseNumber || newCase.caseNumber;
          persistDemoCases();
          return res.data.data;
        }
      } catch (err) {
        // Fall back cleanly to the created demo case
      }
    }

    return newCase;
  },

  async createEmergencyCase(data: any): Promise<any> {
    return this.submitSosRequest(data);
  },

  async getMyEmergencyCases(): Promise<any[]> {
    const isDemoActive = localStorage.getItem('vulnex_demo_active') === 'true' || isDemoModeForced;
    if (isDemoActive) {
      const activeDemoCases = demoEmergencyCases.filter(
        (c) => c.isDemo || String(c.id).startsWith('EC-DEMO') || c.reporterName?.includes('John')
      );
      if (activeDemoCases.length > 0) {
        return activeDemoCases;
      }
      return demoEmergencyCases.slice(0, 3);
    }

    try {
      const res = await apiClient.get('/mobile/emergency-cases/my');
      updateConnectionStatus('LIVE');
      return res.data.data || [];
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      const activeDemoCases = demoEmergencyCases.filter(
        (c) => c.isDemo || String(c.id).startsWith('EC-DEMO')
      );
      return activeDemoCases.length > 0 ? activeDemoCases : demoEmergencyCases.slice(0, 3);
    }
  },

  async getTargetedImdAlert(state = 'Karnataka', district = 'Kodagu', lat?: number, lon?: number): Promise<any> {
    try {
      let url = `/mobile/weather-alerts/imd?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`;
      if (lat != null && lon != null) {
        url += `&latitude=${lat}&longitude=${lon}`;
      }
      const res = await apiClient.get(url);
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      updateConnectionStatus('DEMO');
      return {
        district,
        state,
        warningType: 'HEAVY_RAINFALL',
        imdColorCode: 'ORANGE',
        severityLevel: 'SEVERE',
        headline: `IMD Orange Alert: Isolated Very Heavy Rainfall in ${district} District`,
        description: 'Official India IMD Warning: Heavy precipitation with localized waterlogging and riverine flooding risk.',
        safetyInstructions: 'Stay indoors, keep emergency communications charged, and follow SDMA evacuation advisories.',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        validUntil: new Date(Date.now() + 86400000).toISOString(),
        sourceUrl: 'https://mausam.imd.gov.in/'
      };
    }
  },

  async getEmergencyHelplines(): Promise<any[]> {
    try {
      const res = await apiClient.get('/mobile/helplines');
      updateConnectionStatus('LIVE');
      return res.data.data;
    } catch {
      return [
        { name: 'National Disaster Helpline', phone: '1078', category: 'DISASTER' },
        { name: 'Medical Emergency / Ambulance', phone: '108', category: 'MEDICAL' },
        { name: 'Police / First Response', phone: '112', category: 'POLICE' },
        { name: 'Fire & Flood Rescue', phone: '101', category: 'RESCUE' },
        { name: 'Women & Pregnancy Emergency Helpline', phone: '1091', category: 'MATERNAL' }
      ];
    }
  },
};

function isNetworkError(error: any): boolean {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError;
    return !err.response || err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK';
  }
  return true;
}
