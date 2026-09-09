# Remaining Features for PashuShield MVP

Based on the analysis of `pashushield_final_system_architecture.md` and `plan_0.pdf`, the current prototype (`pashushield_mvp`) has successfully implemented basic farmer reporting, multilingual support, SMS (via TextBee), IVR (via Twilio), and AI triage. 

However, to complete the **7-Day Hackathon MVP** as specified in the planning documents, the following features are still remaining and need to be implemented:

## 1. Real Database Infrastructure (PostgreSQL + PostGIS)
* **Description:** The current system uses an Excel spreadsheet (`farmer_data.xlsx`) for storing data. The architecture mandates transitioning to a real relational database (PostgreSQL) with spatial extensions (PostGIS) to properly store users, roles, herds, cases, and handle geographic clustering queries efficiently.

## 2. Offline-First Reporting (PWA)
* **Description:** A core differentiator of PashuShield is offline resilience for low-connectivity rural areas. The frontend needs Progressive Web App (PWA) capabilities and IndexedDB integration so farmers can fill out a report offline, which automatically syncs to the server (with a `client_report_id` to prevent duplicates) once the internet is restored.

## 3. Laboratory Workflow & QR Sample Tracking
* **Description:** The loop needs to be closed between veterinarians and labs. When a vet requests a sample, the system must generate a unique Sample ID/QR code. The dashboard must track the sample lifecycle: `In Transit` → `Received` → `Result Pending` → `Resulted`, automatically updating the case status upon a positive/negative result.

## 4. Veterinary & Field-Worker Case Management
* **Description:** While a basic Vet Dashboard stub exists, the actual workflow of reviewing a high-risk case, assigning it to a specific field-worker, and the field-worker receiving a "Today's Tasks" list (e.g., "Visit Case #1042") is not yet implemented.

## 5. Spatial-Temporal Cluster Detection
* **Description:** The GIS map currently only plots cases. The system needs a background algorithm to detect emerging outbreaks by evaluating live reports—identifying when multiple cases appear within a specific radius (e.g., 10km) and a specific timeframe (e.g., 48 hours), and throwing an "Emerging Disease Cluster" alert.

## 6. Herd Health & Vaccination Management
* **Description:** The system lacks structured tracking of herd-level health records. It needs to track total animals, past illnesses, and calculate **vaccination coverage** by village/block. This data should be used to flag high-risk areas with low vaccination rates and recommend priority vaccination campaigns.

## 7. Media Upload Handling (Photos/Videos)
* **Description:** The PRD specifies that farmers should be able to upload photos of symptoms for the AI/Vet to analyze. While the form might have the field, the backend needs a secure storage mechanism (e.g., local uploads folder or cloud bucket) to actually store and link the evidence to the case.

## 8. Weather & Environmental Seed Data
* **Description:** To mimic the macro-forecasting elements inspired by NADRES, the MVP dashboard needs to integrate basic weather seed data (temperature, humidity, rainfall) to contextualize the local disease reports for government officials.
