import { AnimationBuilder, AnimationReferenceMetadata } from '@angular/animations';
import { ANIMATION_MODULE_TYPE, Injectable, inject } from '@angular/core';
import { IgxAngularAnimationPlayer } from './angular-animation-player';
import { AnimationService, AnimationPlayer } from './animation';

@Injectable({providedIn: 'root'})
export class IgxAngularAnimationService implements AnimationService {
    private builder = inject(AnimationBuilder);
    private readonly _isNoop = inject(ANIMATION_MODULE_TYPE, { optional: true }) === 'NoopAnimations';

    /**
     * Whether the animations are noop, e.g. with `provideNoopAnimations()`, so they end without being painted.
     *
     * @returns `true` when the application uses noop animations.
     * @example
     * ```typescript
     * const skipRender = this.animationService.isNoop;
     * ```
     */
    public get isNoop(): boolean {
        return this._isNoop;
    }

    public buildAnimation(animationMetaData: AnimationReferenceMetadata, element: HTMLElement): AnimationPlayer {
        if (!animationMetaData) {
            return null!;
        }
        const animationBuilder = this.builder.build(animationMetaData);
        const player = new IgxAngularAnimationPlayer(animationBuilder.create(element), this._isNoop);
        return player;
    }
}
