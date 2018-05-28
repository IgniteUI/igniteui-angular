var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { animate, animation, keyframes, style } from "@angular/animations";
var heartbeatBase = [
    style({
        animationTimingFunction: "ease-out",
        transform: "scale(1)",
        transformOrigin: "center center"
    }),
    animate("{{duration}} {{delay}} {{easing}}", keyframes([
        style({
            animationTimingFunction: "ease-in",
            offset: 0.1,
            transform: "scale(0.91)"
        }),
        style({
            animationTimingFunction: "ease-out",
            offset: 0.17,
            transform: "scale(0.98)"
        }),
        style({
            animationTimingFunction: "ease-in",
            offset: 0.33,
            transform: "scale(0.87)"
        }),
        style({
            animationTimingFunction: "ease-out",
            offset: 0.45,
            transform: "scale(1)"
        })
    ]))
];
var heartbeatParams = {
    delay: "0s",
    duration: "1.5s",
    easing: "ease-in-out"
};
var pulsateBase = [
    animate("{{duration}} {{delay}} {{easing}}", keyframes([
        style({
            offset: 0,
            transform: "scale({{fromScale}})"
        }),
        style({
            offset: 0.5,
            transform: "scale({{toScale}})"
        }),
        style({
            offset: 1,
            transform: "scale({{fromScale}})"
        })
    ]))
];
var pulsateParams = {
    delay: "0s",
    duration: ".5s",
    easing: "ease-in-out",
    fromScale: 1,
    toScale: 1.1
};
var blinkBase = [
    animate("{{duration}} {{delay}} {{easing}}", keyframes([
        style({
            offset: 0,
            opacity: .8,
            transform: "scale({{fromScale}})"
        }),
        style({
            offset: 0.8,
            opacity: 0,
            transform: "scale({{midScale}})"
        }),
        style({
            offset: 1,
            opacity: 0,
            transform: "scale({{toScale}})"
        })
    ]))
];
var blinkParams = {
    delay: "0s",
    duration: ".8s",
    easing: "ease-in-out",
    fromScale: .2,
    midScale: 1.2,
    toScale: 2.2
};
var pulsateFwd = animation(pulsateBase, {
    params: __assign({}, pulsateParams)
});
var pulsateBck = animation(pulsateBase, {
    params: __assign({}, pulsateParams, { toScale: .9 })
});
var heartbeat = animation(heartbeatBase, {
    params: __assign({}, heartbeatParams)
});
var blink = animation(blinkBase, {
    params: __assign({}, blinkParams)
});
export { heartbeat, pulsateFwd, pulsateBck, blink };
