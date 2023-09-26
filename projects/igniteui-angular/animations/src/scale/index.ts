import { animate, animation, AnimationMetadata, style } from '@angular/animations';
import { EaseOut } from '../easings';

const base: AnimationMetadata[] = [
    /*@__PURE__*/style({
        opacity: `{{startOpacity}}`,
        transform: `scale{{direction}}({{fromScale}})`,
        transformOrigin: `{{xPos}} {{yPos}}`
    }),
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/style({
            opacity: `{{endOpacity}}`,
            transform: `scale{{direction}}({{toScale}})`,
            transformOrigin: `{{xPos}} {{yPos}}`
        })
    )
];

export const scaleInCenter = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '50%',
        yPos: '50%'
    }
});

export const scaleInBl = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '0',
        yPos: '100%'
    }
});

export const scaleInVerCenter = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        xPos: '50%',
        yPos: '50%',
        direction: 'Y',
        fromScale: .4
    }
});

export const scaleInTop = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '50%',
        yPos: '0'
    }
});

export const scaleInLeft = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '0',
        yPos: '50%'
    }
});

export const scaleInVerTop = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        direction: 'Y',
        fromScale: .4,
        xPos: '100%',
        yPos: '0'
    }
});

export const scaleInTr = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '100%',
        yPos: '0'
    }
});

export const scaleInTl = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '0',
        yPos: '0'
    }
});

export const scaleInVerBottom = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        direction: 'Y',
        fromScale: .4,
        xPos: '0',
        yPos: '100%'
    }
});

export const scaleInRight = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '100%',
        yPos: '50%'
    }
});

export const scaleInHorCenter = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        xPos: '50%',
        yPos: '50%',
        direction: 'X',
        fromScale: .4
    }
});

export const scaleInBr = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '100%',
        yPos: '100%'
    }
});

export const scaleInHorLeft = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        direction: 'X',
        fromScale: .4,
        xPos: '0',
        yPos: '0'
    }
});

export const scaleInBottom = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '50%',
        yPos: '100%'
    }
});

export const scaleInHorRight = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        direction: 'X',
        fromScale: .4,
        xPos: '100%',
        yPos: '100%'
    }
});

export const scaleOutCenter = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        xPos: '50%',
        yPos: '50%',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5
    }
});

export const scaleOutBl = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5,
        xPos: '0',
        yPos: '100%'
    }
});

export const scaleOutBr = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5,
        xPos: '100%',
        yPos: '100%'
    }
});

export const scaleOutVerCenter = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        xPos: '50%',
        yPos: '50%',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        direction: 'Y',
        toScale: .3
    }
});

export const scaleOutVerTop = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        direction: 'Y',
        toScale: .3,
        xPos: '100%',
        yPos: '0'
    }
});

export const scaleOutVerBottom = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        direction: 'Y',
        toScale: .3,
        xPos: '0',
        yPos: '100%'
    }
});

export const scaleOutTop = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5,
        xPos: '50%',
        yPos: '0'
    }
});

export const scaleOutLeft = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5,
        xPos: '0',
        yPos: '50%'
    }
});

export const scaleOutTr = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5,
        xPos: '100%',
        yPos: '0'
    }
});

export const scaleOutTl = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5,
        xPos: '0',
        yPos: '0'
    }
});

export const scaleOutRight = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5,
        xPos: '100%',
        yPos: '50%'
    }
});

export const scaleOutBottom = /*@__PURE__*/animation(base,{
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5,
        xPos: '50%',
        yPos: '100%'
    }
});

export const scaleOutHorCenter = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        xPos: '50%',
        yPos: '50%',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        direction: 'X',
        toScale: .3
    }
});

export const scaleOutHorLeft = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        direction: 'X',
        toScale: .3,
        xPos: '0',
        yPos: '0'
    }
});

export const scaleOutHorRight = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        direction: 'X',
        toScale: .3,
        xPos: '100%',
        yPos: '100%'
    }
});
