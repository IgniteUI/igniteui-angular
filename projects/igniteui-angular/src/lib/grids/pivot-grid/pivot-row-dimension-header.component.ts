import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject } from '@angular/core';

import { GridType, IGX_GRID_BASE } from '../common/grid.interface';

import { IgxGridHeaderComponent } from '../headers/grid-header.component';
import { IgxPivotColumnResizingService } from '../resizing/pivot-grid/pivot-resizing.service';
import { SortingIndexPipe } from '../headers/pipes';
import { NgTemplateOutlet, NgIf, NgClass } from '@angular/common';
import { IgxIconComponent } from '../../icon/icon.component';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row-dimension-header',
    templateUrl: '../headers/grid-header.component.html',
    standalone: true,
    imports: [IgxIconComponent, NgTemplateOutlet, NgIf, NgClass, SortingIndexPipe]
})
export class IgxPivotRowDimensionHeaderComponent extends IgxGridHeaderComponent {

    constructor(
        @Inject(IGX_GRID_BASE) grid: GridType,
        public override colResizingService: IgxPivotColumnResizingService,
        cdr: ChangeDetectorRef,
        public refInstance: ElementRef<HTMLElement>
    ) {
        super(grid, colResizingService, cdr, refInstance);
    }

    @HostListener('click', ['$event'])
    public override onClick(event: MouseEvent) {
        event.preventDefault();
    }

    public override get selectable(): boolean {
        return false;
    }
}
