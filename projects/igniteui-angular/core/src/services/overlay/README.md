# igx-overlay

The overlay service allows users to show components on overlay div above all other elements in the page.
A walk through of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay-main)

## Key Features

- **Popover API Integration**: Uses the HTML Popover API for improved z-index management and automatic top-layer placement
- **Flexible Positioning**: Multiple position strategies (global, connected, auto, elastic, container)
- **Native Anchor Positioning**: Connected, auto and container overlays are positioned with CSS anchor positioning where the browser supports it, with no script running on scroll
- **Scroll Strategies**: Handle scroll behavior with NoOp, Block, Close, Absolute and Hide strategies
- **Modal Support**: Optional modal backdrop with configurable close-on-outside-click behavior
- **Animation Support**: Built-in support for open/close animations

## Positioning engines

Each time an overlay is shown, the service picks how to position it:

- **Native** - CSS anchor positioning, resolved by the browser in layout. The content stays attached to its target while the page scrolls or resizes, with every scroll strategy.
- **Script** - the position strategy measures the target and writes pixel offsets, as before 22.4.

An overlay uses the native engine when the browser supports CSS anchor positioning and one of these applies:

- The position strategy is exactly `ConnectedPositioningStrategy` or `AutoPositionStrategy` (not a subclass), the target is an `HTMLElement` in the document, in the same document or shadow root as the overlay, and each axis uses one of the pairs listed in the [position strategies README](position/README.md#native-anchor-positioning).
- The position strategy is exactly `ContainerPositionStrategy` and the overlay was attached with it.

Everything else uses the script engine: `GlobalPositionStrategy`, `ElasticPositionStrategy`, every subclass (for example tooltips), `Point` targets, and browsers without CSS anchor positioning (Safari 18). Chrome, Edge, Firefox and Safari 26 use the native engine.

Differences under the native engine:

- Anchored content follows its target on scroll with every scroll strategy, including `NoOpScrollStrategy`. It follows one rendering frame later than the script engine did, so code that scrolls and measures in the same task sees the previous position.
- `AutoPositionStrategy` content can flip while the overlay is open, not only when it is shown. When no side fits, the browser shifts it into the viewport; the exact position can differ from the script engine.
- `ConnectedPositioningStrategy` content never flips or shifts, as before.
- Positions are not rounded to whole pixels.
- While an overlay is open, its target has an inline `anchor-name` style. Values set by the application are kept.
- If the target is removed from the document while the overlay is open, the content loses its position.

To use the script engine for every overlay, add `provideOverlayAnchoring('script')` to the application providers. It takes effect only in the root environment injector:

```typescript
import { provideOverlayAnchoring } from 'igniteui-angular/core';

bootstrapApplication(AppComponent, {
    providers: [provideOverlayAnchoring('script')]
});
```

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
| target              | Point | HTMLElement                     | Attaching target for the component to show.         |
| positionStrategy    | IPositionStrategy                       | Position strategy to use with this settings         | 
| scrollStrategy      | IScrollStrategy                         | Scroll strategy to use with this settings           |
| modal               | boolean                                 | Set if the overlay should be in modal mode          |
| closeOnOutsideClick | boolean                                 | Set if the overlay should closed on outside click   |
| outlet              | IgxOverlayOutletDirective or ElementRef | **Deprecated.** Set the outlet container to attach the overlay to |

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

###### OverlayCreateSettings extends OverlaySettings

| Name | Type | Description |
| :--- | :--- | :---------- |
|injector | Injector | An `Injector` instance to add in the created component ref's injectors tree |

##### Methods

###### IgxOverlayService

| Name            | Description                                                                     | Parameters      |
|-----------------|---------------------------------------------------------------------------------|-----------------|
|attach           | Generates Id. Provide this Id when call `show(id, settings?)` method            |element, overlaySettings? |
|attach           | Generates Id. Provide this Id when call `show(id, settings?)` method            |component, overlayCreateSettings?, |
|attach           | Generates Id. Provide this Id when call `show(id, settings?)` method            |component, viewContainerRef, overlaySettings? |
|show             | Shows the provided component on the overlay                                     |id, overlaySettings?|
|hide             | Hides the component with the ID provided as a parameter                         |id               |
|hideAll          | Hides all the components and the overlay                                        |-                |
|detach           | Remove overlay with the provided id                                             |id               |
|detachAll        | Remove all the overlays                                                         |-                |
|reposition       | Repositions the native element of the component with provided id                |id               |
|setOffset        | Offsets the content along the corresponding axis by the provided amount with optional offsetMode that determines whether to add (by default) or set the offset values with OffsetMode.Add and OffsetMode.Set | id, deltaX, deltaY, offsetMode? |

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
|createAbsoluteOverlaySettings| Creates overlay settings with global or container position strategy based on a preset position settings |position?, useContainerStrategy?|
|createRelativeOverlaySettings| Creates overlay settings with auto, connected or elastic position strategy based on a preset position settings |target, strategy?, position?|

###### Providers

| Name            | Description                                                                     | Parameters |
|-----------------|---------------------------------------------------------------------------------|------------|
|provideOverlayAnchoring| Selects the positioning engine for every overlay: `'auto'` (default, native where supported) or `'script'`. Root providers only. See [Positioning engines](#positioning-engines). |mode|


##### Events

###### IgxOverlayService
| Name              | Description                                   | Cancelable | Parameters |
|-------------------|-----------------------------------------------|------------|------------|
| opening           | Emitted before overlay shows                  | true       |            |
| opened            | Emitted after overlay shows                   | false      |            |
| closing           | Emitted before overlay hides                  | true       |            |
| closed            | Emitted after overlay hides                   | false      |            |
| contentAppending  | Emitted before overlay's content is appended  | false      |            |
| contentAppended   | Emitted after overlay's content is appended   | false      |            |
| animationStarting | Emitted before animation is started           | false      |            |
