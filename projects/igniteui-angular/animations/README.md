# Animations

Ignite UI for Angular includes over 100+ pre-built animations. They are split in 7 groups:

  - [Fade](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/fade/README.md)
  - [Flip](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/flip/README.md)
  - [Miscellaneous](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/misc/README.md)
    - Blink
    - Heartbeat
    - Pulsate
    - Shake
  - [Rotate](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/rotate/README.md)
  - [Scale](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/scale/README.md)
  - [Slide](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/slide/README.md)
  - [Swing](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/swing/README.md)

Each group accepts a different set of parameters, allowing you to modify the behavior of any of the included animations. Each animation is an [`AnimationReferenceMetadata`](https://angular.io/api/animations/AnimationReferenceMetadata) object as produced by the [`animation`](https://angular.io/api/animations/animation) function provided by Angular.

Reusable animations are designed to make use of animations parameters and the produced animation can be used via the [`useAnimation`](https://angular.io/api/animations/useAnimation) function.

Below is a sample implementation of the fadeIn animation:

``` typescript
const base: AnimationMetadata[] = [
    style({
        opacity: `{{startOpacity}}`
    }),
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        style({
            opacity: `{{endOpacity}}`
        })
    )
];

const baseParams: IAnimationParams = {
    delay: "0s",
    duration: "350ms",
    easing: EaseOut.sine,
    endOpacity: 1,
    startOpacity: 0
};

const fadeIn: AnimationReferenceMetadata = animation(base, {
    params: { ...baseParams }
});
```
N.B.:
Some of the animations from the Flip, Rotate, and Swing groups require the parent, containing the elements being animated, to have [`perspective`](https://developer.mozilla.org/en/docs/Web/CSS/perspective) as part of its CSS properties.

# Timing Functions

Ignite UI for Angular includes a set of timing functions that can be used to ease in or out an animation.
There are three main timing function groups - **EaseIn**, **EaseOut**, and **EaseInOut**; each containing the following timings:

  - quad
  - cubic
  - quart
  - quint
  - sine
  - expo
  - circ
  - back

To use a specific timing function, import it first:
``` typescript 
import { EaseOut } from "igniteui-angular/animations";
```
and then use it as value for the easing param in any animation:

``` typescript
useAnimation(fadeIn, {
    params: {
        easing: EaseOut.back
    }
});
```
