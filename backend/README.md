# Extreme Weather Vulnerability Identification and Emergency Response System

Production-oriented Java Spring Boot 3.x centralized backend serving both:
1. **Mobile Application**: For Citizens, Caregivers, and Volunteers.
2. **Authority Web Dashboard**: For Municipal Disaster Management Officials and Emergency Coordinators.

---

## 1. System Architecture & Tech Stack

- **Platform**: Java 21 / Spring Boot 3.3.5
- **Security**: Spring Security 6 with stateless JWT Bearer token authentication & role-based access control (RBAC).
- **Persistence**: Spring Data JPA, Hibernate, Hibernate Spatial (JTS Geometry), Flyway database migrations.
- **Database**: PostgreSQL 15+ with PostGIS spatial extension.
- **External Integration**: Spring WebClient (reactive non-blocking HTTP) for live meteorological providers.
- **API Documentation**: OpenAPI 3 / Swagger UI (`/swagger-ui.html`).
- **Build System**: Apache Maven.

```
com.extremeweather
├── config           # Security, OpenAPI, WebClient, Jackson & CORS configurations
├── controller       # REST endpoints for Mobile, Authority Dashboard, and Public APIs
├── dto              # Data transfer objects and validation constraints
├── emergency        # Emergency case intake, triage, response team assignments
├── entity           # JPA domain models, PostGIS geometry, and audit entities
├── exception        # Global exception handling and RFC 7807 error responses
├── geography        # Spatial distance calculations, geojson serializers, bounding box filters
├── integration      # Meteorological integration (Open-Meteo & Mock fallback) and Notifications (FCM / SMS)
├── repository       # Spring Data JPA repositories with spatial and derived queries
├── risk             # Explainable, configurable rule-based vulnerability risk scoring engine
├── security         # JWT token provider, authentication filter, and security principal
├── service          # Business logic for users, vulnerable profiles, weather, dashboard
└── util             # Coordinate utilities and common helpers
```

---

## 2. Default Demonstration Accounts

All demo accounts are pre-seeded via Flyway `V2__seed_demo_data.sql`.
Default password for all accounts: `Password@123`

| Username | Role | Full Name | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `ROLE_ADMIN` | Admin Controller | Full system administrator |
| `officer_raj` | `ROLE_AUTHORITY` | Rajesh Sharma | Disaster Management Commissioner |
| `caregiver_mary` | `ROLE_CAREGIVER` | Mary Johnson | Registered Caregiver for elderly dependent |
| `citizen_john` | `ROLE_CITIZEN` | John Doe | Community citizen with SOS capability |
| `volunteer_sarah` | `ROLE_VOLUNTEER` | Sarah Connor | Emergency First Responder Volunteer |

---

## 3. Core Modules & Capabilities

### A. Vulnerable Population Management & Privacy
- **Categories**: Elderly, Children, Persons with Disabilities, Pregnant Women, Medical Assistance (e.g. oxygen/dialysis dependency).
- **Data Minimization & Privacy Protection**: Non-authorities or non-assigned users receive masked PII (`****`). Only verified caregivers or authorized disaster officials see complete telephone and residential coordinates.
- **Audit Logging**: Every access to sensitive profile records is asynchronously logged in `audit_logs`.

### B. Transparent Risk Assessment Engine
Calculates a 0–100 composite vulnerability score based on configurable rules:
- **Age Factor**: >= 75 yrs (+20 pts), <= 5 yrs (+15 pts)
- **Vulnerability Factor**: Disability (+25 pts), Medical Dependency (+25 pts), Pregnancy (+20 pts)
- **Mobility Factor**: Bedridden (+30 pts), Wheelchair (+20 pts), Assisted (+10 pts)
- **Support Factor**: Living alone without caregiver (+15 pts)
- **Meteorological Exposure**: Extreme Heatwave / Flood / Cyclone (+25 to +35 pts)
- **Classifications**:
  - `HIGH RISK` (>= 75.0) -> Color RED
  - `MEDIUM RISK` (45.0 - 74.9) -> Color ORANGE
  - `LOW RISK` (< 45.0) -> Color GREEN

### C. Weather Monitoring & Auto-Reassessment
- **Official Integration**: Open-Meteo API integration using non-blocking Spring WebClient.
- **Development Fallback**: Identified mock provider when offline or operating in simulation mode.
- **Automatic Trigger**: When an official Weather Alert is created, the system automatically triggers a risk reassessment for all vulnerable individuals located in the impacted geographical perimeter.

### D. Emergency Case Management & Triage
- **Assistance Categories**: Medical Assistance, Evacuation, Food & Water, Transportation, Rescue.
- **Auto-Escalation**: SOS calls for bedridden or oxygen-dependent individuals are automatically flagged as `CRITICAL`.
- **Status Lifecycle**: `REPORTED` -> `VERIFIED` -> `ASSIGNED` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED`.

---

## 4. REST API Endpoints Overview

### Authentication & Profiles (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Register Citizen, Caregiver, Volunteer, or Authority.
- `POST /api/v1/auth/login` - Authenticate with username/password, returns JWT token.
- `GET /api/v1/auth/me` - Get profile of the current user.

### Mobile Application Endpoints (`/api/v1/mobile`)
- `POST /api/v1/mobile/vulnerable-persons` - Register family member/dependent.
- `GET /api/v1/mobile/vulnerable-persons/my` - List linked dependents.
- `POST /api/v1/mobile/emergency-cases` - One-tap SOS / assistance dispatch request.
- `GET /api/v1/mobile/emergency-cases/my` - Track live status of submitted cases.
- `GET /api/v1/mobile/weather-alerts/nearby` - Get active hazards within GPS radius.
- `POST /api/v1/mobile/fcm-token` - Register mobile push notification token.
- `GET /api/v1/mobile/helplines` - Verified emergency helpline directory.

### Authority Web Dashboard (`/api/v1/authority/dashboard`)
- `GET /api/v1/authority/dashboard/summary` - Aggregate metrics for emergency command center.
- `GET /api/v1/authority/dashboard/risk-map/regions` - Regional risk status (RED, ORANGE, GREEN).
- `GET /api/v1/authority/dashboard/risk-map/vulnerable-geojson` - Standard GeoJSON FeatureCollection of vulnerable locations for mapping.
- `GET /api/v1/authority/dashboard/vulnerable-people` - Full searchable list with unmasked contact info.
- `GET /api/v1/authority/dashboard/vulnerable-people/immediate-attention` - High-risk triage candidates.
- `GET /api/v1/authority/dashboard/alerts/active` - Live multi-hazard warnings.
- `GET /api/v1/authority/dashboard/cases` - Emergency case queue with priority and status filters.

### Weather & Alerts (`/api/v1/weather`)
- `GET /api/v1/weather/observations/region/{id}` - Current weather observation.
- `POST /api/v1/weather/alerts` - Broadcast an official weather warning.
- `GET /api/v1/weather/alerts/active` - Active alert list.
- `PATCH /api/v1/weather/alerts/{id}/deactivate` - Deactivate warning.

### Risk Rules Engine (`/api/v1/risk`)
- `POST /api/v1/risk/assess/{personId}` - Compute and explain risk score breakdown.
- `GET /api/v1/risk/rules` - View active scoring rules and weights.
- `POST /api/v1/risk/rules` - (Admin) Modify or create scoring rules and weights.

---

## 5. Startup & Execution Instructions

### Prerequisites
1. Java 21+ SDK
2. PostgreSQL 15+ with PostGIS extension enabled:
   ```sql
   CREATE DATABASE extreme_weather_db;
   \c extreme_weather_db;
   CREATE EXTENSION postgis;
   ```

### Configuration
Edit `application.yml` or export environment variables:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=extreme_weather_db
export DB_USERNAME=postgres
export DB_PASSWORD=your_password
export JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
```

### Running the Application
Using the Apache Maven wrapper or executable:
```bash
# Build and execute unit tests
mvn clean test

# Run Spring Boot application
mvn spring-boot:run
```

Once started:
- Access Swagger UI Documentation at: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON specification: `http://localhost:8080/v3/api-docs`
