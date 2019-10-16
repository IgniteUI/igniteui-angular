import {
    animate,
    animation,
    AnimationMetadata,
    AnimationReferenceMetadata,
    keyframes,
    style
} from '@angular/animations';
import { EaseInOut } from '../easings';
import { IAnimationParams } from '../interface';

const baseRecipe: AnimationMetadata[] = [
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        keyframes([
            style({
                offset: 0,
                transform: `rotate(0deg) translate{{direction}}(0)`,
                transformOrigin: `{{xPos}} {{yPos}}`
            }),
            style({
                offset: 0.1,
                transform: `rotate({{endAngle}}deg) translate{{direction}}(-{{startDistance}})`
            }),
            style({
                offset: 0.2,
                transform: `rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})`
            }),
            style({
                offset: 0.3,
                transform: `rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})`
            }),
            style({
                offset: 0.4,
                transform: `rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})`

            }),
            style({
                offset: 0.5,
                transform: `rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})`
            }),
            style({
                offset: 0.6,
                transform: `rotate(-{{startAngle}}deg) translate{{direction}}({{startDistance}})`

            }),
            style({
                offset: 0.7,
                transform: `rotate({{startAngle}}deg) translate{{direction}}(-{{startDistance}})`
            }),
            style({
                offset: 0.8,
                transform: `rotate(-{{endAngle}}deg) translate{{direction}}({{endDistance}})`

            }),
            style({
                offset: 0.9,
                transform: `rotate({{endAngle}}deg) translate{{direction}}(-{{endDistance}})`

            }),
            style({
                offset: 1,
                transform: `rotate(0deg) translate{{direction}}(0)`,
                transformOrigin: `{{xPos}} {{yPos}}`
            })
        ])
    )
];

const baseParams: IAnimationParams = {
    delay: '0s',
    direction: 'X',
    duration: '800ms',
    easing: EaseInOut.quad,
    endAngle: 0,
    endDistance: '8px',
    startAngle: 0,
    startDistance: '10px',
    xPos: 'center',
    yPos: 'center'
};

const shakeHor: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        direction: 'X'
    }
});

const shakeVer: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        direction: 'Y'
    }
});

const shakeTop: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        yPos: 'top'
    }
});

const shakeBottom: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        yPos: 'bottom'
    }
});

const shakeRight: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'right',
        yPos: 'center'
    }
});

const shakeLeft: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'left',
        yPos: 'center'
    }
});

const shakeCenter: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        direction: 'Y',
        endAngle: 8,
        endDistance: '0',
        startAngle: 10,
        startDistance: '0',
        xPos: 'center',
        yPos: 'center'
    }
});

const shakeTr: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'right',
        yPos: 'top'
    }
});

const shakeBr: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'right',
        yPos: 'bottom'
    }
});

const shakeBl: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'left',
        yPos: 'bottom'
    }
});

const shakeTl: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        direction: 'Y',
        endAngle: 2,
        endDistance: '0',
        startAngle: 4,
        startDistance: '0',
        xPos: 'left',
        yPos: 'top'
    }
});

export {
    shakeHor,
    shakeVer,
    shakeTop,
    shakeBottom,
    shakeRight,
    shakeLeft,
    shakeCenter,
    shakeTr,
    shakeBr,
    shakeBl,
    shakeTl
};
