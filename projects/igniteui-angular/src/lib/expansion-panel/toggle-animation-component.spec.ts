import { AnimationBuilder } from '@angular/animations';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { noop } from 'rxjs';
import { growVerIn, growVerOut } from '../animations/main';
import { configureTestSuite } from '../test-utils/configure-suite';
import { ToggleAnimationPlayer ,ANIMATION_TYPE } from './toggle-animation-component';

class MockTogglePlayer extends ToggleAnimationPlayer {
    constructor(protected builder: AnimationBuilder) {
        super(builder);
    }
}

describe('Toggle animation component', () => {
    configureTestSuite();
    const mockBuilder = jasmine.createSpyObj<any>('mockBuilder', ['build'], {});
    beforeAll(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule
            ]
        }).compileComponents();
    });
    describe('Unit tests', () => {
        it('Should initialize player with give settings', () => {
            const player = new MockTogglePlayer(mockBuilder);
            const startPlayerSpy = spyOn<any>(player, 'startPlayer');
            const mockEl = jasmine.createSpyObj('mockRef', ['focus'], {});
            player.playOpenAnimation(mockEl);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.OPEN, mockEl, noop);
            player.playCloseAnimation(mockEl);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.CLOSE, mockEl, noop);
            const mockCB = () => {};
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
            const player = new MockTogglePlayer(mockBuilder);
            expect(player.animationSettings).toEqual({
                openAnimation: growVerIn,
                closeAnimation: growVerOut
            });
            player.animationSettings = null;
            expect(player.animationSettings).toEqual(null);
        });

        it('Should not throw if called with a falsy animationSettings value', () => {
            const player = new MockTogglePlayer(mockBuilder);
            player.animationSettings = null;
            const mockCb = jasmine.createSpy('mockCb');
            const mockElement = jasmine.createSpy('element');
            spyOn(player.openAnimationStart, 'emit');
            spyOn(player.openAnimationDone, 'emit');
            spyOn(player.closeAnimationStart, 'emit');
            spyOn(player.closeAnimationDone, 'emit');

            player.playOpenAnimation({ nativeElement: mockElement }, mockCb);
            expect(player.openAnimationStart.emit).toHaveBeenCalledTimes(1);
            expect(player.openAnimationDone.emit).toHaveBeenCalledTimes(1);
            expect(player.closeAnimationStart.emit).toHaveBeenCalledTimes(0);
            expect(player.closeAnimationDone.emit).toHaveBeenCalledTimes(0);
            expect(player.openAnimationStart.emit).toHaveBeenCalledBefore(player.openAnimationDone.emit);
            expect(mockCb).toHaveBeenCalledTimes(1);

            player.playCloseAnimation({ nativeElement: mockElement }, mockCb);
            expect(player.openAnimationStart.emit).toHaveBeenCalledTimes(1);
            expect(player.openAnimationDone.emit).toHaveBeenCalledTimes(1);
            expect(player.closeAnimationStart.emit).toHaveBeenCalledTimes(1);
            expect(player.closeAnimationDone.emit).toHaveBeenCalledTimes(1);
            expect(player.closeAnimationStart.emit).toHaveBeenCalledBefore(player.closeAnimationDone.emit);

            expect(mockCb).toHaveBeenCalledTimes(2);
        });
    });
});
