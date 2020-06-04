import { TestBed, getTestBed, ComponentFixture, fakeAsync, flush, flushMicrotasks, resetFakeAsyncZone } from '@angular/core/testing';
import { resizeObserverIgnoreError } from './helper-utils.spec';

/**
 * Per https://github.com/angular/angular/issues/12409#issuecomment-391087831
 * Destroy fixtures after each, reset testing module after all
 * @hidden
 */
export const configureTestSuite = () => {

  let originReset;
  beforeAll(() => {
    originReset = TestBed.resetTestingModule;
    TestBed.resetTestingModule();
    TestBed.resetTestingModule = () => TestBed;
    resizeObserverIgnoreError();
  });

  afterEach(fakeAsync(() => {
    flush();
    flushMicrotasks();

    const testBedApi: any = getTestBed();
    testBedApi._activeFixtures.forEach((fixture: ComponentFixture<any>) => {
      try {
        fixture.destroy();
      } catch (e) {
        console.error('Error during cleanup of component', {
          component: fixture.componentInstance,
          stacktrace: e,
        });
      }
    });
    testBedApi._instantiated = false;
    // reset Ivy TestBed
    testBedApi._moduleRef = null;
    if (testBedApi._testModuleRef) {
      testBedApi._testModuleRef = null;
    }
  }));

  afterAll(() => {
    TestBed.resetTestingModule = originReset;
    TestBed.resetTestingModule();
  });
};
