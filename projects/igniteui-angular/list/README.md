# Igx-List

#### Category
_Components_

## Description
_Igx-List represents a list of identical items._
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/list)

- `IgxList` - since v7.3.4 The list component has been refactored. It now includes several new supporting directives:
    - `igxListThumbnail` - Use it to mark the target as list thumbnail which will be automatically positioned as a first item in the list item;
    - `igxListAction` - Use it to mark the target as list action which will be automatically positioned as a last item in the list item;
    - `igxListLine` - Use it to mark the target as list content which will be automatically positioned between the thumbnail and action;
    - `igxListLineTitle` - Use it to mark the target as list title which will be automatically formatted as a list-item title;
    - `igxListLineSubTitle` - Use it to mark the target as list subtitle which will be automatically formatted as a list-item subtitle;

Example using the new directives:

    ```html
        <igx-list>
            <igx-list-item [isHeader]="true">List items</igx-list-item>
            <igx-list-item>
              <igx-avatar igxListThumbnail></igx-avatar>
              <h1 igxListLineTitle>List item title</h1>
              <h3 igxListLineSubTitle>List item subtitle</h3>
              <igx-icon igxListAction>info</igx-icon>
            </igx-list-item>
        </igx-list>

        <igx-list>
          <igx-list-item [isHeader]="true">List items</igx-list-item>
          <igx-list-item>
            <igx-avatar igxListThumbnail></igx-avatar>
            <span igxListLine>Some content</span>
            <igx-icon igxListAction>info</igx-icon>
          </igx-list-item>
        </igx-list>
    ```

## Usage
```html
<igx-list>
    <igx-list-item [isHeader]="true">
        Work Contacts
    </igx-list-item>
    <igx-list-item>Terrance Orta</igx-list-item>
    <igx-list-item>Richard Mahoney</igx-list-item>
	<igx-list-item>Donna Price</igx-list-item>
    <igx-list-item [isHeader]="true">
        Family Contacts
    </igx-list-item>
    <igx-list-item>John Smith</igx-list-item>
    <igx-list-item>Mary Smith</igx-list-item>
</igx-list>
```

### List elements
The children components of the Igx-List are *Igx-List-Item* components. Based on their `isHeader` property, the list items can have different roles within the list:

- List item with `isHeader` set to **false** - interactive list item.
- List item with `isHeader` set to **true** - non-interactive list item which role is to label, describe and unify the next list items, composed below it

All list items implement `IListChild`.
In order to access its elements, the list provides the following:

- a collection that contains all the children: items and headers
- an array with items only
- an array with headers only

### Listbox and keyboard navigation
Set `navigation="listbox"` on the list to make it an accessible [listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/):

- The list gets `role="listbox"`.
- Items get `role="option"` with `aria-selected`, from their `selected` state.
- The list has a single tab stop. Tab focuses the option that was focused last, else the first selected option, else the first option, and the next Tab leaves the list. Headers and hidden items are skipped.
- Headers act as group names: they are hidden from screen readers, and each option points to the header above it with `aria-describedby`. A header without an `id` gets one. A screen reader reads the option content followed by the group name, e.g. "Kate, selected, 1 of 8, Employees". An option that has its own `aria-describedby`, set or bound in the template, keeps it.
- The focused option shows an inset focus ring, also when it is selected. Its color is the `item-focus-outline-color` of the list theme.
- While `isLoading` is set, the list has `aria-busy="true"`.
- While the list has no options, the list itself is the tab stop and shows the focus ring, and its empty or loading message, the default or a custom template, is read as an option. When options are added while the list has the focus, the focus moves to them. While the list has options, the loading message is hidden from screen readers.

| Key | Action |
| :--- | :--- |
| Arrow Down / Arrow Up | Next / previous option |
| Home / End | First / last option |
| Enter / Space | Clicks the option, so `(click)` and `itemClicked` fire. Holding the key down clicks once. |

When an option is activated with Enter or Space, the `event` of `itemClicked` is the synthetic `MouseEvent` of that click.

```html
<igx-list navigation="listbox" aria-label="Employees">
    @for (item of items(); track item.id) {
        <igx-list-item [selected]="item.id === selectedId()" (click)="select(item)">
            <span igxListLineTitle>{{ item.name }}</span>
        </igx-list-item>
    }
</igx-list>
```

Recommendations:

- **Name the list.** Set `aria-label`, or `aria-labelledby` pointing to a visible title. When the focus moves into the list, screen readers announce its name and role together with the focused option. Without a name, they only announce the role. Headers do not name the list.
- **Mark multi-select lists.** If more than one item can be selected, set `aria-multiselectable="true"` on the list. Without it, screen readers treat the list as single-select and may not announce additional selections.
- **Avoid interactive controls inside items.** An option should not contain buttons, links or checkboxes that can be focused. To show the selection with a checkbox, make it `inert` and bind it to the item state, so clicking it selects the item:

```html
<igx-list navigation="listbox" aria-label="Employees" aria-multiselectable="true">
    @for (employee of employees; track employee.id) {
        <igx-list-item [selected]="employee.selected" (click)="employee.selected = !employee.selected">
            <span igxListLineTitle>{{ employee.name }}</span>
            <igx-checkbox igxListAction inert [checked]="employee.selected"></igx-checkbox>
        </igx-list-item>
    }
</igx-list>
```

If an item really needs a button or another control for a separate action, such as deleting the item, call `$event.stopPropagation()` in the control's `(click)` handler, so using it does not select the item.

Lists whose `navigation` is `none`, the default, are unchanged: they are not focusable, and controls inside their items work as before. This includes a list that only sets `role="listbox"`, like the grid's Excel-style filter list, which manages the focus itself with `aria-activedescendant`.

The keyboard navigation only moves between the rendered items. A list virtualized with `igxFor` is not scrolled to the items that are not rendered, so do not set `navigation` on it. Handle the focus and the keys of a virtualized list in the app with `aria-activedescendant`, like the grid's Excel-style filter list does.

### Empty list template

By default if there are no items in the list, the default empty list template will be displayed.
In order to use your own custom template, you can use the `igxEmptyList` directive. It basically replaces the deprecated `emptyListImage`, `emptyListMessage`, `emptyListButtonText` inputs and the `emptyListButtonClick` event, which were previously used to template the list when it is empty.

```html
<igx-list>
  <ng-template igxEmptyList>
    <p>My custom empty list template</p>
  </ng-template>
</igx-list>
```

### List Items Panning
The IgxList's items support left and right panning. You can enable this feature separately for each direction using the `allowLeftPanning` and `allowRightPanning` properties. There are separate templates for left and right panning shown under the panned list item. The templates are defined using **ng-template** and specifying the directives `igxListItemLeftPanning` and `igxListItemRightPanning`. When panning the list items beyond a certain threshold an event will be emitted. This threshold is specified using the `panEndTriggeringThreshold` property. By default this property has a value of 0.5 which means 50% of list item's width. The events emitted are `leftPan` and `rightPan` and their event argument is of type `IListItemPanningEventArgs` and has the following fields:
- item - a reference to the `IgxListItemComponent` being dragged
- direction - field of type `IgxListPanState` showing the panning direction
- keepItem - this property specifies whether the list item will be kept in the list after a successful panning. By default it is `false`. May be set to `true` in the event handler.

```html
<igx-list [allowLeftPanning]="true" [allowRightPanning]="true"
  (leftPan)="leftPanPerformed($event)" (rightPan)="rightPanPerformed($event)">
    <ng-template igxListItemLeftPanning>
        <div>Message</div>
    </ng-template>
    <ng-template igxListItemRightPanning>
        <div>Dial</div>
    </ng-template>
    ...
</igx-list>
```

```typescript
public leftPanPerformed(args) {
  args.keepItem = true;
}

public rightPanPerformed(args) {
  args.keepItem = true;
}
```

## API

### Inputs

| Name | Description |
| :--- | :--- |
| id | Unique identifier of the component. If not provided it will be automatically generated.|
| allowLeftPanning  | Determines whether the left panning of an item is allowed  |
| allowRightPanning  | Determines whether the right panning of an item is allowed  |
| emptyListTemplate | Sets a reference to a custom empty list template, otherwise default template is used |
| dataLoadingTemplate | Sets a reference to a custom data loading template, otherwise default template is used |
| navigation | The keyboard navigation and the ARIA pattern of the list: _none_ (default) or _listbox_, which makes the list an accessible [listbox](#listbox-and-keyboard-navigation) with keyboard navigation |
| panEndTriggeringThreshold | Number | Specifies the threshold after which a panning event is emitted. By default this property has a value of 0.5 which means 50% of list item's width. |

### Properties

| Name | Description |
| :--- | :--- |
| children  | Collection of all `IListChild` components: items and headers  |
| items  | Array of items in the list  |
| headers  | Array of headers in the list  |
| innerStyle  | Currently used inner style depending on whether the list is empty or not  |
| role  | Gets/sets the role of the list, default _list_, _listbox_ when its `navigation` is _listbox_  |


### Outputs

| Name | Description |
| :--- | :--- |
| *Event emitters* | *Notify for a change* |
| panStateChange  | Triggered when pan gesture is executed on list item  |
| leftPan  | Triggered when left pan gesture is executed on list item  |
| rightPan  | Triggered when right pan gesture is executed on list item  |
| itemClicked  | Triggered when a list item is clicked, or activated with Enter or Space  |


----------
# Igx-List-Item

#### Category
_Child components_

## Description
Based on its `isHeader` property, the list item has a specific role within the list:

| `isHeader` | Description |
| :--- | :--- |
| false  | _Child component of Igx-List, that represents a single interactive item. Its content can be text or any other HTML content._  |
| true  | _Child component of Igx-List, that represents a single non-interactive item, that is used as a header of the following items._  |

## Usage
- List item
```html
<igx-list-item>
    Lisa Landers
</igx-list-item>
```

- List item as header
```html
<igx-list-item [isHeader]="true">
    Contacts
</igx-list-item>
```

All list items implement `IListChild`.

## API

### Inputs

| Name | Description |
| :--- | :--- |
| index  | The index of item in children collection  |
| hidden  | Determines whether the item should be displayed  |
| isHeader  | Determines whether the item should be displayed as a header, default value is _false_  |
| selected  | Whether the item is selected, default _false_. In a [listbox](#listbox-and-keyboard-navigation) it sets `aria-selected`  |

### Directives

| name | description
| :--- | :---|
| igxListThumbnail | Use it to mark the target as list thumbnail which will be automatically positioned as a first item in the list item;
| igxListAction | Use it to mark the target as list action which will be automatically positioned as a last item in the list item;
| igxListLine | Use it to mark the target as list content which will be automatically positioned between the thumbnail and action;
| igxListLineTitle | Use it to mark the target as list title which will be automatically formatted as a list-item title;
| igxListLineSubTitle | Use it to mark the target as list subtitle which will be automatically formatted as a list-item subtitle;


### Properties

| Name | Description |
| :--- | :--- |
| panState  | Gets the item's pan state  |
| list  | Gets the list that is associated with the item  |
| role  | Gets/sets the role of the item - _separator_ for headers; for items _option_ in a listbox, _listitem_ otherwise   |
| element  | Gets the native element that is associated with the item   |
| width  | Gets the width of the item   |
| maxLeft  | Gets the maximum left position of the item   |
| maxRight  | Gets the maximum right position of the item   |
| touchAction  | Determines in what way the item can be manipulated by the user via a touch action   |
| headerStyle  | Gets if the item is styled as header item   |
| innerStyle  | Gets if the item is styled as list item   |
