# igx-overlay

The overlay service allows users to show components on overlay div above all other elements in the page.
A walk through of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay-main)

## Usage

### With igxToggleDirective

```html
<div igxToggle>
</div>
```
```typescript
@ViewChild(IgxToggleDirective) public igxToggle: IgxToggleDirective;
this.igxToggle.toggle();
```
----

### Directly through the service

```typescript
this.overlay.show(component);
```

## Getting Started

### Dependencies

To use the IgxOverlay import the IgxOverlayService:

```typescript
import { IgxOverlayService } from "igniteui-angular";
```

Then initialize the overlay settings, only if you need some different from default ones.

```typescript
overlaySettings: OverlaySettings = {
    target: new Point(0, 0),
    positionStrategy: new GlobalPositionStrategy(),
    scrollStrategy: new NoOpScrollStrategy(),
    modal: true,
    closeOnOutsideClick: true
};
```

Finally show the component you need with the overlay settings you need:
```typescript
this.overlay.show(component, overlaySettings);
```


## API

##### Interfaces

###### IPositionStrategy

| Name | Type | Description |
| :--- | :--- | :---------- |
| positionSettings | PositionSettings | Settings to apply to this position strategy |

###### OverlaySettings

| Name | Type | Description |
| :--- | :--- | :---------- |
| target              | Point | HTMLElement                     | Attaching target for the component to show          |
| positionStrategy    | IPositionStrategy                       | Position strategy to use with this settings         | 
| scrollStrategy      | IScrollStrategy                         | Scroll strategy to use with this settings           |
| modal               | boolean                                 | Set if the overlay should be in modal mode          |
| closeOnOutsideClick | boolean                                 | Set if the overlay should closed on outside click   |
| outlet              | IgxOverlayOutletDirective or ElementRef | Set the outlet container to attach the overlay to   |

###### PositionSettings

| Name | Type | Description |
| :--- | :--- | :---------- |
|horizontalDirection | HorizontalAlignment                     | Direction in which the component should show        |
|verticalDirection   | VerticalAlignment                       | Direction in which the component should show        |
|horizontalStartPoint| HorizontalAlignment                     | Target's starting point                             |
|verticalStartPoint  | VerticalAlignment                       | Target's starting point                             |
|openAnimation       | AnimationMetadata | AnimationMetadata[] | Animation applied while overlay opens               |
|closeAnimation      | AnimationMetadata | AnimationMetadata[] | Animation applied while overlay closes              |
|minSize             | Size        | The size up to which element may shrink when shown in elastic position strategy |


##### Methods

###### IgxOverlayService

| Name            | Description                                                                     | Parameters      |
|-----------------|---------------------------------------------------------------------------------|-----------------|
|attach           | Generates Id. Provide this Id when call `show(id, settings?)` method   |element, overlaySettings? |
|attach           | Generates Id. Provide this Id when call `show(id, settings?)` method |component, overlaySettings?, moduleRef? |
|show             | Shows the provided component on the overlay                                  |id, overlaySettings?|
|hide             | Hides the component with the ID provided as a parameter                         |id               |
|hideAll          | Hides all the components and the overlay                                        |-                |
|detach           | Remove overlay with the provided id                                             |id               |
|detachAll        | Remove all the overlays                                                         |-                |
|reposition       | Repositions the native element of the component with provided id                |id               |
|setOffset        | Offsets the content along the corresponding axis by the provided amount       |id, deltaX, deltaY |

###### IPositionStrategy

| Name            | Description                                                                     | Parameters |
|-----------------|---------------------------------------------------------------------------------|------------|
|position         | Positions provided element                                                      |element     |
|clone            | Clones the position strategy and its settings                                   |-           |

###### IScrollStrategy

| Name            | Description                                                                     | Parameters |
|-----------------|---------------------------------------------------------------------------------|------------|
|initialize       | Initialize the strategy. Should be called once                  |document, overlayService, id|
|attach           | Attaches the strategy                                                           |-           |
|detach           | Detaches the strategy                                                           |-           |

###### static methods

| Name            | Description                                                                     | Parameters |
|-----------------|---------------------------------------------------------------------------------|------------|
|getPointFromPositionsSettings| Calculates the point from which the overlay should start showing    |settings    |
|createAbsoluteOverlaySettings| Creates overlay settings with global or container position strategy based on a preset position settings    |position?, outlet?|
|createRelativeOverlaySettings| Creates overlay settings with auto, connected or elastic position strategy based on a preset position settings    |target, strategy?, position?|


##### Events

###### IgxOverlayService
| Name        | Description                                   | Cancelable | Parameters |
|-------------|-----------------------------------------------|------------|------------|
|onAppended   | Emitted after overlay's content is appended   | false      |            |
|onOpening    | Emitted before overlay shows                  | true       |            |
|onOpened     | Emitted after overlay shows                   | false      |            |
|onClosing    | Emitted before overlay hides                  | true       |            |
|onClosed     | Emitted after overlay hides                   | false      |            |
|onAnimation  | Emitted before animation is started           | false      |            |
