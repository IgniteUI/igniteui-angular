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

By default a drag operation starts when the end user swipes at least 5 px in any direction. Otherwise the interaction is considered as a click and the `dragClicked` event is emitted.

When dragging occurs a drag ghost element is spawned and moves along with the mouse cursor or touch interaction. The original element is still present, but it can be hidden automatically when dragging starts with the `hideBaseOnDrag` input.

The dragging can be canceled by setting the `cancel` property of the `dragStart` event to `true`. This will cancel the default dragging logic.

After the user releases the mouse/touch the drag ghost element is removed from the DOM and if the `hideBaseOnDrag` is enabled it will make the original element visible again and the `dragEnd` event will be emitted. If the `animateOnRelease` input is set to `true` all this will execute after the default animation of the drag ghost is finished which consist of returning it from the last dragged position to the position of the original element. Then the drag ghost will be removed and the `returnMoveEnd` event will be emitted.

## API

### Inputs

| Name | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| igxDrag          | any | - | Input used to save data inside the `igxDrag` directive. This can be set when instancing `igxDrag` on an element. |
| dragTolerance    | number | 5 | Indicates when the drag should start (in pixels). By default the drag starts after the draggable element is moved by 5px |
| ghostImageClass  | string | '' | Sets a custom class that will be added to the `dragGhost` element. |
| hideBaseOnDrag   | boolean | false | Sets if the draggable element should hide when dragging starts. |
| animateOnRelease | boolean | false | Enables/disables the draggable element animation when the element is released. |
| dragGhostHost | any | null | Sets the element to which the dragged element will be appended.

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
| dropFinished() | Triggers the drop finishing action on the igxDrag when moving it in the DOM from one place to another. This is needed so the `igxDrag` recalculates it's position once moved in DOM so the current and return animation are based on the new position in DOM. |

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

By default the `igxDrop` directive comes with logic that appends the dropped `igxDrag` element as a child of the element that has instanced the `igxDrop`. It can be overridden by canceling the `onDrop` event of the `igxDrop` directive. This can be done by setting the `cancel` argument that the `onDrop` event provides.

If you define a custom drop logic and have the `animateOnRelease` input of the `igxDrag` set to `true` it is recommended to also call the `dropFinished()` method of the `igxDrag` when you finish with manipulating the DOM. This informs the `igxDrag` to update its relative position to the new location in the DOM so that it will animate correctly.

Example of cancelling `onDrop` default drop logic:

````html
<div igxDrop (onDrop)="onElemDrop($event)">Drop here</div>
````

````ts
public onElemDrop(event: IgxDropEventArgs) {
    event.cancel = true; // This cancels the default drop logic
    // ...
    // Custom implementation logic
    // ...

    // This is required to tell the dragged element the dropping has finished, so it can return to the new location/old location.
    // It can be called anywhere in the code as well.
    event.drag.dropFinished(); 
}
````

## API

### Outputs

| Name | Argument Type | Description | Cancelable| 
| :--- | :--- | :--- | :--- |
| onEnter  | `IgxDropEnterEventArgs` | Event triggered when dragged element enters the area of the drop element. | false |
| onLeave  | `IgxDropLeaveEventArgs` | Event triggered when dragged element leaves the area of the drop element. | false |
| onDrop   | `IgxDropEventArgs` | Event triggered when dragged element is dropped in the area of the drop element. | true |
