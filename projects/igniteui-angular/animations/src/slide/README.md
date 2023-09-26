# Slide

Includes:

  - scaleInTop
  - scaleInRight
  - scaleInBottom
  - scaleInLeft
  - scaleInCenter
  - scaleInTr
  - scaleInBr
  - scaleInBl
  - scaleInTl
  - scaleInVerTop
  - scaleInVerBottom
  - scaleInVerCenter
  - scaleInHorCenter
  - scaleInHorLeft
  - scaleInHorRight
  - scaleOutTop
  - scaleOutRight
  - scaleOutBottom
  - scaleOutLeft
  - scaleOutCenter
  - scaleOutTr
  - scaleOutBr
  - scaleOutBl
  - scaleOutTl
  - scaleOutVerTop
  - scaleOutVerBottom
  - scaleOutVerCenter
  - scaleOutHorCenter
  - scaleOutHorLeft
  - scaleOutHorRight

Default Params:

``` typescript
const params: IAnimationParams = {
    delay: "0s",
    direction: "",
    duration: "350ms",
    easing: EaseOut.quad,
    endOpacity: 1,
    fromScale: .5,
    startOpacity: 0,
    toScale: 1,
    xPos: "50%",
    yPos: "50%"
};
```

## Sample Usage
If parameters are attached, they act as default values.  When an animation is invoked via [`useAnimation`](https://angular.io/api/animations/useAnimation) then parameter values are allowed to be passed in directly. If any of the passed in parameter values are missing then the default values will be used.

``` typescript
import { scaleInTop } from "igniteui-angular/animations";

useAnimation(scaleInTop);
```
