# igx-ButtonGroup

The **igx-ButtonGroup** component aims at providing a button group functionality to developers that also allow horizontal/vertical alignment, single/multiple selection with toggling. The igx-ButtounGroup component makes use of the igxButton directive.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/buttongroup.html)

# Usage
```html
<igx-buttongroup [.. options]>
</igx-buttongroup>
```

# API Summary
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `id` | string | Unique identifier of the component. If not provided it will be automatically generated.|
| `multiSelection` |  boolean | Enables selecting multiple buttons. Value by default is false.  |
| `alignment` |    enum   |   Set the button group alignment. Available enum members are ButtonGroupAlignment.horizontal (default) or ButtonGroupAlignment.vertical. |
| `disabled` | boolean | Disables the igxButtounGroup component. False by default. |

# API Methods
| Name   | Description |
|:----------|:------|
| `selectButton(index: number)` | Selects a button by its index.  |
| `deselectButton(index: number)` | Deselects a button by its index. |
| `selectedButtons()` | Gets the selected button/buttons. |

# Events
| Name   | Description |
|:----------|:-------------:|
| `onSelect` | Fired when a button is selected. |
| `onUnselect` | Fired when a button is unselected. |
| `onClick` | Fired when a button is clicked. |

# Examples

Using `igx-ButtonGroup` to organize buttons into an Angular styled button group.
```html
    <igx-buttongroup multiSelection="false" [values]="buttons" [alignment]="alignment">
    </igx-buttongroup>
```
