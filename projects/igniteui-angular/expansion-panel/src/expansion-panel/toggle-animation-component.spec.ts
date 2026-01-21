import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { noop } from 'rxjs';
import { IgxAngularAnimationService } from 'igniteui-angular/core';
import { ANIMATION_TYPE, ToggleAnimationPlayer } from './toggle-animation-component';
import { growVerIn, growVerOut } from 'igniteui-angular/animations';

class MockTogglePlayer extends ToggleAnimationPlayer {
}

describe('Toggle animation component', () => {
    const mockBuilder = {
        build: vi.fn().mockName("mockBuilder.build")
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule
            ],
            providers: [
                { provide: IgxAngularAnimationService, useValue: mockBuilder },
                MockTogglePlayer
            ]
        }).compileComponents();
    });
    describe('Unit tests', () => {
        it('Should initialize player with give settings', () => {
            const player = TestBed.inject(MockTogglePlayer);
            const startPlayerSpy = vi.spyOn<any>(player, 'startPlayer');
            const mockEl = {
                focus: vi.fn().mockName("mockRef.focus")
            };
            player.playOpenAnimation(mockEl);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.OPEN, mockEl, noop);
            player.playCloseAnimation(mockEl);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.CLOSE, mockEl, noop);
            const mockCB = () => { };
            player.playOpenAnimation(mockEl, mockCB);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.OPEN, mockEl, mockCB);
            player.playCloseAnimation(mockEl, mockCB);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.CLOSE, mockEl, mockCB);
            player.playOpenAnimation(null, mockCB);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.OPEN, null, mockCB);
            player.playCloseAnimation(null, mockCB);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.CLOSE, null, mockCB);
        });

        it('Should allow overwriting animation setting with falsy value', () => {
            const player = TestBed.inject(MockTogglePlayer);
            expect(player.animationSettings).toEqual({
                openAnimation: growVerIn,
                closeAnimation: growVerOut
            });
            player.animationSettings = null;
            expect(player.animationSettings).toEqual(null);
        });

        it('Should not throw if called with a falsy animationSettings value', () => {
            const player = TestBed.inject(MockTogglePlayer);
            player.animationSettings = null;
            const mockCb = vi.fn();
            const mockElement = vi.fn();
            vi.spyOn(player.openAnimationStart, 'emit');
            vi.spyOn(player.openAnimationDone, 'emit');
            vi.spyOn(player.closeAnimationStart, 'emit');
            vi.spyOn(player.closeAnimationDone, 'emit');

            player.playOpenAnimation({ nativeElement: mockElement }, mockCb);
            expect(player.openAnimationStart.emit).toHaveBeenCalledTimes(1);
            expect(player.openAnimationDone.emit).toHaveBeenCalledTimes(1);
            expect(player.closeAnimationStart.emit).toHaveBeenCalledTimes(0);
            expect(player.closeAnimationDone.emit).toHaveBeenCalledTimes(0);
            expect(Math.min(...vi.mocked(player.openAnimationStart.emit).mock.invocationCallOrder)).toBeLessThan(Math.min(...vi.mocked(player.openAnimationDone.emit).mock.invocationCallOrder));
            expect(mockCb).toHaveBeenCalledTimes(1);

            player.playCloseAnimation({ nativeElement: mockElement }, mockCb);
            expect(player.openAnimationStart.emit).toHaveBeenCalledTimes(1);
            expect(player.openAnimationDone.emit).toHaveBeenCalledTimes(1);
            expect(player.closeAnimationStart.emit).toHaveBeenCalledTimes(1);
            expect(player.closeAnimationDone.emit).toHaveBeenCalledTimes(1);
            expect(Math.min(...vi.mocked(player.closeAnimationStart.emit).mock.invocationCallOrder)).toBeLessThan(Math.min(...vi.mocked(player.closeAnimationDone.emit).mock.invocationCallOrder));

            expect(mockCb).toHaveBeenCalledTimes(2);
        });
    });
});
