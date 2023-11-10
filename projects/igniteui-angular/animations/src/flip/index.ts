import {
    animate,
    animation,
    AnimationMetadata,
    keyframes,
    style
} from '@angular/animations';
import { EaseOut } from '../easings';

const baseRecipe: AnimationMetadata[] = [
    /*@__PURE__*/style({
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d'
    }),
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/keyframes([
            /*@__PURE__*/style({
                offset: 0,
                transform: `translateZ({{startDistance}})
                rotate3d({{rotateX}}, {{rotateY}}, {{rotateZ}}, {{startAngle}}deg)`
            }),
            /*@__PURE__*/style({
                offset: 1,
                transform: `translateZ({{endDistance}})
                rotate3d({{rotateX}}, {{rotateY}}, {{rotateZ}}, {{endAngle}}deg)`
            })
        ])
    )
];

export const flipTop = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 180,
        endDistance: '0px',
        rotateX: 1,
        rotateY: 0,
        rotateZ: 0,
        startAngle: 0,
        startDistance: '0px'
    }
});

export const flipBottom = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endDistance: '0px',
        rotateX: 1,
        rotateY: 0,
        rotateZ: 0,
        startAngle: 0,
        startDistance: '0px',
        endAngle: -180
    }
});

export const flipLeft = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 180,
        endDistance: '0px',
        rotateZ: 0,
        startAngle: 0,
        startDistance: '0px',
        rotateX: 0,
        rotateY: 1
    }
});

export const flipRight = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endDistance: '0px',
        rotateZ: 0,
        startAngle: 0,
        startDistance: '0px',
        endAngle: -180,
        rotateX: 0,
        rotateY: 1
    }
});

export const flipHorFwd = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 180,
        rotateX: 1,
        rotateY: 0,
        rotateZ: 0,
        startAngle: 0,
        startDistance: '0px',
        endDistance: '170px'
    }
});

export const flipHorBck = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 180,
        rotateX: 1,
        rotateY: 0,
        rotateZ: 0,
        startAngle: 0,
        startDistance: '0px',
        endDistance: '-170px'
    }
});

export const flipVerFwd = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 180,
        rotateZ: 0,
        startAngle: 0,
        startDistance: '0px',
        endDistance: '170px',
        rotateX: 0,
        rotateY: 1
    }
});

export const flipVerBck = /*@__PURE__*/animation(baseRecipe, {
    params: {
        delay: '0s',
        duration: '600ms',
        easing: EaseOut.Quad,
        endAngle: 180,
        rotateZ: 0,
        startAngle: 0,
        startDistance: '0px',
        endDistance: '-170px',
        rotateX: 0,
        rotateY: 1
    }
});
