import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { noop, Subject } from 'rxjs';
import { IgxAngularAnimationService } from 'igniteui-angular/core';
import { ANIMATION_TYPE, ToggleAnimationPlayer } from './toggle-animation-component';
import { growVerIn, growVerOut } from 'igniteui-angular/animations';

class MockTogglePlayer extends ToggleAnimationPlayer {
}

describe('Toggle animation component', () => {
    const mockBuilder = jasmine.createSpyObj<any>('mockBuilder', ['build'], {});
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

describe('Toggle animation component change detection', () => {
    let animationEnd: Subject<void>;
    let calls: string[];
    let mockPlayer: any;
    let mockCdr: { detectChanges: jasmine.Spy };

    beforeEach(() => {
        animationEnd = new Subject<void>();
        calls = [];
        mockPlayer = {
            animationEnd,
            position: 0,
            init: jasmine.createSpy('init'),
            play: jasmine.createSpy('play'),
            hasStarted: jasmine.createSpy('hasStarted').and.returnValue(false),
            reset: jasmine.createSpy('reset').and.callFake(() => calls.push('reset')),
            destroy: jasmine.createSpy('destroy')
        };
        mockCdr = { detectChanges: jasmine.createSpy('detectChanges').and.callFake(() => calls.push('detectChanges')) };
        TestBed.configureTestingModule({
            providers: [
                { provide: IgxAngularAnimationService, useValue: { buildAnimation: () => mockPlayer } },
                { provide: ChangeDetectorRef, useValue: mockCdr },
                MockTogglePlayer
            ]
        });
    });

    it('Should render the owner after the close callback and before the close player is reset', () => {
        const player = TestBed.inject(MockTogglePlayer);
        player.closeAnimationDone.subscribe(() => calls.push('closeAnimationDone'));

        player.playCloseAnimation({ nativeElement: {} } as ElementRef, () => calls.push('onDone'));
        expect(mockCdr.detectChanges).not.toHaveBeenCalled();
        animationEnd.next();

        expect(calls).toEqual(['onDone', 'closeAnimationDone', 'detectChanges', 'reset']);
    });

    it('Should not render the owner when the open animation is done', () => {
        const player = TestBed.inject(MockTogglePlayer);

        player.playOpenAnimation({ nativeElement: {} } as ElementRef);
        animationEnd.next();

        expect(mockPlayer.reset).toHaveBeenCalled();
        expect(mockCdr.detectChanges).not.toHaveBeenCalled();
    });

    it('Should not render the owner when the close animation is done after it is destroyed', () => {
        const player = TestBed.inject(MockTogglePlayer);

        player.playCloseAnimation({ nativeElement: {} } as ElementRef);
        player.ngOnDestroy();
        animationEnd.next();

        expect(mockCdr.detectChanges).not.toHaveBeenCalled();
    });
});
