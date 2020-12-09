import { TestBed, getTestBed, ComponentFixture } from '@angular/core/testing';
import { resizeObserverIgnoreError } from './helper-utils.spec';

/**
 * Per https://github.com/angular/angular/issues/12409#issuecomment-391087831
 * Destroy fixtures after each, reset testing module after all
 *
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

  function clearStyles() {
    const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
    const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
    for (let index = 0; index < styles.length; index++) {
      head.removeChild(styles[index]);
    }
  }
  afterEach(() => {
    const testBedApi: any = getTestBed();
    testBedApi._activeFixtures.forEach((fixture: ComponentFixture<any>) => {
      try {
        fixture.destroy();
      } catch (e) {
        console.error('Error: during cleanup of component', {
          component: fixture.componentInstance,
          stacktrace: e,
        });
      }
    });
    testBedApi._activeFixtures = [];
    testBedApi._instantiated = false;
    // reset Ivy TestBed
    if (testBedApi._testModuleRef) {
      testBedApi._testModuleRef = null;
    }
  });

  afterAll(() => {
    clearStyles();
    TestBed.resetTestingModule = originReset;
    TestBed.resetTestingModule();
  });
};
