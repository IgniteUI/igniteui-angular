# igx-combo
The igx-combo provides a powerful input, combining features of the basic HTML input, select and the IgniteUI for Angular igx-drop-down controls.
Control provides easy filtering and selection of multiple items, grouping and adding custom values to the list.
Templates for different parts of the control can be defined, including items, header and footer, etc.
Control is integrated with Template Driven and Reactive Forms.
The igx-combo exposes intiutive keyboard navigation and it is accessibility compliant.
Drop Down items are virtualized, which guarantees smooth work, even combo is bound to data source with a lot of items.


`igx-combo` is a component.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/combo.html)

# Usage
Basic usage of `igx-combo`

```html
<igx-combo [data]="items" [valueKey]="'field'" [groupKey]="'region'"
    [allowCustomValues]="customValues" (onAddition)="handleAddition($event)"
    placeholder="Location(s)" searchPlaceholder="Search...">
</igx-combo>
```

## API

### Inputs

| Name                     | Description                                       | Type                        |
|--------------------------|---------------------------------------------------|-----------------------------|
|  `data`                  | combo data source                                 | any                         |
|  `value`                 | combo value                                       | string                      |
|  `allowCustomValue`      | enable/disables combo custom value                | boolean                     |
|  `valueKey`              | combo value data source property                  | string                      |
|  `displayKey`            | combo dispaly data source property                | string                      |
|  `groupKey`              | combo item group                                  | string                      |
|  `width `                | defines combo width                               | string                      |
|  `heigth`                | defines combo height                              | string                      |
|  `itemsMaxHeight `       | defines drop down height                          | string                      |
|  `itemsMaxWidth `        | defines drop down width                           | string                      |
|  `itemHeight `           | defines drop down item height                     | string                      |
|  `placeholder `          | defines the "empty value" text                    | string                      |
|  `searchPlaceholder `    | defines the placeholder text for search input     | string                      |
|  `collapsed`             | gets drop down state                              | boolean                     |
|  `disabled`              | defines whether the control is active or not      | boolean                     |
|  `ariaLabelledBy`        | defines label ID related to combo                 | boolean                     |

### Outputs

| Name                | Description                                                             | Cancelable   | Parameters                              |
|------------------   |-------------------------------------------------------------------------|------------- |-----------------------------------------|
| `onSelectionChange` | Emitted when item selection is changing, before the selection completes | true         | { oldSelection: `Array<any>`, newSelection: `Array<any>`, event: Event } |
| `onSearchInput`     | Emitted when an the search input's input event is triggered             | false        | { searchValue: `string` }               |
| `onAddition`        | Emitted when an item is being added to the data collection              | false        | { oldCollection: `Array<any>`, addedItem: `<any>`, newCollection: `Array<any>` }|
| `dropDownOpening`   | Emitted before the dropdown is opened                                   | false        | { event: Event }                        |
| `dropDownOpened`    | Emitted after the dropdown is opened                                    | false        | { event: Event }                        |
| `dropDownClosing`   | Emitted before the dropdown is closed                                   | false        | { event: Event }                        |
| `dropDownClosed`    | Emitted after the dropdown is closed                                    | false        | { event: Event }                        |

### Methods

| Name             | Description                 | Return type          | Parameters                  |
|----------------- |-----------------------------|----------------------|-----------------------------|
| `open`           | Opens drop down             | `void`               | `None`                      |
| `close`          | Closes drop down            | `void`               | `None`                      |
| `toggle`         | Toggles drop down           | `void`               | `None`                      |
| `selectedItems`  | Get current selection state | `Array<any>`         | `None`                      |
| `selectItems`    | Select defined items        | `void`               | items: `Array<any>`, clearCurrentSelection: `boolean` |
| `deselectItems`  | Deselect defined items      | `void`               | items: `Array<any>`         |
| `selectAllItems` | Select all (filtered) items | `void`               | ignoreFilter?: `boolean` - if `true` selects **all** values |
| `deselectAllItems` | Deselect (filtered) all items | `void`           | ignoreFilter?: `boolean` - if `true` deselects **all** values |