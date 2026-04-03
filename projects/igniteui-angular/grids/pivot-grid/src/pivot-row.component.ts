import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    HostBinding, inject, Input, ViewContainerRef
} from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import {
    IGX_GRID_BASE,
    IgxColumnComponent,
    IgxGridCellComponent,
    IgxGridCellStylesPipe,
    IgxGridNotGroupedPipe,
    IgxGridTransactionStatePipe,
    IgxRowDirective,
    IPivotGridColumn,
    IPivotGridRecord,
    PivotGridType,
    PivotUtil
} from 'igniteui-angular/grids/core';
import { IgxPivotGridCellStyleClassesPipe } from './pivot-grid.pipes';
import { IgxGridForOfDirective } from 'igniteui-angular/directives';
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row',
    templateUrl: './pivot-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxPivotRowComponent) }],
    imports: [IgxGridForOfDirective, IgxGridCellComponent, NgClass, NgStyle, IgxCheckboxComponent, IgxGridNotGroupedPipe, IgxGridCellStylesPipe, IgxGridTransactionStatePipe, IgxPivotGridCellStyleClassesPipe]
})
export class IgxPivotRowComponent extends IgxRowDirective {
    /* blazorSuppress */
    public override grid = inject<PivotGridType>(IGX_GRID_BASE);
    protected viewRef = inject(ViewContainerRef);

    /**
     * @hidden
     */
    @Input()
    @HostBinding('attr.aria-selected')
    public override get selected(): boolean {
        let isSelected = false;
        for (const rowDim of this.data.dimensions) {
            const key = PivotUtil.getRecordKey(this.data, rowDim);
            if (this.selectionService.isPivotRowSelected(key)) {
                isSelected = true;
            }
        }
        return isSelected;
    }

    /**
     * @hidden
     * @internal
     */
    public override get viewIndex(): number {
        return this.index;
    }

    /**
     * @hidden
     * @internal
     */
    public override disabled = false;

    /**
     * @hidden
     * @internal
     */
    public override get addRowUI(): any {
        return false;
    }

    /**
     * @hidden
     * @internal
     */
    public override get inEditMode(): boolean {
        return false;
    }

    /**
     * @hidden
     * @internal
     */
    public override set pinned(_value: boolean) {
    }

    public override get pinned(): boolean {
        return false;
    }

    /**
     * @hidden
     * @internal
     */
    public override delete() {
    }

    /**
     * @hidden
     * @internal
     */
    public override beginAddRow() {
    }

    /**
     * @hidden
     * @internal
     */
    public override update(_value: any) {
    }

    /**
     * @hidden
     * @internal
     */
    public override pin() {
        return false;
    }

    /**
    * @hidden
    * @internal
    */
    public override unpin() {
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
    public override get data(): IPivotGridRecord {
        return this._data;
    }

    public override set data(v: IPivotGridRecord) {
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

    public override isCellActive(visibleColumnIndex) {
        const nav = this.grid.navigation
        const node = nav.activeNode;
        return node && Object.keys(node).length !== 0 ?
            !nav.isRowHeaderActive &&
            !nav.isRowDimensionHeaderActive &&
            super.isCellActive(visibleColumnIndex) :
            false;
    }

    public getColumnData(col: IgxColumnComponent) : IPivotGridColumn {
        const path = col.field.split(this.grid.pivotKeys.columnDimensionSeparator);
        const keyValueMap = new Map<string, string>();
        const colDimensions = PivotUtil.flatten(this.grid.columnDimensions);
        for (const dim of colDimensions) {
            keyValueMap.set(dim.memberName, path.shift());
        }
        let pivotValue;
        if (this.grid.hasMultipleValues && path.length) {
            pivotValue = this.grid.values.find(x => x.member === path[0]);
        } else {
            pivotValue = this.grid.values ? this.grid.values[0] : undefined;
        }
        return {
            field: col.field,
            dimensions: this.grid.columnDimensions,
            dimensionValues: keyValueMap,
            value: pivotValue
        };
    }
}
