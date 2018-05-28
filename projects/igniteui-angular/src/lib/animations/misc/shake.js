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
var baseRecipe = [
    animations_1.animate("{{duration}} {{delay}} {{easing}}", animations_1.keyframes([
        animations_1.style({
            offset: 0,
            transform: "rotate(0deg) translate{{direction}}(0)",
            transformOrigin: "{{xPos}} {{yPos}}"
        }),
        animations_1.style({
            offset: 0.1,
            transform: "rotate({{endAngle}}deg) translate{{direction}}(-{{startDistance}})"
        }),
        animations_1.style({
            offset: 0.2,
            transform: "rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})"
        }),
        animations_1.style({
            offset: 0.3,
            transform: "rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})"
        }),
        animations_1.style({
            offset: 0.4,
            transform: "rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})"
        }),
        animations_1.style({
            offset: 0.5,
            transform: "rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})"
        }),
        animations_1.style({
            offset: 0.6,
            transform: "rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})"
        }),
        animations_1.style({
            offset: 0.7,
            transform: "rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})"
        }),
        animations_1.style({
            offset: 0.8,
            transform: "rotate(-{{endAngle}}deg) translate{{direction}}({{endDistance}})"
        }),
        animations_1.style({
            offset: 0.9,
            transform: "rotate({{endAngle}}deg) translate{{direction}}(-{{endDistance}})"
        }),
        animations_1.style({
            offset: 1,
            transform: "rotate(0deg) translate{{direction}}(0)",
            transformOrigin: "{{xPos}} {{yPos}}"
        })
    ]))
];
var baseParams = {
    delay: "0s",
    direction: "X",
    duration: "800ms",
    easing: easings_1.EaseInOut.quad,
    endAngle: 0,
    endDistance: "8px",
    startAngle: 0,
    startDistance: "10px",
    xPos: "center",
    yPos: "center"
};
var shakeHor = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "X" })
});
exports.shakeHor = shakeHor;
var shakeVer = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y" })
});
exports.shakeVer = shakeVer;
var shakeTop = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", yPos: "top" })
});
exports.shakeTop = shakeTop;
var shakeBottom = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", yPos: "bottom" })
});
exports.shakeBottom = shakeBottom;
var shakeRight = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "right", yPos: "center" })
});
exports.shakeRight = shakeRight;
var shakeLeft = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "left", yPos: "center" })
});
exports.shakeLeft = shakeLeft;
var shakeCenter = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 8, endDistance: "0", startAngle: 10, startDistance: "0", xPos: "center", yPos: "center" })
});
exports.shakeCenter = shakeCenter;
var shakeTr = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "right", yPos: "top" })
});
exports.shakeTr = shakeTr;
var shakeBr = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "right", yPos: "bottom" })
});
exports.shakeBr = shakeBr;
var shakeBl = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "left", yPos: "bottom" })
});
exports.shakeBl = shakeBl;
var shakeTl = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "left", yPos: "top" })
});
exports.shakeTl = shakeTl;

//# sourceMappingURL=shake.js.map
