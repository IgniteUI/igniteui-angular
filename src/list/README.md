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
- `children` - array of all `IListChild`: items and headers
- items
- headers
- allowLeftPanning
- allowRightPanning

## Methods
- addChild
- removeChild

## Events
- onLeftPan
- onRightPan
- onPanStateChange

----------

#IgxListHeader

#### Category
_Child components_

## Description
_Child component of IgxList, that represents a single non-interactable item, that is used as a header of the following items. The header implements `IListChild` interface._


----------
#IgxListItem

#### Category
_Child components_

## Description
_Child component of IgxList, that represents a single interactable item. Its content can be text or any other HTML content. The item implements `IListChild` interface._
