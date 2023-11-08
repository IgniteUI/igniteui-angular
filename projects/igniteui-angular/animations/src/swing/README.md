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
const params: IAnimationParams = {
    delay: "0s",
    direction: "X",
    duration: ".5s",
    easing: EaseOut.back,
    endAngle: 0,
    endOpacity: 1,
    startAngle: -100,
    startOpacity: 0,
    xPos: "top",
    yPos: "center"
};
```

## Sample Usage
If parameters are attached, they act as default values.  When an animation is invoked via [`useAnimation`](https://angular.io/api/animations/useAnimation) then parameter values are allowed to be passed in directly. If any of the passed in parameter values are missing then the default values will be used.

``` typescript
import { swingInTopFwd } from "igniteui-angular/animations";

useAnimation(swingInTopFwd);
```
