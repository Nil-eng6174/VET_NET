---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
license: Complete terms in LICENSE.txt
---

# Frontend Design

Approach this as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's.

## Current Project Design Language: "Light Tactical Minimal"

The current aesthetic for this project is "Light Tactical Minimal", adapted from the Aikosh Minimal UI Kit. It eschews generic dashboard fluff in favor of a high-contrast, data-dense, telemetry-focused UI.

### 1. Palette & Atmosphere
- **Base**: A crisp, light surface (`#f8fafc`) contrasting with pure white panels (`#ffffff`).
- **Text & Contrast**: High legibility using dark slate (`#0f172a`) for primary text and muted slate (`#64748b`) for secondary.
- **Accents**: We use intense, saturated "tactical" colors sparingly. Saffron (`#ea5b0c`) for primary actions/telemetry, Crimson (`#dc2626`) for critical threats/errors, and Emerald (`#059669`) for active sync/radar status.

### 2. Typography
- **Primary Typefaces**: `Space Grotesk` (for headlines, labels, telemetry numbers, and titles) paired with `Geist` (for dense body copy).
- **Scale**: Use monospace/structured font configurations for data. A telemetry number is not just big; it's tight, structured, and deliberate (e.g., tracking-tight, bold).

### 3. Layout & Structure
- **Tactical Grid**: Use rigid, thin borders (`border-grid` / `#e2e8f0`) to separate panels. The UI should feel like a command center terminal, even on mobile.
- **Micro-components**: Badges should look like status indicators (e.g., uppercase, small text, tracked out). Buttons should have purposeful hover states.

### 4. Process: brainstorm, explore, plan, critique, build, critique again

When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like .section and a element-based selector like .cta). This can happen often with paddings/margins between sections.

Try to do a lot of this planning and iteration in your thinking, and only show ideas to the user when you have higher confidence it'll delight them.

### 5. Multilingual & Copy
Words appear in a design for one reason: to make it easier to understand, and therefore easier to use.
- The interface is heavily localized (English, Marathi, Gujarati) using a Context-based i18n system.
- Write from the end user's side of the screen. Keep the register conversational and tuned: plain verbs, sentence case, no filler.
- Use tactical but accessible terminology: "Sync Active", "GeoLocked", "Triage Report".
