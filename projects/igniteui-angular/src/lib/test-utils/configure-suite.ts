import { TestBed, getTestBed, ComponentFixture } from '@angular/core/testing';
import { resizeObserverIgnoreError } from './helper-utils.spec';

/**
 * Per https://github.com/angular/angular/issues/12409#issuecomment-391087831
 * Destroy fixtures after each, reset testing module after all
 *
 * @hidden
 */

export const configureTestSuite = (configureAction?: () => void) => {

    const testBed: any = getTestBed();
    const originReset = testBed.resetTestingModule;

    const clearStyles = () => {
        document.querySelectorAll('style').forEach(tag => tag.remove());
    };

    const clearSVGContainer = () => {
        document.querySelectorAll('svg').forEach(tag => tag.remove());
    };

    beforeAll(() => {
        testBed.resetTestingModule();
        testBed.resetTestingModule = () => TestBed;
        resizeObserverIgnoreError();
    });

    if (configureAction) {
        beforeAll(async () => {
            configureAction();
            await TestBed.compileComponents();
        });
    }

    afterEach(() => {
        clearStyles();
        clearSVGContainer();
        testBed._activeFixtures.forEach((fixture: ComponentFixture<any>) => {
            const element = fixture.debugElement.nativeElement;
            fixture.destroy();
            // If the fixture element ID changes, then it's not properly disposed
            document.body.removeChild(element);
        });
        // reset ViewEngine TestBed
        testBed._instantiated = false;
        // reset Ivy TestBed
        testBed._testModuleRef = null;
    });

    afterAll(() => {
        testBed.resetTestingModule = originReset;
        testBed.resetTestingModule();
    });
};
