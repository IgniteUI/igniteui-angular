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
        jasmine.getEnv().addReporter(myReporter);
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

const myReporter = {
    jasmineStarted: function(suiteInfo) {
      console.log('Running suite with ' + suiteInfo.totalSpecsDefined);
    },
  
    suiteStarted: function(result) {
      console.log('Suite started: ' + result.description + 'at: ' + window.location
        + ' whose full description is: ' + result.fullName);

    },
  
    suiteDone: function(result) {
      console.log('Suite: ' + result.description + ' was ' + result.status);
      for (const expectation of result.failedExpectations) {
        console.log('Suite ' + expectation.message);
        console.log(expectation.stack);
      }
        var memory = (performance as any).memory;
        console.log(`totalJSHeapSize: ${memory['totalJSHeapSize']} usedJSHeapSize: ${memory['usedJSHeapSize']} jsHeapSizeLimit: ${memory['jsHeapSizeLimit']}`);
        if (memory['totalJSHeapSize'] >= memory['jsHeapSizeLimit'] )
            console.log( '--------------------Heap Size limit reached!!!-------------------');
    },
  
    jasmineDone: function(result) {
      console.log('Finished suite: ' + result.overallStatus);
      for (const expectation of result.failedExpectations) {
        console.log('Global ' + expectation.message);
        console.log(expectation.stack);
      }
    }
  };
