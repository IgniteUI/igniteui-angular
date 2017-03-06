#IgxList

#### Category
_Components_

## Description
_IgxList represents a list of identical items._

### More Info
The children components of the IgxTabBar are:

- *IgxListItem* - represents list item
- *IgxListHeader* - represents list header - non-interactable list item which role is to label, describe and unify the next list items, composed below it

Both: item and header, implement `IListChild`.  
The list provides three arrays: 

- one that contains all the children: items and headers,
- only items,
- only headers.

## Properties
- `children` - Array of all `IListChild` components: items and headers
- `items` - Array of items in the list
- `headers` - Array of headers in the list
- `allowLeftPanning` - Determines whether the left panning of an item is allowed
- `allowRightPanning` - Determines whether the right panning on an item is allowed

## Methods
- `addChild` - Add `IListChild` component to children array and to the respective specific array
- `removeChild` - Remove `IListChild` component from children array and from the respective specific array

## Events

- `onPanStateChange` - Triggered when pan gesture is executed on list item
- `onLeftPan` - Triggered when left pan gesture is executed on list item
- `onRightPan` - Triggered when right pan gesture is executed on list item

----------

#IgxListHeader

#### Category
_Child components_

## Description
_Child component of IgxList, that represents a single non-interactable item, that is used as a header of the following items. The header implements `IListChild` interface._

## Properties
- `index` - The index of header in children array

----------
#IgxListItem

#### Category
_Child components_

## Description
_Child component of IgxList, that represents a single interactable item. Its content can be text or any other HTML content. The item implements `IListChild` interface._

## Properties
- `index` - The index of item in children array
- `hidden` - Determines whether the item should be displayed
- `panState` - Gets the items pan state
- `options` - Defines the options of particular list item, that will be displayed on item swipe (pan)

----------
##Usage

	<igx-list>
	    <igx-list-header>Header 1</igx-list-header>
	    <igx-list-item>Item 1</igx-list-item>
	    <igx-list-item>Item 2</igx-list-item>
	    <igx-list-item>Item 3</igx-list-item>
	    <igx-list-header>Header 2</igx-list-header>
	    <igx-list-item>Item 4</igx-list-item>
	    <igx-list-item>Item 5</igx-list-item>
	    <igx-list-item>Item 6</igx-list-item>
	</igx-list>