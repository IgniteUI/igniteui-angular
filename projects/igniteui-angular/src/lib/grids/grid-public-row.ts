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
     * Returns the index of the row in the rows collection. GroupBy rows and Summary rows are also considered.
     */
    public index: number;

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
        const data = this.data;
        const primaryKey = this.grid.primaryKey;
        return primaryKey ? data[primaryKey] : data;
    }

    /**
     *  Gets the row data.
     *
     * ```typescript
     * let data = grid.getRowByIndex(0).data;
     * ```
     */
    public get data(): any {
        return this._data;
    }
    /** @hidden */
    public get rowData(): any {
        return this._data;
    }

    /**
     * Gets/sets whether the row is pinned.
     * Default value is `false`.
     *
     * ```typescript
     * const isPinned = row.pinned;
     * row.pinned = !isPinned;
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
     *
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
     * Returns if the row is in deleted state.
     */
    public get deleted(): boolean {
        return this.gridAPI.row_deleted_transaction(this.rowID);
    }

    /**
     * Gets/sets the row expanded state.
     * Default value is `false`.
     *
     * ```typescript
     * const isExpanded = row.expanded;
     * row.expanded = !expanded;
     * ```
     */
    public get expanded(): boolean {
        return this.gridAPI.get_row_expansion_state(this.data);
    }

    public set expanded(val: boolean) {
        this.gridAPI.set_row_expansion_state(this.rowID, val);
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
     * Get a reference to the grid that contains the row.
     */
    protected get grid(): IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent {
        return this._grid as IgxGridComponent;
    }

    private get gridAPI(): IgxGridAPIService {
        return this.grid.gridAPI as IgxGridAPIService;
    }

    /**
     * @hidden
     */
    constructor(private _grid: IgxGridBaseDirective, index: number, private _data: any) {
        this.index = index;
    }

    /**
     * TODO after cell facade class is implemented
     * Gets the cells contained in the row component.
     * public get cells()
     */

    /**
     * Updates the specified row object and the data source record with the passed value.
     * This method emits `onEditDone` event.
     *
     * ```typescript
     * let newValue = "Apple";
     * this.grid.getRowByIndex(0).update(newValue);
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
     * this.grid.getRowByIndex(2).delete();
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
     * this.grid.getRowByIndex(0).pin();
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
     * this.grid.getRowByIndex(0).unpin();
     * ```
     */
    public unpin(): boolean {
        return this.grid.unpinRow(this.rowID);
    }
}

export class IgxTreeGridRow extends IgxGridRow implements RowType {
    /**
     * Gets/sets the row expanded state.
     * Default value is `false`.
     *
     * ```typescript
     * const isExpanded = row.expanded;
     * row.expanded = !expanded;
     * ```
     */
    public get expanded(): boolean {
        return this.grid.gridAPI.get_row_expansion_state(this.treeRow);
    }

    public set expanded(val: boolean) {
        this.grid.gridAPI.set_row_expansion_state(this.rowID, val);
    }

    public get pinned(): boolean {
        return this.grid.isRecordPinned(this);
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
     * Returns true if child rows exist.
     */
    public get hasChildren(): boolean {
        if (this.treeRow.children) {
           return this.treeRow.children.length > 0;
        } else {
            return false;
        }
    }

    /**
     * @hidden @internal
     */
    protected get treeRow(): ITreeGridRecord {
        return this._treeRow ?? this._tgrid.records.get(this.rowID);
    }

    /**
     * Get a reference to the grid that contains the selected row.
     */
    protected get grid(): IgxTreeGridComponent {
        return this._tgrid as IgxTreeGridComponent;
    }

    /**
     * @hidden
     */
    constructor(private _tgrid: IgxTreeGridComponent, index: number, data: any, private _treeRow?: ITreeGridRecord) {
        super(_tgrid, index, data);
    }
}

export class IgxGroupByRow implements RowType {
    /**
     * Returns the row index in the rows collection. SummaryRows are also considered.
     */
    public index: number;

    /**
     * The IGroupByRecord object, representing the group record, if the row is a GroupByRow.
     */
    public groupRow: IGroupByRecord;

    /**
     * Returns always true, because this is in instance of an IgxGroupByRow.
     */
    public isGroupByRow = true;

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

    /**
     * Get a reference to the grid that contains the GroupBy row.
     */
    protected get grid(): IgxGridComponent {
        return this._grid;
    }

    private get gridAPI(): IgxGridAPIService {
        return this.grid.gridAPI as IgxGridAPIService;
    }

    /**
     * @hidden
     */
    constructor(private _grid: IgxGridComponent, index: number, groupRow: IGroupByRecord) {
        this.index = index;
        this.groupRow = groupRow;
    }

    // todo TODO ?
    /**
     * Toggles the group row expanded/collapsed state.
     * ```typescript
     * groupRow.toggle()
     * ```
     */
    public toggle(): void {
        this.grid.toggleGroup(this.groupRow);
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
    public isSummaryRow = true;

    /**
     * The IGroupByRecord object, representing the group record, if the row is a GroupByRow.
     */
    public summaries: Map<string, IgxSummaryResult[]>;

    /**
     * Get a reference to the grid that contains the GroupBy row.
     */
    protected get grid(): IgxGridBaseDirective & GridType {
        return this._grid;
    }

    /**
     * @hidden
     */
     constructor(private _grid: IgxGridBaseDirective, index: number, summaries: Map<string, IgxSummaryResult[]>) {
        this.index = index;
        this.summaries = summaries;
    }
}
