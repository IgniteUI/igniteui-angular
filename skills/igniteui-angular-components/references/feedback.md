# Feedback & Overlay Components

> **Part of the [`igniteui-angular-components`](../SKILL.md) skill hub.**
> For app setup, providers, and import patterns — see [`setup.md`](./setup.md).

> **AGENT INSTRUCTION:** All components in this file rely on Angular animations and the Ignite UI overlay system. Before using any of them, ensure `provideAnimations()` (or `provideAnimationsAsync()`) is present in `app.config.ts`. If it is missing, add it — these components will throw runtime errors or silently fail to animate without it.

## Dialog

> **Docs:** [Dialog Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dialog)

```typescript
import { IgxDialogComponent, IgxDialogTitleDirective, IgxDialogActionsDirective } from 'igniteui-angular/dialog';
import { IgxButtonDirective } from 'igniteui-angular/directives';
```

```html
<igx-dialog
  #confirmDialog
  [isModal]="true"
  [closeOnEscape]="true"
  [closeOnOutsideSelect]="false"
  title="Confirm Delete"
  (closed)="onDialogClosed()">
  <igx-dialog-title>Confirm Delete</igx-dialog-title>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>
  <div igxDialogActions>
    <button igxButton="flat" (click)="confirmDialog.close()">Cancel</button>
    <button igxButton="raised" (click)="deleteItem(); confirmDialog.close()">Delete</button>
  </div>
</igx-dialog>

<button igxButton="raised" (click)="confirmDialog.open()">Delete Item</button>
```

Programmatic control:

```typescript
dialog = viewChild.required<IgxDialogComponent>('confirmDialog');

open() { this.dialog().open(); }
close() { this.dialog().close(); }
```

Events: `(opening)`, `(opened)`, `(closing)`, `(closed)`, `(leftButtonSelect)`, `(rightButtonSelect)`.

## Snackbar

> **Docs:** [Snackbar Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/snackbar)

```typescript
import { IgxSnackbarComponent, IgxSnackbarActionDirective } from 'igniteui-angular/snackbar';
import { IgxButtonDirective } from 'igniteui-angular/directives';
```

```html
<igx-snackbar
  #snackbar
  [displayTime]="3000"
  [autoHide]="true"
  (animationDone)="onSnackbarDone()">
  Item saved successfully
  <button igxButton="flat" igxSnackbarAction (click)="undo()">UNDO</button>
</igx-snackbar>
```

Trigger in TypeScript:

```typescript
snackbar = viewChild.required<IgxSnackbarComponent>('snackbar');

save() {
  this.dataService.save(this.item);
  this.snackbar().open('Item saved');  // optional: pass message text
}
```

## Toast

> **Docs:** [Toast Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toast)

```typescript
import { IgxToastComponent } from 'igniteui-angular/toast';
```

```html
<igx-toast #toast [displayTime]="2000">Operation complete</igx-toast>

<button igxButton (click)="toast.open()">Trigger Toast</button>
```

Toast vs Snackbar: Toast is non-interactive (no action button), always auto-hides. Snackbar supports an action button and can be persistent.

## Banner

> **Docs:** [Banner Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/banner)

```typescript
import { IgxBannerComponent, IgxBannerActionsDirective } from 'igniteui-angular/banner';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxButtonDirective } from 'igniteui-angular/directives';
```

```html
<igx-banner #banner (closed)="onBannerClosed()">
  <igx-icon igxBannerIcon>wifi_off</igx-icon>
  You are offline. Some features may not be available.
  <div igxBannerActions>
    <button igxButton="flat" (click)="banner.dismiss()">Dismiss</button>
    <button igxButton="flat" (click)="retry()">Retry</button>
  </div>
</igx-banner>
```

Trigger in TypeScript:

```typescript
banner = viewChild.required<IgxBannerComponent>('banner');

showOfflineWarning() { this.banner().open(); }
hideWarning() { this.banner().close(); }
```

Events: `(opening)`, `(opened)`, `(closing)`, `(closed)`.

Banner always renders inline (not overlaid) — it pushes page content down when open.

## Key Rules

- **`provideAnimations()` is required** — add it to `app.config.ts` before using Dialog, Snackbar, Toast, or Banner
- **Dialog** uses the Ignite UI overlay system — set `[isModal]="true"` for blocking modals
- **Snackbar** vs **Toast**: Snackbar supports action buttons and can be persistent; Toast is always auto-hiding and non-interactive
- **Banner** renders **inline** (pushes content), not as an overlay — use Dialog for blocking prompts

## See Also

- [`setup.md`](./setup.md) — App providers, architecture, all entry points
- [`form-controls.md`](./form-controls.md) — Input Group, Combo, Select, Date/Time Pickers, Calendar, Checkbox, Radio, Switch, Slider
- [`layout.md`](./layout.md) — Tabs, Stepper, Accordion, Splitter, Navigation Drawer
- [`data-display.md`](./data-display.md) — List, Tree, Card and other display components
- [`directives.md`](./directives.md) — Button, Ripple, Tooltip, Drag and Drop
