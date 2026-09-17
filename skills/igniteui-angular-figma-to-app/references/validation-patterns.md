# Playwright Visual Validation Patterns

> **Part of the [`igniteui-angular-figma-to-app`](../SKILL.md) skill.**
>
> Use this file in Phase 5 for the measurement-driven validation loop. Read in full
> before calling any Playwright MCP tool.

---

## Core Philosophy

**Measure, don't eyeball.** The goal is not visual regression (did this change from last week?) but design fidelity (does this match the Figma spec?).
Screenshots give you the gestalt. `playwright_browser_evaluate` gives you the numbers. Numbers drive corrections.

---

## Phase 5 Tool Sequence

```
1. playwright_browser_navigate → open the app at the target route
2. playwright_browser_resize   → match the Figma artboard dimensions
3. playwright_browser_navigate → re-navigate after resize (required — see pitfall below)
4. playwright_browser_take_screenshot → capture the full viewport
5. [Visual comparison] → compare against Phase 1c Figma screenshot section by section
6. playwright_browser_evaluate → measure exact CSS values for EVERY section in the
   Phase 1g Surfaces table (mandatory, not just differing regions)
7. [Surfaces audit] → assert each section's backgroundColor, border, padding against spec
8. [Action controls audit] → count and name all action buttons; compare against Phase 1d inventory
9. [Input type audit] → check igx-input-group class modifier on all form controls
10. [Classify mismatches] → severity table
11. [Apply fixes] → edit source files
12. playwright_browser_navigate → reload after fixes
13. playwright_browser_take_screenshot → re-verify
14. Repeat steps 5-13 until no Critical/Major issues remain
15. Do NOT advance to the next artboard until all checks pass on the current page
16. playwright_browser_snapshot → final accessibility check (once per session)
```

---

## Known Pitfalls

### 1. Viewport Reset After Resize

**Problem:** After calling `playwright_browser_resize`, the browser navigates itself to `about:blank`. Subsequent screenshots and measurements return empty results.

**Fix:** Always call `playwright_browser_navigate` to re-navigate to the target URL immediately after `playwright_browser_resize`. Never assume the page survives a resize.

```
playwright_browser_resize({ width: 1440, height: 900 })
playwright_browser_navigate({ url: "http://localhost:4200/dashboard" })
// NOW safe to screenshot and measure
playwright_browser_take_screenshot({ type: "png" })
```

### 2. `playwright_browser_evaluate` Uses `function`, Not `script`

**Problem:** The `playwright_browser_evaluate` tool requires a `function` parameter
(a JavaScript function string), **not** `script`. Passing `script` causes a validation
error: _"Invalid input: expected string, received undefined"_.

**Fix:** Always use the `function` parameter with a self-contained arrow function string.

```
// WRONG — causes validation error
playwright_browser_evaluate({ script: "return document.title;" })

// CORRECT
playwright_browser_evaluate({ function: "() => document.title" })
playwright_browser_evaluate({ function: "() => { var el = document.querySelector('h1'); return el ? el.textContent : null; }" })
```

### 3. Dev Server Must Be Running First

Check for console errors immediately after navigating to catch startup failures:

```
playwright_browser_navigate({ url: "http://localhost:4200" })
playwright_browser_console_messages()
```

If you see `ERR_CONNECTION_REFUSED` or the page is blank, ask the user to run `npm start` before retrying.

---

## Reusable Measurement Snippets

All snippets use the `function` parameter for `playwright_browser_evaluate`.

### Measure a Single Element

```javascript
playwright_browser_evaluate({
  function: "() => { var el = document.querySelector('<YOUR_SELECTOR>'); if (!el) return { error: 'element not found' }; var s = getComputedStyle(el); var r = el.getBoundingClientRect(); return { fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, color: s.color, backgroundColor: s.backgroundColor, padding: s.padding, margin: s.margin, gap: s.gap, borderRadius: s.borderRadius, border: s.border, borderColor: s.borderColor, borderWidth: s.borderWidth, width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) }; }",
});
```

### Measure Gap Between Two Elements

```javascript
playwright_browser_evaluate({
  function: "() => { var a = document.querySelector('<SELECTOR_A>'); var b = document.querySelector('<SELECTOR_B>'); if (!a || !b) return { error: 'one or both elements not found' }; var ra = a.getBoundingClientRect(); var rb = b.getBoundingClientRect(); return { gapBetween: Math.round(rb.top - ra.bottom), elementAHeight: Math.round(ra.height), elementBTop: Math.round(rb.top) }; }",
});
```

### Count Child Elements (duplicate icon detection)

```javascript
playwright_browser_evaluate({
  function: "() => { var container = document.querySelector('<CONTAINER_SELECTOR>'); if (!container) return { error: 'container not found' }; return { totalChildren: container.children.length, svgCount: container.querySelectorAll('svg').length, buttonCount: container.querySelectorAll('button').length, iconCount: container.querySelectorAll('igx-icon, .igx-icon').length }; }",
});
```

### Measure Typography Scale

```javascript
playwright_browser_evaluate({
  function: "() => { var selectors = ['h1', 'h2', 'h3', 'p', '.subtitle', '.caption']; var result = {}; selectors.forEach(function(sel) { var el = document.querySelector(sel); if (el) { var s = getComputedStyle(el); result[sel] = { fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, fontFamily: s.fontFamily }; } }); return result; }",
});
```

### Measure Grid Layout Proportions

```javascript
playwright_browser_evaluate({
  function: "() => { var layout = document.querySelector('<LAYOUT_CONTAINER_SELECTOR>'); if (!layout) return { error: 'layout container not found' }; var s = getComputedStyle(layout); return { display: s.display, gridTemplateColumns: s.gridTemplateColumns, gridTemplateRows: s.gridTemplateRows, gap: s.gap, width: Math.round(layout.getBoundingClientRect().width) }; }",
});
```

### Check Component Rendered State

```javascript
playwright_browser_evaluate({
  function: "() => { var el = document.querySelector('<igx-component-selector>'); if (!el) return { error: 'component not found' }; var attrs = {}; Array.prototype.forEach.call(el.attributes, function(a) { attrs[a.name] = a.value; }); return { attributes: attrs, classList: Array.prototype.slice.call(el.classList), childCount: el.children.length }; }",
});
```

### Surfaces Audit (run for EVERY page, EVERY section in Phase 1g Surfaces table)

For each surface entry, run:

```javascript
playwright_browser_evaluate({
  function: "() => { var sections = { /* fill from Phase 1g Surfaces table */ sectionA: '.section-a-selector', sectionB: '.section-b-selector' }; var result = {}; Object.keys(sections).forEach(function(key) { var el = document.querySelector(sections[key]); if (el) { var s = getComputedStyle(el); var r = el.getBoundingClientRect(); result[key] = { bg: s.backgroundColor, br: s.borderRadius, padding: s.padding, border: s.border, h: Math.round(r.height) }; } else { result[key] = 'NOT FOUND'; } }); return result; }",
});
```

**Assert for each entry:**

- If Figma surface has a background: `bg !== 'rgba(0, 0, 0, 0)'`
- If Figma section floats on page background: `bg === 'rgba(0, 0, 0, 0)'` (do not over-surface)
- `borderRadius`, `padding`, `border` match Phase 1g Surfaces table values

### Input Type Audit (run for every page with form controls)

```javascript
playwright_browser_evaluate({
  function: "() => { var controls = {}; ['igx-simple-combo', 'igx-combo', 'igx-date-picker', 'igx-date-range-picker', 'igx-select', 'igx-time-picker'].forEach(function(sel) { var el = document.querySelector(sel); if (el) { var group = el.querySelector('[class*=igx-input-group]'); controls[sel] = group ? Array.from(group.classList).filter(function(c) { return c.startsWith('igx-input-group'); }).join(' ') : 'no igx-input-group found'; } }); return controls; }",
});
```

Compare each result against the variant detected in Phase 1d. If all controls should be
`border`, add `{ provide: IGX_INPUT_GROUP_TYPE, useValue: 'border' }` to `app.config.ts`.

### Action Controls Audit (run for every page)

```javascript
playwright_browser_evaluate({
  function: "() => { var buttons = Array.from(document.querySelectorAll('button, [igxButton], [igxIconButton]')); return buttons.map(function(b) { return (b.textContent || '').trim().replace(/\\s+/g, ' ') || b.getAttribute('aria-label') || '(unlabeled)'; }).filter(function(t) { return t.length > 0; }); }",
});
```

Compare the returned list against Phase 1d's action controls inventory. Any button in
this list that is **not** in the Phase 1d inventory is fabricated and must be removed.

---

## Mismatch Severity Classification

| Severity     | Category                 | Decision rule                                           | Action                      |
| ------------ | ------------------------ | ------------------------------------------------------- | --------------------------- |
| **Critical** | Missing element          | Present in Figma, absent from DOM                       | Auto-fix                    |
| **Critical** | Broken layout            | Overlapping elements, content outside bounds            | Auto-fix                    |
| **Major**    | Wrong component          | Figma shows `igx-combo`, code has `igx-select`          | Auto-fix                    |
| **Major**    | Wrong variant            | `igxButton="flat"` when design shows `contained`        | Auto-fix                    |
| **Minor**    | Spacing off by > 4px     | `gap: 24px` measured, Figma shows `16px`                | Auto-fix if single property |
| **Minor**    | Font size wrong by > 2px | `16px` measured, Figma shows `14px`                     | Auto-fix                    |
| **Cosmetic** | Color shade              | `rgb(50, 50, 50)` vs `#333333` (identical perceptually) | Report only                 |
| **Cosmetic** | Spacing off by ≤ 4px     | Minor rounding or sub-pixel difference                  | Report only                 |

### Mismatch Report Format

For each issue found, produce:

```
ISSUE:    <concise description of the mismatch>
LOCATION: <component/section in the view>
FIGMA:    <value or description from the Figma design context>
RENDERED: <value measured by Playwright>
SEVERITY: <Critical | Major | Minor | Cosmetic>
FIX:      <specific, one-line code change — no vague instructions>
```

Example:

```
ISSUE:    Navbar background color does not match design
LOCATION: IgxNavbarComponent (top bar)
FIGMA:    background = #3F51B5 (Indigo 500)
RENDERED: background = rgb(63, 81, 181)   ← this is actually correct (same color)
SEVERITY: Cosmetic
FIX:      No change needed — rgb(63, 81, 181) = #3F51B5

ISSUE:    Grid header row height too large
LOCATION: igx-grid header
FIGMA:    header height = 40px
RENDERED: height = 56px
SEVERITY: Minor
FIX:      Call theming_get_component_design_tokens("grid"), find "header-background" or size
          token, then call theming_set_size({ component: "grid", size: "small" }) or
          theming_create_component_theme with a custom header height token.
```

---

## Section-by-Section Comparison Checklist

Run this checklist during the first screenshot comparison after implementation:

| Section              | What to check                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Top navigation       | Height, background color, logo/title alignment, action icon positions                                                                        |
| Sidebar / nav drawer | Width, background, item spacing, icon + label alignment, selected state; icon family (`imx-icons` vs standard)                               |
| Page header          | Typography size and weight, breadcrumb spacing, action button prominence                                                                     |
| Data table / grid    | Column widths, header background, row height, cell padding, border color                                                                     |
| Cards / panels       | **Background color** (must not be `rgba(0,0,0,0)` when surface exists in Figma), border, border radius, shadow, padding, divider             |
| Surface containers   | Every entry in Phase 1g Surfaces table: `backgroundColor`, `borderRadius`, `padding`, `border`; child elements enclosed within bounding rect |
| Form fields          | Input type variant (line/border/box) — check `igx-input-group--border` vs `--box` vs `--line` CSS class; run Input Type Audit snippet        |
| Action controls      | Count and name all buttons/toolbar actions; compare against Phase 1d inventory; remove any not in Figma                                      |
| Buttons              | Variant (flat/outlined/contained), color, typography, padding                                                                                |
| Charts               | Chart type, **series colors** (must match Figma — run `[brushes]` override if default colors used), legend position                          |
| Footer / paginator   | Alignment, spacing, font size                                                                                                                |

---

## Accessibility Snapshot Checks

After `playwright_browser_snapshot()`, verify:

| Check                 | What to look for                                             |
| --------------------- | ------------------------------------------------------------ |
| Heading hierarchy     | `h1` → `h2` → `h3` without skipping levels                   |
| Button labels         | All `<button>` elements have accessible text or `aria-label` |
| Input labels          | All form inputs are associated with a `<label>`              |
| Navigation landmark   | `<nav>` or `role="navigation"` wraps the main navigation     |
| Main content landmark | `<main>` or `role="main"` wraps the primary content region   |
| Image alt text        | All meaningful `<img>` elements have non-empty `alt`         |

---

## Common Fix Patterns

### Spacing, Size, and Roundness Correction

Do **not** patch internal component classes with `::ng-deep`. Those are implementation
details subject to change between versions.

Ignite UI components expose `--ig-size` and `--ig-spacing` CSS custom properties.
Scope them to the component's selector — or to a sub-component selector for compound
components — to adjust density and spacing without touching internal class names.

**Via theming MCP** (preferred — generates correctly scoped Sass or CSS output):

```
// Adjust size (density) for a specific component
theming_set_size({ component: "calendar", size: "small", platform: "angular" })

// Adjust spacing for a specific component (multiplier: 1.0 = default, 0.75 = slightly tighter)
theming_set_spacing({ component: "calendar", spacing: 0.75, platform: "angular" })

// Scope to a CSS selector instead of a component (e.g. a container class)
theming_set_size({ scope: ".compact-toolbar", size: "small", platform: "angular" })
```

**Directly in the component’s SCSS** (when the output is plain CSS):

```scss
// Single component
igx-calendar {
  --ig-size: var(--ig-size-small);
  --ig-spacing: 0.75;
}

// Compound component — scope to a sub-component selector
igx-grid-toolbar {
  --ig-size: var(--ig-size-small);
}
```

> **Multiplier reasoning:** the `--ig-spacing` value is relative to the default (1.0).
> Choose a value based on visual judgment — `0.75` for slightly tighter, `0.5` for
> compact — never by mapping a Figma pixel value directly.

### Typography size correction

```
// Re-check the typography doc, then update the SCSS
// Example: heading is 28px but should be 24px
// Check theming_get_component_design_tokens to find the right token,
// or override directly in the component's SCSS
.igx-navbar__title {
  font-size: 1.5rem;   // 24px
}
```

### Color correction via palette token

```
// Instead of hardcoding, use a CSS variable from the generated palette
background-color: var(--ig-primary-500);
color: var(--ig-primary-contrast-500);
```

### Missing element

If an element is in Figma but absent from the DOM, return to Phase 2 and re-read the component doc. The most common cause is a missing import or a content projection slot not being filled.
