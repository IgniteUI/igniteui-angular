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
- [Autocomplete](#autocomplete)
- [Reactive Forms Integration](#reactive-forms-integration)
- [Key Rules](#key-rules)

## Input Group

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

> **Full doc in the MCP:** `get_doc({ framework: "angular", name: "combo" })` covers data binding, selection APIs, forms support, keyboard behavior, and known issues. Prefer it over this snippet when available.

```typescript
import { IgxComboComponent } from 'igniteui-angular/combo';
```

```html
<igx-combo [data]="cities" [valueKey]="'id'" [displayKey]="'name'" [(ngModel)]="selectedCityIds"></igx-combo>
```

## Simple Combo (Single-Select)

> **Full doc in the MCP:** `get_doc({ framework: "angular", name: "simple-combo" })`.

`IgxSimpleComboComponent` from `igniteui-angular/simple-combo` (its own entry point, not `/combo`). Same API as `igx-combo` but restricted to single selection.

## Select

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

```typescript
import { IgxDateRangePickerComponent, IgxDateRangeStartComponent, IgxDateRangeEndComponent } from 'igniteui-angular/date-picker';
import { IgxDateTimeEditorDirective } from 'igniteui-angular/directives';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxPickerToggleComponent, IgxPickerClearComponent } from 'igniteui-angular/core';
```

Two-input configuration rules — place the `input` directly inside `igx-date-range-start`/`igx-date-range-end` (no extra `igx-input-group` wrapper); use `igx-picker-toggle igxPrefix` for the calendar action and `igx-picker-clear igxSuffix` for the clear action on **both** inputs. A plain `igx-prefix`/`igx-suffix` icon is decorative only and does not trigger picker actions.

```html
<igx-date-range-picker [(ngModel)]="dateRange">
  <igx-date-range-start>
    <igx-picker-toggle igxPrefix><igx-icon>calendar_today</igx-icon></igx-picker-toggle>
    <label igxLabel>Start Date</label>
    <input igxInput igxDateTimeEditor type="text" />
    <igx-picker-clear igxSuffix><igx-icon>clear</igx-icon></igx-picker-clear>
  </igx-date-range-start>
  <igx-date-range-end>
    <igx-picker-toggle igxPrefix><igx-icon>calendar_today</igx-icon></igx-picker-toggle>
    <label igxLabel>End Date</label>
    <input igxInput igxDateTimeEditor type="text" />
    <igx-picker-clear igxSuffix><igx-icon>clear</igx-icon></igx-picker-clear>
  </igx-date-range-end>
</igx-date-range-picker>
```

## Time Picker

```typescript
import { IgxTimePickerComponent } from 'igniteui-angular/time-picker';
```

```html
<igx-time-picker
  [(ngModel)]="selectedTime"
  [inputFormat]="'HH:mm'">
</igx-time-picker>
```

## Calendar

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

## Autocomplete

```typescript
import { IgxAutocompleteDirective, IgxDropDownComponent, IgxDropDownItemComponent } from 'igniteui-angular/drop-down';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
```

```html
<igx-input-group type="border">
  <label igxLabel>City</label>
  <input igxInput type="text"
    [(ngModel)]="selectedCity"
    [igxAutocomplete]="citiesPanel" />
</igx-input-group>
<igx-drop-down #citiesPanel>
  @for (city of cities | startsWith:selectedCity; track city) {
    <igx-drop-down-item [value]="city">
      {{ city }}
    </igx-drop-down-item>
  }
</igx-drop-down>
```

The `igxAutocomplete` directive attaches to an input and displays a drop-down of suggestions as the user types. It references an `igx-drop-down` via a template variable.

Filtering is **not** built in — use a pipe or filter the data in the component to control which items appear.

## Reactive Forms Integration

All form controls implement `ControlValueAccessor` and work with both reactive and template-driven forms.

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
- How to choose between Combo, Simple Combo, Select, and Auto-complete:
  - Use `igx-combo` for multi-select dropdowns with built-in filtering and grouping
  - Use `igx-simple-combo` for single-select dropdowns with built-in filtering and grouping
  - Use `igx-select` for simple single-select dropdowns without filtering or grouping (or when you want to provide custom filtering UI)
  - Use `igxAutocomplete` for input fields with dynamic suggestions based on user input

## See Also

- [`setup.md`](./setup.md) — App providers, architecture, all entry points
- [`layout.md`](./layout.md) — Tabs, Stepper, Accordion, Splitter, Navigation Drawer
- [`data-display.md`](./data-display.md) — List, Tree, Card and other display components
- [`feedback.md`](./feedback.md) — Dialog, Snackbar, Toast, Banner
- [`directives.md`](./directives.md) — Button, Ripple, Tooltip, Drag and Drop
