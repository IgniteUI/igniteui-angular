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
        transform: "{{fromPosition}}"
    }),
    animations_1.animate("{{duration}} {{delay}} {{easing}}", animations_1.style({
        opacity: "{{endOpacity}}",
        transform: "{{toPosition}}"
    }))
];
var baseInParams = {
    delay: "0s",
    duration: "350ms",
    easing: easings_1.EaseOut.quad,
    endOpacity: 1,
    fromPosition: "translateY(-500px)",
    startOpacity: 0,
    toPosition: "translateY(0)"
};
var baseOutParams = __assign({}, baseInParams, { easing: easings_1.EaseIn.quad, endOpacity: 0, fromPosition: "translateY(0)", startOpacity: 1, toPosition: "translateY(-500px)" });
var slideInTop = animations_1.animation(base, { params: baseInParams });
exports.slideInTop = slideInTop;
var slideInLeft = animations_1.animation(base, {
    params: __assign({}, baseInParams, { fromPosition: "translateX(-500px)" })
});
exports.slideInLeft = slideInLeft;
var slideInRight = animations_1.animation(base, {
    params: __assign({}, baseInParams, { fromPosition: "translateX(500px)" })
});
exports.slideInRight = slideInRight;
var slideInBottom = animations_1.animation(base, {
    params: __assign({}, baseInParams, { fromPosition: "translateY(500px)" })
});
exports.slideInBottom = slideInBottom;
var slideInTr = animations_1.animation(base, {
    params: __assign({}, baseInParams, { fromPosition: "translateY(-500px) translateX(500px)", toPosition: "translateY(0) translateX(0)" })
});
exports.slideInTr = slideInTr;
var slideInTl = animations_1.animation(base, {
    params: __assign({}, baseInParams, { fromPosition: "translateY(-500px) translateX(-500px)", toPosition: "translateY(0) translateX(0)" })
});
exports.slideInTl = slideInTl;
var slideInBr = animations_1.animation(base, {
    params: __assign({}, baseInParams, { fromPosition: "translateY(500px) translateX(500px)", toPosition: "translateY(0) translateX(0)" })
});
exports.slideInBr = slideInBr;
var slideInBl = animations_1.animation(base, {
    params: __assign({}, baseInParams, { fromPosition: "translateY(500px) translateX(-500px)", toPosition: "translateY(0) translateX(0)" })
});
exports.slideInBl = slideInBl;
var slideOutTop = animations_1.animation(base, { params: baseOutParams });
exports.slideOutTop = slideOutTop;
var slideOutRight = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { toPosition: "translateX(500px)" })
});
exports.slideOutRight = slideOutRight;
var slideOutBottom = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { toPosition: "translateY(500px)" })
});
exports.slideOutBottom = slideOutBottom;
var slideOutLeft = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { toPosition: "translateX(-500px)" })
});
exports.slideOutLeft = slideOutLeft;
var slideOutTr = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { fromPosition: "translateY(0) translateX(0)", toPosition: "translateY(-500px) translateX(500px)" })
});
exports.slideOutTr = slideOutTr;
var slideOutBr = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { fromPosition: "translateY(0) translateX(0)", toPosition: "translateY(500px) translateX(500px)" })
});
exports.slideOutBr = slideOutBr;
var slideOutBl = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { fromPosition: "translateY(0) translateX(0)", toPosition: "translateY(500px) translateX(-500px)" })
});
exports.slideOutBl = slideOutBl;
var slideOutTl = animations_1.animation(base, {
    params: __assign({}, baseOutParams, { fromPosition: "translateY(0) translateX(0)", toPosition: "translateY(-500px) translateX(-500px)" })
});
exports.slideOutTl = slideOutTl;

//# sourceMappingURL=index.js.map
