import { computed, signal } from '@angular/core';
import { Subject } from 'rxjs';
import type { AnimationReferenceMetadata } from 'igniteui-angular/animations';
import { clamp } from '../../core/utils';
import type { AnimationPlayState, AnimationPlayer } from './animation';

/** `skip` never touches the DOM, used for reduced motion, disabled animations and SSR. */
export type PlayerMode = 'animate' | 'skip';

/** WAAPI cannot interpolate `auto`; the computed value is used instead. */
const AUTO = 'auto';

/** Keeps the first and last keyframe applied outside the active interval, so `position` can be set before `play()`. */
const DEFAULT_TIMING: KeyframeAnimationOptions = { fill: 'both' };

/**
 * `finished$` is always delivered asynchronously, also after `finish()`. Consumers react to it by
 * tearing overlays down, so a synchronous emission would re-enter the caller of `finish()`.
 * A skip-mode `play()` completes in the same microtask hop.
 */
export class IgxWebAnimationPlayer implements AnimationPlayer {
    private readonly _state = signal<AnimationPlayState>('idle');
    private readonly _finished = new Subject<void>();
    private animation?: Animation;

    public readonly state = this._state.asReadonly();
    public readonly started = computed(() => this._state() !== 'idle');
    public readonly finished$ = this._finished.asObservable();

    constructor(
        private readonly element: HTMLElement,
        private readonly metadata: AnimationReferenceMetadata,
        private readonly mode: PlayerMode
    ) { }

    public get position(): number {
        const total = this.totalTime();

        if (!this.animation || total === 0) {
            return 0;
        }

        return clamp(Number(this.animation.currentTime ?? 0) / total, 0, 1);
    }

    public set position(value: number) {
        if (this.mode === 'skip') {
            return;
        }

        this.ensure().currentTime = clamp(value, 0, 1) * this.totalTime();
    }

    public play(): void {
        this._state.set('running');

        if (this.mode === 'skip') {
            queueMicrotask(() => this.complete());
            return;
        }

        this.ensure().play();
    }

    public pause(): void {
        if (this._state() !== 'running') {
            return;
        }

        this.animation?.pause();
        this._state.set('paused');
    }

    /** Also works on a player that never played; the end state is reported once. */
    public finish(): void {
        this.animation?.finish();
        this._state.set('finished');
        queueMicrotask(() => this._finished.next());
    }

    public reset(): void {
        this.animation?.cancel();
        this._state.set('idle');
    }

    public destroy(): void {
        this.reset();
        this.animation = undefined;
        this._finished.complete();
    }

    private ensure(): Animation {
        if (this.animation) {
            return this.animation;
        }

        const effect = new KeyframeEffect(this.element, this.resolveSteps(), { ...DEFAULT_TIMING, ...this.metadata.options });
        const animation = new Animation(effect, this.element.ownerDocument.timeline);
        animation.addEventListener('finish', () => this.complete());
        this.animation = animation;

        return animation;
    }

    /** Drops `undefined` values and measures `auto`, e.g. `{ height: 'auto' }` becomes `{ height: '120px' }`. */
    private resolveSteps(): Keyframe[] {
        const style = getComputedStyle(this.element);

        return this.metadata.steps.map(step => {
            const frame: Keyframe = {};

            for (const [prop, value] of Object.entries(step)) {
                if (value === undefined || value === null) {
                    continue;
                }

                frame[prop] = value === AUTO ? style[prop as keyof CSSStyleDeclaration] as string : value;
            }

            return frame;
        });
    }

    private totalTime(): number {
        const { delay = 0, duration = 0 } = this.metadata.options ?? {};

        return delay + (typeof duration === 'number' ? duration : 0);
    }

    /** Both the browser `finish` event and the skip-mode microtask arrive late, so a run ended by `reset()` or `finish()` stays silent. */
    private complete(): void {
        if (this._state() !== 'running') {
            return;
        }

        this._state.set('finished');
        this._finished.next();
    }
}
