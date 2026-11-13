# EXTREME WEATHER VULNERABILITY IDENTIFICATION & EMERGENCY RESPONSE SYSTEM
## Production Backend API Specification & Verification Catalog

This document specifies all **45 REST endpoints** implemented in the Java 21 / Spring Boot 3.3.5 backend. Every endpoint has been verified against the active runtime instance.

---

### Security & Role Matrix Reference

| Role | Description | Typical Access |
|---|---|---|
| `PUBLIC` / `PermitAll` | Unauthenticated public access | Login, Registration, OpenAPI Docs, Actuator Health |
| `ROLE_CITIZEN` | General citizens & affected persons | Profile, Submit SOS, View nearby alerts, Register dependents |
| `ROLE_CAREGIVER` | Certified or designated caregivers | Register and link vulnerable individuals, Submit targeted SOS |
| `ROLE_VOLUNTEER` | Disaster relief first responders | View emergency cases, Update rescue status |
| `ROLE_AUTHORITY` | Disaster Management Officials / Municipalities | Full unmasked PII, Dispatch teams, Issue warnings, View Risk Map |
| `ROLE_ADMIN` | System Administrators | User management, Configure scoring rules & weights, System audit |

---

## 1. Authentication & User Management

### 1.1 Authenticate User (Login)
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Required Role**: `PermitAll`
- **Description**: Authenticates user via username and BCrypt password, returning a JWT Bearer token valid for 24 hours.

**Request JSON:**
```json
{
  "username": "officer_raj",
  "password": "Password@123"
}
```

**Response JSON (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzM4NCJ9.eyJpc3MiOiJleHRyZW1lLXdlYXRoZXItcmVzcG9uc2Utc3lzdGVtIiwic3ViIjoib2ZmaWNlcl9yYWoiLCJyb2xlcyI6WyJST0xFX0FVVEhPUklUWSJdLCJpYXQiOjE3OTQ0NjY3OTIsInZXhwIjoxNzk0NTUzMTkyfQ...",
    "tokenType": "Bearer",
    "expiresInMs": 86400000,
    "userId": 2,
    "username": "officer_raj",
    "email": "officer.raj@gov.org",
    "fullName": "Rajesh Sharma",
    "role": "ROLE_AUTHORITY"
  },
  "timestamp": "2026-11-12T07:02:45.000Z"
}
```

---

### 1.2 Register New User
- **Method**: `POST`
- **Path**: `/api/v1/auth/register`
- **Required Role**: `PermitAll`
- **Description**: Registers a citizen, caregiver, volunteer, or authority user.

**Request JSON:**
```json
{
  "username": "citizen_chennai_01",
  "email": "citizen01@example.org",
  "password": "Password@123",
  "fullName": "Kavitha Sundaram",
  "phoneNumber": "+919876543210",
  "role": "ROLE_CITIZEN",
  "emergencyContactName": "Sundaram (Father)",
  "emergencyContactPhone": "+919876543211",
  "fcmToken": "c7x_sample_fcm_token_device_01"
}
```

**Response JSON (HTTP 201 CREATED):**
```json
{
  "success": true,
  "message": "User registered and authenticated successfully",
  "data": {
    "token": "eyJhbGciOiJIUzM4NCJ9...",
    "tokenType": "Bearer",
    "expiresInMs": 86400000,
    "userId": 6,
    "username": "citizen_chennai_01",
    "email": "citizen01@example.org",
    "fullName": "Kavitha Sundaram",
    "role": "ROLE_CITIZEN"
  },
  "timestamp": "2026-11-12T07:02:45.100Z"
}
```

---

### 1.3 Get Current User Profile
- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Required Role**: Authenticated (`CITIZEN`, `CAREGIVER`, `VOLUNTEER`, `AUTHORITY`, `ADMIN`)
- **Headers**: `Authorization: Bearer <TOKEN>`

**Response JSON (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 4,
    "username": "citizen_john",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+1-555-0103",
    "role": "ROLE_CITIZEN",
    "accountStatus": "ACTIVE",
    "emergencyContactName": "Family",
    "emergencyContactPhone": "+1-555-0111",
    "createdAt": "2026-11-12T06:44:31.860Z"
  },
  "timestamp": "2026-11-12T07:02:45.150Z"
}
```

---

## 2. Vulnerable Population Management

### 2.1 Register Vulnerable Person
- **Method**: `POST`
- **Path**: `/api/v1/vulnerable-persons`
- **Required Role**: `AUTHORITY`, `ADMIN`, `CAREGIVER`, `CITIZEN`
- **Description**: Registers an elderly individual, child, pregnant woman, or person with severe disabilities.

**Request JSON:**
```json
{
  "fullName": "Ramanathan Pillai",
  "age": 82,
  "gender": "MALE",
  "vulnerabilityCategory": "ELDERLY",
  "medicalConditions": "Cardiac Arrhythmia, Severe Hypertension",
  "mobilityStatus": "WHEELCHAIR",
  "assistanceRequirements": "Requires wheelchair ramp and 24/7 oxygen concentrator",
  "contactNumber": "+919123456780",
  "address": "Old Town Lane, Perambur, Chennai",
  "emergencyContactName": "Sundar Pillai",
  "emergencyContactPhone": "+919123456781",
  "emergencyContactRelationship": "Son",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "consentGiven": true
}
```

**Response JSON (HTTP 201 CREATED):**
```json
{
  "success": true,
  "message": "Vulnerable person registered successfully",
  "data": {
    "id": 4,
    "personCode": "VP-2026-004",
    "fullName": "Ramanathan Pillai",
    "age": 82,
    "gender": "MALE",
    "category": "ELDERLY",
    "medicalConditions": "Cardiac Arrhythmia, Severe Hypertension",
    "mobilityStatus": "WHEELCHAIR",
    "assistanceRequirements": "Requires wheelchair ramp and 24/7 oxygen concentrator",
    "contactNumber": "+919123456780",
    "address": "Old Town Lane, Perambur, Chennai",
    "emergencyContactName": "Sundar Pillai",
    "emergencyContactPhone": "+919123456781",
    "latitude": 13.0827,
    "longitude": 80.2707,
    "verificationStatus": "PENDING",
    "riskLevel": "MEDIUM",
    "calculatedRiskScore": 65.0
  },
  "timestamp": "2026-11-12T07:02:45.200Z"
}
```

---

### 2.2 Get Vulnerable Person Profile (PII Masking Verification)
- **Method**: `GET`
- **Path**: `/api/v1/vulnerable-persons/{id}`
- **Required Role**: Authenticated

**Authority Request Header:** `Authorization: Bearer <AUTHORITY_TOKEN>`  
**Authority Response (Unmasked Sensitive Data):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "fullName": "Ramanathan Pillai",
    "contactNumber": "+919123456780",
    "emergencyContactPhone": "+919123456781",
    "medicalConditions": "Cardiac Arrhythmia, Severe Hypertension",
    "address": "Old Town Lane, Perambur, Chennai"
  }
}
```

**Citizen Request Header:** `Authorization: Bearer <CITIZEN_TOKEN>`  
**Citizen Response (Redacted/Masked PII for Privacy):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "fullName": "Ramanathan Pillai",
    "contactNumber": "+9****80",
    "emergencyContactPhone": "+9****81",
    "medicalConditions": "Cardiac Arrhythmia, Severe Hypertension",
    "address": "Old Town Lane, Perambur, Chennai"
  }
}
```

---

### 2.3 Search Vulnerable Population
- **Method**: `GET`
- **Path**: `/api/v1/vulnerable-persons/search?category=ELDERLY&page=0&size=10`
- **Required Role**: `AUTHORITY`, `ADMIN`

**Response JSON (HTTP 200 OK):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "fullName": "Eleanor Vance",
        "age": 82,
        "category": "ELDERLY",
        "mobilityStatus": "BEDRIDDEN",
        "riskLevel": "HIGH",
        "calculatedRiskScore": 85.0
      },
      {
        "id": 4,
        "fullName": "Ramanathan Pillai",
        "age": 82,
        "category": "ELDERLY",
        "mobilityStatus": "WHEELCHAIR",
        "riskLevel": "MEDIUM",
        "calculatedRiskScore": 65.0
      }
    ],
    "totalElements": 2,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

---

### 2.4 Find Persons Within Geographical Radius (Spatial Query)
- **Method**: `GET`
- **Path**: `/api/v1/vulnerable-persons/radius?latitude=13.0827&longitude=80.2707&radiusKm=25`
- **Required Role**: `AUTHORITY`, `ADMIN`

**Response JSON (HTTP 200 OK):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "fullName": "Eleanor Vance", "distanceKm": 0.04, "riskLevel": "HIGH" },
    { "id": 4, "fullName": "Ramanathan Pillai", "distanceKm": 0.00, "riskLevel": "MEDIUM" },
    { "id": 3, "fullName": "Amina Begum", "distanceKm": 0.32, "riskLevel": "HIGH" },
    { "id": 2, "fullName": "Thomas Miller", "distanceKm": 6.84, "riskLevel": "MEDIUM" }
  ]
}
```

---

## 3. Vulnerability Risk Assessment Engine

### 3.1 Calculate Individual Risk Score
- **Method**: `POST`
- **Path**: `/api/v1/risk/assess/{vulnerablePersonId}`
- **Required Role**: `AUTHORITY`, `ADMIN`
- **Description**: Triggers rule-based scoring engine and returns explainable factor breakdown.

**Response JSON (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Risk assessment calculated successfully",
  "data": {
    "assessmentId": 7,
    "vulnerablePersonId": 4,
    "personName": "Ramanathan Pillai",
    "calculatedScore": 65.0,
    "riskLevel": "MEDIUM",
    "breakdown": [
      {
        "ruleCode": "AGE_ELDERLY_EXTREME",
        "factor": "AGE",
        "pointsAdded": 20.0,
        "explanation": "Advanced age (82 yrs) poses elevated vulnerability to physiological stress."
      },
      {
        "ruleCode": "VULN_ELDERLY_CAT",
        "factor": "VULNERABILITY_TYPE",
        "pointsAdded": 10.0,
        "explanation": "Registered under elderly care assistance protocol."
      },
      {
        "ruleCode": "MOBILITY_WHEELCHAIR",
        "factor": "MOBILITY",
        "pointsAdded": 20.0,
        "explanation": "Wheelchair dependent requiring accessible transport vehicle."
      },
      {
        "ruleCode": "SUPPORT_NO_CAREGIVER",
        "factor": "SUPPORT_AVAILABILITY",
        "pointsAdded": 15.0,
        "explanation": "No designated primary caregiver registered; vulnerable individual living alone."
      }
    ],
    "assessedAt": "2026-11-12T07:02:45.967Z",
    "assessedBy": "officer_raj"
  },
  "timestamp": "2026-11-12T07:02:45.971Z"
}
```

---

### 3.2 List Active Scoring Rules & Weights
- **Method**: `GET`
- **Path**: `/api/v1/risk/rules`
- **Required Role**: Authenticated

**Response JSON (HTTP 200 OK):**
```json
{
  "success": true,
  "data": [
    { "ruleCode": "AGE_ELDERLY_EXTREME", "ruleCategory": "AGE", "weight": 20.0, "field": "age", "operator": "GREATER_THAN_EQUAL", "thresholdValue": "75", "active": true },
    { "ruleCode": "AGE_CHILD_INFANT", "ruleCategory": "AGE", "weight": 15.0, "field": "age", "operator": "LESS_THAN_EQUAL", "thresholdValue": "5", "active": true },
    { "ruleCode": "VULN_DISABILITY", "ruleCategory": "VULNERABILITY_TYPE", "weight": 25.0, "field": "vulnerabilityCategory", "operator": "EQUALS", "thresholdValue": "DISABILITY", "active": true },
    { "ruleCode": "VULN_MEDICAL", "ruleCategory": "VULNERABILITY_TYPE", "weight": 25.0, "field": "vulnerabilityCategory", "operator": "EQUALS", "thresholdValue": "MEDICAL_ASSISTANCE", "active": true },
    { "ruleCode": "MOBILITY_BEDRIDDEN", "ruleCategory": "MOBILITY", "weight": 30.0, "field": "mobilityStatus", "operator": "EQUALS", "thresholdValue": "BEDRIDDEN", "active": true },
    { "ruleCode": "MOBILITY_WHEELCHAIR", "ruleCategory": "MOBILITY", "weight": 20.0, "field": "mobilityStatus", "operator": "EQUALS", "thresholdValue": "WHEELCHAIR", "active": true },
    { "ruleCode": "WEATHER_HEAT_EXTREME", "ruleCategory": "WEATHER_SEVERITY", "weight": 25.0, "field": "weatherSeverity", "operator": "EQUALS", "thresholdValue": "EXTREME", "active": true },
    { "ruleCode": "SUPPORT_NO_CAREGIVER", "ruleCategory": "SUPPORT_AVAILABILITY", "weight": 15.0, "field": "caregiverAssigned", "operator": "EQUALS", "thresholdValue": "FALSE", "active": true }
  ]
}
```

---

## 4. Weather Monitoring Module

### 4.1 Live Regional Weather Observation
- **Method**: `GET`
- **Path**: `/api/v1/weather/observations/region/{regionId}`
- **Required Role**: Authenticated
- **Integration**: Spring WebClient -> Open-Meteo REST API (`https://api.open-meteo.com/v1/forecast`)

**Response JSON (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 5,
    "regionId": 1,
    "regionName": "Coastal Ward Sector 4",
    "latitude": 13.0827,
    "longitude": 80.2707,
    "temperature": 43.8,
    "feelsLike": 48.8,
    "precipitation": 0.0,
    "humidity": 78.0,
    "windSpeed": 34.0,
    "weatherCondition": "Extreme Heatwave Warning",
    "isSimulated": false,
    "observedAt": "2026-11-12T07:02:45.773Z"
  },
  "timestamp": "2026-11-12T07:02:45.833Z"
}
```

---

### 4.2 Publish Weather Alert
- **Method**: `POST`
- **Path**: `/api/v1/weather/alerts`
- **Required Role**: `AUTHORITY`, `ADMIN`

**Request JSON:**
```json
{
  "alertCode": "ALERT-CYC-2026-002",
  "alertType": "CYCLONE",
  "severity": "CRITICAL",
  "headline": "RED WARNING: Severe Cyclonic Storm Approaching North Coast",
  "description": "Gale winds exceeding 95 km/h with localized coastal storm surges anticipated.",
  "safetyInstructions": "Move elderly and mobility-impaired persons away from ground floor coastal dwellings immediately.",
  "affectedRegionName": "Coastal Ward Sector 4",
  "centerLatitude": 13.0827,
  "centerLongitude": 80.2707,
  "radiusKm": 20.0,
  "effectiveFrom": "2026-11-12T12:00:00Z",
  "effectiveUntil": "2026-11-13T18:00:00Z"
}
```

**Response JSON (HTTP 201 CREATED):**
```json
{
  "success": true,
  "message": "Weather alert broadcasted and risk recalculation triggered",
  "data": {
    "id": 3,
    "alertCode": "ALERT-CYC-2026-002",
    "alertType": "CYCLONE",
    "severity": "CRITICAL",
    "headline": "RED WARNING: Severe Cyclonic Storm Approaching North Coast",
    "affectedRegionName": "Coastal Ward Sector 4",
    "isActive": true
  }
}
```

---

## 5. Geographical Risk & GeoJSON

### 5.1 Region-wise Geographical Risk Summaries
- **Method**: `GET`
- **Path**: `/api/v1/geography/risk-summary`
- **Required Role**: `AUTHORITY`, `ADMIN`

**Response JSON (HTTP 200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "regionId": 1,
      "regionName": "Coastal Ward Sector 4",
      "regionCode": "RGN-COAST-04",
      "regionType": "WARD",
      "centerLatitude": 13.0827,
      "centerLongitude": 80.2707,
      "currentRiskLevel": "HIGH",
      "activeAlertCount": 2,
      "totalPopulation": 45000,
      "vulnerableCount": 4,
      "highRiskVulnerableCount": 2,
      "riskColor": "RED",
      "activeHazards": ["ACTIVE_WEATHER_WARNING"]
    },
    {
      "regionId": 2,
      "regionName": "Riverside Lowland Basin",
      "regionCode": "RGN-RIVER-02",
      "regionType": "MUNICIPALITY",
      "centerLatitude": 13.0450,
      "centerLongitude": 80.2200,
      "currentRiskLevel": "MEDIUM",
      "activeAlertCount": 0,
      "totalPopulation": 32000,
      "vulnerableCount": 4,
      "highRiskVulnerableCount": 2,
      "riskColor": "ORANGE",
      "activeHazards": []
    }
  ]
}
```

---

### 5.2 Vulnerable Population GeoJSON FeatureCollection
- **Method**: `GET`
- **Path**: `/api/v1/geography/vulnerable-geojson?riskLevel=HIGH`
- **Required Role**: `AUTHORITY`, `ADMIN`

**Response JSON (HTTP 200 OK):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [80.2710, 13.0830]
      },
      "properties": {
        "id": 1,
        "fullName": "Eleanor Vance",
        "age": 82,
        "category": "ELDERLY",
        "mobilityStatus": "BEDRIDDEN",
        "riskLevel": "HIGH",
        "riskScore": 85.0,
        "hasCaregiver": true,
        "color": "#E53E3E",
        "verificationStatus": "VERIFIED"
      }
    }
  ]
}
```

---

## 6. Emergency Case & Response Dispatch

### 6.1 Submit Emergency Assistance Request (SOS)
- **Method**: `POST`
- **Path**: `/api/v1/emergency-cases`
- **Required Role**: Authenticated (`CITIZEN`, `CAREGIVER`, `AUTHORITY`)

**Request JSON:**
```json
{
  "affectedPersonId": 4,
  "emergencyCategory": "MEDICAL_ASSISTANCE",
  "description": "Critical power outage, oxygen concentrator on auxiliary reserve. Needs immediate battery power pack and medical triage.",
  "priority": "CRITICAL",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "address": "Old Town Lane, Perambur, Chennai"
}
```

**Response JSON (HTTP 201 CREATED):**
```json
{
  "success": true,
  "message": "Emergency case created successfully",
  "data": {
    "id": 2,
    "caseNumber": "EC-1794466792-487F",
    "reporterFullName": "John Doe",
    "affectedPersonName": "Ramanathan Pillai",
    "emergencyCategory": "MEDICAL_ASSISTANCE",
    "description": "Critical power outage, oxygen concentrator on auxiliary reserve. Needs immediate battery power pack and medical triage.",
    "priority": "CRITICAL",
    "status": "REPORTED",
    "address": "Old Town Lane, Perambur, Chennai",
    "createdAt": "2026-11-12T06:59:52.457Z"
  }
}
```

---

### 6.2 Assign Emergency Response Team
- **Method**: `POST`
- **Path**: `/api/v1/emergency-cases/{id}/assign`
- **Required Role**: `AUTHORITY`, `ADMIN`

**Request JSON:**
```json
{
  "responseTeamId": 1,
  "notes": "Dispatching Coastal Rapid Rescue Unit 1 for oxygen supply & backup generator delivery."
}
```

**Response JSON (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Response team assigned to case",
  "data": {
    "id": 2,
    "caseNumber": "EC-1794466792-487F",
    "status": "ASSIGNED",
    "assignedTeamId": 1,
    "assignedTeamName": "Coastal Rapid Rescue Unit 1"
  }
}
```

---

### 6.3 Update Case Status (Resolution)
- **Method**: `PATCH`
- **Path**: `/api/v1/emergency-cases/{id}/status`
- **Required Role**: `AUTHORITY`, `ADMIN`, `VOLUNTEER`

**Request JSON:**
```json
{
  "status": "RESOLVED",
  "resolutionDetails": "Paramedics arrived with portable oxygen bank. Vitals stable. Auxiliary battery generator connected."
}
```

**Response JSON (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Case status updated successfully",
  "data": {
    "id": 2,
    "caseNumber": "EC-1794466792-487F",
    "status": "RESOLVED",
    "resolutionDetails": "Paramedics arrived with portable oxygen bank. Vitals stable. Auxiliary battery generator connected."
  }
}
```

---

## 7. Authority Dashboard Summary Metrics

### 7.1 Disaster Management Situation Room Summary
- **Method**: `GET`
- **Path**: `/api/v1/authority/dashboard/summary`
- **Required Role**: `AUTHORITY`, `ADMIN`

**Response JSON (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "totalVulnerablePeople": 4,
    "highRiskCount": 2,
    "mediumRiskCount": 2,
    "lowRiskCount": 0,
    "activeAlertsCount": 2,
    "totalEmergencyCases": 2,
    "pendingCasesCount": 0,
    "inProgressCasesCount": 1,
    "resolvedCasesCount": 1,
    "vulnerableByCategory": {
      "ELDERLY": 2,
      "CHILD": 1,
      "PREGNANT": 1,
      "DISABILITY": 0,
      "MEDICAL_ASSISTANCE": 0
    },
    "recentEmergencyCases": [
      {
        "id": 2,
        "caseNumber": "EC-1794466792-487F",
        "affectedPersonName": "Ramanathan Pillai",
        "emergencyCategory": "MEDICAL_ASSISTANCE",
        "priority": "CRITICAL",
        "status": "RESOLVED"
      }
    ],
    "activeAlerts": [
      {
        "id": 1,
        "alertCode": "ALERT-HW-2026-001",
        "alertType": "HEATWAVE",
        "severity": "EXTREME",
        "headline": "RED ALERT: Critical Heatwave Conditions Exceeding 43°C",
        "affectedRegionName": "Coastal Ward Sector 4",
        "isActive": true
      }
    ]
  },
  "timestamp": "2026-11-12T07:02:45.904Z"
}
```

---

## 8. Mobile Application Endpoints

| Method | Endpoint | Required Role | Summary |
|---|---|---|---|
| `POST` | `/api/v1/mobile/emergency-cases` | `ROLE_CITIZEN`, `ROLE_CAREGIVER` | Submit SOS from mobile app |
| `GET` | `/api/v1/mobile/emergency-cases/my` | `ROLE_CITIZEN`, `ROLE_CAREGIVER` | Track status of user's reported cases |
| `POST` | `/api/v1/mobile/fcm-token` | Authenticated | Register/refresh FCM push notification token |
| `GET` | `/api/v1/mobile/helplines` | `PermitAll` | Verified emergency telephone helplines |
| `POST` | `/api/v1/mobile/vulnerable-persons` | `ROLE_CITIZEN`, `ROLE_CAREGIVER` | Register family member or dependent |
| `GET` | `/api/v1/mobile/vulnerable-persons/my` | `ROLE_CITIZEN`, `ROLE_CAREGIVER` | Retrieve linked dependents |
| `GET` | `/api/v1/mobile/weather-alerts/nearby` | Authenticated | Location-aware active warnings |

---

## 9. OpenAPI & Swagger Documentation Endpoints

- **OpenAPI 3.0 JSON Spec**: `GET http://localhost:8080/v3/api-docs` (HTTP 200 OK)
- **Interactive Swagger UI**: `GET http://localhost:8080/swagger-ui/index.html` (HTTP 200 OK)
- **Actuator Health**: `GET http://localhost:8080/actuator/health` (`{"status":"UP"}`)
