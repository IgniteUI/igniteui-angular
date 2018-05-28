import { animate, animation, style } from "@angular/animations";
import { EaseOut } from "../easings";
var base = [
    style({
        opacity: "{{startOpacity}}"
    }),
    animate("{{duration}} {{delay}} {{easing}}", style({
        opacity: "{{endOpacity}}"
    }))
];
var baseParams = {
    delay: "0s",
    duration: "350ms",
    easing: EaseOut.sine,
    endOpacity: 1,
    startOpacity: 0
};
var fadeIn = animation(base, {
    params: baseParams
});
var fadeOut = animation(base, {
    params: {
        delay: "0s",
        duration: "350ms",
        easing: EaseOut.sine,
        endOpacity: 0,
        startOpacity: 1
    }
});
export { fadeIn, fadeOut };
