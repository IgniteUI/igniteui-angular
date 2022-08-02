import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    forwardRef,
    HostBinding, Inject, Input, ViewContainerRef
} from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';
import { IGX_GRID_BASE, PivotGridType } from '../common/grid.interface';
import { IgxRowDirective } from '../row.directive';
import { IgxGridSelectionService } from '../selection/selection.service';
import { IPivotGridRecord } from './pivot-grid.interface';
import { PivotUtil } from './pivot-util';


const MINIMUM_COLUMN_WIDTH = 200;
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row',
    templateUrl: './pivot-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxPivotRowComponent) }]
})
export class IgxPivotRowComponent extends IgxRowDirective {
    /**
     * @hidden
     */
    @Input()
    @HostBinding('attr.aria-selected')
    public get selected(): boolean {
        let isSelected = false;
        for (let rowDim of this.data.dimensions) {
            const key = PivotUtil.getRecordKey(this.data, rowDim);
            if (this.selectionService.isPivotRowSelected(key)) {
                isSelected = true;
            }
        }
        return isSelected;
    }

    constructor(
        @Inject(IGX_GRID_BASE) public grid: PivotGridType,
        public selectionService: IgxGridSelectionService,
        public element: ElementRef<HTMLElement>,
        public cdr: ChangeDetectorRef,
        protected resolver: ComponentFactoryResolver,
        protected viewRef: ViewContainerRef
    ) {
        super(grid, selectionService, element, cdr);
    }

    /**
     * @hidden
     * @internal
     */
    public get viewIndex(): number {
        return this.index;
    }

    /**
     * @hidden
     * @internal
     */
    public disabled = false;

    /**
     * @hidden
     * @internal
     */
    public get addRowUI(): any {
        return false;
    }

    /**
     * @hidden
     * @internal
     */
    public get inEditMode(): boolean {
        return false;
    }

    /**
     * @hidden
     * @internal
     */
    public set pinned(_value: boolean) {
    }

    public get pinned(): boolean {
        return false;
    }

    /**
     * @hidden
     * @internal
     */
    public delete() {
    }

    /**
     * @hidden
     * @internal
     */
    public beginAddRow() {
    }

    /**
     * @hidden
     * @internal
     */
    public update(_value: any) {
    }

    /**
     * @hidden
     * @internal
     */
    public pin() {
        return false;
    }

    /**
    * @hidden
    * @internal
    */
    public unpin() {
        return false;
    }

    /**
    *  The pivot record data passed to the row component.
    *
    * ```typescript
    * // get the pivot row data for the first selected row
    * let selectedRowData = this.grid.selectedRows[0].data;
    * ```
    */
    @Input()
    public get data(): IPivotGridRecord {
        return this._data;
    }

    public set data(v: IPivotGridRecord) {
        this._data = v;
    }

    /**
     * @hidden
     * @internal
     */
    public get pivotAggregationData() {
        const aggregations = this.data.aggregationValues;
        const obj = {};
        aggregations.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }

    public getCellClass(col: IgxColumnComponent) {
        const values = this.grid.values;
        if (values.length === 1) {
            return values[0].styles;
        }
        const colName = col.field.split(this.grid.pivotKeys.columnDimensionSeparator);
        const measureName = colName[colName.length - 1];
        return values.find(v => v.member === measureName)?.styles;
    }

    public isCellActive(visibleColumnIndex) {
        const nav = this.grid.navigation
        const node = nav.activeNode;
        return node && Object.keys(node).length !== 0 ?
            !nav.isRowHeaderActive &&
            super.isCellActive(visibleColumnIndex) :
            false;
    }
}
