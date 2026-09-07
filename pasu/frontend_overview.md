# KrishiCare Frontend Blueprint

Use this overview as a guide or a prompt to generate your custom frontend UI. It outlines the exact screens required, the state management needed, and the API endpoints your frontend must connect to.

## 1. Global Architecture
- **Framework Agnostic:** You can build this in React, Vue, Next.js, or plain HTML/JS.
- **State Management:** You need to maintain the user's login state. If a user is logged in, you should route them to their respective dashboard (`/farmer` or `/vet`).
- **Styling:** We recommend a clean, agricultural theme (Greens, Whites, Earth tones).

---

## 2. Screens & Views

### A. Landing & Authentication Screen
This is the entry point for all users.
- **Components Required:**
  1. **Role Selector:** A toggle or dropdown to select "Farmer" or "Veterinarian".
  2. **Login Form:** 
     - Input: Aadhaar Number (12 digits)
     - Input: OTP (Prototype uses `123456`)
     - Button: "Login"
  3. **Registration Form (Hidden by default, toggled via link):**
     - Input: Full Name
     - Input: Aadhaar Number
     - Input: Mobile Number
     - Input: Locality (Dropdown or Text: Pune, Satara, etc.)
     - Input: Email Address (Only show if "Veterinarian" is selected)
     - Button: "Register"

### B. Farmer Dashboard
The portal where farmers report animal diseases.
- **Components Required:**
  1. **Header:** Displays the Farmer's Name, Locality, and a "Logout" button.
  2. **Disease Report Form:**
     - Select: Animal Type (Cow, Buffalo, Goat, etc.)
     - Select: Main Symptom (Fever, Diarrhea, Difficulty Breathing, etc.)
     - Select: Additional Symptoms
     - Select: Duration of illness
     - Textarea: Additional Notes
     - File Input: Upload Image (crucial for form submission)
     - Button: "Analyze Disease"
  3. **AI Result Card (Hidden until form submitted):**
     - Displays: Risk Score (0-100%)
     - Displays: Risk Level (Low/Medium/High) with corresponding color codes.
     - Displays: Veterinary Recommendation text.

### C. Veterinarian Dashboard
The command center for vets to monitor outbreaks.
- **Components Required:**
  1. **Header:** Displays the Vet's Name (e.g., "Dr. John Doe") and a "Logout" button.
  2. **Alert Banner:** A conditionally rendered red warning box that lists any localities that have crossed the 10-case outbreak threshold.
  3. **Analytics Section:**
     - **Pie/Donut Chart:** Visualizes cases broken down by "Main Symptom". (Recommended library: `Chart.js` or `Recharts`).
     - **GIS Map:** A regional map displaying markers on different localities. Marker size/color should scale based on the number of cases. (Recommended library: `Leaflet.js` or `React-Leaflet`).
  4. **Recent Reports Table:**
     - Columns: Date, Farmer Name, Locality, Animal, Symptom, Risk Level.

---

## 3. API Contract (Endpoints)

When building the UI, make `fetch` or `axios` calls to these endpoints:

### Authentication APIs
* **POST `/api/register`**
  * **Payload:** `{ role, name, aadhaar, mobile, locality, email }`
  * **Response:** `{ success: true }` or `{ success: false, message: "..." }`
* **POST `/api/login`**
  * **Payload:** `{ role, aadhaar, otp }` *(Note: Backend currently ignores OTP and accepts any for prototype, but send it anyway)*
  * **Response:** `{ success: true }` or `{ success: false, message: "..." }`
* **POST `/api/logout`**
  * **Response:** `{ success: true }`
* **GET `/api/user_info`**
  * **Response:** `{ success: true, role: "...", name: "...", locality: "..." }`

### Functional APIs
* **POST `/submit` (Farmer Only)**
  * **Payload:** `FormData` containing `animal`, `symptom`, `additionalSymptoms`, `duration`, `notes`, and `image` (File).
  * **Response:** `{ status: "success", score: 75, risk_level: "HIGH", recommendation: "...", reasons: [...] }`
* **GET `/api/vet/dashboard_data` (Vet Only)**
  * **Response:** 
    ```json
    {
      "success": true,
      "alerts": ["Pune has crossed the threshold! (12 cases)"],
      "chart_labels": ["Fever", "Diarrhea"],
      "chart_data": [5, 2],
      "localities_count": { "Pune": 12, "Satara": 3 },
      "recent_reports": [
        { "date": "2026-08-27", "name": "Ramesh", "locality": "Pune", "animal": "Cow", "symptom": "Fever", "risk": "HIGH" }
      ]
    }
    ```
