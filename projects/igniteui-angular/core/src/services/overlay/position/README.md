# Position strategies

Position strategies determine where to display the component in the provided IgxOverlayService. There are five position strategies:
1) **Global** - Positions the element based on the directions passed in through PositionSettings. These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection. Defaults to:

| horizontalDirection        | verticalDirection        |
|:---------------------------|:-------------------------|
| HorizontalAlignment.Center | VerticalAlignment.Middle |

2) **Container** - Positions the element relative to its nearest positioned ancestor. Directions are passed in through PositionSettings (Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection). Defaults to:

| horizontalDirection        | verticalDirection        |
|:---------------------------|:-------------------------|
| HorizontalAlignment.Center | VerticalAlignment.Middle |


3) **Connected** - Positions the element based on the directions and start point passed in through PositionSettings. It is possible to either pass a start point or an HTMLElement as a positioning base. Defaults to:

| target          | horizontalDirection       |  verticalDirection       | horizontalStartPoint     | verticalStartPoint       |
|:----------------|:--------------------------|:-------------------------|:-------------------------|:-------------------------|
| new Point(0, 0) | HorizontalAlignment.Right | VerticalAlignment.Bottom | HorizontalAlignment.Left | VerticalAlignment.Bottom |

4) **Auto** - Positions the element as in **Connected** positioning strategy and re-positions the element in the view port (calculating a different start point) in case the element is partially getting out of view. Defaults to:

| target          | horizontalDirection       |  verticalDirection       | horizontalStartPoint     | verticalStartPoint       |
|:----------------|:--------------------------|:-------------------------|:-------------------------|:-------------------------|
| new Point(0, 0) | HorizontalAlignment.Right | VerticalAlignment.Bottom | HorizontalAlignment.Left | VerticalAlignment.Bottom |

5) **Elastic** - Positions the element as in **Connected** positioning strategy and resize the element to fit in the view port in case the element is partially getting out of view. Defaults to:

| target          | horizontalDirection       |  verticalDirection       | horizontalStartPoint     | verticalStartPoint       | minSize                 |
|:----------------|:--------------------------|:-------------------------|:-------------------------|:-------------------------|-------------------------|
| new Point(0, 0) | HorizontalAlignment.Right | VerticalAlignment.Bottom | HorizontalAlignment.Left | VerticalAlignment.Bottom | { width: 0, height: 0 } |

## Native anchor positioning

In browsers with CSS anchor positioning, `ConnectedPositioningStrategy`, `AutoPositionStrategy` and `ContainerPositionStrategy` overlays are positioned by the browser instead of by the strategy's `position()` method (see [Positioning engines](../README.md#positioning-engines)). Global and Elastic positioning, and subclasses of any strategy, always use script positioning.

**Connected and Auto** go native when each axis uses one of these start point → direction pairs:

| Horizontal | Vertical |
|:-----------|:---------|
| `Left → Left` (before the target) | `Top → Top` (above the target) |
| `Left → Right` (left edges aligned) | `Top → Bottom` (top edges aligned) |
| `Center → Center` (centered) | `Middle → Middle` (centered) |
| `Right → Left` (right edges aligned) | `Bottom → Top` (bottom edges aligned) |
| `Right → Right` (after the target) | `Bottom → Bottom` (below the target) |

Other pairs, such as `Left → Center`, use script positioning. The start points default to `Left` and `Bottom`, so set them together with the directions, for example `horizontalStartPoint: HorizontalAlignment.Center` with `horizontalDirection: HorizontalAlignment.Center`. The `offset` setting applies to the axes where the content is outside the target (`Left → Left`, `Right → Right`, `Top → Top`, `Bottom → Bottom`), as with script positioning.

- **Connected** keeps the content where the settings place it, even when it does not fit in the viewport.
- **Auto** flips each axis to the opposite side of the target when the content does not fit, and flips both when needed. The open and close animations are reversed after a flip, as with script positioning. The browser re-evaluates the fit while the overlay is open, and keeps the flipped side until the overlay is shown again. When no side fits, the content is shifted into the viewport. The strategy `settings` are never changed by a flip.

**Container** anchors the overlay wrapper to the container that the service creates, so the wrapper covers the container and follows it on scroll without an `IntersectionObserver`.

## Usage

### Container positioning
Position an element relative to its nearest positioned ancestor using `ContainerPositionStrategy`:
```typescript
const overlaySettings: OverlaySettings = {
    positionStrategy: new ContainerPositionStrategy({
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Middle
    }),
    scrollStrategy: new NoOpScrollStrategy(),
    modal: false,
    closeOnOutsideClick: true
};
```

### Connected positioning
Position an element based on an existing button as a target, so its start point is the button's Bottom/Left corner.
```typescript
const positionSettings: PositionSettings = {
    target: buttonElement.nativeElement,
    horizontalDirection: HorizontalAlignment.Right,
    verticalDirection: VerticalAlignment.Bottom,
    horizontalStartPoint: HorizontalAlignment.Left,
    verticalStartPoint: VerticalAlignment.Bottom,
    minSize: { width: 100, height: 300 }
};

const strategy = new ConnectedPositioningStrategy(positionSettings);
strategy.position(contentWrapper, size);
```

## Getting Started

### Dependencies

Import the desired position strategy if needed like:

```typescript
import { AutoPositionStrategy, GlobalPositionStrategy, ContainerPositionStrategy, ConnectedPositioningStrategy } from 'igniteui-angular';
```

## API

##### Methods
| Position Strategy | Name                                                   | Description                                                                       |
|:------------------|:-------------------------------------------------------|:----------------------------------------------------------------------------------|
| Global            | `position(contentElement)`                             | Positions the element, based on the horizontal and vertical directions.           |
| Container         | `position(contentElement)`                             | Positions the element relative to its nearest positioned ancestor based on the directions passed in through PositionSettings.|
| Connected         | `position(contentElement, size{})`                     | Positions the element, based on the position strategy used and the size passed in.|
| Auto              | `position(contentElement, size{}, document?)`          | Positions the element, based on the position strategy used and the size passed in.|
| Elastic           | `position(contentElement, size{}, document?, minSize?)`| Positions the element, based on the position strategy used and the size passed in.|

###### PositionSettings
| Name               | Type                        | Description |
| :----------------- | :-------------------------- | :---------- |
|target              | Point | HTMLElement         | Attaching target for the component to show          |
|horizontalDirection | HorizontalAlignment         | Direction in which the component should show        |
|verticalDirection   | VerticalAlignment           | Direction in which the component should show        |
|horizontalStartPoint| HorizontalAlignment         | Target's starting point                             |
|verticalStartPoint  | VerticalAlignment           | Target's starting point                             |
|openAnimation       | AnimationReferenceMetadata  | Animation applied while overlay opens               |
|closeAnimation      | AnimationReferenceMetadata  | Animation applied while overlay closes              |
|minSize             | Size                        | The size up to which element could be reduced       |
