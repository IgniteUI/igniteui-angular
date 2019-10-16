import {
    animate,
    animation,
    AnimationMetadata,
    AnimationReferenceMetadata,
    keyframes,
    style
} from '@angular/animations';
import { EaseOut } from '../easings';
import { IAnimationParams } from '../interface';

const baseRecipe: AnimationMetadata[] = [
    style({
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d'
    }),
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        keyframes([
            style({
                offset: 0,
                transform: `translateZ({{startDistance}})
                rotate3d({{rotateX}}, {{rotateY}}, {{rotateZ}}, {{startAngle}}deg)`
            }),
            style({
                offset: 1,
                transform: `translateZ({{endDistance}})
                rotate3d({{rotateX}}, {{rotateY}}, {{rotateZ}}, {{endAngle}}deg)`
            })
        ])
    )
];

const baseParams: IAnimationParams = {
    delay: '0s',
    duration: '600ms',
    easing: EaseOut.quad,
    endAngle: 180,
    endDistance: '0px',
    rotateX: 1,
    rotateY: 0,
    rotateZ: 0,
    startAngle: 0,
    startDistance: '0px'
};

const flipTop: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams
    }
});

const flipBottom: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        endAngle: -180
    }
});

const flipLeft: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        rotateX: 0,
        rotateY: 1
    }
});

const flipRight: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        endAngle: -180,
        rotateX: 0,
        rotateY: 1
    }
});

const flipHorFwd: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        endDistance: '170px'
    }
});

const flipHorBck: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        endDistance: '-170px'
    }
});

const flipVerFwd: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        endDistance: '170px',
        rotateX: 0,
        rotateY: 1
    }
});

const flipVerBck: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseParams,
        endDistance: '-170px',
        rotateX: 0,
        rotateY: 1
    }
});

export {
    flipTop,
    flipRight,
    flipBottom,
    flipLeft,
    flipHorFwd,
    flipHorBck,
    flipVerFwd,
    flipVerBck
};
