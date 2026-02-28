# IgxBreadcrumb Component Specification 

### Contents

1. [Overview](#1-overview)
2. [User Stories](#2-user-stories)
3. [Functionality](#3-functionality)
4. [Test Scenarios](#4-test-scenarios)
5. [Accessibility](#5-accessibility)
6. [Assumptions and Limitations](#6-assumptions-and-limitations)
7. [References](#7-references)

### Owned by
**Ignite UI Angular Team**

**Developer Name**: Copilot AI Assistant

**Designer Name**: TBD

### Requires approval from
- [ ] Peer Developer Name | Date: 
- [ ] Design Manager Name | Date: 

### Signed off by
- [ ] Product Owner Name | Date: 
- [ ] Platform Architect Name | Date: 

## Revision History

| Version | Users                              | Date              | Notes                                     |
|--------:|------------------------------------|-------------------|-------------------------------------------|
| 1       | Copilot AI Assistant              | January 7, 2026   | Initial specification                     |

## <a name="1-overview"></a>1. Overview

### Objectives

The IgxBreadcrumb component provides a navigation aid that shows users their current location within a website or application hierarchy. It enables users to easily navigate back through the hierarchical structure of pages or sections they have visited.

**High-level goals:**
- Provide clear visual indication of the user's current location in the application hierarchy
- Enable easy navigation to parent/ancestor pages
- Support multiple navigation patterns (router-based, href-based, manual)
- Handle long navigation trails gracefully with overflow/collapse functionality
- Maintain accessibility standards for keyboard and screen reader users
- Offer customization options for separators and styling

**End-to-end user experience:**
- Users see a horizontal trail of navigation links representing their path through the application
- Users can click on any breadcrumb item to navigate to that level
- The current page is visually distinguished and non-clickable
- Long breadcrumb trails are automatically collapsed with an ellipsis indicator
- Custom separators and icons enhance visual clarity

### Acceptance criteria 

**Must-have before we can consider the feature a sprint candidate:**

1. Component renders a semantic `<ol>` list with breadcrumb items
2. Supports Angular Router integration via `routerLink` directive
3. Supports standard HTML links via `href` attribute
4. Implements overflow/collapse behavior when items exceed `maxItems`
5. Provides custom separator support (both string and template)
6. Marks the last item as current with `aria-current="page"`
7. Supports keyboard navigation (Tab/Shift+Tab)
8. Integrates with Angular Router service for automatic breadcrumb generation
9. Includes comprehensive unit tests (21+ tests)
10. Provides JSDoc documentation for all public APIs
11. Supports standalone component usage and NgModule imports
12. Follows WAI-ARIA breadcrumb pattern guidelines

## <a name="2-user-stories"></a>2. User Stories

**Developer stories:**

- **Story 1**: As a developer, I want to easily add a breadcrumb navigation to my Angular application using `igx-breadcrumb` component, so that I can provide users with contextual navigation without writing custom navigation logic.

- **Story 2**: As a developer, I want to automatically generate breadcrumbs from my Angular router configuration, so that I don't have to manually maintain breadcrumb state in sync with routing changes.

- **Story 3**: As a developer, I want to customize the breadcrumb separator (character or icon), so that I can match my application's design system and branding.

- **Story 4**: As a developer, I want to control how many breadcrumb items are visible before they collapse, so that I can prevent breadcrumb overflow in responsive layouts.

- **Story 5**: As a developer, I want to use breadcrumbs with standard href links or Angular router links, so that I can integrate breadcrumbs into any type of navigation architecture.

- **Story 6**: As a developer, I want to add icons to breadcrumb items, so that I can provide visual cues that improve scanability and recognition.

- **Story 7**: As a developer, I want to style the breadcrumb component with CSS variables and custom classes, so that I can match the component to my application's theme.

**End-user stories:**

- **Story 1**: As an end-user, I want to see where I am in the application hierarchy, so that I understand my current context and location.

- **Story 2**: As an end-user, I want to click on any breadcrumb item to navigate back to that level, so that I can quickly move through the application without using the back button multiple times.

- **Story 3**: As an end-user, I want to see the current page clearly distinguished in the breadcrumb trail, so that I know which page I'm currently viewing.

- **Story 4**: As an end-user using a keyboard, I want to navigate through breadcrumb links using Tab and activate them with Enter, so that I can use the breadcrumb without a mouse.

- **Story 5**: As an end-user using a screen reader, I want to hear that this is a breadcrumb navigation and which item is the current page, so that I understand the navigation structure and my location.

- **Story 6**: As an end-user on a mobile device with limited screen space, I want long breadcrumb trails to be collapsed intelligently, so that the breadcrumb doesn't overwhelm the interface.

## <a name="3-functionality"></a>3. Functionality

### 3.1. End-User Experience 

**Visual Design:**

The breadcrumb component displays as a horizontal list of navigation items separated by a visual separator (default: ›). Each item except the current page is interactive and styled to indicate clickability. The current page is visually distinct and non-interactive.

**Integration scenarios:**

1. **E-commerce site navigation**: Display product category hierarchy (Home > Electronics > Laptops > Gaming Laptops > ASUS ROG)
2. **Documentation portal**: Show documentation section path (Docs > Components > Navigation > Breadcrumb)
3. **File management interface**: Display folder hierarchy (My Drive > Projects > 2026 > Q1)
4. **Multi-step forms**: Indicate progress through form sections (Personal Info > Address > Payment > Review)

**Prepared design files:**

- Light theme: Default styling with high contrast links
- Dark theme: Adjusted colors for dark backgrounds
- Compact density: Reduced padding and font size for dense layouts
- Cosy density: Balanced spacing for most use cases
- Comfortable density: Generous spacing for touch-friendly interfaces

**Sample Screenshots:**

![Breadcrumb Samples](https://github.com/user-attachments/assets/1fae51ed-40d9-4566-97fc-9624cdbb9709)

The sample app demonstrates:
1. Basic breadcrumb with icons and disabled current page
2. Custom separator character (/)
3. Icon separator using ng-template
4. Collapsed items (overflow behavior)
5. Standard href links
6. Dynamic/data-driven items
7. Custom styled breadcrumb with gradient background

### 3.2. Developer Experience 

**Basic Implementation:**

```typescript
import { Component } from '@angular/core';
import { IGX_BREADCRUMB_DIRECTIVES } from 'igniteui-angular/breadcrumb';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [IGX_BREADCRUMB_DIRECTIVES],
  template: `
    <igx-breadcrumb>
      <igx-breadcrumb-item [routerLink]="['/home']" icon="home">Home</igx-breadcrumb-item>
      <igx-breadcrumb-item [routerLink]="['/products']">Products</igx-breadcrumb-item>
      <igx-breadcrumb-item [disabled]="true">Current Page</igx-breadcrumb-item>
    </igx-breadcrumb>
  `
})
export class NavigationComponent {}
```

**Router Integration:**

```typescript
// Route configuration
const routes: Routes = [
  { path: '', data: { breadcrumb: 'Home' }, component: HomeComponent },
  { 
    path: 'products', 
    data: { breadcrumb: 'Products' },
    children: [
      { path: ':id', data: { breadcrumb: 'Product Details' }, component: ProductComponent }
    ]
  }
];

// Component
@Component({
  selector: 'app-root',
  template: `
    <igx-breadcrumb>
      @for (item of breadcrumbs$ | async; track item.label) {
        <igx-breadcrumb-item 
          [routerLink]="item.routerLink" 
          [disabled]="item.disabled">
          {{ item.label }}
        </igx-breadcrumb-item>
      }
    </igx-breadcrumb>
  `
})
export class AppComponent {
  breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
  
  constructor(private breadcrumbService: IgxBreadcrumbService) {}
}
```

**Custom Separator:**

```html
<!-- String separator -->
<igx-breadcrumb separator="/">
  <!-- items -->
</igx-breadcrumb>

<!-- Template separator -->
<igx-breadcrumb>
  <ng-template igxBreadcrumbSeparator>
    <igx-icon>chevron_right</igx-icon>
  </ng-template>
  <!-- items -->
</igx-breadcrumb>
```

**Overflow/Collapse:**

```html
<igx-breadcrumb 
  [maxItems]="4" 
  [itemsBeforeCollapse]="1" 
  [itemsAfterCollapse]="2">
  <!-- 6+ items will show: First ... SecondToLast Last -->
</igx-breadcrumb>
```

### 3.3. Globalization/Localization 

**Localizable strings:**
- `aria-label="breadcrumb"` - Should be localized to the user's language
- Tooltip for collapsed items - Displays collapsed breadcrumb labels joined by separator

**Regional considerations:**
- RTL (Right-to-Left) support: Component automatically adjusts layout for RTL languages
- Separator orientation: Visual separators should flip in RTL mode
- Icon handling: Icons like chevrons should be mirrored in RTL layouts

**Developer implementation:**

```typescript
// Custom aria-label for localization
<igx-breadcrumb [attr.aria-label]="'navigation.breadcrumb' | translate">
  <!-- items -->
</igx-breadcrumb>
```

### 3.4. Keyboard Navigation

| Keys | Description |
|------|-------------|
| **Tab** | Moves focus to the next breadcrumb link in the sequence |
| **Shift + Tab** | Moves focus to the previous breadcrumb link |
| **Enter** | Activates the focused breadcrumb link (navigates to that page) |
| **Space** | Activates the focused breadcrumb link (navigates to that page) |

**Notes:**
- The current/disabled item is not focusable
- Focus is indicated by a visible outline following WCAG 2.1 guidelines
- Focus order follows the visual order (left-to-right in LTR, right-to-left in RTL)

### 3.5. API

### Options (Input Properties)

**IgxBreadcrumbComponent:**

| Name | Description | Type | Default value | Valid values |
|------|-------------|------|---------------|--------------|
| `id` | Sets the value of the id attribute | `string` | Auto-generated (`igx-breadcrumb-{n}`) | Any valid HTML id |
| `separator` | Custom separator character between crumbs | `string` | `'›'` | Any string |
| `maxItems` | Maximum number of visible items before overflow/collapsing | `number` | `undefined` (all visible) | Positive integer |
| `itemsBeforeCollapse` | Number of items visible before the collapsed section | `number` | `1` | Positive integer |
| `itemsAfterCollapse` | Number of items visible after the collapsed section | `number` | `1` | Positive integer |
| `type` | Breadcrumb type determining display behavior | `BreadcrumbType` | `'location'` | `'location'` \| `'attribute'` \| `'dynamic'` |

**IgxBreadcrumbItemComponent:**

| Name | Description | Type | Default value | Valid values |
|------|-------------|------|---------------|--------------|
| `id` | Sets the value of the id attribute | `string` | Auto-generated (`igx-breadcrumb-item-{n}`) | Any valid HTML id |
| `link` | Navigation URL (standard href) | `string` | `undefined` | Valid URL string |
| `routerLink` | Angular Router link | `string \| any[]` | `undefined` | Router link path |
| `disabled` | Whether the item is non-clickable | `boolean` | `false` | `true` \| `false` |
| `icon` | Icon name to display before the label | `string` | `undefined` | Valid icon name |

### Methods

**IgxBreadcrumbComponent:**

| Name | Description | Return type | Parameters |
|------|-------------|-------------|------------|
| `visibleItems` | Returns the visible items based on maxItems and collapse settings | `IgxBreadcrumbItemComponent[]` | None |
| `hiddenItems` | Returns the items that are collapsed (hidden in ellipsis) | `IgxBreadcrumbItemComponent[]` | None |
| `hasCollapsedItems` | Returns whether there are collapsed items | `boolean` | None |
| `getCollapsedItemsTooltip` | Returns tooltip text for collapsed items | `string` | None |

**IgxBreadcrumbService:**

| Name | Description | Return type | Parameters |
|------|-------------|-------------|------------|
| `breadcrumbs$` | Observable of the current breadcrumb items | `Observable<IBreadcrumbItem[]>` | None |
| `breadcrumbs` | Returns the current breadcrumb items | `IBreadcrumbItem[]` | None |
| `setBreadcrumbs` | Manually sets the breadcrumb items | `void` | `items: IBreadcrumbItem[]` |
| `addBreadcrumb` | Adds a breadcrumb item to the end of the trail | `void` | `item: IBreadcrumbItem` |
| `clearBreadcrumbs` | Clears all breadcrumb items | `void` | None |
| `refresh` | Refreshes breadcrumbs from the current route | `void` | None |

### Events

**IgxBreadcrumbComponent:**

| Name | Description | Cancelable | Parameters |
|------|-------------|------------|------------|
| - | No events currently emitted | - | - |

**Note:** Navigation events are handled by Angular Router or standard link behavior. Future versions may add custom events for breadcrumb interactions.

### Directives

**IgxBreadcrumbSeparatorDirective:**
- **Selector:** `[igxBreadcrumbSeparator]`
- **Purpose:** Provides a custom separator template for the breadcrumb
- **Usage:** Applied to `<ng-template>` element within `igx-breadcrumb`

**IgxBreadcrumbItemTemplateDirective:**
- **Selector:** `[igxBreadcrumbItemTemplate]`
- **Purpose:** Provides a custom item template for the breadcrumb
- **Usage:** Applied to `<ng-template>` element within `igx-breadcrumb`

### Types and Interfaces

**BreadcrumbType:**
```typescript
type BreadcrumbType = 'location' | 'attribute' | 'dynamic';
```

**IBreadcrumbItem:**
```typescript
interface IBreadcrumbItem {
  label: string;
  link?: string;
  routerLink?: string | any[];
  disabled?: boolean;
  icon?: string;
}
```

## <a name="4-test-scenarios"></a>4. Test Scenarios

### Automation

**Component Initialization:**
- Scenario 1: Component initializes successfully with default properties
- Scenario 2: Component generates unique ID when not provided
- Scenario 3: Component has correct ARIA roles and labels

**Basic Functionality:**
- Scenario 4: Breadcrumb renders correct number of items
- Scenario 5: Last item is automatically marked as current
- Scenario 6: Default separator (›) is displayed between items
- Scenario 7: Custom string separator is rendered correctly
- Scenario 8: Custom template separator is rendered correctly

**Navigation:**
- Scenario 9: RouterLink navigation works for breadcrumb items
- Scenario 10: Standard href links work for breadcrumb items
- Scenario 11: Disabled items are not clickable
- Scenario 12: Current item has aria-current="page" attribute

**Overflow/Collapse Behavior:**
- Scenario 13: All items visible when count ≤ maxItems
- Scenario 14: Items collapse when count > maxItems
- Scenario 15: Correct items visible based on itemsBeforeCollapse setting
- Scenario 16: Correct items visible based on itemsAfterCollapse setting
- Scenario 17: Ellipsis displayed for collapsed items
- Scenario 18: Tooltip shows collapsed item labels
- Scenario 19: Hidden items marked with isHidden property

**Icons:**
- Scenario 20: Icon displays correctly for breadcrumb items
- Scenario 21: Icon and label render together properly

**Router Service Integration:**
- Scenario 22: Service builds breadcrumbs from route data
- Scenario 23: Service updates breadcrumbs on route changes
- Scenario 24: Service allows manual breadcrumb override
- Scenario 25: Service resolves dynamic breadcrumb labels

**Accessibility:**
- Scenario 26: Semantic <ol> and <li> structure is rendered
- Scenario 27: role="navigation" is present on component
- Scenario 28: aria-label="breadcrumb" is present
- Scenario 29: aria-current="page" on last/current item
- Scenario 30: Keyboard navigation works (Tab/Shift+Tab)
- Scenario 31: Links are focusable and activatable with Enter/Space

**Edge Cases:**
- Scenario 32: Component handles empty items list gracefully
- Scenario 33: Component handles single item correctly
- Scenario 34: Component handles very long item labels
- Scenario 35: Component updates when items change dynamically

## <a name="5-accessibility"></a>5. Accessibility

### ARIA Support

The IgxBreadcrumb component follows the [WAI-ARIA Breadcrumb Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/) guidelines:

**Structural Roles:**
- `role="navigation"` on the breadcrumb container
- `aria-label="breadcrumb"` to identify the navigation type
- Semantic `<ol>` (ordered list) element for the breadcrumb trail
- `<li>` (list item) elements for each breadcrumb

**State Management:**
- `aria-current="page"` on the current/last breadcrumb item
- Disabled items are not focusable and have visual indicators

**Keyboard Support:**
- Full keyboard navigation via Tab/Shift+Tab
- Link activation via Enter or Space keys
- Focus visible indicators for all interactive elements

**Screen Reader Support:**
- Announces as "breadcrumb navigation"
- Reads each item label and separator
- Identifies current page with "current page" announcement
- Collapsed items tooltip provides context for hidden items

**WCAG 2.1 Compliance:**
- **1.3.1 Info and Relationships (Level A)**: Semantic HTML structure conveys relationships
- **2.1.1 Keyboard (Level A)**: All functionality available via keyboard
- **2.4.8 Location (Level AAA)**: Breadcrumb clearly indicates user's location
- **3.2.3 Consistent Navigation (Level AA)**: Breadcrumb provides consistent navigation mechanism
- **4.1.2 Name, Role, Value (Level A)**: All elements have appropriate ARIA attributes

### RTL Support

**Automatic RTL Handling:**
- Component automatically detects RTL mode from `dir` attribute
- Visual layout mirrors horizontally in RTL mode
- Text alignment adjusts appropriately

**RTL-Specific Behaviors:**
- Breadcrumb order reverses (rightmost is first, leftmost is last)
- Separator icons/characters flip direction (e.g., › becomes ‹)
- Focus order follows RTL visual order
- Ellipsis position adjusts for RTL reading direction

**Developer Control:**
```html
<div dir="rtl">
  <igx-breadcrumb>
    <!-- Automatically renders in RTL mode -->
  </igx-breadcrumb>
</div>
```

**CSS Considerations:**
- Uses logical properties (e.g., `padding-inline-start` instead of `padding-left`)
- Bidirectional icons use `transform: scaleX(-1)` in RTL mode
- Flexbox order adjusts automatically

## <a name="6-assumptions-and-limitations"></a>6. Assumptions and Limitations

| Assumptions | Limitation Notes |
|-------------|-----------------|
| Breadcrumb items are provided by the developer (manually or via service) | Component does not automatically detect or generate breadcrumbs without explicit configuration |
| Angular Router is configured when using `routerLink` | `routerLink` functionality requires Angular Router to be imported in the application |
| Icons use the library's icon component | Icon names must be valid for the IgxIconComponent (Material Icons or custom registered icons) |
| Breadcrumb trail fits within parent container | Component does not implement horizontal scrolling; use `maxItems` for overflow management |
| Separator template is static | Custom separator template cannot dynamically change based on item position |
| Labels are provided as text content | Complex HTML content in labels may not work with tooltip generation for collapsed items |
| Service relies on route data configuration | Automatic breadcrumb generation requires routes to have `data: { breadcrumb: 'Label' }` |
| Single breadcrumb instance per navigation context | Multiple breadcrumb instances may conflict if using the shared IgxBreadcrumbService |
| Component is display: block by default | Developer must handle responsive layout and container width |
| No built-in animation for item changes | Items update immediately without transition effects |

## <a name="7-references"></a>7. References

**External Standards and Guidelines:**
- [WAI-ARIA Breadcrumb Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Angular Router Documentation](https://angular.dev/guide/routing)
- [Material Design Breadcrumbs](https://m2.material.io/components/breadcrumbs)

**Internal Documentation:**
- [Ignite UI for Angular Component Guidelines](https://github.com/IgniteUI/igniteui-angular/wiki)
- [Test Implementation Guidelines](https://github.com/IgniteUI/igniteui-angular/wiki/Test-implementation-guidelines-for-Ignite-UI-for-Angular)
- [Documentation Guidelines](https://github.com/IgniteUI/igniteui-angular/wiki/Documentation-Guidelines)

**Related Issues and PRs:**
- Issue #6642: Original feature request for IgxBreadcrumb component
- PR: feat(breadcrumb): Add IgxBreadcrumb component

**Code Repository:**
- [IgxBreadcrumb Source Code](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/breadcrumb)
- [Sample Applications](https://github.com/IgniteUI/igniteui-angular/tree/master/src/app/breadcrumb)

**Design Resources:**
- Component README: `/projects/igniteui-angular/breadcrumb/README.md`
- Sample Screenshots: [GitHub Assets](https://github.com/user-attachments/assets/1fae51ed-40d9-4566-97fc-9624cdbb9709)
