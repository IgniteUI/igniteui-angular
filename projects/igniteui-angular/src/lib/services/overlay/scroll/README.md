# Scroll strategies

Scroll strategies determines how the scrolling will be handled in the provided IgxOverlayService. A walk through of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay_scroll.html).

There are four scroll strategies:
1) **NoOperation** - does nothing. 
2) **Block** - the component do not scroll with the window. The event is canceled. No scrolling happens.
3) **Close** - uses a tolerance and closes an expanded component upon scrolling if the tolerance is exceeded.
4) **Absolute** - scrolls everything.

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
