"""
extract_brand.py
----------------
Scrapes a website using Firecrawl and extracts brand data:
  - Colors (primary, secondary, accent, background, text, border, hex values)
  - Typography (font families, sizes, weights)
  - Logos, favicons, OG images
  - Hero / header images and other prominent images
  - UI patterns (border radius, spacing, button styles, shadows, gradients)
  - Color scheme (light/dark mode)

Usage:
    python extract_brand.py --url "https://example.com"
    python extract_brand.py --url "https://example.com" --api-key "fc-YOUR-KEY"
    python extract_brand.py --url "https://example.com" --wait 3000 --no-images

Output:
    .tmp/brand_<domain>/
        brand_data.json      - raw extracted data
        brand_report.md      - human-readable summary
        images/              - downloaded image assets
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

import requests


# ─── CLI Args ──────────────────────────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(description="Extract brand data from a website via Firecrawl")
    parser.add_argument("--url", required=True, help="Target website URL")
    parser.add_argument("--api-key", default=None, help="Firecrawl API key (optional, keyless if omitted)")
    parser.add_argument("--output-dir", default=None, help="Override default output directory")
    parser.add_argument("--wait", type=int, default=0, help="Milliseconds to wait for JS render (0 = none)")
    parser.add_argument("--no-images", action="store_true", help="Skip downloading images")
    return parser.parse_args()


# ─── Firecrawl API Call ────────────────────────────────────────────────────────

def scrape_with_firecrawl(url: str, api_key: str | None, wait_ms: int) -> dict:
    """
    Calls Firecrawl v2 scrape endpoint requesting both 'branding' and 'html' formats.
    'branding' gives structured design tokens; 'html' lets us parse additional image URLs.
    """
    endpoint = "https://api.firecrawl.dev/v2/scrape"
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    payload = {
        "url": url,
        "formats": ["branding", "html", "markdown"],
    }
    if wait_ms > 0:
        payload["waitFor"] = wait_ms

    print(f"[firecrawl] Scraping {url} ...")
    resp = requests.post(endpoint, headers=headers, json=payload, timeout=60)

    if resp.status_code == 401:
        print("[error] Invalid or missing API key. Try without --api-key for keyless access.")
        sys.exit(1)
    if resp.status_code == 429:
        print("[error] Rate limited. Add an API key (https://firecrawl.dev) or try again later.")
        sys.exit(1)
    if not resp.ok:
        print(f"[error] Firecrawl returned {resp.status_code}: {resp.text[:300]}")
        sys.exit(1)

    return resp.json()


# ─── Image Extraction ──────────────────────────────────────────────────────────

def extract_image_urls(branding: dict, html: str, metadata: dict) -> list[dict]:
    """
    Collects image URLs from branding tokens, OG metadata, and HTML img tags.
    Classifies each as: logo, favicon, og_image, hero, or general.
    """
    images = []

    def add(url, kind, label=""):
        if url and isinstance(url, str) and url.startswith("http"):
            images.append({"url": url, "kind": kind, "label": label or kind})

    # Branding images
    b_images = branding.get("images", {})
    add(b_images.get("favicon"), "favicon", "favicon")
    add(b_images.get("ogImage"), "og_image", "OG image")
    for logo in b_images.get("logos", []):
        add(logo.get("url") or logo if isinstance(logo, str) else None, "logo", "logo")

    # OG / metadata
    add(metadata.get("ogImage"), "og_image", "OG image")

    # Pull prominent images from HTML (hero candidates: large images, above fold)
    if html:
        # Find all img src values
        img_srcs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.IGNORECASE)
        # Heuristic: hero images often appear early in HTML, or have certain keywords
        hero_keywords = re.compile(r'hero|banner|header|cover|bg|background|splash', re.IGNORECASE)
        hero_attrs = re.findall(
            r'<img[^>]+(hero|banner|header|cover|splash|background)[^>]*src=["\']([^"\']+)["\']',
            html, re.IGNORECASE
        )
        hero_urls = {m[1] for m in hero_attrs}

        seen = {i["url"] for i in images}
        for src in img_srcs[:40]:  # cap at first 40 imgs to avoid noise
            if not src.startswith("http"):
                continue
            if src in seen:
                continue
            seen.add(src)
            # Skip tiny icons/SVG decorators
            if re.search(r'\.(svg)$', src, re.IGNORECASE) and src not in hero_urls:
                continue
            kind = "hero" if src in hero_urls else "general"
            images.append({"url": src, "kind": kind, "label": kind})

    # Deduplicate by URL
    seen_urls = set()
    unique = []
    for img in images:
        if img["url"] not in seen_urls:
            seen_urls.add(img["url"])
            unique.append(img)

    return unique


# ─── Image Downloader ──────────────────────────────────────────────────────────

def download_images(image_list: list[dict], images_dir: Path) -> list[dict]:
    """Downloads each image to images_dir, returns enriched list with local paths."""
    images_dir.mkdir(parents=True, exist_ok=True)
    counters = {}

    for img in image_list:
        kind = img["kind"]
        counters[kind] = counters.get(kind, 0)
        ext = Path(urlparse(img["url"]).path).suffix or ".jpg"
        filename = f"{kind}_{counters[kind]}{ext}"
        counters[kind] += 1
        dest = images_dir / filename

        try:
            r = requests.get(img["url"], timeout=15, headers={"User-Agent": "Mozilla/5.0"})
            if r.ok:
                dest.write_bytes(r.content)
                img["local_path"] = str(dest)
                print(f"  [img] Downloaded {filename} ({len(r.content)//1024}KB)")
            else:
                img["local_path"] = None
                print(f"  [img] Skipped {img['url']} — HTTP {r.status_code}")
        except Exception as e:
            img["local_path"] = None
            print(f"  [img] Failed {img['url']}: {e}")

    return image_list


# ─── Report Generator ──────────────────────────────────────────────────────────

def build_report(url: str, branding: dict, images: list[dict], metadata: dict) -> str:
    """Builds a markdown report from extracted brand data."""
    domain = urlparse(url).netloc
    site_title = metadata.get("title") or domain

    lines = [
        f"# 🎨 Brand Report: {site_title}",
        f"\n**Source URL:** {url}",
        f"**Domain:** {domain}",
        f"**Color Scheme:** {branding.get('colorScheme', 'unknown')}",
        "",
        "---",
        "",
        "## Colors",
    ]

    colors = branding.get("colors", {})
    if colors:
        for key, val in colors.items():
            if isinstance(val, str):
                lines.append(f"- **{key.capitalize()}:** `{val}`")
    else:
        lines.append("- No color data extracted")

    lines += ["", "## Typography", ""]
    typo = branding.get("typography", {})
    fonts = typo.get("fontFamilies", {})
    if fonts:
        for k, v in fonts.items():
            lines.append(f"- **{k.capitalize()} font:** {v}")

    font_sizes = typo.get("fontSizes", {})
    if font_sizes:
        lines.append("\n**Font Sizes:**")
        for k, v in font_sizes.items():
            lines.append(f"  - {k}: {v}")

    font_weights = typo.get("fontWeights", {})
    if font_weights:
        lines.append("\n**Font Weights:**")
        for k, v in font_weights.items():
            lines.append(f"  - {k}: {v}")

    lines += ["", "## Spacing & UI Patterns", ""]
    spacing = branding.get("spacing", {})
    if spacing:
        for k, v in spacing.items():
            lines.append(f"- **{k}:** {v}")

    lines += ["", "## Images & Assets", ""]
    priority_kinds = ["logo", "favicon", "og_image", "hero", "general"]
    for kind in priority_kinds:
        kind_imgs = [i for i in images if i["kind"] == kind]
        if not kind_imgs:
            continue
        lines.append(f"### {kind.replace('_', ' ').title()} Images")
        for img in kind_imgs:
            local = img.get("local_path")
            path_str = f" -> `{local}`" if local else " (download failed)"
            lines.append(f"- [{img['label']}]({img['url']}){path_str}")
        lines.append("")

    lines += [
        "---",
        "",
        "## Raw Branding Data",
        "",
        "```json",
        json.dumps(branding, indent=2),
        "```",
    ]

    return "\n".join(lines)


# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    args = parse_args()

    # Resolve API key: arg > .env > keyless
    api_key = args.api_key
    if not api_key:
        env_path = Path(__file__).parents[3] / ".env"  # project root .env
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("FIRECRAWL_API_KEY="):
                    api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    if not api_key:
        print("[info] No API key found — using keyless mode (lower rate limits)")

    # Output directory
    domain = urlparse(args.url).netloc.replace(".", "_")
    project_root = Path(__file__).parents[3]
    output_dir = Path(args.output_dir) if args.output_dir else project_root / ".tmp" / f"brand_{domain}"
    output_dir.mkdir(parents=True, exist_ok=True)
    images_dir = output_dir / "images"

    # Scrape
    result = scrape_with_firecrawl(args.url, api_key, args.wait)
    data = result.get("data", {})
    branding = data.get("branding", {})
    html = data.get("html", "")
    metadata = data.get("metadata", {})

    if not branding:
        print("[warning] No branding data returned. The site may require JS rendering — try --wait 3000")

    # Extract images
    print("[extract] Collecting image URLs ...")
    images = extract_image_urls(branding, html, metadata)
    print(f"[extract] Found {len(images)} images")

    # Download images
    if not args.no_images and images:
        print(f"[download] Downloading images to {images_dir} ...")
        images = download_images(images, images_dir)

    # Save raw JSON
    brand_json = {
        "url": args.url,
        "metadata": metadata,
        "branding": branding,
        "images": images,
    }
    json_path = output_dir / "brand_data.json"
    json_path.write_text(json.dumps(brand_json, indent=2))
    print(f"[save] brand_data.json -> {json_path}")

    # Build + save report
    report = build_report(args.url, branding, images, metadata)
    report_path = output_dir / "brand_report.md"
    report_path.write_text(report)
    print(f"[save] brand_report.md -> {report_path}")

    print(f"\n✅ Done! Output: {output_dir}")
    print(f"   JSON data:  {json_path}")
    print(f"   Report:     {report_path}")
    if not args.no_images:
        print(f"   Images:     {images_dir}")


if __name__ == "__main__":
    main()
