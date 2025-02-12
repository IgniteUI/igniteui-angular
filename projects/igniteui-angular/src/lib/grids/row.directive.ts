import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectorRef,
    Directive,
    DoCheck,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnDestroy,
    Output,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { IgxCheckboxComponent } from '../checkbox/checkbox.component';
import { IgxGridForOfDirective } from '../directives/for-of/for_of.directive';
import { TransactionType } from '../services/transaction/transaction';
import { IgxGridSelectionService } from './selection/selection.service';
import { IgxAddRow, IgxEditRow } from './common/crud.service';
import { CellType, ColumnType, GridType, IGX_GRID_BASE } from './common/grid.interface';
import { mergeWith } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[igxRowBaseComponent]',
    standalone: true
})
export class IgxRowDirective implements DoCheck, AfterViewInit, OnDestroy {
    /**
     * @hidden
     */
    @Output()
    public addAnimationEnd = new EventEmitter<IgxRowDirective>();

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'row';

    /**
     *  The data passed to the row component.
     *
     * ```typescript
     * // get the row data for the first selected row
     * let selectedRowData = this.grid.selectedRows[0].data;
     * ```
     */
    @Input()
    public get data(): any {
        if (this.inEditMode) {
            return mergeWith(this.grid.dataCloneStrategy.clone(this._data), this.grid.transactions.getAggregatedValue(this.key, false),
                (objValue, srcValue) => {
                    if (Array.isArray(srcValue)) {
                        return objValue = srcValue;
                    }
                });
        }
        return this._data;
    }

    public set data(v: any) {
        this._data = v;
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
     * Sets whether this specific row has disabled functionality for editing and row selection.
     * Default value is `false`.
     * ```typescript
     * this.grid.selectedRows[0].pinned = true;
     * ```
     */
    @Input({ transform: booleanAttribute })
    @HostBinding('attr.aria-disabled')
    @HostBinding('class.igx-grid__tr--disabled')
    public disabled = false;

    /**
     * Sets whether the row is pinned.
     * Default value is `false`.
     * ```typescript
     * this.grid.selectedRows[0].pinned = true;
     * ```
     */
    public set pinned(value: boolean) {
        if (value) {
            this.grid.pinRow(this.key);
        } else {
            this.grid.unpinRow(this.key);
        }
    }

    /**
     * Gets whether the row is pinned.
     * ```typescript
     * let isPinned = row.pinned;
     * ```
     */
    public get pinned(): boolean {
        return this.grid.isRecordPinned(this.data);
    }

    /**
     * Gets the expanded state of the row.
     * ```typescript
     * let isExpanded = row.expanded;
     * ```
     */
    public get expanded(): boolean {
        return this.grid.gridAPI.get_row_expansion_state(this.data);
    }

    /**
     * Expands/collapses the current row.
     *
     * ```typescript
     * this.grid.selectedRows[2].expanded = true;
     * ```
     */
    public set expanded(val: boolean) {
        this.grid.gridAPI.set_row_expansion_state(this.key, val);
    }

    public get addRowUI(): any {
        return !!this.grid.crudService.row &&
            this.grid.crudService.row.getClassName() === IgxAddRow.name &&
            this.grid.crudService.row.id === this.key;
    }

    @HostBinding('style.min-height.px')
    public get rowHeight() {
        let height = this.grid.rowHeight || 32;
        if (this.grid.hasColumnLayouts) {
            const maxRowSpan = this.grid.multiRowLayoutRowSize;
            height = height * maxRowSpan;
        }
        return this.addRowUI ? height : null;
    }

    /**
     * @hidden
     */
    @Input()
    public gridID: string;

    /**
     * @hidden
     */
    @ViewChildren('igxDirRef', { read: IgxGridForOfDirective })
    public _virtDirRow: QueryList<IgxGridForOfDirective<ColumnType, ColumnType[]>>;

    /* blazorSuppress */
    public get virtDirRow(): IgxGridForOfDirective<ColumnType, ColumnType[]> {
        return this._virtDirRow ? this._virtDirRow.first : null;
    }

    /**
     * @hidden
     */
    @ViewChild(forwardRef(() => IgxCheckboxComponent), { read: IgxCheckboxComponent })
    public checkboxElement: IgxCheckboxComponent;

    @ViewChildren('cell')
    protected _cells: QueryList<CellType>;

    /**
     * Gets the rendered cells in the row component.
     *
     * ```typescript
     * // get the cells of the third selected row
     * let selectedRowCells = this.grid.selectedRows[2].cells;
     * ```
     */
    public get cells() {
        const res = new QueryList<CellType>();
        if (!this._cells) {
            return res;
        }
        const cList = this._cells.filter((item) => item.nativeElement.parentElement !== null)
            .sort((item1, item2) => item1.column.visibleIndex - item2.column.visibleIndex);
        res.reset(cList);
        return res;
    }

    @HostBinding('attr.data-rowIndex')
    public get dataRowIndex() {
        return this.index;
    }

    /**
     * @hidden
     */
    @Input()
    @HostBinding('attr.aria-selected')
    public get selected(): boolean {
        return this.selectionService.isRowSelected(this.key);
    }

    public set selected(value: boolean) {
        if (value) {
            this.selectionService.selectRowsWithNoEvent([this.key]);
        } else {
            this.selectionService.deselectRowsWithNoEvent([this.key]);
        }
        this.grid.cdr.markForCheck();
    }

    /**
     * @hidden
     */
    public get columns(): ColumnType[] {
        return this.grid.visibleColumns;
    }

    /**
     * @hidden
     * @internal
     */
    public get viewIndex(): number {
        if ((this.grid as any).groupingExpressions.length) {
            return this.grid.filteredSortedData.indexOf(this.data);
        }
        return this.index + this.grid.page * this.grid.perPage;
    }

    /**
     * @hidden
     */
    public get pinnedColumns(): ColumnType[] {
        return this.grid.pinnedColumns;
    }

    /**
     * @hidden
     */
    public get isRoot(): boolean {
        return true;
    }

    /**
     * @hidden
     */
    public get hasChildren(): boolean {
        return false;
    }

    /**
     * @hidden
     */
    public get unpinnedColumns(): ColumnType[] {
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
        const row = this.grid.transactions.getState(this.key);
        if (row) {
            return row.type === TransactionType.ADD || row.type === TransactionType.UPDATE;
        }

        return false;
    }

    /**
     * @hidden
     */
    public get rowDraggable(): boolean {
        return this.grid.rowDraggable;
    }

    /** @hidden */
    public get added(): boolean {
        const row = this.grid.transactions.getState(this.key);
        if (row) {
            return row.type === TransactionType.ADD;
        }

        return false;
    }

    /** @hidden */
    public get deleted(): boolean {
        return this.grid.gridAPI.row_deleted_transaction(this.key);
    }

    /**
     * @hidden
     */
    public get dragging() {
        return this.grid.dragRowID === this.key;
    }

    // TODO: Refactor
    public get inEditMode(): boolean {
        if (this.grid.rowEditable) {
            const editRowState = this.grid.crudService.row;
            return (editRowState && editRowState.id === this.key) || false;
        } else {
            return false;
        }
    }

    /**
     * Gets the ID of the row.
     * A row in the grid is identified either by:
     * - primaryKey data value,
     * - the whole data, if the primaryKey is omitted.
     *
     * ```typescript
     * let rowID = this.grid.selectedRows[2].key;
     * ```
     */
    public get key() {
        const primaryKey = this.grid.primaryKey;
        if (this._data) {
            return primaryKey ? this._data[primaryKey] : this._data;
        } else {
            return undefined;
        }
    }

    /**
     * The native DOM element representing the row. Could be null in certain environments.
     *
     * ```typescript
     * // get the nativeElement of the second selected row
     * let selectedRowNativeElement = this.grid.selectedRows[1].nativeElement;
     * ```
     */
    public get nativeElement() {
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

    /**
     * @hidden
     */
    public triggerAddAnimationClass = false;

    protected destroy$ = new Subject<any>();
    protected _data: any;
    protected _addRow: boolean;

    constructor(
        @Inject(IGX_GRID_BASE) public grid: GridType,
        public selectionService: IgxGridSelectionService,
        public element: ElementRef<HTMLElement>,
        public cdr: ChangeDetectorRef) { }

    /**
     * @hidden
     * @internal
     */
    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        this.grid.rowClick.emit({
            row: this,
            event
        });

        if (this.grid.rowSelection === 'none' || this.deleted || !this.grid.selectRowOnClick) {
            return;
        }
        if (event.shiftKey && this.grid.isMultiRowSelectionEnabled) {
            this.selectionService.selectMultipleRows(this.key, this.data, event);
            return;
        }

        const clearSelection = !(+event.ctrlKey ^ +event.metaKey);
        if (this.selected && !clearSelection) {
            this.selectionService.deselectRow(this.key, event);
        } else {
            this.selectionService.selectRowById(this.key, clearSelection, event);
        }
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('contextmenu', ['$event'])
    public onContextMenu(event: MouseEvent) {
        const cell = (event.target as HTMLElement).closest('.igx-grid__td');
        this.grid.contextMenu.emit({
            row: this,
            cell: this.cells.find(c => c.nativeElement === cell),
            event
        });
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('mouseenter')
    public showActionStrip() {
        if (this.grid.actionStrip) {
            this.grid.actionStrip.show(this);
        }
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('mouseleave')
    public hideActionStrip() {
        if (this.grid.actionStrip && this.grid.actionStrip.hideOnRowLeave) {
            this.grid.actionStrip.hide();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public ngAfterViewInit() {
        // If the template of the row changes, the forOf in it is recreated and is not detected by the grid and rows can't be scrolled.
        this._virtDirRow.changes.pipe(takeUntil(this.destroy$)).subscribe(() => this.grid.resetHorizontalVirtualization());
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden
     */
    public onRowSelectorClick(event) {
        event.stopPropagation();
        if (event.shiftKey && this.grid.isMultiRowSelectionEnabled) {
            this.selectionService.selectMultipleRows(this.key, this.data, event);
            return;
        }
        if (this.selected) {
            this.selectionService.deselectRow(this.key, event);
        } else {
            this.selectionService.selectRowById(this.key, false, event);
        }
    }

    /**
     * Updates the specified row object and the data source record with the passed value.
     *
     * ```typescript
     * // update the second selected row's value
     * let newValue = "Apple";
     * this.grid.selectedRows[1].update(newValue);
     * ```
     */
    public update(value: any) {
        const crudService = this.grid.crudService;
        if (crudService.cellInEditMode && crudService.cell.id.key === this.key) {
            this.grid.transactions.endPending(false);
        }
        const row = new IgxEditRow(this.key, this.index, this.data, this.grid);
        this.grid.gridAPI.update_row(row, value);
        this.cdr.markForCheck();
    }

    /**
     * Removes the specified row from the grid's data source.
     * This method emits `rowDeleted` event.
     *
     * ```typescript
     * // delete the third selected row from the grid
     * this.grid.selectedRows[2].delete();
     * ```
     */
    public delete() {
        this.grid.deleteRowById(this.key);
    }

    public isCellActive(visibleColumnIndex) {
        const node = this.grid.navigation.activeNode;
        return node ? node.row === this.index && node.column === visibleColumnIndex : false;
    }

    /**
     * Pins the specified row.
     * This method emits `rowPinning`\`rowPinned` event.
     *
     * ```typescript
     * // pin the selected row from the grid
     * this.grid.selectedRows[0].pin();
     * ```
     */
    public pin() {
        return this.grid.pinRow(this.key);
    }

    /**
     * Unpins the specified row.
     * This method emits `rowPinning`\`rowPinned` event.
     *
     * ```typescript
     * // unpin the selected row from the grid
     * this.grid.selectedRows[0].unpin();
     * ```
     */
    public unpin() {
        return this.grid.unpinRow(this.key);
    }

    /**
     * @hidden
     */
    public get rowCheckboxAriaLabel() {
        return this.grid.primaryKey ?
            this.selected ? 'Deselect row with key ' + this.key : 'Select row with key ' + this.key :
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
    public shouldDisplayPinnedChip(visibleColumnIndex: number): boolean {
        return this.pinned && this.disabled && visibleColumnIndex === 0;
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
    public beginAddRow() {
        this.grid.crudService.enterAddRowMode(this);
    }

    /**
     * @hidden
     */
    public triggerAddAnimation() {
        this.triggerAddAnimationClass = true;
    }

    /**
     * @hidden
     */
    public animationEndHandler() {
        this.triggerAddAnimationClass = false;
        this.addAnimationEnd.emit(this);
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
