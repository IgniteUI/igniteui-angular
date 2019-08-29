# igx-divider

The **igx-divider** is a directive that groups content in lists and layout.

## Examples

### Basic Divider
```html
    <igx-divider></igx-divider>
```

### Dashed Divider
```html
    <!-- Will set in the divider `16px` on both sides.` -->
    <igx-divider type="dashed"></igx-divider>
```

### Vertical Divider
```html
    <igx-divider [vertical]="true"></igx-divider>
```

### Inset Divider
```html
    <!-- Will set in the divider `16px` from the left.` -->
    <igx-divider inset="16px"></igx-divider>
```

### Middle Inset Divider
```html
    <!-- Will set in the divider `16px` on both sides.` -->
    <igx-divider [middle]="true" inset="16px"></igx-divider>
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `id` | string | Unique identifier of the component. If not provided it will be automatically generated.|
| `role` | string | The role attribute of the divider. By default it's set to `separator`. |
| `type` | IgxDividerType | The type of the divider. Can be `default` or `dashed`. |
| `inset` | string | The space between the separator and the surrounding container. Provide the value in `px`, `%`, or relative units(`em`, `rem`). |
| `middle` | boolean | When set to `true`, the divider will be set in on both sides when an `inset` value is provided. |
| `vertical` | boolean | Whether the divider should be vertically layed out. |
