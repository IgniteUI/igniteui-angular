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
var easings_1 = require("../easings");
var swingBase = [
    animations_1.style({
        opacity: "{{startOpacity}}",
        transform: "rotate{{direction}}({{startAngle}}deg)",
        transformOrigin: "{{xPos}} {{yPos}}"
    }),
    animations_1.animate("{{duration}} {{delay}} {{easing}}", animations_1.style({
        opacity: "{{endOpacity}}",
        transform: "rotate{{direction}}({{endAngle}}deg)",
        transformOrigin: "{{xPos}} {{yPos}}"
    }))
];
var swingParams = {
    delay: "0s",
    direction: "X",
    duration: ".5s",
    easing: easings_1.EaseOut.back,
    endAngle: 0,
    endOpacity: 1,
    startAngle: -100,
    startOpacity: 0,
    xPos: "top",
    yPos: "center"
};
var swingOutParams = __assign({}, swingParams, { duration: ".55s", easing: easings_1.EaseIn.back, endAngle: 70, endOpacity: 0, startAngle: 0, startOpacity: 1 });
var swingInTopFwd = animations_1.animation(swingBase, {
    params: __assign({}, swingParams)
});
exports.swingInTopFwd = swingInTopFwd;
var swingInRightFwd = animations_1.animation(swingBase, {
    params: __assign({}, swingParams, { direction: "Y", xPos: "center", yPos: "right" })
});
exports.swingInRightFwd = swingInRightFwd;
var swingInBottomFwd = animations_1.animation(swingBase, {
    params: __assign({}, swingParams, { startAngle: 100, xPos: "bottom" })
});
exports.swingInBottomFwd = swingInBottomFwd;
var swingInLeftFwd = animations_1.animation(swingBase, {
    params: __assign({}, swingParams, { direction: "Y", startAngle: 100, xPos: "center", yPos: "left" })
});
exports.swingInLeftFwd = swingInLeftFwd;
var swingInTopBck = animations_1.animation(swingBase, {
    params: __assign({}, swingParams, { duration: ".6s", startAngle: 70 })
});
exports.swingInTopBck = swingInTopBck;
var swingInRightBck = animations_1.animation(swingBase, {
    params: __assign({}, swingParams, { direction: "Y", duration: ".6s", startAngle: 70, xPos: "center", yPos: "right" })
});
exports.swingInRightBck = swingInRightBck;
var swingInBottomBck = animations_1.animation(swingBase, {
    params: __assign({}, swingParams, { duration: ".6s", startAngle: -70, xPos: "bottom" })
});
exports.swingInBottomBck = swingInBottomBck;
var swingInLeftBck = animations_1.animation(swingBase, {
    params: __assign({}, swingParams, { direction: "Y", duration: ".6s", startAngle: -70, xPos: "center", yPos: "left" })
});
exports.swingInLeftBck = swingInLeftBck;
var swingOutTopFwd = animations_1.animation(swingBase, {
    params: __assign({}, swingOutParams)
});
exports.swingOutTopFwd = swingOutTopFwd;
var swingOutRightFwd = animations_1.animation(swingBase, {
    params: __assign({}, swingOutParams, { direction: "Y", xPos: "center", yPos: "right" })
});
exports.swingOutRightFwd = swingOutRightFwd;
var swingOutBottomFwd = animations_1.animation(swingBase, {
    params: __assign({}, swingOutParams, { endAngle: -70, xPos: "bottom" })
});
exports.swingOutBottomFwd = swingOutBottomFwd;
var swingOutLefttFwd = animations_1.animation(swingBase, {
    params: __assign({}, swingOutParams, { direction: "Y", endAngle: -70, xPos: "center", yPos: "left" })
});
exports.swingOutLefttFwd = swingOutLefttFwd;
var swingOutTopBck = animations_1.animation(swingBase, {
    params: __assign({}, swingOutParams, { duration: ".45s", endAngle: -100 })
});
exports.swingOutTopBck = swingOutTopBck;
var swingOutRightBck = animations_1.animation(swingBase, {
    params: __assign({}, swingOutParams, { direction: "Y", duration: ".45s", endAngle: -100, xPos: "center", yPos: "right" })
});
exports.swingOutRightBck = swingOutRightBck;
var swingOutBottomBck = animations_1.animation(swingBase, {
    params: __assign({}, swingOutParams, { duration: ".45s", endAngle: 100, xPos: "bottom" })
});
exports.swingOutBottomBck = swingOutBottomBck;
var swingOutLeftBck = animations_1.animation(swingBase, {
    params: __assign({}, swingOutParams, { direction: "Y", duration: ".45s", endAngle: 100, xPos: "center", yPos: "left" })
});
exports.swingOutLeftBck = swingOutLeftBck;

//# sourceMappingURL=index.js.map
