var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { animate, animation, keyframes, style } from "@angular/animations";
import { EaseOut } from "../easings";
var baseRecipe = [
    style({
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d"
    }),
    animate("{{duration}} {{delay}} {{easing}}", keyframes([
        style({
            offset: 0,
            transform: "translateZ({{startDistance}})\n                rotate3d({{rotateX}}, {{rotateY}}, {{rotateZ}}, {{startAngle}}deg)"
        }),
        style({
            offset: 1,
            transform: "translateZ({{endDistance}})\n                rotate3d({{rotateX}}, {{rotateY}}, {{rotateZ}}, {{endAngle}}deg)"
        })
    ]))
];
var baseParams = {
    delay: "0s",
    duration: "600ms",
    easing: EaseOut.quad,
    endAngle: 180,
    endDistance: "0px",
    rotateX: 1,
    rotateY: 0,
    rotateZ: 0,
    startAngle: 0,
    startDistance: "0px"
};
var flipTop = animation(baseRecipe, {
    params: __assign({}, baseParams)
});
var flipBottom = animation(baseRecipe, {
    params: __assign({}, baseParams, { endAngle: -180 })
});
var flipLeft = animation(baseRecipe, {
    params: __assign({}, baseParams, { rotateX: 0, rotateY: 1 })
});
var flipRight = animation(baseRecipe, {
    params: __assign({}, baseParams, { endAngle: -180, rotateX: 0, rotateY: 1 })
});
var flipHorFwd = animation(baseRecipe, {
    params: __assign({}, baseParams, { endDistance: "170px" })
});
var flipHorBck = animation(baseRecipe, {
    params: __assign({}, baseParams, { endDistance: "-170px" })
});
var flipVerFwd = animation(baseRecipe, {
    params: __assign({}, baseParams, { endDistance: "170px", rotateX: 0, rotateY: 1 })
});
var flipVerBck = animation(baseRecipe, {
    params: __assign({}, baseParams, { endDistance: "-170px", rotateX: 0, rotateY: 1 })
});
export { flipTop, flipRight, flipBottom, flipLeft, flipHorFwd, flipHorBck, flipVerFwd, flipVerBck };
