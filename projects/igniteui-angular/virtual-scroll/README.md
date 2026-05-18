# IgxVirtualScrollComponent

A high-performance virtual-scrolling component that renders only the items visible inside the viewport (plus a configurable over-scan buffer). It supports both vertical and horizontal axes, variable item sizes measured at runtime, and remote / infinite scrolling through the `dataRequest` event.

## Imports

```ts
import {
    IgxVirtualScrollComponent,
    IgxVirtualItemDirective,
} from 'igniteui-angular/virtual-scroll';
```

---

## Basic usage

Define your list and provide a template using the `igxVirtualItem` directive:

```html
<igx-virtual-scroll [data]="items" style="height: 400px;">
    <ng-template igxVirtualItem let-item let-i="index">
        <div class="list-row">{{ i }}: {{ item.name }}</div>
    </ng-template>
</igx-virtual-scroll>
```

```ts
@Component({ /* ... */ })
export class MyComponent {
    items = Array.from({ length: 10_000 }, (_, i) => ({ name: `Item ${i}` }));
}
```

---

## Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `data` | `T[]` | `[]` | The array of items to virtualise. |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Scroll axis. |
| `overScan` | `number` | `2` | Extra items to render beyond each edge of the viewport. Higher values reduce blank-flash artefacts during fast scrolling at the cost of slightly more DOM nodes. |
| `estimatedItemSize` | `number` | `50` | Pixel size used for items before they are measured in the DOM. Set this close to the real average size for the best initial-render accuracy. |
| `itemTemplate` | `TemplateRef<IgxVsItemContext<T>> \| null` | `null` | Programmatic template that takes precedence over a content `ng-template[igxVirtualItem]`. |

---

## Outputs

| Output | Payload | Description |
|---|---|---|
| `stateChange` | `VirtualScrollState` | Emitted after every render pass with a snapshot of the current virtual window. |
| `dataRequest` | `VirtualScrollDataRequest` | Emitted when the scroll position approaches the end of loaded data. Use this to implement infinite / remote scrolling. |

---

## Public API

### `scrollToIndex(index: number): void`

Programmatically scrolls the viewport so that the item at `index` is at the leading edge.

```ts
@ViewChild(IgxVirtualScrollComponent) vs!: IgxVirtualScrollComponent<any>;

this.vs.scrollToIndex(500);
```

---

## `IgxVirtualItemDirective`

Marks an `ng-template` as the item template for the nearest `igx-virtual-scroll`. The template context is typed as `IgxVsItemContext<T>`.

### Template context variables

| Variable | Type | Description |
|---|---|---|
| `$implicit` (or `let-item`) | `T` | The current item. |
| `index` | `number` | The item's index within the full data array. |
| `count` | `number` | Total number of items in `data`. |
| `first` | `boolean` | `true` when `index === 0`. |
| `last` | `boolean` | `true` when `index === count - 1`. |
| `even` | `boolean` | `true` when `index` is even. |
| `odd` | `boolean` | `true` when `index` is odd. |

```html
<ng-template igxVirtualItem let-item let-i="index" let-first="first">
    <div [class.first-row]="first">{{ i }}: {{ item }}</div>
</ng-template>
```

---

## Output type reference

### `VirtualScrollState`

```ts
interface VirtualScrollState {
    startIndex: number;   // First rendered item index
    endIndex: number;     // Last rendered item index (inclusive)
    viewportSize: number; // Viewport height (or width) in px
    totalSize: number;    // Total virtual content size in px
}
```

### `VirtualScrollDataRequest`

```ts
interface VirtualScrollDataRequest {
    startIndex: number; // First index that does not yet have data
    count: number;      // Suggested number of items to fetch
}
```

---

## Horizontal scrolling

Set `orientation="horizontal"`. Items are laid out in a row; ensure each item has an explicit `width` so the engine can measure sizes correctly.

```html
<igx-virtual-scroll [data]="items" orientation="horizontal" style="width: 100%; height: 60px;">
    <ng-template igxVirtualItem let-item>
        <div class="col" style="width: 120px; height: 60px;">{{ item }}</div>
    </ng-template>
</igx-virtual-scroll>
```

---

## Infinite / remote scrolling

Listen to the `dataRequest` output and append more items to the `data` array:

```html
<igx-virtual-scroll [data]="items" (dataRequest)="loadMore($event)" style="height: 500px;">
    <ng-template igxVirtualItem let-item>
        <div class="row">{{ item.label }}</div>
    </ng-template>
</igx-virtual-scroll>
```

```ts
loadMore(req: VirtualScrollDataRequest) {
    this.myService.fetch(req.startIndex, req.count).subscribe(newItems => {
        this.items = [...this.items, ...newItems];
    });
}
```

---

## Programmatic template

Pass a `TemplateRef` via `[itemTemplate]` when the template is defined outside the component:

```html
<ng-template #myTpl let-item>
    <div>{{ item }}</div>
</ng-template>

<igx-virtual-scroll [data]="items" [itemTemplate]="myTpl" style="height: 400px;" />
```

---

## Styling

The component exposes the following CSS classes:

| Class | Element | Notes |
|---|---|---|
| `igx-virtual-scroll` | Host | Always present. |
| `igx-virtual-scroll--vertical` | Host | Added when `orientation="vertical"`. |
| `igx-virtual-scroll--horizontal` | Host | Added when `orientation="horizontal"`. |
| `igx-vs__track` | Inner spacer div | Sized to the full virtual height/width. |
| `igx-vs__content` | Rendered-items wrapper | Absolutely positioned; translated to the correct virtual offset. |

The host element must have a **fixed height** (vertical) or **fixed width** (horizontal) and `overflow: auto` or `overflow: scroll` — the default styles already set this.
