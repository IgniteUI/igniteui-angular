# igx-ButtonGroup

The **igx-ButtonGroup** component aims at providing a button group functionality to developers that also allow horizontal/vertical alignment, single/multiple selection with toggling. The igx-ButtonGroup component makes use of the igxButton directive.
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
| `selectionMode` | `'single'` \| `'singleRequired'` \| `'multi'` | Sets the selection mode of the buttons. `single` (default) allows one selected button that can be deselected, `singleRequired` keeps one button selected once a selection is made and `multi` allows selecting multiple buttons. |
| `alignment` |    enum   |   Set the button group alignment. Available enum members are ButtonGroupAlignment.horizontal (default) or ButtonGroupAlignment.vertical. |
| `disabled` | boolean | Disables the igx-ButtonGroup component. False by default. |
| `values` | `IButtonGroupButton[]` | Configures the buttons rendered by the group. They are rendered before any buttons projected in the group's content. Empty by default. |
| `itemContentCssClass` | string | CSS class applied to the content of each button rendered from `values`. |
| `buttons` | `IgxButtonDirective[]` | Gets all buttons in the group - the ones rendered from `values` followed by the projected ones. Read-only. |
| `selectedButtons` | `IgxButtonDirective[]` | Gets the selected button/buttons. Read-only. |

# IButtonGroupButton
Describes a button configured through the `values` input.

| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `label` | string | The text displayed in the button, also used as its `aria-label`. Buttons are tracked by `label`, so it should be unique within `values`. Required. |
| `icon` | string | The name of the icon displayed before the label. |
| `ripple` | string | The color of the ripple effect shown when the button is clicked. |
| `selected` | boolean | Whether the button is selected. Kept in sync with the selection state of the group. |
| `disabled` | boolean | Whether the button is disabled. Disabling the group disables all of its buttons. |
| `togglable` | boolean | Rendered as the button's `data-togglable` attribute. |

# API Methods
| Name   | Description |
|:----------|:------|
| `selectButton(index: number)` | Selects a button by its index.  |
| `deselectButton(index: number)` | Deselects a button by its index. |

# Events
| Name   | Description |
|:----------|:-------------:|
| `selected` | Fired when a button is selected through user interaction. |
| `deselected` | Fired when a button is deselected through user interaction. |

# Examples

Using `igx-ButtonGroup` to organize buttons into an Angular styled button group, configured through `values`.
```typescript
import { ButtonGroupAlignment, IButtonGroupButton } from 'igniteui-angular/button-group';

public alignment = ButtonGroupAlignment.vertical;
public buttons: IButtonGroupButton[] = [
    { label: 'Bold', icon: 'format_bold', selected: true },
    { label: 'Italic', icon: 'format_italic' },
    { label: 'Underline', icon: 'format_underlined', disabled: true }
];
```
```html
    <igx-buttongroup selectionMode="multi" [values]="buttons" [alignment]="alignment">
    </igx-buttongroup>
```

Projecting `igxButton` buttons in the group's content instead.
```html
    <igx-buttongroup selectionMode="singleRequired">
        <button igxButton [selected]="true">Day</button>
        <button igxButton>Week</button>
        <button igxButton>Month</button>
    </igx-buttongroup>
```
