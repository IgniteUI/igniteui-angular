# igx-scroll

The `IgxScroll` component enables developers to put content in a scrollable container with set height, or number of items in the content to be visible at a time. The scroll component allows for DOM virtualization to be applied to the content inside the scrollable container.  

## Usage

```html
<igx-scroll #scroll
            (onScroll)="updateList($event)"
            [itemsToViewCount]="visibleItemsCount"
            [itemHeight]="50"
            [totalItemsCount]="items.length">
    <ul class="list">
        <li class="list-item" *ngFor="let item of visibleItems">
            {{item}}
        </li>
    </ul>
</igx-scroll>
```

```typescript
export class IgxScrollSampleComponent {
    public items: string[] = [];

    public visibleItems: string[] = [];

    public visibleItemsCount: number = 5;

    public constructor() {
        for (let i = 1; i <= 50000; i++) {
            this.items.push("item #" + i );
        }

        this.visibleItems = this.items.slice(0, 5);
    }

    private updateList($event: IgxScrollEvent): void {
        this.visibleItems = this.items.slice($event.currentTop, $event.currentTop + this.visibleItemsCount);
    }
}

```
## Getting Started

### Dependencies

To use the IgxSlider import the IgxSlider:

```typescript
import { IgxScroll } from "../../../src/main";
```

## API

#### Inputs

| Name | Type | Description |
| :--- | :--- | :--- |
| itemHeight | boolean | Disables or enables UI interaction. |
| scrollTop | number | Gets the scroll top of the scroll. |
| totalItemsCount | number | The amount of the actual rendered items in the scroll. |
| visibleItemsCount | number | The total amount of items in that will be virtualized. |

#### Outputs

| Name | Description |
| :--- | :--- | 
| onScroll  | Scroll event executed each time when the viewport of the IgxScroll is scrolled. Raised with IgxScrollEvent argument|

#### Methods

| Name   | Arguments | Return Type | Description |
|:----------:|:------|:------|:------|  
| scrollVertically  | delta: number | void | Scroll with the given delta. Does not scrolls when the scroll delta is outside of the scroll boundaries. |
