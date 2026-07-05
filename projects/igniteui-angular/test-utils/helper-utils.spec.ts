import { EventEmitter, NgZone, Injectable } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { GridType } from 'igniteui-angular/grids/core';
import { IgxHierarchicalGridComponent } from 'igniteui-angular/grids/hierarchical-grid';
import { firstValueFrom, Subscription } from 'rxjs';
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

/**
 * Intentional no-op counterpart of {@link setupGridScrollDetection} for zoneless tests.
 * The zoned helper subscribes to grid events and forces `detectChanges()`; a zoneless
 * consumer must not do that, so these tests rely on the grid's own change detection and
 * await `whenStable()`/a settle helper instead. Kept so zoneless specs can mirror the
 * zoned setup call site without special-casing it.
 */
export const setupGridScrollDetectionZoneless = (_fixture: ComponentFixture<any>, _grid: GridType) => {
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

/** Intentional no-op counterpart of {@link setupHierarchicalGridScrollDetection}; see {@link setupGridScrollDetectionZoneless}. */
export const setupHierarchicalGridScrollDetectionZoneless = (_fixture: ComponentFixture<any>, _hierarchicalGrid: IgxHierarchicalGridComponent) => {
};

export const clearGridSubs = () => {
    gridsubscriptions.forEach(sub => sub.unsubscribe());
    gridsubscriptions = [];
}

const waitFor = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export interface GridScrollEventOptions {
    waitMs?: number;
    waitForChunkLoad?: boolean;
}

export const dispatchGridVerticalScroll = async (
    fixture: ComponentFixture<any>,
    grid: GridType,
    options: GridScrollEventOptions = {}
) => {
    const { waitMs = 60, waitForChunkLoad = false } = options;
    const chunkLoad = waitForChunkLoad ? firstValueFrom(grid.verticalScrollContainer.chunkLoad) : null;
    grid.verticalScrollContainer.getScroll().dispatchEvent(new Event('scroll'));
    await waitFor(waitMs);
    fixture.detectChanges();
    await chunkLoad;
};

export const dispatchGridHorizontalScroll = async (
    fixture: ComponentFixture<any>,
    grid: GridType,
    options: GridScrollEventOptions = {}
) => {
    const { waitMs = 60, waitForChunkLoad = false } = options;
    const chunkLoad = waitForChunkLoad ? firstValueFrom(grid.parentVirtDir.chunkLoad) : null;
    grid.headerContainer.getScroll().dispatchEvent(new Event('scroll'));
    await waitFor(waitMs);
    fixture.detectChanges();
    await chunkLoad;
};

export const dispatchGridScrollEvents = async (
    fixture: ComponentFixture<any>,
    grid: GridType,
    options: GridScrollEventOptions = {}
) => {
    await dispatchGridVerticalScroll(fixture, grid, options);
    await dispatchGridHorizontalScroll(fixture, grid, options);
};

/**
 * Simulates a grid-content keyboard navigation that scrolls the grid, and resolves once
 * the resulting `activeNodeChange` has fired.
 *
 * The `activeNodeChange` subscription is created before the keydown so a synchronous emit
 * is not missed; the dispatched scroll events (plus their change detection) drive the
 * deferred post-render work — the scrolled-in row/cell renders and the navigation
 * continuation activates the target cell — without racing a fixed delay.
 *
 * @param axis which scroll direction(s) the navigation triggers; use `'vertical'` for
 * up/down navigation and `'both'` (default) for Home/End/Ctrl combinations that can also
 * scroll horizontally.
 */
export const navigateWithGridScroll = async (
    fixture: ComponentFixture<any>,
    grid: GridType,
    key: string,
    { ctrlKey = false, axis = 'both', waitMs = 60 }: { ctrlKey?: boolean; axis?: 'vertical' | 'both'; waitMs?: number } = {}
): Promise<void> => {
    const activeNodeChange = firstValueFrom(grid.activeNodeChange);
    GridFunctions.simulateGridContentKeydown(fixture, key, false, false, ctrlKey);
    if (axis === 'vertical') {
        await dispatchGridVerticalScroll(fixture, grid, { waitMs });
    } else {
        await dispatchGridScrollEvents(fixture, grid, { waitMs });
    }
    await activeNodeChange;
    fixture.detectChanges();
};

/**
 * Sets the grid's vertical scroll position and resolves once the resulting `chunkLoad`
 * has fired, running change-detection passes while waiting. The `chunkLoad` subscription
 * is created before the scroll to avoid missing a synchronous emit, and the interleaved
 * renders let the (deferred) emit run without racing a fixed delay.
 */
export const setGridVerticalScrollTop = async (
    fixture: ComponentFixture<any>,
    grid: GridType,
    scrollTop: number,
    { maxAttempts = 30, intervalMs = 20 }: { maxAttempts?: number; intervalMs?: number } = {}
): Promise<void> => {
    const chunkLoad = firstValueFrom(grid.verticalScrollContainer.chunkLoad);
    let loaded = false;
    void chunkLoad.then(() => {
        loaded = true;
    });
    grid.verticalScrollContainer.getScroll().scrollTop = scrollTop;
    for (let attempt = 0; attempt < maxAttempts && !loaded; attempt++) {
        await new Promise<void>(resolve => setTimeout(resolve, intervalMs));
        fixture.detectChanges();
        await fixture.whenStable();
    }
    await chunkLoad;
    fixture.detectChanges();
};

/**
 * Polls until `predicate` returns truthy or the attempt budget is exhausted, running a
 * change-detection pass on every tick. Use it for interactions whose visible result
 * settles over several asynchronous render passes — e.g. keyboard navigation that first
 * scrolls a virtualized grid and only then activates/selects the target cell — instead
 * of a single fixed `wait(...)` that races the render cascade.
 */
export const waitForGridSettle = async (
    fixture: ComponentFixture<any>,
    predicate: () => boolean,
    { maxAttempts = 20, intervalMs = 50 }: { maxAttempts?: number; intervalMs?: number } = {}
): Promise<void> => {
    for (let attempt = 0; attempt < maxAttempts && !predicate(); attempt++) {
        await new Promise<void>(resolve => setTimeout(resolve, intervalMs));
        fixture.detectChanges();
        await fixture.whenStable();
    }
};

/**
 * Waits until the grid's vertical scroll position stops changing between animation
 * frames. Variable-size virtualization corrects its size estimates over several
 * render + scroll cycles, which zoneless tests must await instead of forcing
 * change detection from grid events.
 */
export const settleGridScroll = async (fixture: ComponentFixture<any>, grid: GridType, maxFrames = 20) => {
    let stableFrames = 0;
    let previousTop = Number.NaN;
    while (maxFrames-- > 0 && stableFrames < 2) {
        const currentTop = grid.verticalScrollContainer.getScroll().scrollTop;
        stableFrames = currentTop === previousTop ? stableFrames + 1 : 0;
        previousTop = currentTop;
        await new Promise<void>(resolve => setTimeout(resolve, 32));
        await fixture.whenStable();
    }
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
