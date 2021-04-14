import { AnimationBuilder } from '@angular/animations';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { noop } from 'rxjs';
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
            const mockCB = () => console.log('mock');
            player.playOpenAnimation(mockEl, mockCB);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.OPEN, mockEl, mockCB);
            player.playCloseAnimation(mockEl, mockCB);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.CLOSE, mockEl, mockCB);
            player.playOpenAnimation(null, mockCB);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.OPEN, null, mockCB);
            player.playCloseAnimation(null, mockCB);
            expect(startPlayerSpy).toHaveBeenCalledWith(ANIMATION_TYPE.CLOSE, null, mockCB);
        });
    });
});
