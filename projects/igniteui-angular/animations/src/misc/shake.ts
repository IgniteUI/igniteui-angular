import {
    animate,
    animation,
    AnimationMetadata,
    keyframes,
    style
} from '@angular/animations';
import { EaseInOut } from '../easings';

const baseRecipe: AnimationMetadata[] = [
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/keyframes([
            /*@__PURE__*/style({
                offset: 0,
                transform: `rotate(0deg) translate{{direction}}(0)`,
                transformOrigin: `{{xPos}} {{yPos}}`
            }),
            /*@__PURE__*/style({
                offset: 0.1,
                transform: `rotate({{endAngle}}deg) translate{{direction}}(-{{startDistance}})`
            }),
            /*@__PURE__*/style({
                offset: 0.2,
                transform: `rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})`
            }),
            /*@__PURE__*/style({
                offset: 0.3,
                transform: `rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})`
            }),
            /*@__PURE__*/style({
                offset: 0.4,
                transform: `rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})`

            }),
            /*@__PURE__*/style({
                offset: 0.5,
                transform: `rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})`
            }),
            /*@__PURE__*/style({
                offset: 0.6,
                transform: `rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})`

            }),
            /*@__PURE__*/style({
                offset: 0.7,
                transform: `rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})`
            }),
            /*@__PURE__*/style({
                offset: 0.8,
                transform: `rotate(-{{endAngle}}deg) translate{{direction}}({{endDistance}})`

            }),
            /*@__PURE__*/style({
                offset: 0.9,
                transform: `rotate({{endAngle}}deg) translate{{direction}}(-{{endDistance}})`

            }),
            /*@__PURE__*/style({
                offset: 1,
                transform: `rotate(0deg) translate{{direction}}(0)`,
                transformOrigin: `{{xPos}} {{yPos}}`
            })
        ])
    )
];

export const shakeHor = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        direction: 'X',
        duration: '800ms',
        easing: EaseInOut.Quad,
        endAngle: 0,
        endDistance: '8px',
        startAngle: 0,
        startDistance: '10px',
        xPos: 'center',
        yPos: 'center'
    }
});

export const shakeVer = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        direction: 'Y',
        duration: '800ms',
        easing: EaseInOut.Quad,
        endAngle: 0,
        endDistance: '8px',
        startAngle: 0,
        startDistance: '10px',
        xPos: 'center',
        yPos: 'center'
    }
});

export const shakeTop = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        direction: 'X',
        duration: '800ms',
        easing: EaseInOut.Quad,
        xPos: 'center',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        yPos: 'top'
    }
});

export const shakeBottom = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '800ms',
        easing: EaseInOut.Quad,
        xPos: 'center',
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        yPos: 'bottom'
    }
});

export const shakeRight = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '800ms',
        easing: EaseInOut.Quad,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'right',
        yPos: 'center'
    }
});

export const shakeLeft = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '800ms',
        easing: EaseInOut.Quad,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'left',
        yPos: 'center'
    }
});

export const shakeCenter = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '800ms',
        easing: EaseInOut.Quad,
        direction: 'Y',
        endAngle: 8,
        endDistance: '0',
        startAngle: 10,
        startDistance: '0',
        xPos: 'center',
        yPos: 'center'
    }
});

export const shakeTr = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '800ms',
        easing: EaseInOut.Quad,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'right',
        yPos: 'top'
    }
});

export const shakeBr = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '800ms',
        easing: EaseInOut.Quad,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'right',
        yPos: 'bottom'
    }
});

export const shakeBl = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '800ms',
        easing: EaseInOut.Quad,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'left',
        yPos: 'bottom'
    }
});

export const shakeTl = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '800ms',
        easing: EaseInOut.Quad,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'left',
        yPos: 'top'
    }
});
