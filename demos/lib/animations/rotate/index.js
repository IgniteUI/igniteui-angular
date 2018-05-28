var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { animate, animation, style } from "@angular/animations";
import { EaseIn, EaseOut } from "../easings";
var baseRecipe = [
    style({
        opacity: "{{startOpacity}}",
        transform: "rotate3d({{rotateX}},{{rotateY}},{{rotateZ}},{{startAngle}}deg)",
        transformOrigin: "{{xPos}} {{yPos}}"
    }),
    animate("{{duration}} {{delay}} {{easing}}", style({
        offset: 0,
        opacity: "{{endOpacity}}",
        transform: "rotate3d({{rotateX}},{{rotateY}},{{rotateZ}},{{endAngle}}deg)",
        transformOrigin: "{{xPos}} {{yPos}}"
    }))
];
var baseInParams = {
    delay: "0s",
    duration: "600ms",
    easing: EaseOut.quad,
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
var baseOutParams = __assign({}, baseInParams, { easing: EaseIn.quad, endOpacity: 0, startOpacity: 1 });
var rotateInCenter = animation(baseRecipe, {
    params: __assign({}, baseInParams)
});
var rotateOutCenter = animation(baseRecipe, {
    params: __assign({}, baseOutParams)
});
var rotateInTop = animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "top" })
});
var rotateOutTop = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "top" })
});
var rotateInRight = animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "right" })
});
var rotateOutRight = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "right" })
});
var rotateInBottom = animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "bottom" })
});
var rotateOutBottom = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "bottom" })
});
var rotateInLeft = animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "left" })
});
var rotateOutLeft = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "left" })
});
var rotateInTr = animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "right", yPos: "top" })
});
var rotateOutTr = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "right", yPos: "top" })
});
var rotateInBr = animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "right", yPos: "bottom" })
});
var rotateOutBr = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "right", yPos: "bottom" })
});
var rotateInBl = animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "left", yPos: "bottom" })
});
var rotateOutBl = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "left", yPos: "bottom" })
});
var rotateInTl = animation(baseRecipe, {
    params: __assign({}, baseInParams, { xPos: "left", yPos: "top" })
});
var rotateOutTl = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { xPos: "left", yPos: "top" })
});
var rotateInDiagonal1 = animation(baseRecipe, {
    params: __assign({}, baseInParams, { rotateX: 1, rotateY: 1, rotateZ: 0 })
});
var rotateOutDiagonal1 = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { rotateX: 1, rotateY: 1, rotateZ: 0 })
});
var rotateInDiagonal2 = animation(baseRecipe, {
    params: __assign({}, baseInParams, { rotateX: -1, rotateY: 1, rotateZ: 0 })
});
var rotateOutDiagonal2 = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { rotateX: -1, rotateY: 1, rotateZ: 0 })
});
var rotateInHor = animation(baseRecipe, {
    params: __assign({}, baseInParams, { rotateX: 0, rotateY: 1, rotateZ: 0 })
});
var rotateOutHor = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { rotateX: 0, rotateY: 1, rotateZ: 0 })
});
var rotateInVer = animation(baseRecipe, {
    params: __assign({}, baseInParams, { rotateX: 1, rotateY: 0, rotateZ: 0 })
});
var rotateOutVer = animation(baseRecipe, {
    params: __assign({}, baseOutParams, { rotateX: 1, rotateY: 0, rotateZ: 0 })
});
export { rotateInCenter, rotateInTop, rotateInRight, rotateInLeft, rotateInBottom, rotateInTr, rotateInBr, rotateInBl, rotateInTl, rotateInDiagonal1, rotateInDiagonal2, rotateInHor, rotateInVer, rotateOutCenter, rotateOutTop, rotateOutRight, rotateOutLeft, rotateOutBottom, rotateOutTr, rotateOutBr, rotateOutBl, rotateOutTl, rotateOutDiagonal1, rotateOutDiagonal2, rotateOutHor, rotateOutVer };
