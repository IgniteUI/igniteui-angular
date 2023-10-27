import { animate, animation, AnimationMetadata, style } from '@angular/animations';
import { EaseOut } from '../easings';

const base: AnimationMetadata[] = [
    /*@__PURE__*/style({
        opacity: `{{ startOpacity }}`,
        height: `{{ startHeight }}`,
        paddingBlock: `{{ startPadding }}`
    }),
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/style({
            opacity: `{{ endOpacity }}`,
            height: `{{ endHeight }}`,
            paddingBlock: `{{ endPadding }}`
        })
    )
];

export const growVerIn = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        startOpacity: 0,
        endOpacity: 1,
        startHeight: '0px',
        endHeight: '*',
        startPadding: '0px',
        endPadding: '*'
    }
});

export const growVerOut = /*@__PURE__*/animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        startOpacity: 1,
        endOpacity: 0,
        startHeight: '*',
        endHeight: '0px',
        startPadding: '*',
        endPadding: '0px'
    }
});
