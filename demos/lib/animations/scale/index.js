var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import { animate, animation, style } from "@angular/animations";
import { EaseOut } from "../easings";
var base = [
    style({
        opacity: "{{startOpacity}}",
        transform: "scale{{direction}}({{fromScale}})",
        transformOrigin: "{{xPos}} {{yPos}}"
    }),
    animate("{{duration}} {{delay}} {{easing}}", style({
        opacity: "{{endOpacity}}",
        transform: "scale{{direction}}({{toScale}})",
        transformOrigin: "{{xPos}} {{yPos}}"
    }))
];
var baseInParams = {
    delay: "0s",
    direction: "",
    duration: "350ms",
    easing: EaseOut.quad,
    endOpacity: 1,
    fromScale: .5,
    startOpacity: 0,
    toScale: 1,
    xPos: "50%",
    yPos: "50%"
};
var baseOutParams = __assign({}, baseInParams, { easing: EaseOut.sine, endOpacity: 0, fromScale: 1, startOpacity: 1, toScale: .5 });
var scaleInCenter = animation(base, { params: baseInParams });
var scaleInBl = animation(base, {
    params: __assign({}, baseInParams, { xPos: "0", yPos: "100%" })
});
var scaleInVerCenter = animation(base, {
    params: __assign({}, baseInParams, { direction: "Y", fromScale: .4 })
});
var scaleInTop = animation(base, {
    params: __assign({}, baseInParams, { xPos: "50%", yPos: "0" })
});
var scaleInLeft = animation(base, {
    params: __assign({}, baseInParams, { xPos: "0", yPos: "50%" })
});
var scaleInVerTop = animation(base, {
    params: __assign({}, baseInParams, { direction: "Y", fromScale: .4, xPos: "100%", yPos: "0" })
});
var scaleInTr = animation(base, {
    params: __assign({}, baseInParams, { xPos: "100%", yPos: "0" })
});
var scaleInTl = animation(base, {
    params: __assign({}, baseInParams, { xPos: "0", yPos: "0" })
});
var scaleInVerBottom = animation(base, {
    params: __assign({}, baseInParams, { direction: "Y", fromScale: .4, xPos: "0", yPos: "100%" })
});
var scaleInRight = animation(base, {
    params: __assign({}, baseInParams, { xPos: "100%", yPos: "50%" })
});
var scaleInHorCenter = animation(base, {
    params: __assign({}, baseInParams, { direction: "X", fromScale: .4 })
});
var scaleInBr = animation(base, {
    params: __assign({}, baseInParams, { xPos: "100%", yPos: "100%" })
});
var scaleInHorLeft = animation(base, {
    params: __assign({}, baseInParams, { direction: "X", fromScale: .4, xPos: "0", yPos: "0" })
});
var scaleInBottom = animation(base, {
    params: __assign({}, baseInParams, { xPos: "50%", yPos: "100%" })
});
var scaleInHorRight = animation(base, {
    params: __assign({}, baseInParams, { direction: "X", fromScale: .4, xPos: "100%", yPos: "100%" })
});
var scaleOutCenter = animation(base, { params: baseOutParams });
var scaleOutBl = animation(base, {
    params: __assign({}, baseOutParams, { xPos: "0", yPos: "100%" })
});
var scaleOutBr = animation(base, {
    params: __assign({}, baseOutParams, { xPos: "100%", yPos: "100%" })
});
var scaleOutVerCenter = animation(base, {
    params: __assign({}, baseOutParams, { direction: "Y", toScale: .3 })
});
var scaleOutVerTop = animation(base, {
    params: __assign({}, baseOutParams, { direction: "Y", toScale: .3, xPos: "100%", yPos: "0" })
});
var scaleOutVerBottom = animation(base, {
    params: __assign({}, baseOutParams, { direction: "Y", toScale: .3, xPos: "0", yPos: "100%" })
});
var scaleOutTop = animation(base, {
    params: __assign({}, baseOutParams, { xPos: "50%", yPos: "0" })
});
var scaleOutLeft = animation(base, {
    params: __assign({}, baseOutParams, { xPos: "0", yPos: "50%" })
});
var scaleOutTr = animation(base, {
    params: __assign({}, baseOutParams, { xPos: "100%", yPos: "0" })
});
var scaleOutTl = animation(base, {
    params: __assign({}, baseOutParams, { xPos: "0", yPos: "0" })
});
var scaleOutRight = animation(base, {
    params: __assign({}, baseOutParams, { xPos: "100%", yPos: "50%" })
});
var scaleOutBottom = animation(base, {
    params: __assign({}, baseOutParams, { xPos: "50%", yPos: "100%" })
});
var scaleOutHorCenter = animation(base, {
    params: __assign({}, baseOutParams, { direction: "X", toScale: .3 })
});
var scaleOutHorLeft = animation(base, {
    params: __assign({}, baseOutParams, { direction: "X", toScale: .3, xPos: "0", yPos: "0" })
});
var scaleOutHorRight = animation(base, {
    params: __assign({}, baseOutParams, { direction: "X", toScale: .3, xPos: "100%", yPos: "100%" })
});
export { scaleInTop, scaleInRight, scaleInBottom, scaleInLeft, scaleInCenter, scaleInTr, scaleInBr, scaleInBl, scaleInTl, scaleInVerTop, scaleInVerBottom, scaleInVerCenter, scaleInHorCenter, scaleInHorLeft, scaleInHorRight, scaleOutTop, scaleOutRight, scaleOutBottom, scaleOutLeft, scaleOutCenter, scaleOutTr, scaleOutBr, scaleOutBl, scaleOutTl, scaleOutVerTop, scaleOutVerBottom, scaleOutVerCenter, scaleOutHorCenter, scaleOutHorLeft, scaleOutHorRight };
