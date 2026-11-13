// ============================================================================
// REST API Endpoint Definitions
// Connects to Spring Boot 3.x REST Backend
// ============================================================================

export const API_ENDPOINTS = {
  // Authentication & Profile
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },

  // Authority Dashboard
  AUTHORITY: {
    SUMMARY: '/authority/dashboard/summary',
    VULNERABLE_PEOPLE: '/authority/dashboard/vulnerable-people',
    IMMEDIATE_ATTENTION: '/authority/dashboard/vulnerable-people/immediate-attention',
    ACTIVE_ALERTS: '/authority/dashboard/alerts/active',
    CASES: '/authority/dashboard/cases',
    REGIONS: '/authority/dashboard/risk-map/regions',
    VULNERABLE_GEOJSON: '/authority/dashboard/risk-map/vulnerable-geojson',
  },

  // Vulnerable Person Management
  VULNERABLE_PERSONS: {
    LIST: '/vulnerable-persons',
    DETAIL: (id: number) => `/vulnerable-persons/${id}`,
    CREATE: '/vulnerable-persons',
    UPDATE: (id: number) => `/vulnerable-persons/${id}`,
    VERIFY: (id: number) => `/vulnerable-persons/${id}/verify`,
  },

  // Mobile App Dedicated Endpoints
  MOBILE: {
    VULNERABLE_PERSONS: '/mobile/vulnerable-persons',
    MY_VULNERABLE_PERSONS: '/mobile/vulnerable-persons/my',
    EMERGENCY_CASES: '/mobile/emergency-cases',
    MY_EMERGENCY_CASES: '/mobile/emergency-cases/my',
    NEARBY_ALERTS: '/mobile/weather-alerts/nearby',
    FCM_TOKEN: '/mobile/fcm-token',
    HELPLINES: '/mobile/helplines',
  },

  // Emergency Cases & Triage
  EMERGENCY_CASES: {
    LIST: '/emergency-cases',
    DETAIL: (id: number) => `/emergency-cases/${id}`,
    CREATE: '/emergency-cases',
    ASSIGN_TEAM: (id: number) => `/emergency-cases/${id}/assign`,
    UPDATE_STATUS: (id: number) => `/emergency-cases/${id}/status`,
  },

  // Response Teams
  RESPONSE_TEAMS: {
    LIST: '/response-teams',
    DETAIL: (id: number) => `/response-teams/${id}`,
    CREATE: '/response-teams',
    TOGGLE_AVAILABILITY: (id: number) => `/response-teams/${id}/availability`,
  },

  // Weather & Meteorological
  WEATHER: {
    CURRENT_BY_COORDS: '/weather/current',
    OBSERVATION_BY_REGION: (regionId: number) => `/weather/observations/region/${regionId}`,
    ACTIVE_ALERTS: '/weather/alerts/active',
    CREATE_ALERT: '/weather/alerts',
    DEACTIVATE_ALERT: (id: number) => `/weather/alerts/${id}/deactivate`,
  },

  // Geographical Risk & GeoJSON
  GEOGRAPHY: {
    REGIONS: '/geography/regions',
    RISK_MAP_SUMMARY: '/geography/risk-summary',
    GEOJSON_ZONES: '/geography/geojson/zones',
  },

  // Risk Engine & Transparent Scoring
  RISK: {
    ASSESS_PERSON: (personId: number) => `/risk/assess/${personId}`,
    RULES: '/risk/rules',
    UPDATE_RULE: (code: string) => `/risk/rules/${code}`,
  },
} as const;
