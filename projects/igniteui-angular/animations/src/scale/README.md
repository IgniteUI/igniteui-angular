# Scale

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
const params: ScaleParams = {
    delay: 0,
    direction: "",
    duration: 350,
    easing: EaseOut.Quad,
    endOpacity: 1,
    fromScale: .5,
    startOpacity: 0,
    toScale: 1,
    xPos: "50%",
    yPos: "50%"
};
```

`direction` is `""`, `"X"` or `"Y"` (`scale`, `scaleX`, `scaleY`). Ver/Hor presets scale from `.4`. Out presets use `EaseOut.Sine`, swap the opacities and scale to `.5` (`.3` for Ver/Hor). `xPos`/`yPos` are the transform origin.

## Sample Usage
Presets are callable. Bare, they use their defaults. Passed params override them; omitted ones keep the default.

``` typescript
import { scaleInTop } from "igniteui-angular/animations";

scaleInTop
scaleInTop({ fromScale: 0 })
```
