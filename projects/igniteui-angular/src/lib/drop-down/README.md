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

To provide more useful visual information, use `isHeader` to group items semantically, or `disabled` to display an item as non-interactive.

```html
<igx-drop-down>
    <igx-drop-down-item *ngFor="let item of items" disabled={{item.disabled}} isHeader={{item.header}}>
        {{ item.field }}
    </igx-drop-down-item>
</igx-drop-down>
```

## Grouping items
The **igxDropDown** allows for items to be grouped using the ***igxDropDownItemGroup** component. The example below illustrates how to display hierarchical data in drop down groups:
```typescript
    // in example.component.ts
    export class MyExampleComponent {
        ...
        foods: any[] =  [{
            name: 'Vegetables',
            entries: [{
                    name: 'Cucumber',
                    refNo: `00000` 
                }, {
                    name: 'Lettuce',
                    refNo: `00001`
                },
                ...
            ]   
        }, {
            name: 'Fruits',
            entries: [{
                    name: 'Banana',
                    refNo: `10000` 
                }, {
                    name: 'Tomato',
                    refNo: `10001`
                },
                ...
            ]   
        }];
    }
```
```html
    <!-- in example.component.html -->
    <igx-drop-down>
        <igx-drop-down-item-group *ngFor="let foodGroup of foods" [label]="foodGroup.name">
            <igx-drop-down-item *ngFor="let food of foodGroup.entries" [value]='food.refNo'>
                {{ food.name }}
            </igx-drop-down-item>
        </igx-drop-down-item-group>
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
| `maxHeight` | string | defines drop down maximum height |
| `allowItemsFocus` | boolean | Allows items to take focus. |
| `id` | string | Sets the drop down's id. |

<div class="divider--half"></div>

#### Outputs
The following outputs are available in the **igx-drop-down** component:

| Name | Cancelable | Description | Parameters
| :--- | :--- | :--- | :--- |
| `onSelection` | false | Emitted when item selection is changing, before the selection completes. | `{ISelectionEventArgs}` |
| `onOpening` | true | Emitted before the dropdown is opened. |
| `onOpened` | false | Emitted when a dropdown is being opened. |
| `onClosing` | true | Emitted before the dropdown is closed. |
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
| `selectedItem` | `any` | Gets the selected item. |
| `collapsed` | `boolean` | Gets if the drop down is collapsed. |
| `items` | `IgxDropDownItemComponent[]` | Gets all of the items but headers. |
| `headers` | `IgxDropDownItemComponent[]` | Gets header items. |
| `element`| `ElementRef` | Get dropdown html element. |
| `scrollContainer`| `ElementRef` | Get drop down's html element of its scroll container. |

The following table summarizes some of the useful **igx-drop-down-item** component inputs, outputs and methods.

#### Inputs
The following inputs are available in the **igx-drop-down-item** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `selected` | boolean| Defines if the item is the selected item. Only one item can be selected at time. |
| `isHeader` | boolean| Defines if the item is a group header. |
| `disabled` | boolean| Disables the given item. |
| `focused` | boolean| Defines if the given item is focused. |
| `value` | any | The value of the drop-down item. |

#### Getters
The following getters are available on the **igx-drop-down-item** component:

| Name | Type | Description |
| :--- | :--- | :--- |
| `index` | `number` | Gets item index. |
| `elementHeight` | `number` | Gets item element height. |
| `element`| `ElementRef` | Get item's html element. |
