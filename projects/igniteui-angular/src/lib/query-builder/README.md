# igx-query-builder
The **IgxQueryBuilder**  component provides a way to build complex queries through the UI. By specifying AND/OR operators, conditions and values the user creates an expression tree which describes the query.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/query-builder)

## Usage
```html
<igx-query-builder
    [fields]="fields"
    [expressionTree]="customExpressionTree">

    <!-- Custom header -->
    <igx-query-builder-header [title]="'Custom title for Query Builder'"
        [showLegend]="false">
    </igx-query-builder-header>

</igx-query-builder>
```

## API

### igx-query-builder

#### Properties

| Name | Type | Description |
| :--- | :--- | :--- |
| `fields`  | FieldType[]  | An array of fields to be filtered. Contains information about  label, field, type, operands. |
| `expressionTree`  | IExpressionTree  | Gets/Sets the displayed expressions tree. |
| `locale`  | string  | Locale settings for the component. If this locale is not set, its value to be determined based on the global Angular application LOCALE_ID. |
| Content Cell  | Content Cell  | Content Cell |
| `resourceStrings`  | IQueryBuilderResourceStrings  | Gets/sets the resource strings. |

#### Events

| Name | Description |
| :--- | :--- |
| `expressionTreeChange` | Emitted when condition, field, operand, value is changed. | no | - |

### igx-query-builder-header

#### Properties

| Name | Type | Description |
| :--- | :--- | :--- |
| `title` | string | Sets the title displayed in the header. |
| `showLegend` | boolean | Determines whether the legend items are displayed or not. Defaults to true. |
| `resourceStrings` | IQueryBuilderResourceStrings | Gets/sets the resource strings. |
