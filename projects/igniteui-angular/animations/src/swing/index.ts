import { animate, animation, AnimationMetadata, style } from '@angular/animations';
import { EaseIn, EaseOut } from '../easings';

const swingBase: AnimationMetadata[] = [
    /*@__PURE__*/style({
        opacity: `{{startOpacity}}`,
        transform: `rotate{{direction}}({{startAngle}}deg)`,
        transformOrigin: `{{xPos}} {{yPos}}`
    }),
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/style({
            opacity: `{{endOpacity}}`,
            transform: `rotate{{direction}}({{endAngle}}deg)`,
            transformOrigin: `{{xPos}} {{yPos}}`
        })
    )
];

export const swingInTopFwd = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        direction: 'X',
        duration: '.5s',
        easing: EaseOut.Back,
        endAngle: 0,
        endOpacity: 1,
        startAngle: -100,
        startOpacity: 0,
        xPos: 'top',
        yPos: 'center'
    }
});

export const swingInRightFwd = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        duration: '.5s',
        easing: EaseOut.Back,
        endAngle: 0,
        endOpacity: 1,
        startAngle: -100,
        startOpacity: 0,
        direction: 'Y',
        xPos: 'center',
        yPos: 'right'
    }
});

export const swingInBottomFwd = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        direction: 'X',
        duration: '.5s',
        easing: EaseOut.Back,
        endAngle: 0,
        endOpacity: 1,
        startOpacity: 0,
        yPos: 'center',
        startAngle: 100,
        xPos: 'bottom'
    }
});

export const swingInLeftFwd = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        duration: '.5s',
        easing: EaseOut.Back,
        endAngle: 0,
        endOpacity: 1,
        startOpacity: 0,
        direction: 'Y',
        startAngle: 100,
        xPos: 'center',
        yPos: 'left'
    }
});

export const swingInTopBck = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        direction: 'X',
        easing: EaseOut.Back,
        endAngle: 0,
        endOpacity: 1,
        startOpacity: 0,
        xPos: 'top',
        yPos: 'center',
        duration: '.6s',
        startAngle: 70
    }
});

export const swingInRightBck = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        easing: EaseOut.Back,
        endAngle: 0,
        endOpacity: 1,
        startOpacity: 0,
        direction: 'Y',
        duration: '.6s',
        startAngle: 70,
        xPos: 'center',
        yPos: 'right'
    }
});

export const swingInBottomBck = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        direction: 'X',
        easing: EaseOut.Back,
        endAngle: 0,
        endOpacity: 1,
        startOpacity: 0,
        yPos: 'center',
        duration: '.6s',
        startAngle: -70,
        xPos: 'bottom'
    }
});

export const swingInLeftBck = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        easing: EaseOut.Back,
        endAngle: 0,
        endOpacity: 1,
        startOpacity: 0,
        direction: 'Y',
        duration: '.6s',
        startAngle: -70,
        xPos: 'center',
        yPos: 'left'
    }
});

export const swingOutTopFwd = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        direction: 'X',
        xPos: 'top',
        yPos: 'center',
        duration: '.55s',
        easing: EaseIn.Back,
        endAngle: 70,
        endOpacity: 0,
        startAngle: 0,
        startOpacity: 1
    }
});

export const swingOutRightFwd = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        duration: '.55s',
        easing: EaseIn.Back,
        endAngle: 70,
        endOpacity: 0,
        startAngle: 0,
        startOpacity: 1,
        direction: 'Y',
        xPos: 'center',
        yPos: 'right'
    }
});

export const swingOutBottomFwd = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        direction: 'X',
        yPos: 'center',
        duration: '.55s',
        easing: EaseIn.Back,
        endOpacity: 0,
        startAngle: 0,
        startOpacity: 1,
        endAngle: -70,
        xPos: 'bottom'
    }
});

export const swingOutLefttFwd = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        duration: '.55s',
        easing: EaseIn.Back,
        endOpacity: 0,
        startAngle: 0,
        startOpacity: 1,
        direction: 'Y',
        endAngle: -70,
        xPos: 'center',
        yPos: 'left'
    }
});

export const swingOutTopBck = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        direction: 'X',
        xPos: 'top',
        yPos: 'center',
        easing: EaseIn.Back,
        endOpacity: 0,
        startAngle: 0,
        startOpacity: 1,
        duration: '.45s',
        endAngle: -100
    }
});

export const swingOutRightBck = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        easing: EaseIn.Back,
        endOpacity: 0,
        startAngle: 0,
        startOpacity: 1,
        direction: 'Y',
        duration: '.45s',
        endAngle: -100,
        xPos: 'center',
        yPos: 'right'
    }
});

export const swingOutBottomBck = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        direction: 'X',
        yPos: 'center',
        easing: EaseIn.Back,
        endOpacity: 0,
        startAngle: 0,
        startOpacity: 1,
        duration: '.45s',
        endAngle: 100,
        xPos: 'bottom'
    }
});

export const swingOutLeftBck = /*@__PURE__*/animation(swingBase, {
    params: {
        delay: '0s',
        easing: EaseIn.Back,
        endOpacity: 0,
        startAngle: 0,
        startOpacity: 1,
        direction: 'Y',
        duration: '.45s',
        endAngle: 100,
        xPos: 'center',
        yPos: 'left'
    }
});
