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
        opacity: "{{startOpacity}}",
        transform: "rotate3d({{rotateX}},{{rotateY}},{{rotateZ}},{{startAngle}}deg)",
        transformOrigin: "{{xPos}} {{yPos}}"
    }),
    animations_1.animate("{{duration}} {{delay}} {{easing}}", animations_1.style({
        offset: 0,
        opacity: "{{endOpacity}}",
        transform: "rotate3d({{rotateX}},{{rotateY}},{{rotateZ}},{{endAngle}}deg)",
        transformOrigin: "{{xPos}} {{yPos}}"
    }))
];
var baseInParams = {
    delay: "0s",
    duration: "600ms",
    easing: easings_1.EaseOut.quad,
    endAngle: 0,
    endOpacity: 1,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 1,
    startAngle: -360,
    startOpacity: 0,
    xPos: "center",
    yPos: "center"
};
var baseOutParams = __assign({}, baseInParams, { easing: easings_1.EaseIn.quad, endOpacity: 0, startOpacity: 1 });
var rotateInCenter = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams)
});
exports.rotateInCenter = rotateInCenter;
var rotateOutCenter = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams)
});
exports.rotateOutCenter = rotateOutCenter;
var rotateInTop = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "top" })
});
exports.rotateInTop = rotateInTop;
var rotateOutTop = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "top" })
});
exports.rotateOutTop = rotateOutTop;
var rotateInRight = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "right" })
});
exports.rotateInRight = rotateInRight;
var rotateOutRight = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "right" })
});
exports.rotateOutRight = rotateOutRight;
var rotateInBottom = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "bottom" })
});
exports.rotateInBottom = rotateInBottom;
var rotateOutBottom = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "bottom" })
});
exports.rotateOutBottom = rotateOutBottom;
var rotateInLeft = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "left" })
});
exports.rotateInLeft = rotateInLeft;
var rotateOutLeft = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "left" })
});
exports.rotateOutLeft = rotateOutLeft;
var rotateInTr = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "right", yPos: "top" })
});
exports.rotateInTr = rotateInTr;
var rotateOutTr = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "right", yPos: "top" })
});
exports.rotateOutTr = rotateOutTr;
var rotateInBr = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "right", yPos: "bottom" })
});
exports.rotateInBr = rotateInBr;
var rotateOutBr = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "right", yPos: "bottom" })
});
exports.rotateOutBr = rotateOutBr;
var rotateInBl = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "left", yPos: "bottom" })
});
exports.rotateInBl = rotateInBl;
var rotateOutBl = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "left", yPos: "bottom" })
});
exports.rotateOutBl = rotateOutBl;
var rotateInTl = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "left", yPos: "top" })
});
exports.rotateInTl = rotateInTl;
var rotateOutTl = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "left", yPos: "top" })
});
exports.rotateOutTl = rotateOutTl;
var rotateInDiagonal1 = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { rotateX: 1, rotateY: 1, rotateZ: 0 })
});
exports.rotateInDiagonal1 = rotateInDiagonal1;
var rotateOutDiagonal1 = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { rotateX: 1, rotateY: 1, rotateZ: 0 })
});
exports.rotateOutDiagonal1 = rotateOutDiagonal1;
var rotateInDiagonal2 = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { rotateX: -1, rotateY: 1, rotateZ: 0 })
});
exports.rotateInDiagonal2 = rotateInDiagonal2;
var rotateOutDiagonal2 = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { rotateX: -1, rotateY: 1, rotateZ: 0 })
});
exports.rotateOutDiagonal2 = rotateOutDiagonal2;
var rotateInHor = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { rotateX: 0, rotateY: 1, rotateZ: 0 })
});
exports.rotateInHor = rotateInHor;
var rotateOutHor = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { rotateX: 0, rotateY: 1, rotateZ: 0 })
});
exports.rotateOutHor = rotateOutHor;
var rotateInVer = animations_1.animation(baseRecipe, {
    params: __assign({}, baseInParams, { rotateX: 1, rotateY: 0, rotateZ: 0 })
});
exports.rotateInVer = rotateInVer;
var rotateOutVer = animations_1.animation(baseRecipe, {
    params: __assign({}, baseOutParams, { rotateX: 1, rotateY: 0, rotateZ: 0 })
});
exports.rotateOutVer = rotateOutVer;

//# sourceMappingURL=index.js.map
