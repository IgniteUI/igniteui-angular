# Layout Components

> **Part of the [`igniteui-angular-components`](../SKILL.md) skill hub.**
> For app setup, providers, and import patterns — see [`setup.md`](./setup.md).

## Tabs

> **Docs:** [Tabs Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabs)

```typescript
import { IGX_TABS_DIRECTIVES } from 'igniteui-angular/tabs';
import { IgxIconComponent } from 'igniteui-angular/icon';
```

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

Key inputs: `[(selectedIndex)]`, `[tabAlignment]` (`'start'` | `'end'` | `'center'` | `'justify'`), `[disableAnimation]`.

## Bottom Navigation

> **Docs:** [Bottom Navigation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabbar)

```typescript
import { IgxBottomNavComponent, IgxBottomNavItemComponent, IgxBottomNavHeaderComponent, IgxBottomNavContentComponent } from 'igniteui-angular/bottom-nav';
```

```html
<igx-bottom-nav [(selectedIndex)]="activeNavItem">
  <igx-bottom-nav-item>
    <igx-bottom-nav-header>
      <igx-icon>home</igx-icon>
      <span>Home</span>
    </igx-bottom-nav-header>
    <igx-bottom-nav-content>Home content</igx-bottom-nav-content>
  </igx-bottom-nav-item>
  <igx-bottom-nav-item>
    <igx-bottom-nav-header>
      <igx-icon>settings</igx-icon>
      <span>Settings</span>
    </igx-bottom-nav-header>
    <igx-bottom-nav-content>Settings content</igx-bottom-nav-content>
  </igx-bottom-nav-item>
</igx-bottom-nav>
```

## Stepper

> **Docs:** [Stepper Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/stepper)

```typescript
import { IGX_STEPPER_DIRECTIVES } from 'igniteui-angular/stepper';
```

```html
<igx-stepper [linear]="true" [orientation]="'horizontal'">
  <igx-step [completed]="step1Done">
    <div igxStepTitle>Account</div>
    <div igxStepSubtitle>Create your account</div>
    <div igxStepContent>
      <!-- form fields -->
    </div>
  </igx-step>
  <igx-step [optional]="true">
    <div igxStepTitle>Profile</div>
    <div igxStepSubtitle>Optional step</div>
    <div igxStepContent>...</div>
  </igx-step>
  <igx-step>
    <div igxStepTitle>Confirm</div>
    <div igxStepContent>Review and submit</div>
  </igx-step>
</igx-stepper>
```

Key inputs: `[linear]`, `[orientation]` (`'horizontal'` | `'vertical'`), `[stepType]` (`'indicator'` | `'title'` | `'full'`), `[animationType]`.

Events: `(activeStepChanging)`, `(activeStepChanged)`.

Programmatic navigation:
```typescript
stepper = viewChild.required(IgxStepperComponent);

next() { this.stepper().next(); }
prev() { this.stepper().prev(); }
navigateTo(index: number) { this.stepper().navigateTo(index); }
```

## Accordion

> **Docs:** [Accordion Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/accordion)

```typescript
import { IgxAccordionComponent } from 'igniteui-angular/accordion';
import { IGX_EXPANSION_PANEL_DIRECTIVES } from 'igniteui-angular/expansion-panel';
```

```html
<igx-accordion [singleBranchExpand]="true">
  <igx-expansion-panel>
    <igx-expansion-panel-header>
      <igx-expansion-panel-title>Panel 1</igx-expansion-panel-title>
      <igx-expansion-panel-description>Subtitle text</igx-expansion-panel-description>
    </igx-expansion-panel-header>
    <igx-expansion-panel-body>
      Content for panel 1
    </igx-expansion-panel-body>
  </igx-expansion-panel>
  <igx-expansion-panel>
    <igx-expansion-panel-header>
      <igx-expansion-panel-title>Panel 2</igx-expansion-panel-title>
    </igx-expansion-panel-header>
    <igx-expansion-panel-body>Content for panel 2</igx-expansion-panel-body>
  </igx-expansion-panel>
</igx-accordion>
```

Standalone `igx-expansion-panel` (without accordion):
```html
<igx-expansion-panel [(collapsed)]="isCollapsed">
  <igx-expansion-panel-header>
    <igx-expansion-panel-title>Settings</igx-expansion-panel-title>
  </igx-expansion-panel-header>
  <igx-expansion-panel-body>Content</igx-expansion-panel-body>
</igx-expansion-panel>
```

## Splitter

> **Docs:** [Splitter Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/splitter)

```typescript
import { IgxSplitterComponent, IgxSplitterPaneComponent, SplitterType } from 'igniteui-angular/splitter';
```

```html
<!-- Horizontal split (side by side) -->
<igx-splitter [type]="SplitterType.Horizontal" style="height: 400px">
  <igx-splitter-pane [size]="'30%'" [minSize]="'20%'">
    Left panel content
  </igx-splitter-pane>
  <igx-splitter-pane>
    Right panel content
  </igx-splitter-pane>
</igx-splitter>

<!-- Vertical split (top/bottom) -->
<igx-splitter [type]="SplitterType.Vertical" style="height: 600px">
  <igx-splitter-pane [size]="'50%'">Top panel</igx-splitter-pane>
  <igx-splitter-pane>Bottom panel</igx-splitter-pane>
</igx-splitter>
```

## Navigation Drawer

> **Docs:** [Navigation Drawer](https://www.infragistics.com/products/ignite-ui-angular/angular/components/navdrawer)

```typescript
import { IgxNavigationDrawerComponent, IgxNavDrawerItemDirective, IgxNavDrawerTemplateDirective, IgxNavDrawerMiniTemplateDirective } from 'igniteui-angular/navigation-drawer';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxRippleDirective } from 'igniteui-angular/directives';
```

```html
<igx-nav-drawer #drawer [isOpen]="drawerOpen" [pinThreshold]="1024" [pin]="isDesktop">
  <ng-template igxDrawer>
    <nav>
      <span igxDrawerItem [isHeader]="true">Navigation</span>
      <span igxDrawerItem igxRipple [active]="activeRoute === 'home'" routerLink="/home">
        <igx-icon>home</igx-icon>
        <span>Home</span>
      </span>
      <span igxDrawerItem igxRipple [active]="activeRoute === 'settings'" routerLink="/settings">
        <igx-icon>settings</igx-icon>
        <span>Settings</span>
      </span>
    </nav>
  </ng-template>
  <!-- Mini mode (icons only, shown when drawer is collapsed but pinned) -->
  <ng-template igxDrawerMini>
    <span igxDrawerItem igxRipple routerLink="/home"><igx-icon>home</igx-icon></span>
    <span igxDrawerItem igxRipple routerLink="/settings"><igx-icon>settings</igx-icon></span>
  </ng-template>
</igx-nav-drawer>

<button igxButton (click)="drawer.toggle()">Toggle Menu</button>
```

Key inputs: `[isOpen]`, `[pin]` (dock to content), `[pinThreshold]` (auto-pin at viewport width), `[width]`, `[miniWidth]`.

Events: `(opened)`, `(closed)`, `(pinChange)`.

> **AGENT INSTRUCTION:** The Navigation Drawer uses the Ignite UI overlay/animation system — ensure `provideAnimations()` is in `app.config.ts`.

## See Also

- [`setup.md`](./setup.md) — App providers, architecture, all entry points
- [`form-controls.md`](./form-controls.md) — Input Group, Combo, Select, Date/Time Pickers, Calendar, Checkbox, Radio, Switch, Slider
- [`data-display.md`](./data-display.md) — List, Tree, Card and other display components
- [`feedback.md`](./feedback.md) — Dialog, Snackbar, Toast, Banner
- [`directives.md`](./directives.md) — Button, Ripple, Tooltip, Drag and Drop
