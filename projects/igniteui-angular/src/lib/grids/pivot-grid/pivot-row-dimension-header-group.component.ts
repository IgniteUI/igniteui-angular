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
    public rowIndex: number;

    @HostBinding('attr.id')
    public get headerID() {
        return `${this.grid.id}_-2_${this.rowIndex}_${this.visibleIndex}`;
    }

    /**
     * @hidden
     * @internal
     */
    public get visibleIndex(): number {
        const field = this.column.field;
        const rows = this.grid.rowDimensions;
        const rootDimension = this.findRootDimension(field);
        return rows.indexOf(rootDimension);
    }

    @HostBinding('class.igx-grid-th--active')
    public get active() {
        const nav = this.grid.navigation;
        const node = nav.activeNode;
        return node && !this.column.columnGroup ?
            nav.isRowHeaderActive &&
            node.row === this.rowIndex &&
            node.column === this.visibleIndex :
            false;
    }

    public get activeGroup() {
        const nav = this.grid.navigation;
        const node = nav.activeNode;
        return node ? nav.isRowHeaderActive && node.row === this.rowIndex && node.column === this.visibleIndex : false;
    }

    protected get activeNode() {
        this.grid.navigation.isRowHeaderActive = true;
        return {
            row: this.rowIndex, column: this.visibleIndex, level: null,
            mchCache: null,
            layout: null
        };
    }

    private findRootDimension(field: string): IPivotDimension {
        const rows = this.grid.rowDimensions;
        let tempRow;
        let result = null;
        rows.forEach(row => {
            tempRow = row;
            do {
                if (tempRow.memberName === field) {
                    result = row;
                }
                tempRow = tempRow.childLevel;
            } while (tempRow)
        });
        return result;
    }


    public activate() {
        this.grid.navigation.isRowHeader = true;
        this.grid.navigation.setActiveNode(this.activeNode);
    }

    /**
     * @hidden @internal
     */
    public pointerdown(_event: PointerEvent): void {
        this.activate();
    }

    /**
     * @hidden @internal
     */
    public onMouseDown(_event: MouseEvent): void {
        this.activate();
    }
}
