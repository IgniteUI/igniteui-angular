# Swing

Includes:

  - swingInTopFwd
  - swingInRightFwd
  - swingInLeftFwd
  - swingInBottomFwd
  - swingInTopBck
  - swingInRightBck
  - swingInBottomBck
  - swingInLeftBck
  - swingOutTopFwd
  - swingOutRightFwd
  - swingOutBottomFwd
  - swingOutLefttFwd
  - swingOutTopBck
  - swingOutRightBck
  - swingOutBottomBck
  - swingOutLeftBck

Default Params:

``` typescript
const params: SwingParams = {
    delay: 0,
    direction: "X",
    duration: 500,
    easing: EaseOut.Back,
    endAngle: 0,
    endOpacity: 1,
    startAngle: -100,
    startOpacity: 0,
    xPos: "top",
    yPos: "center"
};
```

`direction` is the rotate axis, `X` or `Y`; `xPos`/`yPos` the hinge edge. Durations: In Fwd `500`, In Bck `600`, Out Fwd `550`, Out Bck `450`. Out presets use `EaseIn.Back` and swap the opacities.

## Sample Usage
Presets are callable. Bare, they use their defaults. Passed params override them; omitted ones keep the default.

``` typescript
import { swingInTopFwd } from "igniteui-angular/animations";

swingInTopFwd
swingInTopFwd({ startAngle: -60 })
```
