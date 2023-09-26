import { animate, animation, AnimationMetadata, AnimationReferenceMetadata, style } from '@angular/animations';
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

export const rotateInCenter: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutCenter: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInTop: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutTop: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInRight: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutRight: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInBottom: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutBottom: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInLeft: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutLeft: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInTr: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutTr: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInBr: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutBr: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInBl: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutBl: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInTl: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutTl: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInDiagonal1: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutDiagonal1: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInDiagonal2: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutDiagonal2: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInHor: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutHor: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateInVer: AnimationReferenceMetadata = animation(baseRecipe, {
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

export const rotateOutVer: AnimationReferenceMetadata = animation(baseRecipe, {
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
