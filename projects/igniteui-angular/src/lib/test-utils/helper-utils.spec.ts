import { EventEmitter, NgZone, Injectable } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { IgxHierarchicalGridComponent } from '../grids/hierarchical-grid/public_api';
import { GridType } from '../grids/common/grid.interface';

export const resizeObserverIgnoreError = () => {
    jasmine.getEnv().allowRespy(true);
    const spy = spyOn(window, 'onerror').and.callFake((...args) => {
        if (args[0].toString().match('ResizeObserver loop limit exceeded')) {
            return;
        }
        spy.and.callThrough().withArgs(...args);
    });
    return spy;
};

export const setupGridScrollDetection = (fixture: ComponentFixture<any>, grid: GridType) => {
    grid.verticalScrollContainer.chunkLoad.subscribe(() => fixture.detectChanges());
    grid.parentVirtDir.chunkLoad.subscribe(() => fixture.detectChanges());
};

export const setupHierarchicalGridScrollDetection = (fixture: ComponentFixture<any>, hierarchicalGrid: IgxHierarchicalGridComponent) => {
    setupGridScrollDetection(fixture, hierarchicalGrid);

    const existingChildren = hierarchicalGrid.gridAPI.getChildGrids(true);
    existingChildren.forEach(child => setupGridScrollDetection(fixture, child));

    const layouts = hierarchicalGrid.allLayoutList.toArray();
    layouts.forEach((layout) => {
        layout.gridCreated.subscribe(evt => {
            setupGridScrollDetection(fixture, evt.grid);
        });
    });
};

@Injectable()
export class TestNgZone extends NgZone {
    public onStable: EventEmitter<any> = new EventEmitter(false);

    constructor() {
        super({enableLongStackTrace: false, shouldCoalesceEventChangeDetection: false});
    }

    public run(fn: () => void): any {
        return fn();
    }

    public runOutsideAngular(fn: () => void): any {
        return fn();
    }

    public simulateOnStable(): void {
        this.onStable.emit(null);
    }
}
