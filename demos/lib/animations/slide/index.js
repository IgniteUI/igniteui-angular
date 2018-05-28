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
var base = [
    style({
        opacity: "{{startOpacity}}",
        transform: "{{fromPosition}}"
    }),
    animate("{{duration}} {{delay}} {{easing}}", style({
        opacity: "{{endOpacity}}",
        transform: "{{toPosition}}"
    }))
];
var baseInParams = {
    delay: "0s",
    duration: "350ms",
    easing: EaseOut.quad,
    endOpacity: 1,
    fromPosition: "translateY(-500px)",
    startOpacity: 0,
    toPosition: "translateY(0)"
};
var baseOutParams = {
    delay: "0s",
    duration: "350ms",
    easing: EaseIn.quad,
    endOpacity: 0,
    fromPosition: "translateY(0)",
    startOpacity: 1,
    toPosition: "translateY(-500px)"
};
var slideInTop = animation(base, { params: baseInParams });
var slideInLeft = animation(base, {
    params: {
        delay: "0s",
        duration: "350ms",
        easing: EaseOut.quad,
        endOpacity: 1,
        fromPosition: "translateX(-500px)",
        startOpacity: 0,
        toPosition: "translateY(0)"
    }
});
var slideInRight = animation(base, {
    params: {
        delay: "0s",
        duration: "350ms",
        easing: EaseOut.quad,
        endOpacity: 1,
        fromPosition: "translateX(500px)",
        startOpacity: 0,
        toPosition: "translateY(0)"
    }
});
var slideInBottom = animation(base, {
    params: {
        delay: "0s",
        duration: "350ms",
        easing: EaseOut.quad,
        endOpacity: 1,
        fromPosition: "translateY(500px)",
        startOpacity: 0,
        toPosition: "translateY(0)"
    }
});
var slideInTr = animation(base, {
    params: __assign({}, baseInParams, { fromPosition: "translateY(-500px) translateX(500px)", toPosition: "translateY(0) translateX(0)" })
});
var slideInTl = animation(base, {
    params: __assign({}, baseInParams, { fromPosition: "translateY(-500px) translateX(-500px)", toPosition: "translateY(0) translateX(0)" })
});
var slideInBr = animation(base, {
    params: __assign({}, baseInParams, { fromPosition: "translateY(500px) translateX(500px)", toPosition: "translateY(0) translateX(0)" })
});
var slideInBl = animation(base, {
    params: __assign({}, baseInParams, { fromPosition: "translateY(500px) translateX(-500px)", toPosition: "translateY(0) translateX(0)" })
});
var slideOutTop = animation(base, { params: baseOutParams });
var slideOutRight = animation(base, {
    params: __assign({}, baseOutParams, { toPosition: "translateX(500px)" })
});
var slideOutBottom = animation(base, {
    params: {
        delay: "0s",
        duration: "350ms",
        easing: EaseIn.quad,
        endOpacity: 0,
        fromPosition: "translateY(0)",
        startOpacity: 1,
        toPosition: "translateY(500px)"
    }
});
var slideOutLeft = animation(base, {
    params: __assign({}, baseOutParams, { toPosition: "translateX(-500px)" })
});
var slideOutTr = animation(base, {
    params: __assign({}, baseOutParams, { fromPosition: "translateY(0) translateX(0)", toPosition: "translateY(-500px) translateX(500px)" })
});
var slideOutBr = animation(base, {
    params: __assign({}, baseOutParams, { fromPosition: "translateY(0) translateX(0)", toPosition: "translateY(500px) translateX(500px)" })
});
var slideOutBl = animation(base, {
    params: __assign({}, baseOutParams, { fromPosition: "translateY(0) translateX(0)", toPosition: "translateY(500px) translateX(-500px)" })
});
var slideOutTl = animation(base, {
    params: __assign({}, baseOutParams, { fromPosition: "translateY(0) translateX(0)", toPosition: "translateY(-500px) translateX(-500px)" })
});
export { slideInTop, slideInRight, slideInBottom, slideInLeft, slideInTr, slideInBr, slideInBl, slideInTl, slideOutTop, slideOutBottom, slideOutRight, slideOutLeft, slideOutTr, slideOutBr, slideOutBl, slideOutTl };
