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
import { of } from "rxjs/observable/of";
import { debounceTime, delay, merge, repeat, take, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs/Subject";
import { cloneArray } from "../core/utils";
import { DataType } from "../data-operations/data-util";
import { FilteringLogic, IFilteringExpression } from "../data-operations/filtering-expression.interface";
import { ISortingExpression, SortingDirection } from "../data-operations/sorting-expression.interface";
import { IgxForOfDirective } from "../directives/for-of/for_of.directive";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { ISummaryExpression } from "./grid-summary";
import { IgxGridRowComponent } from "./row.component";

let NEXT_ID = 0;
const DEBOUNCE_TIME = 16;

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

    @HostBinding("style.height")
    @Input()
    public height;

    @HostBinding("style.width")
    @Input()
    public width;

    get headerWidth() {
        return parseInt(this.width, 10) - 17;
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

    @ViewChild("theadRow")
    public theadRow: ElementRef;

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

    public pagingState;
    public calcWidth: number;
    public calcHeight: number;

    public cellInEditMode: IgxGridCellComponent;

    public eventBus = new Subject<boolean>();
    protected destroy$ = new Subject<boolean>();

    protected _perPage = 15;
    protected _page = 0;
    protected _paging = false;
    protected _pipeTrigger = 0;
    protected _columns: IgxColumnComponent[] = [];
    protected _pinnedColumns: IgxColumnComponent[] = [];
    protected _unpinnedColumns: IgxColumnComponent[] = [];
    protected _filteringLogic = FilteringLogic.And;
    protected _filteringExpressions = [];
    protected _sortingExpressions = [];
    private resizeHandler;
    private columnListDiffer;

    constructor(
        private gridAPI: IgxGridAPIService,
        private elementRef: ElementRef,
        private zone: NgZone,
        @Inject(DOCUMENT) private document,
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
        this.columnListDiffer = this.differs.find([]).create(null);
        this.calcWidth = this.width && this.width.indexOf("%") === -1 ? parseInt(this.width, 10) : 0;
        this.calcHeight = 0;
    }

    public ngAfterContentInit() {
        if (this.autoGenerate) {
            this.autogenerateColumns();
        }

        this.initColumns(this.columnList, (col: IgxColumnComponent) => this.onColumnInit.emit(col));
        this.columnListDiffer.diff(this.columnList);
        this.markForCheck();

        this.columnList.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe((change: QueryList<IgxColumnComponent>) => {
                const diff = this.columnListDiffer.diff(change);
                if (diff) {

                    this.initColumns(this.columnList);

                    diff.forEachAddedItem((record: IterableChangeRecord<IgxColumnComponent>) => this.onColumnInit.emit(record.item));

                    diff.forEachRemovedItem((record: IterableChangeRecord<IgxColumnComponent>) => {

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

        this.calculateGridSizes();
        this.setEventBusSubscription();
        this.setVerticalScrollSubscription();
        this.cdr.detectChanges();
    }

    public ngOnDestroy() {
        this.zone.runOutsideAngular(() => this.document.defaultView.removeEventListener("resize", this.resizeHandler));
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    get pinnedWidth() {
        return this.getPinnedWidth();
    }

    get unpinnedWidth() {
        return this.getUnpinnedWidth();
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
        this.markForCheck();
        this.calculateGridSizes();
    }

    public disableSummaries(...rest) {
        if (rest.length === 1 && Array.isArray(rest[0])) {
            this._disableMultipleSummaries(rest[0], false);
        } else {
            this._summaries(rest[0], false);
        }
        this.markForCheck();
        this.calculateGridSizes();
    }

    public clearFilter(name?: string) {

        if (!name) {
            this.filteringExpressions = [];
            return;
        }
        if (!this.gridAPI.get_column_by_name(this.id, name)) {
            return;
        }
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

        /**
         * If the column that we want to pin is bigger or equal than the unpinned area we should not pin it.
         * It should be also unpinned before pinning, since changing left/right pin area doesn't affect unpinned area.
         */
        if (parseInt(col.width, 10) >= this.getUnpinnedWidth(true) && !col.pinned) {
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

    public unpinColumn(columnName: string) {
        const col = this.getColumnByName(columnName);
        col.pinned = false;
        this._unpinnedColumns.splice(col.index, 0, col);
        if (this._pinnedColumns.indexOf(col) !== -1) {
            this._pinnedColumns.splice(this._pinnedColumns.indexOf(col), 1);
        }
        this.markForCheck();
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

    protected calculateGridSizes() {
        const computed = this.document.defaultView.getComputedStyle(this.nativeElement);
        if (!this.width) {
            /*no width specified.*/
            this.calcWidth = null;
        } else if (this.width && this.width.indexOf("%") !== -1) {
            /* width in %*/
            this.calcWidth = parseInt(computed.getPropertyValue("width"), 10);
        }
        if (!this.height) {
            /*no height specified.*/
            this.calcHeight = null;
        } else if (this.height && this.height.indexOf("%") !== -1) {
            /*height in %*/
            let pagingHeight = 0;
            if (this.paging) {
                pagingHeight = this.paginator.nativeElement.firstElementChild ?
                this.paginator.nativeElement.clientHeight : 0;
            }
            const footerHeight = this.tfoot.nativeElement.firstElementChild ?
            this.tfoot.nativeElement.clientHeight : 0;
            this.calcHeight = parseInt(computed.getPropertyValue("height"), 10) -
                this.theadRow.nativeElement.clientHeight -
                footerHeight - pagingHeight -
                this.scr.nativeElement.clientHeight;
        } else {
            let pagingHeight = 0;
            if (this.paging) {
                pagingHeight = this.paginator.nativeElement.firstElementChild ?
                this.paginator.nativeElement.clientHeight : 0;
            }
            const footerHeight = this.tfoot.nativeElement.firstElementChild ?
            this.tfoot.nativeElement.clientHeight : 0;
            this.calcHeight = parseInt(this.height, 10) -
                this.theadRow.nativeElement.getBoundingClientRect().height -
                footerHeight - pagingHeight -
                this.scr.nativeElement.clientHeight;
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
        return sum;
    }

    /**
     * Gets calculated width of the unpinned area
     * @param takeHidden If we should take into account the hidden columns in the pinned area
     */
    protected getUnpinnedWidth(takeHidden = false) {
        const width = this.width && this.width.indexOf("%") !== -1 ?
            this.calcWidth :
            parseInt(this.width, 10);
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
        this.parentVirtDir.onChunkLoad.pipe(
            takeUntil(this.destroy$),
            take(1),
            merge(of({})),
            delay(DEBOUNCE_TIME),
            repeat()
        ).subscribe(() => {
            if (this.cellInEditMode) {
                this.cellInEditMode.inEditMode = false;
            }
        });
    }
}
