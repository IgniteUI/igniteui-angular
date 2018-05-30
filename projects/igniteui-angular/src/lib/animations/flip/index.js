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
    animations_1.style({
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d"
    }),
    animations_1.animate("{{duration}} {{delay}} {{easing}}", animations_1.keyframes([
        animations_1.style({
            offset: 0,
            transform: "translateZ({{startDistance}})\n                rotate3d({{rotateX}}, {{rotateY}}, {{rotateZ}}, {{startAngle}}deg)"
        }),
        animations_1.style({
            offset: 1,
            transform: "translateZ({{endDistance}})\n                rotate3d({{rotateX}}, {{rotateY}}, {{rotateZ}}, {{endAngle}}deg)"
        })
    ]))
];
var baseParams = {
    delay: "0s",
    duration: "600ms",
    easing: easings_1.EaseOut.quad,
    endAngle: 180,
    endDistance: "0px",
    rotateX: 1,
    rotateY: 0,
    rotateZ: 0,
    startAngle: 0,
    startDistance: "0px"
};
var flipTop = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams)
});
exports.flipTop = flipTop;
var flipBottom = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { endAngle: -180 })
});
exports.flipBottom = flipBottom;
var flipLeft = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { rotateX: 0, rotateY: 1 })
});
exports.flipLeft = flipLeft;
var flipRight = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { endAngle: -180, rotateX: 0, rotateY: 1 })
});
exports.flipRight = flipRight;
var flipHorFwd = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { endDistance: "170px" })
});
exports.flipHorFwd = flipHorFwd;
var flipHorBck = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { endDistance: "-170px" })
});
exports.flipHorBck = flipHorBck;
var flipVerFwd = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { endDistance: "170px", rotateX: 0, rotateY: 1 })
});
exports.flipVerFwd = flipVerFwd;
var flipVerBck = animations_1.animation(baseRecipe, {
    params: __assign({}, baseParams, { endDistance: "-170px", rotateX: 0, rotateY: 1 })
});
exports.flipVerBck = flipVerBck;

//# sourceMappingURL=index.js.map
