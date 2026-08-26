# PashuShield — Prototype Phase Objectives & Scope
### Internal SIH Reference

---

## 1. Objectives (Prototype Phase)

The prototype is built to demonstrate the platform's core value: **Report → Detect → Assess → Refer → Treat → Prevent → Monitor**, as one connected system rather than isolated features.

1. **Early detection** — Show the system can identify suspected disease cases and emerging outbreak clusters as early as possible.
2. **Faster response** — Demonstrate reduced time between symptom onset and veterinary/laboratory intervention.
3. **Prevention, not just reaction** — Show vaccination coverage and risk data being used to proactively target prevention efforts.
4. **Evidence-based governance** — Give a district/government-level view of animal health risk backed by real data.
5. **Inclusive access** — Demonstrate the reporting flow is simple and usable in low-connectivity conditions (offline capture).

---

## 2. Prototype Scope (MVP — Hackathon Build)

### 2.1 Core Demonstrable Modules

| # | Module | What It Demonstrates |
|---|--------|------------------------|
| 1 | **Report** | Farmer/field worker reports symptoms, mortality, and herd details via mobile/web, with offline capture. |
| 2 | **Detect** | AI-assisted or rule-based triage calculates a suspected disease category and risk score. |
| 3 | **Map** | GIS view shows reported cases and highlights emerging clusters at village/block/district level. |
| 4 | **Predict** | System flags rapidly increasing, geographically clustered cases as emerging outbreak risk. |
| 5 | **Respond** | Veterinary dashboard + lab referral workflow (sample collection → result → case update). |
| 6 | **Prevent** | Vaccination coverage tracking and automated alerts to relevant stakeholders. |

### 2.2 Supporting Components (Phase 1 / MVP)

- Herd-level health record (individual animal-level record is a later extension)
- Veterinary case management dashboard (case queue by risk level, assign field worker, request lab sample, recommend treatment)
- Automated recommendation/alert engine (rule/AI threshold-based alerts, role-based messaging)
- Government / command-center dashboard (surveillance summary, priority actions, cluster view)

### 2.3 Key Design Guardrail

- The triage engine **never outputs a confirmed diagnosis** — only a suspected category with a confidence level, always labeled "veterinary confirmation required."

### 2.4 Explicitly Out of Prototype Scope (Phase 2+)

- Animal-level (individual) digital health passports
- IVR-based reporting for feature-phone users
- Weather-integrated multi-week predictive forecasting model
- Explainable AI contributing-factor breakdown ("why was this flagged")
- Differential (multi-category) disease probability output
- Full multilingual, role-based advisory messaging engine
- Movement-restriction and containment-zone tooling for officials

---

## 3. Reference Demo Narrative (for Prototype Walkthrough)

1. Farmer reports 3 cows with fever and mouth lesions, with a photo.
2. AI Triage returns "Suspected contagious disease — High Risk" with recommended actions.
3. Map shows 4 nearby farms reporting similar symptoms.
4. Outbreak detection raises an "Emerging disease cluster detected" alert.
5. Official dashboard shows the cluster expanding toward 3 villages.
6. System recommends field investigation, sample collection, targeted vaccination, and a farmer advisory.
7. Sample is logged, sent to the lab, and tracked to result.
8. Lab result updates the case record.
9. Confirmed case feeds back into the system for future triage and forecasting.
