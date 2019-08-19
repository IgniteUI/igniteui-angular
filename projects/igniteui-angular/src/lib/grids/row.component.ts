import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { IgxGridForOfDirective } from '../directives/for-of/for_of.directive';
import { GridBaseAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent } from './column.component';
import { TransactionType, State } from '../services';
import { IgxGridBaseComponent, IGridDataBindable } from './grid-base.component';
import { IgxGridSelectionService, IgxGridCRUDService, IgxRow } from '../core/grid-selection';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-row',
    templateUrl: './grid/grid-row.component.html'
})
export class IgxRowComponent<T extends IgxGridBaseComponent & IGridDataBindable> implements DoCheck {

    private _rowData: any;
    /**
     *  The data passed to the row component.
     *
     * ```typescript
     * // get the row data for the first selected row
     * let selectedRowData = this.grid.selectedRows[0].rowData;
     * ```
     */
    @Input()
    public get rowData(): any {
        if (this.inEditMode) {
            return Object.assign({}, this._rowData, this.grid.transactions.getAggregatedValue(this.rowID, false));
        }
        return this._rowData;
    }

    public set rowData(v: any) {
        this._rowData = v;
    }
    /**
     * The index of the row.
     *
     * ```typescript
     * // get the index of the second selected row
     * let selectedRowIndex = this.grid.selectedRows[1].index;
     * ```
     */
    @Input()
    public index: number;

    /**
     * @hidden
     */
    @Input()
    public gridID: string;

    /**
     * @hidden
     */
    @Input()
    public rowSelected = false;

    /**
     * @hidden
     */
    @ViewChild('igxDirRef', { read: IgxGridForOfDirective, static: false })
    public virtDirRow: IgxGridForOfDirective<any>;

    /**
     * @hidden
     */
    @ViewChild(forwardRef(() => IgxCheckboxComponent), { read: IgxCheckboxComponent, static: false })
    public checkboxElement: IgxCheckboxComponent;

    /**
     * The rendered cells in the row component.
     *
     * ```typescript
     * // get the cells of the third selected row
     * let selectedRowCells = this.grid.selectedRows[2].cells;
     * ```
     */
    @ViewChildren(forwardRef(() => IgxGridCellComponent))
    public cells: QueryList<IgxGridCellComponent>;

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'row';

    @HostBinding('attr.data-rowIndex')
    get dataRowIndex() {
        return this.index;
    }

    /**
     * @hidden
     */
    @HostBinding('class')
    get styleClasses(): string {
        return this.resolveClasses();
    }

    /**
     * @hidden
     */
    @Input()
    @HostBinding('attr.aria-selected')
    get selected(): boolean {
        return this.selectionService.isRowSelected(this.rowID);
    }

    set selected(value: boolean) {
        value ? this.selectionService.selectRows([this.rowID]) :
        this.selectionService.deselectRowsWithNoEvent([this.rowID]);
        this.grid.cdr.markForCheck();
    }

    /**
     * @hidden
     */
    get columns(): IgxColumnComponent[] {
        return this.grid.visibleColumns;
    }

    /**
     * @hidden
     */
    get pinnedColumns(): IgxColumnComponent[] {
        return this.grid.pinnedColumns;
    }

    /**
     * @hidden
     */
    get unpinnedColumns(): IgxColumnComponent[] {
        return this.grid.unpinnedColumns;
    }

    /**
     * @hidden
     */
    public get showRowSelectors(): boolean {
        return this.grid.showRowSelectors;
    }

    /** @hidden */
    public get dirty(): boolean {
        const row: State = this.grid.transactions.getState(this.rowID);
        if (row) {
            return row.type === TransactionType.ADD || row.type === TransactionType.UPDATE;
        }

        return false;
    }

    // TODO: should be deprecated?????
    public get isSelected() {
        return this.selectionService.isRowSelected(this.rowID);
    }

    /**
     * @hidden
     */
    public get rowDraggable(): boolean {
        return this.grid.rowDraggable;
    }

    /** @hidden */
    public get added(): boolean {
        const row: State = this.grid.transactions.getState(this.rowID);
        if (row) {
            return row.type === TransactionType.ADD;
        }

         return false;
    }

    /** @hidden */
    public get deleted(): boolean {
        return this.gridAPI.row_deleted_transaction(this.rowID);
    }

    /**
     * @hidden
     */
    public dragging = false;

    // TODO: Refactor
    public get inEditMode(): boolean {
        if (this.grid.rowEditable) {
            const editRowState = this.crudService.row;
            return (editRowState && editRowState.id === this.rowID) || false;
        } else {
            return false;
        }
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
    get grid(): T {
        return this.gridAPI.grid;
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
    public get rowID() {
        const primaryKey = this.grid.primaryKey;
        return primaryKey ? this._rowData[primaryKey] : this._rowData;
    }

    /**
     * The native DOM element representing the row. Could be null in certain environments.
     *
     * ```typescript
     * // get the nativeElement of the second selected row
     * let selectedRowNativeElement = this.grid.selectedRows[1].nativeElement;
     * ```
     */
    get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * @hidden
     */
    public focused = false;

    /**
     * @hidden
     * @internal
     */
    public defaultCssClass = 'igx-grid__tr';


    constructor(public gridAPI: GridBaseAPIService<T>,
        public crudService: IgxGridCRUDService,
        public selectionService: IgxGridSelectionService,
        public element: ElementRef,
        public cdr: ChangeDetectorRef) { }

    /**
     * @hidden
     * @internal
     */
    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        if (this.grid.rowSelection === 'none' || this.deleted) { return; }
        if (event.shiftKey && this.grid.rowSelection === 'multiple') {
            this.selectionService.selectMultipleRows(this.rowID, this.rowData, event);
            return;
        }
        this.selectionService.selectRowbyID(this.rowID, !event.ctrlKey, event);
    }

    /**
     * @hidden
     */
    public onRowSelect(event) {
        event.checked ? this.selectionService.selectRowbyID(this.rowID, false, event) :
                this.selectionService.deselectRow(this.rowID, event);
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
    public update(value: any) {
        const crudService = this.crudService;
        if (crudService.inEditMode && crudService.cell.id.rowID === this.rowID) {
            this.grid.endEdit(false);
        }
        const row = new IgxRow(this.rowID, this.index, this.rowData);
        this.gridAPI.update_row(row, value);
        this.cdr.markForCheck();
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
    public delete() {
        this.grid.deleteRowById(this.rowID);
    }

    /**
     * @hidden
     */
    get rowCheckboxAriaLabel() {
        return this.grid.primaryKey ?
            this.selected ? 'Deselect row with key ' + this.rowID : 'Select row with key ' + this.rowID :
            this.selected ? 'Deselect row' : 'Select row';
    }

    /**
     * @hidden
     */
    public ngDoCheck() {
        this.cdr.markForCheck();
    }

    /**
     * @hidden
     */
    protected resolveClasses(): string {
        const indexClass = this.index % 2 ? this.grid.evenRowCSS : this.grid.oddRowCSS;
        const selectedClass = this.selected ? 'igx-grid__tr--selected' : '';
        const editClass = this.inEditMode ? 'igx-grid__tr--edit' : '';
        const dirtyClass = this.dirty ? 'igx-grid__tr--edited' : '';
        const deletedClass = this.deleted ? 'igx-grid__tr--deleted' : '';
        const mrlClass = this.grid.hasColumnLayouts ? 'igx-grid__tr--mrl' : '';
        const dragClass = this.dragging ? 'igx-grid__tr--drag' : '';
        return `${this.defaultCssClass} ${indexClass} ${selectedClass} ${editClass} ${dirtyClass}
         ${deletedClass} ${mrlClass} ${dragClass}`.trim();
    }

    /**
     * @hidden
     */
    public get resolveDragIndicatorClasses(): string {
        const defaultDragIndicatorCssClass = 'igx-grid__drag-indicator';
        const dragIndicatorOff = this.grid.rowDragging && !this.dragging ? 'igx-grid__drag-indicator--off' : '';
        return `${defaultDragIndicatorCssClass} ${dragIndicatorOff}`;
    }
}
