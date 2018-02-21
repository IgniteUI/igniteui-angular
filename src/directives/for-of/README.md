# igxForOf
**igxForOf** directive extends `ngForOf` adding the ability to virtualize the iterable items over their grow direction.

## Usage
```html
<igx-list>
    <div [style.height]="height">
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
| igxForScrollContainer  | IgxForOf | Optionally pass the parent `igxForOf` instance to create a virtual template scrolling both horizontally and vertically     |
| igxForRemote | boolean | Enables remote virtualization. Should be used in combination with the OnChunkPreload event, where the new data can be requested from a remote service. Note that the totalItemCount option of the igxFor directive should be updated with the actual total record count from the service. 

### Outputs

| Name | Description |
| :--- | :--- |
| *Event emitters* | *Notify for a change* |
| OnChunkLoad  | Used on chunk loaded. Emits after a new chunk has been loaded.  |
| OnChunkPreload  | Used on chunk loading to emit the current state information - startIndex, chunkSize. Can be used for implementing remote load on demand for the igxFor data. |

### Accessors

List of public accessors that the developers may use to get information from the `igxFor`:
| Name | Type | Description |
| :--- |:--- | :--- |
| id | string | Unique identifier of the directive |
| state | IgxForState | The current state of the directive it contains `startIndex` and `chunkSize` |
| totalItemCount | number | The total count of the virtual data items, when using remote service |

<div class="divider--half"></div>

### Methods

| Signature       | Description                     |
| :-------------- | :------------------------------ |
| scrollNext()  | Scrolls by one item into the  appropriate  next direction |
| scrollPrev()  | Scrolls by one item into the  appropriate  previous direction|
| scrollTo(index)  | Scrolls to the specified index. Current index can be obtained from state.startIndex. |




