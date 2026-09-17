# Asset Extraction from Figma

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 1h to identify and extract image assets from Figma artboards
> before implementation. Read in full before calling any extraction tool.
>
> **Zero-placeholder policy:** every image asset visible in the Figma design must be
> extracted and committed to `src/assets/` before Phase 4 begins. Gradient placeholders
> and empty `<div>` boxes are not acceptable. If the highest-fidelity method is
> unavailable, use the next tier — but always extract something real.

---

## Step 0 — Acquire the Figma File Key (Required for REST API)

The Figma REST API requires a **file key** — the identifier embedded in every Figma
file URL. Without it, you can still extract assets using Tier 2 and Tier 3 methods
below, but the REST API (Tier 1) produces the highest quality output and should always
be the first attempt.

**Ask the user for the file key at the start of Phase 1h:**

> "To extract image assets at the highest quality, I need the Figma file key.
> In the Figma desktop app:
>
> 1. Right-click the file tab at the top → **Copy link** (or go to **File → Share** and copy the URL)
> 2. The URL looks like: `https://www.figma.com/design/ABCDEF1234567890/My-File-Name`
> 3. The file key is the segment after `/design/`: **`ABCDEF1234567890`**
>
> Please share that key (or the full URL). If you cannot access it right now, I will
> proceed with the desktop-app extraction methods and note which assets need to be
> re-exported at higher quality."

**Extracting the key from a URL (if the user pastes it):**

```bash
# URL format: https://www.figma.com/design/<FILE_KEY>/<file-name>?...
# Extract key with sed:
echo "https://www.figma.com/design/ABCDEF1234567890/My-App" \
  | sed -E 's|.*/design/([^/]+)/.*|\1|'
# → ABCDEF1234567890
export FILE_KEY="ABCDEF1234567890"
```

**Your Figma personal access token** (same one used for the MCP server) is needed for REST calls. Store it as an environment variable:

```bash
export FIGMA_TOKEN="your-personal-access-token"
```

---

## Two Fundamentally Different Types of Image Assets

Figma stores images in two distinct ways — understanding the difference is essential for choosing the right extraction method:

| Type             | What it is                                                                                                         | Figma signal                                            | Best extraction method                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ---------------------------------------- |
| **Image fill**   | A photo, texture, or raster image dragged/pasted into Figma. Stored as an IMAGE fill on a RECTANGLE or FRAME node. | Layer has fill of type `IMAGE`; `imageRef` in node data | REST API Method A → original source file |
| **Vector asset** | A logo, icon, or illustration drawn in Figma using vector tools.                                                   | Node type `VECTOR`, `BOOLEAN_OPERATION`, or `GROUP`     | REST API Method B → clean SVG            |

Do **not** confuse these with Ignite UI component instances — those become Angular components, not extracted assets.

---

## Step 1 — Identify Image Nodes

### Naming patterns to look for in `figma_get_metadata`

Scan the XML returned by `figma_get_metadata` for layer names matching:

| Naming pattern                                     | Likely asset type | Action                                    |
| -------------------------------------------------- | ----------------- | ----------------------------------------- |
| `_Image`, `_Photo`, `_Picture`, `image`, `photo`   | Raster image fill | Extract as PNG                            |
| `_Hero`, `_Banner`, `_Cover`, `hero`, `banner`     | Large raster fill | Extract as PNG (2× scale)                 |
| `_Thumbnail`, `_Avatar`, `_Illustration`           | Raster image fill | Extract as PNG                            |
| `_Logo`, `_Brand`, `logo`, `brand`                 | Vector or raster  | If vector: extract as SVG; if raster: PNG |
| `_Icon/` prefix (custom icons not in igx-icon set) | Custom SVG icon   | Extract as SVG                            |
| `_Background`, `_Bg`, `bg`, `background`           | Large raster fill | Extract as PNG                            |
| `_Illustration`, `_Art`, `_Pattern`                | Vector or raster  | Classify before extracting                |

> **Ignore these** — do NOT extract them as image assets:
>
> - Any layer whose name starts with `_Button`, `_Input`, `_Grid`, `_Card`, etc.
>   (Indigo.Design UI Kit component instances → implement as IgxXxx components)
> - `igx-icon` glyph nodes (use `<igx-icon>` in Angular instead)
> - Artboard/frame boundaries themselves

### Size heuristic

Large rectangles (width > 200px or height > 200px) at key layout positions (hero area,
sidebar background, card thumbnail slot) are almost always image fills.

Small nodes (< 48×48px) named with icon-like names are usually SVG icons.

### Confirm with design context

For ambiguous nodes, look at the `figma_get_design_context` output for the artboard.
Each image asset appears as either:

- An `<img src="http://localhost:3845/assets/...">` — confirms it is a raster fill; note the node ID
- Inline SVG or an `<img>` with `.svg` extension — confirms it is a vector; note the node ID

Note all localhost image URLs from the design context — these are needed for Tier 2
extraction if the REST API is unavailable.

---

## Step 2 — Extract at the Highest Available Fidelity

Use this **four-tier decision tree**. Start at Tier 1. Move to the next tier only if
the previous one is unavailable for this specific asset.

```
Do you have the FILE_KEY?
├─ YES → Use Tier 1 (REST API). Always the best.
└─ NO  → Did figma_get_design_context include a localhost URL for this asset?
          ├─ YES → Use Tier 2 (download localhost URL to disk).
          └─ NO  → Can you get a clean node screenshot?
                    ├─ YES → Use Tier 3 (figma_get_screenshot per node).
                    └─ NO  → Use Tier 4 (CSS gradient/color placeholder as last resort,
                              with a TODO comment to replace later).
```

**After completing Phase 4, if you used Tier 2 or Tier 3 for any asset:**

> Tell the user: "The following assets were extracted at reduced quality because the
> Figma file key was not available: [list]. To replace them with the original
> source files, run the Tier 1 REST API commands in Step 2a once you have the file key."

---

### Tier 1 — REST API (Highest Fidelity)

**Requires:** `FILE_KEY` and `FIGMA_TOKEN`.

#### Method A — Original Image Fills

Use this to download **photos, textures, and raster images** that were uploaded to
Figma (identified by `imageRef` in node fill data). Returns the original source file
at its native resolution — never a re-render.

```bash
# Step A.1 — Get all image fill URLs in the file
curl -s \
  -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/images" \
  -o /tmp/figma_image_fills.json

# Response: { "images": { "<imageRef>": "<cdn-url>", ... } }

# Step A.2 — Get node fill data to match imageRef → node
curl -s \
  -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/nodes?ids=$NODE_IDS" \
  -o /tmp/figma_nodes.json
# In the response, look for: "fills": [{ "type": "IMAGE", "imageRef": "abc123" }]
# Match "abc123" → URL from figma_image_fills.json

# Step A.3 — Download to assets folder
mkdir -p src/assets/images src/assets/icons
IMAGE_URL=$(jq -r '.images["<imageRef>"]' /tmp/figma_image_fills.json)
curl -sL "$IMAGE_URL" -o src/assets/images/hero-background.jpg
```

> **URL expiry:** image fill URLs expire in **14 days**. Download during the session.

#### Method B — Node Export (SVG, PNG, JPG)

Use this to export **any node** as SVG, PNG, or JPG. Best for logos, custom icons,
vector illustrations, and raster compositions.

```bash
mkdir -p src/assets/images src/assets/icons

# SVG export (vectors — logos, icons, illustrations)
curl -s \
  -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=$NODE_IDS&format=svg&svg_outline_text=false&contents_only=true" \
  -o /tmp/figma_svg_export.json

jq -r '.images | to_entries[] | "\(.key)\t\(.value)"' /tmp/figma_svg_export.json | \
while IFS=$'\t' read -r nodeId url; do
  filename="$(echo "$nodeId" | tr ':' '-').svg"
  curl -sL "$url" -o "src/assets/icons/$filename"
  echo "Downloaded $nodeId → src/assets/icons/$filename"
done

# PNG export at 2× (raster compositions, hero banners)
curl -s \
  -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=$NODE_IDS&format=png&scale=2&contents_only=true" \
  -o /tmp/figma_png_export.json

jq -r '.images | to_entries[] | "\(.key)\t\(.value)"' /tmp/figma_png_export.json | \
while IFS=$'\t' read -r nodeId url; do
  filename="$(echo "$nodeId" | tr ':' '-').png"
  curl -sL "$url" -o "src/assets/images/$filename"
done
```

**Key export parameters:**

| Parameter          | Value   | When to use                                          |
| ------------------ | ------- | ---------------------------------------------------- |
| `format`           | `svg`   | Logos, icons, vector illustrations                   |
| `format`           | `png`   | Hero backgrounds, thumbnails — always pair `scale=2` |
| `format`           | `jpg`   | Photos without transparency — use `scale=2`          |
| `scale`            | `2`     | **Always for PNG/JPG** — retina-quality output       |
| `svg_outline_text` | `false` | Keep text as `<text>` elements (smaller, accessible) |
| `contents_only`    | `true`  | Render the node in isolation (default)               |

> **Export URL expiry:** export URLs expire in **30 days**. Download immediately.

---

### Tier 2 — Localhost URL Download (Desktop MCP Fallback)

**Use when:** the file key is unavailable and `figma_get_design_context` returned
localhost URLs (e.g. `http://localhost:3845/assets/abc123.png`).

These URLs are served by the Figma desktop app's in-memory renderer and are accessible
via `curl` during the active Figma session. They are **not** the original source file
(they are a renderer output), but they are substantially better than placeholders and
can be committed to the repository.

```bash
mkdir -p src/assets/images src/assets/icons

# Extract localhost URLs from a design context output and download them
# Replace <localhost-url> with the actual URL found in figma_get_design_context output
curl -sL "http://localhost:3845/assets/<hash>.png" -o src/assets/images/hero-background.png
curl -sL "http://localhost:3845/assets/<hash>.svg" -o src/assets/icons/logo.svg
```

**Finding localhost URLs in design context output:**

In the React+Tailwind code returned by `figma_get_design_context`, look for:

- `const imgXxx = "http://localhost:3845/assets/<hash>.<ext>";` at the top of the output
- `<img src={imgXxx} />` or `background-image` references inline

Each `const` at the top is an image asset. Note its variable name, the URL, and which
Figma node it belongs to (from context around the `<img>` tag).

**Limitations of Tier 2 assets:**

- Raster renders — vectors become PNGs, not SVGs
- Renderer resolution (typically 2×) — adequate for most uses
- Expire when the Figma desktop app closes — **must be downloaded before closing Figma**
- Must be renamed from `<hash>.png` to descriptive names before committing

**Commit as-is** — they are real assets. Add a comment in the asset manifest:

```typescript
// TODO: Replace with Tier 1 REST API export once FILE_KEY is available
heroBg: 'assets/images/hero-background.png', // extracted from Figma session
```

---

### Tier 3 — `figma_get_screenshot` per Node

**Use when:** no file key AND no localhost URLs were produced for a specific node.

`figma_get_screenshot` renders any currently-selected Figma node as a PNG screenshot.
Ask the user to select each image node in Figma, then call the tool.

```
// 1. Ask: "In Figma, please click the [Hero Background] layer to select it."
// 2. After confirmation:
figma_get_screenshot({})
// 3. The returned image is a 1× screen-capture PNG. Save it to src/assets/images/.
```

**Limitations:**

- 1× resolution — suitable as a placeholder but blurry on retina screens
- Rasterizes all vectors — logos become PNGs
- May include surrounding canvas elements

Label these assets clearly in the manifest:

```typescript
// TODO: Re-export at 2× via Tier 1 or Tier 2 — current version is 1× screen capture
heroBg: 'assets/images/hero-background.png',
```

---

### Tier 4 — CSS Fallback (Last Resort Only)

**Use only when** an asset is confirmed to be a pure color fill or a gradient — not when
an image exists in Figma but extraction failed. Never use Tier 4 because extraction
feels difficult.

```scss
// Only acceptable when the Figma layer is genuinely a gradient, not a photo
.hero-banner {
  // TODO: Replace with real asset — extraction blocked (no file key, no session URL)
  background: linear-gradient(135deg, #0d1b3e 0%, #1a0533 100%);
}
```

If you use Tier 4, add the `TODO` comment and include it in the post-session handoff
notes to the user.

---

## Step 3 — Build an Asset Manifest

After extraction, create a manifest so the implementation phase uses consistent paths:

```typescript
// src/app/<page>/_assets.ts — generated during Phase 1h

export const PAGE_ASSETS = {
  // Figma node 123:456 — "Hero/Background" layer
  // Tier 1: REST API PNG export at 2×
  heroBg: 'assets/images/hero-background.jpg',

  // Figma node 789:012 — "_Logo/Main" layer
  // Tier 1: REST API SVG export
  logo: 'assets/icons/logo.svg',

  // Figma node 345:678 — "Card/Thumbnail" layer
  // Tier 2: localhost URL download (TODO: re-export via REST API)
  cardThumbnail: 'assets/images/card-thumbnail.png',
} as const;
```

Name files by layer purpose, not by node ID.

---

## Step 4 — Angular Usage Patterns

### Static images via `NgOptimizedImage`

```html
<!-- Preferred: NgOptimizedImage for LCP/CLS optimization -->
<img ngSrc="assets/images/hero-background.jpg" width="1440" height="600" alt="Dashboard hero background" priority />
```

Import `NgOptimizedImage` in the component's `imports` array. Note: `NgOptimizedImage`
does **not** work for inline base64 images.

### Background images via SCSS

```scss
.dashboard-hero {
  background-image: url('/assets/images/hero-background.jpg');
  background-size: cover;
  background-position: center;
}
```

### Inline SVG logos

```html
<img src="assets/icons/logo.svg" alt="Company logo" width="120" height="40" />
```

### Igx-icon for kit icons (do NOT extract as assets)

Standard Material icons and `imx-icons` (Material Icons Extended) are registered at
runtime — never extract them as image files:

```html
<igx-icon>settings</igx-icon> <igx-icon family="imx-icons" name="credit-cards"></igx-icon>
```

See `figma-component-map.md § Material Icons Extended` for setup.

---

## Pitfalls

| Pitfall                                                      | Consequence                                                      | Fix                                                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Skipping asset extraction entirely (gradient placeholders)   | Implementation looks nothing like the design; Phase 5 fails      | Always use at least Tier 2 or Tier 3 — never skip                                      |
| Not asking for the file key before starting extraction       | Defaults to Tier 2/3 when Tier 1 was actually possible           | Ask for the file key at the start of Phase 1h (see Step 0)                             |
| Using localhost URLs without downloading them in the session | URLs expire when Figma closes; assets become broken              | Download with `curl` immediately; commit the files                                     |
| Naming assets by node ID ("node-123-456.png")                | Unmaintainable; breaks if Figma is reorganized                   | Name by layer purpose: `hero-background.jpg`, `company-logo.svg`                       |
| Using `figma_get_screenshot` for SVG logos                   | Logo is rasterized to PNG; loses vector scalability              | Use Tier 1 Method B with `format=svg` instead; fall back to Tier 2 only if unavailable |
| Exporting PNG at `scale=1`                                   | Blurry on HiDPI/retina screens                                   | Always use `scale=2`                                                                   |
| Storing Figma CDN export URLs in source code                 | URLs expire in 14–30 days; breaks production                     | Only store local `src/assets/...` paths in code                                        |
| Downloading SVG with `svg_outline_text=true` (default)       | All text converted to paths; larger file; no accessibility       | Set `svg_outline_text=false`                                                           |
| Extracting Ignite UI component instances as images           | Produces a static screenshot instead of an interactive component | Identify layer names from `figma-component-map.md`; those are components, not assets   |
| Extracting background colors or gradients as images          | Inflates bundle size, breaks theming                             | Colors → CSS custom properties or Ignite UI theming tokens                             |
| Not creating asset directories before running curl           | Writes fail silently or to the wrong path                        | Always run `mkdir -p src/assets/images src/assets/icons` first                         |
| Large SVGs from complex illustrations                        | Slow render, large bundle                                        | Consider PNG for illustrations > 50KB as SVG; SVG is best for logos and icons          |
