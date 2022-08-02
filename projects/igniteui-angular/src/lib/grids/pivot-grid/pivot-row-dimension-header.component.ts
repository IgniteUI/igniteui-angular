import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject } from '@angular/core';

import { GridType, IGX_GRID_BASE } from '../common/grid.interface';

import { IgxGridHeaderComponent } from '../headers/grid-header.component';
import { IgxPivotColumnResizingService } from '../resizing/pivot-grid/pivot-resizing.service';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row-dimension-header',
    templateUrl: '../headers/grid-header.component.html'
})
export class IgxPivotRowDimensionHeaderComponent extends IgxGridHeaderComponent {

    constructor(
        @Inject(IGX_GRID_BASE) public grid: GridType,
        public colResizingService: IgxPivotColumnResizingService,
        public cdr: ChangeDetectorRef,
        public refInstance: ElementRef<HTMLElement>
    ) {
        super(grid, colResizingService, cdr, refInstance);
    }

    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        event.preventDefault();
    }

    public get selectable(): boolean {
        return false;
    }
}
