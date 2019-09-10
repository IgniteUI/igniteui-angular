import { animate, animation, AnimationMetadata, AnimationReferenceMetadata, style } from '@angular/animations';
import { EaseOut, EaseIn } from '../easings';
import { IAnimationParams } from '../interface';

const base: AnimationMetadata[] = [
    style({
        opacity: `{{ startOpacity }}`,
        height: `{{ startHeight }}`
    }),
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        style({
            opacity: `{{ endOpacity }}`,
            height: `{{ endHeight }}`
        })
    )
];

const baseParams: IAnimationParams = {
    delay: '0s',
    duration: '350ms',
    easing: EaseIn.quad,
    startOpacity: 0,
    endOpacity: 1,
    startHeight: '',
    endHeight: ''
};

const growVerIn: AnimationReferenceMetadata = animation(base, {
    params: {
        ...baseParams,
        easing: EaseOut.quad,
        startOpacity: 0,
        endOpacity: 1,
        startHeight: '0px',
        endHeight: '*'
    }
});

const growVerOut: AnimationReferenceMetadata = animation(base, {
    params: {
        ...baseParams,
        easing: EaseOut.quad,
        startOpacity: 1,
        endOpacity: 0,
        startHeight: '*',
        endHeight: '0px'
    }
});

export { growVerIn, growVerOut };
