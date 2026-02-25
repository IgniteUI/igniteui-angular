# Application Setup & Architecture

> **Part of the [`igniteui-angular-components`](../SKILL.md) skill hub.**

## Installation

```bash
# Open-source
npm install igniteui-angular

# Licensed (requires @infragistics registry configured)
npm install @infragistics/igniteui-angular
```

Both packages share identical entry-point paths. Everywhere below, replace `igniteui-angular` with `@infragistics/igniteui-angular` if using the licensed package.

## Required Providers (`app.config.ts`)

> **AGENT INSTRUCTION:** Before adding any Ignite UI component, verify that `app.config.ts` contains the providers listed below. Missing `provideAnimations()` is the most common cause of runtime errors — all overlay and animated components (Dialog, Combo, Select, Date Picker, Snackbar, Toast, Banner, Navigation Drawer, Dropdown) will silently fail or throw without it.

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideIgniteIntl } from 'igniteui-angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),    // REQUIRED — all overlay and animated components
    provideRouter(appRoutes),
    provideIgniteIntl(),    // recommended — localization for date/time pickers, grids, etc.
  ]
};
```

| Provider | Package | Required for |
|---|---|---|
| `provideAnimations()` | `@angular/platform-browser/animations` | **All overlay and animated components** — Dialog, Combo, Select, Dropdown, Date/Time Picker, Snackbar, Toast, Banner, Navigation Drawer, Carousel, Overlay service |
| `importProvidersFrom(HammerModule)` | `@angular/platform-browser` | OPTIONAL — touch gestures (Slider, Drag & Drop, swipe) |
| `provideIgniteIntl()` | `igniteui-angular/core` | Localization for grids, date/time pickers, and components displaying formatted values |

> **`provideAnimationsAsync()`** lazy-loads the animations module — prefer it for SSR or when optimizing initial bundle size:
> ```typescript
> import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
> ```

## Architecture — Standalone Components

All Ignite UI components are **standalone** — no NgModules needed. Import them directly into your component's `imports` array:

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IgxButtonDirective } from 'igniteui-angular/directives';
import { IgxDialogComponent } from 'igniteui-angular/dialog';

@Component({
  selector: 'app-example',
  imports: [IgxButtonDirective, IgxDialogComponent],
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {}
```

## Multi-Entry-Point Imports

> **AGENT INSTRUCTION:** Always import from specific entry points, never from the root barrel. Check `package.json` to determine whether the project uses `igniteui-angular` or `@infragistics/igniteui-angular` — that prefix applies to every import path.

```typescript
// CORRECT — tree-shakeable, specific entry point
import { IgxComboComponent } from 'igniteui-angular/combo';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';

// AVOID — pulls in entire library
import { IgxComboComponent } from 'igniteui-angular';
```

### Common Entry Points

| Component / Directive | Entry Point |
|---|---|
| Input Group | `igniteui-angular/input-group` |
| Combo / Simple Combo | `igniteui-angular/combo` |
| Select | `igniteui-angular/select` |
| Date Picker | `igniteui-angular/date-picker` |
| Date Range Picker | `igniteui-angular/date-range-picker` |
| Time Picker | `igniteui-angular/time-picker` |
| Calendar | `igniteui-angular/calendar` |
| Checkbox | `igniteui-angular/checkbox` |
| Radio | `igniteui-angular/radio` |
| Switch | `igniteui-angular/switch` |
| Slider | `igniteui-angular/slider` |
| Tabs | `igniteui-angular/tabs` |
| Stepper | `igniteui-angular/stepper` |
| Accordion / Expansion Panel | `igniteui-angular/expansion-panel` |
| Splitter | `igniteui-angular/splitter` |
| Navigation Drawer | `igniteui-angular/navigation-drawer` |
| Bottom Navigation | `igniteui-angular/bottom-nav` |
| List | `igniteui-angular/list` |
| Tree | `igniteui-angular/tree` |
| Card | `igniteui-angular/card` |
| Dialog | `igniteui-angular/dialog` |
| Snackbar | `igniteui-angular/snackbar` |
| Toast | `igniteui-angular/toast` |
| Banner | `igniteui-angular/banner` |
| Chips | `igniteui-angular/chips` |
| Avatar | `igniteui-angular/avatar` |
| Badge | `igniteui-angular/badge` |
| Icon | `igniteui-angular/icon` |
| Carousel | `igniteui-angular/carousel` |
| Paginator | `igniteui-angular/paginator` |
| Linear Progress | `igniteui-angular/progressbar` |
| Circular Progress | `igniteui-angular/progressbar` |
| Chat | `igniteui-angular/chat` |
| Button / Icon Button | `igniteui-angular/directives` |
| Ripple | `igniteui-angular/directives` |
| IgxTooltipDirective, IgxTooltipTargetDirective | `igniteui-angular/directives` |
| Drag & Drop | `igniteui-angular/directives` |
| Layout Manager (`igxLayout`, `igxFlex`) | `igniteui-angular/directives` |
| Core utilities, services, base types | `igniteui-angular/core` |
| Icon Service | `igniteui-angular/icon` |
| Overlay Service | `igniteui-angular/core` |
| **Dock Manager** | `igniteui-dockmanager` *(separate package — `npm install igniteui-dockmanager`)* |

**Grid-specific entry points** (tree-shakable imports):

| Component / Feature | Entry Point |
|---|---|
| Shared grid infrastructure (columns, toolbar, filtering, sorting, etc.) | `igniteui-angular/grids/core` |
| Standard grid (`IgxGridComponent`) | `igniteui-angular/grids/grid` |
| Tree grid (`IgxTreeGridComponent`) | `igniteui-angular/grids/tree-grid` |
| Hierarchical grid (`IgxHierarchicalGridComponent`, `IgxRowIslandComponent`) | `igniteui-angular/grids/hierarchical-grid` |
| Pivot grid (`IgxPivotGridComponent`, `IgxPivotDataSelectorComponent`) | `igniteui-angular/grids/pivot-grid` |

### Convenience Directive Collections

For complex components, use the bundled directive arrays instead of listing every sub-directive individually:

| Token | Entry Point | Includes |
|---|---|---|
| `IGX_INPUT_GROUP_DIRECTIVES` | `igniteui-angular/input-group` | Input group + label, hint, prefix, suffix |
| `IGX_TABS_DIRECTIVES` | `igniteui-angular/tabs` | Tabs + tab item, header, content |
| `IGX_STEPPER_DIRECTIVES` | `igniteui-angular/stepper` | Stepper + step |
| `IGX_EXPANSION_PANEL_DIRECTIVES` | `igniteui-angular/expansion-panel` | Panel + header, body |
| `IGX_LIST_DIRECTIVES` | `igniteui-angular/list` | List + list item |
| `IGX_TREE_DIRECTIVES` | `igniteui-angular/tree` | Tree + tree node |

## See Also

- [`form-controls.md`](./form-controls.md) — Input Group, Combo, Select, Date/Time Pickers, Calendar, Checkbox, Radio, Switch, Slider, forms integration
- [`layout.md`](./layout.md) — Tabs, Stepper, Accordion, Splitter, Navigation Drawer
- [`data-display.md`](./data-display.md) — List, Tree, Card, Chips, Avatar, Badge, Icon, Carousel, Paginator, Progress, Chat
- [`feedback.md`](./feedback.md) — Dialog, Snackbar, Toast, Banner
- [`directives.md`](./directives.md) — Button, Ripple, Tooltip, Drag and Drop
- [`layout-manager.md`](./layout-manager.md) — Layout Manager directives, Dock Manager
- [`../../igniteui-angular-grids/SKILL.md`](../../igniteui-angular-grids/SKILL.md) — Data Grids
- [`../../igniteui-angular-theming/SKILL.md`](../../igniteui-angular-theming/SKILL.md) — Theming & Styling
