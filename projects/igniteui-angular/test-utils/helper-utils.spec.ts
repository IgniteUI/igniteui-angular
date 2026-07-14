import { EventEmitter, NgZone, Injectable } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { GridType, IGridScrollEventArgs } from 'igniteui-angular/grids/core';
import { IgxHierarchicalGridComponent } from 'igniteui-angular/grids/hierarchical-grid';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { GridFunctions } from './grid-functions.spec';

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
    gridsubscriptions.push(grid.activeNodeChange.subscribe(() => grid.cdr.detectChanges()));
    gridsubscriptions.push(grid.selected.subscribe(() => grid.cdr.detectChanges()));
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

export type GridScrollDirection = 'vertical' | 'horizontal';

/**
 * Resolves after a real grid scroll event and its deferred chunk render complete.
 * Call this before the interaction that causes the scroll so neither event is missed.
 * Existing ZoneJS fixtures require one explicit render between those boundaries.
 */
export const waitForGridScroll = async (
    fixture: ComponentFixture<any>,
    grid: GridType,
    direction: GridScrollDirection
): Promise<void> => {
    const scrollEvent = firstValueFrom(grid.gridScroll.pipe(
        filter((event: IGridScrollEventArgs) => event.direction === direction)
    ));
    const chunkLoad = firstValueFrom(
        direction === 'vertical' ? grid.verticalScrollContainer.chunkLoad : grid.parentVirtDir.chunkLoad
    );

    await scrollEvent;
    fixture.detectChanges();
    await chunkLoad;
};

/**
 * Runs a grid navigation and resolves once the resulting `activeNodeChange` has fired.
 *
 * The `activeNodeChange` subscription is created before the keydown so a synchronous emit
 * is not missed. Real scroll events drive the fixture render needed for deferred
 * post-render work without requiring the test to predict whether or which axis scrolls.
 */
export const waitForGridNavigation = async (
    fixture: ComponentFixture<any>,
    grid: GridType,
    navigate: () => void
): Promise<void> => {
    const scrollSubscription = grid.gridScroll.subscribe(() => fixture.detectChanges());
    const activeNodeChange = firstValueFrom(grid.activeNodeChange);

    try {
        navigate();
        await activeNodeChange;
        fixture.detectChanges();
    } finally {
        scrollSubscription.unsubscribe();
    }
};

/** Simulates keyboard navigation and waits for its final active-node update. */
export const navigateWithGridScroll = async (
    fixture: ComponentFixture<any>,
    grid: GridType,
    key: string,
    { ctrlKey = false }: { ctrlKey?: boolean } = {}
): Promise<void> => {
    await waitForGridNavigation(
        fixture,
        grid,
        () => GridFunctions.simulateGridContentKeydown(fixture, key, false, false, ctrlKey)
    );
};

/** Sets vertical scroll position and resolves after its grid scroll processing completes. */
export const setGridVerticalScrollTop = async (
    fixture: ComponentFixture<any>,
    grid: GridType,
    scrollTop: number
): Promise<void> => {
    const scroll = waitForGridScroll(fixture, grid, 'vertical');
    grid.verticalScrollContainer.getScroll().scrollTop = scrollTop;
    await scroll;
    await fixture.whenStable();
    // Keep consecutive programmatic scrolls in separate browser frames.
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
};

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

/**
 * Removes any unicode symbols for different variations in spaces.
 * Use when just comparing to basic string wouldn't work.
 */
export function removeUnicodeSpaces(value: string) {
    return value.replace(/[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g, ' ');
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

/* eslint-disable no-console */
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
