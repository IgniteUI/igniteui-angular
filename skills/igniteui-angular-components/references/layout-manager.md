# Layout Manager & Dock Manager

> **Part of the [`igniteui-angular-components`](../SKILL.md) skill hub.**
> For app setup, providers, and import patterns — see [`setup.md`](./setup.md).

---

## Layout Manager Directives

> **Docs:** [Layout Manager](https://www.infragistics.com/products/ignite-ui-angular/angular/components/layout)

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

> **Docs:** [Dock Manager (Angular)](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dock-manager)
> **Full API Docs:** [Dock Manager Web Component](https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/dock-manager.html)

The Dock Manager is a **separate package** (`igniteui-dockmanager`) and is implemented as a **Web Component** (`<igc-dockmanager>`). It provides IDE-style dockable, resizable, floating, and tabbed pane layouts. It is a **premium** (licensed) component.

### Installation

```bash
npm install igniteui-dockmanager
```

### Setup

Because Dock Manager is a Web Component, it requires two one-time setup steps:

**1. Register custom elements — `main.ts`:**

```typescript
import { defineCustomElements } from 'igniteui-dockmanager/loader';

// Must be called before bootstrapApplication
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

### Full Example (from user-provided code)

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  IgcDockManagerLayout,
  IgcDockManagerPaneType,
  IgcSplitPaneOrientation
} from 'igniteui-dockmanager';

@Component({
  selector: 'app-dock-manager',
  templateUrl: './dock-manager.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DockManagerComponent {
  layout: IgcDockManagerLayout = {
    rootPane: {
      type: IgcDockManagerPaneType.splitPane,
      orientation: IgcSplitPaneOrientation.horizontal,
      panes: [
        {
          type: IgcDockManagerPaneType.splitPane,
          orientation: IgcSplitPaneOrientation.vertical,
          panes: [
            { type: IgcDockManagerPaneType.contentPane, contentId: 'content1', header: 'Content Pane 1' },
            { type: IgcDockManagerPaneType.contentPane, contentId: 'content2', header: 'Unpinned Pane 1', isPinned: false }
          ]
        },
        {
          type: IgcDockManagerPaneType.splitPane,
          orientation: IgcSplitPaneOrientation.vertical,
          size: 200,
          panes: [
            {
              type: IgcDockManagerPaneType.documentHost,
              size: 200,
              rootPane: {
                type: IgcDockManagerPaneType.splitPane,
                orientation: IgcSplitPaneOrientation.horizontal,
                allowEmpty: true,
                panes: [
                  {
                    type: IgcDockManagerPaneType.tabGroupPane,
                    panes: [
                      { type: IgcDockManagerPaneType.contentPane, header: 'Document 1', contentId: 'content3', documentOnly: true },
                      { type: IgcDockManagerPaneType.contentPane, header: 'Document 2', contentId: 'content4', documentOnly: true }
                    ]
                  }
                ]
              }
            },
            { type: IgcDockManagerPaneType.contentPane, contentId: 'content5', header: 'Unpinned Pane 2', isPinned: false }
          ]
        },
        {
          type: IgcDockManagerPaneType.splitPane,
          orientation: IgcSplitPaneOrientation.vertical,
          panes: [
            {
              type: IgcDockManagerPaneType.tabGroupPane,
              size: 200,
              panes: [
                { type: IgcDockManagerPaneType.contentPane, contentId: 'content6', header: 'Tab 1' },
                { type: IgcDockManagerPaneType.contentPane, contentId: 'content7', header: 'Tab 2' },
                { type: IgcDockManagerPaneType.contentPane, contentId: 'content8', header: 'Tab 3' },
                { type: IgcDockManagerPaneType.contentPane, contentId: 'content9', header: 'Tab 4' },
                { type: IgcDockManagerPaneType.contentPane, contentId: 'content10', header: 'Tab 5' }
              ]
            },
            { type: IgcDockManagerPaneType.contentPane, contentId: 'content11', header: 'Content Pane 2' }
          ]
        }
      ]
    },
    floatingPanes: [
      {
        type: IgcDockManagerPaneType.splitPane,
        orientation: IgcSplitPaneOrientation.horizontal,
        floatingHeight: 150,
        floatingWidth: 250,
        floatingLocation: { x: 300, y: 200 },
        panes: [
          { type: IgcDockManagerPaneType.contentPane, contentId: 'content12', header: 'Floating Pane' }
        ]
      }
    ]
  };
}
```

```html
<igc-dockmanager [layout]="layout" style="height: 600px;">
  <div slot="content1" class="dockManagerContent">Content 1</div>
  <div slot="content2" class="dockManagerContent">Content 2</div>
  <div slot="content3" class="dockManagerContent">Content 3</div>
  <div slot="content4" class="dockManagerContent">Content 4</div>
  <div slot="content5" class="dockManagerContent">Content 5</div>
  <div slot="content6" class="dockManagerContent">Content 6</div>
  <div slot="content7" class="dockManagerContent">Content 7</div>
  <div slot="content8" class="dockManagerContent">Content 8</div>
  <div slot="content9" class="dockManagerContent">Content 9</div>
  <div slot="content10" class="dockManagerContent">Content 10</div>
  <div slot="content11" class="dockManagerContent">Content 11</div>
  <div slot="content12" class="dockManagerContent">Content 12</div>
</igc-dockmanager>
```

### Pane Types

| `IgcDockManagerPaneType` | Purpose |
|---|---|
| `splitPane` | Splits space horizontally or vertically between child panes |
| `contentPane` | A single leaf pane that renders a slotted element via `contentId` |
| `tabGroupPane` | Groups multiple `contentPane` children as tabs |
| `documentHost` | A special area for `documentOnly: true` panes (like an editor area) |

### `IgcSplitPaneOrientation`

| Value | Layout |
|---|---|
| `horizontal` | Children placed left-to-right |
| `vertical` | Children placed top-to-bottom |

### Key `contentPane` Properties

| Property | Type | Description |
|---|---|---|
| `contentId` | `string` | Matches the `slot` attribute on the rendered HTML element |
| `header` | `string` | Tab/title bar label |
| `isPinned` | `boolean` | `false` = auto-hidden (collapsed to edge); default `true` |
| `documentOnly` | `boolean` | Restricts pane to `documentHost` areas only |
| `size` | `number` | Relative size within parent split |
| `allowClose` | `boolean` | Show close button (default `true`) |
| `allowPinning` | `boolean` | Allow user to pin/unpin (default `true`) |
| `allowFloating` | `boolean` | Allow user to float the pane (default `true`) |

### Key `splitPane` / floating pane Properties

| Property | Type | Description |
|---|---|---|
| `orientation` | `IgcSplitPaneOrientation` | `horizontal` or `vertical` |
| `size` | `number` | Relative size in the parent split |
| `allowEmpty` | `boolean` | Allow pane to remain when all children are closed |
| `floatingWidth` | `number` | Initial width of floating pane (px) |
| `floatingHeight` | `number` | Initial height of floating pane (px) |
| `floatingLocation` | `{x, y}` | Initial top-left corner position of floating pane |

### Key Rules for Dock Manager

1. **Separate package** — `igniteui-dockmanager` is installed independently of `igniteui-angular`
2. **Call `defineCustomElements()` in `main.ts`** before `bootstrapApplication` — without this the `<igc-dockmanager>` element renders as an unknown element
3. **Add `CUSTOM_ELEMENTS_SCHEMA`** to every standalone component or NgModule that uses `<igc-dockmanager>`
4. **Slot names = `contentId` values** — the `slot="..."` attribute on child elements must exactly match the `contentId` string in the layout
5. **Premium component** — requires a licensed Ignite UI subscription; verify availability before recommending to users
6. **Not part of `igniteui-angular`** — do not import from `igniteui-angular` entry points; all Dock Manager types come from `igniteui-dockmanager`

## See Also

- [`setup.md`](./setup.md) — App providers, architecture, all entry points
- [`layout.md`](./layout.md) — Tabs, Stepper, Accordion, Splitter, Navigation Drawer
- [`data-display.md`](./data-display.md) — List, Tree, Card and other display components
- [`feedback.md`](./feedback.md) — Dialog, Snackbar, Toast, Banner
- [`directives.md`](./directives.md) — Button, Ripple, Tooltip, Drag and Drop
