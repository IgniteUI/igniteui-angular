import { AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { slideInLeft, fadeIn, fadeOut, growVerIn, growVerOut } from 'igniteui-angular';
import { EaseOut } from '../animations/easings';

export interface CarouselAnimationSettings {
    enterAnimation: AnimationReferenceMetadata;
    leaveAnimation: AnimationReferenceMetadata;
}

const slideLeft: CarouselAnimationSettings = {
    enterAnimation: useAnimation(slideInLeft,
        {
            params: {
                delay: '0s',
                duration: '350ms',
                easing: EaseOut.sine,
                endOpacity: 1,
                startOpacity: 1,
                fromPosition: `translateX(-50%)`,
                toPosition: 'translateX(0%)'
            }
        }),
    leaveAnimation: useAnimation(slideInLeft,
        {
            params: {
                delay: '0s',
                duration: '350ms',
                easing: EaseOut.sine,
                endOpacity: 1,
                startOpacity: 1,
                fromPosition: `translateX(50%)`,
                toPosition: `translateX(100%)`
            }
        })
};

const slideRight: CarouselAnimationSettings = {
    enterAnimation: useAnimation(slideInLeft,
        {
            params: {
                delay: '0s',
                duration: '350ms',
                easing: EaseOut.sine,
                endOpacity: 1,
                startOpacity: 1,
                fromPosition: `translateX(50%)`,
                toPosition: 'translateX(0%)'
            }
        }),
    leaveAnimation: useAnimation(slideInLeft,
        {
            params: {
                delay: '0s',
                duration: '350ms',
                easing: EaseOut.sine,
                endOpacity: 1,
                startOpacity: 1,
                fromPosition: `translateX(0%)`,
                toPosition: `translateX(-50%)`
            }
        })
};

const slideFade: CarouselAnimationSettings = {
    enterAnimation: fadeIn,
    leaveAnimation: fadeOut
};

const slideGrow: CarouselAnimationSettings = {
    enterAnimation: growVerIn,
    leaveAnimation: growVerOut
};

export {
    slideLeft,
    slideRight,
    slideFade,
    slideGrow
};
