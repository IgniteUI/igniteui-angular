import {
    animate,
    animation,
    AnimationMetadata,
    keyframes,
    style
} from '@angular/animations';
import { IAnimationParams } from '../interface';

const heartbeatBase: AnimationMetadata[] = [
    style({
        animationTimingFunction: `ease-out`,
        transform: `scale(1)`,
        transformOrigin: `center center`
    }),
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        keyframes([
            style({
                animationTimingFunction: `ease-in`,
                offset: 0.1,
                transform: `scale(0.91)`
            }),
            style({
                animationTimingFunction: `ease-out`,
                offset: 0.17,
                transform: `scale(0.98)`
            }),
            style({
                animationTimingFunction: `ease-in`,
                offset: 0.33,
                transform: `scale(0.87)`
            }),
            style({
                animationTimingFunction: `ease-out`,
                offset: 0.45,
                transform: `scale(1)`
            })
        ])
    )
];

const heartbeatParams: IAnimationParams = {
    delay: '0s',
    duration: '1.5s',
    easing: 'ease-in-out'
};

const pulsateBase: AnimationMetadata[] = [
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        keyframes([
            style({
                offset: 0,
                transform: `scale({{fromScale}})`
            }),
            style({
                offset: 0.5,
                transform: `scale({{toScale}})`
            }),
            style({
                offset: 1,
                transform: `scale({{fromScale}})`
            })
        ])
    )
];

const pulsateParams: IAnimationParams = {
    delay: '0s',
    duration: '.5s',
    easing: 'ease-in-out',
    fromScale: 1,
    toScale: 1.1
};

const blinkBase: AnimationMetadata[] = [
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        keyframes([
            style({
                offset: 0,
                opacity: .8,
                transform: `scale({{fromScale}})`
            }),
            style({
                offset: 0.8,
                opacity: 0,
                transform: `scale({{midScale}})`
            }),
            style({
                offset: 1,
                opacity: 0,
                transform: `scale({{toScale}})`
            })
        ])
    )
];

const blinkParams: IAnimationParams = {
    delay: '0s',
    duration: '.8s',
    easing: 'ease-in-out',
    fromScale: .2,
    midScale: 1.2,
    toScale: 2.2
};

const pulsateFwd = animation(pulsateBase, {
    params: {
        ...pulsateParams
    }
});

const pulsateBck = animation(pulsateBase, {
    params: {
        ...pulsateParams,
        toScale: .9
    }
});

const heartbeat = animation(heartbeatBase, {
    params: {
        ...heartbeatParams
    }
});

const blink = animation(blinkBase, {
    params: {
        ...blinkParams
    }
});

export {
    heartbeat,
    pulsateFwd,
    pulsateBck,
    blink
};
