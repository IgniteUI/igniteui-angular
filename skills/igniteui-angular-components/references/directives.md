# Directives

> **Part of the [`igniteui-angular-components`](../SKILL.md) skill hub.**
> For app setup, providers, and import patterns — see [`setup.md`](./setup.md).

## Button & Icon Button

> **Docs:** [Button Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/button)

```typescript
import { IgxButtonDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
```

```html
<!-- Text buttons -->
<button igxButton="flat">Flat</button>
<button igxButton="raised">Raised</button>
<button igxButton="outlined">Outlined</button>
<button igxButton="fab">
  <igx-icon>add</igx-icon>
</button>

<!-- Icon-only buttons -->
<button igxIconButton="flat"><igx-icon>edit</igx-icon></button>
<button igxIconButton="outlined"><igx-icon>delete</igx-icon></button>
<button igxIconButton="contained"><igx-icon>save</igx-icon></button>

<!-- Disabled state -->
<button igxButton="raised" [disabled]="isLoading()">Submit</button>
```

Button variants for `igxButton`: `'flat'`, `'raised'`, `'outlined'`, `'fab'`.
Button variants for `igxIconButton`: `'flat'`, `'outlined'`, `'contained'`.

## Ripple Effect

> **Docs:** [Ripple Directive](https://www.infragistics.com/products/ignite-ui-angular/angular/components/ripple)

```typescript
import { IgxRippleDirective } from 'igniteui-angular/directives';
```

```html
<!-- Add to any clickable element for Material-style ink ripple -->
<button igxButton="raised" igxRipple>Click me</button>
<div igxRipple igxRippleTarget=".my-class" class="custom-surface">Interactive div</div>
```

Inputs: `[igxRipple]` (ripple color), `[igxRippleCentered]` (always start from center), `[igxRippleDisabled]`.

```html
<button igxButton="raised" igxRipple="#ff4081" [igxRippleCentered]="true">Pink ripple</button>
```

## Tooltip

> **Docs:** [Tooltip Directive](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tooltip)

```typescript
import { IgxTooltipDirective, IgxTooltipTargetDirective } from 'igniteui-angular/directives';
```

```html
<button igxButton [igxTooltipTarget]="myTooltip" [igxTooltipTargetShowDelay]="500">
  Hover or focus me
</button>
<div igxTooltip #myTooltip="tooltip">Helpful tooltip text</div>
```

Inputs on `[igxTooltipTarget]`: `[igxTooltipTargetShowDelay]` (ms), `[igxTooltipTargetHideDelay]` (ms), `[tooltipDisabled]`.

Programmatic control:

```typescript
tooltip = viewChild.required<IgxTooltipDirective>('myTooltip');

showTooltip() { this.tooltip().open(); }
hideTooltip() { this.tooltip().close(); }
```

## Drag and Drop

> **Docs:** [Drag and Drop](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drag-drop)

```typescript
import { IgxDragDirective, IgxDropDirective, IDragMoveEventArgs, IDropDroppedEventArgs } from 'igniteui-angular/directives';
```

### Basic drag and drop

```html
<!-- Draggable source -->
<div igxDrag [dragData]="item" (dragMove)="onDragMove($event)" (dragEnd)="onDragEnd($event)">
  <igx-icon>drag_indicator</igx-icon>
  {{ item.name }}
</div>

<!-- Drop target -->
<div igxDrop (dropped)="onDrop($event)" (dragEnter)="onDragEnter($event)" (dragLeave)="onDragLeave($event)">
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
    <igx-list-item igxDrag [dragData]="item" igxDrop (dropped)="reorder($event, item)">
      <igx-icon igxListAction>drag_handle</igx-icon>
      <span igxListLine>{{ item.name }}</span>
    </igx-list-item>
  }
</igx-list>
```

Key drag events: `(dragStart)`, `(dragMove)`, `(dragEnd)`, `(dragClick)`, `(transitioned)`.
Key drop events: `(dragEnter)`, `(dragLeave)`, `(dragOver)`, `(dropped)`.

> **NOTE:** For touch-based drag, add `importProvidersFrom(HammerModule)` to `app.config.ts` providers.

## See Also

- [`setup.md`](./setup.md) — App providers, architecture, all entry points
- [`form-controls.md`](./form-controls.md) — Input Group, Combo, Select, Date/Time Pickers, Calendar, Checkbox, Radio, Switch, Slider
- [`layout.md`](./layout.md) — Tabs, Stepper, Accordion, Splitter, Navigation Drawer
- [`data-display.md`](./data-display.md) — List, Tree, Card and other display components
- [`feedback.md`](./feedback.md) — Dialog, Snackbar, Toast, Banner
