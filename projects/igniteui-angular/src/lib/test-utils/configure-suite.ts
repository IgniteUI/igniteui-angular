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

  const clearStyles = () => {
    const head = document.getElementsByTagName('head')[0];
    const styles = head.getElementsByTagName('style');
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < styles.length; index++) {
      head.removeChild(styles[index]);
    }
  };

  /** Clear the svg tags from the svgContainer created by the IconService
    to avoid increasing their count to over 10000. */
  const clearSVGContainer = () => {
    document.querySelectorAll('svg').forEach((tag) => tag.remove());
  };

  afterEach(() => {
    clearSVGContainer();
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
