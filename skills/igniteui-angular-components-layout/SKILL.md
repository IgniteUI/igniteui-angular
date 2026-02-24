---
name: igniteui-angular-components-layout
description: Ignite UI for Angular layout, data display, feedback/overlay components, and directives
user-invokable: true
---

# Ignite UI for Angular — Layout, Data Display & Directives Skill

## Description

This skill covers Ignite UI for Angular layout components (Tabs, Stepper, Accordion, Splitter, Navigation Drawer), data display components (List, Tree, Card), feedback/overlay components (Dialog, Snackbar, Toast, Banner), other UI components (Chips, Avatar, Badge, Icon, Carousel, Paginator, Progress Indicators, Chat), and directives (Buttons, Ripple, Tooltip, Drag and Drop).

It is a companion to the **igniteui-angular-components** skill which covers form controls, application setup, and architecture.

## Prerequisites & Setup

For application setup, required providers (`provideAnimations()`, `HammerModule`, `provideIgniteIntl()`), architecture details, and multi-entry-point import patterns, see the **igniteui-angular-components** skill.

All components below are **standalone** — import them directly into your component's `imports` array from their specific entry points (e.g., `igniteui-angular/tabs`, `igniteui-angular/dialog`). Replace `igniteui-angular` with `@infragistics/igniteui-angular` if using the licensed package.

## Component Catalog

### Layout Components

#### Tabs

> **Docs:** [Tabs Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabs)

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

> **Docs:** [Bottom Navigation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabbar)

```html
<igx-bottom-nav [(selectedIndex)]="activeNavItem">
  <igx-bottom-nav-item>
    <igx-bottom-nav-header><igx-icon>home</igx-icon><span>Home</span></igx-bottom-nav-header>
    <igx-bottom-nav-content>Home content</igx-bottom-nav-content>
  </igx-bottom-nav-item>
</igx-bottom-nav>
```

#### Stepper

> **Docs:** [Stepper Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/stepper)

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

> **Docs:** [Accordion Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/accordion)

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

> **Docs:** [Splitter Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/splitter)

```html
<igx-splitter [type]="SplitterType.Horizontal">
  <igx-splitter-pane [size]="'30%'">Left panel</igx-splitter-pane>
  <igx-splitter-pane>Right panel</igx-splitter-pane>
</igx-splitter>
```

#### Navigation Drawer

> **Docs:** [Navigation Drawer](https://www.infragistics.com/products/ignite-ui-angular/angular/components/navdrawer)

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

> **Docs:** [List Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/list)

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

> **Docs:** [Tree Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tree)

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

> **Docs:** [Card Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/card)

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

> **AGENT INSTRUCTION:** All components in this section rely on Angular animations and the Ignite UI overlay system. Before using them, ensure `provideAnimations()` (or `provideAnimationsAsync()`) is present in `app.config.ts`. If it is missing, add it — otherwise these components will throw runtime errors or silently fail to animate.

#### Dialog

> **Docs:** [Dialog Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/dialog)

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

> **Docs:** [Snackbar Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/snackbar)

```html
<igx-snackbar #snackbar [displayTime]="3000" [autoHide]="true">
  Item saved successfully
  <button igxButton="flat" igxSnackbarAction (click)="undo()">UNDO</button>
</igx-snackbar>
```

In TypeScript: `this.snackbar.open()`.

#### Toast

> **Docs:** [Toast Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toast)

```html
<igx-toast #toast [displayTime]="2000">Operation complete</igx-toast>
```

#### Banner

> **Docs:** [Banner Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/banner)

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

> **Docs:** [Chip Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chip)

```html
<igx-chips-area>
  @for (tag of tags; track tag) {
    <igx-chip [removable]="true" (remove)="removeTag(tag)">{{ tag }}</igx-chip>
  }
</igx-chips-area>
```

#### Avatar & Badge

> **Docs:** [Avatar](https://www.infragistics.com/products/ignite-ui-angular/angular/components/avatar) · [Badge](https://www.infragistics.com/products/ignite-ui-angular/angular/components/badge)

```html
<igx-avatar [src]="user.photo" shape="circle" size="large">
  <igx-badge igxAvatarBadge [type]="'success'" [icon]="'check'"></igx-badge>
</igx-avatar>
```

#### Icon

> **Docs:** [Icon Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/icon)

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

> **Docs:** [Carousel Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/carousel)

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

> **Docs:** [Paginator Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/paginator)

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

> **Docs:** [Linear Progress](https://www.infragistics.com/products/ignite-ui-angular/angular/components/linear-progress) · [Circular Progress](https://www.infragistics.com/products/ignite-ui-angular/angular/components/circular-progress)

```html
<igx-linear-bar [value]="75" [max]="100" [type]="'info'" [striped]="true"></igx-linear-bar>

<igx-circular-bar [value]="65" [max]="100" [animate]="true"></igx-circular-bar>
```

#### Chat (AI Chat Component)

> **Docs:** [Chat Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/chat)

```html
<igx-chat [messages]="messages" [isSendDisabled]="isLoading" (sendMessage)="onSend($event)">
</igx-chat>
```

## Directives

### Button Variants

> **Docs:** [Button Component](https://www.infragistics.com/products/ignite-ui-angular/angular/components/button)

```html
<button igxButton="flat">Flat</button>
<button igxButton="raised">Raised</button>
<button igxButton="outlined">Outlined</button>
<button igxButton="fab"><igx-icon>add</igx-icon></button>
<button igxIconButton="flat"><igx-icon>edit</igx-icon></button>
```

### Ripple Effect

> **Docs:** [Ripple Directive](https://www.infragistics.com/products/ignite-ui-angular/angular/components/ripple)

```html
<button igxButton="raised" igxRipple>Click me</button>
```

### Tooltip

> **Docs:** [Tooltip Directive](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tooltip)

```html
<button [igxTooltipTarget]="tooltipRef">Hover me</button>
<div igxTooltip #tooltipRef="tooltip">Tooltip content</div>
```

### Drag and Drop

> **Docs:** [Drag and Drop](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drag-drop)

```html
<div igxDrag>Drag me</div>
<div igxDrop (dropped)="onDrop($event)">Drop here</div>
```

## Key Rules

1. **Use `igxRipple`** on interactive elements for Material-style feedback

## Related Skills

- **igniteui-angular-components** — Form controls (Input Group, Combo, Select, Date/Time Pickers, Calendar, Checkbox, Radio, Switch, Slider), application setup, architecture, and multi-entry-point import patterns
- **igniteui-angular-grids** — Data Grid, Tree Grid, Hierarchical Grid, and Pivot Grid components
- **igniteui-angular-theming** — Theming and styling with Ignite UI design tokens and component themes
