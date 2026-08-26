# PashuShield
### AI-Powered Livestock Disease Early Warning & Response Platform
**Product Requirements Document (PRD)**

| Field | Details |
|---|---|
| Document Owner | Product / Hackathon Team |
| Status | Draft v1.0 |
| Last Updated | August 23, 2026 |
| Target | Hackathon MVP → Pilot-ready Product |
| Domain | Animal Health Surveillance & Early Warning |

---

## 1. Executive Summary

PashuShield is a unified animal-health surveillance and early-warning platform that connects farmers, field workers, veterinarians, diagnostic laboratories, and government animal husbandry officials into a single, end-to-end workflow: **Report → Detect → Assess → Refer → Treat → Prevent → Monitor**.

Rather than functioning as a standalone "livestock disease detection app," PashuShield is designed as a coordinated response system. It captures symptom and mortality reports from the field, applies AI-assisted or rule-based triage to score risk, aggregates reports geospatially to detect emerging outbreak clusters, routes suspected cases through a veterinary and laboratory referral workflow, and closes the loop with vaccination tracking and government-level dashboards for evidence-based planning.

The platform is explicitly designed for low-connectivity rural environments (offline-first mobile capture with sync-on-reconnect), multilingual access, and multiple entry points (mobile app, web, and IVR for feature-phone users).

---

## 2. Problem Statement

Livestock diseases in rural and semi-rural regions often go undetected until they have already spread across multiple farms or villages. Key gaps in the current system include:

- No structured, low-friction way for farmers to report sick or dying animals in real time.
- No systematic triage to distinguish low-risk cases from potentially contagious, high-risk outbreaks.
- No geospatial visibility into how cases are clustering across villages, blocks, and districts.
- No predictive layer combining weather, season, and historical disease patterns with live case data.
- Fragmented vaccination records, making it hard to identify under-vaccinated, high-risk areas.
- No structured referral pipeline from suspected case → sample collection → laboratory → confirmed diagnosis.
- Government and veterinary authorities lack a single dashboard for evidence-based intervention planning.
- Connectivity and language barriers exclude many farmers from digital reporting tools.

PashuShield addresses these gaps as one connected system rather than a set of disconnected point solutions.

---

## 3. Goals & Objectives

### 3.1 Primary Goals

- **Early detection:** Identify suspected disease cases and emerging outbreak clusters as early as possible.
- **Faster response:** Reduce the time between symptom onset and veterinary/laboratory intervention.
- **Prevention, not just reaction:** Use vaccination coverage and risk data to proactively target prevention efforts.
- **Evidence-based governance:** Give district and state officials a real-time, data-driven view of animal health risk.
- **Inclusive access:** Ensure farmers in low-connectivity, multilingual regions can participate fully.

### 3.2 Success Metrics (KPIs)

| Metric | Target (Pilot) | Owner |
|---|---|---|
| Median time from report to triage result | < 2 minutes | Product |
| Median time from suspected case to field worker assignment | < 4 hours | Ops / Vet Team |
| % of reports submitted offline and successfully synced | > 95% | Engineering |
| Outbreak clusters detected before self-reported by 3+ villages | ≥ 60% of clusters | Data Science |
| Vaccination coverage visibility (villages with live data) | 100% of pilot district | Ops |
| Sample-to-result turnaround visibility in system | 100% tracked | Lab Integration |

---

## 4. User Personas & Roles

| Persona | Needs | Primary Actions |
|---|---|---|
| Farmer | Fast, simple reporting; guidance in local language; works with poor/no internet | Report symptoms/mortality, view advisories, receive alerts |
| Field Worker | Daily task list, GPS-guided visits, sample logging | Visit cases, collect samples, log vaccinations, verify reports |
| Veterinarian | Case triage queue, animal/herd history, escalation tools | Review cases, assign field workers, request labs, recommend treatment |
| Laboratory Technician | Clear sample chain-of-custody and status tracking | Log sample receipt, update test status, publish results |
| District / Government Official | District-wide visibility, outbreak alerts, coverage data | Monitor dashboard, approve interventions, issue advisories |

---

## 5. Scope

### 5.1 MVP Scope (In Scope for Hackathon / Phase 1)

The MVP is reduced to a focused, end-to-end demonstrable chain across six modules:

| # | Module | What It Demonstrates |
|---|---|---|
| 1 | Report | Farmer/field worker reports symptoms, mortality, and herd details via mobile/web, with offline capture. |
| 2 | Detect | AI-assisted or rule-based triage calculates a suspected disease category and risk score. |
| 3 | Map | GIS view shows reported cases and highlights emerging clusters at village/block/district level. |
| 4 | Predict | System flags rapidly increasing, geographically clustered cases as emerging outbreak risk. |
| 5 | Respond | Veterinary dashboard + lab referral workflow (sample collection → result → case update). |
| 6 | Prevent | Vaccination coverage tracking and automated alerts to relevant stakeholders. |

### 5.2 Extended Scope (Phase 2+)

- Animal-level (vs. herd-level) digital health passports.
- IVR-based reporting for feature-phone users.
- Weather-integrated predictive forecasting model (multi-week case forecasts).
- Explainable AI risk breakdown ("why was this flagged" contributing-factor view).
- Differential disease probability suggestions (ranked possible categories, not a single diagnosis).
- Multilingual, role-based advisory messaging engine.
- Movement-restriction and containment-zone tooling for officials.

### 5.3 Out of Scope

- Definitive AI disease diagnosis without veterinary/lab confirmation — the system only ever produces a suspected/triage classification.
- Direct e-commerce or veterinary drug sales.
- Livestock insurance claims processing.
- Integration with international (non-regional) animal health databases in the MVP.

---

## 6. Functional Requirements

### 6.1 Farmer / Field Reporting

- **FR-1.1:** User can submit a report in under 60 seconds capturing: animal type, age, breed, location (GPS), symptoms, number affected, mortality count, photos/video, vaccination status, recent treatment, and symptom onset date.
- **FR-1.2:** Reporting available via mobile app, web, and IVR (Phase 2).
- **FR-1.3:** Reports can be created and saved fully offline; automatic sync occurs when connectivity is restored.
- **FR-1.4:** System supports multiple regional/local languages for the reporting interface.

### 6.2 AI / Rule-Based Disease Triage

- **FR-2.1:** System computes a risk score (0–100) from symptoms, animal type, herd exposure, and case count.
- **FR-2.2:** System outputs a suspected disease category (e.g., "Viral/contagious") with confidence, never a confirmed diagnosis label.
- **FR-2.3:** System returns recommended actions (isolate, contact vet, avoid movement, collect sample, report to authority).
- **FR-2.4:** Risk model incorporates symptoms + animal type + season + weather + local disease history + nearby cases + herd exposure.
- **FR-2.5:** All AI/triage outputs are labeled as "veterinary confirmation required" and are never presented as a definitive diagnosis.

### 6.3 Geospatial Outbreak Mapping

- **FR-3.1:** Map view displays case density at village, block, and district granularity.
- **FR-3.2:** Areas are color-coded by risk status: Normal, Watch, Suspected Cluster, Outbreak Risk.
- **FR-3.3:** Clicking a region surfaces reported cases, affected villages, suspected clusters, mortality, and vaccination coverage.

### 6.4 Early Outbreak / Cluster Detection

- **FR-4.1:** System detects statistically significant increases in case counts within a geographic radius over a rolling time window (e.g., 7 days).
- **FR-4.2:** When threshold conditions are met (rate of increase + geographic clustering + low vaccination coverage), system raises an "Emerging Outbreak" alert.
- **FR-4.3:** Alert includes case growth rate, number of affected villages, geographic radius, and estimated transmission risk.

### 6.5 Trend Forecasting

- **FR-5.1:** System displays historical weekly case counts per region.
- **FR-5.2:** System generates a short-term forecast (e.g., next-week projected case count), clearly labeled as a risk forecast, not a guarantee.

### 6.6 Weather & Environmental Risk Integration

- **FR-6.1:** System ingests temperature, humidity, rainfall, and flood/seasonal condition data for the relevant region.
- **FR-6.2:** Environmental data is combined with disease history and animal density to produce an elevated-risk indicator.

### 6.7 Vaccination Management

- **FR-7.1:** System stores vaccination history per herd (and optionally per animal).
- **FR-7.2:** System calculates and displays vaccination coverage percentage per village/block/district.
- **FR-7.3:** System flags low-coverage areas as vaccination priorities.
- **FR-7.4:** System generates reminders for upcoming/due vaccinations.

### 6.8 Animal / Herd Health Records

- **FR-8.1:** Herd-level health record is mandatory for MVP; individual animal-level record is an extension.
- **FR-8.2:** Record includes vaccination history, treatment history, prior illnesses, and current health status.

### 6.9 Laboratory Referral & Sample Tracking

- **FR-9.1:** Suspected high-risk cases can be converted into a sample-collection task assigned to a field worker.
- **FR-9.2:** Each sample gets a unique Sample ID with collection time, collector, destination lab, and status (e.g., In Transit, Received, Result Pending, Resulted).
- **FR-9.3:** Lab result updates automatically link back to and update the originating case.

### 6.10 Veterinary Case Management

- **FR-10.1:** Veterinarian dashboard lists new cases grouped by risk level (High/Medium/Low).
- **FR-10.2:** Veterinarian can review symptoms, photos, animal/herd history, and nearby cases for each case.
- **FR-10.3:** Veterinarian can assign a field worker, request a sample, recommend treatment, escalate, or close a case.

### 6.11 Alerts & Advisory Engine

- **FR-11.1:** System automatically triggers alerts when rule/AI thresholds are met (e.g., rapid case increase + clustering + low vaccination coverage → High Outbreak Risk).
- **FR-11.2:** Alerts are role-based and language-appropriate: farmers receive simple safety guidance, veterinarians receive case-density summaries, officials receive intervention recommendations.

### 6.12 Government / Veterinary Command Center Dashboard

- **FR-12.1:** Dashboard summarizes livestock under surveillance, active suspected cases, high-risk clusters, vaccination coverage, pending lab tests, and cases requiring intervention.
- **FR-12.2:** Dashboard surfaces a ranked list of priority actions (investigate cluster, vaccinate village, expedite samples, consider movement restriction, issue advisory).
- **FR-12.3:** Dashboard provides an explainability view showing the top contributing factors behind a given risk score.

### 6.13 Field Worker Mode

- **FR-13.1:** Field worker sees a prioritized daily task list (village visits, sample collection, vaccination follow-ups).
- **FR-13.2:** GPS location is captured for visits, case verification, sample collection, and vaccination activity.

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Offline-first | Core reporting and data capture must function with zero connectivity and sync automatically once online, with conflict-safe merge on the server. |
| Multilingual | UI text and advisory messages must support configurable regional languages; language packs should be externalized from code. |
| Low bandwidth | Mobile app must operate acceptably on 2G/3G networks; media uploads should be compressed and resumable. |
| Scalability | Backend must handle district-to-state scale case volume (tens of thousands of herds, thousands of concurrent reports). |
| Data integrity | Sample chain-of-custody and case history must be immutable/auditable once submitted. |
| Explainability | Any AI-generated risk score or suspected disease category must be accompanied by a plain-language rationale. |
| Security & privacy | Farmer and location data must be access-controlled by role; sensitive data encrypted in transit and at rest. |
| Availability | Core reporting and dashboard services should target high availability during active outbreak response periods. |

---

## 8. High-Level System Flow

The end-to-end workflow the platform is built around:

1. Farmer / Field Worker submits a symptom or mortality report (online or offline).
2. AI + rule-based triage engine produces an individual/herd risk score and suspected category.
3. Report is plotted on the GIS layer; the outbreak-detection engine scans for geographic/temporal clustering.
4. High-risk or clustered cases are routed to a veterinarian for review and possible lab referral.
5. Lab processes the sample and publishes a result, which updates the case record.
6. Treatment, containment, and vaccination actions are logged against the herd/animal record.
7. Government dashboard aggregates all of the above into district-level early warning and planning views.
8. Confirmed outcomes feed back into the model/history to improve future triage and forecasting.

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| AI triage perceived as a diagnosis | Loss of trust, misuse, liability | Always present as "suspected / requires veterinary confirmation"; never assert a confirmed disease name. |
| Low farmer adoption due to connectivity/language | Sparse reporting data, blind spots | Offline-first design, multilingual UI, IVR channel, sub-60-second reporting flow. |
| False-positive outbreak alerts | Alert fatigue, wasted field resources | Multi-factor thresholding (growth rate + clustering + coverage), explainable scoring, human review before escalation. |
| Data quality from self-reported symptoms | Inaccurate triage/forecast | Field worker verification step; photo/video evidence; historical pattern cross-checking. |
| Sync conflicts from offline submissions | Data loss or duplication | Unique client-generated report IDs, idempotent sync, server-side conflict resolution. |

---

## 10. Release Plan / Roadmap

### 10.1 Phase 1 — MVP (Hackathon Build)

- Farmer reporting (mobile/web, offline capture)
- Rule-based / lightweight AI triage with risk score
- Herd-level health record
- GIS disease-risk map with cluster detection
- Vaccination coverage tracking
- Veterinary case management dashboard
- Automated recommendation/alert engine
- Government command-center dashboard

### 10.2 Phase 2 — Pilot Hardening

- IVR reporting channel for feature phones
- Weather-integrated forecasting model
- Explainable AI contributing-factor breakdown
- Differential (multi-category) disease probability output
- Animal-level health passports

### 10.3 Phase 3 — Scale

- Multi-district / state-level rollout
- Movement-restriction and containment-zone workflows
- Integration with national/regional animal disease reporting systems
- Advanced multilingual, role-based advisory personalization

---

## 11. Reference Demo Narrative (Hackathon)

A recommended story arc for demonstrating the end-to-end value of the platform rather than isolated features:

1. **Farmer:** Reports that three cows have fever and mouth lesions, with a photo.
2. **AI Triage:** System returns "Suspected contagious disease — High Risk," with recommended actions.
3. **Map:** System shows four nearby farms have reported similar symptoms recently.
4. **Outbreak Detection:** System raises an "Emerging disease cluster detected" alert.
5. **Official Dashboard:** District officer sees the cluster expanding toward three villages.
6. **Recommendation:** System recommends field investigation, sample collection, targeted vaccination, and a farmer advisory.
7. **Lab:** Sample is logged, sent to the laboratory, and tracked to result.
8. **Confirmation:** Lab result updates the case record.
9. **Learning:** The confirmed case feeds back into the surveillance system for future triage and forecasting.

---

## 12. Open Questions

- Which specific diseases/species should the MVP rule-engine prioritize for the pilot region?
- What data source will supply weather and historical disease data (government API, third-party, manual seed data)?
- Who owns final sign-off on outbreak alerts before they reach farmers (auto-send vs. official approval step)?
- What are the data retention and privacy requirements for farmer and location data in the target region?
- Which languages must be supported at MVP vs. pilot stage?
