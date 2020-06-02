import { DebugElement, EventEmitter, NgZone, Injectable } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { ComponentFixture } from '@angular/core/testing';
import { IgxGridBaseDirective } from '../grids/public_api';
import { IgxHierarchicalGridComponent } from '../grids/hierarchical-grid';

export function resizeObserverIgnoreError() {
    jasmine.getEnv().allowRespy(true);
    const spy = spyOn(window, 'onerror').and.callFake((...args) => {
        if (args[0].toString().match('ResizeObserver loop limit exceeded')) {
            return;
        }
        spy.and.callThrough().withArgs(...args);
    });
    return spy;
}

export function setupGridScrollDetection(fixture: ComponentFixture<any>, grid: IgxGridBaseDirective) {
    grid.verticalScrollContainer.onChunkLoad.subscribe(() => fixture.detectChanges());
    grid.parentVirtDir.onChunkLoad.subscribe(() => fixture.detectChanges());
}

export function setupHierarchicalGridScrollDetection(fixture: ComponentFixture<any>, hierarchicalGrid: IgxHierarchicalGridComponent) {
    setupGridScrollDetection(fixture, hierarchicalGrid);

    const existingChildren = hierarchicalGrid.hgridAPI.getChildGrids(true);
    existingChildren.forEach(child => setupGridScrollDetection(fixture, child));

    const layouts = hierarchicalGrid.allLayoutList.toArray();
    layouts.forEach((layout) => {
        layout.onGridCreated.subscribe(evt => {
            setupGridScrollDetection(fixture, evt.grid);
        });
    });
}

@Injectable()
export class TestNgZone extends NgZone {
    onStable: EventEmitter<any> = new EventEmitter(false);

    constructor() {
        super({enableLongStackTrace: false, shouldCoalesceEventChangeDetection: false});
    }

    run(fn: Function): any {
        return fn();
    }

    runOutsideAngular(fn: Function): any {
        return fn();
    }

    simulateOnStable(): void {
        this.onStable.emit(null);
    }
}
