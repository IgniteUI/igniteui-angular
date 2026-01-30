# IgxBreadcrumb

The `IgxBreadcrumb` component provides a navigation trail showing the user's current location within a site hierarchy.

## Usage

### Basic Usage

```html
<igx-breadcrumb>
  <igx-breadcrumb-item [routerLink]="['/home']" icon="home">Home</igx-breadcrumb-item>
  <igx-breadcrumb-item [routerLink]="['/products']">Products</igx-breadcrumb-item>
  <igx-breadcrumb-item [routerLink]="['/products', 'electronics']">Electronics</igx-breadcrumb-item>
  <igx-breadcrumb-item [disabled]="true">Laptops</igx-breadcrumb-item>
</igx-breadcrumb>
```

### Standalone Components

```typescript
import { IGX_BREADCRUMB_DIRECTIVES } from 'igniteui-angular/breadcrumb';

@Component({
  imports: [...IGX_BREADCRUMB_DIRECTIVES]
})
export class MyComponent {}
```

### NgModule

```typescript
import { IgxBreadcrumbModule } from 'igniteui-angular/breadcrumb';

@NgModule({
  imports: [IgxBreadcrumbModule]
})
export class MyModule {}
```

## Features

### Custom Separator

```html
<igx-breadcrumb separator="/">
  <!-- items -->
</igx-breadcrumb>
```

Or use a custom template:

```html
<igx-breadcrumb>
  <ng-template igxBreadcrumbSeparator>
    <igx-icon>arrow_forward</igx-icon>
  </ng-template>
  <!-- items -->
</igx-breadcrumb>
```

### Overflow/Collapse Behavior

When you have many breadcrumb items, you can limit the visible items:

```html
<igx-breadcrumb [maxItems]="4" [itemsBeforeCollapse]="1" [itemsAfterCollapse]="2">
  <!-- items -->
</igx-breadcrumb>
```

This will show the first item, an ellipsis (...), and the last 2 items.

### Router Integration

Use the `IgxBreadcrumbService` to automatically generate breadcrumbs from route configuration:

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
```

```typescript
// Component
@Component({...})
export class AppComponent {
  breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
  
  constructor(private breadcrumbService: IgxBreadcrumbService) {}
}
```

```html
<igx-breadcrumb>
  @for (item of breadcrumbs$ | async; track item.label) {
    <igx-breadcrumb-item 
      [routerLink]="item.routerLink" 
      [disabled]="item.disabled"
      [icon]="item.icon">
      {{ item.label }}
    </igx-breadcrumb-item>
  }
</igx-breadcrumb>
```

## Inputs

### IgxBreadcrumbComponent

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `separator` | `string` | `'›'` | Custom separator character between crumbs |
| `maxItems` | `number` | - | Maximum number of visible items before overflow |
| `itemsBeforeCollapse` | `number` | `1` | Number of items visible before the collapsed section |
| `itemsAfterCollapse` | `number` | `1` | Number of items visible after the collapsed section |
| `type` | `BreadcrumbType` | `'location'` | Breadcrumb type: 'location', 'attribute', or 'dynamic' |

### IgxBreadcrumbItemComponent

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `link` | `string` | - | Navigation URL (standard href) |
| `routerLink` | `string \| any[]` | - | Angular Router link |
| `disabled` | `boolean` | `false` | Whether the item is non-clickable |
| `icon` | `string` | - | Icon name to display |

## Accessibility

The component follows WAI-ARIA best practices:

- Uses `role="navigation"` on the component
- Uses `aria-label="breadcrumb"` for screen readers
- Uses semantic `<ol>` and `<li>` elements
- Adds `aria-current="page"` to the current/last item
- Supports keyboard navigation with Tab/Shift+Tab
