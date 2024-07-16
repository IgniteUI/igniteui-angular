import {
    animate,
    animation,
    AnimationMetadata,
    keyframes,
    style
} from '@angular/animations';

const heartbeatBase: AnimationMetadata[] = [
    /*@__PURE__*/style({
        animationTimingFunction: `ease-out`,
        transform: `scale(1)`,
        transformOrigin: `center center`
    }),
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/keyframes([
            /*@__PURE__*/style({
                animationTimingFunction: `ease-in`,
                offset: 0.1,
                transform: `scale(0.91)`
            }),
            /*@__PURE__*/style({
                animationTimingFunction: `ease-out`,
                offset: 0.17,
                transform: `scale(0.98)`
            }),
            /*@__PURE__*/style({
                animationTimingFunction: `ease-in`,
                offset: 0.33,
                transform: `scale(0.87)`
            }),
            /*@__PURE__*/style({
                animationTimingFunction: `ease-out`,
                offset: 0.45,
                transform: `scale(1)`
            })
        ])
    )
];

const pulsateBase: AnimationMetadata[] = [
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/keyframes([
            /*@__PURE__*/style({
                offset: 0,
                transform: `scale({{fromScale}})`
            }),
            /*@__PURE__*/style({
                offset: 0.5,
                transform: `scale({{toScale}})`
            }),
            /*@__PURE__*/style({
                offset: 1,
                transform: `scale({{fromScale}})`
            })
        ])
    )
];

const blinkBase: AnimationMetadata[] = [
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/keyframes([
            /*@__PURE__*/style({
                offset: 0,
                opacity: .8,
                transform: `scale({{fromScale}})`
            }),
            /*@__PURE__*/style({
                offset: 0.8,
                opacity: 0,
                transform: `scale({{midScale}})`
            }),
            /*@__PURE__*/style({
                offset: 1,
                opacity: 0,
                transform: `scale({{toScale}})`
            })
        ])
    )
];

export const pulsateFwd = /*@__PURE__*/animation(pulsateBase, {
    params: {
        delay: '0s',
        duration: '.5s',
        easing: 'ease-in-out',
        fromScale: 1,
        toScale: 1.1
    }
});

export const pulsateBck = /*@__PURE__*/animation(pulsateBase, {
    params: {
        delay: '0s',
        duration: '.5s',
        easing: 'ease-in-out',
        fromScale: 1,
        toScale: .9
    }
});

export const heartbeat = /*@__PURE__*/animation(heartbeatBase, {
    params: {
        delay: '0s',
        duration: '1.5s',
        easing: 'ease-in-out'
    }
});

export const blink = /*@__PURE__*/animation(blinkBase, {
    params: {
        delay: '0s',
        duration: '.8s',
        easing: 'ease-in-out',
        fromScale: .2,
        midScale: 1.2,
        toScale: 2.2
    }
});
