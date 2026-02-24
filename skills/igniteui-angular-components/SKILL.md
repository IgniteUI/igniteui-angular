---
name: igniteui-angular-components
description: Build Angular apps with Ignite UI form controls — Input Group, Combo, Select, Date/Time Pickers, Calendar, and forms integration
user-invokable: true
---

# Ignite UI for Angular — Form Controls & Setup Skill

## Description

This skill teaches AI agents how to use Ignite UI for Angular form control components in Angular 20+ applications. It covers application setup, standalone component architecture, multi-entry-point imports, and the full form control catalog (Input Group, Combo, Select, Date/Time Pickers, Calendar, Checkbox, Radio, Switch, Slider) along with reactive forms integration.

For layout, data display, feedback/overlay components, and directives, see the **igniteui-angular-components-layout** skill.

## Prerequisites

- Angular 20+ project
- `igniteui-angular` installed via `npm install igniteui-angular`, **or** `@infragistics/igniteui-angular` for licensed users — both packages share the same entry-point structure
- A theme applied (see the Theming skill)

## Application Setup

> **AGENT INSTRUCTION:** Before adding any Ignite UI component, verify that `app.config.ts` (or `app.module.ts`) contains the required providers listed below. Missing `provideAnimations()` is the most common cause of runtime errors with overlay and animated components (Dialog, Combo, Select, Date Picker, Snackbar, Toast, Banner, Navigation Drawer, Dropdown). Always check and update `app.config.ts` when scaffolding a new feature.

### Required Providers (`app.config.ts`)

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HammerModule } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideIgniteIntl } from 'igniteui-angular/core'; // '@infragistics/igniteui-angular/core' for licensed

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),          // REQUIRED — all overlay and animated components
    importProvidersFrom(HammerModule), // REQUIRED — touch gesture support (Slider, Drag & Drop)
    provideRouter(appRoutes),
    provideIgniteIntl(),          // recommended — localization for grids, date/time pickers, etc.
  ]
};
```

| Provider | Package | Required for |
|---|---|---|
| `provideAnimations()` | `@angular/platform-browser/animations` | **All overlay and animated components** — Dialog, Combo, Select, Dropdown, Date/Time Picker, Snackbar, Toast, Banner, Navigation Drawer, Carousel, Overlay service |
| `importProvidersFrom(HammerModule)` | `@angular/platform-browser` | Touch gestures — Slider, Drag & Drop, swipe interactions |
| `provideIgniteIntl()` | `igniteui-angular/core` | Localization for grids, date/time pickers, and other components that display formatted values |

> **`provideAnimationsAsync()`** is an alternative to `provideAnimations()` that lazy-loads the animations module — prefer it for SSR or when optimizing initial bundle size:
> ```typescript
> import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
> ```

## Architecture

All Ignite UI components are **standalone** — no NgModules needed. Import components directly into your component's `imports` array:

```typescript
import { Component } from '@angular/core';
// Open-source package
import { IgxButtonDirective } from 'igniteui-angular/button';
import { IgxDialogComponent } from 'igniteui-angular/dialog';
// Licensed package — identical structure, different prefix
// import { IgxButtonDirective } from '@infragistics/igniteui-angular/button';
// import { IgxDialogComponent } from '@infragistics/igniteui-angular/dialog';

@Component({
  selector: 'app-example',
  imports: [IgxButtonDirective, IgxDialogComponent],
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {}
```

### Multi-Entry-Point Imports

Each component has its own entry point. Always import from the specific entry point, NOT from the root barrel.

This rule applies to **both** the open-source and licensed packages:

```typescript
// CORRECT — open-source package, tree-shakeable
import { IgxComboComponent } from 'igniteui-angular/combo';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';

// CORRECT — licensed package, same entry-point structure
import { IgxComboComponent } from '@infragistics/igniteui-angular/combo';
import { IgxDatePickerComponent } from '@infragistics/igniteui-angular/date-picker';

// AVOID — pulls in entire library (wrong for BOTH package variants)
import { IgxComboComponent, IgxDatePickerComponent } from 'igniteui-angular';
import { IgxComboComponent, IgxDatePickerComponent } from '@infragistics/igniteui-angular';
```

> **AGENT INSTRUCTION:** Before generating import statements, check `package.json` to determine which package variant is installed (`igniteui-angular` or `@infragistics/igniteui-angular`). Use that package name as the prefix for all entry-point imports. For example, if the project uses `@infragistics/igniteui-angular`, every import path must use `@infragistics/igniteui-angular/<entry-point>` — never the root barrel.

### Convenience Directive Collections

For complex components with many sub-directives, use the provided directive arrays. Replace `igniteui-angular` with `@infragistics/igniteui-angular` in all entry-point paths if using the licensed package:

| Token | Entry Point | Includes |
|---|---|---|
| `IGX_GRID_DIRECTIVES` | `igniteui-angular/grids/grid` | Grid, columns, toolbar, filtering, selection, paginator, validators |
| `IGX_TREE_GRID_DIRECTIVES` | `igniteui-angular/grids/tree-grid` | Tree Grid + all grid sub-directives |
| `IGX_HIERARCHICAL_GRID_DIRECTIVES` | `igniteui-angular/grids/hierarchical-grid` | Hierarchical Grid + row island |
| `IGX_PIVOT_GRID_DIRECTIVES` | `igniteui-angular/grids/pivot-grid` | Pivot Grid |
| `IGX_INPUT_GROUP_DIRECTIVES` | `igniteui-angular/input-group` | Input group + label, hint, prefix, suffix |
| `IGX_TABS_DIRECTIVES` | `igniteui-angular/tabs` | Tabs + tab item, header, content |
| `IGX_STEPPER_DIRECTIVES` | `igniteui-angular/stepper` | Stepper + step |
| `IGX_EXPANSION_PANEL_DIRECTIVES` | `igniteui-angular/expansion-panel` | Panel + header, body |
| `IGX_LIST_DIRECTIVES` | `igniteui-angular/list` | List + list item |
| `IGX_TREE_DIRECTIVES` | `igniteui-angular/tree` | Tree + tree node |

## Component Catalog

### Form Controls

> **Docs:** [Angular Reactive Form Validation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/angular-reactive-form-validation)

#### Input Group

```html
<igx-input-group type="border">
  <igx-prefix><igx-icon>person</igx-icon></igx-prefix>
  <label igxLabel>Username</label>
  <input igxInput name="username" type="text" [(ngModel)]="username" />
  <igx-suffix><igx-icon>clear</igx-icon></igx-suffix>
  <igx-hint>Enter your username</igx-hint>
</igx-input-group>
```

Types: `line` (default), `border`, `box`, `search`.

#### Combo (Multi-Select Dropdown)

> **Docs:** [Combo Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo)

```html
<igx-combo
  [data]="cities"
  [valueKey]="'id'"
  [displayKey]="'name'"
  [groupKey]="'region'"
  placeholder="Select cities"
  [allowCustomValues]="false"
  [(ngModel)]="selectedCityIds">
</igx-combo>
```

Key inputs: `[data]`, `[valueKey]`, `[displayKey]`, `[groupKey]`, `[placeholder]`, `[allowCustomValues]`, `[filterFunction]`, `[itemsMaxHeight]`, `[type]`.

Events: `(opening)`, `(opened)`, `(closing)`, `(closed)`, `(selectionChanging)`, `(addition)`, `(searchInputUpdate)`.

#### Simple Combo (Single-Select)

> **Docs:** [Combo — Single Selection](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo#single-selection)

```html
<igx-simple-combo
  [data]="countries"
  [valueKey]="'code'"
  [displayKey]="'name'"
  placeholder="Select country"
  [(ngModel)]="selectedCountry">
</igx-simple-combo>
```

Same API as `igx-combo` but restricted to single selection.

#### Select

> **Docs:** [Select Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/select)

```html
<igx-select [(ngModel)]="selectedRole" placeholder="Choose role">
  @for (role of roles; track role.id) {
    <igx-select-item [value]="role.id">{{ role.name }}</igx-select-item>
  }
</igx-select>
```

#### Date Picker

> **Docs:** [Date Picker](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date-picker)

```html
<igx-date-picker
  [(ngModel)]="selectedDate"
  [minValue]="minDate"
  [maxValue]="maxDate"
  [hideOutsideDays]="true"
  [displayMonthsCount]="2">
</igx-date-picker>
```

Implements `ControlValueAccessor` and `Validator`.

#### Date Range Picker

> **Docs:** [Date Range Picker](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date-range-picker)

```html
<igx-date-range-picker [(ngModel)]="dateRange">
  <igx-date-range-start>
    <input igxInput igxDateTimeEditor type="text" />
  </igx-date-range-start>
  <igx-date-range-end>
    <input igxInput igxDateTimeEditor type="text" />
  </igx-date-range-end>
</igx-date-range-picker>
```

#### Time Picker

> **Docs:** [Date Time Editor](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date-time-editor)

```html
<igx-time-picker [(ngModel)]="selectedTime" [inputFormat]="'HH:mm'" [is24HourFormat]="true">
</igx-time-picker>
```

#### Calendar

> **Docs:** [Calendar Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/calendar)

```html
<igx-calendar
  [(ngModel)]="selectedDate"
  [selection]="'single'"
  [hideOutsideDays]="true"
  [weekStart]="1">
</igx-calendar>
```

Selection modes: `'single'`, `'multi'`, `'range'`.

#### Checkbox, Radio, Switch

> **Docs:** [Checkbox](https://www.infragistics.com/products/ignite-ui-angular/angular/components/checkbox) · [Radio Button](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio-button) · [Switch](https://www.infragistics.com/products/ignite-ui-angular/angular/components/switch)

```html
<igx-checkbox [(ngModel)]="rememberMe">Remember me</igx-checkbox>

<igx-radio name="plan" value="basic" [(ngModel)]="plan">Basic</igx-radio>
<igx-radio name="plan" value="pro" [(ngModel)]="plan">Pro</igx-radio>

<igx-switch [(ngModel)]="darkMode">Dark mode</igx-switch>
```

#### Slider

> **Docs:** [Slider Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/slider/slider)

```html
<igx-slider [type]="SliderType.RANGE" [minValue]="0" [maxValue]="100"
            [lowerBound]="20" [upperBound]="80">
</igx-slider>
```

## Forms Integration

All form controls implement `ControlValueAccessor` and work with both reactive and template-driven forms:

```typescript
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IgxComboComponent } from 'igniteui-angular/combo';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';

@Component({
  imports: [ReactiveFormsModule, IgxComboComponent, IGX_INPUT_GROUP_DIRECTIVES, IgxDatePickerComponent],
  template: `
    <form [formGroup]="form">
      <igx-input-group>
        <label igxLabel>Name</label>
        <input igxInput formControlName="name" />
      </igx-input-group>

      <igx-combo [data]="skills" formControlName="skills"
                 [valueKey]="'id'" [displayKey]="'name'"
                 placeholder="Select skills">
      </igx-combo>

      <igx-date-picker formControlName="startDate"></igx-date-picker>
    </form>
  `
})
export class MyFormComponent {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    skills: new FormControl([]),
    startDate: new FormControl<Date | null>(null)
  });
}
```

## Key Rules

1. **Always check `app.config.ts` first** — add `provideAnimations()` from `@angular/platform-browser/animations` before using any overlay or animated component (Dialog, Combo, Select, Date Picker, Snackbar, Toast, Banner, Navigation Drawer). This is the most common source of runtime errors in new projects.
2. **Always import from specific entry points** — avoid the main `igniteui-angular` barrel for tree-shaking

## Related Skills

- [`igniteui-angular-components-layout`](../igniteui-angular-components-layout/SKILL.md) — Layout components (Tabs, Stepper, Accordion, Splitter, Navigation Drawer), data display (List, Tree, Card), feedback/overlays (Dialog, Snackbar, Toast, Banner), and directives (Buttons, Ripple, Tooltip, Drag and Drop)
- [`igniteui-angular-grids`](../igniteui-angular-grids/SKILL.md) — Data Grid, Tree Grid, Hierarchical Grid, and Pivot Grid components
- [`igniteui-angular-theming`](../igniteui-angular-theming/SKILL.md) — Theming and styling with Ignite UI design tokens and component themes
