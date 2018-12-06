# Position strategies

Position strategies determine where to display the component in the provided IgxOverlayService. There are three position strategies:
1) **Global** - Positions the element based on the directions passed in trough PositionSettings. These are Top/Middle/Bottom for verticalDirection and Left/Center/Right for horizontalDirection. Defaults to:

| horizontalDirection        | verticalDirection        |
|:---------------------------|:-------------------------|
| HorizontalAlignment.Center | VerticalAlignment.Middle |


2) **Connected** - Positions the element based on the directions and start point passed in trough PositionSettings. It is possible to either pass a start point or an HTMLElement as a positioning base. Defaults to:

| target          | horizontalDirection       |  verticalDirection       | horizontalStartPoint     | verticalStartPoint       |
|:----------------|:--------------------------|:-------------------------|:-------------------------|:-------------------------|
| new Point(0, 0) | HorizontalAlignment.Right | VerticalAlignment.Bottom | HorizontalAlignment.Left | VerticalAlignment.Bottom |

3) **Auto** - Positions the element as in **Connected** positioning strategy and re-positions the element in the view port (calculating a different start point) in case the element is partially getting out of view. Defaults to:

| target          | horizontalDirection       |  verticalDirection       | horizontalStartPoint     | verticalStartPoint       |
|:----------------|:--------------------------|:-------------------------|:-------------------------|:-------------------------|
| new Point(0, 0) | HorizontalAlignment.Right | VerticalAlignment.Bottom | HorizontalAlignment.Left | VerticalAlignment.Bottom |

4) **Elastic** - Positions the element as in **Connected** positioning strategy and resize the element to fit in the view port in case the element is partially getting out of view. Defaults to:

| target          | horizontalDirection       |  verticalDirection       | horizontalStartPoint     | verticalStartPoint       |
|:----------------|:--------------------------|:-------------------------|:-------------------------|:-------------------------|
| new Point(0, 0) | HorizontalAlignment.Right | VerticalAlignment.Bottom | HorizontalAlignment.Left | VerticalAlignment.Bottom |

## Usage
Position an element based on an existing button as a target, so it's start point is the button's Bottom/Left corner.
```typescript
const positionSettings: PositionSettings = {
    target: buttonElement.nativeElement,
    horizontalDirection: HorizontalAlignment.Right,
    verticalDirection: VerticalAlignment.Bottom,
    horizontalStartPoint: HorizontalAlignment.Left,
    verticalStartPoint: VerticalAlignment.Bottom
};

const strategy =  new ConnectedPositioningStrategy(positionSettings);
strategy.position(contentWrapper, size);
```

## Getting Started

### Dependencies

Import the desired position strategy if needed like:

```typescript
import {AutoPositionStrategy, GlobalPositionStrategy, ConnectedPositioningStrategy } from './position/global-position-strategy';
```

## API

##### Methods
| Position Strategy | Name                                                   | Description                                                                       |
|:------------------|:-------------------------------------------------------|:----------------------------------------------------------------------------------|
| Global            | `position(contentElement)`                             | Positions the element, based on the horizontal and vertical directions.           |
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
