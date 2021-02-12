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

### Display Density

The list provides the ability to choose a display density from a predefined set of options: **compact**, **cosy** and **comfortable** (default one). We can set it by using the `displayDensity` input of the list.

```html
<igx-list #list [displayDensity]="'compact'">
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

Or

```typescript
this.list.displayDensity = "compact";
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
| panEndTriggeringThreshold | Number | Specifies the threshold after which a panning event is emitted. By default this property has a value of 0.5 which means 50% of list item's width. |
| displayDensity  | Determines the display density of the list.  |

### Properties

| Name | Description |
| :--- | :--- |
| children  | Collection of all `IListChild` components: items and headers  |
| items  | Array of items in the list  |
| headers  | Array of headers in the list  |
| innerStyle  | Currently used inner style depending on whether the list is empty or not  |
| role  | Gets the role of the list  |


### Outputs

| Name | Description |
| :--- | :--- |
| *Event emitters* | *Notify for a change* |
| panStateChange  | Triggered when pan gesture is executed on list item  |
| leftPan  | Triggered when left pan gesture is executed on list item  |
| rightPan  | Triggered when right pan gesture is executed on list item  |
| itemClicked  | Triggered when a list item has been clicked  |


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
| role  | Gets the role of the item within its respective list - _separator_ if isHeader is true and _listitem_ otherwise   |
| element  | Gets the native element that is associated with the item   |
| width  | Gets the width of the item   |
| maxLeft  | Gets the maximum left position of the item   |
| maxRight  | Gets the maximum right position of the item   |
| touchAction  | Determines in what way the item can be manipulated by the user via a touch action   |
| headerStyle  | Gets if the item is styled as header item   |
| innerStyle  | Gets if the item is styled as list item   |
