# Slide

Includes:

  - slideInTop
  - slideInRight
  - slideInBottom
  - slideInLeft
  - slideInTr
  - slideInBr
  - slideInBl
  - slideInTl
  - slideOutTop
  - slideOutRight
  - slideOutBottom
  - slideOutLeft
  - slideOutTr
  - slideOutBr
  - slideOutBl
  - slideOutTl

Default Params:

``` typescript
const params: SlideParams = {
    delay: 0,
    duration: 350,
    easing: EaseOut.Quad,
    endOpacity: 1,
    startOpacity: 0,
    fromPosition: "translateY(-500px)",
    toPosition: "translateY(0)"
};
```

`fromPosition`/`toPosition` are CSS transforms; each preset sets its own direction. Out presets use `EaseIn.Quad` and swap the opacities.

## Sample Usage
Presets are callable. Bare, they use their defaults. Passed params override them; omitted ones keep the default.

``` typescript
import { slideInTop } from "igniteui-angular/animations";

slideInTop
slideInTop({ fromPosition: "translateY(-100px)" })
```
