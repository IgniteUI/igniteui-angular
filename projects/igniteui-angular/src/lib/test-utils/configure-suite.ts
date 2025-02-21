import { TestBed, getTestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

/**
 * Per https://github.com/angular/angular/issues/12409#issuecomment-391087831
 * Destroy fixtures after each, reset testing module after all
 *
 * @hidden
 */

export const configureTestSuite = (configureAction?: () => TestBed) => {
    const testBed = getTestBed();
    const originReset = testBed.resetTestingModule;

    const clearStyles = () => {
        document.querySelectorAll('style').forEach(tag => tag.remove());
    };

    const clearSVGContainer = () => {
        document.querySelectorAll('svg').forEach(tag => tag.remove());
    };

    beforeAll(() => {
        testBed.resetTestingModule();
        testBed.resetTestingModule = () => testBed;
        jasmine.getEnv().allowRespy(true);
    });

    if (configureAction) {
        beforeAll(waitForAsync(() => {
            configureAction().compileComponents();
        }));
    }

    afterEach(() => {
        clearStyles();
        clearSVGContainer();
        (testBed as any)._activeFixtures.forEach((fixture: ComponentFixture<any>) => {
            const element = fixture.debugElement.nativeElement as HTMLElement;
            fixture.destroy();
            // If the fixture element ID changes, then it's not properly disposed
            element?.remove();
        });
        // reset ViewEngine TestBed
        (testBed as any)._instantiated = false;
        // reset Ivy TestBed
        (testBed as any)._testModuleRef = null;
    });

    afterAll(() => {
        testBed.resetTestingModule = originReset;
        testBed.resetTestingModule();
    });
};

// TODO: enable on re-run by selecting enable debug logging
// https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/troubleshooting-workflows/enabling-debug-logging
const shardLogging = false;
if (shardLogging) {
    const myReporter = {
        suiteStarted: function(result) {
            const id = new URLSearchParams(window.parent.location.search).get('id');
            console.log(`[${id}] Suite started: ${result.fullName}`);
        },
        suiteDone: function(result) {
            const id = new URLSearchParams(window.parent.location.search).get('id');
            console.log(`[${id}] Suite: ${result.fullName} has ${result.status}`);
            for (const expectation of result.failedExpectations) {
                console.log('Suite ' + expectation.message);
                console.log(expectation.stack);
            }
            var memory = (performance as any).memory;
            console.log(`[${id}] totalJSHeapSize: ${memory['totalJSHeapSize']} usedJSHeapSize: ${memory['usedJSHeapSize']} jsHeapSizeLimit: ${memory['jsHeapSizeLimit']}`);
            if (memory['totalJSHeapSize'] >= memory['jsHeapSizeLimit'] )
                console.log( '--------------------Heap Size limit reached!!!-------------------');
        },
    };
    jasmine.getEnv().addReporter(myReporter);
}
