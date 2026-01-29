# igxForOf
**igxForOf** directive extends `ngForOf` adding the ability to virtualize the iterable items over their grow direction.  
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/for_of.html)

## Usage
```html
<igx-list>
    <div [style.height]="height" [style.overflow]="'hidden'" [style.position]="'relative'">
        <igx-list-item *igxFor="let item of data | igxFilter: fo1; scrollOrientation : 'vertical'; containerSize: '500px'; itemSize: '50px'">
            <span igxLabel>{{item.text}}</span>
        </igx-list-item>
    </div>
</igx-list>
```

## Getting Started

### Introduction

If you have a big iterable list that you need a template for in your Angular application and the structure directive `ngForOf` is not usable due to the size of the data `igxForOf` may be the right approach. It can be used to virtualize any such template by only ever rendering a subset of the data so that the application is never bottlenecked by slow rendering and object model creation calls.

### Basic configuration

`igxForOf` can be used in most scenarios you would use `ngForOf` in.
```html
<li *igxFor="let user of userObservable; index as i; first as isFirst; scrollOrientation: 'vertical'; containerSize: '500px'; itemSize: '50px'">
   {{i}}/{{users.length}}. {{user}} <span *ngIf="isFirst">default</span>
</li>
```

Unlike `ngForOf` using `igxForOf` requires specifying the size of the rendering container for the chosen grow direction (either `'vertical'` or `'horizontal'`) and the size of the items inside. An important difference between `vertical` and `horizontal` scrolling is that for the former, a single `itemSize` is required, while horizontally items may have individual widths. The directive will read their `width` property and decide on a page size dynamically.

An example for horizontally scrolling `igxForOf`:
```html
<span *igxFor="let users of userObservable; scrollOrientation: 'horizontal'; containerSize: '500px'">
    {{user}}
</span>
```

### DOM Behavior

Using `igxFor` will do the following changes to the templated DOM:

- All items rendered by the directive will be wrapped in a display container element that holds the necessary dimensions and styles allowing for seemless scrolling
- A virtual scrollbar will be rendered as a sibling of the display container along the direction of scrolling specified
- A number of items will be rendered that is enough to cover the dimensions of the container
- When the end-user scrolls the rendered items will be reused but their bindings will be updated to refer to items that would usually be visible in the new scroll position

***Note:*** As of version 5.3.0, `igxFor` will simulate smooth scrolling by utilizing offset positioning of its display container. This requires that its parent element has the appropriate dimensions and `overflow: hidden; position: relative;` rules applied for the best end-user experience.


### Change Propagation

When the contents of the iterator changes, `igxForOf` makes the corresponding changes to the DOM:

- When an item is added, a new instance of the template is added if it should be immediately visible in the current scrolling position. In this case the last visible item will no longer be available.
- When an item is removed and its template is currently visible, it will be removed. Another item is rendered at the end to keep the page size consistent.
- When items are reordered, if the reordering affects the current view, adding and/or removing of items will be applied so that it adheres to the new order.
- If a bound property of the template is changed and the templated item is currently visible, its template will be redrawn.

## API

### Inputs

| Name | Type | Description |
| :--- |:--- | :--- |
| igxForItemSize         | string          | The px-affixed size of the item along the axis of scrolling                                                                |
| igxForScrollContainer  | string          | Only the strings `vertical` and `horizontal` are valid and specify the scroll orientation                                  |
| igxForContainerSize    | string          | The px-affixed size of the container along the axis of scrolling                                                           |
| igxForScrollContainer  | IgxForOf        | Optionally pass the parent `igxForOf` instance to create a virtual template scrolling both horizontally and vertically     |
| igxForTotalItemCount   | number          | The total count of the virtual data items, when using remote service. This is exposed to allow setting the count of the items through the template |

### Outputs

| Name | Description |
| :--- | :--- |
| *Event emitters* | *Notify for a change*                                           |
| chunkLoad      | Used on chunk loaded. Emits after a new chunk has been loaded.  |
| chunkPreload   | Used on chunk loading to emit the current state information - startIndex, chunkSize. Can be used for implementing remote load on demand for the igxFor data. |

### Accessors

List of public accessors that the developers may use to get information from the `igxForOf`:
| Name             | Type        | Description                                                                  |
| :--------------- |:----------- | :--------------------------------------------------------------------------- |
| id               | string      | Unique identifier of the directive                                           |
| state            | IgxForState | The current state of the directive. It contains `startIndex` and `chunkSize` |
| state.startIndex | number      | The index of the item at which the current visible chunk begins              |
| state.chunkSize  | number      | The number of items the current visible chunk holds                          |
| totalItemCount   | number      | The total count of the virtual data items, when using remote service         |

### Local Variables

List of exported values by the `igxForOf` that can be aliased to local variables:
| Name       | Type    | Description                                           |
| :--------- |:------- | :---------------------------------------------------- |
| $implicit  | T       | The value of the individual items in the iterable     |
| index      | number  | The index of the current item in the iterable.        |

<div class="divider--half"></div>

### Methods

| Signature        | Description                                                                            |
| :--------------- | :------------------------------------------------------------------------------------- |
| scrollNext()     | Scrolls by one item into the appropriate next direction                                |
| scrollPrev()     | Scrolls by one item into the appropriate previous direction                            |
| scrollNextPage() | Scrolls by one page into the appropriate next direction                                |
| scrollPrevPage() | Scrolls by one page into the appropriate previous direction                            |
| scrollTo(index)  | Scrolls to the specified index. Current index can be obtained from `state.startIndex`. |




