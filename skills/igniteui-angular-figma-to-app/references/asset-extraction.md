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

**Reuse the file key from Phase 1** when you already have it (the remote Figma server
always has one). Otherwise, ask the user for it at the start of Phase 1h:

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

**A Figma personal access token** is needed for REST calls. The Figma MCP servers do not
use one, so this is a separate token (see `mcp-setup.md § Personal access token`). Ask the
user to export it in the agent's shell, and never write it into a project file:

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
>   (Indigo.Design UI Kit component instances → implement as IgxXxx components), and any
>   other layer that Table A maps to a component — `Button`, `Text field`, … from any kit
> - Icon glyphs available from a registerable package (Material Icons Extended, Material
>   Symbols, Lucide, Fluent, …; see `figma-component-map.md § Icons from other kits`) —
>   register them with `IgxIconService` and render `<igx-icon>` instead
> - Artboard/frame boundaries themselves

### Size heuristic

Large rectangles (width > 200px or height > 200px) at key layout positions (hero area,
sidebar background, card thumbnail slot) are almost always image fills.

Small nodes (< 48×48px) named with icon-like names are usually SVG icons.

### Confirm with design context

For ambiguous nodes, look at the `figma_get_design_context` output for the artboard.
Each image asset appears as either:

- An `<img>` with an asset URL (`http://localhost:3845/assets/...` on desktop, an https URL on remote) — confirms it is a raster fill; note the node ID
- Inline SVG or an `<img>` with `.svg` extension — confirms it is a vector; note the node ID

Note all asset URLs from the design context — these are needed for Tier 2 extraction if
the REST API is unavailable.

---

## Step 2 — Extract at the Highest Available Fidelity

Use this **four-tier decision tree**. Start at Tier 1. Move to the next tier only if
the previous one is unavailable for this specific asset.

```
Do you have BOTH the FILE_KEY and a FIGMA_TOKEN (REST API personal access token)?
├─ YES → Use Tier 1 (REST API). Always the best.
└─ NO  → Did figma_get_design_context return a download URL for this asset?
          (desktop server: http://localhost:3845/assets/…; remote server: short-lived https URLs)
          ├─ YES → Use Tier 2 (download that URL to disk now).
          └─ NO  → Can you render the node on its own?
                    ├─ YES → Use Tier 3 (figma_get_screenshot per node).
                    └─ NO  → Use Tier 4 (CSS gradient/color placeholder as last resort,
                              with a TODO comment to replace later).
```

The remote server also offers `figma_download_assets` (up to 20 nodes per call, exports
and original images). If it is in the tool list, use it for Tier 2 when there is no
FIGMA_TOKEN.

**After completing Phase 4, if you used Tier 2 or Tier 3 for any asset:**

> Tell the user: "The following assets were extracted at reduced quality because the
> Figma REST API was not available (no file key or no personal access token): [list]. To
> replace them with the original source files, run the Tier 1 REST API commands once you
> have both."

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

### Tier 2 — Design-Context Asset URLs

**Use when:** Tier 1 is unavailable and `figma_get_design_context` returned download URLs.
The desktop server returns localhost URLs (e.g. `http://localhost:3845/assets/abc123.png`);
the remote server returns short-lived https URLs. The steps below are the same for both.

On the desktop server these URLs are served by the Figma desktop app's in-memory renderer
and work only during the active Figma session. On the remote server they are https URLs
that expire after a short time. Either way they are **not** the original source file
(they are a renderer output), but they are substantially better than placeholders and
can be committed to the repository.

```bash
mkdir -p src/assets/images src/assets/icons

# Download the asset URLs found in the figma_get_design_context output
# (desktop: localhost URLs as below; remote: the https URLs, downloaded the same way)
curl -sL "http://localhost:3845/assets/<hash>.png" -o src/assets/images/hero-background.png
curl -sL "http://localhost:3845/assets/<hash>.svg" -o src/assets/icons/logo.svg
```

**Finding asset URLs in design context output** (desktop examples; remote URLs are https):

In the React+Tailwind code returned by `figma_get_design_context`, look for:

- `const imgXxx = "http://localhost:3845/assets/<hash>.<ext>";` at the top of the output
- `<img src={imgXxx} />` or `background-image` references inline

Each `const` at the top is an image asset. Note its variable name, the URL, and which
Figma node it belongs to (from context around the `<img>` tag).

**Limitations of Tier 2 assets:**

- Usually raster renders. When the context offers an SVG URL for a vector, download it as SVG
- Renderer resolution (typically 2×) — adequate for most uses
- Short-lived — desktop URLs die when the Figma desktop app closes, remote URLs expire after a while. **Download them immediately**
- Must be renamed from `<hash>.png` to descriptive names before committing

**Commit as-is** — they are real assets. Add a comment in the asset manifest:

```typescript
// TODO: Replace with Tier 1 REST API export once FILE_KEY and FIGMA_TOKEN are available
heroBg: 'assets/images/hero-background.png', // extracted from Figma session
```

---

### Tier 3 — `figma_get_screenshot` per Node

**Use when:** neither Tier 1 nor Tier 2 produced the asset.

`figma_get_screenshot` renders a single node. Address the node the same way as in Phase 1
(`figma-exploration.md § Before the First Call`):

```
// Remote server
figma_get_screenshot({ fileKey: "<fileKey>", nodeId: "<imageNodeId>" })
// Desktop server: the node ID (check the image), or ask the user to select the layer
figma_get_screenshot({ nodeId: "<imageNodeId>" })
figma_get_screenshot({})
// The returned image is a screen-capture PNG. Save it to src/assets/images/.
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
  // Tier 2: design-context asset URL (TODO: re-export via REST API)
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
| Using design-context asset URLs without downloading them in the session | The URLs are short-lived; assets become broken              | Download with `curl` immediately; commit the files                                     |
| Naming assets by node ID ("node-123-456.png")                | Unmaintainable; breaks if Figma is reorganized                   | Name by layer purpose: `hero-background.jpg`, `company-logo.svg`                       |
| Using `figma_get_screenshot` for SVG logos                   | Logo is rasterized to PNG; loses vector scalability              | Use Tier 1 Method B with `format=svg` instead; fall back to Tier 2 only if unavailable |
| Exporting PNG at `scale=1`                                   | Blurry on HiDPI/retina screens                                   | Always use `scale=2`                                                                   |
| Storing Figma CDN export URLs in source code                 | URLs expire in 14–30 days; breaks production                     | Only store local `src/assets/...` paths in code                                        |
| Downloading SVG with `svg_outline_text=true` (default)       | All text converted to paths; larger file; no accessibility       | Set `svg_outline_text=false`                                                           |
| Extracting Ignite UI component instances as images           | Produces a static screenshot instead of an interactive component | Identify layer names from `figma-component-map.md`; those are components, not assets   |
| Extracting background colors or gradients as images          | Inflates bundle size, breaks theming                             | Colors → CSS custom properties or Ignite UI theming tokens                             |
| Not creating asset directories before running curl           | Writes fail silently or to the wrong path                        | Always run `mkdir -p src/assets/images src/assets/icons` first                         |
| Large SVGs from complex illustrations                        | Slow render, large bundle                                        | Consider PNG for illustrations > 50KB as SVG; SVG is best for logos and icons          |
