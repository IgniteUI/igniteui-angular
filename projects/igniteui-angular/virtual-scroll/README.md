# IgxVirtualScrollComponent

A high-performance virtual-scrolling component that renders only the items visible inside the viewport (plus a configurable over-scan buffer). It supports both vertical and horizontal axes, variable item sizes measured at runtime, lists far larger than the browser's maximum scroll coordinate, and remote / infinite scrolling through the `dataRequest` event.

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
| `data` | `T[]` | `[]` | The array of items to virtualize. Compared by reference. See [Updating `data`](#updating-data). |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Scroll axis. |
| `overScan` | `number` | `2` | Extra items to render beyond each edge of the viewport. Higher values reduce blank flashes during fast scrolling at the cost of slightly more DOM nodes. Normalized to a non-negative integer. |
| `estimatedItemSize` | `number` | `50` | Pixel size used for items before they are measured in the DOM. Set this close to the real average size for the best initial-render accuracy. A non-positive value falls back to `50`. |
| `itemTemplate` | `TemplateRef<IgxVsItemContext<T>> \| null` | `null` | Programmatic template that takes precedence over a content `ng-template[igxVirtualItem]`. |

Changing `estimatedItemSize` re-applies it to every item that has **not** yet been measured in the DOM. Items that have been measured keep their real size.

---

## Outputs

| Output | Payload | Description |
|---|---|---|
| `stateChange` | `VirtualScrollState` | Emitted when the rendered virtual window changes. Consecutive renders that produce an identical window are not re-emitted. |
| `dataRequest` | `VirtualScrollDataRequest` | Emitted when the rendered window comes within a few items of the end of `data`. Use this to implement infinite / remote scrolling. |

---

## Public API

### `scrollToIndex(index: number, options?: ScrollIntoViewOptions): Promise<void>`

Scrolls the viewport to the item at `index`.

Items outside the rendered window only have an *estimated* size, so the first jump can miss the target. The component measures the items at the landing point and corrects the scroll position, repeating until the offset is stable. The returned promise resolves on that final offset; callers that only need the first, approximate scroll can ignore it.

```ts
@ViewChild(IgxVirtualScrollComponent) vs!: IgxVirtualScrollComponent<any>;

// Leading edge, instant (the default).
await this.vs.scrollToIndex(500);

// Centered, animated.
await this.vs.scrollToIndex(500, { block: 'center', behavior: 'smooth' });

// Only scroll if the item is not already fully visible.
await this.vs.scrollToIndex(500, { block: 'nearest' });
```

| Option | Values | Notes |
|---|---|---|
| `block` | `'start'` \| `'center'` \| `'end'` \| `'nearest'` | Alignment on the vertical axis. Defaults to `'start'`. |
| `inline` | same as `block` | Alignment on the horizontal axis; falls back to `block`. |
| `behavior` | `'auto'` \| `'smooth'` | Defaults to `'auto'`. |

`'nearest'` leaves the scroll position untouched when the item is already fully in view, or when the item is larger than the viewport and currently covers it, matching native `scrollIntoView({ block: 'nearest' })`.

Out-of-range indices are clamped to the data, and the resulting offset is clamped to the largest reachable scroll position.

### `layoutComplete: Promise<void>`

Resolves once the virtual scroll has settled: the current render pass is complete, the item-size measurements it triggered are complete, and so are the renders those measurements scheduled.

Useful when you need to read the resulting DOM after a `data` change, a scroll, or a viewport resize:

```ts
this.items = await this.service.fetch();
await this.vs.layoutComplete;
// The rendered window and the track size now reflect the new data.
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

## Updating `data`

`data` is compared **by reference**. Mutating the array in place (`items.push(...)`) does not trigger an update. Assign a new array instead.

The component diffs the new array against the previous one to decide which item measurements it can keep:

* **Appending** (`[...items, ...more]`) keeps the identity of every existing index, so all previous measurements are retained.
* **Replacing, filtering or sorting** invalidates every index from the first difference onwards; those items are measured again on their next render.

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

Right-to-left (RTL) layouts are fully supported. When the component (or an ancestor) sets `dir="rtl"`, horizontal scrolling, content positioning, and `scrollToIndex` are mirrored automatically. No extra configuration is required.

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

`dataRequest` is also emitted on the **first render** when the initially loaded items do not fill the viewport, so an empty or short initial `data` array is enough to start the loading chain.

Only one request is in flight at a time: the next one is emitted after `data` changes. If your source is exhausted and you reassign `data` without adding items, the component will not ask again for the same `startIndex`.

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

## Styling and DOM structure

```html
<igx-virtual-scroll class="igx-virtual-scroll igx-virtual-scroll--vertical" role="list">
    <div class="igx-vs__track" role="presentation">      <!-- full virtual extent -->
        <div class="igx-vs__content" role="presentation"><!-- translated into position -->
            <div class="igx-vs__item" role="presentation" data-vs-index="12">
                <!-- your item template -->
            </div>
            ...
        </div>
    </div>
</igx-virtual-scroll>
```

| Class | Element | Notes |
|---|---|---|
| `igx-virtual-scroll` | Host | Always present. |
| `igx-virtual-scroll--vertical` | Host | Added when `orientation="vertical"`. |
| `igx-virtual-scroll--horizontal` | Host | Added when `orientation="horizontal"`. |
| `igx-vs__track` | Inner spacer div | Sized to the full virtual height/width. |
| `igx-vs__content` | Rendered-items wrapper | Absolutely positioned; translated to the correct virtual offset. |
| `igx-vs__item` | Per-item wrapper | One per rendered item; carries `data-vs-index` and is the element the engine measures. |

The host element must have a **fixed height** (vertical) or **fixed width** (horizontal) and `overflow: auto` or `overflow: scroll`. The default styles already set this.

### Item sizing

Items are measured by their **border box**, so margins are not included and accumulate as drift down the list. Use `padding` on the item, or a `gap` on a wrapper, instead of margins.

### Accessibility

Only the current window is in the DOM, so assistive technology cannot infer an item's position from the markup. The host carries `role="list"`; if your template renders a role with set semantics (`listitem`, `option`, `row`, ...), map the context's `index` and `count` onto `aria-posinset` and `aria-setsize`:

```html
<ng-template igxVirtualItem let-item let-i="index" let-count="count">
    <div role="listitem" [attr.aria-posinset]="i + 1" [attr.aria-setsize]="count">
        {{ item }}
    </div>
</ng-template>
```

---

## Very large lists

Browsers cap how far an element can scroll. When the total item size exceeds that limit, the component compresses the virtual coordinate space into the range the browser can represent and scales scroll positions accordingly. Items still render at their real pixel size, so lists of millions of items scroll correctly with no configuration.
