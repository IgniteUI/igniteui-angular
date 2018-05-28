var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { animate, animation, keyframes, style } from "@angular/animations";
import { EaseInOut } from "../easings";
var baseRecipe = [
    animate("{{duration}} {{delay}} {{easing}}", keyframes([
        style({
            offset: 0,
            transform: "rotate(0deg) translate{{direction}}(0)",
            transformOrigin: "{{xPos}} {{yPos}}"
        }),
        style({
            offset: 0.1,
            transform: "rotate({{endAngle}}deg) translate{{direction}}(-{{startDistance}})"
        }),
        style({
            offset: 0.2,
            transform: "rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})"
        }),
        style({
            offset: 0.3,
            transform: "rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})"
        }),
        style({
            offset: 0.4,
            transform: "rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})"
        }),
        style({
            offset: 0.5,
            transform: "rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})"
        }),
        style({
            offset: 0.6,
            transform: "rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})"
        }),
        style({
            offset: 0.7,
            transform: "rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})"
        }),
        style({
            offset: 0.8,
            transform: "rotate(-{{endAngle}}deg) translate{{direction}}({{endDistance}})"
        }),
        style({
            offset: 0.9,
            transform: "rotate({{endAngle}}deg) translate{{direction}}(-{{endDistance}})"
        }),
        style({
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
    easing: EaseInOut.quad,
    endAngle: 0,
    endDistance: "8px",
    startAngle: 0,
    startDistance: "10px",
    xPos: "center",
    yPos: "center"
};
var shakeHor = animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "X" })
});
var shakeVer = animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y" })
});
var shakeTop = animation(baseRecipe, {
    params: __assign({}, baseParams, { endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", yPos: "top" })
});
var shakeBottom = animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", yPos: "bottom" })
});
var shakeRight = animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "right", yPos: "center" })
});
var shakeLeft = animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "left", yPos: "center" })
});
var shakeCenter = animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 8, endDistance: "0", startAngle: 10, startDistance: "0", xPos: "center", yPos: "center" })
});
var shakeTr = animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "right", yPos: "top" })
});
var shakeBr = animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "right", yPos: "bottom" })
});
var shakeBl = animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "left", yPos: "bottom" })
});
var shakeTl = animation(baseRecipe, {
    params: __assign({}, baseParams, { direction: "Y", endAngle: 2, endDistance: "0", startAngle: 4, startDistance: "0", xPos: "left", yPos: "top" })
});
export { shakeHor, shakeVer, shakeTop, shakeBottom, shakeRight, shakeLeft, shakeCenter, shakeTr, shakeBr, shakeBl, shakeTl };
