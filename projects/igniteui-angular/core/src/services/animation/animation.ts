import { InjectionToken, Provider, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type { AnimationInput } from 'igniteui-angular/animations';
import { IgxWebAnimationService } from './web-animation-service';

export type AnimationPlayState = 'idle' | 'running' | 'paused' | 'finished';

/**
 * Controls one animation on one element.
 *
 *   idle ──play()──▶ running ──▶ finished
 *    ▲                 │  ▲          │
 *    │             pause() play()    │
 *    │                 ▼  │          │
 *    └── reset() ──── paused ◀───────┘
 */
export interface AnimationPlayer {
    readonly state: Signal<AnimationPlayState>;
    /** True from `play()` until `reset()` or `destroy()`. Stays true once finished. */
    readonly started: Signal<boolean>;
    /** Emits on natural end and on `finish()`. Silent on `reset()` and `destroy()`. */
    readonly finished$: Observable<void>;
    /** Progress in [0, 1] over delay plus duration. Settable at any time, also before `play()`. */
    position: number;
    play(): void;
    pause(): void;
    /** Jumps to the end and emits `finished$`. */
    finish(): void;
    /** Removes the animation's effect and returns to `idle`. */
    reset(): void;
    destroy(): void;
}

export interface AnimationService {
    build(animation: AnimationInput, element: HTMLElement): AnimationPlayer;
}

/**
 * `auto`   honors `prefers-reduced-motion` (default)
 * `always` ignores it
 * `none`   disables every animation; players finish in a microtask
 */
export type AnimationMotion = 'auto' | 'always' | 'none';

export const IGX_ANIMATION_MOTION = new InjectionToken<AnimationMotion>('IgxAnimationMotion', {
    providedIn: 'root',
    factory: () => 'auto'
});

export const IGX_ANIMATION_SERVICE = new InjectionToken<AnimationService>('IgxAnimationService', {
    providedIn: 'root',
    factory: () => inject(IgxWebAnimationService)
});

export function provideIgxAnimations(motion: AnimationMotion): Provider {
    return { provide: IGX_ANIMATION_MOTION, useValue: motion };
}

/** For tests and SSR. Equivalent to `provideIgxAnimations('none')`. */
export function provideIgxNoopAnimations(): Provider {
    return provideIgxAnimations('none');
}
