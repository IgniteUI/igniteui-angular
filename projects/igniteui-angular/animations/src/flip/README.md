# Flip

Includes:

  - flipTop
  - flipRight
  - flipBottom
  - flipLeft
  - flipHorFwd
  - flipHorBck
  - flipVerFwd
  - flipVerBck

Default Params:

``` typescript
const params: FlipParams = {
    delay: 0,
    duration: 600,
    easing: EaseOut.Quad,
    endAngle: 180,
    endDistance: "0px",
    rotateX: 1,
    rotateY: 0,
    rotateZ: 0,
    startAngle: 0,
    startDistance: "0px"
};
```

Per preset: `rotateX`/`rotateY` pick the axis, `endAngle` is `180` or `-180`, `endDistance` is `170px`/`-170px` for the Fwd/Bck variants.

## Sample Usage
Presets are callable. Bare, they use their defaults. Passed params override them; omitted ones keep the default.

``` typescript
import { flipTop } from "igniteui-angular/animations";

flipTop
flipTop({ duration: 1000 })
```
