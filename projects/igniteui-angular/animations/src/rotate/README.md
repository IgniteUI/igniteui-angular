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
const params: RotateParams = {
    delay: 0,
    duration: 600,
    easing: EaseOut.Quad,
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

Out presets use `EaseIn.Quad` and swap the opacities. `xPos`/`yPos` are the transform origin; Diagonal/Hor/Ver presets change the rotate axis.

## Sample Usage
Presets are callable. Bare, they use their defaults. Passed params override them; omitted ones keep the default.

``` typescript
import { rotateInCenter } from "igniteui-angular/animations";

rotateInCenter
rotateInCenter({ startAngle: -180 })
```
