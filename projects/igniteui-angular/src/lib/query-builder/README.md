# igx-query-builder
The **IgxQueryBuilder**  component provides a way to build complex queries through the UI. By specifying AND/OR operators, conditions and values the user creates an expression tree which describes the query.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/query-builder)

## Usage
```html
<igx-query-builder
    [entities]="entities"
    [expressionTree]="customExpressionTree">

    <!-- Custom header -->
    <igx-query-builder-header [title]="'Custom title for Query Builder'">
    </igx-query-builder-header>

</igx-query-builder>
```

## API

### igx-query-builder

#### Properties

| Name | Type | Description |
| :--- | :--- | :--- |
| `entities`  | EntityType[]  | An array of entities. Contains information about name and fields. |
| `expressionTree`  | IExpressionTree  | Gets/Sets the displayed expressions tree. |
| `locale`  | string  | Locale settings for the component. If this locale is not set, its value to be determined based on the global Angular application LOCALE_ID. |
| `resourceStrings`  | IQueryBuilderResourceStrings  | Gets/sets the resource strings. |
| `showEntityChangeDialog` | boolean | Gets/sets whether the confirmation dialog should be shown when changing entity. |
| `disableEntityChange` | boolean | Gets/sets whether the entity select on root level should be disabled after the initial selection. |
| `disableFieldsChange` | boolean | Gets/sets whether the fields combo on root level should be disabled. |

#### Events

| Name | Description |
| :--- | :--- |
| `expressionTreeChange` | Emitted when entity, return fields, condition, field, operand, value is changed. | no | - |

### igx-query-builder-header

#### Properties

| Name | Type | Description |
| :--- | :--- | :--- |
| `title` | string | Sets the title displayed in the header. |
