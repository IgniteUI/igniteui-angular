import { animate, animation, AnimationMetadata, AnimationReferenceMetadata, style } from '@angular/animations';
import { EaseIn, EaseOut } from '../easings';
import { IAnimationParams } from '../interface';

const base: AnimationMetadata[] = [
    style({
        opacity: `{{ startOpacity }}`,
        height: `{{ startHeight }}`,
        paddingBlock: `{{ startPadding }}`
    }),
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        style({
            opacity: `{{ endOpacity }}`,
            height: `{{ endHeight }}`,
            paddingBlock: `{{ endPadding }}`
        })
    )
];

const baseParams: IAnimationParams = {
    delay: '0s',
    duration: '350ms',
    easing: EaseIn.Quad,
    startOpacity: 0,
    endOpacity: 1,
    startHeight: '',
    endHeight: '',
    startPadding: '',
    endPadding: '',
};

const growVerIn: AnimationReferenceMetadata = animation(base, {
    params: {
        ...baseParams,
        easing: EaseOut.Quad,
        startOpacity: 0,
        endOpacity: 1,
        startHeight: '0px',
        endHeight: '*',
        startPadding: '0px',
        endPadding: '*'
    }
});

const growVerOut: AnimationReferenceMetadata = animation(base, {
    params: {
        ...baseParams,
        easing: EaseOut.Quad,
        startOpacity: 1,
        endOpacity: 0,
        startHeight: '*',
        endHeight: '0px',
        startPadding: '*',
        endPadding: '0px'
    }
});

export { growVerIn, growVerOut };
