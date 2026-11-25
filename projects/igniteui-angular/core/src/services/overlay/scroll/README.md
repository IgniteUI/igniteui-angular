# Scroll strategies

Scroll strategies determines how the scrolling will be handled in the provided IgxOverlayService. A walk through of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay-scroll).

There are five scroll strategies:
1) **NoOperation** - does nothing. 
2) **Block** - the component do not scroll with the window. The event is canceled. No scrolling happens.
3) **Close** - uses a tolerance and closes an expanded component upon scrolling if the tolerance is exceeded.
4) **Absolute** - scrolls everything.
5) **Hide** - hides the content while its target is scrolled out of view and shows it again when the target returns. The overlay stays open. Otherwise behaves as **Absolute**.

With [native anchor positioning](../README.md#positioning-engines), anchored content follows its target on scroll with every scroll strategy, including **NoOperation**.

### Hide scroll strategy

```typescript
import { AutoPositionStrategy, HideScrollStrategy, OverlaySettings } from 'igniteui-angular/core';

const settings: OverlaySettings = {
    target: button,
    positionStrategy: new AutoPositionStrategy(),
    scrollStrategy: new HideScrollStrategy()
};
```

| Situation | Behavior |
|:----------|:---------|
| What is watched | The target for connected, auto and elastic positioning; the container for `ContainerPositionStrategy`. A `Point` target or `GlobalPositionStrategy` has nothing to watch, so the content is never hidden. |
| When the content is hidden | While the watched element is fully clipped by the viewport or a scrolling ancestor. One visible pixel shows the content again. |
| How it is hidden | Visually only. The overlay stays open: `closing` and `closed` are not emitted, and `Esc` and outside clicks still close it. Focus inside the hidden content is lost. |
| Browser | With native anchor positioning, the browser hides the content (`position-visibility: anchors-visible`). Elsewhere, including Safari 26.0 and 26.1, an `IntersectionObserver` hides it, up to one frame later. |

## Usage

```typescript
this.scrollStrategy.initialize(document, overlayService, id);
this.scrollStrategy.attach();
this.scrollStrategy.detach();
```

## Getting Started

### Dependencies

To use the any of the scroll strategies import it like this:

```typescript
import { NoOpScrollStrategy } from "./scroll/NoOpScrollStrategy";
```

## API

##### Methods

###### IScrollStrategy

| Name            | Description                                                                     | Parameters |
|-----------------|---------------------------------------------------------------------------------|------------|
|initialize       | Initialize the strategy. Should be called once                  |document, overlayService, id|
|attach           | Attaches the strategy                                                           |-           |
|detach           | Detaches the strategy                                                           |-           |
