# igx-simple-combo
The `igx-simple-combo` is a modification of the `igx-combo` component that allows single selection and has the appropriate UI and behavior for that. It inherits most of the `igx-combo`'s API.
It provides an editable input used for filtering data while also using the IgniteUI for Angular's `igx-drop-down` component to display the items in the data set.
Alongside easy filtering and selection of a single item, the control provides grouping and adding of custom values to the data set.
Templates can be provided in order to customize different areas of the components, such as items, header, footer, etc.
Additionally, the control is integrated with the Template Driven and Reactive Forms.
It also exposes intuitive keyboard navigation and it is accessibility compliant.
Another thing worth mentioning is that the Drop Down items are virtualized, which guarantees smooth work, even if the control is bound to data source with a lot of items.


A walk through of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/simple-combo.html)

# Usage
Basic usage of `igx-simple-combo` bound to a local data source, defining `valueKey` and `displayKey`:

```html
<igx-simple-combo [data]="localData" [valueKey]="'ProductID'" [displayKey]="'ProductName'"></igx-simple-combo>
```

Remote binding, defining `valueKey` and `displayKey`, and exposing `dataPreLoad` that allows to load new chunk of remote data to the combo (see the sample above as a reference):

```html
<igx-simple-combo [data]="remoteData | async" (dataPreLoad)="dataLoading($event)" [valueKey]="'ProductID'" [displayKey]="'ProductName'" ></igx-simple-combo>
```

```typescript
public ngOnInit(): void {
    this.remoteData = this.remoteService.remoteData;
}

public ngAfterViewInit(): void {
    this.remoteService.getData(this.combo.virtualizationState, (data) => {
        this.combo.totalItemCount = data.length;
    });
}

public dataLoading(evt): void {
    if (this.prevRequest) {
        this.prevRequest.unsubscribe();
    }

    this.prevRequest = this.remoteService.getData(this.combo.virtualizationState, () => {
        this.cdr.detectChanges();
        this.combo.triggerCheck();
    });
}
```

> Note: In order to have a combo with remote data, what you need is to have a service that retrieves data chunks from a server.
What the combo exposes is a `virtualizationState` property that gives state of the combo - first index and the number of items that needs to be loaded.
The service, should inform the combo for the total items that are on the server - using the `totalItemCount` property.

## Features

### Selection

Combo selection depends on the `[valueKey]` input property:

- If a `[valueKey]` is specified, **all** methods and events tied to the selection operate w/ the value key property of the combo's `[data]` items:
```html
    <igx-simple-combo [data]="myCustomData" valueKey="id" displayKey="text"></igx-simple-combo>
```
```typescript
export class MyCombo {
    ...
    public combo: IgxSimpleComboComponent;
    public myCustomData: { id: number, text: string } = [{ id: 0, name: "One" }, ...];
    ...
    public ngOnInit(): void {
        // Selection is done only by valueKey property value
        this.combo.select(0);
    }
}
```

- When **no** `valueKey` is specified, selection is handled by **equality (===)**. To select items by object reference, the `valueKey` property should be removed:
```html
    <igx-simple-combo [data]="myCustomData" displayKey="text"></igx-simple-combo>
```
```typescript
export class MyCombo {
    public ngOnInit(): void {
        this.combo.select(this.data[0]);
    }
}
```

### Value Binding

If we want to use a two-way data-binding, we could just use `ngModel` like this:

```html
<igx-simple-combo #combo [data]="data" valueKey="id" displayKey="text" [(ngModel)]="value"></igx-simple-combo>
```
```typescript
export class MyExampleComponent {
    ...
    public data: {text: string, id: number, ... }[] = ...;
    ...
    public value: number = ...;
}
```

When the `data` input is made up of complex types (i.e. objects), it is advised to bind the selected data via `valueKey` (as in the above code snippet). Specify a property that is unique for each data entry and pass in a value to the combo that is the same as the unique identifier in the data set.

If you want to bind the selected data by reference, **do not** specify a `valueKey`:

```html
<igx-simple-combo #combo [data]="data" displayKey="text" [(ngModel)]="value"></igx-simple-combo>
```
```typescript
export class MyExampleComponent {
    ...
    public data: {text: string, id: number, ... }[] = ...;
    ...
    public value: {text: string, id: number, ...} = this.items[0];
}
```

<div class="divider--half"></div>

### Filtering
Unlike the `igx-combo`, filtering in the `igx-simple-combo` is always enabled.

<div class="divider--half"></div>

### Custom Values
Enabling the custom values will add values that are missing from the list, using the combo's interface.

```html
<igx-simple-combo [allowCustomValues]="true"></igx-simple-combo>
```

<div class="divider--half"></div>

### Disabled
You can disable the combo using the following code:

```html
<igx-simple-combo [disabled]="true"></igx-simple-combo>
```

<div class="divider--half"></div>

### Grouping
Defining a combo's groupKey option will group the items, according to that key.

```html
<igx-simple-combo [groupKey]="'groupKey'"></igx-simple-combo>
```

<div class="divider--half"></div>

### Templates
Templates for different parts of the control can be defined, including items, header and footer, etc.
When defining one of them, you need to reference list of predefined names, as follows:

#### Defining item template:
```html
<igx-simple-combo>
	<ng-template igxComboItem let-display let-key="valueKey">
		<div class="item">
			<span class="state">State: {{ display[key] }}</span>
			<span class="region">Region: {{ display.region }}</span>
		</div>
	</ng-template>
</igx-simple-combo>
```

#### Defining group headers template:

```html
<igx-simple-combo>
    <ng-template igxComboHeaderItem let-headerItem let-key="groupKey">
        <div class="group-header-class">
            Header for {{ headerItem[key] }}
        </div>
    </ng-template>
</igx-simple-combo>
```
#### Defining header template:

```html
<igx-simple-combo>
    <ng-template igxComboHeader>
        <div class="header-class">Custom header</div>
        <img src=""/>
    </ng-template>
</igx-simple-combo>
```

#### Defining footer template:

```html
<igx-simple-combo>
    <ng-template igxComboFooter>
        <div class="footer-class">Custom footer</div>
        <img src=""/>
    </ng-template>
</igx-simple-combo>
```

#### Defining empty template:

```html
<igx-simple-combo>
    <ng-template igxComboEmpty>
        <span>List is empty</div>
    </ng-template>
</igx-simple-combo>
```

#### Defining add template:

```html
<igx-simple-combo>
    <ng-template igxComboAddItem>
        <span>Add town</span>
    </ng-template>
</igx-simple-combo>
```

#### Defining toggle icon template:

```html
<igx-simple-combo>
    <ng-template igxComboToggleIcon let-collapsed>
        <igx-icon>{{ collapsed ? 'remove_circle' : 'remove_circle_outline'}}</igx-icon>
    </ng-template>
</igx-simple-combo>
```

#### Defining toggle icon template:

```html
<igx-simple-combo>
    <ng-template igxComboClearIcon>
        <igx-icon>clear</igx-icon>
    </ng-template>
</igx-simple-combo>
```

## Keyboard Navigation

When the combo is closed and focused:
- `ArrowDown` or `Alt` + `ArrowDown` will open the dropdown and will move focus to the selected item, if no selected item is present, the first item in the list will be focused.

When the combo is opened:
- `ArrowUp` will close the dropdown if the search input is focused. If the active item is the first one in the list, the focus will be moved back to the search input while also selecting all of the text in the input. Otherwise `ArrowUp` will move to the previous list item.
- `ArrowDown` will move focus from the search input to the first list item. If list is empty and custom values are enabled will move it to the Add new item button.
- `Alt` + `ArrowUp` will close the dropdown.

When the combo is opened and a list item is focused:
- `End` will move to last list item.
- `Home` will move to first list item.
- `Space` will select/deselect active list item without closing the dropdown.
- `Enter` will confirm the currently focused item as selected and will close the dropdown.
- `Esc` will close the dropdown.

When the combo is opened, allow custom values are enabled and add item button is focused:
- `Enter` will add new item with `valueKey` and `displayKey` equal to the text in the input and will select the new item.
- `ArrowUp` will move the focus back to the last list item or if the list is empty will move it to the input.

<div class="divider--half"></div>

### Properties
| Name                     | Description                                       | Type                        |
|--------------------------|---------------------------------------------------|-----------------------------|
| `id`                    | The combo's id.                                          | `string`              |
| `data`                  | The combo's data source.                                 | `any[]`                  |
| `value`                 | The combo's value.                                       | `any`                |
| `selection`             | The combo's selected item.                               | `any`                |
| `allowCustomValue`      | Enables/disables combo custom value.                | `boolean`                     |
| `valueKey`              | Determines which column in the data source is used to determine the value. | `string` |
| `displayKey`            | Determines which column in the data source is used to determine the display value. | `string` |
| `groupKey`              | The combo's item group.                                  | `string`                |
| `virtualizationState`   | Defines the current state of the virtualized data. It contains `startIndex` and `chunkSize`. | `IForOfState`   |
| `totalItemCount`        | Total count of the virtual data items, when using remote service.     | `number`   |
| `width `                | Defines combo width.                               | `string`                      |
| `height`                | Defines combo height.                              | `string`                      |
| `itemsMaxHeight `       | Defines dropdown maximum height.                  | `number`                      |
| `itemsWidth `           | Defines dropdown width.                           | `string`                      |
| `itemHeight `           | Defines dropdown item height.                     | `number`                      |
| `placeholder `          | Defines the "empty value" text.                    | `string`                      |
| `collapsed`             | Gets the dropdown state.                              | `boolean`                     |
| `disabled`              | Defines whether the control is active or not.      | `boolean`                     |
| `ariaLabelledBy`        | Defines label ID related to combo.                 | `boolean`                     |
| `valid`                 | gets if control is valid, when used in a form.     | `boolean`                     |
| `overlaySettings`       | Controls how the dropdown is displayed.            | `OverlaySettings`            |
| `selected`              | Get current selection state.                       | `Array<any>`                |
| `filteringOptions`      | Configures the way combo items will be filtered    | IComboFilteringOptions      |
| `filterFunction`        | Gets/Sets the custom filtering function of the combo | `(collection: any[], searchValue: any, caseSensitive: boolean) => any[]` |


### Methods
| Name             | Description                 | Return type          | Parameters                  |
|----------------- |-----------------------------|----------------------|-----------------------------|
| `open`           | Opens dropdown             | `void`               | `None`                      |
| `close`          | Closes dropdown            | `void`               | `None`                      |
| `toggle`         | Toggles dropdown           | `void`               | `None`                      |
| `select`         | Select a defined item      | `void`               | newItem: `any`              |
| `deselect`       | Deselect the currently selected item    | `void`               | `None`         |


### Events
| Name                | Description                                                             | Cancelable   | Parameters                              |
|------------------   |-------------------------------------------------------------------------|------------- |-----------------------------------------|
| `selectionChanging` | Emitted when item selection is changing, before the selection completes | true         | { oldSelection: `any`, newSelection: `any`,  displayText: `string`, owner: `IgxSimpleComboComponent` } |
| `searchInputUpdate`     | Emitted when an the search input's input event is triggered             | true         | `IComboSearchInputEventArgs`               |
| `addition`        | Emitted when an item is being added to the data collection              | false        | { oldCollection: `Array<any>`, addedItem: `<any>`, newCollection: `Array<any>`, owner: `IgxSimpleComboComponent` }|
| `onDataPreLoad`     | Emitted when new chunk of data is loaded from the virtualization        | false        |            `IForOfState`          |
| `opening`   | Emitted before the dropdown is opened                                   | true        | `IBaseCancelableBrowserEventArgs`         |
| `opened`    | Emitted after the dropdown is opened                                    | false        | `IBaseEventArgs`                        |
| `closing`   | Emitted before the dropdown is closed                                   | true        | `IBaseCancelableBrowserEventArgs`         |
| `closed`    | Emitted after the dropdown is closed                                    | false        | `IBaseEventArgs`                        |
