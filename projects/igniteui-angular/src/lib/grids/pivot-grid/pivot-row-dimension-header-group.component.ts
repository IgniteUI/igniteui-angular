import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, Input } from '@angular/core';

import { PlatformUtil } from '../../core/utils';
import { IGX_GRID_BASE, PivotGridType } from '../common/grid.interface';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxGridHeaderGroupComponent } from '../headers/grid-header-group.component';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { IgxRowDirective } from '../row.directive';
import { IPivotDimension } from './pivot-grid.interface';

/**
 * @hidden
 */
 @Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row-dimension-header-group',
    templateUrl: '../headers/grid-header-group.component.html'
})
export class IgxPivotRowDimensionHeaderGroupComponent extends IgxGridHeaderGroupComponent {

    constructor(private cdRef: ChangeDetectorRef,
        @Inject(IGX_GRID_BASE) public grid: PivotGridType,
        private elementRef: ElementRef<HTMLElement>,
        public colResizingService: IgxColumnResizingService,
        public filteringService: IgxFilteringService,
        protected platform: PlatformUtil) {
            super(cdRef, grid, elementRef, colResizingService, filteringService, platform);
         }

    /**
     * @hidden
     * @internal
     */
    @Input()
    public intRow: IgxRowDirective;

    @HostBinding('attr.id')
    public get headerID() {
        return `${this.grid.id}_-2_${this.intRow.index}_${this.visibleIndex}`;
    }

    /**
     * @hidden
     * @internal
     */
    public get visibleIndex(): number {
        const field = this.column.field;
        const rows = this.grid.pivotConfiguration.rows;
        const rootDimension = this.findRootDimension(field);
        return rows.indexOf(rootDimension);
    }

    @HostBinding('class.igx-grid-th--active')
    public get active() {
        const node = this.grid.navigation.activeNode;
        return node && !this.column.columnGroup ?
            node.isRowHeader && node.row === this.intRow.index && node.column === this.visibleIndex : false;
    }

    public get activeGroup() {
        const node = this.grid.navigation.activeNode;
        return node ? node.isRowHeader && node.row === this.intRow.index && node.column === this.visibleIndex : false;
    }

    protected get activeNode() {
        return {
            row: this.intRow.index, column: this.visibleIndex, level: null,
            mchCache: null,
            layout: null,
            isRowHeader: true
        };
    }

    private findRootDimension(field: string): IPivotDimension {
        const rows = this.grid.pivotConfiguration.rows;
        let tempRow;
        let result = null;
        rows.forEach(row => {
            tempRow = row;
            do {
                if (row.memberName === field) {
                    result = row;
                }
                tempRow = tempRow.childLevel;
            } while(tempRow)
        });
        return result;
    }
}
