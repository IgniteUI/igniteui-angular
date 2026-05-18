# Form Controls & Reactive Forms Integration

> **Part of the [`igniteui-angular-components`](../SKILL.md) skill hub.**
> For app setup, providers, and import patterns — see [`setup.md`](./setup.md).

## Contents

- [Input Group](#input-group)
- [Combo (Multi-Select Dropdown)](#combo-multi-select-dropdown)
- [Simple Combo (Single-Select)](#simple-combo-single-select)
- [Select](#select)
- [Date Picker](#date-picker)
- [Date Range Picker](#date-range-picker)
- [Time Picker](#time-picker)
- [Calendar](#calendar)
- [Checkbox, Radio, Switch](#checkbox-radio-switch)
- [Slider](#slider)
- [Reactive Forms Integration](#reactive-forms-integration)
- [Key Rules](#key-rules)

## Overview
This reference gives high-level guidance on when to use each form control component, their key features, and common API members. For detailed documentation, call `get_doc` and `get_api_reference` from `igniteui-cli` with the specific component or feature you're interested in.

## Input Group

> **Docs:** [Input Group](https://www.infragistics.com/products/ignite-ui-angular/angular/components/input-group)

```typescript
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IgxIconComponent } from 'igniteui-angular/icon';
```

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

## Combo (Multi-Select Dropdown)

> **Docs:** [Combo Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo)

```typescript
import { IgxComboComponent } from 'igniteui-angular/combo';
```

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

## Simple Combo (Single-Select)

> **Docs:** [Combo — Single Selection](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo#single-selection)

```typescript
import { IgxSimpleComboComponent } from 'igniteui-angular/simple-combo';
```

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

## Select

> **Docs:** [Select Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/select)

```typescript
import { IgxSelectComponent, IgxSelectItemComponent } from 'igniteui-angular/select';
```

```html
<igx-select [(ngModel)]="selectedRole" placeholder="Choose role">
  @for (role of roles; track role.id) {
    <igx-select-item [value]="role.id">{{ role.name }}</igx-select-item>
  }
</igx-select>
```

## Date Picker

> **Docs:** [Date Picker](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date-picker)

```typescript
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';
```

```html
<igx-date-picker
  [(ngModel)]="selectedDate"
  [minValue]="minDate"
  [maxValue]="maxDate"
  [hideOutsideDays]="true"
  [displayMonthsCount]="2">
</igx-date-picker>
```

Implements `ControlValueAccessor` and `Validator`. Works with both reactive and template-driven forms.

## Date Range Picker

> **Docs:** [Date Range Picker](https://www.infragistics.com/products/ignite-ui-angular/angular/components/date-range-picker)

```typescript
import { IgxDateRangePickerComponent, IgxDateRangeStartComponent, IgxDateRangeEndComponent } from 'igniteui-angular/date-picker';
import { IgxDateTimeEditorDirective } from 'igniteui-angular/directives';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxPickerToggleComponent, IgxPickerClearComponent } from 'igniteui-angular/core';
```

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


`IgxDateRangePickerComponent` is imported from `igniteui-angular/date-picker`.

In the two-input configuration:

- place the `input` directly inside `igx-date-range-start` and `igx-date-range-end`
- use `igx-picker-toggle igxPrefix` for the calendar action
- use `igx-picker-clear igxSuffix` for the clear action

A plain `igx-prefix` or `igx-suffix` with an `igx-icon` is decorative only and does not trigger picker actions.
Do not wrap the inputs in an additional `igx-input-group`.

**Avoid these patterns in two-input mode:**

- `<igx-prefix><igx-icon>calendar_today</igx-icon></igx-prefix>`

- placing the toggle on only one input unless explicitly requested

Common two-input configuration with calendar toggles:

```html
<igx-date-range-picker [(ngModel)]="dateRange">
  <igx-date-range-start>
    <igx-picker-toggle igxPrefix>
      <igx-icon>calendar_today</igx-icon>
    </igx-picker-toggle>
    <label igxLabel>Start Date</label>
    <input igxInput igxDateTimeEditor type="text" />
    <igx-picker-clear igxSuffix>
      <igx-icon>clear</igx-icon>
    </igx-picker-clear>
  </igx-date-range-start>

  <igx-date-range-end>
    <igx-picker-toggle igxPrefix>
      <igx-icon>calendar_today</igx-icon>
    </igx-picker-toggle>
    <label igxLabel>End Date</label>
    <input igxInput igxDateTimeEditor type="text" />
    <igx-picker-clear igxSuffix>
      <igx-icon>clear</igx-icon>
    </igx-picker-clear>
  </igx-date-range-end>
</igx-date-range-picker>
```

## Time Picker

> **Docs:** [Time Picker](https://www.infragistics.com/products/ignite-ui-angular/angular/components/time-picker)

```typescript
import { IgxTimePickerComponent } from 'igniteui-angular/time-picker';
```

```html
<igx-time-picker
  [(ngModel)]="selectedTime"
  [inputFormat]="'HH:mm'"
  [is24HourFormat]="true">
</igx-time-picker>
```

## Calendar

> **Docs:** [Calendar Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/calendar)

```typescript
import { IgxCalendarComponent } from 'igniteui-angular/calendar';
```

```html
<igx-calendar
  [(ngModel)]="selectedDate"
  [selection]="'single'"
  [hideOutsideDays]="true"
  [weekStart]="1">
</igx-calendar>
```

Selection modes: `'single'`, `'multi'`, `'range'`.

## Checkbox, Radio, Switch

> **Docs:** [Checkbox](https://www.infragistics.com/products/ignite-ui-angular/angular/components/checkbox) · [Radio Button](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio-button) · [Switch](https://www.infragistics.com/products/ignite-ui-angular/angular/components/switch)

```typescript
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';
import { IgxRadioComponent, IgxRadioGroupDirective } from 'igniteui-angular/radio';
import { IgxSwitchComponent } from 'igniteui-angular/switch';
```

```html
<igx-checkbox [(ngModel)]="rememberMe">Remember me</igx-checkbox>

<igx-radio-group>
  <igx-radio name="plan" value="basic" [(ngModel)]="plan">Basic</igx-radio>
  <igx-radio name="plan" value="pro" [(ngModel)]="plan">Pro</igx-radio>
</igx-radio-group>

<igx-switch [(ngModel)]="darkMode">Dark mode</igx-switch>
```

## Slider

> **Docs:** [Slider Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/slider/slider)

```typescript
import { IgxSliderComponent, IgxSliderType } from 'igniteui-angular/slider';

public sliderType = IgxSliderType;
  public priceRange = {
      lower: 200,
      upper: 800
  };
```

```html
<!-- Single value -->
<igx-slider [minValue]="0" [maxValue]="100" [(ngModel)]="volume"></igx-slider>

<!-- Range slider -->
<igx-slider
  [type]="sliderType.RANGE"
  [minValue]="0"
  [maxValue]="100"
  [lowerBound]="20"
  [upperBound]="80">
</igx-slider>
```

## Reactive Forms Integration

All form controls implement `ControlValueAccessor` and work with both reactive and template-driven forms.

> **Docs:** [Angular Reactive Form Validation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/angular-reactive-form-validation)

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IgxComboComponent } from 'igniteui-angular/combo';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';
import { IgxSelectComponent, IgxSelectItemComponent } from 'igniteui-angular/select';

@Component({
  selector: 'app-my-form',
  imports: [
    ReactiveFormsModule,
    IGX_INPUT_GROUP_DIRECTIVES,
    IgxComboComponent,
    IgxDatePickerComponent,
    IgxSelectComponent,
    IgxSelectItemComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <igx-input-group>
        <label igxLabel>Name</label>
        <input igxInput formControlName="name" />
        @if (form.controls.name.invalid && form.controls.name.touched) {
          <igx-hint>Name is required</igx-hint>
        }
      </igx-input-group>

      <igx-combo
        [data]="skills"
        formControlName="skills"
        [valueKey]="'id'"
        [displayKey]="'name'"
        placeholder="Select skills">
      </igx-combo>

      <igx-date-picker formControlName="startDate"></igx-date-picker>

      <igx-select formControlName="role" placeholder="Choose role">
        @for (r of roles; track r.id) {
          <igx-select-item [value]="r.id">{{ r.name }}</igx-select-item>
        }
      </igx-select>
    </form>
  `
})
export class MyFormComponent {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    skills: new FormControl<number[]>([]),
    startDate: new FormControl<Date | null>(null),
    role: new FormControl<string | null>(null)
  });

  skills = [{ id: 1, name: 'Angular' }, { id: 2, name: 'TypeScript' }];
  roles = [{ id: 'admin', name: 'Admin' }, { id: 'user', name: 'User' }];

  submit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

## Key Rules

- **Always check `app.config.ts` first** — add `provideAnimations()` before using Combo, Select, Date Picker, or any overlay component
- **Import from specific entry points** — avoid the root `igniteui-angular` barrel
- Date/Time pickers implement both `ControlValueAccessor` and `Validator` — they integrate with reactive forms natively
- For `igx-date-range-picker` with separate start and end inputs, use this structure for both inputs: `igx-picker-toggle igxPrefix`, then `input igxInput igxDateTimeEditor`, then optional `igx-picker-clear igxSuffix`.
- Do not use a plain `igx-prefix` / `igx-suffix` icon for calendar or clear actions.

## See Also

- [`setup.md`](./setup.md) — App providers, architecture, all entry points
- [`layout.md`](./layout.md) — Tabs, Stepper, Accordion, Splitter, Navigation Drawer
- [`data-display.md`](./data-display.md) — List, Tree, Card and other display components
- [`feedback.md`](./feedback.md) — Dialog, Snackbar, Toast, Banner
- [`directives.md`](./directives.md) — Button, Ripple, Tooltip, Drag and Drop
