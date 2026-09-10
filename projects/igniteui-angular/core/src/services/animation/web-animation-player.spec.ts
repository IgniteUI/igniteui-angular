import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { animation, fadeIn, growVerIn } from 'igniteui-angular/animations';
import { IGX_ANIMATION_SERVICE, provideIgxAnimations, provideIgxNoopAnimations } from './animation';
import { IgxWebAnimationPlayer } from './web-animation-player';

const DURATION = 100;
const HEIGHT = 120;

describe('IgxWebAnimationPlayer', () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = document.createElement('div');
        element.style.height = `${HEIGHT}px`;
        document.body.appendChild(element);
    });

    afterEach(() => element.remove());

    describe('animate mode', () => {
        const build = (steps: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }], options: KeyframeAnimationOptions = { duration: DURATION }) =>
            new IgxWebAnimationPlayer(element, animation(steps, options), 'animate');

        it('walks idle -> running -> finished and emits finished$ once', async () => {
            const player = build();
            const finished = jasmine.createSpy('finished');
            player.finished$.subscribe(finished);

            expect(player.state()).toBe('idle');
            expect(player.started()).toBeFalse();

            player.play();
            expect(player.state()).toBe('running');
            expect(player.started()).toBeTrue();

            await firstValueFrom(player.finished$);
            expect(player.state()).toBe('finished');
            expect(player.started()).toBeTrue();
            expect(finished).toHaveBeenCalledTimes(1);
        });

        it('finish() jumps to the end at once and notifies in a microtask', async () => {
            const player = build();
            const finished = jasmine.createSpy('finished');
            player.finished$.subscribe(finished);

            player.play();
            player.finish();

            expect(player.state()).toBe('finished');
            expect(element.getAnimations()[0].playState).toBe('finished');
            expect(finished).not.toHaveBeenCalled();

            await Promise.resolve();
            expect(finished).toHaveBeenCalledTimes(1);
        });

        it('finish() works on a player that never played', async () => {
            const player = build();
            const finished = jasmine.createSpy('finished');
            player.finished$.subscribe(finished);

            player.finish();
            await Promise.resolve();

            expect(finished).toHaveBeenCalledTimes(1);
        });

        it('reset() right after finish() does not swallow the notification', async () => {
            const player = build();
            const finished = jasmine.createSpy('finished');
            player.finished$.subscribe(finished);

            player.play();
            player.finish();
            player.reset();
            await Promise.resolve();

            expect(player.state()).toBe('idle');
            expect(finished).toHaveBeenCalledTimes(1);
        });

        it('reset() and destroy() return to idle without emitting', async () => {
            const player = build();
            const finished = jasmine.createSpy('finished');
            player.finished$.subscribe(finished);

            player.play();
            player.reset();
            expect(player.state()).toBe('idle');
            expect(element.getAnimations().length).toBe(0);

            player.play();
            player.destroy();
            expect(player.state()).toBe('idle');

            player.finish();
            await Promise.resolve();
            expect(finished).not.toHaveBeenCalled();
        });

        it('position maps to currentTime over delay plus duration and can be set before play()', () => {
            const player = build(undefined, { duration: DURATION, delay: DURATION });

            expect(player.position).toBe(0);

            player.position = 0.5;
            expect(player.position).toBeCloseTo(0.5);
            expect(player.state()).toBe('idle');
            expect(element.getAnimations()[0].currentTime).toBe(DURATION);

            player.play();
            expect(player.state()).toBe('running');
        });

        it('pause() holds the running animation', () => {
            const player = build();

            player.play();
            player.pause();

            expect(player.state()).toBe('paused');
            expect(element.getAnimations()[0].playState).toBe('paused');
        });

        it('measures auto sizes and drops undefined keyframe values', () => {
            const player = new IgxWebAnimationPlayer(element, growVerIn(), 'animate');

            player.play();

            const [from, to] = (element.getAnimations()[0].effect as KeyframeEffect).getKeyframes();
            expect(from['height']).toBe('0px');
            expect(to['height']).toBe(`${HEIGHT}px`);
            expect('paddingBlock' in to).toBeFalse();
            player.destroy();
        });
    });

    describe('skip mode', () => {
        const build = () => new IgxWebAnimationPlayer(element, fadeIn(), 'skip');

        it('never touches the DOM and finishes in a microtask', async () => {
            const player = build();
            const finished = jasmine.createSpy('finished');
            player.finished$.subscribe(finished);

            player.play();
            expect(player.state()).toBe('running');
            expect(element.getAnimations().length).toBe(0);
            expect(finished).not.toHaveBeenCalled();

            await Promise.resolve();
            expect(player.state()).toBe('finished');
            expect(finished).toHaveBeenCalledTimes(1);
        });

        it('reset() before the microtask cancels the pending finish', async () => {
            const player = build();
            const finished = jasmine.createSpy('finished');
            player.finished$.subscribe(finished);

            player.play();
            player.reset();
            await Promise.resolve();

            expect(player.state()).toBe('idle');
            expect(finished).not.toHaveBeenCalled();
        });

        it('finish() after play() emits once', async () => {
            const player = build();
            const finished = jasmine.createSpy('finished');
            player.finished$.subscribe(finished);

            player.play();
            player.finish();
            await Promise.resolve();

            expect(finished).toHaveBeenCalledTimes(1);
        });
    });
});

describe('IgxWebAnimationService', () => {
    let element: HTMLElement;

    beforeEach(() => {
        element = document.createElement('div');
        document.body.appendChild(element);
    });

    afterEach(() => element.remove());

    it('animates by default', () => {
        TestBed.configureTestingModule({ providers: [provideIgxAnimations('always')] });
        const player = TestBed.inject(IGX_ANIMATION_SERVICE).build(fadeIn, element);

        player.play();
        expect(element.getAnimations().length).toBe(1);
        player.destroy();
    });

    it('skips when animations are disabled', async () => {
        TestBed.configureTestingModule({ providers: [provideIgxNoopAnimations()] });
        const player = TestBed.inject(IGX_ANIMATION_SERVICE).build(fadeIn({ duration: 1000 }), element);

        player.play();
        await Promise.resolve();

        expect(element.getAnimations().length).toBe(0);
        expect(player.state()).toBe('finished');
    });

    it('skips when the element has no animate()', () => {
        TestBed.configureTestingModule({ providers: [provideIgxAnimations('always')] });
        const bare = {} as HTMLElement;
        const player = TestBed.inject(IGX_ANIMATION_SERVICE).build(fadeIn, bare);

        expect(() => player.play()).not.toThrow();
    });
});
