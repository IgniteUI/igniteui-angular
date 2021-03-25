import { RowType } from './common/row.interface';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IgxGridComponent } from './grid/grid.component';
import { IgxTreeGridComponent } from './tree-grid/tree-grid.component';
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
    public get data(): any {
        return this.grid.filteredSortedData[this.index];
    }

    public get rowData(): any {
        return this.grid.filteredSortedData[this.index];
    }

    /**
     * Sets/gets whether the row is pinned.
     * Default value is `false`.
     * ```typescript
     * this.grid.selectedRows[0].pinned = true;
     * ```
     */
    public get pinned(): boolean {
        return this.grid.isRecordPinned(this.data);
    }

    public set pinned(val: boolean) {
        if (val) {
            this.grid.pinRow(this.rowID);
        } else {
            this.grid.unpinRow(this.rowID);
        }
    }

    /**
     * Sets/gets whether the row is selected.
     * Default value is `false`.
     * ```typescript
     * row.selected = true;
     * ```
     */
    public get selected(): boolean {
        return this.grid.selectionService.isRowSelected(this.rowID);
    }

    public set selected(val: boolean) {
        if (val) {
            this.grid.selectionService.selectRowsWithNoEvent([this.rowID]);
        } else {
            this.grid.selectionService.deselectRowsWithNoEvent([this.rowID]);
        }
        this.grid.cdr.markForCheck();
    }

    // todo TODO ROW
    /**
     * Sets whether this specific row has disabled functionality for editing and row selection.
     * Default value is `false`.
     * ```typescript
     * this.grid.selectedRows[0].pinned = true;
     * ```
     */
    public get disabled(): boolean {
        return false;
    }

    /**
     * Returns the index of the row in the rows collection.
     */
    public index: number;

    /**
     * Returns if the row is in delete state.
     */
    public get deleted(): boolean {
        return this.grid.gridAPI.row_deleted_transaction(this.rowID);
    }

    /**
     * Returns if the row is currently in edit mode.
     */
    public get inEditMode(): boolean {
        if (this.grid.rowEditable) {
            const editRowState = this.grid.crudService.row;
            return (editRowState && editRowState.id === this.rowID) || false;
        } else {
            return false;
        }
    }

    /**
     * Returns the child rows. Always returns null for IgxGridRow.
     */
    public get children(): any[] {
        return null;
    }

    /**
     * Returns true if child rows exist. Always return false for IgxGridRow.
     */
    public get hasChildren(): boolean {
        return false;
    }

    /**
     * Gets/sets the row expanded state.
     */
    public get expanded(): boolean {
        return this.grid.gridAPI.get_row_expansion_state(this.data);
    }

    public set expanded(val: boolean) {
        this.grid.gridAPI.set_row_expansion_state(this.rowID, val);
    }

    /**
     * Get a reference to the grid that contains the selected row.
     */
    protected get grid(): IgxGridComponent {
        return this._grid as IgxGridComponent;
    }

    /**
     * Gets the  row key.
     * A row in the grid is identified either by:
     * - primaryKey data value,
     * - the whole rowData, if the primaryKey is omitted.
     *
     * ```typescript
     * let rowKey = row.key;
     * ```
     */
    public get rowID(): any {
        const primaryKey = this.grid.primaryKey;
        return primaryKey ? this.data[primaryKey] : this.data;
    }

    /**
     * TODO after cell facade class is implemented
     * Gets the rendered cells in the row component.
     * public get cells()
     */

    /**
     * @hidden
     */
    constructor(index: number, private _grid: IgxGridBaseDirective) {
        this.index = index;
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
        const crudService = this.grid.crudService;
        if (crudService.cellInEditMode && crudService.cell.id.rowID === this.rowID) {
            this.grid.endEdit(false);
        }
        this.grid.updateRow(value, this.rowID);
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
        this.grid.deleteRowById(this.rowID);
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
        return this.grid.pinRow(this.rowID);
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
        return this.grid.unpinRow(this.rowID);
    }
}

export class IgxTreeGridRow extends IgxGridRow implements RowType {
    public get viewIndex(): number {
        return this.index + this.grid.page * this.grid.perPage;
    }

    /**
     * Returns the child rows.
     */
    public get children(): ITreeGridRecord[] {
        return this.treeRow.children;
    }

    /**
     * Returns the parent row.
     */
    public get parent(): ITreeGridRecord {
        return this.treeRow.parent;
    }

    /**
     * Returns true if child rows exist. Always return false for IgxGridRow.
     */
    public get hasChildren(): boolean {
        return this.treeRow.children.length > 0;
    }

    /**
     * @hidden
     */
    constructor(index: number, private _tgrid: IgxTreeGridComponent) {
        super(index, _tgrid);
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
        return this._tgrid.records.get(this.rowID);
    }

    /**
     * Gets whether the row is pinned.
     *
     * ```typescript
     * let isPinned = row.pinned;
     * ```
     */
    public get pinned(): boolean {
        return this.grid.isRecordPinned(this);
    }

    /**
     * Gets whether the row is expanded.
     *
     * ```typescript
     * let esExpanded = row.expanded;
     * ```
     */
    public get expanded(): boolean {
        return this.grid.gridAPI.get_row_expansion_state(this.treeRow);
    }

    /**
     * Expands/collapses the row.
     *
     * ```typescript
     * row.expanded = true;
     * ```
     */
    public set expanded(val: boolean) {
        this.grid.gridAPI.set_row_expansion_state(this.rowID, val);
    }
}
