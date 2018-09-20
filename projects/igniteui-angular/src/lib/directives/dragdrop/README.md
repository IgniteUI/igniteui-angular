# igxDrag
**igxDrag** is a directive that enables dragging of elements around the page.

## Usage
```html
<div igxDrag [hideBaseOnDrag]="true" [animateOnRelease]="true" *ngFor="let elem of draggableElems" >
    <span [style.margin]="'auto'">{{elem.label}}</span>
</div>
```

## Getting Started

### Introduction

When an element inside your Angular application needs to be dragged from one place to another the `igxDrag` directive can be used to achieve this behavior. In combination with the `igxDrop` directive the placing of the dragged element can be done as well to have fully interactive application.

### Basic configuration

The `igxDrag` directive can be applied on any DOM element by just adding it to its template.

```html
<div igxDrag>Drag me</div>
```

### DOM Behavior

By default when an element with `igxDrag` directive applied needs to be dragged the user needs to swipe at least 5px in any direction in order for the actual dragging to occur. Otherwise the interaction is considered as a click and the `dragClicked` event is emitted.

When dragging occurs a drag ghost element is spawned that is positioned so it is always under the mouse cursor or when on touch where it is being touched. The original element is still present, but it can be hidden automatically when dragging starts with the `hideBaseOnDrag` input. 

The dragging can be canceled by the user before it starts by setting the `cancel` property of the `dragStart` event to `true`. This will cancel the current dragging logic that could be used.

After the user releases the mouse/touch the drag ghost element is removed from the DOM and if the `hideBaseOnDrag` is enabled it will make the original element visible again and the `dragEnd` event will be emitted. If the `animateOnRelease` input is set to `true` all this will execute after the default animation of the drag ghost is finished which consist of returning it from the last dragged position to the position of the original element. Then the drag ghost will be removed with the rest and the `returnMoveEnd` event will be emitted.

## API

### Inputs

| Name | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| igxDrag          | any | - | Input used to save data inside the `igxDrag` directive. This can be set when instancing `igxDrag` on an element. |
| dragTolerance    | number | 5 | Indicates when the drag should start
     * By default the drag starts after the draggable element is moved by 5px |
| ghostImageClass  | string | '' | Sets a custom class that will be added to the `dragGhost` element. |
| hideBaseOnDrag   | boolean | false | Sets if the draggable element should hide when when dragging starts. |
| animateOnRelease | boolean | false | Enables/disables the draggable element animation when the element is released. |

### Outputs

| Name | Argument Type | Description | Cancelable |
| :--- | :--- | :--- | :--- |
| dragStart      | `IDragStartEventArgs` | Event triggered when the draggable element drag starts. | true |
| dragEnd        | `IDragBaseEventArgs` | Event triggered when the draggable element is released. | false |
| returnMoveEnd  | `IDragBaseEventArgs` | Event triggered after the draggable element is released and after its animation has finished. | false |
| dragClicked    | `IDragBaseEventArgs` | Event triggered when the draggable element is clicked. | false |

### Properties

| Name             | Type        | Description       |
| :--------------- |:----------- | :---------------- |
| defaultReturnDuration | string | Sets the default return animation time after dragging occurs. |

<div class="divider--half"></div>

### Methods

| Signature    | Description   |
| :----------- | :------------ |
| dropFinished() | Triggers the drop finishing action on the igxDrag when moving it in the DOM from one place to another. This is needed so the igxDrag recalculates it's position once moved in DOM so the current and return animation are based on the new position in DOM. |

#igxDrop
`igxDrop` directive is used in combination with the `igxDrag` directive to add behavior when element needs to be dropped in an area.

## Usage
````html
<div class="dropArea" igxDrop (onEnter)="onAreaEnter()" (onLeave)="onAreaLeave()">
    <span *ngIf="!elementInsideArea">Drag here.</span>
    <span *ngIf="elementInsideArea">Release to put element here.</span>
</div>
````

````ts
//App component...
public onAreaEnter() {
    this.elementInsideArea = true;
    this.changeDetectionRef.detectChanges();
}
public onAreaLeave() {
    this.elementInsideArea = false;
    this.changeDetectionRef.detectChanges();
}
//...
````

## Getting Started

### Introduction

When an element that is being dragged using the `igxDrag` directive needs to be placed in an area, the `igxDrop` can be used to achieve this behavior. It provides events that the user can use to determine if element is entering the drop area and if it is being released inside it.

### Basic configuration
The `igxDrop` directive can be applied to any DOM element just like the `igxDrag` directive. 

````html
<div igxDrop>Drop here</div>
````
One element can have both `igxDrag` and `igxDrop` directives applied but then it is recommended to use custom logic when another element is being dropped on to it by canceling the `onDrop` event of the `igxDrop` directive. 

## API

### Outputs

| Name | Argument Type | Description | Cancelable| 
| :--- | :--- | :--- | :--- |
| onEnter  | `IgxDropEnterEventArgs` | Event triggered when dragged element enters the area of the element. | false |
| onLeave  | `IgxDropLeaveEventArgs` | Event triggered when dragged element leaves the area of the element. | false |
| onDrop   | `IgxDropEventArgs` | Event triggered when dragged element is dropped in the area of the element. | true |
