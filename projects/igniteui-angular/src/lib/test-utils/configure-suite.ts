import { TestBed, getTestBed, ComponentFixture } from '@angular/core/testing';
import { resizeObserverIgnoreError } from './helper-utils.spec';
import { UIInteractions } from './ui-interactions.spec';

/**
 * Per https://github.com/angular/angular/issues/12409#issuecomment-391087831
 * Destroy fixtures after each, reset testing module after all
 * @hidden
 */


const resetTestingModule = TestBed.resetTestingModule,
    preventAngularFromResetting = () => TestBed.resetTestingModule = () => TestBed;
const allowAngularToReset = () => TestBed.resetTestingModule = resetTestingModule;

export const configureTestSuite = (configureAction: () => void) => {
    const testBedApi: any = getTestBed();
    // const originReset = TestBed.resetTestingModule;

    beforeAll((done: DoneFn) => (async () => {
        resetTestingModule();
        preventAngularFromResetting();
        configureAction();
        await TestBed.compileComponents();
        TestBed.resetTestingModule = () => TestBed;
        resizeObserverIgnoreError();
    })().then(done).catch(done.fail));

    afterEach(() => {
        UIInteractions.clearOverlay();
        testBedApi._activeFixtures.forEach((fixture: ComponentFixture<any>) => fixture.destroy());
        testBedApi._instantiated = false;
    });

    afterAll(() => {
        allowAngularToReset();
    });
};
