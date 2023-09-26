import { animate, animation, AnimationMetadata, AnimationReferenceMetadata, style } from '@angular/animations';
import { EaseOut } from '../easings';

const base: AnimationMetadata[] = [
    /*@__PURE__*/style({
        opacity: `{{startOpacity}}`
    }),
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/style({
            opacity: `{{endOpacity}}`
        })
    )
];

export const fadeIn: AnimationReferenceMetadata = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 1,
        startOpacity: 0
    }
});

export const fadeOut: AnimationReferenceMetadata = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        startOpacity: 1
    }
});
