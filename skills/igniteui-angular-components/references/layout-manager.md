# Layout Manager, Dock Manager & Tile Manager

> **Part of the [`igniteui-angular-components`](../SKILL.md) skill hub.**
> For app setup, providers, and import patterns — see [`setup.md`](./setup.md).

## Contents

- [Layout Manager Directives](#layout-manager-directives)
- [Dock Manager](#dock-manager)
- [Tile Manager](#tile-manager)

## Overview
This reference gives high-level guidance on when to use each layout manager component, their key features, and common API members. For detailed documentation, call `get_doc` and `get_api_reference` from `igniteui-cli` with the specific component or feature you're interested in.

---

## Layout Manager Directives

The Layout Manager is a pair of Angular directives (`igxLayout` / `igxFlex`) that wrap CSS Flexbox. Apply `igxLayout` to any container to control its children's flow; apply `igxFlex` to individual children to control their flex properties.

```typescript
import { IgxLayoutDirective, IgxFlexDirective } from 'igniteui-angular/directives';
```

```html
<!-- Basic row layout -->
<div igxLayout igxLayoutDir="row" igxLayoutJustify="space-between">
  <div igxFlex>Item 1</div>
  <div igxFlex>Item 2</div>
  <div igxFlex>Item 3</div>
</div>
```

### Common Layout Patterns

#### App Shell (Sidebar + Content)

```html
<div igxLayout igxLayoutDir="row" style="height: 100vh;">

  <!-- Sidebar column -->
  <div igxFlex igxFlexGrow="0" igxFlexShrink="0" igxFlexBasis="240px"
       igxLayout igxLayoutDir="column" class="sidebar">
    <div igxFlex>Nav item 1</div>
    <div igxFlex>Nav item 2</div>
  </div>

  <!-- Main content column -->
  <div igxFlex igxLayout igxLayoutDir="column" class="main">
    <div igxFlex igxFlexGrow="0" class="header">Header</div>
    <div igxFlex class="body">
      <!-- Nested row -->
      <div igxLayout igxLayoutDir="row">
        <div igxFlex>Col 1</div>
        <div igxFlex>Col 2</div>
        <div igxFlex>Col 3</div>
      </div>
    </div>
    <div igxFlex igxFlexGrow="0" class="footer">Footer</div>
  </div>

</div>
```

#### Centered Content

```html
<div igxLayout igxLayoutDir="row" igxLayoutJustify="center" igxLayoutItemAlign="center"
     style="height: 100vh;">
  <div igxFlex igxFlexGrow="0">Centered content</div>
</div>
```

#### Wrapping Tiles

```html
<div igxLayout igxLayoutDir="row" igxLayoutWrap="wrap" igxLayoutJustify="flex-start">
  @for (item of items; track item.id) {
    <div igxFlex igxFlexBasis="200px" igxFlexGrow="0" class="tile">
      {{ item.title }}
    </div>
  }
</div>
```

### `igxLayout` Directive Inputs

| Input | Values | Default | Description |
|---|---|---|---|
| `igxLayoutDir` | `'row'` \| `'column'` | `'row'` | Flex direction |
| `igxLayoutReverse` | `true` \| `false` | `false` | Reverse flow order |
| `igxLayoutWrap` | `'nowrap'` \| `'wrap'` \| `'wrap-reverse'` | `'nowrap'` | Child wrapping |
| `igxLayoutJustify` | `'flex-start'` \| `'center'` \| `'flex-end'` \| `'space-between'` \| `'space-around'` | `'flex-start'` | Main axis alignment |
| `igxLayoutItemAlign` | `'flex-start'` \| `'center'` \| `'flex-end'` \| `'stretch'` \| `'baseline'` | `'stretch'` | Cross axis alignment |

### `igxFlex` Directive Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `igxFlexGrow` | `number` | `1` | How much the element grows to fill space |
| `igxFlexShrink` | `number` | `1` | How much the element shrinks when space is limited |
| `igxFlexBasis` | `string` | `'auto'` | Initial main-axis size (e.g., `'200px'`, `'30%'`) |
| `igxFlexOrder` | `number` | `0` | Visual order among siblings |

### Key Rules for Layout Manager

- `igxLayout` affects its **immediate children only** — nest multiple `igxLayout` containers for deeper control
- Combine `igxLayoutDir="column"` on the outer container with `igxFlex` on children to create page shells
- `igxFlexGrow="0"` on headers/footers/sidebars prevents them from stretching; leave it at `1` (default) for the main content area
- This is a thin CSS Flexbox wrapper — the container element gets `display: flex` applied

---

## Dock Manager

The Dock Manager is a **separate package** (`igniteui-dockmanager`) and is implemented as a **Web Component** (`<igc-dockmanager>`). It provides IDE-style dockable, resizable, floating, and tabbed pane layouts. It is a **premium** (licensed) component.

### Installation

```bash
npm install igniteui-dockmanager
```

### Setup

Because Dock Manager is a Web Component, it requires two one-time setup steps:

**1. Register custom elements — `app.config.ts`:**

```typescript
import { defineCustomElements } from 'igniteui-dockmanager/loader';

defineCustomElements();
```

**2. Add `CUSTOM_ELEMENTS_SCHEMA` to every standalone component that uses `<igc-dockmanager>`:**

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-dock-manager',
  templateUrl: './dock-manager.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DockManagerComponent { ... }
```

### Basic Usage

```typescript
import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IgcDockManagerLayout,
  IgcDockManagerPaneType,
  IgcSplitPaneOrientation
} from 'igniteui-dockmanager';

@Component({
  selector: 'app-dock-manager',
  templateUrl: './dock-manager.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DockManagerComponent {
  layout: IgcDockManagerLayout = {
    rootPane: {
      type: IgcDockManagerPaneType.splitPane,
      orientation: IgcSplitPaneOrientation.horizontal,
      panes: [
        {
          type: IgcDockManagerPaneType.contentPane,
          contentId: 'sidebar',
          header: 'Explorer'
        },
        {
          type: IgcDockManagerPaneType.documentHost,
          rootPane: {
            type: IgcDockManagerPaneType.splitPane,
            orientation: IgcSplitPaneOrientation.horizontal,
            allowEmpty: true,
            panes: [
              {
                type: IgcDockManagerPaneType.tabGroupPane,
                panes: [
                  {
                    type: IgcDockManagerPaneType.contentPane,
                    header: 'File 1',
                    contentId: 'doc1',
                    documentOnly: true
                  },
                  {
                    type: IgcDockManagerPaneType.contentPane,
                    header: 'File 2',
                    contentId: 'doc2',
                    documentOnly: true
                  }
                ]
              }
            ]
          }
        },
        {
          type: IgcDockManagerPaneType.splitPane,
          orientation: IgcSplitPaneOrientation.vertical,
          size: 280,
          panes: [
            {
              type: IgcDockManagerPaneType.contentPane,
              contentId: 'properties',
              header: 'Properties'
            },
            {
              type: IgcDockManagerPaneType.contentPane,
              contentId: 'output',
              header: 'Output',
              isPinned: false  // starts unpinned (auto-hidden)
            }
          ]
        }
      ]
    },
    floatingPanes: [
      {
        type: IgcDockManagerPaneType.splitPane,
        orientation: IgcSplitPaneOrientation.horizontal,
        floatingWidth: 300,
        floatingHeight: 200,
        floatingLocation: { x: 200, y: 150 },
        panes: [
          {
            type: IgcDockManagerPaneType.contentPane,
            contentId: 'search',
            header: 'Search'
          }
        ]
      }
    ]
  };
}
```

```html
<!-- Each slot value matches a contentId in the layout -->
<igc-dockmanager [layout]="layout" style="height: 100vh; display: block;">
  <div slot="sidebar">File explorer content</div>
  <div slot="doc1">Document 1 content</div>
  <div slot="doc2">Document 2 content</div>
  <div slot="properties">Properties panel</div>
  <div slot="output">Output panel</div>
  <div slot="search">Search panel</div>
</igc-dockmanager>
```

### Key Rules for Dock Manager

1. **Separate package** — `igniteui-dockmanager` is installed independently of `igniteui-angular`
2. **Call `defineCustomElements()` from `igniteui-dockmanager/loader` in `app.config.ts`** — without this the `<igc-dockmanager>` element renders as an unknown element
3. **Add `CUSTOM_ELEMENTS_SCHEMA`** to every standalone component or NgModule that uses `<igc-dockmanager>`
4. **Slot names = `contentId` values** — the `slot="..."` attribute on child elements must exactly match the `contentId` string in the layout
5. **Premium component** — requires a licensed Ignite UI subscription; verify availability before recommending to users
6. **Not part of `igniteui-angular`** — do not import from `igniteui-angular` entry points; all Dock Manager types come from `igniteui-dockmanager`

---

## Tile Manager

> **Docs:** [Tile Manager (Angular)](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tile-manager)  
> **Full API Docs:** [Tile Manager Web Component](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/layouts/tile-manager.html)

The Tile Manager is a **layout Web Component** that displays content in individual tiles users can **rearrange and resize**. It is implemented as an `igc-tile-manager` container with one or more `igc-tile` children.

### Installation

```bash
npm install igniteui-webcomponents
```

### Setup

Register the Tile Manager Web Component before bootstrap:

```typescript
import { defineComponents, IgcTileManagerComponent } from 'igniteui-webcomponents';

defineComponents(IgcTileManagerComponent);
```

Add `CUSTOM_ELEMENTS_SCHEMA` to any component using `<igc-tile-manager>`:

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-tile-manager',
  templateUrl: './tile-manager.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TileManagerComponent { }
```

### Basic Usage

```html
<igc-tile-manager>
  <igc-tile>
    <span slot="title">Tile 1 header</span>
    <p>Tile 1 content</p>
  </igc-tile>
  <igc-tile>
    <span slot="title">Tile 2 header</span>
    <p>Tile 2 content</p>
  </igc-tile>
</igc-tile-manager>
```

### Layout Properties

Key `igc-tile-manager` properties:

- **`column-count`**: number of grid columns; if omitted or \<1, as many columns as fit with a minimum width (200px) are created.
- **`gap`**: space between tiles (e.g., `"20px"`, `"1rem"`).
- **`min-column-width`**: minimum width per column (e.g., `"200px"`).
- **`min-row-height`**: minimum height per row (e.g., `"150px"`).

```html
<igc-tile-manager
  column-count="2"
  gap="20px"
  min-column-width="220px"
  min-row-height="160px">
  <igc-tile>
    <span slot="title">Tile 1 header</span>
    <p>Tile 1 content</p>
  </igc-tile>
  <igc-tile>
    <span slot="title">Tile 2 header</span>
    <p>Tile 2 content</p>
  </igc-tile>
</igc-tile-manager>
```

### Tile Properties

Each `igc-tile` can configure its own size and behavior:

- **`row-start` / `col-start`**: starting row/column for the tile
- **`row-span` / `col-span`**: how many rows/columns the tile spans
- **`disable-resize`**: prevents the tile from being resized
- **`disable-maximize`** / **`disable-fullscreen`**: hide default header actions

```html
<igc-tile-manager>
  <igc-tile col-span="2" disable-resize>
    <span slot="title">Wide tile</span>
    <p>Content</p>
  </igc-tile>
  <igc-tile row-span="2">
    <span slot="title">Tall tile</span>
    <p>Content that spans two rows.</p>
  </igc-tile>
</igc-tile-manager>
```

### Resizing & Dragging

- Resizing is controlled by the `resize-mode` property on `igc-tile-manager` (`"none"`, `"hover"`, `"always"`).
- Reordering is enabled via the `drag-mode` property (`"tile"` or `"tile-header"`).

```html
<igc-tile-manager resize-mode="hover" drag-mode="tile-header">
  <igc-tile>
    <span slot="title">Tile 1</span>
    <p>Content</p>
  </igc-tile>
  <igc-tile>
    <span slot="title">Tile 2</span>
    <p>Content</p>
  </igc-tile>
</igc-tile-manager>
```

### Key Rules for Tile Manager

1. **Web Component package** — Tile Manager ships via `igniteui-webcomponents`, not `igniteui-angular`.
2. **Register components** — call `defineComponents(IgcTileManagerComponent)` once before using `<igc-tile-manager>`.
3. **Use `CUSTOM_ELEMENTS_SCHEMA`** on Angular components that host the Tile Manager.
4. **Use slots** — header content goes into `slot="title"`; additional actions and custom adorners use the documented slots (`fullscreen-action`, `maximize-action`, `actions`, `side-adorner`, `corner-adorner`, `bottom-adorner`).
5. **Treat it as a layout container** — use Tile Manager when users need interactive, resizable and re-orderable tiles, not tabular data (use grids for that).

## See Also

- [`setup.md`](./setup.md) — App providers, architecture, all entry points
- [`layout.md`](./layout.md) — Tabs, Stepper, Accordion, Splitter, Navigation Drawer
- [`data-display.md`](./data-display.md) — List, Tree, Card and other display components
- [`feedback.md`](./feedback.md) — Dialog, Snackbar, Toast, Banner
- [`directives.md`](./directives.md) — Button, Ripple, Tooltip, Drag and Drop
