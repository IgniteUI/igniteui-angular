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
        opacity: "{{startOpacity}}"
    }),
    animations_1.animate("{{duration}} {{delay}} {{easing}}", animations_1.style({
        opacity: "{{endOpacity}}"
    }))
];
var baseParams = {
    delay: "0s",
    duration: "350ms",
    easing: easings_1.EaseOut.sine,
    endOpacity: 1,
    startOpacity: 0
};
var fadeIn = animations_1.animation(base, {
    params: __assign({}, baseParams)
});
exports.fadeIn = fadeIn;
var fadeOut = animations_1.animation(base, {
    params: __assign({}, baseParams, { endOpacity: 0, startOpacity: 1 })
});
exports.fadeOut = fadeOut;

//# sourceMappingURL=index.js.map
