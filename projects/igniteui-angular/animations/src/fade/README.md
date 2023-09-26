# Fade

Includes:
    
  - fadeIn
  - fadeOut

Default Params:

``` typescript
const params: IAnimationParams = {
    delay: "0s",
    duration: "350ms",
    easing: EaseOut.sine,
    endOpacity: 1,
    startOpacity: 0
};
```

## Sample Usage
If parameters are attached, they act as default values.  When an animation is invoked via [`useAnimation`](https://angular.io/api/animations/useAnimation) then parameter values are allowed to be passed in directly. If any of the passed in parameter values are missing then the default values will be used.

``` typescript
import { fadeIn } from "igniteui-angular/animations";
import { EaseOut } from "ignieui-angular/animations/easings";

useAnimation(fadeIn, {
    params: {
        delay: "0.6s",
        duration: "0.25s",
        easing: EaseOut.quad,
        endOpacity: 1,
        startOpacity: 0
    }
});
```
