# igx-carousel

A carousel component is used to browse or navigate through a collection of slides - galeries of images,
cards, on-boarding tutorials or page-based interfaces. It can be used as a seperate fullscreen element
or inside another component.

# API Summary `igx-carousel`
| Name   |      Type      |  Description |
|:----------|:-------------:|:------|
| `loop` |  boolean | Should the carousel wrap back to the first slide after it reaches the last. Defaults to `true`. |
| `pause` | boolean | Should the carousel stop playing on user interaction. Defaults to `true`.  |
| `interval` | number | The amount of time in milliseconds between slides transition. |
| `navigation` | boolean | Controls should the carousel render the left/right navigation buttons. Defaults to `true`. |
| `total` | number | The number of slides the carousel currently has.  |
| `current` | number | The index of the slide currently showing. |
| `isPlaying` | boolean | Returns whether the carousel is paused/playing. |
| `isDestroyed` | boolean | If the carousel is destroyed (`ngOnDestroy` was called) |
| `onSlideChanged` | event | Emitted on slide change |
| `onSlideAdded` | event | Emitted when a slide is being added to the carousel |
| `onSlideRemoved`| event | Emitted whe a slide is being removed from the carousel |
| `onCarouselPaused` | event | Emitted when the carousel is pausing. |
| `onCarouselPlaying`| event | Emitted when the carousel starts/resumes playing. |
| `play()` | void | Emits `onCarouselPlaying` event and starts the transition between slides. |
| `stop()` | void | Emits `onCarouselPaused` event and stops the transition between slides. |
| `prev()` | void | Switches to the previous slide. Emits `onSlideChanged` event. |
| `next()` | void | Switches to the next slide. Emits `onSlideChanged` event. |
| `add(slide: IgxSlide)` | void | Adds a slide to the carousel. Emits `onSlideAdded` event. |
| `remove(slide: IgxSlide)` | void | Removes an existing slide from the carousel. Emits `onSlideRemoved` event. |
| `get(index: Number)` | IgxSlide or void | Returns the slide with the given index or null. |
| `select(slide: IgxSlide, direction: Direction)`| void | Selects the slide and the direction to transition to. Emits `onSlideChanged` event. |

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
