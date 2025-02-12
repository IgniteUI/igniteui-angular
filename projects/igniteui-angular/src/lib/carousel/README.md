# igx-carousel

A carousel component is used to browse or navigate through a collection of slides - galleries of images,
cards, on-boarding tutorials or page-based interfaces. It can be used as a separate full screen element
or inside another component.
A walkthrough of how to get started can be found [here](https://www.infragistics.com/products/ignite-ui-angular/angular/components/carousel.html)

# API Summary `igx-carousel`
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `id` | string | Unique identifier of the component. If not provided it will be automatically generated.|
| `loop` |  boolean | Should the carousel wrap back to the first slide after it reaches the last. Defaults to `true`. |
| `pause` | boolean | Should the carousel stop playing on user interaction. Defaults to `true`.  |
| `interval` | number | The amount of time in milliseconds between slides transition. |
| `navigation` | boolean | Controls should the carousel render the left/right navigation buttons. Defaults to `true`. |
| `indicators` | boolean | Controls should the carousel render the indicators. Defaults to `true`. |
| `vertical` | boolean | Controls should the carousel be rendered in vertical alignment. Defaults to `false`. |
| `keyboardSupport` | boolean | Controls should the keyboard navigation should be supported. Defaults to `false`. |
| `gesturesSupport` | boolean | Controls should the gestures should be supported. Defaults to `true`. |
| `maximumIndicatorsCount` | number | The number of visible indicators. Defaults to `10`. |
| `indicatorsOrientation` | CarouselIndicatorsOrientation | Controls the orientation of the indicators. Defaults to `end`. |
| `animationType` | CarouselAnimationType | Controls what animation should be played when slides are changing. Defaults to `slide`. |
| `total` | number | The number of slides the carousel currently has.  |
| `current` | number | The index of the slide currently showing. |
| `isPlaying` | boolean | Returns whether the carousel is paused/playing. |
| `isDestroyed` | boolean | If the carousel is destroyed (`ngOnDestroy` was called) |
| `slideChanged` | event | Emitted on slide change |
| `slideAdded` | event | Emitted when a slide is being added to the carousel |
| `slideRemoved`| event | Emitted whe a slide is being removed from the carousel |
| `carouselPaused` | event | Emitted when the carousel is pausing. |
| `carouselPlaying`| event | Emitted when the carousel starts/resumes playing. |
| `play()` | void | Emits `carouselPlaying` event and starts the transition between slides. |
| `stop()` | void | Emits `carouselPaused` event and stops the transition between slides. |
| `prev()` | void | Switches to the previous slide. Emits `slideChanged` event. |
| `next()` | void | Switches to the next slide. Emits `slideChanged` event. |
| `add(slide: IgxSlide)` | void | Adds a slide to the carousel. Emits `slideAdded` event. |
| `remove(slide: IgxSlide)` | void | Removes an existing slide from the carousel. Emits `slideRemoved` event. |
| `get(index: Number)` | IgxSlide or void | Returns the slide with the given index or null. |
| `select(slide: IgxSlide, direction: Direction)`| void | Selects the slide and the direction to transition to. Emits `slideChanged` event. |

### Keyboard navigation
Keyboard navigation will be enabled when the **IgxCarousel** component is focused and `keyboardSupport` property is set to `true`:
- Arrow keys will navigate through the slides.
- `Home` will focus the first slide inside the carousel view.
- `End` will focus the last slide inside the carousel view.

### Templates
The **IgxCarousel** supports templating indicators and navigation buttons

#### Defining item template:
```html
<igx-carousel #carousel>
        ...
    <ng-template igxCarouselIndicator let-slide>
        <igx-icon *ngIf="slide.active">brightness_7</igx-icon>
        <igx-icon *ngIf="!slide.active">brightness_5</igx-icon>
    </ng-template>
</igx-carousel>
```

#### Defining next button template:
```html
<igx-carousel #carousel>
        ...
    <ng-template igxCarouselNextButton let-disabled>
        <button type="button" igxButton="fab" igxRipple="white" [disabled]="disabled">
            <igx-icon>add</igx-icon>
        </button>
    </ng-template>
</igx-carousel>
```

#### Defining previous button template:
```html
<igx-carousel #carousel>
        ...
    <ng-template igxCarouselPrevButton let-disabled>
        <button type="button" igxButton="fab" igxRipple="white" [disabled]="disabled">
            <igx-icon>remove</igx-icon>
        </button>
    </ng-template>
</igx-carousel>
```

# API Summary `igx-slide`
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `index` |  number | The index of the slide inside the carousel. |
| `direction` |  Direction | The direction in which the slide should transition. Possibly values are `NONE`, `NEXT`, `PREV` |
| `active`| boolean | Whether the current slide is active, i.e. the one being currently displayed by the carousel. |

# Usage
```html
<igx-carousel [interval]="interval" [pause]="shouldPause" [loop]="shouldLoop">
    <igx-slide *ngFor="let slide of slides;" [active]="slide.active">
        <img [src]="slide.image">
    </igx-slide>
</igx-carousel>
```
