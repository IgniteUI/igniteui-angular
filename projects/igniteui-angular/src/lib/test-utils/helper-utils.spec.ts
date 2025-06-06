import { EventEmitter, NgZone, Injectable } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { IgxHierarchicalGridComponent } from '../grids/hierarchical-grid/public_api';
import { GridType } from '../grids/common/grid.interface';
import { Subscription } from 'rxjs';

/**
 * Global beforeEach and afterEach checks to ensure test fails on specific warnings
 * Use direct env because karma-parallel's wrap ignores these in secondary shards
 * https://github.com/joeljeske/karma-parallel/issues/64
 */
(jasmine.getEnv() as any).beforeEach(() => {
    spyOn(console, 'warn').and.callThrough();
});

(jasmine.getEnv() as any).afterEach(() => {
    expect(console.warn)
        .withContext('Components & tests should be free of @for track duplicated keys warnings')
        .not.toHaveBeenCalledWith(jasmine.stringContaining('NG0955'));
    expect(console.warn)
        .withContext('Components & tests should be free of @for track DOM re-creation warnings')
        .not.toHaveBeenCalledWith(jasmine.stringContaining('NG0956'));
});


export let gridsubscriptions: Subscription [] = [];

export const setupGridScrollDetection = (fixture: ComponentFixture<any>, grid: GridType) => {
    gridsubscriptions.push(grid.verticalScrollContainer.chunkLoad.subscribe(() => fixture.detectChanges()));
    gridsubscriptions.push(grid.parentVirtDir.chunkLoad.subscribe(() => fixture.detectChanges()));
};

export const setupHierarchicalGridScrollDetection = (fixture: ComponentFixture<any>, hierarchicalGrid: IgxHierarchicalGridComponent) => {
    setupGridScrollDetection(fixture, hierarchicalGrid);

    const existingChildren = hierarchicalGrid.gridAPI.getChildGrids(true);
    existingChildren.forEach(child => setupGridScrollDetection(fixture, child));

    const layouts = hierarchicalGrid.allLayoutList.toArray();
    layouts.forEach((layout) => {
        gridsubscriptions.push(layout.gridCreated.subscribe(evt => {
            setupGridScrollDetection(fixture, evt.grid);
        }));
    });
};

export const clearGridSubs = () => {
    gridsubscriptions.forEach(sub => sub.unsubscribe());
    gridsubscriptions = [];
}

/**
 * Sets element size as a inline style
 */
export function setElementSize(element: HTMLElement, size: string) {
    element.style.setProperty('--ig-size', size);
}

/**
 * Checks if an element contains a given class and compares it with the expected result.
 */
export function hasClass(element: HTMLElement, className: string, expected: boolean) {
    expect(element.classList.contains(className)).toBe(expected);
}

type YMD = `${string}-${string}-${string}`;

/** Convert a YMD string to local timezone date */
export function ymd(str: YMD): Date {
    return new Date(str + 'T00:00');
}


@Injectable()
export class TestNgZone extends NgZone {
    public override onStable: EventEmitter<any> = new EventEmitter(false);

    constructor() {
        super({enableLongStackTrace: false, shouldCoalesceEventChangeDetection: false});
    }

    public override run(fn: () => void): any {
        return fn();
    }

    public override runOutsideAngular(fn: () => void): any {
        return fn();
    }

    public simulateOnStable(): void {
        this.onStable.emit(null);
    }
}

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
