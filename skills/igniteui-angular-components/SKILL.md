# Ignite UI for Angular — Components & Layout Skill

## Description

This skill teaches AI agents how to properly use Ignite UI for Angular UI components in Angular 20+ applications. It covers standalone component imports, the full component catalog, key APIs for the most-used components, form integration, overlay-based components, layout components, and common patterns.

## Prerequisites

- Angular 20+ project
- `igniteui-angular` installed via `npm install igniteui-angular` (or `@infragistics/igniteui-angular` for licensed users)
- A theme applied (see the Theming skill)

## Architecture

All Ignite UI components are **standalone** — no NgModules needed. Import components directly into your component's `imports` array:

```typescript
import { Component } from '@angular/core';
import { IgxButtonDirective } from 'igniteui-angular/button';
import { IgxDialogComponent } from 'igniteui-angular/dialog';

@Component({
  selector: 'app-example',
  imports: [IgxButtonDirective, IgxDialogComponent],
  templateUrl: './example.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {}
```

### Multi-Entry-Point Imports

Each component has its own entry point. Always import from the specific entry point, NOT from the main `igniteui-angular` barrel:

```typescript
// CORRECT — tree-shakeable
import { IgxComboComponent } from 'igniteui-angular/combo';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';

// AVOID — pulls in entire library
import { IgxComboComponent, IgxDatePickerComponent } from 'igniteui-angular';
```

### Convenience Directive Collections

For complex components with many sub-directives, use the provided directive arrays:

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

```html
<igx-select [(ngModel)]="selectedRole" placeholder="Choose role">
  @for (role of roles; track role.id) {
    <igx-select-item [value]="role.id">{{ role.name }}</igx-select-item>
  }
</igx-select>
```

#### Date Picker

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

```html
<igx-time-picker [(ngModel)]="selectedTime" [inputFormat]="'HH:mm'" [is24HourFormat]="true">
</igx-time-picker>
```

#### Calendar

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

```html
<igx-checkbox [(ngModel)]="rememberMe">Remember me</igx-checkbox>

<igx-radio name="plan" value="basic" [(ngModel)]="plan">Basic</igx-radio>
<igx-radio name="plan" value="pro" [(ngModel)]="plan">Pro</igx-radio>

<igx-switch [(ngModel)]="darkMode">Dark mode</igx-switch>
```

#### Slider

```html
<igx-slider [type]="SliderType.RANGE" [minValue]="0" [maxValue]="100"
            [lowerBound]="20" [upperBound]="80">
</igx-slider>
```

### Layout Components

#### Tabs

```html
<igx-tabs [(selectedIndex)]="activeTab">
  <igx-tab-item>
    <igx-tab-header>
      <igx-icon igxTabHeaderIcon>info</igx-icon>
      <span igxTabHeaderLabel>Info</span>
    </igx-tab-header>
    <igx-tab-content>Content for Info tab</igx-tab-content>
  </igx-tab-item>
  <igx-tab-item>
    <igx-tab-header>
      <span igxTabHeaderLabel>Settings</span>
    </igx-tab-header>
    <igx-tab-content>Settings content</igx-tab-content>
  </igx-tab-item>
</igx-tabs>
```

#### Bottom Navigation

```html
<igx-bottom-nav [(selectedIndex)]="activeNavItem">
  <igx-bottom-nav-item>
    <igx-bottom-nav-header><igx-icon>home</igx-icon><span>Home</span></igx-bottom-nav-header>
    <igx-bottom-nav-content>Home content</igx-bottom-nav-content>
  </igx-bottom-nav-item>
</igx-bottom-nav>
```

#### Stepper

```html
<igx-stepper [linear]="true" [orientation]="'horizontal'">
  <igx-step [completed]="step1Done">
    <div igxStepTitle>Account</div>
    <div igxStepSubtitle>Create your account</div>
    <div igxStepContent>
      <!-- form fields -->
    </div>
  </igx-step>
  <igx-step>
    <div igxStepTitle>Profile</div>
    <div igxStepContent>...</div>
  </igx-step>
</igx-stepper>
```

#### Accordion

```html
<igx-accordion [singleBranchExpand]="true">
  <igx-expansion-panel>
    <igx-expansion-panel-header>
      <igx-expansion-panel-title>Panel 1</igx-expansion-panel-title>
    </igx-expansion-panel-header>
    <igx-expansion-panel-body>Content 1</igx-expansion-panel-body>
  </igx-expansion-panel>
</igx-accordion>
```

#### Splitter

```html
<igx-splitter [type]="SplitterType.Horizontal">
  <igx-splitter-pane [size]="'30%'">Left panel</igx-splitter-pane>
  <igx-splitter-pane>Right panel</igx-splitter-pane>
</igx-splitter>
```

#### Navigation Drawer

```html
<igx-nav-drawer [isOpen]="drawerOpen" [pinThreshold]="1024">
  <ng-template igxDrawer>
    <nav>
      <span igxDrawerItem [isHeader]="true">Menu</span>
      <span igxDrawerItem igxRipple [active]="true" (click)="navigate('home')">
        <igx-icon>home</igx-icon><span>Home</span>
      </span>
    </nav>
  </ng-template>
  <ng-template igxDrawerMini>
    <span igxDrawerItem igxRipple><igx-icon>home</igx-icon></span>
  </ng-template>
</igx-nav-drawer>
```

### Data Display

#### List

```html
<igx-list>
  <igx-list-item [isHeader]="true">Contacts</igx-list-item>
  @for (contact of contacts; track contact.id) {
    <igx-list-item>
      <igx-avatar igxListThumbnail [src]="contact.avatar" shape="circle"></igx-avatar>
      <span igxListLine>{{ contact.name }}</span>
      <span igxListLineSubTitle>{{ contact.email }}</span>
      <igx-icon igxListAction (click)="call(contact)">phone</igx-icon>
    </igx-list-item>
  }
</igx-list>
```

#### Tree

```html
<igx-tree [selection]="'BiCascade'">
  @for (node of data; track node.id) {
    <igx-tree-node [data]="node" [expanded]="node.expanded">
      {{ node.label }}
      @for (child of node.children; track child.id) {
        <igx-tree-node [data]="child">{{ child.label }}</igx-tree-node>
      }
    </igx-tree-node>
  }
</igx-tree>
```

#### Card

```html
<igx-card>
  <igx-card-header>
    <igx-avatar igxCardHeaderThumbnail [src]="author.photo" shape="circle"></igx-avatar>
    <h3 igxCardHeaderTitle>{{ article.title }}</h3>
    <h5 igxCardHeaderSubtitle>{{ author.name }}</h5>
  </igx-card-header>
  <igx-card-content>
    <p>{{ article.excerpt }}</p>
  </igx-card-content>
  <igx-card-actions>
    <button igxButton="flat" igxRipple>Read More</button>
    <button igxIconButton="flat" igxRipple>
      <igx-icon>favorite</igx-icon>
    </button>
  </igx-card-actions>
</igx-card>
```

### Feedback & Overlays

#### Dialog

```html
<igx-dialog #confirmDialog [isModal]="true" [closeOnEscape]="true">
  <igx-dialog-title>Confirm Delete</igx-dialog-title>
  <p>Are you sure you want to delete this item?</p>
  <div igxDialogActions>
    <button igxButton="flat" (click)="confirmDialog.close()">Cancel</button>
    <button igxButton="raised" (click)="deleteItem(); confirmDialog.close()">Delete</button>
  </div>
</igx-dialog>

<button igxButton="raised" (click)="confirmDialog.open()">Delete</button>
```

#### Snackbar

```html
<igx-snackbar #snackbar [displayTime]="3000" [autoHide]="true">
  Item saved successfully
  <button igxButton="flat" igxSnackbarAction (click)="undo()">UNDO</button>
</igx-snackbar>
```

In TypeScript: `this.snackbar.open()`.

#### Toast

```html
<igx-toast #toast [displayTime]="2000">Operation complete</igx-toast>
```

#### Banner

```html
<igx-banner #banner>
  <igx-icon igxBannerIcon>warning</igx-icon>
  You are offline. Some features may not be available.
  <div igxBannerActions>
    <button igxButton="flat" (click)="banner.dismiss()">Dismiss</button>
    <button igxButton="flat" (click)="retry()">Retry</button>
  </div>
</igx-banner>
```

### Other Components

#### Chips

```html
<igx-chips-area>
  @for (tag of tags; track tag) {
    <igx-chip [removable]="true" (remove)="removeTag(tag)">{{ tag }}</igx-chip>
  }
</igx-chips-area>
```

#### Avatar & Badge

```html
<igx-avatar [src]="user.photo" shape="circle" size="large">
  <igx-badge igxAvatarBadge [type]="'success'" [icon]="'check'"></igx-badge>
</igx-avatar>
```

#### Icon

```html
<!-- Material icon (default) -->
<igx-icon>settings</igx-icon>

<!-- SVG icon from custom collection -->
<igx-icon [family]="'custom'" [name]="'my-icon'"></igx-icon>
```

Register SVG icons in a service:

```typescript
constructor() {
  const iconService = inject(IgxIconService);
  iconService.addSvgIconFromText('my-icon', '<svg>...</svg>', 'custom');
}
```

#### Carousel

```html
<igx-carousel [interval]="3000" [pause]="true" [loop]="true">
  @for (slide of slides; track slide.id) {
    <igx-slide>
      <img [src]="slide.image" />
    </igx-slide>
  }
</igx-carousel>
```

#### Paginator

```html
<igx-paginator
  [totalRecords]="data.length"
  [perPage]="10"
  [selectOptions]="[5, 10, 25, 50]"
  (perPageChange)="onPageSizeChange($event)"
  (pageChange)="onPageChange($event)">
</igx-paginator>
```

#### Progress Indicators

```html
<igx-linear-bar [value]="75" [max]="100" [type]="'info'" [striped]="true"></igx-linear-bar>

<igx-circular-bar [value]="65" [max]="100" [animate]="true"></igx-circular-bar>
```

#### Chat (AI Chat Component)

```html
<igx-chat [messages]="messages" [isSendDisabled]="isLoading" (sendMessage)="onSend($event)">
</igx-chat>
```

## Directives

### Button Variants

```html
<button igxButton="flat">Flat</button>
<button igxButton="raised">Raised</button>
<button igxButton="outlined">Outlined</button>
<button igxButton="fab"><igx-icon>add</igx-icon></button>
<button igxIconButton="flat"><igx-icon>edit</igx-icon></button>
```

### Ripple Effect

```html
<button igxButton="raised" igxRipple>Click me</button>
```

### Tooltip

```html
<button [igxTooltipTarget]="tooltipRef">Hover me</button>
<div igxTooltip #tooltipRef="tooltip">Tooltip content</div>
```

### Drag and Drop

```html
<div igxDrag>Drag me</div>
<div igxDrop (dropped)="onDrop($event)">Drop here</div>
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

1. **Always import from specific entry points** — avoid the main `igniteui-angular` barrel for tree-shaking
2. **All components are standalone** — do NOT set `standalone: true` in component decorators (it's the default in Angular 20+)
3. **Use `ChangeDetectionStrategy.OnPush`** for all components
4. **Use Angular signals** for state management (`signal()`, `computed()`)
5. **Use native control flow** — `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`
6. **Use `host` property** instead of `@HostBinding`/`@HostListener` decorators
7. **Prefer reactive forms** for form-heavy components
8. **Use `igxRipple`** on interactive elements for Material-style feedback
9. **Use `input()` signal** instead of `@Input()` decorator for component inputs
10. **Use `output()` function** instead of `@Output()` decorator for component outputs
