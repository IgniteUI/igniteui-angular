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
var swingBase = [
    style({
        opacity: "{{startOpacity}}",
        transform: "rotate{{direction}}({{startAngle}}deg)",
        transformOrigin: "{{xPos}} {{yPos}}"
    }),
    animate("{{duration}} {{delay}} {{easing}}", style({
        opacity: "{{endOpacity}}",
        transform: "rotate{{direction}}({{endAngle}}deg)",
        transformOrigin: "{{xPos}} {{yPos}}"
    }))
];
var swingParams = {
    delay: "0s",
    direction: "X",
    duration: ".5s",
    easing: EaseOut.back,
    endAngle: 0,
    endOpacity: 1,
    startAngle: -100,
    startOpacity: 0,
    xPos: "top",
    yPos: "center"
};
var swingOutParams = __assign({}, swingParams, { duration: ".55s", easing: EaseIn.back, endAngle: 70, endOpacity: 0, startAngle: 0, startOpacity: 1 });
var swingInTopFwd = animation(swingBase, {
    params: __assign({}, swingParams)
});
var swingInRightFwd = animation(swingBase, {
    params: __assign({}, swingParams, { direction: "Y", xPos: "center", yPos: "right" })
});
var swingInBottomFwd = animation(swingBase, {
    params: __assign({}, swingParams, { startAngle: 100, xPos: "bottom" })
});
var swingInLeftFwd = animation(swingBase, {
    params: __assign({}, swingParams, { direction: "Y", startAngle: 100, xPos: "center", yPos: "left" })
});
var swingInTopBck = animation(swingBase, {
    params: __assign({}, swingParams, { duration: ".6s", startAngle: 70 })
});
var swingInRightBck = animation(swingBase, {
    params: __assign({}, swingParams, { direction: "Y", duration: ".6s", startAngle: 70, xPos: "center", yPos: "right" })
});
var swingInBottomBck = animation(swingBase, {
    params: __assign({}, swingParams, { duration: ".6s", startAngle: -70, xPos: "bottom" })
});
var swingInLeftBck = animation(swingBase, {
    params: __assign({}, swingParams, { direction: "Y", duration: ".6s", startAngle: -70, xPos: "center", yPos: "left" })
});
var swingOutTopFwd = animation(swingBase, {
    params: __assign({}, swingOutParams)
});
var swingOutRightFwd = animation(swingBase, {
    params: __assign({}, swingOutParams, { direction: "Y", xPos: "center", yPos: "right" })
});
var swingOutBottomFwd = animation(swingBase, {
    params: __assign({}, swingOutParams, { endAngle: -70, xPos: "bottom" })
});
var swingOutLefttFwd = animation(swingBase, {
    params: __assign({}, swingOutParams, { direction: "Y", endAngle: -70, xPos: "center", yPos: "left" })
});
var swingOutTopBck = animation(swingBase, {
    params: __assign({}, swingOutParams, { duration: ".45s", endAngle: -100 })
});
var swingOutRightBck = animation(swingBase, {
    params: __assign({}, swingOutParams, { direction: "Y", duration: ".45s", endAngle: -100, xPos: "center", yPos: "right" })
});
var swingOutBottomBck = animation(swingBase, {
    params: __assign({}, swingOutParams, { duration: ".45s", endAngle: 100, xPos: "bottom" })
});
var swingOutLeftBck = animation(swingBase, {
    params: __assign({}, swingOutParams, { direction: "Y", duration: ".45s", endAngle: 100, xPos: "center", yPos: "left" })
});
export { swingInTopFwd, swingInRightFwd, swingInLeftFwd, swingInBottomFwd, swingInTopBck, swingInRightBck, swingInBottomBck, swingInLeftBck, swingOutTopFwd, swingOutRightFwd, swingOutBottomFwd, swingOutLefttFwd, swingOutTopBck, swingOutRightBck, swingOutBottomBck, swingOutLeftBck };
