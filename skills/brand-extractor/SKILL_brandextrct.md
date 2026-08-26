---
name: brand-extractor
description: >
  Scrapes any website using the Firecrawl API to extract complete brand intelligence:
  colors (primary, secondary, accent, background, hex values), typography (font families,
  sizes, weights), logos, hero/header images, favicons, OG images, UI patterns (buttons,
  border radius, spacing, shadows, gradients), and styling effects useful for rebuilding
  or cloning a website's visual identity. Use this skill whenever the user wants to
  analyze a website's brand, extract design tokens, pull brand colors or fonts, collect
  brand assets, or gather visual/styling data to inform building a new website. Trigger
  even if the user just says "extract brand from X", "get the colors/fonts of X",
  "analyze the design of X", or "I want to clone the look of X".
---

# Brand Extractor

Extracts full brand and visual design data from any website using Firecrawl's scrape API.
The goal is to give you everything needed to understand or recreate a site's visual identity.

## What This Skill Extracts

| Category | Data Points |
|---|---|
| **Colors** | Primary, secondary, accent, background, text, border — with hex values |
| **Typography** | Font families (primary, heading, mono), font sizes (xs → 4xl), font weights |
| **Logos & Favicons** | Favicon URL, OG image, logo images |
| **Hero / Header Images** | Large imagery from the page (banners, hero sections) |
| **UI Patterns** | Border radius, spacing units, shadows, gradients, button styles |
| **Theme** | Light/dark color scheme, overall visual feel |
| **Interesting Images** | Any visually prominent image found on the page |

## Workflow

### Step 1 — Get the URL
If the user hasn't provided a URL, ask for it. Confirm which page to scrape (homepage is usually best for brand data).

### Step 2 — Check for API key
Look for `FIRECRAWL_API_KEY` in `.env`. If missing, the script works keyless (lower rate limits) but warn the user they can add one for reliability.

### Step 3 — Run the extraction script
Always use the script in `scripts/extract_brand.py`. Do NOT manually call the API inline.

```bash
python skills/brand-extractor/scripts/extract_brand.py --url "https://example.com"
```

With API key:
```bash
python skills/brand-extractor/scripts/extract_brand.py --url "https://example.com" --api-key "fc-YOUR-KEY"
```

Output goes to `.tmp/brand_<domain>/` containing:
- `brand_data.json` — all extracted brand data
- `images/` — downloaded images (logos, heroes, favicons)
- `brand_report.md` — human-readable summary

### Step 4 — Present results

After the script runs, read `brand_report.md` and present a clean summary to the user with:
- A color palette (show hex values)
- Typography system
- Image assets found and their paths
- UI/styling notes
- Any interesting effects or patterns observed

Structure your response like this:

```
## 🎨 Brand Report: [Site Name]

### Colors
- Primary: #XXXXXX
- Secondary: #XXXXXX
- ...

### Typography
- Heading font: ...
- Body font: ...
- Font sizes: ...

### Images & Assets
- Logo: .tmp/brand_xxx/images/logo.png
- Hero image: .tmp/brand_xxx/images/hero_0.jpg
- ...

### UI Patterns
- Border radius: ...
- Button style: ...
- Notable effects: ...
```

### Step 5 — Self-anneal if it breaks

If the script fails:
1. Read the error carefully
2. Common issues: rate limiting (add API key), image download 403 (skip that image), JS-heavy page (try adding `--wait 3000` flag)
3. Fix the script, re-run, update this skill's notes below

**Known edge cases:**
- SVG logos: downloaded but note that PDF rendering may need conversion
- Webfonts (Google Fonts, Adobe): the font name is captured; actual file download is not attempted
- Single-page apps: may need `--wait 2000` to allow JS to render

---

## Script Reference

See `scripts/extract_brand.py` for full implementation.

Key flags:
- `--url` (required): Target website URL
- `--api-key`: Firecrawl API key (optional, uses keyless if omitted)
- `--output-dir`: Override default `.tmp/brand_<domain>/` output path
- `--wait`: Milliseconds to wait for JS rendering (default: 0, try 2000–5000 for SPAs)
- `--no-images`: Skip image downloading (faster, data-only mode)
