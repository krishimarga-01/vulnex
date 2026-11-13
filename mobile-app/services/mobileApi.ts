import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  AuthRequest,
  AuthResponse,
  RegisterRequest,
  UserProfile,
  VulnerablePerson,
  VulnerablePersonRequest,
  EmergencyCase,
  EmergencyCaseRequest,
  WeatherAlert,
  WeatherObservation,
  Helpline,
} from '../types';
import {
  DEMO_USERS,
  DEMO_VULNERABLE_PERSONS,
  DEMO_WEATHER_ALERTS,
  DEMO_WEATHER_OBSERVATIONS,
  DEMO_EMERGENCY_CASES,
  DEMO_HELPLINES,
} from '../shared/api-contracts/mockData';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

// In-memory mobile state for demo mode
let mobileEmergencyCases = [...DEMO_EMERGENCY_CASES];
let mobileVulnerablePersons = [...DEMO_VULNERABLE_PERSONS];
let currentToken: string | null = null;
// Live vs Demo mode configuration (defaults to LIVE unless explicitly configured)
const configuredDemoMode = process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE === 'true';
let isDemoMode = configuredDemoMode;

export const mobileClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

mobileClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (currentToken && config.headers) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const mobileApi = {
  setToken(token: string | null) {
    currentToken = token;
  },

  setDemoMode(enabled: boolean) {
    isDemoMode = enabled;
  },

  getDemoMode(): boolean {
    return isDemoMode;
  },

  // Auth
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    if (isDemoMode) {
      await delay();
      const user =
        DEMO_USERS.find(
          (u) =>
            u.username.toLowerCase() === credentials.usernameOrEmail.toLowerCase() ||
            u.email.toLowerCase() === credentials.usernameOrEmail.toLowerCase()
        ) || DEMO_USERS[3]; // default citizen_john
      const authRes: AuthResponse = {
        token: `mock_mobile_jwt_${user.username}_${Date.now()}`,
        tokenType: 'Bearer',
        expiresInSeconds: 86400,
        userId: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };
      currentToken = authRes.token;
      return authRes;
    }

    try {
      const res = await mobileClient.post('/auth/login', credentials);
      const data: AuthResponse = res.data.data;
      currentToken = data.token;
      return data;
    } catch (err) {
      if (configuredDemoMode) {
        // Fallback for offline demo testing only
        isDemoMode = true;
        const user = DEMO_USERS[3];
        return {
          token: `mock_mobile_jwt_${user.username}`,
          tokenType: 'Bearer',
          expiresInSeconds: 86400,
          userId: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        };
      }
      throw err;
    }
  },

  async register(req: RegisterRequest): Promise<AuthResponse> {
    if (isDemoMode) {
      await delay();
      return {
        token: `mock_mobile_jwt_${req.username}_${Date.now()}`,
        tokenType: 'Bearer',
        expiresInSeconds: 86400,
        userId: Date.now(),
        username: req.username,
        email: req.email,
        fullName: req.fullName,
        role: req.role,
      };
    }

    const res = await mobileClient.post('/auth/register', req);
    return res.data.data;
  },

  async getProfile(): Promise<UserProfile> {
    if (isDemoMode) {
      return DEMO_USERS[3]; // John Doe Citizen
    }
    const res = await mobileClient.get('/auth/me');
    return res.data.data;
  },

  // Vulnerable Person Registration & List
  async registerVulnerablePerson(req: VulnerablePersonRequest): Promise<VulnerablePerson> {
    if (isDemoMode) {
      await delay();
      const newPerson: VulnerablePerson = {
        id: mobileVulnerablePersons.length + 1,
        nationalId: req.nationalId,
        fullName: req.fullName,
        age: req.age,
        dateOfBirth: req.dateOfBirth,
        gender: req.gender,
        vulnerabilityCategory: req.vulnerabilityCategory,
        medicalConditions: req.medicalConditions,
        mobilityStatus: req.mobilityStatus,
        assistanceRequirements: req.assistanceRequirements,
        contactNumber: req.contactNumber,
        address: req.address,
        emergencyContactName: req.emergencyContactName,
        emergencyContactPhone: req.emergencyContactPhone,
        emergencyContactRelationship: req.emergencyContactRelationship,
        latitude: req.latitude,
        longitude: req.longitude,
        registeredByUserId: 4,
        verificationStatus: 'PENDING',
        consentGiven: req.consentGiven,
        currentRiskLevel: req.age >= 75 || req.mobilityStatus === 'BEDRIDDEN' ? 'HIGH' : 'MEDIUM',
        currentRiskScore: req.age >= 75 || req.mobilityStatus === 'BEDRIDDEN' ? 80.0 : 60.0,
        createdAt: new Date().toISOString(),
      };
      mobileVulnerablePersons.unshift(newPerson);
      return newPerson;
    }

    const res = await mobileClient.post('/mobile/vulnerable-persons', req);
    return res.data.data;
  },

  async getMyVulnerablePersons(): Promise<VulnerablePerson[]> {
    if (isDemoMode) {
      return [...mobileVulnerablePersons];
    }
    try {
      const res = await mobileClient.get('/mobile/vulnerable-persons/my');
      return res.data.data;
    } catch {
      return [...mobileVulnerablePersons];
    }
  },

  // Emergency SOS Request
  async submitEmergencyRequest(req: EmergencyCaseRequest): Promise<EmergencyCase> {
    if (isDemoMode) {
      await delay(400);
      const caseNumber = `EC-2026-${String(mobileEmergencyCases.length + 1).padStart(3, '0')}`;
      const newCase: EmergencyCase = {
        id: mobileEmergencyCases.length + 1,
        caseNumber,
        reporterUserId: 4,
        reporterName: 'John Doe (Citizen)',
        reporterPhone: '+1-555-0103',
        emergencyCategory: req.emergencyCategory,
        description: req.description,
        priority: req.priority || 'HIGH',
        latitude: req.latitude,
        longitude: req.longitude,
        address: req.address,
        status: 'REPORTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mobileEmergencyCases.unshift(newCase);
      return newCase;
    }

    const res = await mobileClient.post('/mobile/emergency-cases', req);
    return res.data.data;
  },

  async getMyEmergencyCases(): Promise<EmergencyCase[]> {
    if (isDemoMode) {
      return [...mobileEmergencyCases];
    }
    try {
      const res = await mobileClient.get('/mobile/emergency-cases/my');
      return res.data.data;
    } catch {
      return [...mobileEmergencyCases];
    }
  },

  // Weather & Alerts
  async getNearbyAlerts(): Promise<WeatherAlert[]> {
    if (isDemoMode) {
      return DEMO_WEATHER_ALERTS.filter((a) => a.isActive);
    }
    try {
      const res = await mobileClient.get('/mobile/weather-alerts/nearby');
      return res.data.data;
    } catch {
      return DEMO_WEATHER_ALERTS.filter((a) => a.isActive);
    }
  },

  async getCurrentWeather(): Promise<WeatherObservation> {
    if (isDemoMode) {
      return DEMO_WEATHER_OBSERVATIONS[0];
    }
    try {
      const res = await mobileClient.get('/weather/current');
      return res.data.data;
    } catch {
      return DEMO_WEATHER_OBSERVATIONS[0];
    }
  },

  // Helplines directory
  async getHelplines(): Promise<Helpline[]> {
    if (isDemoMode) {
      return DEMO_HELPLINES;
    }
    try {
      const res = await mobileClient.get('/mobile/helplines');
      return res.data.data;
    } catch {
      return DEMO_HELPLINES;
    }
  },

  // Push notifications token registration
  async registerPushToken(token: string): Promise<void> {
    if (isDemoMode) return;
    try {
      await mobileClient.post('/mobile/fcm-token', { token });
    } catch {
      // Ignore background token registration error
    }
  },
};
