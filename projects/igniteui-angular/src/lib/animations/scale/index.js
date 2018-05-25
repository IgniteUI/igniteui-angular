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
var base = [
    animations_1.style({
        opacity: "{{startOpacity}}",
        transform: "scale{{direction}}({{fromScale}})",
        transformOrigin: "{{xPos}} {{yPos}}"
    }),
    animations_1.animate("{{duration}} {{delay}} {{easing}}", animations_1.style({
        opacity: "{{endOpacity}}",
        transform: "scale{{direction}}({{toScale}})",
        transformOrigin: "{{xPos}} {{yPos}}"
    }))
];
var baseInParams = {
    delay: "0s",
    direction: "",
    duration: "350ms",
    easing: easings_1.EaseOut.quad,
    endOpacity: 1,
    fromScale: .5,
    startOpacity: 0,
    toScale: 1,
    xPos: "50%",
    yPos: "50%"
};
var baseOutParams = __assign({}, baseInParams, { easing: easings_1.EaseOut.sine, endOpacity: 0, fromScale: 1, startOpacity: 1, toScale: .5 });
var scaleInCenter = animations_1.animation(base, { params: baseInParams });
exports.scaleInCenter = scaleInCenter;
var scaleInBl = animations_1.animation(base, {
    params: __assign({}, baseInParams, { xPos: "0", yPos: "100%" })
});
exports.scaleInBl = scaleInBl;
var scaleInVerCenter = animations_1.animation(base, {
    params: __assign({}, baseInParams, { direction: "Y", fromScale: .4 })
});
exports.scaleInVerCenter = scaleInVerCenter;
var scaleInTop = animations_1.animation(base, {
    params: __assign({}, baseInParams, { xPos: "50%", yPos: "0" })
});
exports.scaleInTop = scaleInTop;
var scaleInLeft = animations_1.animation(base, {
    params: __assign({}, baseInParams, { xPos: "0", yPos: "50%" })
});
exports.scaleInLeft = scaleInLeft;
var scaleInVerTop = animations_1.animation(base, {
    params: __assign({}, baseInParams, { direction: "Y", fromScale: .4, xPos: "100%", yPos: "0" })
});
exports.scaleInVerTop = scaleInVerTop;
var scaleInTr = animations_1.animation(base, {
    params: __assign({}, baseInParams, { xPos: "100%", yPos: "0" })
});
exports.scaleInTr = scaleInTr;
var scaleInTl = animations_1.animation(base, {
    params: __assign({}, baseInParams, { xPos: "0", yPos: "0" })
});
exports.scaleInTl = scaleInTl;
var scaleInVerBottom = animations_1.animation(base, {
    params: __assign({}, baseInParams, { direction: "Y", fromScale: .4, xPos: "0", yPos: "100%" })
});
exports.scaleInVerBottom = scaleInVerBottom;
var scaleInRight = animations_1.animation(base, {
    params: __assign({}, baseInParams, { xPos: "100%", yPos: "50%" })
});
exports.scaleInRight = scaleInRight;
var scaleInHorCenter = animations_1.animation(base, {
    params: __assign({}, baseInParams, { direction: "X", fromScale: .4 })
});
exports.scaleInHorCenter = scaleInHorCenter;
var scaleInBr = animations_1.animation(base, {
    params: __assign({}, baseInParams, { xPos: "100%", yPos: "100%" })
});
exports.scaleInBr = scaleInBr;
var scaleInHorLeft = animations_1.animation(base, {
    params: __assign({}, baseInParams, { direction: "X", fromScale: .4, xPos: "0", yPos: "0" })
});
exports.scaleInHorLeft = scaleInHorLeft;
var scaleInBottom = animations_1.animation(base, {
    params: __assign({}, baseInParams, { xPos: "50%", yPos: "100%" })
});
exports.scaleInBottom = scaleInBottom;
var scaleInHorRight = animations_1.animation(base, {
    params: __assign({}, baseInParams, { direction: "X", fromScale: .4, xPos: "100%", yPos: "100%" })
});
exports.scaleInHorRight = scaleInHorRight;
var scaleOutCenter = animations_1.animation(base, { params: baseOutParams });
exports.scaleOutCenter = scaleOutCenter;
var scaleOutBl = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { xPos: "0", yPos: "100%" })
});
exports.scaleOutBl = scaleOutBl;
var scaleOutBr = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { xPos: "100%", yPos: "100%" })
});
exports.scaleOutBr = scaleOutBr;
var scaleOutVerCenter = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { direction: "Y", toScale: .3 })
});
exports.scaleOutVerCenter = scaleOutVerCenter;
var scaleOutVerTop = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { direction: "Y", toScale: .3, xPos: "100%", yPos: "0" })
});
exports.scaleOutVerTop = scaleOutVerTop;
var scaleOutVerBottom = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { direction: "Y", toScale: .3, xPos: "0", yPos: "100%" })
});
exports.scaleOutVerBottom = scaleOutVerBottom;
var scaleOutTop = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { xPos: "50%", yPos: "0" })
});
exports.scaleOutTop = scaleOutTop;
var scaleOutLeft = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { xPos: "0", yPos: "50%" })
});
exports.scaleOutLeft = scaleOutLeft;
var scaleOutTr = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { xPos: "100%", yPos: "0" })
});
exports.scaleOutTr = scaleOutTr;
var scaleOutTl = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { xPos: "0", yPos: "0" })
});
exports.scaleOutTl = scaleOutTl;
var scaleOutRight = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { xPos: "100%", yPos: "50%" })
});
exports.scaleOutRight = scaleOutRight;
var scaleOutBottom = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { xPos: "50%", yPos: "100%" })
});
exports.scaleOutBottom = scaleOutBottom;
var scaleOutHorCenter = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { direction: "X", toScale: .3 })
});
exports.scaleOutHorCenter = scaleOutHorCenter;
var scaleOutHorLeft = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { direction: "X", toScale: .3, xPos: "0", yPos: "0" })
});
exports.scaleOutHorLeft = scaleOutHorLeft;
var scaleOutHorRight = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { direction: "X", toScale: .3, xPos: "100%", yPos: "100%" })
});
exports.scaleOutHorRight = scaleOutHorRight;

//# sourceMappingURL=index.js.map
