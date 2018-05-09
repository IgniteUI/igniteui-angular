import { DOCUMENT } from "@angular/common";
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    Inject,
    Input,
    IterableChangeRecord,
    IterableDiffers,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from "@angular/core";
import { of, Subject } from "rxjs";
import { debounceTime, delay, merge, repeat, take, takeUntil } from "rxjs/operators";
import { IgxSelectionAPIService } from "../core/selection";
import { cloneArray } from "../core/utils";
import { DataType } from "../data-operations/data-util";
import { FilteringLogic, IFilteringExpression } from "../data-operations/filtering-expression.interface";
import { ISortingExpression, SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxForOfDirective } from "../directives/for-of/for_of.directive";
import { IForOfState } from "../directives/for-of/IForOfState";
import { IgxCheckboxComponent } from "./../checkbox/checkbox.component";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { ISummaryExpression } from "./grid-summary";
import { IgxGridRowComponent } from "./row.component";

let NEXT_ID = 0;
const DEBOUNCE_TIME = 16;
const DEFAULT_SUMMARY_HEIGHT = 36.36;
const MINIMUM_COLUMN_WIDTH = 136;

export interface IGridCellEventArgs {
    cell: IgxGridCellComponent;
    event: Event;
}

export interface IGridEditEventArgs {
    row: IgxGridRowComponent;
    cell: IgxGridCellComponent;
    currentValue: any;
    newValue: any;
}

export interface IPinColumnEventArgs {
    column: IgxColumnComponent;
    insertAtIndex: number;
}

export interface IPageEventArgs {
    previous: number;
    current: number;
}

export interface IRowDataEventArgs {
    data: any;
}

export interface IColumnResizeEventArgs {
    column: IgxColumnComponent;
    prevWidth: string;
    newWidth: string;
}

export interface IRowSelectionEventArgs {
    oldSelection: any[];
    newSelection: any[];
    row?: IgxGridRowComponent;
    event?: Event;
}

/**
 * **Ignite UI for Angular Grid** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html)
 *
 * The Ignite UI Grid is used for presenting and manipulating tabular data in the simplest way possible.  Once data
 * has been bound, it can be manipulated through filtering, sorting & editing operations.
 *
 * Example:
 * ```html
 * <igx-grid [data]="employeeData" autoGenerate="false">
 *   <igx-column field="first" header="First Name"></igx-column>
 *   <igx-column field="last" header="Last Name"></igx-column>
 *   <igx-column field="role" header="Role"></igx-column>
 * </igx-grid>
 * ```
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: "igx-grid",
    templateUrl: "./grid.component.html"
})
export class IgxGridComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {

    @Input()
    public data = [];

    @Input()
    public autoGenerate = false;

    @HostBinding("attr.id")
    @Input()
    public id = `igx-grid-${NEXT_ID++}`;

    @Input()
    public filteringLogic = FilteringLogic.And;

    @Input()
    get filteringExpressions() {
        return this._filteringExpressions;
    }

    set filteringExpressions(value) {
        this._filteringExpressions = cloneArray(value);
        this.cdr.markForCheck();
    }

    get filteredData() {
        return this._filteredData;
    }

    set filteredData(value) {
        this._filteredData = value;
        if (this.rowSelectable) {
            this.updateHeaderChecboxStatusOnFilter(this._filteredData);
        }
    }

    @Input()
    get paging(): boolean {
        return this._paging;
    }

    set paging(value: boolean) {
        this._paging = value;
        this._pipeTrigger++;
        this.cdr.markForCheck();
    }

    @Input()
    get page(): number {
        return this._page;
    }

    set page(val: number) {
        if (val < 0) {
            return;
        }
        this.onPagingDone.emit({ previous: this._page, current: val });
        this._page = val;
        this.cdr.markForCheck();
    }

    @Input()
    get perPage(): number {
        return this._perPage;
    }

    set perPage(val: number) {
        if (val < 0) {
            return;
        }
        this._perPage = val;
        this.page = 0;
    }

    @Input()
    public paginationTemplate: TemplateRef<any>;

    @Input()
    get rowSelectable(): boolean {
        return this._rowSelection;
    }

    set rowSelectable(val: boolean) {
        this._rowSelection = val;
        if (this.gridAPI.get(this.id)) {

            // should selection persist?
            this.allRowsSelected = false;
            this.deselectAllRows();
            this.markForCheck();
        }
    }

    @HostBinding("style.height")
    @Input()
    public get height() {
        return this._height;
    }
    public set height(value: any) {
        if (this._height !== value) {
            this._height = value;
            requestAnimationFrame(() => {
                this.calculateGridHeight();
                this.cdr.markForCheck();
            });
        }
    }

    @HostBinding("style.width")
    @Input()
    public get width() {
        return this._width;
    }
    public set width(value: any) {
        if (this._width !== value) {
            this._width = value;
            requestAnimationFrame(() => {
                this.calculateGridWidth();
                this.cdr.markForCheck();
            });
        }
    }

    get headerWidth() {
        return parseInt(this._width, 10) - 17;
    }

    @Input()
    public evenRowCSS = "";

    @Input()
    public oddRowCSS = "";

    @Input()
    public rowHeight = 50;

    @Input()
    public columnWidth: string = null;

    @Input()
    public primaryKey;

    @Output()
    public onCellClick = new EventEmitter<IGridCellEventArgs>();

    @Output()
    public onSelection = new EventEmitter<IGridCellEventArgs>();

    @Output()
    public onRowSelectionChange = new EventEmitter<IRowSelectionEventArgs>();

    @Output()
    public onColumnPinning = new EventEmitter<IPinColumnEventArgs>();

    /**
     * An @Output property emitting an event when cell or row editing has been performed in the grid.
     * On cell editing, both cell and row objects in the event arguments are defined for the corresponding
     * cell that is being edited and the row the cell belongs to.
     * On row editing, only the row object is defined, for the row that is being edited.
     * The cell object is null on row editing.
     */
    @Output()
    public onEditDone = new EventEmitter<IGridEditEventArgs>();

    @Output()
    public onColumnInit = new EventEmitter<IgxColumnComponent>();

    @Output()
    public onSortingDone = new EventEmitter<ISortingExpression>();

    @Output()
    public onFilteringDone = new EventEmitter<IFilteringExpression>();

    @Output()
    public onPagingDone = new EventEmitter<IPageEventArgs>();

    @Output()
    public onRowAdded = new EventEmitter<IRowDataEventArgs>();

    @Output()
    public onRowDeleted = new EventEmitter<IRowDataEventArgs>();

    @Output()
    public onDataPreLoad = new EventEmitter<any>();

    @Output()
    public onColumnResized = new EventEmitter<IColumnResizeEventArgs>();

    @Output()
    public onContextMenu = new EventEmitter<IGridCellEventArgs>();

    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent })
    public columnList: QueryList<IgxColumnComponent>;

    @ViewChildren(IgxGridRowComponent, { read: IgxGridRowComponent })
    public rowList: QueryList<IgxGridRowComponent>;

    @ViewChild("scrollContainer", { read: IgxForOfDirective })
    public parentVirtDir: IgxForOfDirective<any>;

    @ViewChild("verticalScrollContainer", { read: IgxForOfDirective })
    public verticalScrollContainer: IgxForOfDirective<any>;

    @ViewChild("scr", { read: ElementRef })
    public scr: ElementRef;

    @ViewChild("paginator", { read: ElementRef })
    public paginator: ElementRef;

    @ViewChild("headerContainer", { read: IgxForOfDirective })
    public headerContainer: IgxForOfDirective<any>;

    @ViewChild("headerCheckboxContainer")
    public headerCheckboxContainer: ElementRef;

    @ViewChild("headerCheckbox", { read: IgxCheckboxComponent })
    public headerCheckbox: IgxCheckboxComponent;

    @ViewChild("theadRow")
    public theadRow: ElementRef;

    @ViewChild("tbody")
    public tbody: ElementRef;

    @ViewChild("tfoot")
    public tfoot: ElementRef;

    @HostBinding("attr.tabindex")
    public tabindex = 0;

    @HostBinding("attr.class")
    public hostClass = "igx-grid";

    @HostBinding("attr.role")
    public hostRole = "grid";

    get pipeTrigger(): number {
        return this._pipeTrigger;
    }

    @Input()
    get sortingExpressions() {
        return this._sortingExpressions;
    }

    set sortingExpressions(value) {
        this._sortingExpressions = cloneArray(value);
        this.cdr.markForCheck();
    }

    get virtualizationState() {
        return this.verticalScrollContainer.state;
    }
    set virtualizationState(state) {
        this.verticalScrollContainer.state = state;
    }

    get totalItemCount() {
        return this.verticalScrollContainer.totalItemCount;
    }
    set totalItemCount(count) {
        this.verticalScrollContainer.totalItemCount = count;
        this.cdr.detectChanges();
    }

    public pagingState;
    public calcWidth: number;
    public calcRowCheckboxWidth: number;
    public calcHeight: number;
    public tfootHeight: number;

    public cellInEditMode: IgxGridCellComponent;

    public eventBus = new Subject<boolean>();

    public allRowsSelected = false;

    protected destroy$ = new Subject<boolean>();

    protected _perPage = 15;
    protected _page = 0;
    protected _paging = false;
    protected _rowSelection = false;
    protected _pipeTrigger = 0;
    protected _columns: IgxColumnComponent[] = [];
    protected _pinnedColumns: IgxColumnComponent[] = [];
    protected _unpinnedColumns: IgxColumnComponent[] = [];
    protected _filteringLogic = FilteringLogic.And;
    protected _filteringExpressions = [];
    protected _sortingExpressions = [];
    private _filteredData = null;
    private resizeHandler;
    private columnListDiffer;
    private _height = "100%";
    private _width = "100%";

    constructor(
        private gridAPI: IgxGridAPIService,
        private selectionAPI: IgxSelectionAPIService,
        private elementRef: ElementRef,
        private zone: NgZone,
        @Inject(DOCUMENT) public document,
        public cdr: ChangeDetectorRef,
        private resolver: ComponentFactoryResolver,
        private differs: IterableDiffers,
        private viewRef: ViewContainerRef) {

        this.resizeHandler = () => {
            this.calculateGridSizes();
            this.zone.run(() => this.markForCheck());
        };
    }

    public ngOnInit() {
        this.gridAPI.register(this);
        this.setEventBusSubscription();
        this.setVerticalScrollSubscription();
        this.columnListDiffer = this.differs.find([]).create(null);
        this.calcWidth = this._width && this._width.indexOf("%") === -1 ? parseInt(this._width, 10) : 0;
        this.calcHeight = 0;
        this.calcRowCheckboxWidth = 0;
    }

    public ngAfterContentInit() {
        if (this.autoGenerate) {
            this.autogenerateColumns();
        }

        this.initColumns(this.columnList, (col: IgxColumnComponent) => this.onColumnInit.emit(col));
        this.columnListDiffer.diff(this.columnList);
        this.clearSummaryCache();
        this.tfootHeight = this.calcMaxSummaryHeight();
        this._derivePossibleHeight();
        this.markForCheck();

        this.columnList.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe((change: QueryList<IgxColumnComponent>) => {
                const diff = this.columnListDiffer.diff(change);
                if (diff) {

                    this.initColumns(this.columnList);

                    diff.forEachAddedItem((record: IterableChangeRecord<IgxColumnComponent>) => {
                        this.clearSummaryCache();
                        this.calculateGridSizes();
                        this.onColumnInit.emit(record.item);
                    });

                    diff.forEachRemovedItem((record: IterableChangeRecord<IgxColumnComponent>) => {
                        // Recalculate Summaries
                        this.clearSummaryCache();
                        this.calculateGridSizes();

                        // Clear Filtering
                        this.gridAPI.clear_filter(this.id, record.item.field);

                        // Clear Sorting
                        this.gridAPI.clear_sort(this.id, record.item.field);
                    });
                }
                this.markForCheck();
            });
}

    public ngAfterViewInit() {
        this.zone.runOutsideAngular(() => {
            this.document.defaultView.addEventListener("resize", this.resizeHandler);
        });
        this._derivePossibleWidth();
        this.calculateGridSizes();

    }

    public ngOnDestroy() {
        this.zone.runOutsideAngular(() => this.document.defaultView.removeEventListener("resize", this.resizeHandler));
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public dataLoading(event) {
        this.onDataPreLoad.emit(event);
    }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    get calcResizerHeight(): number {
        if (this.hasSummarizedColumns) {
            return this.theadRow.nativeElement.clientHeight + this.tbody.nativeElement.clientHeight +
                this.tfoot.nativeElement.clientHeight;
        }
        return this.theadRow.nativeElement.clientHeight + this.tbody.nativeElement.clientHeight;
    }

    get calcPinnedContainerMaxWidth(): number {
        return (this.calcWidth * 80) / 100;
    }

    get unpinnedAreaMinWidth(): number {
        return (this.calcWidth * 20) / 100;
    }
    get pinnedWidth() {
        return this.getPinnedWidth();
    }

    get unpinnedWidth() {
        return this.getUnpinnedWidth();
    }

    get summariesMargin() {
        return this.rowSelectable ? this.calcRowCheckboxWidth : 0;
    }

    get columns(): IgxColumnComponent[] {
        return this._columns;
    }

    get pinnedColumns(): IgxColumnComponent[] {
        return this._pinnedColumns.filter((col) => !col.hidden);
    }

    get unpinnedColumns(): IgxColumnComponent[] {
        return this._unpinnedColumns.filter((col) => !col.hidden).sort((col1, col2) => col1.index - col2.index);
    }

    public getColumnByName(name: string): IgxColumnComponent {
        return this.columnList.find((col) => col.field === name);
    }

    public getRowByIndex(index: number): IgxGridRowComponent {
        return this.gridAPI.get_row_by_index(this.id, index);
    }

    public getRowByKey(keyValue: any): IgxGridRowComponent {
        return this.gridAPI.get_row_by_key(this.id, keyValue);
    }

    get visibleColumns(): IgxColumnComponent[] {
        return this.columnList.filter((col) => !col.hidden);
    }

    public getCellByColumn(rowSelector: any, columnField: string): IgxGridCellComponent {
        return this.gridAPI.get_cell_by_field(this.id, rowSelector, columnField);
    }

    get totalPages(): number {
        if (this.pagingState) {
            return this.pagingState.metadata.countPages;
        }
        return -1;
    }

    get totalRecords(): number {
        if (this.pagingState) {
            return this.pagingState.metadata.countRecords;
        }
    }

    get isFirstPage(): boolean {
        return this.page === 0;
    }

    get isLastPage(): boolean {
        return this.page + 1 >= this.totalPages;
    }

    get totalWidth(): number {
        const cols = this.visibleColumns;
        let totalWidth = 0;
        let i = 0;
        for (i; i < cols.length; i++) {
            totalWidth += parseInt(cols[i].width, 10) || 0;
        }
        return totalWidth;
    }

    public nextPage(): void {
        if (!this.isLastPage) {
            this.page += 1;
        }
    }

    public previousPage(): void {
        if (!this.isFirstPage) {
            this.page -= 1;
        }
    }

    public paginate(val: number): void {
        if (val < 0) {
            return;
        }
        this.page = val;
    }

    public markForCheck() {
        if (this.rowList) {
            this.rowList.forEach((row) => row.cdr.markForCheck());
        }
        this.cdr.detectChanges();
    }

    public addRow(data: any): void {
        this.data.push(data);
        this.onRowAdded.emit({ data });
        this._pipeTrigger++;
        this.cdr.markForCheck();
    }

    public deleteRow(rowSelector: any): void {
        const row = this.gridAPI.get_row_by_key(this.id, rowSelector);
        if (row) {
            const index = this.data.indexOf(row.rowData);
            if (this.rowSelectable === true) {
                this.deselectRows([row.rowID]);
            }
            this.data.splice(index, 1);
            this.onRowDeleted.emit({ data: row.rowData });
            this._pipeTrigger++;
            this.cdr.markForCheck();
        }
    }

    public updateCell(value: any, rowSelector: any, column: string): void {
        const cell = this.gridAPI.get_cell_by_field(this.id, rowSelector, column);
        if (cell) {
            cell.update(value);
            this._pipeTrigger++;
        }
    }

    public updateRow(value: any, rowSelector: any): void {
        const row = this.gridAPI.get_row_by_key(this.id, rowSelector);
        if (row) {
            if (this.primaryKey !== undefined && this.primaryKey !== null) {
                value[this.primaryKey] = row.rowData[this.primaryKey];
            }
            this.gridAPI.update_row(value, this.id, row);
            this._pipeTrigger++;
            this.cdr.markForCheck();
        }
    }

    public sort(...rest): void {
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._sortMultiple(rest[0]);
        } else {
            this._sort(rest[0], rest[1], rest[2]);
        }
    }

    public filter(...rest): void {
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._filterMultiple(rest[0]);
        } else {
            this._filter(rest[0], rest[1], rest[2], rest[3]);
        }
    }

    public filterGlobal(value: any, condition?, ignoreCase?) {
        this.gridAPI.filter_global(this.id, value, condition, ignoreCase);
    }

    public enableSummaries(...rest) {
        if (rest.length === 1 && Array.isArray(rest[0])) {
            this._multipleSummaries(rest[0], true);
        } else {
            this._summaries(rest[0], true, rest[1]);
        }
        this.tfootHeight = 0;
        this.markForCheck();
        this.calculateGridHeight();
        this.cdr.detectChanges();
    }

    public disableSummaries(...rest) {
        if (rest.length === 1 && Array.isArray(rest[0])) {
            this._disableMultipleSummaries(rest[0], false);
        } else {
            this._summaries(rest[0], false);
        }
        this.tfootHeight = 0;
        this.markForCheck();
        this.calculateGridHeight();
        this.cdr.detectChanges();
    }

    public clearFilter(name?: string) {

        if (!name) {
            this.filteringExpressions = [];
            return;
        }
        if (!this.gridAPI.get_column_by_name(this.id, name)) {
            return;
        }
        this.clearSummaryCache();
        this.gridAPI.clear_filter(this.id, name);
    }

    public clearSort(name?: string) {
        if (!name) {
            this.sortingExpressions = [];
            return;
        }
        if (!this.gridAPI.get_column_by_name(this.id, name)) {
            return;
        }
        this.gridAPI.clear_sort(this.id, name);
    }

    public clearSummaryCache() {
        this.gridAPI.remove_summary(this.id);
    }

    public pinColumn(columnName: string): boolean {
        const col = this.getColumnByName(columnName);
        const colWidth = parseInt(col.width, 10);

        if (col.pinned) {
            return false;
        }
        /**
         * If the column that we want to pin is bigger or equal than the unpinned area we should not pin it.
         * It should be also unpinned before pinning, since changing left/right pin area doesn't affect unpinned area.
         */
        if (this.getUnpinnedWidth(true) - colWidth < this.unpinnedAreaMinWidth) {
            return false;
        }

        col.pinned = true;
        const index = this._pinnedColumns.length;

        const args = { column: col, insertAtIndex: index };
        this.onColumnPinning.emit(args);

        // update grid collections.
        if (this._pinnedColumns.indexOf(col) === -1) {
            this._pinnedColumns.splice(args.insertAtIndex, 0, col);

            if (this._unpinnedColumns.indexOf(col) !== -1) {
                this._unpinnedColumns.splice(this._unpinnedColumns.indexOf(col), 1);
            }
        }
        this.markForCheck();
        return true;
    }

    public unpinColumn(columnName: string): boolean {
        const col = this.getColumnByName(columnName);

        if (!col.pinned) {
            return false;
        }
        col.pinned = false;
        this._unpinnedColumns.splice(col.index, 0, col);
        if (this._pinnedColumns.indexOf(col) !== -1) {
            this._pinnedColumns.splice(this._pinnedColumns.indexOf(col), 1);
        }
        this.markForCheck();
        return true;
    }

    /**
     * Recalculates grid width/height dimensions. Should be run when changing DOM elements dimentions manually that affect the grid's size.
     */
    public reflow() {
        this.calculateGridSizes();
    }

    get hasSortableColumns(): boolean {
        return this.columnList.some((col) => col.sortable);
    }

    get hasEditableColumns(): boolean {
        return this.columnList.some((col) => col.editable);
    }

    get hasFilterableColumns(): boolean {
        return this.columnList.some((col) => col.filterable);
    }

    get hasSummarizedColumns(): boolean {
        return this.columnList.some((col) => col.hasSummary);
    }
    get selectedCells(): IgxGridCellComponent[] | any[] {
        if (this.rowList) {
            return this.rowList.map((row) => row.cells.filter((cell) => cell.selected))
                .reduce((a, b) => a.concat(b), []);
        }
        return [];
    }

    protected get rowBasedHeight() {
        if (this.data && this.data.length) {
            return this.data.length * this.rowHeight;
        }
        return 0;
    }

    protected _derivePossibleHeight() {
        if ((this._height && this._height.indexOf("%") === -1) || !this._height) {
            return;
        }
        if (!this.nativeElement.parentNode.clientHeight) {
            const viewPortHeight = screen.height;
            this._height = this.rowBasedHeight <= viewPortHeight ? null : viewPortHeight.toString();
        } else {
            const parentHeight = this.nativeElement.parentNode.getBoundingClientRect().height;
            this._height = this.rowBasedHeight <= parentHeight ? null : this._height;
        }
        this.calculateGridHeight();
        this.cdr.detectChanges();
    }

    protected _derivePossibleWidth() {
        if (!this.columnWidth) {
            this.columnWidth = this.getPossibleColumnWidth();
            this.initColumns(this.columnList);
        }
        this.calculateGridWidth();
    }

    protected calculateGridHeight() {
        const computed = this.document.defaultView.getComputedStyle(this.nativeElement);

        if (!this._height) {
            this.calcHeight = null;
            if (this.hasSummarizedColumns && !this.tfootHeight) {
                this.tfootHeight = this.tfoot.nativeElement.firstElementChild ?
                    this.calcMaxSummaryHeight() : 0;
            }
            return;
        }

        if (this._height && this._height.indexOf("%") !== -1) {
            /*height in %*/
            let pagingHeight = 0;
            if (this.paging) {
                pagingHeight = this.paginator.nativeElement.firstElementChild ?
                    this.paginator.nativeElement.clientHeight : 0;
            }
            if (!this.tfootHeight) {
                this.tfootHeight = this.tfoot.nativeElement.firstElementChild ?
                    this.calcMaxSummaryHeight() : 0;
            }
            this.calcHeight = parseInt(computed.getPropertyValue("height"), 10) -
                this.theadRow.nativeElement.clientHeight -
                this.tfootHeight - pagingHeight -
                this.scr.nativeElement.clientHeight;
        } else {
            let pagingHeight = 0;
            if (this.paging) {
                pagingHeight = this.paginator.nativeElement.firstElementChild ?
                    this.paginator.nativeElement.clientHeight : 0;
            }
            if (!this.tfootHeight) {
                this.tfootHeight = this.tfoot.nativeElement.firstElementChild ?
                    this.calcMaxSummaryHeight() : 0;
            }
            this.calcHeight = parseInt(this._height, 10) -
                this.theadRow.nativeElement.getBoundingClientRect().height -
                this.tfootHeight - pagingHeight -
                this.scr.nativeElement.clientHeight;
        }
    }

    protected getPossibleColumnWidth() {
        let computedWidth = parseInt(
            this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue("width"), 10);

        let maxColumnWidth = Math.max(
            ...this.visibleColumns.map((col) => parseInt(col.width, 10))
                .filter((width) => !isNaN(width))
        );
        const sumExistingWidths = this.visibleColumns
        .filter((col) =>  col.width !== null)
        .reduce((prev, curr) => prev + parseInt(curr.width, 10), 0);

        if (this.rowSelectable) {
            computedWidth -= this.headerCheckboxContainer.nativeElement.clientWidth;
        }
        const visibleColsWithNoWidth = this.visibleColumns.filter((col) => col.width === null);
        maxColumnWidth = !Number.isFinite(sumExistingWidths) ?
            Math.max(computedWidth / visibleColsWithNoWidth.length, MINIMUM_COLUMN_WIDTH) :
            Math.max((computedWidth - sumExistingWidths) / visibleColsWithNoWidth.length, MINIMUM_COLUMN_WIDTH);

        return maxColumnWidth.toString();
    }

    protected calculateGridWidth() {
        const computed = this.document.defaultView.getComputedStyle(this.nativeElement);

        if (this._width && this._width.indexOf("%") !== -1) {
            /* width in %*/
            this.calcWidth = parseInt(computed.getPropertyValue("width"), 10);
            return;
        }
        this.calcWidth = parseInt(this._width, 10);
    }

    protected calcMaxSummaryHeight() {
        let maxSummaryLength = 0;
        this.columnList.filter((col) => col.hasSummary).forEach((column) => {
            this.gridAPI.set_summary_by_column_name(this.id, column.field);
            const currentLength = this.gridAPI.get_summaries(this.id).get(column.field).length;
            if (maxSummaryLength < currentLength) {
                maxSummaryLength = currentLength;
            }
        });
        return maxSummaryLength * (this.tfoot.nativeElement.clientHeight ? this.tfoot.nativeElement.clientHeight : DEFAULT_SUMMARY_HEIGHT);
    }

    protected calculateGridSizes() {
        this.calculateGridWidth();
        this.cdr.detectChanges();
        this.calculateGridHeight();
        if (this.rowSelectable) {
            this.calcRowCheckboxWidth = this.headerCheckboxContainer.nativeElement.clientWidth;
        }
        this.cdr.detectChanges();
    }

    /**
     * Gets calculated width of the start pinned area
     * @param takeHidden If we should take into account the hidden columns in the pinned area
     */
    protected getPinnedWidth(takeHidden = false) {
        const fc = takeHidden ? this._pinnedColumns : this.pinnedColumns;
        let sum = 0;
        for (const col of fc) {
            sum += parseInt(col.width, 10);
        }
        if (this.rowSelectable) {
            sum += this.calcRowCheckboxWidth;
        }
        return sum;
    }

    /**
     * Gets calculated width of the unpinned area
     * @param takeHidden If we should take into account the hidden columns in the pinned area
     */
    protected getUnpinnedWidth(takeHidden = false) {
        const width = this._width && this._width.indexOf("%") !== -1 ?
            this.calcWidth :
            parseInt(this._width, 10);
        return width - this.getPinnedWidth(takeHidden);
    }

    protected _sort(name: string, direction = SortingDirection.Asc, ignoreCase = true) {
        this.gridAPI.sort(this.id, name, direction, ignoreCase);
    }

    protected _sortMultiple(expressions: ISortingExpression[]) {
        this.gridAPI.sort_multiple(this.id, expressions);
    }

    protected _filter(name: string, value: any, condition?, ignoreCase?) {
        const col = this.gridAPI.get_column_by_name(this.id, name);
        if (col) {
            this.gridAPI
                .filter(this.id, name, value,
                    condition || col.filteringCondition, ignoreCase || col.filteringIgnoreCase);
        } else {
            this.gridAPI.filter(this.id, name, value, condition, ignoreCase);
        }
    }

    protected _filterMultiple(expressions: IFilteringExpression[]) {
        this.gridAPI.filter_multiple(this.id, expressions);
    }

    protected _summaries(fieldName: string, hasSummary: boolean, summaryOperand?: any) {
        const column = this.gridAPI.get_column_by_name(this.id, fieldName);
        column.hasSummary = hasSummary;
        if (summaryOperand) {
            column.summaries = summaryOperand;
        }
    }

    protected _multipleSummaries(expressions: ISummaryExpression[], hasSummary: boolean) {
        expressions.forEach((element) => {
            this._summaries(element.fieldName, hasSummary, element.customSummary);
        });
    }
    protected _disableMultipleSummaries(expressions: string[], hasSummary: boolean) {
        expressions.forEach((column) => { this._summaries(column, false); });
    }

    protected resolveDataTypes(rec) {
        if (typeof rec === "number") {
            return DataType.Number;
        } else if (typeof rec === "boolean") {
            return DataType.Boolean;
        } else if (typeof rec === "object" && rec instanceof Date) {
            return DataType.Date;
        }
        return DataType.String;
    }

    protected autogenerateColumns() {
        const factory = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const fields = Object.keys(this.data[0]);
        const columns = [];

        fields.forEach((field) => {
            const ref = this.viewRef.createComponent(factory);
            ref.instance.field = field;
            ref.instance.dataType = this.resolveDataTypes(this.data[0][field]);
            ref.changeDetectorRef.detectChanges();
            columns.push(ref.instance);
        });

        this.columnList.reset(columns);
    }

    protected initColumns(collection: QueryList<IgxColumnComponent>, cb: any = null) {
        collection.forEach((column: IgxColumnComponent, index: number) => {
            column.gridID = this.id;
            column.index = index;
            if (!column.width) {
                column.width = this.columnWidth;
            }
            if (cb) {
                cb(column);
            }
        });
        this._columns = this.columnList.toArray();
        this._pinnedColumns = this.columnList.filter((c) => c.pinned);
        this._unpinnedColumns = this.columnList.filter((c) => !c.pinned);
    }

    protected setEventBusSubscription() {
        this.eventBus.pipe(
            debounceTime(DEBOUNCE_TIME),
            takeUntil(this.destroy$)
        ).subscribe(() => this.cdr.detectChanges());
    }

    protected setVerticalScrollSubscription() {
        /*
            Until the grid component is destroyed,
            Take the first event and unsubscribe
            then merge with an empty observable after DEBOUNCE_TIME,
            re-subscribe and repeat the process
        */
        this.verticalScrollContainer.onChunkLoad.pipe(
            takeUntil(this.destroy$),
            take(1),
            merge(of({})),
            delay(DEBOUNCE_TIME),
            repeat()
        ).subscribe(() => {
            if (this.cellInEditMode) {
                this.cellInEditMode.inEditMode = false;
            }
            this.eventBus.next();
        });
    }

    public onHeaderCheckboxClick(event) {
        this.allRowsSelected = event.checked;
        const newSelection =
            event.checked ?
                this.filteredData ?
                    this.selectionAPI.append_items(this.id, this.selectionAPI.get_all_ids(this._filteredData, this.primaryKey)) :
                    this.selectionAPI.get_all_ids(this.data, this.primaryKey) :
                this.filteredData ?
                    this.selectionAPI.subtract_items(this.id, this.selectionAPI.get_all_ids(this._filteredData, this.primaryKey)) :
                    [];
        this.triggerRowSelectionChange(newSelection, null, event, event.checked);
        this.checkHeaderChecboxStatus(event.checked);
    }

    get headerCheckboxAriaLabel() {
        return this._filteringExpressions.length > 0 ?
            this.headerCheckbox && this.headerCheckbox.checked ? "Deselect all filtered" : "Select all filtered" :
            this.headerCheckbox && this.headerCheckbox.checked ? "Deselect all" : "Select all";
    }

    public checkHeaderChecboxStatus(headerStatus?: boolean) {
        if (headerStatus === undefined) {
            this.allRowsSelected = this.selectionAPI.are_all_selected(this.id, this.data);
            if (this.headerCheckbox) {
                this.headerCheckbox.indeterminate = !this.allRowsSelected && !this.selectionAPI.are_none_selected(this.id);
            }
            this.cdr.markForCheck();
        }
        if (this.headerCheckbox) {
            this.headerCheckbox.checked = headerStatus !== undefined ? headerStatus : false;
        }
    }

    public filteredItemsStatus(componentID: string, filteredData: any[], primaryKey?) {
        const currSelection = this.selectionAPI.get_selection(componentID);
        let atLeastOneSelected = false;
        let notAllSelected = false;
        if (currSelection) {
            for (const key of Object.keys(filteredData)) {
                const dataItem = primaryKey ? filteredData[key][primaryKey] : filteredData[key];
                if (currSelection.indexOf(dataItem) !== -1) {
                    atLeastOneSelected = true;
                    if (notAllSelected) {
                        return "indeterminate";
                    }
                } else {
                    notAllSelected = true;
                    if (atLeastOneSelected) {
                        return "indeterminate";
                    }
                }
            }
        }
        return atLeastOneSelected ? "allSelected" : "noneSelected";
    }

    public updateHeaderChecboxStatusOnFilter(data) {
        if (!data) {
            data = this.data;
        }
        switch (this.filteredItemsStatus(this.id, data)) {
            case "allSelected": {
                if (!this.allRowsSelected) {
                    this.allRowsSelected = true;
                }
                if (this.headerCheckbox.indeterminate) {
                    this.headerCheckbox.indeterminate = false;
                }
                break;
            }
            case "noneSelected": {
                if (this.allRowsSelected) {
                    this.allRowsSelected = false;
                }
                if (this.headerCheckbox.indeterminate) {
                    this.headerCheckbox.indeterminate = false;
                }
                break;
            }
            default: {
                if (!this.headerCheckbox.indeterminate) {
                    this.headerCheckbox.indeterminate = true;
                }
                if (this.allRowsSelected) {
                    this.allRowsSelected = false;
                }
                break;
            }
        }
    }

    public selectedRows() {
        return this.selectionAPI.get_selection(this.id);
    }

    public selectRows(rowIDs: any[], clearCurrentSelection?: boolean) {
        const newSelection = clearCurrentSelection ? rowIDs : this.selectionAPI.select_items(this.id, rowIDs);
        this.triggerRowSelectionChange(newSelection);
    }

    public deselectRows(rowIDs: any[]) {
        const newSelection = this.selectionAPI.deselect_items(this.id, rowIDs);
        this.triggerRowSelectionChange(newSelection);
    }

    public selectAllRows() {
        this.triggerRowSelectionChange(this.selectionAPI.get_all_ids(this.data, this.id));
    }

    public deselectAllRows() {
        this.triggerRowSelectionChange([]);
    }

    public triggerRowSelectionChange(newSelection: any[], row?: IgxGridRowComponent, event?: Event, headerStatus?: boolean) {
        const oldSelection = this.selectionAPI.get_selection(this.id);
        const args: IRowSelectionEventArgs = { oldSelection, newSelection, row, event };
        this.onRowSelectionChange.emit(args);
        this.selectionAPI.set_selection(this.id, args.newSelection);
        this.checkHeaderChecboxStatus(headerStatus);
    }
}
