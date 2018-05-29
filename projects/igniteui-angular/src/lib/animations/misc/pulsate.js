"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var animations_1 = require("@angular/animations");
var heartbeatBase = [
    animations_1.style({
        animationTimingFunction: "ease-out",
        transform: "scale(1)",
        transformOrigin: "center center"
    }),
    animations_1.animate("{{duration}} {{delay}} {{easing}}", animations_1.keyframes([
        animations_1.style({
            animationTimingFunction: "ease-in",
            offset: 0.1,
            transform: "scale(0.91)"
        }),
        animations_1.style({
            animationTimingFunction: "ease-out",
            offset: 0.17,
            transform: "scale(0.98)"
        }),
        animations_1.style({
            animationTimingFunction: "ease-in",
            offset: 0.33,
            transform: "scale(0.87)"
        }),
        animations_1.style({
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
    animations_1.animate("{{duration}} {{delay}} {{easing}}", animations_1.keyframes([
        animations_1.style({
            offset: 0,
            transform: "scale({{fromScale}})"
        }),
        animations_1.style({
            offset: 0.5,
            transform: "scale({{toScale}})"
        }),
        animations_1.style({
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
    animations_1.animate("{{duration}} {{delay}} {{easing}}", animations_1.keyframes([
        animations_1.style({
            offset: 0,
            opacity: .8,
            transform: "scale({{fromScale}})"
        }),
        animations_1.style({
            offset: 0.8,
            opacity: 0,
            transform: "scale({{midScale}})"
        }),
        animations_1.style({
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
var pulsateFwd = animations_1.animation(pulsateBase, {
    params: __assign({}, pulsateParams)
});
exports.pulsateFwd = pulsateFwd;
var pulsateBck = animations_1.animation(pulsateBase, {
    params: __assign({}, pulsateParams, { toScale: .9 })
});
exports.pulsateBck = pulsateBck;
var heartbeat = animations_1.animation(heartbeatBase, {
    params: __assign({}, heartbeatParams)
});
exports.heartbeat = heartbeat;
var blink = animations_1.animation(blinkBase, {
    params: __assign({}, blinkParams)
});
exports.blink = blink;

//# sourceMappingURL=pulsate.js.map
