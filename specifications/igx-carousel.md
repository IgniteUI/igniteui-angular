### Overview
A carousel component is used to browse or navigate thru a collection of slides like galleries of images, cards, on-boarding tutorials or page-based interfaces. It can be used as a separate full – screen element or inside another component

### Critical developer stories
#### Define a carousel

As a developer I want to be able to provide the slides to be displayed using ngFor directive.

```html
<igx-carousel [interval]="interval" [pause]="pause" [loop]="loop">
     <igx-slide *ngFor="let slide of slides;" [active]="slide.active">
         <img [src]="slide.image">
     </igx-slide>
</igx-carousel>
```

Through pure markup

```html
<igx-carousel [interval]="interval" [pause]="pause" [loop]="loop">
    <igx-slide [active]="slide.active">
        <img [src]="...">
    </igx-slide>
    <igx-slide>
        <img [src]="...">
    </igx-slide>
</igx-carousel>
```

#### Carousel Events

I would like to have the ability to hook up on events emitted during certain state changes in the carousel and apply custom logic based on the events.

### Important Developer Stories
#### Navigation

* Navigation with Slide Indicators - As a citizen developer I want to add indicators to the carousel that support navigation, support the current status and progress ((in a bar for mobile devices)):
 * Dots (Page indicators - iOS) within the carousel at the bottom; if a vertical or on the right/left
 * Arrows outside the carousel; if a vertical or on the right/left
 * Text , ex.g., 3 out of 15 (more than 7 dots) within the carousel at the bottom; if a vertical or on the right/left
 * Progress Bar (more than 7 dots)
 * Thumbnails

* Gestures - As a citizen developer I want to define gestures on a carousel/slider level (swipe to the left/right up/down) on touch devices.

#### Slide Href-ing/Navigation Triggers

I want to be able to set a route to which the user will navigate upon tap/click. (href to a new view)

#### Multiple Slides Shown
I want to show multiple slides at the same time or to show no slide indicators and to define that by adjusting slide’s dimensions:
 * Height ( % ) vertical direction
 * Width ( % ) horizontal direction
*Mobile*: No slide indicators
*Desktop*: Arrows
(if the first slide is shown, there is only forward chevron, if the last is shown, there is only back chavron)


### API
### Options

* Loop - I want to loop the carousel slides (false by default, not available in multiple slides shown)
 * The First and the Last slide can go backward and forward
 * If the loop is false: first slide can only go forward/ last slide can only go backwards








