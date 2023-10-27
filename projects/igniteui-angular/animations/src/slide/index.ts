import { animate, animation, AnimationMetadata, style } from '@angular/animations';
import { EaseIn, EaseOut } from '../easings';

const base: AnimationMetadata[] = [
    /*@__PURE__*/style({
        opacity: `{{startOpacity}}`,
        transform: `{{fromPosition}}`
    }),
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/style({
            opacity: `{{endOpacity}}`,
            transform: `{{toPosition}}`
        })
    )
];

export const slideInTop = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromPosition: 'translateY(-500px)',
        startOpacity: 0,
        toPosition: 'translateY(0)'
    }
});

export const slideInLeft = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromPosition: 'translateX(-500px)',
        startOpacity: 0,
        toPosition: 'translateY(0)'
    }
});

export const slideInRight = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromPosition: 'translateX(500px)',
        startOpacity: 0,
        toPosition: 'translateY(0)'
    }
});

export const slideInBottom = /*@__PURE__*/animation(base,{
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromPosition: 'translateY(500px)',
        startOpacity: 0,
        toPosition: 'translateY(0)'
    }
});

export const slideInTr = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        fromPosition: 'translateY(-500px) translateX(500px)',
        toPosition: 'translateY(0) translateX(0)'
    }
});

export const slideInTl = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        fromPosition: 'translateY(-500px) translateX(-500px)',
        toPosition: 'translateY(0) translateX(0)'
    }
});

export const slideInBr = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        fromPosition: 'translateY(500px) translateX(500px)',
        toPosition: 'translateY(0) translateX(0)'
    }
});

export const slideInBl = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        fromPosition: 'translateY(500px) translateX(-500px)',
        toPosition: 'translateY(0) translateX(0)'
    }
});

export const slideOutTop = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseIn.Quad,
        endOpacity: 0,
        fromPosition: 'translateY(0)',
        startOpacity: 1,
        toPosition: 'translateY(-500px)'
    }
});

export const slideOutRight = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseIn.Quad,
        endOpacity: 0,
        fromPosition: 'translateY(0)',
        startOpacity: 1,
        toPosition: 'translateX(500px)'
    }
});

export const slideOutBottom = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseIn.Quad,
        endOpacity: 0,
        fromPosition: 'translateY(0)',
        startOpacity: 1,
        toPosition: 'translateY(500px)'
    }
});

export const slideOutLeft = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseIn.Quad,
        endOpacity: 0,
        fromPosition: 'translateY(0)',
        startOpacity: 1,
        toPosition: 'translateX(-500px)'
    }
});

export const slideOutTr = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        fromPosition: 'translateY(0) translateX(0)',
        toPosition: 'translateY(-500px) translateX(500px)'
    }
});

export const slideOutBr = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        fromPosition: 'translateY(0) translateX(0)',
        toPosition: 'translateY(500px) translateX(500px)'
    }
});

export const slideOutBl = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        fromPosition: 'translateY(0) translateX(0)',
        toPosition: 'translateY(500px) translateX(-500px)'
    }
});

export const slideOutTl = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseIn.Quad,
        endOpacity: 0,
        startOpacity: 1,
        fromPosition: 'translateY(0) translateX(0)',
        toPosition: 'translateY(-500px) translateX(-500px)'
    }
});
