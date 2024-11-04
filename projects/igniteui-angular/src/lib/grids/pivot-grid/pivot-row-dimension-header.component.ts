import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject } from '@angular/core';

import { GridType, IGX_GRID_BASE, PivotGridType } from '../common/grid.interface';

import { IgxGridHeaderComponent } from '../headers/grid-header.component';
import { IgxPivotColumnResizingService } from '../resizing/pivot-grid/pivot-resizing.service';
import { SortingIndexPipe } from '../headers/pipes';
import { NgTemplateOutlet, NgIf, NgClass } from '@angular/common';
import { IgxIconComponent } from '../../icon/icon.component';
import { ISortingExpression, SortingDirection } from '../../data-operations/sorting-strategy';
import { takeUntil } from 'rxjs/operators';
import { PivotRowLayoutType } from './pivot-grid.interface';
import { PivotUtil } from './pivot-util';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row-dimension-header',
    templateUrl: '../headers/grid-header.component.html',
    imports: [IgxIconComponent, NgTemplateOutlet, NgIf, NgClass, SortingIndexPipe]
})
export class IgxPivotRowDimensionHeaderComponent extends IgxGridHeaderComponent implements AfterViewInit {
    private pivotGrid: PivotGridType;

    constructor(
        @Inject(IGX_GRID_BASE) grid: GridType,
        public override colResizingService: IgxPivotColumnResizingService,
        cdr: ChangeDetectorRef,
        public refInstance: ElementRef<HTMLElement>
    ) {
        super(grid, colResizingService, cdr, refInstance);

        this.pivotGrid = this.grid as PivotGridType;
        this.pivotGrid.dimensionsSortingExpressionsChange
            .pipe(takeUntil(this._destroy$))
            .subscribe((_: ISortingExpression[]) => this.setSortIndex());
    }

    public ngAfterViewInit(): void {
        this.setSortIndex();
    }

    @HostListener('click', ['$event'])
    public override onClick(event: MouseEvent) {
        event.preventDefault();
    }

    /**
     * @hidden @internal
     */
    public override get selectable(): boolean {
        return false;
    }

    /**
     * @hidden @internal
     */
    public override onSortingIconClick(event) {
        event.stopPropagation();
        const dim = this.pivotGrid.getRowDimensionByName(this.column.field);
        const startDirection = dim.sortDirection || SortingDirection.None;
        const direction = startDirection + 1 > SortingDirection.Desc ?
            SortingDirection.None : startDirection + 1;
        this.pivotGrid.sortDimension(dim, direction);
    }

    protected override getSortDirection() {
        const dim = this.pivotGrid.getRowDimensionByName(this.column.field);
        this.sortDirection = dim?.sortDirection || SortingDirection.None;
    }

    protected setSortIndex() {
        if (this.column.sortable && this.sortIconContainer) {
            const visibleRows = this.pivotGrid.pivotUI.rowLayout === PivotRowLayoutType.Vertical ?
            this.pivotGrid.pivotConfiguration.rows :
            PivotUtil.flatten(this.pivotGrid.pivotConfiguration.rows);
            const dimIndex = visibleRows.findIndex((target) => target.memberName === this.column.field);
            const dim = visibleRows[dimIndex];
            let newSortIndex = -1;
            if (dim.sortDirection) {
                let priorSortedDims = 0;
                for (let i = 0; i < dimIndex; i++) {
                    if (visibleRows[i].sortDirection) {
                        priorSortedDims++;
                    }
                }

                // Sort index starts from 1.
                newSortIndex = priorSortedDims + 1;
            }

            this.sortIconContainer.nativeElement.setAttribute("data-sortIndex", newSortIndex >= 0 ? newSortIndex : "");
        }
    }
}
