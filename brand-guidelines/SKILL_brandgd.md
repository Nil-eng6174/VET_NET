---
name: brand-guidelines
description: >
  Applies brand colors, typography, and visual identity to any artifact (slides, docs,
  UI mockups, style sheets, reports, etc.). Works with ANY brand — not just Anthropic.
  When a website URL is provided, first runs brand-extractor to pull live brand data
  (colors, fonts, logos, hero images, UI patterns) via Firecrawl, then applies those
  tokens to the target artifact. Use this skill when the user mentions brand guidelines,
  brand colors, design tokens, company style, visual identity, "make it look like X's
  website", or wants to apply a brand's look-and-feel to something they're building.
license: Complete terms in LICENSE.txt
---

# Brand Guidelines

## Overview

This skill applies brand identity — colors, typography, spacing, and visual style — to any artifact.
It has two modes:

| Mode | When to use |
|---|---|
| **Extracted brand** | User provides a website URL → run brand-extractor first, then apply results |
| **Custom / known brand** | User provides brand tokens directly (e.g. hex codes, font names) → apply immediately |

---

## Step 1 — Determine the brand source

**If the user gives a URL:**
Run the brand-extractor skill first:

```bash
python skills/brand-extractor/scripts/extract_brand.py --url "https://example.com"
```

This produces `.tmp/brand_<domain>/brand_data.json`. Read it to get:
- `branding.colors` — hex color palette
- `branding.typography.fontFamilies` — primary, heading, mono fonts
- `branding.typography.fontSizes` — size scale
- `branding.spacing` — border radius, base unit
- `branding.colorScheme` — light or dark
- `images` — logos, favicons, hero images with local paths

**If the user gives tokens directly** (e.g. "use #ff5733 as primary, Inter font"):
Skip extraction and use the tokens they provided.

**If no brand source is given:**
Fall back to the built-in Anthropic brand (see below).

---

## Step 2 — Map brand tokens to the artifact

Use the extracted (or provided) brand data and apply it to the artifact:

### Colors

| Role | Map from extracted data |
|---|---|
| Primary | `branding.colors.primary` |
| Secondary | `branding.colors.secondary` |
| Accent | `branding.colors.accent` |
| Background | `branding.colors.background` |
| Text | `branding.colors.text` |
| Border | `branding.colors.border` |

### Typography

- **Headings (h1, h2, large text, 24pt+):** `branding.typography.fontFamilies.heading` or `.primary`
- **Body text:** `branding.typography.fontFamilies.primary`
- **Code / mono:** `branding.typography.fontFamilies.monospace`
- **Font sizes:** use the extracted size scale where applicable
- **Fallbacks:** Arial for headings, Georgia for body if extracted fonts aren't installed

### Logos & Images

- Use `images` from `brand_data.json` — prefer `kind: logo`, then `kind: favicon`
- Hero images (`kind: hero`) can be used as backgrounds or section headers
- Local file paths are in `local_path` field — reference directly

### Spacing & UI

- `branding.spacing.borderRadius` → apply to buttons, cards, inputs
- `branding.spacing.baseUnit` → use as spacing multiplier
- Honor `branding.colorScheme` (light/dark) for overall tone

---

## Step 3 — Apply & present

After applying brand tokens:
1. Save the updated artifact
2. Show the user a summary:

```
## ✅ Brand Applied: [Site/Brand Name]

**Colors used:**
- Primary: #XXXXXX
- Secondary: #XXXXXX

**Fonts:** [heading font] / [body font]

**Assets used:**
- Logo: images/logo_0.png
- Hero: images/hero_0.jpg

**Output:** [path to artifact]
```

---

## Fallback: AIKosh Brand Tokens

Use these when no URL or custom tokens are provided:

### Colors

| Role | Value | Use |
|---|---|---|
| Primary | `#FDEFE7` | Main brand color |
| Secondary | `#F3EAD8` | Secondary elements |
| Accent | `#EA5B0C` | Calls to action, links, primary highlights |
| Background | `#FFFFFF` | Page backgrounds |
| Text | `#000000` | Primary text |

### Typography

- **Headings:** Inter (fallback: sans-serif)
- **Body:** Inter (fallback: sans-serif)

### UI Patterns

- **Border Radius:** 8px
- **Base Spacing Unit:** 4px
- **Button Style:** Solid borders, `8px` rounded corners, `#000000` text on `#FFFFFF` background (primary).

### Accent cycling
Non-text shapes should primarily use `#EA5B0C` (orange) for accents, with `#FDEFE7` and `#F3EAD8` for softer complementary backgrounds.

---

## Technical Notes

- Colors applied via RGB values (e.g. python-pptx `RGBColor`, CSS hex, Tailwind `[#hex]`)
- Fonts: use system-installed fonts; graceful fallback if unavailable
- All extracted assets live in `.tmp/brand_<domain>/images/` — reference by local path
- SVG logos may need conversion to PNG for embedding in PPTX/PDF
- For JS-heavy sites, re-run extractor with `--wait 3000`

---

## Integration with brand-extractor

This skill depends on [`skills/brand-extractor`](../skills/brand-extractor/SKILL_brandextrct.md).
Always run extraction before applying when a URL is given. The extractor output is the source of truth.
