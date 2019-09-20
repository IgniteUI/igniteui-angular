import { animate, animation, AnimationMetadata, AnimationReferenceMetadata, style } from '@angular/animations';
import { EaseIn, EaseOut } from '../easings';
import { IAnimationParams } from '../interface';

const baseRecipe: AnimationMetadata[] = [
    style({
        opacity: `{{startOpacity}}`,
        transform: `rotate3d({{rotateX}},{{rotateY}},{{rotateZ}},{{startAngle}}deg)`,
        transformOrigin: `{{xPos}} {{yPos}}`
    }),
    animate(
        `{{duration}} {{delay}} {{easing}}`,
        style({
            offset: 0,
            opacity: `{{endOpacity}}`,
            transform: `rotate3d({{rotateX}},{{rotateY}},{{rotateZ}},{{endAngle}}deg)`,
            transformOrigin: `{{xPos}} {{yPos}}`
        })
    )
];

const baseInParams: IAnimationParams = {
    delay: '0s',
    duration: '600ms',
    easing: EaseOut.quad,
    endAngle: 0,
    endOpacity: 1,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 1,
    startAngle: -360,
    startOpacity: 0,
    xPos: 'center',
    yPos: 'center'
};

const baseOutParams: IAnimationParams = {
    ...baseInParams,
    easing: EaseIn.quad,
    endOpacity: 0,
    startOpacity: 1
};

const rotateInCenter: AnimationReferenceMetadata = animation(baseRecipe, {
    params: { ...baseInParams }
});

const rotateOutCenter: AnimationReferenceMetadata = animation(baseRecipe, {
    params: { ...baseOutParams }
});

const rotateInTop: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        xPos: 'top'
    }
});

const rotateOutTop: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        xPos: 'top'
    }
});

const rotateInRight: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        xPos: 'right'
    }
});

const rotateOutRight: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        xPos: 'right'
    }
});

const rotateInBottom: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        xPos: 'bottom'
    }
});

const rotateOutBottom: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        xPos: 'bottom'
    }
});

const rotateInLeft: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        xPos: 'left'
    }
});

const rotateOutLeft: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        xPos: 'left'
    }
});

const rotateInTr: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        xPos: 'right',
        yPos: 'top'
    }
});

const rotateOutTr: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        xPos: 'right',
        yPos: 'top'
    }
});

const rotateInBr: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        xPos: 'right',
        yPos: 'bottom'
    }
});

const rotateOutBr: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        xPos: 'right',
        yPos: 'bottom'
    }
});

const rotateInBl: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        xPos: 'left',
        yPos: 'bottom'
    }
});

const rotateOutBl: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        xPos: 'left',
        yPos: 'bottom'
    }
});

const rotateInTl: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        xPos: 'left',
        yPos: 'top'
    }
});

const rotateOutTl: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        xPos: 'left',
        yPos: 'top'
    }
});

const rotateInDiagonal1: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        rotateX: 1,
        rotateY: 1,
        rotateZ: 0
    }
});

const rotateOutDiagonal1: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        rotateX: 1,
        rotateY: 1,
        rotateZ: 0
    }
});

const rotateInDiagonal2: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        rotateX: -1,
        rotateY: 1,
        rotateZ: 0
    }
});

const rotateOutDiagonal2: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        rotateX: -1,
        rotateY: 1,
        rotateZ: 0
    }
});

const rotateInHor: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        rotateX: 0,
        rotateY: 1,
        rotateZ: 0
    }
});

const rotateOutHor: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        rotateX: 0,
        rotateY: 1,
        rotateZ: 0
    }
});

const rotateInVer: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseInParams,
        rotateX: 1,
        rotateY: 0,
        rotateZ: 0
    }
});

const rotateOutVer: AnimationReferenceMetadata = animation(baseRecipe, {
    params: {
        ...baseOutParams,
        rotateX: 1,
        rotateY: 0,
        rotateZ: 0
    }
});

export {
    rotateInCenter,
    rotateInTop,
    rotateInRight,
    rotateInLeft,
    rotateInBottom,
    rotateInTr,
    rotateInBr,
    rotateInBl,
    rotateInTl,
    rotateInDiagonal1,
    rotateInDiagonal2,
    rotateInHor,
    rotateInVer,
    rotateOutCenter,
    rotateOutTop,
    rotateOutRight,
    rotateOutLeft,
    rotateOutBottom,
    rotateOutTr,
    rotateOutBr,
    rotateOutBl,
    rotateOutTl,
    rotateOutDiagonal1,
    rotateOutDiagonal2,
    rotateOutHor,
    rotateOutVer
};
