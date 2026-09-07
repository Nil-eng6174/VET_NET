# Graph Report - pashushield_mvp  (2026-09-07)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 216 nodes · 319 edges · 23 communities (20 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `87be9822`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.py
- HealthReport
- compilerOptions
- i18n.tsx
- dependencies
- devDependencies
- reports.py
- samples.py
- cloud_sync.py
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `useTranslation()` - 15 edges
3. `HealthReport` - 11 edges
4. `get_chat_response()` - 8 edges
5. `init_excel()` - 7 edges
6. `submit()` - 7 edges
7. `create_report()` - 7 edges
8. `include` - 7 edges
9. `Sample` - 6 edges
10. `get_db()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `create_report()` --uses--> `HealthReport`  [INFERRED]
  main/backend/app/api/routers/reports.py → main/backend/app/models.py
- `get_reports()` --uses--> `HealthReport`  [INFERRED]
  main/backend/app/api/routers/reports.py → main/backend/app/models.py
- `update_sample()` --uses--> `SampleUpdate`  [INFERRED]
  main/backend/app/api/routers/samples.py → main/backend/app/schemas.py
- `register()` --uses--> `UserCreate`  [INFERRED]
  main/backend/app/api/routers/auth.py → main/backend/app/schemas.py
- `get_cases()` --uses--> `HealthReport`  [INFERRED]
  main/backend/app/api/routers/cases.py → main/backend/app/models.py

## Import Cycles
- None detected.

## Communities (23 total, 3 thin omitted)

### Community 0 - "app.py"
Cohesion: 0.12
Nodes (29): calculate_risk(), get_recommendation(), chat(), check_outbreak_threshold(), farmer_dashboard(), home(), init_excel(), ivr_finalize() (+21 more)

### Community 1 - "HealthReport"
Cohesion: 0.13
Nodes (22): Base, login(), post, Session, register(), get_cases(), get, patch (+14 more)

### Community 2 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 3 - "i18n.tsx"
Cohesion: 0.15
Nodes (14): FarmerDashboardPlaceholder(), FarmerDashboard(), Home(), TacticalCommandPage(), TriagePage(), VetReportsPlaceholder(), Chatbot(), I18nContext (+6 more)

### Community 4 - "dependencies"
Cohesion: 0.08
Nodes (23): chart.js, dependencies, chart.js, leaflet, next, react, react-chartjs-2, react-dom (+15 more)

### Community 5 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/leaflet (+11 more)

### Community 6 - "reports.py"
Cohesion: 0.20
Nodes (15): BaseModel, create_report(), get_reports(), get, post, Session, Config, ReportCreate (+7 more)

### Community 7 - "samples.py"
Cohesion: 0.36
Nodes (8): create_sample(), get_samples(), get, patch, post, Session, update_sample(), Sample

### Community 8 - "cloud_sync.py"
Cohesion: 0.47
Nodes (5): authenticate_gdrive(), backup_data(), Upload a file to Google Drive., Authenticate using Google Drive API and save credentials to avoid logging in…, upload_to_gdrive()

## Knowledge Gaps
- **51 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `allowJs`, `esModuleInterop` (+46 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `get_chat_response()` connect `app.py` to `reports.py`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `get_recommendation()` connect `reports.py` to `app.py`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `HealthReport` connect `HealthReport` to `reports.py`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `HealthReport` (e.g. with `get_cases()` and `update_case_status()`) actually correct?**
  _`HealthReport` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _51 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `HealthReport` be split into smaller, more focused modules?**
  _Cohesion score 0.12873563218390804 - nodes in this community are weakly interconnected._