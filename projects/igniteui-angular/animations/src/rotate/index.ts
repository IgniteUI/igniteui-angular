import { animate, animation, AnimationMetadata, style } from '@angular/animations';
import { EaseIn, EaseOut } from '../easings';

const baseRecipe: AnimationMetadata[] = [
    /*@__PURE__*/style({
        opacity: `{{startOpacity}}`,
        transform: `rotate3d({{rotateX}},{{rotateY}},{{rotateZ}},{{startAngle}}deg)`,
        transformOrigin: `{{xPos}} {{yPos}}`
    }),
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/style({
            offset: 0,
            opacity: `{{endOpacity}}`,
            transform: `rotate3d({{rotateX}},{{rotateY}},{{rotateZ}},{{endAngle}}deg)`,
            transformOrigin: `{{xPos}} {{yPos}}`
        })
    )
];

export const rotateInCenter = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        startOpacity: 0,
        xPos: 'center',
        yPos: 'center'
    }
});

export const rotateOutCenter = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        xPos: 'center',
        yPos: 'center',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1
    }
});

export const rotateInTop = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        startOpacity: 0,
        yPos: 'center',
        xPos: 'top'
    }
});

export const rotateOutTop = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        yPos: 'center',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        xPos: 'top'
    }
});

export const rotateInRight = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        startOpacity: 0,
        yPos: 'center',
        xPos: 'right'
    }
});

export const rotateOutRight = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        yPos: 'center',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        xPos: 'right'
    }
});

export const rotateInBottom = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        startOpacity: 0,
        yPos: 'center',
        xPos: 'bottom'
    }
});

export const rotateOutBottom = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        yPos: 'center',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        xPos: 'bottom'
    }
});

export const rotateInLeft = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        startOpacity: 0,
        yPos: 'center',
        xPos: 'left'
    }
});

export const rotateOutLeft = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        yPos: 'center',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        xPos: 'left'
    }
});

export const rotateInTr = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        startOpacity: 0,
        xPos: 'right',
        yPos: 'top'
    }
});

export const rotateOutTr = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        xPos: 'right',
        yPos: 'top'
    }
});

export const rotateInBr = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        startOpacity: 0,
        xPos: 'right',
        yPos: 'bottom'
    }
});

export const rotateOutBr = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        xPos: 'right',
        yPos: 'bottom'
    }
});

export const rotateInBl = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        startOpacity: 0,
        xPos: 'left',
        yPos: 'bottom'
    }
});

export const rotateOutBl = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        xPos: 'left',
        yPos: 'bottom'
    }
});

export const rotateInTl = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        startOpacity: 0,
        xPos: 'left',
        yPos: 'top'
    }
});

export const rotateOutTl = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 1,
        startAngle: -360,
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        xPos: 'left',
        yPos: 'top'
    }
});

export const rotateInDiagonal1 = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        startAngle: -360,
        startOpacity: 0,
        xPos: 'center',
        yPos: 'center',
        rotateX: 1,
        rotateY: 1,
        rotateZ: 0
    }
});

export const rotateOutDiagonal1 = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        startAngle: -360,
        xPos: 'center',
        yPos: 'center',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        rotateX: 1,
        rotateY: 1,
        rotateZ: 0
    }
});

export const rotateInDiagonal2 = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        startAngle: -360,
        startOpacity: 0,
        xPos: 'center',
        yPos: 'center',
        rotateX: -1,
        rotateY: 1,
        rotateZ: 0
    }
});

export const rotateOutDiagonal2 = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        startAngle: -360,
        xPos: 'center',
        yPos: 'center',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        rotateX: -1,
        rotateY: 1,
        rotateZ: 0
    }
});

export const rotateInHor = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        startAngle: -360,
        startOpacity: 0,
        xPos: 'center',
        yPos: 'center',
        rotateX: 0,
        rotateY: 1,
        rotateZ: 0
    }
});

export const rotateOutHor = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        startAngle: -360,
        xPos: 'center',
        yPos: 'center',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        rotateX: 0,
        rotateY: 1,
        rotateZ: 0
    }
});

export const rotateInVer = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 0,
        endOpacity: 1,
        startAngle: -360,
        startOpacity: 0,
        xPos: 'center',
        yPos: 'center',
        rotateX: 1,
        rotateY: 0,
        rotateZ: 0
    }
});

export const rotateOutVer = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        endAngle: 0,
        startAngle: -360,
        xPos: 'center',
        yPos: 'center',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        rotateX: 1,
        rotateY: 0,
        rotateZ: 0
    }
});
