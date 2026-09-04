# Fade

Includes:

  - fadeIn
  - fadeOut

Default Params:

``` typescript
const params: FadeParams = {
    delay: 0,
    duration: 350,
    easing: EaseOut.Sine,
    endOpacity: 1,
    startOpacity: 0
};
```

fadeOut swaps `startOpacity` and `endOpacity`.

## Sample Usage
Presets are callable. Bare, they use their defaults. Passed params override them; omitted ones keep the default.

``` typescript
import { fadeIn, EaseOut } from "igniteui-angular/animations";

fadeIn({
    delay: 600,
    duration: 250,
    easing: EaseOut.Quad,
    startOpacity: 0.2
});
```
