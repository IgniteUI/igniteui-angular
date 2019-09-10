import { animate, animation, AnimationMetadata, AnimationReferenceMetadata, style } from '@angular/animations';
import { EaseIn, EaseOut } from '../easings';
import { IAnimationParams } from '../interface';

const base: AnimationMetadata[] = [
    style({
        opacity: `{{startOpacity}}`,
        transform: `{{fromPosition}}`
    }),
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        style({
            opacity: `{{endOpacity}}`,
            transform: `{{toPosition}}`
        })
    )
];

const baseInParams: IAnimationParams = {
    delay: '0s',
    duration: '350ms',
    easing: EaseOut.quad,
    endOpacity: 1,
    fromPosition: 'translateY(-500px)',
    startOpacity: 0,
    toPosition: 'translateY(0)'
};

const baseOutParams: IAnimationParams = {
    delay: '0s',
    duration: '350ms',
    easing: EaseIn.quad,
    endOpacity: 0,
    fromPosition: 'translateY(0)',
    startOpacity: 1,
    toPosition: 'translateY(-500px)'
};

const slideInTop: AnimationReferenceMetadata = animation(base, { params: baseInParams });

const slideInLeft: AnimationReferenceMetadata = animation(base,
    {
        params: {
            delay: '0s',
            duration: '350ms',
            easing: EaseOut.quad,
            endOpacity: 1,
            fromPosition: 'translateX(-500px)',
            startOpacity: 0,
            toPosition: 'translateY(0)'
        }
    }
);

const slideInRight: AnimationReferenceMetadata = animation(base,
    {
        params: {
            delay: '0s',
            duration: '350ms',
            easing: EaseOut.quad,
            endOpacity: 1,
            fromPosition: 'translateX(500px)',
            startOpacity: 0,
            toPosition: 'translateY(0)'
        }
    }
);

const slideInBottom: AnimationReferenceMetadata = animation(base,
    {
        params: {
            delay: '0s',
            duration: '350ms',
            easing: EaseOut.quad,
            endOpacity: 1,
            fromPosition: 'translateY(500px)',
            startOpacity: 0,
            toPosition: 'translateY(0)'
        }
    }
);

const slideInTr: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseInParams,
            fromPosition: 'translateY(-500px) translateX(500px)',
            toPosition: 'translateY(0) translateX(0)'
        }
    }
);

const slideInTl: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseInParams,
            fromPosition: 'translateY(-500px) translateX(-500px)',
            toPosition: 'translateY(0) translateX(0)'
        }
    }
);

const slideInBr: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseInParams,
            fromPosition: 'translateY(500px) translateX(500px)',
            toPosition: 'translateY(0) translateX(0)'
        }
    }
);

const slideInBl: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseInParams,
            fromPosition: 'translateY(500px) translateX(-500px)',
            toPosition: 'translateY(0) translateX(0)'
        }
    }
);

const slideOutTop: AnimationReferenceMetadata = animation(base, { params: baseOutParams });

const slideOutRight: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            toPosition: 'translateX(500px)'
        }
    }
);

const slideOutBottom: AnimationReferenceMetadata = animation(base,
    {
        params: {
            delay: '0s',
            duration: '350ms',
            easing: EaseIn.quad,
            endOpacity: 0,
            fromPosition: 'translateY(0)',
            startOpacity: 1,
            toPosition: 'translateY(500px)'
        }
    }
);

const slideOutLeft: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            toPosition: 'translateX(-500px)'
        }
    }
);

const slideOutTr: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            fromPosition: 'translateY(0) translateX(0)',
            toPosition: 'translateY(-500px) translateX(500px)'
        }
    }
);

const slideOutBr: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            fromPosition: 'translateY(0) translateX(0)',
            toPosition: 'translateY(500px) translateX(500px)'
        }
    }
);

const slideOutBl: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            fromPosition: 'translateY(0) translateX(0)',
            toPosition: 'translateY(500px) translateX(-500px)'
        }
    }
);

const slideOutTl: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            fromPosition: 'translateY(0) translateX(0)',
            toPosition: 'translateY(-500px) translateX(-500px)'
        }
    }
);

export {
    slideInTop,
    slideInRight,
    slideInBottom,
    slideInLeft,
    slideInTr,
    slideInBr,
    slideInBl,
    slideInTl,
    slideOutTop,
    slideOutBottom,
    slideOutRight,
    slideOutLeft,
    slideOutTr,
    slideOutBr,
    slideOutBl,
    slideOutTl
};
