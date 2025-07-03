import { inject, Injectable, NgZone, isDevMode } from '@angular/core';

function isInstrumented(): boolean {
    return window.performance && performance.measure && isDevMode();
}

@Injectable({ providedIn: 'root' })
export class PerformanceService {
    private readonly ngZone = inject(NgZone);
    private logEnabled = false;

    constructor() {
        if (isInstrumented() && !('$$clearMeasures' in window)) {
            (window as any).$$clearMeasures = () => this.clearAll();
            console.debug('`$$clearMeasures` available on the `window` object.');
        }
    }

    public setLogEnabled(state: boolean): void {
        this.logEnabled = state;
    }

    public start(name: string) {
        if (!isInstrumented) {
            return () => { };
        }

        const startMark = `${name}:start`;
        const endMark = `${name}:end`;

        this._mark(startMark);

        return () => {
            this._mark(endMark);
            this._measure(name, startMark, endMark);
        };
    }

    public getCustomMeasures(): PerformanceMeasure[] {
        return performance.getEntriesByType('measure') as PerformanceMeasure[];
    }

    public clearAllCustomMarks(): void {
        if (isInstrumented()) {
            performance.clearMarks();
            if (this.logEnabled) {
                console.debug('All custom performance marks cleared.');
            }
        }
    }

    public clearAllCustomMeasures(): void {
        if (isInstrumented()) {
            performance.clearMeasures();
            if (this.logEnabled) {
                console.debug('All custom performance measures cleared.');
            }
        }
    }

    public clearAll(): void {
        this.clearAllCustomMarks();
        this.clearAllCustomMeasures();
    }


    protected _mark(name: string): void {
        if (isInstrumented()) {
            performance.mark(name);
        }
    }

    protected _measure(name: string, startMark: string, endMark: string): void {
        if (isInstrumented()) {
            performance.measure(name, startMark, endMark);
            if (this.logEnabled) {
                const entry = performance.getEntriesByName(name).at(-1);
                console.log(`Performance Measure : ${entry.name} - Duration: ${entry.duration.toFixed(2)}ms`);
            }
        }
    }

    protected _startObservingPerformance(): void {
        const logEnabled = this.logEnabled;

        if (isInstrumented()) {
            this.ngZone.runOutsideAngular(() => {
                const observer = new PerformanceObserver((list) => {
                    if (logEnabled) {
                        for (const entry of list.getEntries()) {
                            console.log(`Performance Entry: ${entry.name} (${entry.entryType}) - Duration: ${entry.duration.toFixed(2)}ms`);
                        }
                    }
                });

                observer.observe({ entryTypes: ['navigation', 'resource', 'paint', 'longtask', 'element', 'event'] });
            });
        }
    }

    // public mark(name: string): void {
    //     performance.mark(name);
    // }

    // public measure(name: string, startMark: string, endMark: string): void {
    //     performance.measure(name, {

    //     })

    //     performance.measure(name, startMark, endMark);

    //     const entry = performance.getEntriesByName(name).pop();
    //     if (entry) {
    //         console.log(`Performance Measure: ${entry.name} - Duration: ${entry.duration.toFixed(3)}ms`);
    //     }

    //     performance.clearMarks(startMark);
    //     performance.clearMarks(endMark);
    //     performance.clearMeasures(name);
    // }
}
