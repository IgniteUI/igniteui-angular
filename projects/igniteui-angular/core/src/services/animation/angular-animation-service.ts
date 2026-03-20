import { AnimationBuilder, AnimationReferenceMetadata } from '@angular/animations';
import { ANIMATION_MODULE_TYPE, Injectable, inject } from '@angular/core';
import { IgxAngularAnimationPlayer } from './angular-animation-player';
import { AnimationService, AnimationPlayer } from './animation';

@Injectable({providedIn: 'root'})
export class IgxAngularAnimationService implements AnimationService {
    private builder = inject(AnimationBuilder);
    private isNoop = inject(ANIMATION_MODULE_TYPE, { optional: true }) === 'NoopAnimations';

    public buildAnimation(animationMetaData: AnimationReferenceMetadata, element: HTMLElement): AnimationPlayer {
        if (!animationMetaData) {
            return null;
        }
        const animationBuilder = this.builder.build(animationMetaData);
        const player = new IgxAngularAnimationPlayer(animationBuilder.create(element), this.isNoop);
        return player;
    }
}
