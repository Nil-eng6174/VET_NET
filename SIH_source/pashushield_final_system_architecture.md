# PashuShield: Final System Architecture & 7-Day Implementation Plan

## 1. Purpose

PashuShield is an AI-powered livestock disease early-warning and
response platform designed around the workflow:

**Report → Detect → Assess → Refer → Treat → Prevent → Monitor**

The architecture is designed with two goals:

1.  Build a genuinely functional end-to-end MVP within a 7-day
    hackathon.
2.  Provide a scalable production architecture in which advanced
    features can be added without redesigning the core system.

The system is intended to complement macro-level surveillance and
forecasting platforms such as NADRES by adding ground-level farmer/field
reports, AI-assisted triage, spatial clustering, veterinary response,
laboratory tracking, vaccination management, and coordinated alerts.

------------------------------------------------------------------------

# 2. Architecture Strategy

The final architecture follows a **production-grade target
architecture**, but implementation is divided into three levels.

### Level 1 --- Implemented Core MVP

These features should actually work during the 7-day build:

-   Farmer/field-worker reporting
-   Animal/herd details
-   Symptoms and mortality reporting
-   Photo upload
-   GPS/location capture
-   AI/rule-based triage
-   Risk score from 0--100
-   Suspected disease/category
-   Veterinary confirmation guardrail
-   GIS case visualization
-   Basic spatial cluster detection
-   Vet dashboard
-   Case assignment
-   Lab sample creation and tracking
-   Vaccination records
-   Command-center dashboard
-   Database persistence
-   Basic alerts

### Level 2 --- Partially Implemented / Prototype

Implement a useful basic version if time permits:

-   Offline-first report storage and synchronization
-   SMS notifications
-   RAG-based veterinary guidance
-   pgvector
-   Redis/Celery asynchronous processing
-   QR-based sample identification
-   Basic weather integration
-   Multilingual interface
-   Explainability view

### Level 3 --- Future / Visual Architecture

These can be represented in the UI and architecture but should be
clearly marked as future enhancements unless actually implemented:

-   IVR
-   Advanced multi-week forecasting
-   Individual animal passports
-   Advanced ML disease forecasting
-   Full role-based multilingual advisory engine
-   Movement restriction and containment workflows
-   Large-scale state/national deployment
-   Deep integration with external surveillance systems

**Important:** Visual modules must not be presented as fully implemented
functionality.

------------------------------------------------------------------------

# 3. Final System Topology

``` text
┌──────────────────────────────────────────────────────────────────────────────┐
│                         1. USERS & CLIENT LAYER                              │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  ┌──────────┐ │
│  │ Farmer /        │  │ Veterinary      │  │ Laboratory     │  │ Govt /   │ │
│  │ Field Worker    │  │ Dashboard       │  │ Portal         │  │ Command  │ │
│  │ PWA             │  │                 │  │                │  │ Center   │ │
│  └────────┬────────┘  └────────┬────────┘  └───────┬────────┘  └────┬─────┘ │
│           └─────────────────────┴───────────────────┴────────────────┘       │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       2. API / ACCESS LAYER                                  │
│                                                                              │
│                     FastAPI Application Gateway                              │
│                                                                              │
│       Authentication │ RBAC │ Validation │ Routing │ Rate Limiting          │
│                                                                              │
│  /auth  /reports  /cases  /triage  /risk  /clusters  /samples  /labs        │
│  /vaccinations  /alerts  /dashboard  /external-data                         │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    3. BACKEND / BUSINESS LOGIC                              │
│                                                                              │
│  Case Management │ Herd Records │ Vaccination │ Sample Management            │
│  User Management │ Task Assignment │ Alerts │ Audit Logging                  │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │
              ┌─────────────────┼──────────────────────┐
              │                 │                      │
              ▼                 ▼                      ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌────────────────────────────┐
│ 4A. AI / INTELLIGENCE│ │ 4B. GEO-ANALYTICS   │ │ 4C. NOTIFICATION ENGINE   │
│                     │ │                     │ │                            │
│ Hybrid Rule Engine  │ │ PostGIS Queries     │ │ Role-Based Alerts          │
│ Risk Score 0–100    │ │ Nearby Cases        │ │ SMS Gateway                │
│ Suspected Category  │ │ Spatial Clusters    │ │ Geo-fenced Advisories      │
│ Image/Report AI     │ │ Growth Rate         │ │ Dashboard Notifications    │
│ RAG / pgvector*     │ │ Time Windows        │ │                            │
└──────────┬──────────┘ └──────────┬──────────┘ └─────────────┬──────────────┘
           │                       │                          │
           └───────────────────────┼──────────────────────────┘
                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         5. DATA LAYER                                        │
│                                                                              │
│                  PostgreSQL + PostGIS + pgvector*                            │
│                                                                              │
│ Users │ Herds │ Reports │ Cases │ Locations │ Vaccinations                  │
│ Samples │ Lab Results │ Alerts │ Clusters │ Tasks │ Audit Logs              │
│                                                                              │
│ PostGIS: geographic points, boundaries, spatial indexes                     │
│ pgvector*: veterinary guidelines and advisory embeddings                    │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         6. RESPONSE LAYER                                    │
│                                                                              │
│        Vet Assignment → Field Visit → Sample Collection → Lab Result        │
│                    → Treatment / Containment → Prevention                    │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                      7. COMMAND & MONITORING                                 │
│                                                                              │
│ GIS Map │ Active Cases │ High-Risk Cases │ Clusters │ Mortality              │
│ Vaccination Coverage │ Pending Samples │ Alerts │ Priority Actions           │
└──────────────────────────────────────────────────────────────────────────────┘

* Optional for the 7-day MVP; part of the scalable target architecture.
```

------------------------------------------------------------------------

# 4. External Data Integration

External data should feed the **AI/analytics layer**, rather than
becoming an unnecessary dependency for the basic case-reporting
workflow.

``` text
                 EXTERNAL DATA
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
   Weather         Disease          Livestock
   Data            History          Population
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                AI / Analytics
                       │
              Risk / Forecast /
              Environmental Context
```

Potential sources include:

-   Weather observations and forecasts
-   Historical livestock disease events
-   Livestock population/density
-   Remote-sensing indicators such as NDVI/LST
-   Official surveillance datasets where access/integration is available

External integrations should be modular so the MVP can operate even if a
particular external API is unavailable.

------------------------------------------------------------------------

# 5. Core Functional Data Flow

## 5.1 Farmer Reporting

``` text
Farmer
  ↓
Open PashuShield PWA
  ↓
Enter:
- Animal / herd details
- Symptoms
- Number affected
- Mortality
- Vaccination status
- Recent treatment
- Onset date
- Location
- Photo
  ↓
Submit
  ↓
POST /api/reports
  ↓
Database
```

### Offline mode

``` text
No Internet
    ↓
Save report in IndexedDB
    ↓
Generate client_report_id
    ↓
Status = Pending Sync
    ↓
Internet restored
    ↓
Sync to FastAPI
    ↓
Server checks client_report_id
    ↓
Duplicate prevented
    ↓
Report stored
```

The offline mechanism should be kept simple in the first implementation.
Full Background Sync can be added if time permits.

------------------------------------------------------------------------

# 6. AI Triage Architecture

The AI layer is a **decision-support system**, not a diagnostic
authority.

``` text
Report
  │
  ├── Symptoms
  ├── Animal Type
  ├── Affected Count
  ├── Mortality
  ├── Herd Exposure
  ├── Location
  └── Optional Image
        │
        ▼
┌──────────────────────────┐
│ Hybrid AI / Rule Engine  │
│                          │
│ Rules + AI Analysis      │
│ Optional RAG             │
└────────────┬─────────────┘
             ▼
       Risk Score 0–100
             │
             ▼
     Risk Classification
             │
     ┌───────┼─────────┐
     ▼       ▼         ▼
  Normal   Watch    High Risk
             │
             ▼
     Suspected Category
             │
             ▼
     Recommended Action
             │
             ▼
 "Veterinary confirmation
       required"
```

Example:

``` text
Risk Score: 87/100
Risk Level: HIGH

Suspected Category:
Contagious vesicular disease

Recommended Action:
Immediate veterinary review
and sample collection

Veterinary confirmation required.
```

The AI must never display a suspected category as a confirmed diagnosis.

------------------------------------------------------------------------

# 7. AI Technology Strategy

## MVP

Use a hybrid approach:

``` text
Python Rule Engine
       +
Optional AI / Multimodal Analysis
       ↓
Risk Assessment
```

Rules provide:

-   Fast execution
-   Predictable output
-   Fallback when AI services are unavailable
-   Easy demonstration and debugging

An LLM/multimodal model can assist with:

-   Symptom interpretation
-   Image-assisted observation
-   Natural-language explanations
-   Advisory generation

## Optional RAG

If implemented:

``` text
User Report
    ↓
Embedding
    ↓
pgvector
    ↓
Relevant veterinary guideline
    ↓
AI generates grounded advisory
```

RAG should use trusted veterinary/official material and should not
replace veterinary confirmation.

------------------------------------------------------------------------

# 8. Spatial Risk and Cluster Detection

PashuShield should detect emerging clusters using both **space and
time**.

``` text
New Case
   ↓
Get location
   ↓
PostGIS spatial query
   ↓
Find similar cases
within defined radius
   ↓
Apply time window
   ↓
Calculate:
- Case count
- Affected villages
- Growth rate
- Mortality
- Spatial concentration
   ↓
Cluster Risk
```

Example:

``` text
Village A → 3 cases
Village B → 4 cases
Village C → 2 cases

Within 10 km
Within 48 hours

        ↓

EMERGING DISEASE CLUSTER
```

For a production implementation, spatial filtering should use PostGIS
indexes rather than loading all coordinates into application memory.

------------------------------------------------------------------------

# 9. Case State Machine

The case workflow should be explicit.

``` text
REPORTED
   ↓
TRIAGED
   ↓
VET_REVIEW
   ↓
SAMPLE_REQUESTED
   ↓
SAMPLE_COLLECTED
   ↓
LAB_PENDING
   ↓
RESULTED
   │
   ├── Negative → Continue monitoring / close
   │
   └── Positive → Confirmed
                      ↓
             Treatment / Containment
                      ↓
                  Prevent
                      ↓
                   CLOSED
```

Alerts, vaccination actions, and field tasks can run alongside this
workflow.

------------------------------------------------------------------------

# 10. Veterinary Workflow

``` text
High-Risk Case
      ↓
Vet Dashboard
      ↓
Review:
- Symptoms
- Photo
- Herd history
- Vaccination
- Nearby cases
- AI risk assessment
      ↓
Assign Field Worker
      ↓
Request Sample
      ↓
Track Field Action
      ↓
Lab Result
      ↓
Treatment / Containment
      ↓
Close Case
```

The vet remains the human decision-maker for clinical confirmation and
treatment.

------------------------------------------------------------------------

# 11. Laboratory Workflow

``` text
Case
  ↓
Sample Requested
  ↓
Sample Collected
  ↓
Unique Sample ID / QR
  ↓
In Transit
  ↓
Received
  ↓
Result Pending
  ↓
Resulted
  ↓
Case Updated
```

Suggested sample states:

-   `In Transit`
-   `Received`
-   `Result Pending`
-   `Resulted`

The lab result should be linked back to the original case.

------------------------------------------------------------------------

# 12. Prevention Workflow

``` text
Confirmed / High-Risk Cluster
          ↓
Identify affected area
          ↓
Check vaccination coverage
          ↓
Prioritize low-coverage areas
          ↓
Generate vaccination task
          ↓
Notify responsible field staff
          ↓
Update vaccination records
          ↓
Monitor coverage
```

This ensures PashuShield does not stop at disease detection.

------------------------------------------------------------------------

# 13. Command Center

The command center should provide a district/state-level overview.

### Main indicators

``` text
Total Reports
High-Risk Cases
Active Clusters
Affected Villages
Pending Samples
Confirmed Cases
Vaccination Coverage
Pending Field Tasks
```

### GIS view

``` text
Normal
Watch
Suspected Cluster
Outbreak Risk
```

### Priority actions

``` text
1. Inspect Village X
2. Collect samples from Case Y
3. Prioritize vaccination in Village Z
4. Review pending laboratory result
```

------------------------------------------------------------------------

# 14. Database Architecture

## Recommended database

**PostgreSQL + PostGIS**

Optional:

**pgvector**

### Core entities

``` text
users
roles
locations
herds
animals              # Phase 2 / optional MVP
health_reports
cases
risk_assessments
symptoms
outbreak_clusters
vaccinations
treatments
tasks
lab_samples
lab_results
alerts
external_observations
audit_logs
```

### Relationships

``` text
User
 └── Herd
      └── Health Report
             └── Case
                  ├── Risk Assessment
                  ├── Sample
                  │     └── Lab Result
                  ├── Alerts
                  ├── Tasks
                  └── Cluster
```

------------------------------------------------------------------------

# 15. API Structure

Suggested endpoints:

``` text
/auth
    POST /login
    POST /register

/reports
    POST /
    GET /
    GET /{id}

/cases
    GET /
    GET /{id}
    PATCH /{id}

/triage
    POST /{report_id}

/risk
    GET /{case_id}

/clusters
    GET /
    GET /{id}

/herds
    POST /
    GET /
    GET /{id}

/vaccinations
    POST /
    GET /

/samples
    POST /
    GET /
    PATCH /{id}

/labs
    GET /samples
    PATCH /samples/{id}/result

/alerts
    GET /
    POST /

/dashboard
    GET /summary
    GET /map

/external-data
    POST /weather
    POST /surveillance
```

The exact endpoint structure can be simplified for the hackathon.

------------------------------------------------------------------------

# 16. Technology Stack

## Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   Leaflet / React-Leaflet
-   PWA capabilities
-   IndexedDB for offline reports

## Backend

-   FastAPI
-   Python
-   REST APIs
-   JWT / session authentication
-   Role-Based Access Control

## AI / Analytics

-   Python
-   Hybrid rule engine
-   Risk scoring
-   Spatial/temporal clustering
-   Optional multimodal AI
-   Optional RAG
-   Optional pgvector

## Data

-   PostgreSQL
-   PostGIS
-   Optional pgvector
-   Object/file storage for images

## Async Processing

### MVP

Direct API → processing → database.

### Production / if time permits

``` text
FastAPI
   ↓
Redis
   ↓
Celery
   ↓
AI / Cluster / Notification Workers
```

Redis/Celery should be treated as an optimization and scalability layer,
not a prerequisite for getting the MVP working.

## Notifications

-   Dashboard alerts
-   SMS gateway
-   Future IVR

## Security

-   Authentication
-   RBAC
-   Input validation
-   Audit logs
-   Secure file handling
-   Data encryption where appropriate

------------------------------------------------------------------------

# 17. 7-Day Implementation Plan

## Day 1 --- Backend + Database

Implement:

-   FastAPI
-   PostgreSQL
-   Core tables
-   Authentication
-   Basic APIs

Priority:

``` text
Users
Herds
Reports
Cases
Locations
Vaccinations
Samples
Alerts
```

------------------------------------------------------------------------

## Day 2 --- Farmer Reporting

Implement:

-   Farmer UI
-   Report form
-   Symptoms
-   Mortality
-   Location
-   Photo upload
-   Database persistence

Target:

``` text
Farmer → Report → Database
```

------------------------------------------------------------------------

## Day 3 --- AI Triage

Implement:

-   Rule engine
-   Risk score
-   Risk level
-   Suspected category
-   Recommended action
-   Veterinary confirmation guardrail

Target:

``` text
Report → AI → Risk → Action
```

------------------------------------------------------------------------

## Day 4 --- GIS + Cluster Detection

Implement:

-   Case map
-   Coordinates
-   Nearby-case query
-   Basic time window
-   Cluster identification
-   Risk zones

Target:

``` text
Cases → PostGIS → Cluster → Map
```

------------------------------------------------------------------------

## Day 5 --- Vet + Lab

Implement:

-   Vet dashboard
-   Case review
-   Worker assignment
-   Sample creation
-   Sample status
-   Lab dashboard
-   Result update

Target:

``` text
High Risk → Vet → Sample → Lab → Result
```

------------------------------------------------------------------------

## Day 6 --- Command Center + Prevention

Implement:

-   Government dashboard
-   Case statistics
-   Cluster statistics
-   Vaccination coverage
-   Priority villages
-   Alerts
-   Field tasks

Target:

``` text
Risk → Response → Prevention
```

------------------------------------------------------------------------

## Day 7 --- Advanced Features + Integration + Polish

Only after the core flow is stable, add:

-   Offline sync
-   SMS
-   RAG / pgvector
-   Redis/Celery
-   Weather data
-   QR scanning
-   Multilingual UI
-   Better explainability
-   UI polish

Anything unstable should be moved to the future/prototype layer.

------------------------------------------------------------------------

# 18. 7-Day MVP Definition

The MVP is considered complete when this entire flow works:

``` text
                 FARMER
                    │
                    ▼
              REPORT CASE
                    │
                    ▼
              AI TRIAGE
                    │
                    ▼
              RISK SCORE
                    │
                    ▼
             GIS + CLUSTER
                    │
                    ▼
               VET REVIEW
                    │
                    ▼
             SAMPLE REQUEST
                    │
                    ▼
              LAB RESULT
                    │
                    ▼
          ALERT + PREVENTION
                    │
                    ▼
             COMMAND CENTER
                    │
                    ▼
               MONITOR
```

This is more valuable than having ten disconnected advanced features.

------------------------------------------------------------------------

# 19. Demo Scenario

Use one controlled scenario throughout the demonstration.

### Step 1 --- Report

A farmer reports:

``` text
3 cattle
Fever
Mouth lesions
2 affected
Photo attached
GPS captured
```

### Step 2 --- AI Triage

``` text
Risk: 87/100
Level: HIGH

Suspected contagious disease

Veterinary confirmation required.
```

### Step 3 --- GIS

The case appears on the map.

### Step 4 --- Cluster Detection

The system finds:

``` text
4 farms
3 villages
10 km radius
48-hour window
```

and creates:

``` text
EMERGING DISEASE CLUSTER
```

### Step 5 --- Vet

The district veterinary officer reviews the case and assigns a field
worker.

### Step 6 --- Lab

A sample is created:

``` text
SMP-00192
Status: In Transit
```

Then:

``` text
Received
→ Result Pending
→ Resulted
```

### Step 7 --- Prevention

The system:

-   Generates an advisory
-   Flags the affected area
-   Checks vaccination coverage
-   Creates a vaccination priority task

### Step 8 --- Command Center

The government dashboard displays:

``` text
Active Clusters: 1
High-Risk Cases: 4
Affected Villages: 3
Pending Samples: 2
Vaccination Priority: HIGH
```

------------------------------------------------------------------------

# 20. What Is Real vs Visual

Use the following status model during development and evaluation.

  Module                                      Status
  ------------------------------------------- -------------------------------
  Farmer reporting                            IMPLEMENTED
  Symptoms/mortality                          IMPLEMENTED
  Photo upload                                IMPLEMENTED
  AI triage                                   IMPLEMENTED
  Risk score                                  IMPLEMENTED
  Suspected category                          IMPLEMENTED
  GIS                                         IMPLEMENTED
  Basic cluster detection                     IMPLEMENTED
  Vet dashboard                               IMPLEMENTED
  Case assignment                             IMPLEMENTED
  Lab workflow                                IMPLEMENTED
  Vaccination tracking                        IMPLEMENTED
  Command center                              IMPLEMENTED
  Basic alerts                                IMPLEMENTED
  Offline storage/sync                        PROTOTYPE / IMPLEMENT IF TIME
  SMS                                         PROTOTYPE / IMPLEMENT IF TIME
  RAG                                         PROTOTYPE / IMPLEMENT IF TIME
  pgvector                                    PROTOTYPE / IMPLEMENT IF TIME
  Redis/Celery                                PROTOTYPE / IMPLEMENT IF TIME
  Weather integration                         PROTOTYPE / IMPLEMENT IF TIME
  IVR                                         FUTURE
  Animal passport                             FUTURE
  Advanced forecasting                        FUTURE
  National-scale integration                  FUTURE
  Advanced containment/movement restriction   FUTURE

------------------------------------------------------------------------

# 21. Production Scaling Path

The MVP should not be thrown away.

``` text
7-DAY MVP
   │
   ├── FastAPI
   ├── PostgreSQL/PostGIS
   ├── AI triage
   ├── GIS
   ├── Vet
   ├── Lab
   └── Command Center
            │
            ▼
     Production Upgrade
            │
   ┌────────┼─────────┐
   ▼        ▼         ▼
Redis/    pgvector   Object
Celery     + RAG     Storage
   │
   ▼
Async Workers
   │
   ├── AI
   ├── Cluster
   └── Notifications
            │
            ▼
     External Data
            │
   ┌────────┼───────────┐
   ▼        ▼           ▼
Weather   Disease     Livestock
          History     Population
            │
            ▼
       Advanced ML
       Forecasting
            │
            ▼
     State / National
         Scale
```

Future modules can then be added without changing the fundamental case
workflow.

------------------------------------------------------------------------

# 22. Architectural Principles

### 1. End-to-end first

A complete Report → Detect → Assess → Refer → Respond → Prevent flow is
more important than isolated advanced features.

### 2. AI is decision support

AI provides triage and risk assessment. It does not independently
confirm disease.

### 3. Offline resilience

Rural connectivity must not prevent a farmer from recording a case.

### 4. Human-in-the-loop

Veterinary professionals remain responsible for clinical confirmation
and treatment decisions.

### 5. Spatial intelligence

Disease risk must consider location, clustering, and time---not only
individual symptoms.

### 6. Data persistence

Reports, cases, samples, vaccination records, and outcomes should form a
continuous health-surveillance record.

### 7. Modular integrations

Weather, surveillance data, SMS, IVR, RAG, and advanced ML should be
replaceable modules.

### 8. Buildable architecture

Production-grade components should only be introduced when they provide
value and do not compromise the 7-day MVP.

------------------------------------------------------------------------

# 23. Final Architecture Summary

``` text
                         PASHUSHIELD
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
     FARMER                  VET                   LAB
      PWA                   DASHBOARD              PORTAL
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                       FASTAPI GATEWAY
                       Auth + RBAC + API
                              │
                              ▼
                     BACKEND / CASE LOGIC
                              │
            ┌─────────────────┼──────────────────┐
            ▼                 ▼                  ▼
       AI / TRIAGE       GEO-ANALYTICS       ALERTS
            │                 │                  │
            └─────────────────┼──────────────────┘
                              ▼
                    POSTGRESQL + POSTGIS
                         + pgvector*
                              │
                              ▼
                     RESPONSE WORKFLOW
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
             VET             LAB          PREVENTION
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                       COMMAND CENTER
                              │
                              ▼
                         MONITORING

External Data
(Weather / Disease History / Livestock / Remote Sensing)
                ───────────────► AI / Analytics

* pgvector and advanced asynchronous infrastructure are optional
  for the 7-day MVP and part of the scalable target architecture.
```

## Final implementation principle

**Build the core path for real. Show the complete architecture for
scale.**

The evaluator should be able to interact with a real farmer → AI → GIS →
vet → lab → prevention → command-center workflow, while advanced modules
such as IVR, advanced forecasting, animal passports, and national-scale
integrations are clearly presented as the next stage of the same
architecture.
