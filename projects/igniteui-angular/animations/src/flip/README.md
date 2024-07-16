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
const params: IAnimationParams = {
    delay: "0s",
    duration: "600ms",
    easing: EaseOut.quad,
    endAngle: 180,
    endDistance: "0px",
    rotateX: 1,
    rotateY: 0,
    rotateZ: 0,
    startAngle: 0,
    startDistance: "0px"
};
```

## Sample Usage
If parameters are attached, they act as default values.  When an animation is invoked via [`useAnimation`](https://angular.io/api/animations/useAnimation) then parameter values are allowed to be passed in directly. If any of the passed in parameter values are missing then the default values will be used.

``` typescript
import { flipTop } from "igniteui-angular/animations";

useAnimation(fadeIn);
```
