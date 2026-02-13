# IgxGridLite

**IgxGridLite** is a lightweight Angular wrapper component for the `igniteui-grid-lite` web component, providing a simple and performant data grid solution with essential features like sorting, filtering, and virtualization.

A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid-lite/overview)

## Usage

```html
<igx-grid-lite [data]="data" [autoGenerate]="true">
</igx-grid-lite>
```

Or with manual column definitions:

```html
<igx-grid-lite [data]="data">
    <igx-grid-lite-column 
        field="firstName" 
        header="First Name">
    </igx-grid-lite-column>
    <igx-grid-lite-column 
        field="age" 
        header="Age" 
        dataType="number">
    </igx-grid-lite-column>
</igx-grid-lite>
```

## Getting Started

### Installation
To get started, install Ignite UI for Angular package as well as the Ignite UI for Web Component one that powers the UI:

```shell
npm install igniteui-grid-lite
```

### Dependencies

The Grid Lite is exported as a standalone component, thus all you need to do in your application is to import the `IgxGridLiteComponent` and `IgxGridLiteColumnComponent` in your component:

```typescript
import { IgxGridLiteComponent, IgxGridLiteColumnComponent } from 'igniteui-angular/grids/lite';

@Component({
    selector: 'app-grid-lite-sample',
    templateUrl: './grid-lite-sample.html',
    standalone: true,
    imports: [IgxGridLiteComponent, IgxGridLiteColumnComponent]
})
export class GridLiteSampleComponent {
    public data = [
        { id: 1, firstName: 'John', lastName: 'Doe', age: 30 },
        { id: 2, firstName: 'Jane', lastName: 'Smith', age: 25 }
    ];
}
```

### Basic Configuration

Define the grid with auto-generated columns:

```html
<igx-grid-lite [data]="data" [autoGenerate]="true">
</igx-grid-lite>
```

Or define columns manually:

```html
<igx-grid-lite [data]="data">
    <igx-grid-lite-column field="id" header="ID" dataType="number"></igx-grid-lite-column>
    <igx-grid-lite-column field="firstName" header="First Name"></igx-grid-lite-column>
    <igx-grid-lite-column field="lastName" header="Last Name"></igx-grid-lite-column>
    <igx-grid-lite-column field="age" header="Age" dataType="number"></igx-grid-lite-column>
</igx-grid-lite>
```

### Sorting

Configure sorting mode:

```typescript
protected sortingOptions: IgxGridLiteSortingOptions = {
    mode: 'single'
}
```

```html
<igx-grid-lite [data]="data" [sortingOptions]="sortingOptions">
</igx-grid-lite>
```

Set initial sorting expressions:

```typescript
protected sortingExpressions: IgxGridLiteSortingExpression[] = [
    {
        key: 'firstName',
        direction: 'ascending'
    }
]
```

```html
<igx-grid-lite [data]="data" [sortingExpressions]="sortingExpressions">
</igx-grid-lite>
```

### Filtering

Set initial filtering expressions:

```typescript
protected filteringExpressions: IgxGridLiteFilteringExpression[] = [
    {
        key: 'age',
        condition: 'greaterThan',
        searchTerm: 50
    }
]
```

```html
<igx-grid-lite [data]="data" [filteringExpressions]="filteringExpressions">
</igx-grid-lite>
```

### Custom Templates

Define custom header templates:

```html
<igx-grid-lite [data]="data">
    <igx-grid-lite-column field="firstName" header="First Name">
        <ng-template igxGridLiteHeader let-column>
            <div>{{ column.header }} (Custom)</div>
        </ng-template>
    </igx-grid-lite-column>
</igx-grid-lite>
```

Define custom cell templates:

```html
<igx-grid-lite [data]="data">
    <igx-grid-lite-column field="active" header="Active">
        <ng-template igxGridLiteCell let-value>
            @if (value === true) {
                <span>Yes</span>
            } @else {
                <span>No</span>
            }
        </ng-template>
    </igx-grid-lite-column>
</igx-grid-lite>
```

### Events

Listen to sorting and filtering events:

```html
<igx-grid-lite 
    [data]="data"
    (sorting)="onSorting($event)"
    (sorted)="onSorted($event)"
    (filtering)="onFiltering($event)"
    (filtered)="onFiltered($event)">
</igx-grid-lite>
```

```typescript
public onSorting(event: CustomEvent<IgxGridLiteSortingExpression>) {
    console.log('Sorting initiated:', event.detail);
}

public onSorted(event: CustomEvent<IgxGridLiteSortingExpression>) {
    console.log('Sorting completed:', event.detail);
}

public onFiltering(event: CustomEvent<IgxGridLiteFilteringExpression>) {
    console.log('Filtering initiated:', event.detail);
}

public onFiltered(event: CustomEvent<IgxGridLiteFilteringExpression>) {
    console.log('Filtering completed:', event.detail);
}
```

## API

### Inputs

**IgxGridLiteComponent**

| Name | Type | Description |
|------|------|-------------|
| `data` | `any[]` | The data source for the grid |
| `autoGenerate` | `boolean` | Whether to auto-generate columns from data. Default is `false` |
| `sortingOptions` | `IgxGridLiteSortingOptions` | Configuration for sorting behavior (single/multiple mode) |
| `sortingExpressions` | `IgxGridLiteSortingExpression[]` | Initial sorting state |
| `filteringExpressions` | `IgxGridLiteFilteringExpression[]` | Initial filtering state |
| `dataPipelineConfiguration` | `IgxGridLiteDataPipelineConfiguration` | Configuration for remote data operations |

**IgxGridLiteColumnComponent**

| Name | Type | Description |
|------|------|-------------|
| `field` | `string` | The data field to bind to |
| `header` | `string` | The column header text |
| `dataType` | `'string' \| 'number' \| 'boolean' | The data type of the column. Default is `'string'` |
| `width` | `string` | The width of the column |
| `hidden` | `boolean` | Indicates whether the column is hidden. Default is `false` |
| `resizable` | `boolean` | Indicates whether the column is resizable. Default is `false` |
| `sortable` | `boolean` | Indicates whether the column is sortable. Default is `false` |
| `sortingCaseSensitive` | `boolean` | Whether sort operations will be case sensitive. Default is `false` |
| `sortConfiguration` | `IgxGridLiteColumnSortConfiguration<T>` | Sort configuration for the column (e.g., custom comparer) |
| `filterable` | `boolean` | Indicates whether the column is filterable. Default is `false` |
| `filteringCaseSensitive` | `boolean` | Whether filter operations will be case sensitive. Default is `false` |
| `headerTemplate` | `TemplateRef` | Custom template for the header |
| `cellTemplate` | `TemplateRef` | Custom template for cells |

### Outputs

| Name | Type | Description |
|------|------|-------------|
| `sorting` | `CustomEvent<IgxGridLiteSortingExpression>` | Emitted when sorting is initiated |
| `sorted` | `CustomEvent<IgxGridLiteSortingExpression>` | Emitted when sorting completes |
| `filtering` | `CustomEvent<IgxGridLiteFilteringExpression>` | Emitted when filtering is initiated |
| `filtered` | `CustomEvent<IgxGridLiteFilteringExpression>` | Emitted when filtering completes |

### Properties

| Name | Type | Description |
|------|------|-------------|
| `columns` | `IgxGridLiteColumnConfiguration[]` | Gets the column configuration |
| `rows` | `any[]` | Gets the currently rendered rows |
| `dataView` | `ReadonlyArray<T>` | Gets the data after sort/filter operations |

### Methods

| Name | Parameters | Description |
|------|------------|-------------|
| `sort` | `expressions: IgxGridLiteSortingExpression \| IgxGridLiteSortingExpression[]` | Performs a sort operation |
| `clearSort` | `key?: Keys<T>` | Clears sorting for a specific column or all columns |
| `filter` | `config: IgxGridLiteFilteringExpression \| IgxGridLiteFilteringExpression[]` | Performs a filter operation |
| `clearFilter` | `key?: Keys<T>` | Clears filtering for a specific column or all columns |
| `navigateTo` | `row: number, column?: Keys<T>, activate?: boolean` | Navigates to a specific cell |
| `getColumn` | `id: Keys<T> \| number` | Returns column configuration by field or index |

## Template Directives

### igxGridLiteHeader

Context properties:
- `$implicit` - The column configuration object
- `column` - The column configuration object

```html
<ng-template igxGridLiteHeader let-column>
    <div>{{ column.header }}</div>
</ng-template>
```

### igxGridLiteCell

Context properties:
- `$implicit` - The cell value
- `value` - The cell value
- `column` - The column configuration
- `rowIndex` - The row index
- `data` - The row data object

```html
<ng-template igxGridLiteCell let-value let-data="data">
    <div>{{ value }} - {{ data.otherField }}</div>
</ng-template>
```

## Related Components

- [IgxGrid](../grid/README.md) - Full-featured data grid with advanced capabilities
- [IgxTreeGrid](../tree-grid/README.md) - same-schema hierarchical or flat self-referencing data grid
- [IgxHierarchicalGrid](../hierarchical-grid/README.md) - Multi-level hierarchical schema data grid

## Additional Resources

- [Official Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid-lite/overview)
