# PashuShield: Macro-Level Data Integration Strategy

Based on the architectural analysis of NADRES v2, a robust early-warning ecosystem cannot rely solely on farmer-reported symptoms. It must correlate these ground-level reports with macro-level environmental and historical covariates. Below is the breakdown of the open-source datasets to be integrated into PashuShield's prediction engine.

## 1. Meteorological & Weather Data
**Sources:** 
*   **IMD (India Meteorological Department):** Provides localized, authoritative data on precipitation, temperature, and wind speed.
*   **NCEP (National Centers for Environmental Prediction):** Offers global meteorological variables and forecasting models.
*   **GLDAS (Global Land Data Assimilation System):** Assimilates satellite and ground-based observations to generate land surface states and fluxes.

**Utilization in PashuShield:**
*   **Vector-Borne Disease Forecasting:** Pathogens and their vectors (e.g., mosquitoes, ticks, midges) are highly sensitive to microclimates. By continuously ingesting IMD and NCEP data into your backend, PashuShield can map real-time temperature and humidity spikes. 
*   **Actionable Output:** If the rule-based engine detects a mild cluster of symptoms, high concurrent humidity/temperature data from IMD can push the AI risk score from "Watch" to "High Risk" for diseases like Bluetongue or Lumpy Skin Disease (LSD).

## 2. Remote Sensing & Environmental Variables
**Source:** 
*   **MODIS (Moderate Resolution Imaging Spectroradiometer):** A key instrument aboard the Terra and Aqua satellites.

**Utilization in PashuShield:**
*   **LST (Land Surface Temperature) & NDVI (Normalized Difference Vegetation Index):** These are critical environmental covariates. NDVI tracks vegetation density, which directly correlates with the availability of grazing land and the proliferation of vector habitats following monsoons.
*   **Actionable Output:** PashuShield's Risk Engine can overlay MODIS raster data with the farmer's precise GPS coordinates (stored in PostGIS). If a reported case is adjacent to high-NDVI zones with rising LST, the system flags the cluster for high transmission velocity.

## 3. Host Density Mapping
**Source:** 
*   **National Livestock Census:** The official Indian government census detailing species-wise livestock population down to the district and block levels.

**Utilization in PashuShield:**
*   **Transmission Risk & $R_0$ Modeling:** A contagious disease spreading in a sparsely populated region has a different risk profile than one in a dense dairy hub. 
*   **Actionable Output:** The cluster detection algorithm (inspired by SaTScan) must use the Livestock Census data as the "underlying population at risk." When PashuShield calculates the expected vs. observed cases to trigger an outbreak alert, it uses this census data to normalize the statistical significance of the cluster.

## 4. Historical Disease Baselines
**Source:** 
*   **AICRP (All India Coordinated Research Project) Centers:** 31 centers providing historical disease event data.

**Utilization in PashuShield:**
*   **Baseline Expectation & Alert Fatigue Mitigation:** To prevent false-positive alerts, PashuShield must know if a disease is endemic to a region during a specific month. 
*   **Actionable Output:** Before issuing a district-wide alert for Foot and Mouth Disease (FMD), the system queries the AICRP baseline. If the current case velocity significantly exceeds the historical 5-year average for that specific block and month, the alert is authorized.