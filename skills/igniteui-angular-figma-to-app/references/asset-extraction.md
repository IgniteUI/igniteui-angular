# Asset Extraction from Figma

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 1h to identify and extract image assets from Figma artboards
> before implementation. Read in full before calling any extraction tool.

---

## Two Fundamentally Different Types of Image Assets

Figma stores images in two distinct ways — understanding the difference is essential for choosing the right extraction method:

| Type             | What it is                                                                                                  | Figma signal                                                   | Best extraction method                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| **Image fill**   | A photo, texture, or raster image dragged/pasted into Figma. Stored as a fill on a RECTANGLE or FRAME node. | Layer has fill of type `IMAGE`; `imageRef` in node data        | REST API `/v1/files/:key/images` → original file  |
| **Vector asset** | A logo, icon, or illustration drawn in Figma using vector tools.                                            | Node type `VECTOR`, `BOOLEAN_OPERATION`, or `GROUP` of vectors | REST API `/v1/images/:key?format=svg` → clean SVG |

Do **not** confuse these with Ignite UI component instances — those get implemented as Angular components, not extracted as assets.

---

## Step 1 — Identify Image Nodes

### Naming patterns to look for in `figma_get_metadata`

Scan the XML returned by `figma_get_metadata` for layer names matching:

| Naming pattern                                     | Likely asset type | Action                                                 |
| -------------------------------------------------- | ----------------- | ------------------------------------------------------ |
| `_Image`, `_Photo`, `_Picture`, `image`, `photo`   | Raster image fill | Extract as PNG                                         |
| `_Hero`, `_Banner`, `_Cover`, `hero`, `banner`     | Large raster fill | Extract as PNG (2× scale)                              |
| `_Thumbnail`, `_Avatar`, `_Illustration`           | Raster image fill | Extract as PNG                                         |
| `_Logo`, `_Brand`, `logo`, `brand`                 | Vector or raster  | If vector: extract as SVG; if raster: PNG              |
| `_Icon/` prefix (custom icons not in igx-icon set) | Custom SVG icon   | Extract as SVG                                         |
| `_Background`, `_Bg`, `bg`, `background`           | Large raster fill | Extract as PNG (check if `igx-icon` can replace first) |
| `_Illustration`, `_Art`, `_Pattern`                | Vector or raster  | Classify before extracting                             |

> **Ignore these** — do NOT extract them as image assets:
>
> - Any layer whose name starts with `_Button`, `_Input`, `_Grid`, `_Card`, etc. from
>   the Indigo.Design UI Kit (those are component instances → implement as IgxXxx components)
> - `igx-icon` glyph nodes (use `<igx-icon>` in Angular instead)
> - Artboard/frame boundaries themselves

### Size heuristic

Large rectangles (width > 200px or height > 200px) at key layout positions (hero area, sidebar background, card thumbnail slot) are almost always image fills.

Small nodes (< 48×48px) named with icon-like names are usually SVG icons.

### Confirm classification with design context

For ambiguous nodes, call `figma_get_design_context` on the node and look for:

- `background-image: url(...)` or `src="..."` in the reference code → image fill
- Inline SVG markup or `<img>` with a `.svg` src → vector asset
- A localhost URL (e.g. `http://localhost:PORT/...`) in the response → image node confirmed; note the node ID for REST API extraction (do **not** use the localhost URL as the asset source)

---

## Step 2 — Always Extract at the Highest Fidelity

The extraction method is determined by **asset type** — never by speed or convenience.
Asset extraction is a one-time operation per build; sacrificing image quality here means shipping a blurry hero or a rasterized logo into production.

| Asset type                                                                  | Method                                                                   | Why it is the highest fidelity                                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Image fill — photo, texture, or raster image uploaded to Figma              | **Method A** — REST API original file (`/v1/files/:key/images`)          | Returns the **actual source file** at its native resolution; never a re-render |
| Vector asset — logo, icon, or illustration drawn in Figma with vector tools | **Method B** — REST API SVG export (`/v1/images/:key?format=svg`)        | Preserves infinite-scale vector fidelity; CSS-styleable; no rasterization loss |
| Raster node export — complex composition with no single `imageRef`          | **Method B** — REST API PNG at 2× (`/v1/images/:key?format=png&scale=2`) | Rendered at double resolution; retina-ready                                    |

### What NOT to use

Two MCP shortcuts appear convenient but produce strictly lower-quality output.
**Never use them for final assets.**

| Method                                                                            | Why it is insufficient                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `figma_get_screenshot`                                                            | Produces a 1× screen-capture — not the original file. Vectors are rasterized. May include drop shadows or siblings from the canvas. Use it only as a temporary visual reference for yourself while exploring the design, never as the extracted asset. |
| Localhost URLs from `figma_get_design_context` (e.g. `http://localhost:3845/...`) | Served by the Figma desktop app's in-memory renderer. Expire the moment the Figma app closes. Cannot be committed to the repo. Do not reflect original resolution or format.                                                                           |

If `figma_get_design_context` returns a localhost image URL, **use it only to confirm the node identity** — note the node ID, then immediately run Method A or B to get the real asset. Never put a localhost URL in an Angular template or SCSS file.

---

### Method A — REST API: Original Image Fills

Use this to download the **original raster images** that were uploaded to Figma.
Best for: photos, textures, raster logos — where you want the source file, not a rendering.

#### Step A — Get all image fill URLs for the file

```bash
curl -s \
  -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/images" \
  | tee /tmp/figma_image_fills.json
```

Response format:

```json
{
  "images": {
    "abc123def": "https://s3.amazonaws.com/figma-alpha-api/img/...png",
    "xyz789ghi": "https://s3.amazonaws.com/figma-alpha-api/img/...jpg"
  }
}
```

The keys are **image reference IDs** (`imageRef`) — these appear in node fill data.

#### Step B — Match imageRefs to node IDs

To know which node uses which imageRef, call the REST API for the specific nodes:

```bash
curl -s \
  -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/nodes?ids=$NODE_IDS" \
  | tee /tmp/figma_nodes.json
```

In the response, look for:

```json
"fills": [
  {
    "type": "IMAGE",
    "imageRef": "abc123def",
    "scaleMode": "FILL"
  }
]
```

Match `imageRef` → URL from Step A.

#### Step C — Download to assets folder

```bash
# Create the assets directory if it doesn't exist
mkdir -p src/assets/images

# Download (example for a specific imageRef URL)
IMAGE_URL=$(jq -r '.images["abc123def"]' /tmp/figma_image_fills.json)
curl -sL "$IMAGE_URL" -o src/assets/images/hero-photo.jpg
```

> **URL expiry:** image fill URLs expire in **14 days**. Download them during the
> implementation session; do not store the URLs in code.

---

### Method B — REST API: Node Export (any format, any scale)

Use this to export **any node** as PNG, JPG, SVG, or PDF at any scale.
Best for: SVG icon/logo export, retina-quality PNG, vector illustrations.

```bash
# Export multiple nodes at once (recommended — batches in one API call)
curl -s \
  -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=$NODE_IDS&format=png&scale=2&contents_only=true" \
  | tee /tmp/figma_export.json

# Response: { "images": { "123:456": "https://s3.url...", "789:012": "https://..." } }
# Download each URL to the right path
jq -r '.images | to_entries[] | "\(.key)\t\(.value)"' /tmp/figma_export.json | \
while IFS=$'\t' read -r nodeId url; do
  # Convert nodeId to a safe filename: "123:456" → "node-123-456"
  filename="node-$(echo "$nodeId" | tr ':' '-')"
  curl -sL "$url" -o "src/assets/images/$filename.png"
  echo "Downloaded $nodeId → src/assets/images/$filename.png"
done
```

**For SVG export** (logos, icons, illustrations):

```bash
curl -s \
  -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=$NODE_IDS&format=svg&svg_outline_text=false&contents_only=true" \
  | tee /tmp/figma_svg_export.json

# Download and save
jq -r '.images | to_entries[] | "\(.key)\t\(.value)"' /tmp/figma_svg_export.json | \
while IFS=$'\t' read -r nodeId url; do
  filename="node-$(echo "$nodeId" | tr ':' '-')"
  curl -sL "$url" -o "src/assets/icons/$filename.svg"
  echo "Downloaded $nodeId → src/assets/icons/$filename.svg"
done
```

> **Export URL expiry:** rendered export URLs expire in **30 days**. Download immediately.

**Key parameters for `/v1/images/:key`:**

| Parameter          | Value            | When to use                                                                          |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------ |
| `format`           | `png`            | Raster images, backgrounds, thumbnails — always pair with `scale=2`                  |
| `format`           | `svg`            | Logos, icons, vector illustrations — always the right choice for drawn vectors       |
| `format`           | `jpg`            | Photos where file size matters and no transparency is needed — use `scale=2`         |
| `scale`            | `2`              | **Always use this for PNG and JPG.** Retina-quality; HTML/CSS displays at half size. |
| `scale`            | `1`              | Only acceptable when the design is explicitly 1× and retina is not a concern.        |
| `svg_outline_text` | `false`          | Keeps SVG text as `<text>` elements (selectable, smaller file)                       |
| `svg_outline_text` | `true` (default) | Converts text to paths (exact match to Figma rendering)                              |
| `contents_only`    | `true` (default) | Renders the node in isolation                                                        |
| `contents_only`    | `false`          | Includes overlapping sibling content                                                 |

---

## Step 3 — Build an Asset Manifest

After extraction, maintain an asset manifest so the implementation phase knows exactly where each asset lives. Add it as a comment at the top of the component's SCSS file, or as a `_assets.ts` constant file:

```typescript
// src/app/dashboard/_assets.ts — generated during Figma asset extraction

export const DASHBOARD_ASSETS = {
  // Figma node 123:456 — "Hero/Background" layer
  heroBg: 'assets/images/hero-background.jpg',

  // Figma node 789:012 — "_Logo/Main" layer
  logo: 'assets/icons/logo.svg',

  // Figma node 345:678 — "Card/Thumbnail" layer
  cardThumbnail: 'assets/images/card-thumbnail.png',
} as const;
```

Name files descriptively based on the Figma layer name, not the Figma node ID.

---

## Step 4 — Angular Usage Patterns

### Static images via `ngOptimizedImage`

For images where you control the `src` (photos, thumbnails, hero images):

```html
<!-- Preferred: ngOptimizedImage for LCP/CLS optimization -->
<img ngSrc="assets/images/hero-background.jpg" width="1440" height="600" alt="Dashboard hero background" priority />
```

Import `NgOptimizedImage` in the component's `imports` array.

### Background images via SCSS

For decorative background images (no alt text needed):

```scss
.dashboard-hero {
  background-image: url('/assets/images/hero-background.jpg');
  background-size: cover;
  background-position: center;
}
```

### Inline SVG for logos/icons that need CSS control

```html
<!-- Direct <img> for SVG logos -->
<img src="assets/icons/logo.svg" alt="Company logo" width="120" height="40" />

<!-- Or Angular component that inlines SVG for color control -->
```

### Igx-icon for Ignite UI icons (do NOT use custom assets)

If the Figma design uses icons from the standard Ignite UI icon set (Material icons):

```html
<igx-icon>settings</igx-icon> <igx-icon family="material">arrow_forward</igx-icon>
```

Never extract these as SVG/PNG assets — they are rendered by the `igx-icon` component.

---

## Pitfalls

| Pitfall                                                              | Consequence                                                       | Fix                                                                                  |
| -------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Using `figma_get_screenshot` as the extracted asset                  | 1× screen-capture — rasterizes vectors, loses original resolution | Always use Method A or B via the REST API                                            |
| Using localhost URLs from `figma_get_design_context` as assets       | Expire when Figma closes; can't be committed                      | Use localhost URLs only to identify the node ID, then run REST API extraction        |
| Extracting Ignite UI component instances as images                   | Produces a static screenshot instead of an interactive component  | Identify layer names from `figma-component-map.md`; those are components, not assets |
| Downloading SVGs with `svg_outline_text=true` (default)              | All text converted to paths; larger file; no accessibility        | Set `svg_outline_text=false` for logos and icons meant to be used in code            |
| Exporting PNG at `scale=1`                                           | Blurry on HiDPI/retina screens                                    | Always use `scale=2`; reference at half size in HTML (`width` / 2)                   |
| Storing Figma export URLs in source code                             | URLs expire in 14–30 days; breaks production                      | Only store the local `src/assets/...` paths in code                                  |
| Naming assets by node ID ("node-123-456.png")                        | Unmaintainable, breaks if Figma is reorganized                    | Name by layer purpose: `hero-background.jpg`, `company-logo.svg`                     |
| Extracting background colors as images                               | Inflates bundle size, breaks theming                              | Colors → use CSS custom properties or Ignite UI theming tokens                       |
| Not creating `src/assets/images/` and `src/assets/icons/` dirs first | `curl` write fails silently or to wrong path                      | Always run `mkdir -p src/assets/images src/assets/icons` first                       |
| Large SVGs from complex illustrations                                | Slow render, large bundle                                         | Consider PNG for illustrations > 50KB SVG; SVG is best for logos/icons               |
