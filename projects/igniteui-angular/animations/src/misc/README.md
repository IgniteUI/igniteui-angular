# Miscellaneous

Includes:
 - blink
 - heartbeat
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
const blinkParams: BlinkParams = {
    delay: 0,
    duration: 800,
    easing: "ease-in-out",
    fromScale: .2,
    midScale: 1.2,
    toScale: 2.2
};
```

Default Heartbeat Params:

``` typescript
const heartbeatParams: AnimationParams = {
    delay: 0,
    duration: 1500,
    easing: "ease-in-out"
};
```

Default Pulsate Params:

``` typescript
const pulsateParams: PulsateParams = {
    delay: 0,
    duration: 500,
    easing: "ease-in-out",
    fromScale: 1,
    toScale: 1.1
};
```

pulsateBck uses `toScale: .9`.

Default Shake Params:

``` typescript
const shakeParams: ShakeParams = {
    delay: 0,
    direction: "X",
    duration: 800,
    easing: EaseInOut.Quad,
    endAngle: 0,
    endDistance: "8px",
    startAngle: 0,
    startDistance: "10px",
    xPos: "center",
    yPos: "center"
};
```

shakeHor/shakeVer translate only. The other shakes rotate around `xPos`/`yPos` with `startAngle: 4`, `endAngle: 2` (shakeCenter: `10`/`8`) and zero distance.

## Sample Usage
Presets are callable. Bare, they use their defaults. Passed params override them; omitted ones keep the default.

``` typescript
import { blink } from "igniteui-angular/animations";

blink
blink({ duration: 400 })
```
