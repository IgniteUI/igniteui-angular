import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { IgxRow } from './common/crud.service';
import { GridType } from './common/grid.interface';
import { RowType } from './common/row.interface';
import { IgxGridBaseDirective } from './grid-base.directive';
import { IgxGridAPIService } from './grid/grid-api.service';
import { IgxGridComponent } from './grid/grid.component';
import { IgxHierarchicalGridComponent } from './hierarchical-grid/hierarchical-grid.component';
import { IgxSummaryResult } from './summaries/grid-summary';
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
        return this._data ?? this.grid.allRowsData[this.index];
    }
    public get rowData(): any {
        return this.data;
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
            this.pin();
        } else {
            this.unpin();
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

    /**
     * Sets whether this specific row has disabled functionality for editing and row selection.
     * Default value is `false`.
     * ```typescript
     * const isDisabled = row.disabled;
     * ```
     */
    public get disabled(): boolean {
        return this._disabled;
    }

    /**
     * Returns the index of the row in the rows collection.
     */
    public index: number;
    private _disabled = false;

    /**
     * Returns if the row is in delete state.
     */
    public get deleted(): boolean {
        return this.gridAPI.row_deleted_transaction(this.rowID);
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
        return this.gridAPI.get_row_expansion_state(this.data);
    }

    public set expanded(val: boolean) {
        this.gridAPI.set_row_expansion_state(this.rowID, val);
    }

    /**
     * Get a reference to the grid that contains the selected row.
     */
    protected get grid(): IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent {
        return this._grid as IgxGridComponent;
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
    public get rowID(): any {
        const data = this.data;
        const primaryKey = this.grid.primaryKey;
        return primaryKey ? data[primaryKey] : data;
    }

    /**
     * TODO after cell facade class is implemented
     * Gets the rendered cells in the row component.
     * public get cells()
     */

    /**
     * @hidden
     */
    constructor(private _grid: IgxGridBaseDirective, index: number, private _data?: any) {
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
        const row = new IgxRow(this.rowID, this.index, this.rowData, this.grid);
        this.gridAPI.update_row(row, value);
        this.grid.cdr.markForCheck();
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
        const pinned = this.grid.pinRow(this.rowID);
        this._disabled = pinned;
        return pinned;
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
        const unpinned = this.grid.unpinRow(this.rowID);
        this._disabled = !unpinned;
        return this.grid.unpinRow(this.rowID);
    }

    private get gridAPI(): IgxGridAPIService {
        return this.grid.gridAPI as IgxGridAPIService;
    }
}

export class IgxTreeGridRow extends IgxGridRow implements RowType {
    public get viewIndex(): number {
        return this.index + this.grid.page * this.grid.perPage;
    }

    /**
     * Get a reference to the grid that contains the selected row.
     */
    protected get grid(): IgxTreeGridComponent {
        return this._tgrid as IgxTreeGridComponent;
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
        if (this.treeRow.children) {
           return this.treeRow.children.length > 0;
        } else {
            return false;
        }
    }

    /**
     * @hidden
     */
    constructor(private _tgrid: IgxTreeGridComponent, index: number, data?: any, private _treeRow?: ITreeGridRecord) {
        super(_tgrid, index, data);
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
        const treeRow = this._treeRow ?? this._tgrid.records.get(this.rowID);
        return treeRow;
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

export class IgxGroupByRow implements RowType {
    /**
     * Returns the row index.
     */
    public index: number;

    /**
     * Returns always true, because this is in instance of an IgxGroupByRow.
     */
    public isGroupByRow: boolean;

    /**
     * The IGroupByRecord object, representing the group record, if the row is a GroupByRow.
     */
    public get groupRow(): IGroupByRecord {
        return this._groupRow ? this._groupRow : this.grid.allRowsData[this.index];
    }

    /**
     * @hidden
     */
     constructor(private _grid: IgxGridComponent, index: number, private _groupRow?: IGroupByRecord) {
        this.index = index;
        this.isGroupByRow = true;
    }

    /**
     * Gets/sets whether the group row is expanded.
     * ```typescript
     * const groupRowExpanded = groupRow.expanded;
     * ```
     */
    public get expanded(): boolean {
        return this.grid.isExpandedGroup(this.groupRow);
    }

    public set expanded(value: boolean) {
        this.gridAPI.set_grouprow_expansion_state(this.groupRow, value);
    }

    public isActive(): boolean {
        return this.grid.navigation.activeNode ? this.grid.navigation.activeNode.row === this.index : false;
    }

    // todo TODO ?
    /**
     * Toggles the group row expanded/collapsed state.
     * ```typescript
     * groupRow.toggle()
     * ```
     */
    public toggle() {
        this.grid.toggleGroup(this.groupRow);
    }

    /**
     * Get a reference to the grid that contains the GroupBy row.
     */
    protected get grid(): IgxGridComponent {
        return this._grid;
    }

    private get gridAPI(): IgxGridAPIService {
        return this.grid.gridAPI as IgxGridAPIService;
    }
}

export class IgxSummaryRow implements RowType {
    /**
     * Returns the row index.
     */
    public index: number;

    /**
     * Returns always true, because this is in instance of an IgxGroupByRow.
     */
    public isSummaryRow: boolean;

    /**
     * The IGroupByRecord object, representing the group record, if the row is a GroupByRow.
     */
    public get summaries(): Map<string, IgxSummaryResult[]> {
        return this._summaries ? this._summaries : this.grid.allRowsData[this.index].summaries;
    }

    /**
     * @hidden
     */
     constructor(private _grid: IgxGridBaseDirective, index: number, private _summaries?: Map<string, IgxSummaryResult[]>) {
        this.index = index;
        this.isSummaryRow = true;
    }

    /**
     * Get a reference to the grid that contains the GroupBy row.
     */
    protected get grid(): IgxGridBaseDirective & GridType {
        return this._grid;
    }
}
