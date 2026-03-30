import { PivotUtil, RowType } from 'igniteui-angular/grids/core';
import { IgxPivotGridComponent } from './pivot-grid.component';


export class IgxPivotGridRow implements RowType {

    /** The index of the row within the grid */
    public index: number;

    /**
     * The grid that contains the row.
     */
    public grid: IgxPivotGridComponent;
    private _data?: any;

    constructor(grid: IgxPivotGridComponent, index: number, data?: any) {
        this.grid = grid;
        this.index = index;
        this._data = data && data.addRow && data.recordRef ? data.recordRef : data;
    }

    /**
     *  The data passed to the row component.
     */
    public get data(): any {
        return this._data ?? this.grid.dataView[this.index];
    }

    /**
     * Returns the view index calculated per the grid page.
     */
    public get viewIndex(): number {
        return this.index + this.grid.page * this.grid.perPage;
    }

    /**
     * Gets the row key.
     * A row in the grid is identified either by:
     * - primaryKey data value,
     * - the whole rowData, if the primaryKey is omitted.
     *
     * ```typescript
     * let rowKey = row.key;
     * ```
     */
    public get key(): any {
        const dimension = this.grid.visibleRowDimensions[this.grid.visibleRowDimensions.length - 1];
        const recordKey =  PivotUtil.getRecordKey(this.data, dimension);
        return recordKey ? recordKey : null;
    }

    /**
     * Gets whether the row is selected.
     * Default value is `false`.
     * ```typescript
     * row.selected = true;
     * ```
     */
    public get selected(): boolean {
        return this.grid.selectionService.isRowSelected(this.key);
    }

    public set selected(val: boolean) {
        if (val) {
            this.grid.selectionService.selectRowsWithNoEvent([this.key]);
        } else {
            this.grid.selectionService.deselectRowsWithNoEvent([this.key]);
        }
        this.grid.cdr.markForCheck();
    }
}
