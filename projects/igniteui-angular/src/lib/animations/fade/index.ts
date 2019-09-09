import { animate, animation, AnimationMetadata, AnimationReferenceMetadata, style } from '@angular/animations';
import { EaseOut } from '../easings';
import { IAnimationParams } from '../interface';

const base: AnimationMetadata[] = [
    style({
        opacity: `{{startOpacity}}`
    }),
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        style({
            opacity: `{{endOpacity}}`
        })
    )
];

const baseParams: IAnimationParams = {
    delay: '0s',
    duration: '350ms',
    easing: EaseOut.sine,
    endOpacity: 1,
    startOpacity: 0
};

const fadeIn: AnimationReferenceMetadata = animation(base, {
    params: baseParams
});

const fadeOut: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.sine,
        endOpacity: 0,
        startOpacity: 1
    }
});

export { fadeIn, fadeOut };
