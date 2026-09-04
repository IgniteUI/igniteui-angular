import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { AnimationInput, resolveAnimation } from 'igniteui-angular/animations';
import { AnimationPlayer, AnimationService, IGX_ANIMATION_MOTION } from './animation';
import { IgxWebAnimationPlayer, PlayerMode } from './web-animation-player';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Runs animations through the Web Animations API. Provided via `IGX_ANIMATION_SERVICE`. */
@Injectable({ providedIn: 'root' })
export class IgxWebAnimationService implements AnimationService {
    private readonly motion = inject(IGX_ANIMATION_MOTION);
    private readonly document = inject(DOCUMENT);
    private reducedMotion?: MediaQueryList;

    public build(animation: AnimationInput, element: HTMLElement): AnimationPlayer {
        return new IgxWebAnimationPlayer(element, resolveAnimation(animation), this.mode(element));
    }

    private mode(element: HTMLElement): PlayerMode {
        // No WAAPI on the server or in bare DOM shims.
        if (typeof element.animate !== 'function') {
            return 'skip';
        }

        switch (this.motion) {
            case 'none':
                return 'skip';
            case 'always':
                return 'animate';
            default:
                return this.prefersReducedMotion() ? 'skip' : 'animate';
        }
    }

    private prefersReducedMotion(): boolean {
        this.reducedMotion ??= this.document.defaultView?.matchMedia?.(REDUCED_MOTION_QUERY);

        return this.reducedMotion?.matches ?? false;
    }
}
