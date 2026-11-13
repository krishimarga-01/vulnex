// ============================================================================
// Shared TypeScript Domain Types & DTOs
// Extreme Weather Vulnerability Identification & Emergency Response System
// Mirrors Spring Boot REST API & PostgreSQL Entities
// ============================================================================

export type UserRole =
  | 'ROLE_ADMIN'
  | 'ROLE_AUTHORITY'
  | 'ROLE_CAREGIVER'
  | 'ROLE_CITIZEN'
  | 'ROLE_VOLUNTEER';

export type VulnerabilityCategory =
  | 'ELDERLY'
  | 'CHILD'
  | 'DISABILITY'
  | 'PREGNANT'
  | 'MEDICAL_ASSISTANCE';

export type MobilityStatus =
  | 'INDEPENDENT'
  | 'ASSISTED'
  | 'WHEELCHAIR'
  | 'BEDRIDDEN';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type WeatherSeverity = 'MODERATE' | 'SEVERE' | 'EXTREME';

export type AlertType = 'HEATWAVE' | 'FLOOD' | 'CYCLONE' | 'STORM' | 'TSUNAMI';

export type EmergencyCategory =
  | 'MEDICAL_ASSISTANCE'
  | 'EVACUATION'
  | 'RESCUE'
  | 'FOOD_WATER'
  | 'TRANSPORTATION'
  | 'OTHER';

export type EmergencyPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EmergencyStatus =
  | 'REPORTED'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type TeamType = 'MEDICAL' | 'EVACUATION' | 'RESCUE' | 'GENERAL';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  accountStatus: 'ACTIVE' | 'SUSPENDED';
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: string;
}

export interface VulnerablePerson {
  id: number;
  nationalId: string;
  fullName: string;
  age: number;
  dateOfBirth?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  vulnerabilityCategory: VulnerabilityCategory;
  medicalConditions: string;
  mobilityStatus: MobilityStatus;
  assistanceRequirements: string;
  contactNumber: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  latitude: number;
  longitude: number;
  registeredByUserId: number;
  caregiverUserId?: number;
  caregiverName?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FLAGGED';
  consentGiven: boolean;
  currentRiskLevel: RiskLevel;
  currentRiskScore: number;
  lastAssessedAt?: string;
  createdAt?: string;
}

export interface VulnerablePersonRequest {
  nationalId: string;
  fullName: string;
  age: number;
  dateOfBirth?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  vulnerabilityCategory: VulnerabilityCategory;
  medicalConditions: string;
  mobilityStatus: MobilityStatus;
  assistanceRequirements: string;
  contactNumber: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  latitude: number;
  longitude: number;
  consentGiven: boolean;
}

export interface WeatherObservation {
  id: number;
  regionId: number;
  regionName: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  weatherCondition: string;
  isSimulated: boolean;
  recordedAt: string;
}

export interface WeatherAlert {
  id: number;
  alertCode: string;
  alertType: AlertType;
  severity: WeatherSeverity;
  headline: string;
  description: string;
  safetyInstructions: string;
  affectedRegionName: string;
  affectedRegionId?: number;
  effectiveFrom: string;
  effectiveUntil: string;
  isActive: boolean;
  issuedByUserId?: number;
  issuedByName?: string;
  createdAt: string;
}

export interface WeatherAlertRequest {
  alertType: AlertType;
  severity: WeatherSeverity;
  headline: string;
  description: string;
  safetyInstructions: string;
  affectedRegionName: string;
  affectedRegionId?: number;
  validHours: number;
}

export interface EmergencyCase {
  id: number;
  caseNumber: string;
  reporterUserId: number;
  reporterName?: string;
  reporterPhone?: string;
  affectedPersonId?: number;
  affectedPersonName?: string;
  emergencyCategory: EmergencyCategory;
  description: string;
  priority: EmergencyPriority;
  latitude: number;
  longitude: number;
  address: string;
  status: EmergencyStatus;
  assignedTeamId?: number;
  assignedTeamName?: string;
  assignedTeamPhone?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EmergencyCaseRequest {
  affectedPersonId?: number;
  emergencyCategory: EmergencyCategory;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  priority?: EmergencyPriority;
}

export interface ResponseTeam {
  id: number;
  teamName: string;
  teamType: TeamType;
  contactPhone: string;
  baseLocationName: string;
  isAvailable: boolean;
  currentCapacity: number;
  activeAssignmentsCount?: number;
}

export interface GeographicalRegion {
  id: number;
  name: string;
  regionCode: string;
  regionType: 'WARD' | 'MUNICIPALITY' | 'DISTRICT';
  centerLatitude: number;
  centerLongitude: number;
  currentRiskLevel: RiskLevel;
  activeAlertCount: number;
  population: number;
  vulnerableCount?: number;
  coordinates?: [number, number][]; // Polygon coordinates
}

export interface GeoJsonGeometry {
  type: 'Point' | 'Polygon';
  coordinates: any;
}

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: GeoJsonGeometry;
  properties: {
    id: number;
    name: string;
    category?: VulnerabilityCategory;
    riskLevel: RiskLevel;
    riskScore?: number;
    mobility?: MobilityStatus;
    address?: string;
    contactNumber?: string;
    verificationStatus?: string;
    affectedRegion?: string;
  };
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface RiskScoreFactor {
  ruleCode: string;
  category: string;
  description: string;
  appliedPoints: number;
}

export interface RiskAssessmentResult {
  personId: number;
  personName: string;
  totalScore: number;
  riskLevel: RiskLevel;
  assessedAt: string;
  contributingFactors: RiskScoreFactor[];
}

export interface DashboardSummary {
  totalVulnerablePeople: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  activeWeatherAlerts: number;
  pendingEmergencyRequests: number;
  resolvedCasesCount: number;
  totalResponseTeams: number;
  availableResponseTeams: number;
  activeHeatwaves: number;
  activeFloods: number;
  categoryBreakdown: {
    category: VulnerabilityCategory;
    count: number;
  }[];
  regionalRiskBreakdown: {
    regionName: string;
    riskLevel: RiskLevel;
    vulnerableCount: number;
  }[];
  recentEmergencyCases: EmergencyCase[];
  recentWeatherAlerts: WeatherAlert[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'ALERT' | 'CASE_UPDATE' | 'AUTHORITY' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
}

export interface Helpline {
  name: string;
  number: string;
  description: string;
  is24x7: boolean;
}
