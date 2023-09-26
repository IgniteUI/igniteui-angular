import { animate, animation, AnimationMetadata, AnimationReferenceMetadata, style } from '@angular/animations';
import { EaseOut } from '../easings';
import { IAnimationParams } from '../interface';

const base: AnimationMetadata[] = [
    /*@__PURE__*/style({
        opacity: `{{startOpacity}}`,
        transform: `scale{{direction}}({{fromScale}})`,
        transformOrigin: `{{xPos}} {{yPos}}`
    }),
    /*@__PURE__*/animate(
        `{{duration}} {{delay}} {{easing}}`,
        /*@__PURE__*/style({
            opacity: `{{endOpacity}}`,
            transform: `scale{{direction}}({{toScale}})`,
            transformOrigin: `{{xPos}} {{yPos}}`
        })
    )
];

const baseOutParams: IAnimationParams = {
    delay: '0s',
    direction: '',
    duration: '350ms',
    xPos: '50%',
    yPos: '50%',
    easing: EaseOut.Sine,
    endOpacity: 0,
    fromScale: 1,
    startOpacity: 1,
    toScale: .5
};

const scaleInCenter: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '50%',
        yPos: '50%'
    }
});

const scaleInBl: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '0',
        yPos: '100%'
    }
});

const scaleInVerCenter: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        xPos: '50%',
        yPos: '50%',
        direction: 'Y',
        fromScale: .4
    }
});

const scaleInTop: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '50%',
        yPos: '0'
    }
});

const scaleInLeft: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '0',
        yPos: '50%'
    }
});

const scaleInVerTop: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        direction: 'Y',
        fromScale: .4,
        xPos: '100%',
        yPos: '0'
    }
});

const scaleInTr = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '100%',
        yPos: '0'
    }
});

const scaleInTl: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '0',
        yPos: '0'
    }
});

const scaleInVerBottom: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        direction: 'Y',
        fromScale: .4,
        xPos: '0',
        yPos: '100%'
    }
});

const scaleInRight: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '100%',
        yPos: '50%'
    }
});

const scaleInHorCenter: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        xPos: '50%',
        yPos: '50%',
        direction: 'X',
        fromScale: .4
    }
});

const scaleInBr: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '100%',
        yPos: '100%'
    }
});

const scaleInHorLeft: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        direction: 'X',
        fromScale: .4,
        xPos: '0',
        yPos: '0'
    }
});

const scaleInBottom: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        fromScale: .5,
        startOpacity: 0,
        toScale: 1,
        xPos: '50%',
        yPos: '100%'
    }
});

const scaleInHorRight: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Quad,
        endOpacity: 1,
        startOpacity: 0,
        toScale: 1,
        direction: 'X',
        fromScale: .4,
        xPos: '100%',
        yPos: '100%'
    }
});

const scaleOutCenter: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        xPos: '50%',
        yPos: '50%',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5
    }
});

const scaleOutBl: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5,
        xPos: '0',
        yPos: '100%'
    }
});

const scaleOutBr: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        direction: '',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        toScale: .5,
        xPos: '100%',
        yPos: '100%'
    }
});

const scaleOutVerCenter: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        xPos: '50%',
        yPos: '50%',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        direction: 'Y',
        toScale: .3
    }
});

const scaleOutVerTop: AnimationReferenceMetadata = animation(base, {
    params: {
        delay: '0s',
        duration: '350ms',
        easing: EaseOut.Sine,
        endOpacity: 0,
        fromScale: 1,
        startOpacity: 1,
        direction: 'Y',
        toScale: .3,
        xPos: '100%',
        yPos: '0'
    }
});

const scaleOutVerBottom: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            direction: 'Y',
            toScale: .3,
            xPos: '0',
            yPos: '100%'
        }
    }
);

const scaleOutTop: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            xPos: '50%',
            yPos: '0'
        }
    }
);

const scaleOutLeft: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            xPos: '0',
            yPos: '50%'
        }
    }
);

const scaleOutTr: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            xPos: '100%',
            yPos: '0'
        }
    }
);

const scaleOutTl: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            xPos: '0',
            yPos: '0'
        }
    }
);

const scaleOutRight: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            xPos: '100%',
            yPos: '50%'
        }
    }
);

const scaleOutBottom: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            xPos: '50%',
            yPos: '100%'
        }
    }
);

const scaleOutHorCenter: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            direction: 'X',
            toScale: .3
        }
    }
);

const scaleOutHorLeft: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            direction: 'X',
            toScale: .3,
            xPos: '0',
            yPos: '0'
        }
    }
);

const scaleOutHorRight: AnimationReferenceMetadata = animation(base,
    {
        params: {
            ...baseOutParams,
            direction: 'X',
            toScale: .3,
            xPos: '100%',
            yPos: '100%'
        }
    }
);

export {
    scaleInTop,
    scaleInRight,
    scaleInBottom,
    scaleInLeft,
    scaleInCenter,
    scaleInTr,
    scaleInBr,
    scaleInBl,
    scaleInTl,
    scaleInVerTop,
    scaleInVerBottom,
    scaleInVerCenter,
    scaleInHorCenter,
    scaleInHorLeft,
    scaleInHorRight,
    scaleOutTop,
    scaleOutRight,
    scaleOutBottom,
    scaleOutLeft,
    scaleOutCenter,
    scaleOutTr,
    scaleOutBr,
    scaleOutBl,
    scaleOutTl,
    scaleOutVerTop,
    scaleOutVerBottom,
    scaleOutVerCenter,
    scaleOutHorCenter,
    scaleOutHorLeft,
    scaleOutHorRight
};
