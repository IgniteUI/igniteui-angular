# IgxTreeComponent

## Description
_igx-tree component allows you to render hierarchical data in an easy-to-navigate view. Declaring a tree is done by using `igx-tree` and specifying its `igx-tree-nodes`:_

-  *`igx-tree`* - The tree container. Consists of a tree root that renders all passed `igx-tree-node`s
-  *`igx-tree-node`* - A single node for the tree. Renders its content as-is. Houses other `igx-tree-node`s.
-  *`[igxTreeNodeLink]`* - A directive that should be put on **any** link child of an `igx-tree-node`, to ensure proper ARIA attributes and navigation
-  *`[igxTreeNodeExpandIndicator]`* - A directive that can be passed to an `ng-template` within the `igx-tree`. The template will be used to render parent nodes' `expandIndicator`

A complete walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tree).
The specification for the tree can be found [here](https://github.com/IgniteUI/igniteui-angular/wiki/Tree-Specification)

----------

## Usage
```html
<igx-tree>
  <igx-tree-node *ngFor="let node of data" [data]="node" [expanded]="isNodeExpanded(node)" [selected]="isNodeSelected(node)">
    {{ node.text }}
    <img [src]="node.image" alt="node.imageAlt" />
    <igx-tree-node *ngFor="let child of node.children" [data]="child" [expanded]="isNodeExpanded(child)" [selected]="isNodeSelected(child)">
	  {{ child.text }}
      <igx-tree-node *ngFor="let leafChild of child.children" [data]="leafChild" [expanded]="isNodeExpanded(leafChild)" [selected]="isNodeSelected(leafChild)">
        <a igxTreeNodeLink href="{{leafChild.location}}" target="_blank">{{ leafChild.text }}</a>
      </igx-tree-node>
    </igx-tree-node>
  </igx-tree-node>
</igx-tree>
```

----------

## Keyboard Navigation

The keyboard can be used to navigate through all nodes in the tree.
The control distinguishes two states - `focused` and `active`.
The focused node is where all events are fired and from where navigation will begin/continue. Focused nodes are marked with a distinct style.
The active node, in most cases, is the last node on which user interaction took place. Active nodes also have a distinct style. Active nodes can be used to better accent a node in that tree that indicates the app's current state (e.g. a current route in the app when using a tree as a navigation component).

In most cases, moving the focused node also moves the active node.

When navigating to nodes that are outside of view, if the tree (`igx-tree` tag) has a scrollbar, scrolls the focused node into view.
When finishing state transition animations (expand/collapse), if the target node is outside of view AND if the tree (`igx-tree` tag) has a scrollbar, scrolls the focused node into view.
When initializing the tree and a node is marked as active, if that node is outside of view AND if the tree (`igx-tree` tag) has a scrollbar, scrolls the activated node into view.

_FIRST and LAST node refers to the respective visible node WITHOUT expanding/collapsing any existing node._

_Disabled nodes are not counted as visible nodes for the purpose of keyboard navigation._

|Keys          |Description| Activates Node |
|---------------|-----------|-----------|
| ARROW DOWN    | Moves to the next visible node. Does nothing if on the LAST node. | true |
|  CTRL + ARROW DOWN  | Performs the same as ARROW DOWN. | false |
|  ARROW UP     | Moves to the previous visible node. Does nothing if on the FIRST node. | true |
|  CTRL + ARROW UP  | Performs the same as ARROW UP. | false |
|     TAB       | Navigate to the next focusable element on the page, outside of the tree.* | false |
| SHIFT + TAB   | Navigate to the previous focusable element on the page, outside of the tree.* | false |
|   HOME        | Navigates to the FIRST node. | true |
|   END         | Navigates to the LAST node. | true |
| ARROW RIGHT   | On an **expanded** parent node, navigates to the first child of the node. If on a **collapsed** parent node, expands it. | true |
| ARROW LEFT    | On an **expanded** parent node, collapses it. If on a child node, moves to its parent node. | true |
|   SPACE       | Toggles selection of the current node. Marks the node as active. | true |
|      *        | Expand the node and all sibling nodes on the same level  w/ children | true |
| CLICK | Focuses the node | true |

When selection is enabled, end-user selection of nodes is **only allowed through the displayed checkbox**. Since both selection types allow multiple selection, the following mouse + keyboard interaction is available:

| Combination        |Description| Activates Node |
|---------------|-----------|-----------|
| SHIFT + CLICK / SPACE | when multiple selection is enabled, toggles selection of all nodes between the active one and the one clicked while holding SHIFT. | true |

----------

## API Summary

### IgxTreeComponent

#### Accessors

**Get**

   | Name           | Description                                                                  | Type               |
   |----------------|------------------------------------------------------------------------------|---------------------|
   | rootNodes      | Returns all of the tree's nodes that are on root level                       | `IgxTreeNodeComponent[]`           |


#### Properties

   | Name           | Description                                                                  | Type                                   |
   |----------------|------------------------------------------------------------------------------|----------------------------------------|
   | selection      | The selection state of the tree                                              | `"None"` \| `"BiState"` \| `"Cascading"` |
   | animationSettings | The setting for the animation when opening / closing a node               |  `{ openAnimation: AnimationMetadata, closeAnimation: AnimationMetadata }`                 |
   | singleBranchExpand | Whether a single or multiple of a parent's child nodes can be expanded. Default is `false` | `boolean` |
   | expandIndicator | Get\Set a reference to a custom template that should be used for rendering the expand/collapse indicators of nodes. | `TemplateRef<any>` |
   | displayDensity  | Get\Set the display density of the tree. Affects all child nodes | `DisplayDensity` |

#### Methods
   | Name           | Description               | Parameters             | Returns |
   |-----------------|----------------------------|-------------------------|--------|
   | findNodes     | Returns an array of nodes which match the specified data. `[data]` input should be specified in order to find nodes. A custom comparer function can be specified for custom search (e.g. by a specific value key). Returns `null` if **no** nodes match | `data: T\|, comparer?: (data: T, node: IgxTreeNodeComponent<T>) => boolean` | `IgxTreeNodeComponent<T>[]` \| `null` | 
   | deselectAll | Deselects all nodes. If a nodes array is passed, deselects only the specified nodes. **Does not** emit `nodeSelection` event. | `nodes?: IgxTreeNodeComponent[]` | `void` |
   | collapseAll |  Collapses the specified nodes. If no nodes passed, collapses **all parent nodes**. | `nodes?: IgxTreeNodeComponent[]` | `void` |
   | expandAll   | Sets the specified nodes as expanded. If no nodes passed, expands **all parent nodes**. | `nodes?: IgxTreeNodeComponent[]` | `void` |

#### Events

   | Name           | Description                                                             | Cancelable | Arguments |
   |----------------|-------------------------------------------------------------------------|------------|------------|
   | nodeSelection  | Emitted when item selection is changing, before the selection completes | true       | `{ owner: IgxTreeComponent, newSelection: IgxTreeNodeComponent<any>[], oldSelection: IgxTreeNodeComponent<any>[], added: IgxTreeNodeComponent<any>[], removed: IgxTreeNodeComponent<any>[], cancel: true }` |
   | nodeCollapsed  | Emitted when node collapsing animation finishes and node is collapsed.  | false      | `{ node: IgxTreeNodeComponent<any>, owner: IgxTreeComponent }` |
   | nodeCollapsing | Emitted when node collapsing animation starts, when `node.expanded` is set to transition from `true` to `false`. | true  | `{ node: IgxTreeNodeComponent<any>, owner: IgxTreeComponent, cancel: boolean }` |
   | nodeExpanded   | Emitted when node expanding animation finishes and node is expanded.    | false      | `{ node: IgxTreeNodeComponent<any>, owner: IgxTreeComponent }` |
   | nodeExpanding  | Emitted when node expanding animation starts, when `node.expanded` is set to transition from `false` to `true`. | true  | `node: IgxTreeNodeComponent<any>, owner: IgxTreeComponent, cancel: boolean }` |
   | activeNodeChanged | Emitted when the tree's `active` node changes | false | `IgxTreeNodeComponent<any>` |
   | onDensityChanged | Emitted when the display density of the tree is changed | false | `{ oldDensity: DisplayDensity, newDensity: DisplayDensity }` |

### IgxTreeNodeComponent<T>

#### Accessors

**Get**

  | Name           | Description                                                                  | Type               |
  |-----------------|-------------------------------------------------------------------------------|---------------------|
  | parentNode      | The parent node of the current node (if any)                                  | `IgxTreeNodeComponent<any>`  |
  | path            | The full path to the node, starting from the top-most ancestor                | `IgxTreeNodeComponent<any>[]` |
  | level           | The "depth" of the node. If root node - 0, if a child of parent  - `parent.level` + 1 | `number`    |
  | tree            | A reference to the tree the node is a part of                                 | `IgxTreecomponent`           |
  | children        | A collection of child nodes. `null` if node does not have children            |  `IgxTreeNodeComponent<any>[]` \| `null`  |

#### Properties

   | Name            | Description                                                                   | Type                |
   |-----------------|-------------------------------------------------------------------------------|---------------------|
   | disabled        | Get/Set whether the node is disabled. Disabled nodes are ignore for user interactions. | `boolean` |
   | expanded        | The node expansion state. Does not trigger animation.                         | `boolean` \| `null` |
   | selected        | The node selection state.                                                     | `boolean`           |
   | data            | The data entry that the node is visualizing. Required for searching through nodes.       | `T`               |
   | active          | Marks the node as the tree's active node | `boolean` |
   | resourceStrings | An accessor for the current resource strings used for the node | `ITreeResourceStrings` |
   | loading         | Specifies whether the node is loading data. Loading nodes do not render children. To be used for load-on-demand scenarios | `boolean` |


#### Methods

   | Name            | Description                                                                   | Parameters | Returns |
   |-----------------|-------------------------------------------------------------------------------|------------|---------|
   | expand | Expands the node, triggering animations                                                    | None | `void` |
   | collapse | Collapses the node, triggering animations                                | None | `void` |
   | toggle| Toggles node expansion state, triggering animations       | None    | `void` |\

#### Events

   | Name            | Description                                                                   | Cancelable | Parameters |
   |-----------------|-------------------------------------------------------------------------------|------------|---------|
   | expandedChange  | Emitted when the node's `expanded` property changes                           |   false    | `boolean` |
   | selectedChange  | Emitted when the node's `selected` property changes                           |   false    | `boolean` |


