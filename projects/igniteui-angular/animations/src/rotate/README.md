# Rotate

Includes:

  - rotateInCenter
  - rotateInTop
  - rotateInRight
  - rotateInLeft
  - rotateInBottom
  - rotateInTr
  - rotateInBr
  - rotateInBl
  - rotateInTl
  - rotateInDiagonal1
  - rotateInDiagonal2
  - rotateInHor
  - rotateInVer
  - rotateOutCenter
  - rotateOutTop
  - rotateOutRight
  - rotateOutLeft
  - rotateOutBottom
  - rotateOutTr
  - rotateOutBr
  - rotateOutBl
  - rotateOutTl
  - rotateOutDiagonal1
  - rotateOutDiagonal2
  - rotateOutHor
  - rotateOutVer

Default Params:

``` typescript
const params: IAnimationParams = {
    delay: "0s",
    duration: "600ms",
    easing: EaseOut.quad,
    endAngle: 0,
    endOpacity: 1,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 1,
    startAngle: -360,
    startOpacity: 0,
    xPos: "center",
    yPos: "center"
};
```

## Sample Usage
If parameters are attached, they act as default values.  When an animation is invoked via [`useAnimation`](https://angular.io/api/animations/useAnimation) then parameter values are allowed to be passed in directly. If any of the passed in parameter values are missing then the default values will be used.

``` typescript
import { rotateInCenter } from "igniteui-angular/animations";

useAnimation(rotateInCenter);
```
