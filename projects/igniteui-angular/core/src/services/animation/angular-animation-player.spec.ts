import { AnimationPlayer as AngularAnimationPlayer } from '@angular/animations';
import { describe, it, expect, vi } from 'vitest';
import { IgxAngularAnimationPlayer } from './angular-animation-player';

const flushMicrotasks = () => new Promise<void>(resolve => queueMicrotask(resolve));

/**
 * Minimal inner player that, like Angular's no-op players, queues its own completion on `play()`,
 * completes synchronously on `finish()` and keeps its done callbacks across `reset()`.
 */
const createInnerPlayer = (): AngularAnimationPlayer => {
    const doneFns: (() => void)[] = [];
    let started = false;
    return {
        onDone: (fn: () => void) => doneFns.push(fn),
        onStart: () => { },
        onDestroy: () => { },
        init: () => { },
        hasStarted: () => started,
        play: () => {
            started = true;
            queueMicrotask(() => doneFns.forEach(fn => fn()));
        },
        pause: () => { },
        restart: () => { },
        finish: () => doneFns.forEach(fn => fn()),
        destroy: () => { },
        reset: () => {
            started = false;
        },
        setPosition: () => { },
        getPosition: () => 0,
        totalTime: 0
    } as unknown as AngularAnimationPlayer;
};

describe('IgxAngularAnimationPlayer', () => {
    it('should emit animationEnd once per play for a no-op player that completes more than once', async () => {
        const player = new IgxAngularAnimationPlayer(createInnerPlayer(), true);
        const endSpy = vi.fn();
        // the overlay resets the player when its open/close animation is done
        player.animationEnd.subscribe(() => {
            endSpy();
            player.reset();
        });

        player.play();
        await flushMicrotasks();
        expect(endSpy).toHaveBeenCalledTimes(1);

        // a new playback completes again
        player.play();
        await flushMicrotasks();
        expect(endSpy).toHaveBeenCalledTimes(2);
    });

    it('should emit animationStart and animationEnd once when finished explicitly', () => {
        const player = new IgxAngularAnimationPlayer(createInnerPlayer());
        const startSpy = vi.fn();
        const endSpy = vi.fn();
        player.animationStart.subscribe(startSpy);
        player.animationEnd.subscribe(endSpy);

        player.play();
        player.finish();

        expect(startSpy).toHaveBeenCalledTimes(1);
        expect(endSpy).toHaveBeenCalledTimes(1);
    });
});
