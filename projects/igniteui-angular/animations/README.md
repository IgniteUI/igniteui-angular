# Animations

Ignite UI for Angular includes over 100+ pre-built animations. They are split in 8 groups:

  - [Fade](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/fade/README.md)
  - [Flip](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/flip/README.md)
  - [Grow](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/grow/README.md)
  - [Miscellaneous](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/misc/README.md)
    - Blink
    - Heartbeat
    - Pulsate
    - Shake
  - [Rotate](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/rotate/README.md)
  - [Scale](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/scale/README.md)
  - [Slide](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/slide/README.md)
  - [Swing](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular/animations/src/swing/README.md)

Animations are built on the [Web Animations API](https://developer.mozilla.org/docs/Web/API/Web_Animations_API). `@angular/animations` is not required.

Each animation is an `AnimationPreset`: a callable with defaults. Use it bare, or call it with a partial set of params to override the defaults:

``` typescript
import { fadeIn } from "igniteui-angular/animations";

fadeIn
fadeIn({ duration: 1000, startOpacity: 0.2 })
```

Each group exports a params interface (`FadeParams`, `SlideParams`, ...). All extend `AnimationParams`:

``` typescript
interface AnimationParams {
    duration: number; // ms
    delay: number;    // ms
    easing: string;   // CSS easing
}
```

Calling a preset produces an `AnimationReferenceMetadata`, plain WAAPI keyframes plus timing options:

``` typescript
interface AnimationReferenceMetadata {
    steps: Keyframe[];
    options?: KeyframeAnimationOptions;
}
```

Below is the implementation of the fadeIn animation:

``` typescript
export interface FadeParams extends AnimationParams {
    startOpacity: number;
    endOpacity: number;
}

const steps = (p: FadeParams): Keyframe[] => [
    { opacity: p.startOpacity },
    { opacity: p.endOpacity }
];

export const fadeIn = definePreset<FadeParams>('fadeIn', {
    delay: 0,
    duration: 350,
    easing: EaseOut.Sine,
    endOpacity: 1,
    startOpacity: 0
}, steps);
```

## Custom animations

Wrap raw keyframes with `animation`:

``` typescript
import { animation } from "igniteui-angular/animations";

const custom = animation(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 300, easing: "ease-out" }
);
```

## Utilities

  - `reverseAnimation(input)` - mirrored counterpart with the same overrides, e.g. `slideInLeft({ duration: 1000 })` becomes `slideInRight({ duration: 1000 })`. Unknown inputs come back unchanged.
  - `isHorizontalAnimation(input)` / `isVerticalAnimation(input)` - axis the preset moves along.

N.B.:
Some of the animations from the Flip, Rotate, and Swing groups require the parent, containing the elements being animated, to have [`perspective`](https://developer.mozilla.org/en/docs/Web/CSS/perspective) as part of its CSS properties.

# Timing Functions

Ignite UI for Angular includes a set of timing functions that can be used to ease in or out an animation.
There are three main timing function groups - **EaseIn**, **EaseOut**, and **EaseInOut**; each containing the following timings:

  - Quad
  - Cubic
  - Quart
  - Quint
  - Sine
  - Expo
  - Circ
  - Back

Each is a CSS `cubic-bezier()` string. Any CSS easing string works as well.

To use a specific timing function, import it first:
``` typescript
import { EaseOut } from "igniteui-angular/animations";
```
and then use it as value for the easing param in any animation:

``` typescript
fadeIn({ easing: EaseOut.Back });
```
