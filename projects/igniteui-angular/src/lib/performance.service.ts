import { inject, Injectable, NgZone, isDevMode } from '@angular/core';


interface igcPerformance {
    startMeasure: typeof startMeasure;
    getMeasures: typeof getMeasures;
    clearMeasures: typeof clearMeasures,
    clearAll: typeof clearAll
}

declare global {
    var $$igcPerformance: igcPerformance;
}

function isInstrumented(): boolean {
    return globalThis.performance && performance.measure && isDevMode();
}

function instrumentGlobalHelpers(): void {
    if (!isInstrumented() || Object.hasOwn(globalThis, '$$igcPerformance')) {
        return;
    }

    globalThis.$$igcPerformance = {
        startMeasure,
        getMeasures,
        clearMeasures,
        clearAll,
    };

    console.debug('Performance helper functions attached @ `global.$$igcPerformance`');

}

export function startMeasure(name: string, withLogging = false) {
    if (!isInstrumented()) return () => { };

    const startMark = `${name}:start`;
    const endMark = `${name}:end`;

    performance.mark(startMark);

    return () => {
        performance.mark(endMark);
        performance.measure(name, startMark, endMark);
        if (withLogging) {
            const entry = performance.getEntriesByName(name).at(-1);
            console.debug(`Performance Measure : ${entry.name} - Duration: ${entry.duration.toFixed(2)}ms`);
        }
    };
}

export function getMeasures(name?: string): PerformanceEntryList {
    return name ? performance.getEntriesByName(name) : performance.getEntriesByType('measure');
}

export function clearMeasures(name?: string, withLogging = false): void {
    performance.clearMeasures(name);
    if (withLogging) {
        console.debug(name ? 'Cleared all measures of type `${name}`' : 'Cleared all custom measures');
    }
}

export function clearAll(withLogging = false): void {
    performance.clearMarks();
    clearMeasures();
    if (withLogging) {
        console.debug('Cleared all marks and custom measures');
    }
}

@Injectable({ providedIn: 'root' })
export class PerformanceService {
    private readonly _ngZone = inject(NgZone);
    private _logEnabled = false;

    constructor() {
        instrumentGlobalHelpers();
    }

    public setLogEnabled(state: boolean): void {
        this._logEnabled = state;
    }

    public start(name: string) {
        return startMeasure(name, this._logEnabled);
    }

    public getMeasures(name?: string): PerformanceEntryList {
        return getMeasures(name);
    }

    public clearMeasures(name?: string): void {
        clearMeasures(name, this._logEnabled);
    }

    public clearAll(): void {
        clearAll(this._logEnabled);
    }

    public attachObserver(options?: PerformanceObserverInit) {
        if (!isInstrumented()) return;
        let observer: PerformanceObserver;

        options = options ?? { entryTypes: ['event', 'long-animation-frame', 'longtask', 'taskattribution'] };

        this._ngZone.runOutsideAngular(() => {
            observer = new PerformanceObserver((list) => {
                if (this._logEnabled) {
                    for (const entry of list.getEntries()) {
                        console.debug(`Performance Entry: ${entry.name} (${entry.entryType}) - Duration: ${entry.duration.toFixed(2)}ms`);
                    }
                }
            });

            observer.observe(options);
        });

        return () => {
            observer.disconnect();
        };
    }
}
