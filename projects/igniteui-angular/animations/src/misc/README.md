# Miscellaneous

Includes:
 - blink
 - hearbeat
 - pulsateFwd
 - pulsateBck
 - shakeHor
 - shakeVer
 - shakeTop
 - shakeBottom
 - shakeRight
 - shakeLeft
 - shakeCenter
 - shakeTr
 - shakeBr
 - shakeBl
 - shakeTl

Default Blink Params:

``` typescript
const blinkParams: IAnimationParams = {
    delay: "0s",
    duration: ".8s",
    easing: "ease-in-out",
    fromScale: .2,
    midScale: 1.2,
    toScale: 2.2
};
```

Default Hearbeat Params:

``` typescript
const heartbeatParams: IAnimationParams = {
    delay: "0s",
    duration: "1.5s",
    easing: "ease-in-out"
};
```

Default Pulsate Params:

``` typescript
const pulsateParams: IAnimationParams = {
    delay: "0s",
    duration: ".5s",
    easing: "ease-in-out",
    fromScale: 1,
    toScale: 1.1
};
```
                                
Default Shake Params:

``` typescript
const shakeParams: IAnimationParams = {
    delay: "0s",
    direction: "X",
    duration: "800ms",
    easing: EaseInOut.quad,
    endAngle: 0,
    endDistance: "8px",
    startAngle: 0,
    startDistance: "10px",
    xPos: "center",
    yPos: "center"
};
```
## Sample Usage
If parameters are attached, they act as default values.  When an animation is invoked via [`useAnimation`](https://angular.io/api/animations/useAnimation) then parameter values are allowed to be passed in directly. If any of the passed in parameter values are missing then the default values will be used.

``` typescript
import { blink } from "igniteui-angular/animations";

useAnimation(blink);
```
