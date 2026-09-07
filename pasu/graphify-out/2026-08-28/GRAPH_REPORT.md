# Graph Report - pasu  (2026-08-28)

## Corpus Check
- 8 files · ~12,707 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 64 nodes · 79 edges · 17 communities (9 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ef1bf177`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.py
- cloud_sync.py
- Pasu - Tech Stack
- send_sms
- submit
- check_outbreak_threshold
- /api/logout
- /submit
- /api/login
- /api/register
- /api/vet/dashboard_data
- /api/user_info
- Farmer Dashboard
- Landing & Authentication Screen
- Veterinarian Dashboard
- logout
- farmer_data_901998c3.md

## God Nodes (most connected - your core abstractions)
1. `submit()` - 7 edges
2. `init_excel()` - 6 edges
3. `Pasu - Tech Stack` - 6 edges
4. `get_chat_response()` - 5 edges
5. `send_sms()` - 5 edges
6. `get_recommendation()` - 4 edges
7. `check_outbreak_threshold()` - 4 edges
8. `calculate_risk()` - 3 edges
9. `send_outbreak_email()` - 3 edges
10. `register()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --calls--> `send_sms()`  [EXTRACTED]
  app.py → sms.py
- `chat()` --calls--> `get_chat_response()`  [EXTRACTED]
  app.py → chatbot.py
- `submit()` --calls--> `calculate_risk()`  [EXTRACTED]
  app.py → ai_rules.py
- `get_recommendation()` --calls--> `get_chat_response()`  [EXTRACTED]
  ai_rules.py → chatbot.py
- `submit()` --calls--> `get_recommendation()`  [EXTRACTED]
  app.py → ai_rules.py

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Authentication Flow** — pasu_templates_login_login, pasu_templates_farmer_logout, pasu_templates_index_logout, pasu_templates_vet_logout [INFERRED 0.85]

## Communities (17 total, 8 thin omitted)

### Community 0 - "app.py"
Cohesion: 0.27
Nodes (13): chat(), farmer_dashboard(), home(), init_excel(), login(), logout(), Ensure Excel file exists with proper multiple sheets., register() (+5 more)

### Community 1 - "cloud_sync.py"
Cohesion: 0.47
Nodes (5): authenticate_gdrive(), backup_data(), Upload a file to Google Drive., Authenticate using Google Drive API and save credentials to avoid logging in…, upload_to_gdrive()

### Community 2 - "Pasu - Tech Stack"
Cohesion: 0.29
Nodes (6): AI & Machine Learning (RAG/NLP), Backend, Frontend, Integrations & External Services, Pasu - Tech Stack, Project Structure Highlights

### Community 3 - "send_sms"
Cohesion: 0.50
Nodes (4): format_phone_number(), Clean and format phone number to E.164 standard, Sends a WhatsApp alert using Twilio Sandbox to bypass Indian DLT regulations.…, send_sms()

### Community 4 - "submit"
Cohesion: 0.47
Nodes (4): calculate_risk(), get_recommendation(), submit(), get_chat_response()

### Community 5 - "check_outbreak_threshold"
Cohesion: 0.50
Nodes (4): check_outbreak_threshold(), Check if the given locality has crossed the 100 case threshold for a specific…, Send an email alert to all veterinarians using SMTP., send_outbreak_email()

### Community 6 - "/api/logout"
Cohesion: 0.67
Nodes (3): /api/logout, logout, logout

### Community 7 - "/submit"
Cohesion: 1.00
Nodes (3): /submit, submitReport, submitReport

### Community 16 - "farmer_data_901998c3.md"
Cohesion: 0.40
Nodes (4): Sheet: Alerts, Sheet: Farmer Reports, Sheet: Farmers, Sheet: Veterinarians

## Knowledge Gaps
- **22 isolated node(s):** `Sheet: Farmer Reports`, `Sheet: Farmers`, `Sheet: Veterinarians`, `Sheet: Alerts`, `Backend` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `send_sms()` connect `send_sms` to `app.py`, `submit`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `init_excel()` connect `app.py` to `submit`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `check_outbreak_threshold()` connect `check_outbreak_threshold` to `app.py`, `submit`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `Sheet: Farmer Reports`, `Sheet: Farmers`, `Sheet: Veterinarians` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._