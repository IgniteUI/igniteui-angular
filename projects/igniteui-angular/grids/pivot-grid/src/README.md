# igx-pivot-grid
**igx-pivot-grid**  is a data presentation control for displaying data in a pivot table. It enables users to perform complex analysis on the supplied data. Main purpose is to transform and display a flat array of data into a complex grouped structure with aggregated values based on the main 3 dimensions: rows, columns and values, which the user may specify depending on his/her business needs.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/pivotgrid)

## Usage
```html
<igx-pivot-grid [data]="origData" [pivotConfiguration]="pivotConfigHierarchy">
</igx-pivot-grid>
```

## Getting Started

### Dependencies
The grid is exported as as an `NgModule`, thus all you need to do in your application is to import the _IgxPivotGridModule_ inside your `AppModule`

```typescript
// app.module.ts

import { IgxPivotGridModule } from 'igniteui-angular';

@NgModule({
    imports: [
        ...
        IgxPivotGridModule,
        ...
    ]
})
export class AppModule {}
```

Each of the components, directives and helper classes in the _IgxPivotGridModule_ can be imported through _igniteui-angular_. While you don't need to import all of them to instantiate and use the pivot-grid, you usually will import them (or your editor will auto-import them for you) when declaring types that are part of the grid API.

```typescript
import { IgxPivotGridComponent } from 'igniteui-angular';
...

@ViewChild('myGrid', { read: IgxPivotGridComponent })
public grid: IgxPivotGridComponent;
```

### Basic configuration

Define the grid
```html
<igx-pivot-grid [data]="origData" [pivotConfiguration]="pivotConfigHierarchy">
</igx-pivot-grid>
```

```typescript
public pivotConfigHierarchy: IPivotConfiguration = {
        columns: [{
            memberName: 'Product',
            memberFunction: (data) => data.Product.Name,
            enabled: true
        }],
        rows: [{
            memberName: 'City',
            enabled: true
        }],
        values: [{
            member: 'NumberOfUnits',
            aggregate: {
                aggregator: IgxPivotNumericAggregate.sum,
                key: 'sum',
                label: 'Sum'
            },
            enabled: true
        }],
        filters: null
    };
```

## API

### Inputs

Below is the list of all inputs that are specific to the pivot-grid look/behavior:

|Name|Type|Description|
|--- |--- |--- |
|`pivotConfiguration`|IPivotConfiguration|Gets/Sets the pivot configuration with all related dimensions and values.|
|`pivotUI`|IPivotUISettings|Gets/Sets whether to show the ui for the pivot grid configuration - chips and their corresponding containers for row, filter, column dimensions and values. Also enables/disabled row dimension headers.|
|`defaultExpandState`| boolean | Gets/Sets the default expand state for all rows. |

Note that the pivot-grid extends base igx-grid, so most of the @Input properties make sense and work in the pivot-grid as well. Keep in mind that due to some specifics, not all grid features and @Input properties will work.

### Outputs

A list of the specific events emitted by the **igx-pivot-grid**:

|Name|Description|
|--- |--- |
|_Event emitters_|_Notify for a change_|
|`dimensionsChange`|Emitted when the dimension collection is changed via the grid chip area.|
|`valuesChange`|Emitted when the values collection is changed via the grid chip area.|


Defining handlers for these event emitters is done using declarative event binding:

```html
    <igx-pivot-grid #grid1 [data]="origData" [pivotConfiguration]="pivotConfigHierarchy" (dimensionsChange)='dimensionChange($event)'>
    </igx-pivot-grid>
```

### Methods
