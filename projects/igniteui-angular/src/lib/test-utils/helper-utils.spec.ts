import { EventEmitter, NgZone, Injectable } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { IgxHierarchicalGridComponent } from '../grids/hierarchical-grid/public_api';
import { GridType } from '../grids/common/grid.interface';
import { Subscription } from 'rxjs';

/**
 * Global beforeEach and afterEach checks to ensure test fails on specific warnings
 */
beforeEach(() => {
    spyOn(console, 'warn').and.callThrough();
});

afterEach(() => {
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
