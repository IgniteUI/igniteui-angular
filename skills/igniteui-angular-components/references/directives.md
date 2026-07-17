# Directives

> **Part of the [`igniteui-angular-components`](../SKILL.md) skill hub.**
> For app setup, providers, and import patterns — see [`setup.md`](./setup.md).

## Contents

- [Button & Icon Button](#button--icon-button)
- [Button Group](#button-group)
- [Ripple Effect](#ripple-effect)
- [Tooltip](#tooltip)
- [Drag and Drop](#drag-and-drop)

## Button & Icon Button

```typescript
import { IgxButtonDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
```

```html
<!-- Text buttons -->
<button igxButton="flat">Flat</button>
<button igxButton="contained">Contained</button>
<button igxButton="outlined">Outlined</button>
<button igxButton="fab">
  <igx-icon>add</igx-icon>
</button>

<!-- Icon-only buttons -->
<button igxIconButton="flat"><igx-icon>edit</igx-icon></button>
<button igxIconButton="outlined"><igx-icon>delete</igx-icon></button>
<button igxIconButton="contained"><igx-icon>save</igx-icon></button>

<!-- Disabled state -->
<button igxButton="contained" [disabled]="isLoading()">Submit</button>
```

Button variants for `igxButton`: `'flat'`, `'contained'`, `'outlined'`, `'fab'`.
Button variants for `igxIconButton`: `'flat'`, `'outlined'`, `'contained'`.

## Button Group

```typescript
// Option A — convenience collection (includes IgxButtonGroupComponent + IgxButtonDirective)
import { IGX_BUTTON_GROUP_DIRECTIVES } from 'igniteui-angular/button-group';

// Option B — individual imports
import { IgxButtonGroupComponent } from 'igniteui-angular/button-group';
import { IgxButtonDirective } from 'igniteui-angular/directives';

import { IgxIconComponent } from 'igniteui-angular/icon';
```

```html
<igx-buttongroup selectionMode="multi" alignment="horizontal"
  (selected)="onSelected($event)" (deselected)="onDeselected($event)">
  <button igxButton [selected]="true"><igx-icon>format_bold</igx-icon></button>
  <button igxButton><igx-icon>format_italic</igx-icon></button>
  <button igxButton [disabled]="true"><igx-icon>format_underlined</igx-icon></button>
</igx-buttongroup>
```

- `selectionMode`: `'single'` (default) | `'singleRequired'` (one always stays selected) | `'multi'`
- `alignment`: `'horizontal'` (default) | `'vertical'`; `[disabled]` on the group disables all buttons
- `(selected)`/`(deselected)` emit `IButtonGroupEventArgs` (`{ owner, button, index }`, from `igniteui-angular/button-group`)
- Programmatic: `selectButton(index)`, `deselectButton(index)`, `selectedButtons` on `IgxButtonGroupComponent`
- Further members: `search_api({ framework: "angular", query: "IgxButtonGroupComponent" })`

## Ripple Effect

```typescript
import { IgxRippleDirective } from 'igniteui-angular/directives';
```

```html
<!-- Add to any clickable element for Material-style ink ripple -->
<button igxButton="contained" igxRipple>Click me</button>
<div igxRipple igxRippleTarget=".my-class" class="custom-surface">Interactive div</div>
```

Inputs: `[igxRipple]` (ripple color), `[igxRippleCentered]` (always start from center), `[igxRippleDisabled]`.

```html
<button igxButton="contained" igxRipple="#ff4081" [igxRippleCentered]="true">Pink ripple</button>
```

## Tooltip

> **Full doc in the MCP:** `get_doc({ framework: "angular", name: "tooltip" })` covers triggers, overlay behavior, sticky/arrowed tooltips, styling, and accessibility.

The at-a-glance pairing — `igxTooltipTarget` on the host references the `igxTooltip` element (both from `igniteui-angular/directives`):

```html
<button igxButton [igxTooltipTarget]="myTooltip" [showDelay]="500">Hover or focus me</button>
<div igxTooltip #myTooltip="tooltip">Helpful tooltip text</div>
```

## Drag and Drop

```typescript
import { IgxDragDirective, IgxDropDirective, IDragMoveEventArgs, IDropDroppedEventArgs } from 'igniteui-angular/directives';
```

### Basic drag and drop

```html
<!-- Draggable source -->
<div [igxDrag]="item" (dragMove)="onDragMove($event)" (dragEnd)="onDragEnd($event)">
  <igx-icon>drag_indicator</igx-icon>
  {{ item.name }}
</div>

<!-- Drop target -->
<div igxDrop (dropped)="onDrop($event)" (enter)="onDragEnter($event)" (leave)="onDragLeave($event)">
  Drop here
</div>
```

```typescript
onDrop(event: IDropDroppedEventArgs) {
  const draggedItem = event.drag.data;
  // Move draggedItem to this drop zone
  event.cancel = false; // allow the drop
}
```

### Ghost element (custom drag preview)

```html
<div igxDrag [ghostTemplate]="ghostTmpl">Drag me</div>

<ng-template #ghostTmpl>
  <div class="custom-ghost">
    <igx-icon>content_copy</igx-icon> Moving...
  </div>
</ng-template>
```

### Reorderable list

```html
<igx-list>
  @for (item of items; track item.id) {
    <igx-list-item [igxDrag]="item" igxDrop (dropped)="reorder($event, item)">
      <igx-icon igxListAction>drag_handle</igx-icon>
      <span igxListLine>{{ item.name }}</span>
    </igx-list-item>
  }
</igx-list>
```

Key drag events: `(dragStart)`, `(dragMove)`, `(dragEnd)`, `(dragClick)`, `(ghostCreate)`, `(ghostDestroy)`, `(transitioned)`.
Key drop events: `(enter)`, `(leave)`, `(over)`, `(dropped)`.

> **NOTE (optional):** For touch-based drag, install `hammerjs` and add it to the `scripts` array in `angular.json`.
> ```bash
> npm install hammerjs
> ```
> ```json
> // angular.json — inside your project's architect.build.options
> "scripts": ["./node_modules/hammerjs/hammer.min.js"]
> ```

## See Also

- [`setup.md`](./setup.md) — App providers, architecture, all entry points
- [`form-controls.md`](./form-controls.md) — Input Group, Combo, Select, Date/Time Pickers, Calendar, Checkbox, Radio, Switch, Slider
- [`layout.md`](./layout.md) — Tabs, Stepper, Accordion, Splitter, Navigation Drawer
- [`data-display.md`](./data-display.md) — List, Tree, Card and other display components
- [`feedback.md`](./feedback.md) — Dialog, Snackbar, Toast, Banner
