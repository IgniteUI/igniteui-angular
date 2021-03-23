import { QueryList } from '@angular/core';
import { GridType } from './common/grid.interface';
import { RowType, TreeGridRowType } from './common/row.interface';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IgxRowDirective } from './row.directive'
import { IgxTreeGridRowComponent } from './tree-grid/tree-grid-row.component';
import { ITreeGridRecord } from './tree-grid/tree-grid.interfaces';

export class IgxGridRow implements RowType {
    /**
     *  The data passed to the row component.
     *
     * ```typescript
     * // get the row data for the first selected row
     * let selectedRowData = this.grid.selectedRows[0].rowData;
     * ```
     */
    public get rowData(): any {
        return this._row.rowData;
    }

    public set rowData(v: any) {
        this._row.rowData = v;
    }

    public get addRow(): any {
        return this._row.addRow;
    }

    public set addRow(v: any) {
        this._row.addRow = v;
    }

    /**
     * Sets/gets whether the row is pinned.
     * Default value is `false`.
     * ```typescript
     * this.grid.selectedRows[0].pinned = true;
     * ```
     */
    public get pinned(): boolean {
        return this._row.pinned;
    }
    public set pinned(v: boolean) {
        this._row.pinned = v;
    }

    /**
     * Sets/gets whether the row is selected.
     * Default value is `false`.
     * ```typescript
     * row.selected = true;
     * ```
     */
    public get selected(): boolean {
        return this._row.selected;
    }

    public set selected(v: boolean) {
        this._row.selected = v;
    }

    /**
     * Sets whether this specific row has disabled functionality for editing and row selection.
     * Default value is `false`.
     * ```typescript
     * this.grid.selectedRows[0].pinned = true;
     * ```
     */
    public get disabled(): boolean {
        return this._row.disabled;
    }
    public set disabled(v: boolean) {
        this._row.disabled = v;
    }

    /**
     * Gets the rendered cells in the row component.
     *
     * ```typescript
     * // get the cells of the third selected row
     * let selectedRowCells = this.grid.selectedRows[2].cells;
     * ```
     */
    public get cells(): QueryList<any> {
        return this._row.cells;
    }

    public get index(): number {
        return this._row.index;
    }

    public get dataRowIndex(): number {
        return this._row.dataRowIndex;
    }

    public get deleted(): boolean {
        return this._row.deleted;
    }

    public get inEditMode(): boolean {
        return this._row.inEditMode;
    }

    public get added(): boolean {
        return this._row.added;
    }

    public get focused(): boolean {
        return this._row.focused;
    }

    public get expanded(): boolean {
        return this.grid.gridAPI.get_row_expansion_state(this.rowData);
    }

    /**
     * Get a reference to the grid that contains the selected row.
     *
     * ```typescript
     * handleRowSelection(event) {
     *  // the grid on which the onRowSelectionChange event was triggered
     *  const grid = event.row.grid;
     * }
     * ```
     *
     * ```html
     *  <igx-grid
     *    [data]="data"
     *    (onRowSelectionChange)="handleRowSelection($event)">
     *  </igx-grid>
     * ```
     */
    public get grid(): IgxGridBaseDirective {
        return this._row.grid;
    }

    /**
     * Gets the ID of the grid, that contains the row.
     *
     * ```typescript
     * let gridID = this.row.gridID;
     * ```
     */
    public get gridID(): string {
        return this.grid.id;
    }

    /**
     * Gets the ID of the row.
     * A row in the grid is identified either by:
     * - primaryKey data value,
     * - the whole rowData, if the primaryKey is omitted.
     *
     * ```typescript
     * let rowID = this.grid.selectedRows[2].rowID;
     * ```
     */
    public get rowID(): any {
        return this._row.rowID;
    }

    constructor(
        private _row: IgxRowDirective<IgxGridBaseDirective & GridType>) {
    }

    /**
     * Updates the specified row object and the data source record with the passed value.
     * This method emits `onEditDone` event.
     *
     * ```typescript
     * // update the second selected row's value
     * let newValue = "Apple";
     * this.grid.selectedRows[1].update(newValue);
     * ```
     */
    public update(value: any): void {
        this._row.update(value);
    }

    /**
     * Removes the specified row from the grid's data source.
     * This method emits `onRowDeleted` event.
     *
     * ```typescript
     * // delete the third selected row from the grid
     * this.grid.selectedRows[2].delete();
     * ```
     */
    public delete(): void {
        this._row.delete();
    }

    /**
     * Returns if cell at the passed index is the current activeNode in the grid.
     *
     * ```typescript
     * const isActiveNode = row.isCellActive(index);
     * ```
     */
    public isCellActive(visibleColumnIndex: number): boolean {
        return this._row.isCellActive(visibleColumnIndex);
    }

    /**
     * Pins the specified row.
     * This method emits `onRowPinning` event.
     *
     * ```typescript
     * // pin the selected row from the grid
     * this.grid.selectedRows[0].pin();
     * ```
     */
    public pin(): boolean {
        return this._row.pin();
    }

    /**
     * Unpins the specified row.
     * This method emits `onRowPinning` event.
     *
     * ```typescript
     * // unpin the selected row from the grid
     * this.grid.selectedRows[0].unpin();
     * ```
     */
    public unpin(): boolean {
        return this._row.unpin();
    }

    /**
     * Spawns the add row UI for the specific row.
     *
     * @example
     * ```typescript
     * const row = this.grid1.getRowByIndex(1);
     * row.beginAddRow();
     * ```
     */
    public beginAddRow(): void {
        this._row.beginAddRow();
    }
}

export class IgxTreeGridRow extends IgxGridRow implements TreeGridRowType {
    constructor(
        private _trow: IgxTreeGridRowComponent) {
            super(_trow);
    }

    /**
     * The `ITreeGridRecord` passed to the row component.
     *
     * ```typescript
     * const row = this.treeGrid.getRowByKey(1) as IgxTreeGridRowComponent;
     * const treeRow = row.treeRow;
     * ```
     */
     public get treeRow(): ITreeGridRecord {
         return this._trow.treeRow;
     }
}
