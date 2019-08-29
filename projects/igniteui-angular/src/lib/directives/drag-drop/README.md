# igxDrag
**igxDrag** is a directive that enables dragging of elements around the page.

## Usage
```html
<div igxDrag *ngFor="let elem of draggableElems" >
    <span [style.margin]="'auto'">{{elem.label}}</span>
</div>
```

## Getting Started

### Introduction

The `igxDrag` directive can be instantiated on any type of element. It can be used on its own without depending on the `igxDrop`. It should provide enough functionality so the user could determine where it has been released and so implements a custom logic.

Specific data can be stored inside the `igxDrag` for various purposes like identifying it among other draggable elements and etc. It can be specified by assigning it on the initialization tag `[igxDrag]` or by using the data input where it is stored:

```html
<div [igxDrag]="myData">Drag me!</div>
```

By default the dragging will not start immediately in order to provide some room for error as well as not interrupt if the user wants to click the element instead. The tolerance for it is `5px` in any direction and if it is exceeded then the dragging would start. This can be configured using the `dragTolerance` input.

#### Dragging with ghost element

The `ghost` input is set to `true` by default which means that the base element the `igxDrag` directive is initialized will keep its position and a ghost will be rendered under the user pointer once the dragging starts. While still holding and moving the ghost created will move along the user pointer instead of the base element.

* *Customizing the ghost*

    The ghost element by default is a copy of the base element the `igxDrag` is used on. It can be customized by providing a template reference to the `ghostTemplate` input directly. The template itself can be position anyway, since the only thing provided is reference to it. It can be done the following way:

    ```html
    <div [igxDrag]="'Dolphin'" [ghostTemplate]="customGhost">
        Drag me!
    </div>
    <ng-template #customGhost>
        <div>I can fly!</div>
    </ng-template>
    ```

* *Customizing the base*

    Since when using a ghost element leaves us with the base element being still rendered at its original location we can hide it by setting applying custom visibility style when dragging starts or by completely replacing its content using `ngIf`.

    Hiding the base element:
    ```html
    <div [igxDrag]="'Dolphin'" [ngStyle]="{ 'visibility': dragged ? 'hidden' : 'visible' }">
        Drag me!
    </div>
    ```

    Customizing the base content:

    ```html
    <div [igxDrag]="'Dolphin'" [ngStyle]="{ 'visibility': dragged ? 'hidden' : 'visible' }">
        <div *ngIf="dragged; else originTemplate">Drag me!</div>
        <ng-template #originTemplate>Origin!</ng-template>
    </div>
    ```

#### Dragging without ghost

If `renderGhost` input is set to false the dragging logic for the `igxDrag` provides dragging ability for the initialized element itself. This means that it can freely move an element around by click and hold and when released it will keep its position where it was dragged.

#### Dragging using a handle

The user can specify an element that is a child of the `igxDrag` by which to drag since by default the whole element is used to perform that action. It can be done using the `igxDragHandle` directive and can be applied to multiple elements inside the `igxDrag`.

When multiple channels are applied to an `igxDrag` and one of them matches one of applied channels to an `igxDrop`, then all events and applied behaviors would be executed when that element is dropped.

*Example:*

```html
<div igxDrag>
    <div igxDragHandle>X</div>
    Drag me!
</div>
```

#### Linking Drag to Drop element

Using the `dragChannel` and `dropChannel` input on respectively `igxDrag` and `igxDrop` directives the user can link different elements to interact only between each other. For example if an `igxDrag` element needs to be constrained so it can be dropped on specific `igxDrop` element and not all available this can easily be achieved by assigning them same channel.

>**When assigning either single or multiple channels using an array, each channel is compared using the `Strict Equality` comparison.**

*Example:*

```html
<div igxDrag [dragChannel]="['Mammals', 'Land']"> Human </div>
<div igxDrag [dragChannel]="['Mammals', 'Water']"> Dolphin </div>
<div igxDrag [dragChannel]="['Insects', 'Air']"> Butterfly </div>
<div igxDrag [dragChannel]="['Insects', 'Land']"> Ant </div>

<div igxDrop [dropChannel]="['Mammals']"> Mammals </div>
<div igxDrop [dropChannel]="['Insects']"> Insects </div>
<div igxDrop [dropChannel]="['Land']"> Land </div>
```

As displayed above only `Human` and `Dolphin` can be dropped in the 'Mammals' class but not in the 'Insects' class, where only the `Butterfly` and `Bee` can be dropped. Same for the 'Land' drop area where only `Ant` and `Human` can be dropped.

#### Animations

By default when an element is being dragged there are no animations applied.

The user can apply transition animation to the `igxDrag` any time, but it is advised to use it when dragging ends or the element is not currently dragged. This can be achieved using the `transitionToOrigin` and the `transitionTo` methods.

The `transitionToOrigin` method as the name suggest animates the currently dragged element or its ghost to the start position where the dragging began. The `transitionTo` method animates the element to a specific location relative to the page (i.e. `pageX` and `pageY`) or to the position of a specified element. If the element is not being currently dragged it will animate anyway or create ghost and animate it to the desired position.

Both function have arguments that the user can set to customize the transition animation and set duration, timing function or delay. If specific start location is set it will animate the element starting from there.

When the transition animation ends if a ghost is created it will be removed and the `igxDrag` directive will return to its initial state or if no ghost is created it will keep its position. In both cases then the `transitioned` event will be triggered depending on how long the animation lasts. If no animation is applied it will triggered instantly.

If the user want to have other types of animations that involve element transformations he can do that like any other element either using the Angular Animations or straight CSS Animations to either the base `igxDrag` element or its ghost. If he wants to apply them to the ghost he would need to define a custom ghost and apply animations to that element.

## API

### Inputs

| Name | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| igxDrag          | any | - | Input used to save data inside the `igxDrag` directive. This can be set when instancing `igxDrag` on an element. |
| dragTolerance    | number | 5 | Indicates when the drag should start (in pixels). By default the drag starts after the draggable element is moved by 5px |
| dragGhostHost | any | null | Sets the element to which the dragged element will be appended.
| ghostImageClass  | string | '' | Sets a custom class that will be added to the `dragGhost` element. |
| animateOnRelease | boolean | false | Enables/disables the draggable element animation when the element is released. |

### Outputs

| Name | Description | Cancelable | Parameters |
|------|-------------|------------|------------|
| `dragStart` | Event triggered when any movement starts. | true | `IDragBaseEventArgs` |
| `dragMove` | Event triggered for every frame where the `igxDrag` element has been dragged. | true | `IDragMoveEventArgs` |
| `dragEnd` | Event triggered when the user releases the element area that is not inside an `igxDrop`. This is triggered before any animation starts. | false | `IDragBaseEventArgs` |
| `click` | Even triggered when the user performs a click and not dragging. This is the native event. | false | MouseEvent |
| `transitioned` | Event triggered after any movement of the drag element has ended. This is triggered after all animations have ended and before the ghost is removed. | false | `IDragBaseEventArgs` |
| `ghostCreate` | Event triggered right before the ghost element is created | false | `IDragGhostBaseEventArgs` |
| `ghostDestroy` | Event triggered right before the ghost element is destroyed | false | `IDragGhostBaseEventArgs` |

### Properties

| Name | Description | Type |
|------|-------------|------|
| `location` | Gets the current location of the element relative to the page. If ghost is enabled it will get the location of the ghost, if the user is not currently dragging it will return the location of the base element. | [`IgxDragLocation`](#IgxDragLocation) |
| `originLocation` | Gets the origin location of the element before dragging started. If ghost is enabled it will get the location of the base. | [`IgxDragLocation`](#IgxDragLocation) |

<div class="divider--half"></div>

### Methods

| Name | Description | Parameters | Return Type |
|------|-------------|------------|-------------|
| `setLocation` | Sets new location for the igxDrag directive. When ghost is enable and it is not rendered it will be ignored. | `newLocation?:` [`IgxDragLocation`](#IgxDragLocation) | void |
| `transitionToOrigin` | Animates the element from its current location to its initial position. If it was not moved or no start location is specified nothing would happen . | customTransitionArgs?: [`IDragCustomTransitionArgs`](#IDragCustomTransitionArgs), `startLocation?:` [`IgxDragLocation`](#IgxDragLocation), | void |
| `transitionTo` | Animates the element from its current location to specific location or DOM element. If it was not moved or no start location is specified nothing would happen. | `target:` [`IgxDragLocation`](#IgxDragLocation)\|ElementRef, customTransitionArgs?: [`IDragCustomTransitionArgs`](#IDragCustomTransitionArgs), `startLocation?:` [`IgxDragLocation`](#IgxDragLocation) | void |

# igxDrop

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

For achieving a drop functionality with the `igxDrag` directive the `igxDrop` directive should be used. It can be applied on any kind of element and it specifies an area where the `igxDrag` can be dropped. 

By default the `igxDrop` does not apply any logic to the dragged element when it is dropped onto it. The user could choose between a few different drop strategies if he would like the `igxDrop` to perform some action or he could implement his own drop logic using the provided `onDragDrop` events.

#### Drop Strategies

The `igxDrop` comes with 4 drop strategies which are defined in the enum `IgxDropStrategy` and has the following values - `Default`, `Append`, `Prepend`, `Insert`:

* The `Default` strategy does not perform any action when an element is dropped onto an IgxDrop element and is implemented as a class named `IgxDefaultDropStrategy`.

* As the names suggest the first `Append` strategy inserts the dropped element as a last child  and is implemented as a class named `IgxAppendDropStrategy`. 

* The `Prepend` strategy inserts the dropped element as first child and is implemented as a class named `IgxPrependDropStrategy`.

* The `Insert` strategy inserts the dragged element at the dropped position. If there is a child under the element when it was dropped, the `igxDrag` instanced element will be inserted at that child's index. It is implemented as a class named `IgxInsertDropStrategy`

The way a strategy can be applied is by setting the `dropStrategy` input to one of the listed classes above. The value provided has to be e type and not an instance, since the `igxDrop` has to create the instance itself.

**Example:**

TypeScript:
```typescript
public insertStrategy = IgxInsertDropStrategy;
```

HTML:
```html
<div igxDrop [dropStrategy]="insertStrategy"></div>
```

#### Canceling a Drop Strategy

When using a specific drop strategy, its behavior can be canceled in the `onDrop` or `onDragDrop` events by setting the cancel property to true. The `onDrop` event is specific to the `igxDrag` and the `onDragDrop` event to the `igxDrop`. If the user does not have drop strategy applied to the `igxDrop` canceling the event would have no side effects.

*Example:*

HTML
```html
<div igxDrag></div>
<!-- ... -->
<div igxDrop (dropped)="onDropped($event)"></div>
```

TypeScript
```typescript
public onDropped(event) {
    event.cancel = true;
}
```

If the user would like to implement its own drop logic it can easily be done by binding to `dropped` and executing their logic when the event is triggered or extending the default drop strategy.

#### Animations

If the user decides that he want to use transition animations when dropping an element he can do that by using transition animations that can be applied to the `igxDrag` by calling the `transitionToOrigin` or `transitionTo` methods whenever he wants. Preferably that should be done when dragging of an element ends or when it is dropped onto a `igxDrop` instanced element.

*Example:*

HTML
```html
<div>Products:</div>
<div #productsContainer>
    <div *ngFor="let product of availableProducts; let i = index"
        [igxDrag]="{index: i}"
        (dragEnd)="onDragEnd($event)"
        (transitioned)="onDragAnimationEnd($event)">
        {{product}
    </div>
<div>

<div>Basket:</div>
<div igxDrop (dropped)="onDragDropped($event)">
    <div *ngFor="let product of basketProducts">{{product}}</div>
</div>
```

TypeScript
```typescript
public availableProducts = ["milk", "cheese", "banana"];
public basketProducts = [];

public onDragEnd(event) {
    event.owner.transitionToOrigin();
}
public onDragDropped(event) {
    event.drag.transitionTo(event.dropDirective.element);
}
public onDragAnimationEnd(event) {
    const removeIndex = event.owner.data.index;
    const removedElem = availableProducts.splice(removeIndex, 1);
    basketProducts.push(removedElem);
}
```

## API

### Inputs

| Name | Description | Type | Default value |
|------|-------------|------|---------------|
| `data` | Sets information to be stored in the directive. | any | undefined |
| `dropChannel` | Specifies channel or multiple channels to which the element is linked to and can interact with only those `igxDrag` elements in those channels | number \| string \| number[] \| string[] | undefined |
| `dropStrategy` | Sets a drop strategy that should be applied once an element is dropped into the current `igxDrop` element. | class reference | IgxDefaultDropStrategy |

### Outputs

| Name | Description | Cancelable | Type |
|------|-------------|------------|------------|
| `enter` | Event triggered once an `IgxDrag` instanced element enters the boundaries of the drop area. Similar to *MouseEnter*. | false | [`IDropBaseEventArgs`](#IDropBaseEventArgs) |
| `over` | Event triggered when an `IgxDrag` instanced element moves inside the boundaries of the drop area similar to *MouseOver*. | false | [`IDropBaseEventArgs`](#IDropBaseEventArgs) |
| `leave` | Event triggered once an `IgxDrag` instanced element leaves the boundaries of the drop area. Similar to *MouseLeave*.  | false | [`IDropBaseEventArgs`](#IDropBaseEventArgs) |
| `dropped` | Event triggered once an `IgxDrag` instanced element inside the drop area is released. | true | [`IDropDragDropEventArgs`](#IDropDragDropEventArgs) |
