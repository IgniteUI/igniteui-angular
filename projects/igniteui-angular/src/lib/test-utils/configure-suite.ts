import { NgModuleRef } from '@angular/core';
import { TestBed, getTestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';

const checkLeaksAvailable = typeof window.gc === 'function';

const debug = false;
function debugLog(...args) {
    if (debug) {
        console.log(...args);
    }
}

let _skipLeakCheck = false;
const throwOnLeak = true;

interface ConfigureOptions {
    /**
     * Check for memory leaks when the tests finishes.
     * Note, this only works in Chrome configurations with expose the gc.
     * Caveats:
     *   * if there are pending (non-cancelled) timers or animation frames it may report false positives.
     *   * if there's a beforeEach create it must be cleaned up in an afterEach to avoid being detected as a leak
     */
    checkLeaks?: boolean;
}

/**
 * Per https://github.com/angular/angular/issues/12409#issuecomment-391087831
 * Destroy fixtures after each, reset testing module after all
 *
 * @hidden
 */

export const configureTestSuite = (configureActionOrOptions?: (() => TestBed) | ConfigureOptions, options: ConfigureOptions = {}) => {
    setupJasmineCurrentTest();

    const configureAction = typeof configureActionOrOptions === 'function' ? configureActionOrOptions : undefined;
    options = (configureActionOrOptions && typeof configureActionOrOptions === 'object') ? configureActionOrOptions : options;
    options.checkLeaks = options.checkLeaks && checkLeaksAvailable;

    let componentRefs: { test: string, ref: WeakRef<{}> }[];
    const moduleRefs = new Set<NgModuleRef<any>>();

    const testBed = getTestBed();
    const originReset = testBed.resetTestingModule;
    const originCreateComponent = testBed.createComponent;

    const clearStyles = () => {
        document.querySelectorAll('style').forEach(tag => tag.remove());
    };

    const clearSVGContainer = () => {
        document.querySelectorAll('svg').forEach(tag => tag.remove());
    };

    beforeAll(() => {
        testBed.resetTestingModule();
        testBed.resetTestingModule = () => {
            softResetTestingModule();
            return testBed;
        };

        if (options.checkLeaks) {
            componentRefs = [];
            testBed.createComponent = function () {
                const fixture = originCreateComponent.apply(testBed, arguments);
                if (!_skipLeakCheck) {
                    componentRefs.push({ test: jasmine['currentTest'].fullName, ref: new WeakRef(fixture.componentInstance) });
                }
                return fixture;
            };
        }

        jasmine.getEnv().allowRespy(true);
    });

    if (configureAction) {
        beforeAll(waitForAsync(() => {
            configureAction().compileComponents();
        }));
    }

    function reportLeaks() {
        gc();
        const leaks = componentRefs.map(({test, ref}) => ({ test, instance: ref.deref()})).filter(item => !!item.instance);
        if (leaks.length > 0) {
            console.warn(`Detected ${leaks.length} leaks:`);
            for (const test of new Set(leaks.map(l => l.test))) {
                const testLeaks = leaks.filter(l => l.test === test).map(l => l.instance);
                const classNames = new Set(testLeaks.map(i => i.constructor.name));
                for (const name of classNames) {
                    const count = testLeaks.filter(i => i.constructor.name === name).length;
                    console.warn(` · ${name}: ${count} - ${test}`);
                }
            }
            if (throwOnLeak) {
                throw new Error(`Detected ${leaks.length} leaks`);
            }
        } else {
            debugLog('No leaks detected');
        }
    }

    function softResetTestingModule() {
        debugLog("Soft-reset testing module");
        clearStyles();
        clearSVGContainer();
        (testBed as any)._activeFixtures.forEach((fixture: ComponentFixture<any>) => {
            const element = fixture.debugElement.nativeElement as HTMLElement;
            fixture.destroy();
            debugLog("Destroying fixture for component:", fixture.componentInstance.constructor.name);
            // If the fixture element ID changes, then it's not properly disposed
            element?.remove();
        });
        (testBed as any)._activeFixtures = [];

        // reset ViewEngine TestBed
        (testBed as any)._instantiated = false;

        // reset Ivy TestBed
        const moduleRef = testBed['_testModuleRef'];
        moduleRefs.add(moduleRef);
        testBed['_testModuleRef'] = null;
    }

    afterAll(() => {
        testBed.resetTestingModule = originReset;
        debugLog(`Destroying ${moduleRefs.size} module refs`);
        for (const moduleRef of moduleRefs) {
            testBed['_testModuleRef'] = moduleRef;
            testBed.resetTestingModule();
        }
        moduleRefs.clear();

        testBed.createComponent = originCreateComponent;
        if (options.checkLeaks) {
            reportLeaks();
        }
    });
};

/** Calls to Testbed.createComponent() inside this wrapper wont be tracked for leaks */
export function skipLeakCheck(fn: () => void | Promise<unknown>) {
    return function() {
        _skipLeakCheck = true;
        const res = fn();
        if (res instanceof Promise) {
            return res.finally(() => {
                _skipLeakCheck = false;
            });
        } else {
            _skipLeakCheck = false;
            return res;
        }
    }
}

let setupJasmineCurrentTestDone = false;
function setupJasmineCurrentTest() {
    if (!setupJasmineCurrentTestDone) {
        jasmine.getEnv().addReporter({
            specStarted(result) {
                jasmine['currentTest'] = result;
            },
            specDone(result) {
                jasmine['currentTest'] = result;
            },
        });
        setupJasmineCurrentTestDone = true;
    }
}

// TODO: enable on re-run by selecting enable debug logging
// https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/troubleshooting-workflows/enabling-debug-logging
const shardLogging = true;
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
