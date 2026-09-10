# Grow

Includes:

  - growVerIn
  - growVerOut

Default Params:

``` typescript
const params: GrowParams = {
    delay: 0,
    duration: 350,
    easing: EaseOut.Quad,
    endOpacity: 1,
    startOpacity: 0,
    startHeight: "0px",
    endHeight: "auto",
    startPadding: "0px"
};
```

growVerOut swaps the start/end values and sets `endPadding: "0px"` instead of `startPadding`.

`'auto'` height is measured on the element by the player. `startPadding` and `endPadding` are optional; an omitted one is taken from the computed style.

## Sample Usage
Presets are callable. Bare, they use their defaults. Passed params override them; omitted ones keep the default.

``` typescript
import { growVerIn } from "igniteui-angular/animations";

growVerIn
growVerIn({ duration: 500 })
```
