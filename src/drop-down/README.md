# igxDropDown


**igxDropDown** displays a scrollable list of items which may be visually grouped and supports selection of a single item. Clicking or tapping an item selects it and closes the Drop Down.

A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/drop_down.html)

# Usage
## Drop downs are done by adding **igxDropDownListItems** to **igxDropDown** component 

```html
<igx-drop-down>
    <igx-drop-down-item *ngFor="let item of items">
        {{ item.field }}
    </igx-drop-down-item>
</igx-drop-down>
```

To provide more useful visual information, use `isHeader` to group items semantically or `isDisabled` to display an item as non-interactive.

```html
<igx-drop-down>
    <igx-drop-down-item *ngFor="let item of items" isDisabled={{item.disabled}} isHeader={{item.header}}>
        {{ item.field }}
    </igx-drop-down-item>
</igx-drop-down>
```

### API Summary
The following table summarizes some of the useful **igx-drop-down** component inputs, outputs and methods.

#### Inputs
The following inputs are available in the **igx-drop-down** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `width` | string | Sets the tab width of the control. |
| `height` | string | Sets the tab height of the control. |
| `allowItemsFocus` | boolean | Allows items to take focus. |

<div class="divider--half"></div>

#### Outputs
The following outputs are available in the **igx-drop-down** component:

| Name | Cancelable | Description | Parameters
| :--- | :--- | :--- | :--- |
| `onSelection` | false | Emitted when item selection is changing, before the selection completes. | `{ISelectionEventArgs}` |
| `onOpening` | false | Emitted before the dropdown is opened. |
| `onOpened` | false | Emitted when a dropdown is being opened. |
| `onClosed` | false | Emitted when a dropdown is being closed. |

#### Methods
The following methods are available in the **igx-drop-down** component:

| Signature | Description |
| :--- | :--- | :--- |
| `toggle()` | Toggles the drop down opened/closed. |
| `setSelectedItem(index: number)` | Selects dropdown item by index. |
| `open()` | Opens the dropdown. |
| `close()` | Closes the dropdown. |

#### Getters
The following getters are available on the **igx-drop-down** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `selectedItem` | `number` | Gets the selected item. |
| `items` | `IgxDropDownItemComponent[]` | Gets all of the items but headers. |
| `headers` | `IgxDropDownItemComponent[]` | Gets header items. |
| `element`| `ElementRef` | Get dropdown html element. |

The following table summarizes some of the useful **igx-drop-down-item** component inputs, outputs and methods.

#### Inputs
The following inputs are available in the **igx-drop-down-item** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `isHeader` | boolean| Defines if the item is a group header. |
| `isDisabled` | boolean| Disables the given item. |
| `isFocused` | boolean| Defines if the given item is focused. |

#### Getters
The following getters are available on the **igx-drop-down** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `isSelected` | `boolean` | Defines if the given item is selected. |
