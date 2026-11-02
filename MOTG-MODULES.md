# MOTG JavaScript modules (Webflow + jsDelivr)

## Files in git

| File | Role |
|------|------|
| `app.js` | **Only file linked in Webflow** — entry `type="module"` |
| `motg-boot.js` | Init order, waits for GSAP |
| `motg-page.js` | Detects page (`/work`, mobile, etc.) |
| `motg-videos.js` | Vimeo lazy load, facade, coming soon |
| `motg-scroll.js` | Smooth scroll, scroll delay |
| `motg-motion.js` | GSAP, SplitText, parallax, galleries |
| `motg-core.js` | Menu, cursor, transitions, sliders |
| `app.monolith.js` | Backup of old single file (edit + rebuild optional) |

## Webflow Footer (one tag)

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/MAKETHECUT/motg@<commit>/app.js"></script>
```

**Important:** `type="module"` is required so `import` resolves sibling files from the same jsDelivr folder.

Keep GSAP / ScrollTrigger / SplitText **before** this script (Webflow as today).

## What loads where

- **Every page:** `motg-boot`, `motg-core`, `motg-scroll`, `motg-page`
- **If `/work`, `.home-featured`, or any Vimeo iframe:** `motg-videos.js`
- **Motion (GSAP extras):** all pages **except** mobile `/work` (reduces crashes)

## After editing logic

1. Either edit the split files directly, **or** edit `app.monolith.js` and run:
   ```bash
   node scripts/build-modules.mjs
   ```
   then re-apply any hand-fixes in `motg-boot.js` / `motg-page.js`.

2. Push all `.js` files to GitHub (same commit).

3. Update the `@<commit>` pin in Webflow and Publish.

## Local test

```html
<script type="module" src="/app.js"></script>
```

Use a local server (modules fail from `file://`).

```bash
cd /path/to/MOTG-CHECK
python3 -m http.server 8788
# open http://localhost:8788/work/
```

In `work/index.html` the script must be:

```html
<script type="module" src="/app.js"></script>
```

(not plain `src` without `type="module"`).
