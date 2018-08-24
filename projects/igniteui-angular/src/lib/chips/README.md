# igxChip Component

The **igxChip** is a compact visual component that displays information in an obround. Chip can be templated, deleted, and selected. Multiple chips can be reordered and visually connected to each other. Chips reside in a container called chips area which is responsible for managing the interactions between the chips.

#### Initializing Chips

The `IgxChipComponent` is the main class for a chip elemenent and the `IgxChipsAreaComponent` is the main class for the chip area. The chip area is used when handling more complex scenarios that require interaction between chips (dragging, selection, navigation and etc.). The `IgxChipComponent` requires an `id` to be defined so that the different chips can be easily distinguished.

Example of using `igxChip` with `igxChipArea`:

```html
<igx-chips-area>
    <igx-chip *ngFor="let chip of chipList" [id]="chip.id">
        <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
    </igx-chip>
</igx-chips-area>
```

### Features

#### Selection

Selection is disabled by default, but can be enabled with an option called `selectable`. The selecting is done by clicking on the chip itself or either by focusing the chip by using the `Tab` key and then pressing the `Space` key. An event `onSelection` is fired when the selection state of the `igxChip` changes. If a chip is already selected it can be deselected by pressing the `Space` key again while the chip is focused or by clicking on it.

```html
<igx-chips-area #chipsArea>
    <igx-chip *ngFor="let chip of chipList" [selectable]="'true'">
        <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
    </igx-chip>
</igx-chips-area>
```

```ts
public ngOnInit() {
    chipsArea.forEach((chip) => {
        chip.selectable = true;
    });
}
```

#### Removing

The `remove button` is part of the chip as well. You can control the remove button visibility by the `removable` boolean option. An event `onRemove` is fired when the end-user deletes a chip.

```html
<igx-chips-area #chipsArea>
    <igx-chip *ngFor="let chip of chipList" [id]="chip.id" [removable]="'true'" (onRemove)="chipRemoved($event)">
        <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
    </igx-chip>
</igx-chips-area>
```

```ts
public ngOnInit() {
    chipsArea.forEach((chip) => {
        chip.removable = true;
    });
}

public chipRemoved(event) {
    this.chipList = this.chipList.filter((item) => {
        return item.id !== event.owner.id;
    });
    this.cdr.detectChanges();
}
```

#### Moving/Dragging

The chip can be dragged by the end-user in order to change it's position. The moving/dragging is disabled by default, but can be enabled with an option called `draggable`. You need to handle the actual moving of the chip in the data source manually.

```html
<igx-chips-area #chipArea (onReorder)="chipsOrderChanged($event)">
    <igx-chip *ngFor="let chip of chipList" [draggable]="'true'">
        <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
    </igx-chip>
</igx-chips-area>
```

```ts
public ngOnInit() {
    chipArea.forEach((chip) => {
        chip.draggable = true;
    });
}

public chipsOrderChanged(event) {
    const newChipList = [];
    for (const chip of event.chipsArray) {
        const chipItem = this.chipList.filter((item) => {
            return item.id === chip.id;
        })[0];
        newChipList.push(chipItem);
    }
    this.chipList = newChipList;
    event.isValid = true;
}

```

#### Chip Templates

The `IgxChipComponent`'s main structure consists of chip content, `remove button`, `prefix`, `suffix` and `connector`. All of those elements are templatable except the `remove button`.

The content of the chip is taken by the content defined inside the chip template except elements that define the `prefix`, `suffix` or `connector` of the chip. You can define any type of content you need.

The `prefix` and `suffix` are also elements inside the actual chip area where they can be templated by your preference. The way they can be specified is by respectively using the `IgxPrefix` and `IxgSuffix` directives.

Example of using an icon for `prefix`, a text for `label` and a custom icon button for `suffix`:

```html
<igx-chip *ngFor="let chip of chipList" [id]="chip.id">
    <igx-icon igxPrefix fontSet="material" [name]="'drag_indicator'"></igx-icon>
    <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
    <span igxSuffix *ngIf="removable" igxButton="icon" (click)="onClick()">
        <igx-icon fontSet="material" [name]="'close'"></igx-icon>
    </span>
</igx-chip>
```

The `connectors` of the `igxChip` are fully templatable and are positioned after each chip. Their purpose is to provide a way to link two chips next to each other with an icon/text or anything you would like to use. The last chip (most right) does not have connector applied. Connectors hide while dragging chips around and show again when interactions with the chips have finished. The connector is defined by using the `IgxConnector` directive.

Example of using prefix connector:

```html
<igx-chip *ngFor="let chip of chipList" [id]="chip.id">
    <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
    <span igxConnector> -> </span>
</igx-chip>
```

Example of using suffix connector:

```html
<igx-chip *ngFor="let chip of chipList" [id]="chip.id">
    <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
    <span igxSuffixConnector> -> </span>
</igx-chip>
```

#### Keyboard Navigation

The chip can be focused using the `Tab` key or by clicking on them. Chips can be reordered using keyboard navigation:

- Keyboard controls when the chip is focused:

  - <kbd>LEFT</kbd> - Focuses the chip on the left
  - <kbd>RIGHT</kbd> - Focuses the chip on the right
  - <kbd>SPACE</kbd> - Toggles chip selection if it is selectable
  - <kbd>DELETE</kbd> - Fires the `onRemove` output so the chip deletion can be handled manually
  - <kbd>SHIFT</kbd> + <kbd>LEFT</kbd> - Moves the focused chip one position to the left
  - <kbd>SHIFT</kbd> + <kbd>RIGHT</kbd> - Moves the focused chip one position to the right

- Keyboard controls when the remove button is focused:

  - <kbd>SPACE</kbd> or <kbd>ENTER</kbd> Fires the `onRemove` output so the chip deletion can be handled manually

# API

## IgxChipComponent

### Inputs
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `id` | `string` | Unique identifier of the component. |
| `draggable ` | `boolean` | Defines if the chip can be dragged in order to change it's position. |
| `removable ` | `boolean` | Defines if the chip should render remove button and throw remove events. |
| `selectable ` | `boolen` | Defines if the chip can be selected on click or through navigation. |
| `selected` | `boolen` | Sets if the chip is selected. |
| `disabled` | `boolean` | Defines if the chip is disabled. |
| `displayDensity`| `DisplayDensity | string` | Sets the chip theme. Available options are `compact`, `cosy`, `comfortable`. |
| `color` | `string` | Sets the chip background color. |

### Outputs
| Name | Return Type | Description |
|:--:|:---|:---|
| `onMoveStart` | `any` | Fired when the chip moving(dragging) starts. |
| `onMoveEnd` | `any` | Fired when the chip moving(dragging) end. |
| `onRemove ` | `any` | Fired when the chip remove button is clicked. |
| `onClick ` | `any` | Fired when the chip is clicked instead of dragged. |
| `onSelection` | `IChipSelectEventArgs` | Fired when the chip is being selected. |
| `onKeyDown ` | `any` | Fired when the chip keyboard navigation is being used. |
| `onDragEnter ` | `any` | Fired when another chip has entered the current chip area. |

## IgxChipsAreaComponent

### Inputs
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `width` | `number` | Sets the width of the chips area. |
| `height ` | `number` | Sets the height of the chip area. |

### Outputs
| Name | Return Type | Description |
|:--:|:---|:---|
| `onReorder ` | `any` | Fired when the chip moving(dragging) starts. |
| `onSelection ` | `any` | Fired when the chip moving(dragging) end. |
| `onMoveStart  ` | `any` | Fired when the chip remove button is clicked. |
| `onMoveEnd ` | `any` | Fired when the chip is clicked instead of dragged. |

### Properties
| Name   | Return Type | Description |
|:----------:|:------|:------|
| `chipsList` | `QueryList<IgxChipComponent>` | Returns the list of chips inside the chip area. |