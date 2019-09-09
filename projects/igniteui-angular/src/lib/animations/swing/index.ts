import { animate, animation, AnimationMetadata, AnimationReferenceMetadata, style } from '@angular/animations';
import { EaseIn, EaseOut } from '../easings';
import { IAnimationParams } from '../interface';

const swingBase: AnimationMetadata[] = [
    style({
        opacity: `{{startOpacity}}`,
        transform: `rotate{{direction}}({{startAngle}}deg)`,
        transformOrigin: `{{xPos}} {{yPos}}`
    }),
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        style({
            opacity: `{{endOpacity}}`,
            transform: `rotate{{direction}}({{endAngle}}deg)`,
            transformOrigin: `{{xPos}} {{yPos}}`
        })
    )
];

const swingParams: IAnimationParams = {
    delay: '0s',
    direction: 'X',
    duration: '.5s',
    easing: EaseOut.back,
    endAngle: 0,
    endOpacity: 1,
    startAngle: -100,
    startOpacity: 0,
    xPos: 'top',
    yPos: 'center'
};

const swingOutParams: IAnimationParams = {
    ...swingParams,
    duration: '.55s',
    easing: EaseIn.back,
    endAngle: 70,
    endOpacity: 0,
    startAngle: 0,
    startOpacity: 1
};

const swingInTopFwd: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingParams
    }
});

const swingInRightFwd: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingParams,
        direction: 'Y',
        xPos: 'center',
        yPos: 'right'
    }
});

const swingInBottomFwd: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingParams,
        startAngle: 100,
        xPos: 'bottom'
    }
});

const swingInLeftFwd: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingParams,
        direction: 'Y',
        startAngle: 100,
        xPos: 'center',
        yPos: 'left'
    }
});

const swingInTopBck: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingParams,
        duration: '.6s',
        startAngle: 70
    }
});

const swingInRightBck: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingParams,
        direction: 'Y',
        duration: '.6s',
        startAngle: 70,
        xPos: 'center',
        yPos: 'right'
    }
});

const swingInBottomBck: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingParams,
        duration: '.6s',
        startAngle: -70,
        xPos: 'bottom'
    }
});

const swingInLeftBck: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingParams,
        direction: 'Y',
        duration: '.6s',
        startAngle: -70,
        xPos: 'center',
        yPos: 'left'
    }
});

const swingOutTopFwd: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingOutParams
    }
});

const swingOutRightFwd: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingOutParams,
        direction: 'Y',
        xPos: 'center',
        yPos: 'right'
    }
});

const swingOutBottomFwd: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingOutParams,
        endAngle: -70,
        xPos: 'bottom'
    }
});

const swingOutLefttFwd: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingOutParams,
        direction: 'Y',
        endAngle: -70,
        xPos: 'center',
        yPos: 'left'
    }
});

const swingOutTopBck: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingOutParams,
        duration: '.45s',
        endAngle: -100
    }
});

const swingOutRightBck: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingOutParams,
        direction: 'Y',
        duration: '.45s',
        endAngle: -100,
        xPos: 'center',
        yPos: 'right'
    }
});

const swingOutBottomBck: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingOutParams,
        duration: '.45s',
        endAngle: 100,
        xPos: 'bottom'
    }
});

const swingOutLeftBck: AnimationReferenceMetadata = animation(swingBase, {
    params: {
        ...swingOutParams,
        direction: 'Y',
        duration: '.45s',
        endAngle: 100,
        xPos: 'center',
        yPos: 'left'
    }
});

export {
    swingInTopFwd,
    swingInRightFwd,
    swingInLeftFwd,
    swingInBottomFwd,
    swingInTopBck,
    swingInRightBck,
    swingInBottomBck,
    swingInLeftBck,
    swingOutTopFwd,
    swingOutRightFwd,
    swingOutBottomFwd,
    swingOutLefttFwd,
    swingOutTopBck,
    swingOutRightBck,
    swingOutBottomBck,
    swingOutLeftBck
};
