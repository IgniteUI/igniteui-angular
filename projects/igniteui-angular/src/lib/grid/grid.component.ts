import { DOCUMENT } from '@angular/common';
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
} from '@angular/core';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, merge, repeat, take, takeUntil } from 'rxjs/operators';
import { IgxSelectionAPIService } from '../core/selection';
import { cloneArray } from '../core/utils';
import { IgxDensityEnabledComponent } from '../core/density';
import { DataType } from '../data-operations/data-util';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { GroupedRecords, IGroupByRecord } from '../data-operations/groupby-record.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { IForOfState } from '../directives/for-of/IForOfState';
import { IActiveHighlightInfo, IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { IgxBaseExporter } from '../services/index';
import { IgxCheckboxComponent } from './../checkbox/checkbox.component';
import { IgxGridAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { IColumnVisibilityChangedEventArgs } from './column-hiding-item.directive';
import { IgxColumnHidingComponent } from './column-hiding.component';
import { IgxColumnComponent } from './column.component';
import { ISummaryExpression } from './grid-summary';
import { IgxGroupByRowTemplateDirective, IgxColumnMovingDragDirective } from './grid.common';
import { IgxGridToolbarComponent } from './grid-toolbar.component';
import { IgxGridSortingPipe } from './grid.pipes';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './row.component';
import { IFilteringOperation } from '../../public_api';

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

export interface ISearchInfo {
    searchText: string;
    caseSensitive: boolean;
    activeMatchIndex: number;
    matchInfoCache: any[];
}

export interface IGridToolbarExportEventArgs {
    grid: IgxGridComponent;
    exporter: IgxBaseExporter;
    type: string;
    cancel: boolean;
}

export interface IColumnMovingStartEventArgs {
    source: IgxColumnComponent;
}

export interface IColumnMovingEventArgs {
    source: IgxColumnComponent;
    target: IgxColumnComponent;
    cancel: boolean;
}

export interface IColumnMovingEndEventArgs {
    source: IgxColumnComponent;
    target: IgxColumnComponent;
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
    selector: 'igx-grid',
    templateUrl: './grid.component.html'
})
export class IgxGridComponent extends IgxDensityEnabledComponent
    implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {

    @Input()
    public data = [];

    @Input()
    public autoGenerate = false;

    @HostBinding('attr.id')
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
        const highlightedItem = this.findHiglightedItem();

        this._filteredData = value;
        if (this.rowSelectable) {
            this.updateHeaderChecboxStatusOnFilter(this._filteredData);
        }

        if (highlightedItem !== null) {
            this.restoreHighlight(highlightedItem);
        }
    }

    @Input()
    get groupingExpressions() {
        return this._groupingExpressions;
    }

    set groupingExpressions(value) {
        if (value && value.length > 10) {
            throw Error('Maximum amount of grouped columns is 10.');
        }
        this._groupingExpressions = cloneArray(value);
        this.chipsGoupingExpressions = cloneArray(value);
        this.gridAPI.arrange_sorting_expressions(this.id);
        /* grouping should work in conjunction with sorting
        and without overriding seperate sorting expressions */
        this._applyGrouping();
        this.cdr.markForCheck();
    }

    @Input()
    get groupingExpansionState() {
        return this._groupingExpandState;
    }

    set groupingExpansionState(value) {
        this._groupingExpandState = cloneArray(value);
        this.cdr.markForCheck();
    }

    @Input()
    public groupsExpanded = true;

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

        let rowIndex = -1;
        const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);

        if (this.lastSearchInfo.searchText !== '') {
            rowIndex = (activeInfo.page * this._perPage) + activeInfo.rowIndex;
        }

        this._perPage = val;
        this.page = 0;

        if (this.lastSearchInfo.searchText !== '') {
            const newRowIndex = rowIndex % this._perPage;
            const newPage = Math.floor(rowIndex / this._perPage);
            IgxTextHighlightDirective.setActiveHighlight(this.id, activeInfo.columnIndex, newRowIndex, activeInfo.index, newPage);
            this.rebuildMatchCache();
        }
    }

    @Input()
    public paginationTemplate: TemplateRef<any>;

    @Input()

    get columnHiding() {
        return this._columnHiding;
    }

    set columnHiding(value) {
        this._columnHiding = value;
        if (this.gridAPI.get(this.id)) {
            this.markForCheck();
          }
    }

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

    @HostBinding('style.height')
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

    @HostBinding('style.width')
    @Input()
    public get width() {
        return this._width;
    }
    public set width(value: any) {
        if (this._width !== value) {
            this._width = value;
            requestAnimationFrame(() => {
                // Calling reflow(), because the width calculation
                // might make the horizontal scrollbar appear/disappear.
                // This will change the height, which should be recalculated.
                this.reflow();
            });
        }
    }

    get headerWidth() {
        return parseInt(this._width, 10) - 17;
    }

    protected get hostClassPrefix() {
        return 'igx-grid';
    }

    @Input()
    public evenRowCSS = '';

    @Input()
    public oddRowCSS = '';

    @Input()
    public rowHeight: number;

    @Input()
    public columnWidth: string = null;

    @Input()
    public primaryKey;

    @Input()
    public emptyGridMessage = 'No records found.';

    @Input()
    public columnHidingTitle = '';

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
    public onGroupingDone = new EventEmitter<any>();

    @Output()
    public onDataPreLoad = new EventEmitter<any>();

    @Output()
    public onColumnResized = new EventEmitter<IColumnResizeEventArgs>();

    @Output()
    public onContextMenu = new EventEmitter<IGridCellEventArgs>();

    @Output()
    public onDoubleClick = new EventEmitter<IGridCellEventArgs>();

    @Output()
    public onColumnVisibilityChanged = new EventEmitter<IColumnVisibilityChangedEventArgs>();

    @Output()
    public onColumnMovingStart = new EventEmitter<IColumnMovingStartEventArgs>();

    @Output()
    public onColumnMoving = new EventEmitter<IColumnMovingEventArgs>();

    @Output()
    public onColumnMovingEnd = new EventEmitter<IColumnMovingEndEventArgs>();

    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent })
    public columnList: QueryList<IgxColumnComponent>;

    @ContentChild(IgxGroupByRowTemplateDirective, { read: IgxGroupByRowTemplateDirective })
    protected groupTemplate: IgxGroupByRowTemplateDirective;

    @ViewChildren('row')
    public rowList: QueryList<any>;

    @ViewChildren(IgxGridRowComponent, { read: IgxGridRowComponent })
    public dataRowList: QueryList<any>;

    @ViewChildren(IgxGridGroupByRowComponent, { read: IgxGridGroupByRowComponent })
    public groupedRowList: QueryList<IgxGridGroupByRowComponent>;

    @ViewChild('emptyGrid', { read: TemplateRef })
    public emptyGridTemplate: TemplateRef<any>;

    @ViewChild('scrollContainer', { read: IgxForOfDirective })
    public parentVirtDir: IgxForOfDirective<any>;

    @ViewChild('verticalScrollContainer', { read: IgxForOfDirective })
    public verticalScrollContainer: IgxForOfDirective<any>;

    @ViewChild('scr', { read: ElementRef })
    public scr: ElementRef;

    @ViewChild('paginator', { read: ElementRef })
    public paginator: ElementRef;

    @ViewChild('headerContainer', { read: IgxForOfDirective })
    public headerContainer: IgxForOfDirective<any>;

    @ViewChild('headerCheckboxContainer')
    public headerCheckboxContainer: ElementRef;

    @ViewChild('headerGroupContainer')
    public headerGroupContainer: ElementRef;

    @ViewChild('headerCheckbox', { read: IgxCheckboxComponent })
    public headerCheckbox: IgxCheckboxComponent;

    @ViewChild('groupArea')
    public groupArea: ElementRef;

    @ViewChild('theadRow')
    public theadRow: ElementRef;

    @ViewChild('tbody')
    public tbody: ElementRef;

    @ViewChild('tfoot')
    public tfoot: ElementRef;

    @ViewChild('columnHidingUI')
    public columnHidingUI: IgxColumnHidingComponent;

    @ViewChild('summaries')
    public summaries: ElementRef;


    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('attr.role')
    public hostRole = 'grid';

    get pipeTrigger(): number {
        return this._pipeTrigger;
    }

    @Input()
    get sortingExpressions() {
        return this._sortingExpressions;
    }

    set sortingExpressions(value) {
        const highlightedItem = this.findHiglightedItem();

        this._sortingExpressions = cloneArray(value);
        this.cdr.markForCheck();

        if (highlightedItem !== null) {
            this.restoreHighlight(highlightedItem);
        }
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

    get hiddenColumnsCount() {
        return this.columnList.filter((col) => col.hidden === true).length;
    }

    @Input()
    get hiddenColumnsText() {
        return this._hiddenColumnsText;
    }

    set hiddenColumnsText(value) {
        this._hiddenColumnsText = value;
    }

    /* Toolbar related definitions */

    private _showToolbar = false;
    private _exportExcel = false;
    private _exportCsv = false;
    private _toolbarTitle: string = null;
    private _exportText: string = null;
    private _exportExcelText: string = null;
    private _exportCsvText: string = null;

    @ViewChild('toolbar', { read: IgxGridToolbarComponent })
    public toolbar: IgxGridToolbarComponent = null;

    @ViewChild('toolbar', { read: ElementRef })
    private toolbarHtml: ElementRef = null;

    @Input()
    public get showToolbar(): boolean {
        return this._showToolbar;
    }

    public set showToolbar(newValue: boolean) {
        if (this._showToolbar !== newValue) {
            this._showToolbar = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    @Input()
    public get toolbarTitle(): string {
        return this._toolbarTitle;
    }

    public set toolbarTitle(newValue: string) {
        if (this._toolbarTitle !== newValue) {
            this._toolbarTitle = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    @Input()
    public get exportExcel(): boolean {
        return this._exportExcel;
    }

    public set exportExcel(newValue: boolean) {
        if (this._exportExcel !== newValue) {
            this._exportExcel = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    @Input()
    public get exportCsv(): boolean {
        return this._exportCsv;
    }

    public set exportCsv(newValue: boolean) {
        if (this._exportCsv !== newValue) {
            this._exportCsv = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    @Input()
    public get exportText(): string {
        return this._exportText;
    }

    public set exportText(newValue: string) {
        if (this._exportText !== newValue) {
            this._exportText = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    @Input()
    public get exportExcelText(): string {
        return this._exportExcelText;
    }

    public set exportExcelText(newValue: string) {
        if (this._exportExcelText !== newValue) {
            this._exportExcelText = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    @Input()
    public get exportCsvText(): string {
        return this._exportCsvText;
    }

    public set exportCsvText(newValue: string) {
        if (this._exportCsvText !== newValue) {
            this._exportCsvText = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    @Output()
    public onToolbarExporting = new EventEmitter<IGridToolbarExportEventArgs>();

    /* End of toolbar related definitions */

    public pagingState;
    public calcWidth: number;
    public calcRowCheckboxWidth: number;
    public calcHeight: number;
    public tfootHeight: number;
    public chipsGoupingExpressions = [];
    public summariesHeight: number;

    public cellInEditMode: IgxGridCellComponent;
    public draggedColumn: IgxColumnComponent;
    public isColumnResizing: boolean;

    public eventBus = new Subject<boolean>();

    public allRowsSelected = false;

    public lastSearchInfo: ISearchInfo = {
        searchText: '',
        caseSensitive: false,
        activeMatchIndex: 0,
        matchInfoCache: []
    };

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
    protected _groupingExpressions = [];
    protected _groupingExpandState: IGroupByExpandState[] = [];
    protected _groupRowTemplate: TemplateRef<any>;
    protected _groupAreaTemplate: TemplateRef<any>;
    protected _columnHiding = false;
    private _filteredData = null;
    private resizeHandler;
    private columnListDiffer;
    private _hiddenColumnsText = '';
    private _height = '100%';
    private _width = '100%';
    private _ngAfterViewInitPaassed = false;

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

        super();
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
        this.calcWidth = this._width && this._width.indexOf('%') === -1 ? parseInt(this._width, 10) : 0;
        this.calcHeight = 0;
        this.calcRowCheckboxWidth = 0;
        this.rowHeight = this.rowHeight ? this.rowHeight : this.defaultRowHeight;

        this.onRowAdded.pipe(takeUntil(this.destroy$)).subscribe(() => this.clearSummaryCache());
        this.onRowDeleted.pipe(takeUntil(this.destroy$)).subscribe(() => this.clearSummaryCache());
        this.onFilteringDone.pipe(takeUntil(this.destroy$)).subscribe(() => this.clearSummaryCache());
        this.onEditDone.pipe(takeUntil(this.destroy$)).subscribe((editCell) => { this.clearSummaryCache(editCell); });
    }

    public ngAfterContentInit() {
        if (this.autoGenerate) {
            this.autogenerateColumns();
        }
        if (this.groupTemplate) {
            this._groupRowTemplate = this.groupTemplate.template;
        }

        this.initColumns(this.columnList, (col: IgxColumnComponent) => this.onColumnInit.emit(col));
        this.columnListDiffer.diff(this.columnList);
        this.clearSummaryCache();
        this.summariesHeight = this.calcMaxSummaryHeight();
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
            this.document.defaultView.addEventListener('resize', this.resizeHandler);
        });
        this._derivePossibleWidth();
        this.calculateGridSizes();
        this._ngAfterViewInitPaassed = true;
    }

    public ngOnDestroy() {
        this.zone.runOutsideAngular(() => this.document.defaultView.removeEventListener('resize', this.resizeHandler));
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public dataLoading(event) {
        this.onDataPreLoad.emit(event);
    }

    public toggleColumnVisibility(args: IColumnVisibilityChangedEventArgs) {
        const col = this.getColumnByName(args.column.field);
        col.hidden = args.newValue;
        this.onColumnVisibilityChanged.emit(args);

        this.markForCheck();
    }

    public toggleColumnHidingUI() {
        if (this.columnHidingUI && this.columnHidingUI.togglable) {
            this.columnHidingUI.toggleDropDown();
        }
    }

    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    get groupRowTemplate(): TemplateRef<any> {
        return this._groupRowTemplate;
    }
    set groupRowTemplate(template: TemplateRef<any>) {
        this._groupRowTemplate = template;
        this.markForCheck();
    }

    get groupAreaTemplate(): TemplateRef<any> {
        return this._groupAreaTemplate;
    }
    set groupAreaTemplate(template: TemplateRef<any>) {
        this._groupAreaTemplate = template;
        this.markForCheck();
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

    public moveColumn(column: IgxColumnComponent, dropTarget: IgxColumnComponent) {
        if (column.pinned) {
            const fromIndex = this._pinnedColumns.indexOf(column);

            const toIndex = dropTarget.pinned ? this._pinnedColumns.indexOf(dropTarget) :
                this._unpinnedColumns.indexOf(dropTarget);

            this._pinnedColumns.splice(fromIndex, 1);

            if (dropTarget.pinned) {
                column.pinned = true;
                this._pinnedColumns.splice(toIndex, 0, column);
            } else {
                column.pinned = false;
                this._unpinnedColumns.splice(toIndex + 1, 0, column);
            }
        } else {
            const fromIndex = this._unpinnedColumns.indexOf(column);

            const toIndex = dropTarget.pinned ? this._pinnedColumns.indexOf(dropTarget) :
                this._unpinnedColumns.indexOf(dropTarget);

            this._unpinnedColumns.splice(fromIndex, 1);

            if (dropTarget.pinned) {
                column.pinned = true;
                this._pinnedColumns.splice(toIndex, 0, column);
            } else {
                column.pinned = false;
                this._unpinnedColumns.splice(toIndex, 0, column);
            }
        }

        this.columnList.reset(this._pinnedColumns.concat(this._unpinnedColumns));
        this.columnList.notifyOnChanges();
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

        this.refreshSearch();
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

            this.refreshSearch();
        }
    }

    public updateCell(value: any, rowSelector: any, column: string): void {
        const cell = this.gridAPI.get_cell_by_field(this.id, rowSelector, column);
        if (cell) {
            cell.update(value);
            this.cdr.detectChanges();
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

    public sort(expression: ISortingExpression | Array<ISortingExpression>): void;
    public sort(...rest): void {
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._sortMultiple(rest[0]);
        } else {
            this._sort(rest[0]);
        }
    }
    public groupBy(expression: ISortingExpression | Array<ISortingExpression>): void;
    public groupBy(...rest): void {
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._groupByMultiple(rest[0]);
        } else {
            this._groupBy(rest[0]);
        }
        this.calculateGridSizes();
        this.onGroupingDone.emit(this.sortingExpressions);
    }

    public clearGrouping(name?: string): void {
        this.gridAPI.clear_groupby(this.id, name);
        this.calculateGridSizes();
    }

    public isExpandedGroup(group: IGroupByRecord): boolean {
        const state: IGroupByExpandState = this._getStateForGroupRow(group);
        return state ? state.expanded : this.groupsExpanded;
    }

    public toggleGroup(groupRow: IGroupByRecord) {
        this._toggleGroup(groupRow);
    }

    public isGroupByRecord(record: any): boolean {
        // return record.records instance of GroupedRecords fails under Webpack
        return record.records && record.records.length;
    }

    public get dropAreaVisible(): boolean {
        return (this.draggedColumn && this.draggedColumn.groupable) ||
            !this.chipsGoupingExpressions.length;
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
        this.summariesHeight = 0;
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
        this.summariesHeight = 0;
        this.markForCheck();
        this.calculateGridHeight();
        this.cdr.detectChanges();
    }

    public clearFilter(name?: string) {

        if (!name) {
            this.filteringExpressions = [];
            this.filteredData = null;
            return;
        }

        const column = this.gridAPI.get_column_by_name(this.id, name);
        if (!column) {
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

    public clearSummaryCache(editCell?) {
        if (editCell && editCell.cell) {
            this.gridAPI.remove_summary(this.id, editCell.cell.column.filed);
        } else {
            this.gridAPI.remove_summary(this.id);
        }
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

        const oldIndex = col.visibleIndex;

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

        const newIndex = col.visibleIndex;
        col.updateHighlights(oldIndex, newIndex);
        return true;
    }

    public toggleAllGroupRows() {
        this.groupingExpansionState = [];
        this.groupsExpanded = !this.groupsExpanded;
    }

    public unpinColumn(columnName: string): boolean {
        const col = this.getColumnByName(columnName);

        if (!col.pinned) {
            return false;
        }
        const oldIndex = col.visibleIndex;
        col.pinned = false;
        this._unpinnedColumns.splice(col.index, 0, col);
        if (this._pinnedColumns.indexOf(col) !== -1) {
            this._pinnedColumns.splice(this._pinnedColumns.indexOf(col), 1);
        }
        this.markForCheck();

        const newIndex = col.visibleIndex;
        col.updateHighlights(oldIndex, newIndex);
        return true;
    }

    /**
     * Recalculates grid width/height dimensions. Should be run when changing DOM elements dimentions manually that affect the grid's size.
     */
    public reflow() {
        this.calculateGridSizes();
    }

    public findNext(text: string, caseSensitive?: boolean): number {
        return this.find(text, 1, caseSensitive);
    }

    public findPrev(text: string, caseSensitive?: boolean): number {
        return this.find(text, -1, caseSensitive);
    }

    public refreshSearch(updateActiveInfo?: boolean): number {
        if (this.lastSearchInfo.searchText) {
            this.rebuildMatchCache();

            if (updateActiveInfo) {
                const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);
                this.lastSearchInfo.matchInfoCache.forEach((match, i) => {
                    if (match.column === activeInfo.columnIndex &&
                        match.row === activeInfo.rowIndex &&
                        match.index === activeInfo.index &&
                        match.page === activeInfo.page) {
                        this.lastSearchInfo.activeMatchIndex = i;
                    }
                });
            }

            return this.find(this.lastSearchInfo.searchText, 0, this.lastSearchInfo.caseSensitive, false);
        } else {
            return 0;
        }
    }

    public clearSearch() {
        this.lastSearchInfo = {
            searchText: '',
            caseSensitive: false,
            activeMatchIndex: 0,
            matchInfoCache: []
        };

        this.rowList.forEach((row) => {
            row.cells.forEach((c) => {
                c.clearHighlight();
            });
        });
    }

    get hasGroupableColumns(): boolean {
        return this.columnList.some((col) => col.groupable);
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

    get hasMovableColumns(): boolean {
        return this.columnList.some((col) => col.movable);
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
        if ((this._height && this._height.indexOf('%') === -1) || !this._height) {
            return;
        }
        if (!this.nativeElement.parentNode.clientHeight) {
            const viewPortHeight = document.documentElement.clientHeight;
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
            if (this.hasSummarizedColumns && !this.summariesHeight) {
                this.summariesHeight = this.summaries ?
                    this.calcMaxSummaryHeight() : 0;
            }
            return;
        }

        let toolbarHeight = 0;
        if (this.showToolbar && this.toolbarHtml != null) {
            toolbarHeight = this.toolbarHtml.nativeElement.firstElementChild ?
                this.toolbarHtml.nativeElement.offsetHeight : 0;
        }

        let pagingHeight = 0;
        let groupAreaHeight = 0;
        if (this.paging) {
            pagingHeight = this.paginator.nativeElement.firstElementChild ?
                this.paginator.nativeElement.clientHeight : 0;
        }

        if (!this.summariesHeight) {
            this.summariesHeight = this.summaries ?
                this.calcMaxSummaryHeight() : 0;
        }

        if (this.groupArea) {
            groupAreaHeight = this.groupArea.nativeElement.offsetHeight;
        }

        if (this._height && this._height.indexOf('%') !== -1) {
            /*height in %*/
            this.calcHeight = this._calculateGridBodyHeight(
                parseInt(computed.getPropertyValue('height'), 10), toolbarHeight, pagingHeight, groupAreaHeight);
        } else {
            this.calcHeight = this._calculateGridBodyHeight(
                parseInt(this._height, 10), toolbarHeight, pagingHeight, groupAreaHeight);
        }
    }

    protected _calculateGridBodyHeight(gridHeight: number,
        toolbarHeight: number, pagingHeight: number, groupAreaHeight: number) {
        const footerBordersAndScrollbars = this.tfoot.nativeElement.offsetHeight -
            this.tfoot.nativeElement.clientHeight;

        return gridHeight - toolbarHeight -
            this.theadRow.nativeElement.offsetHeight -
            this.summariesHeight - pagingHeight - groupAreaHeight -
            footerBordersAndScrollbars -
            this.scr.nativeElement.clientHeight;
    }

    protected getPossibleColumnWidth() {
        let computedWidth = parseInt(
            this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue('width'), 10);

        let maxColumnWidth = Math.max(
            ...this.visibleColumns.map((col) => parseInt(col.width, 10))
                .filter((width) => !isNaN(width))
        );
        const sumExistingWidths = this.visibleColumns
            .filter((col) => col.width !== null)
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

        if (this._width && this._width.indexOf('%') !== -1) {
            /* width in %*/
            this.calcWidth = parseInt(computed.getPropertyValue('width'), 10);
            return;
        }
        this.calcWidth = parseInt(this._width, 10);
    }

    protected calcMaxSummaryHeight() {
        let maxSummaryLength = 0;
        this.columnList.filter((col) => col.hasSummary).forEach((column) => {
            this.gridAPI.set_summary_by_column_name(this.id, column.field);
            const getCurrentSummaryColumn = this.gridAPI.get_summaries(this.id).get(column.field);
            if (getCurrentSummaryColumn) {
                if (maxSummaryLength < getCurrentSummaryColumn.length) {
                    maxSummaryLength = getCurrentSummaryColumn.length;
                }
            }
        });

        let summariesHeight = this.defaultRowHeight;
        if (this.summaries && this.summaries.nativeElement.clientHeight) {
            summariesHeight = this.summaries.nativeElement.clientHeight;
        }

        return maxSummaryLength * summariesHeight;
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
    public getPinnedWidth(takeHidden = false) {
        const fc = takeHidden ? this._pinnedColumns : this.pinnedColumns;
        let sum = 0;
        for (const col of fc) {
            sum += parseInt(col.width, 10);
        }
        if (this.rowSelectable) {
            sum += this.calcRowCheckboxWidth;
        }

        if (this.groupingExpressions.length > 0 && this.headerGroupContainer) {
            sum += this.headerGroupContainer.nativeElement.clientWidth;
        }
        return sum;
    }

    /**
     * Gets calculated width of the unpinned area
     * @param takeHidden If we should take into account the hidden columns in the pinned area
     */
    protected getUnpinnedWidth(takeHidden = false) {
        const width = this._width && this._width.indexOf('%') !== -1 ?
            this.calcWidth :
            parseInt(this._width, 10);
        return width - this.getPinnedWidth(takeHidden);
    }

    protected _sort(expression: ISortingExpression) {
        this.gridAPI.sort(this.id, expression.fieldName, expression.dir, expression.ignoreCase);
    }

    protected _sortMultiple(expressions: ISortingExpression[]) {
        this.gridAPI.sort_multiple(this.id, expressions);
    }

    protected _groupBy(expression: ISortingExpression) {
        this.gridAPI.groupBy(this.id, expression.fieldName, expression.dir, expression.ignoreCase);
    }

    protected _groupByMultiple(expressions: ISortingExpression[]) {
        this.gridAPI.groupBy_multiple(this.id, expressions);
    }

    protected _getStateForGroupRow(groupRow: IGroupByRecord): IGroupByExpandState {
        return this.gridAPI.groupBy_get_expanded_for_group(this.id, groupRow);
    }

    protected _toggleGroup(groupRow: IGroupByRecord) {
        this.gridAPI.groupBy_toggle_group(this.id, groupRow);
    }

    protected _applyGrouping() {
        this.gridAPI.sort_multiple(this.id, this._groupingExpressions);
    }

    protected _filter(name: string, value: any, condition?: IFilteringOperation, ignoreCase?: boolean) {
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
        if (typeof rec === 'number') {
            return DataType.Number;
        } else if (typeof rec === 'boolean') {
            return DataType.Boolean;
        } else if (typeof rec === 'object' && rec instanceof Date) {
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
            this.headerCheckbox && this.headerCheckbox.checked ? 'Deselect all filtered' : 'Select all filtered' :
            this.headerCheckbox && this.headerCheckbox.checked ? 'Deselect all' : 'Select all';
    }

    public get template(): TemplateRef<any> {
        if (this.filteredData && this.filteredData.length === 0) {
            return this.emptyGridTemplate;
        }
    }

    public checkHeaderChecboxStatus(headerStatus?: boolean) {
        if (headerStatus === undefined) {
            this.allRowsSelected = this.selectionAPI.are_all_selected(this.id, this.data);
            if (this.headerCheckbox) {
                this.headerCheckbox.indeterminate = !this.allRowsSelected && !this.selectionAPI.are_none_selected(this.id);
                if (!this.headerCheckbox.indeterminate) {
                    this.headerCheckbox.checked = this.selectionAPI.are_all_selected(this.id, this.data);
                }
            }
            this.cdr.markForCheck();
        } else if (this.headerCheckbox) {
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
                        return 'indeterminate';
                    }
                } else {
                    notAllSelected = true;
                    if (atLeastOneSelected) {
                        return 'indeterminate';
                    }
                }
            }
        }
        return atLeastOneSelected ? 'allSelected' : 'noneSelected';
    }

    public updateHeaderChecboxStatusOnFilter(data) {
        if (!data) {
            data = this.data;
        }
        switch (this.filteredItemsStatus(this.id, data)) {
            case 'allSelected': {
                if (!this.allRowsSelected) {
                    this.allRowsSelected = true;
                }
                if (this.headerCheckbox.indeterminate) {
                    this.headerCheckbox.indeterminate = false;
                }
                break;
            }
            case 'noneSelected': {
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

    public selectedRows(): any[] {
        return this.selectionAPI.get_selection(this.id) || [];
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
        this.triggerRowSelectionChange(this.selectionAPI.get_all_ids(this.data, this.primaryKey));
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

    public navigateDown(rowIndex: number, columnIndex: number) {
        const row = this.gridAPI.get_row_by_index(this.id, rowIndex);
        const target = row instanceof IgxGridGroupByRowComponent ?
            row.groupContent :
            this.gridAPI.get_cell_by_visible_index(this.id, rowIndex, columnIndex);
        const verticalScroll = this.verticalScrollContainer.getVerticalScroll();
        if (!verticalScroll && !target) {
            return;
        }

        if (target) {
            const containerHeight = this.calcHeight ?
                Math.ceil(this.calcHeight) :
                null; // null when there is no vertical virtualization
            const containerTopOffset =
                parseInt(this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const targetEndTopOffset = row.element.nativeElement.offsetTop + this.rowHeight + containerTopOffset;
            if (containerHeight && targetEndTopOffset > containerHeight) {
                const scrollAmount = targetEndTopOffset - containerHeight;
                this.performVerticalScroll(scrollAmount, rowIndex, columnIndex);
            } else {
                target.nativeElement.focus();
            }
        } else {
            const contentHeight = this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.offsetHeight;
            const scrollOffset = parseInt(this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const lastRowOffset = contentHeight + scrollOffset - this.calcHeight;
            const scrollAmount = this.rowHeight + lastRowOffset;
            this.performVerticalScroll(scrollAmount, rowIndex, columnIndex);
        }
    }

    public navigateUp(rowIndex: number, columnIndex: number) {
        const row = this.gridAPI.get_row_by_index(this.id, rowIndex);
        const target = row instanceof IgxGridGroupByRowComponent ?
            row.groupContent :
            this.gridAPI.get_cell_by_visible_index(this.id, rowIndex, columnIndex);
        const verticalScroll = this.verticalScrollContainer.getVerticalScroll();

        if (!verticalScroll && !target) {
            return;
        }
        if (target) {
            const containerTopOffset =
                parseInt(row.grid.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            if (this.rowHeight > -containerTopOffset // not the entire row is visible, due to grid offset
                && verticalScroll.scrollTop // the scrollbar is not at the first item
                && row.element.nativeElement.offsetTop < this.rowHeight) { // the target is in the first row

                this.performVerticalScroll(-this.rowHeight, rowIndex, columnIndex);
            }
            target.nativeElement.focus();
        } else {
            const scrollOffset =
                -parseInt(this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const scrollAmount = this.rowHeight + scrollOffset;
            this.performVerticalScroll(-scrollAmount, rowIndex, columnIndex);
        }
    }

    private _focusNextCell(rowIndex: number, columnIndex: number, dir?: string) {
        let row = this.gridAPI.get_row_by_index(this.id, rowIndex);
        const virtualDir = dir !== undefined ? row.virtDirRow : this.verticalScrollContainer;
        this.subscribeNext(virtualDir, () => {
            this.cdr.detectChanges();
            let target;
            row = this.gridAPI.get_row_by_index(this.id, rowIndex);
            target = this.gridAPI.get_cell_by_visible_index(
                this.id,
                rowIndex,
                columnIndex);
            if (!target) {
                if (dir) {
                    target = dir === 'left' ? row.cells.first : row.cells.last;
                } else if (row instanceof IgxGridGroupByRowComponent) {
                    target = row.groupContent;
                } else if (row) {
                    target = row.cells.first;
                } else {
                    return;
                }
            }
            target.nativeElement.focus();
        });
    }

    private subscribeNext(virtualContainer: any, callback: (elem?) => void) {
        virtualContainer.onChunkLoad.pipe(take(1)).subscribe({
            next: (e: any) => {
                callback(e);
            }
        });
    }

    private performVerticalScroll(amount: number, rowIndex: number, columnIndex: number) {
        const scrolled = this.verticalScrollContainer.addScrollTop(amount);
        if (scrolled) {
            this._focusNextCell(rowIndex, columnIndex);
        }
    }

    public trackColumnChanges(index, col) {
        return col.field + col.width;
    }

    private find(text: string, increment: number, caseSensitive?: boolean, scroll?: boolean) {
        if (!this.rowList) {
            return 0;
        }

        if (this.cellInEditMode) {
            this.cellInEditMode.inEditMode = false;
        }

        if (!text) {
            this.clearSearch();
            return 0;
        }

        const caseSensitiveResolved = caseSensitive ? true : false;
        let rebuildCache = false;

        if (this.lastSearchInfo.searchText !== text || this.lastSearchInfo.caseSensitive !== caseSensitiveResolved) {
            this.lastSearchInfo = {
                searchText: text,
                activeMatchIndex: 0,
                caseSensitive: caseSensitiveResolved,
                matchInfoCache: []
            };

            rebuildCache = true;
        } else {
            this.lastSearchInfo.activeMatchIndex += increment;
        }

        if (rebuildCache) {
            this.rowList.forEach((row) => {
                row.cells.forEach((c) => {
                    c.highlightText(text, caseSensitiveResolved);
                });
            });

            this.rebuildMatchCache();
        }

        if (this.lastSearchInfo.activeMatchIndex >= this.lastSearchInfo.matchInfoCache.length) {
            this.lastSearchInfo.activeMatchIndex = 0;
        } else if (this.lastSearchInfo.activeMatchIndex < 0) {
            this.lastSearchInfo.activeMatchIndex = this.lastSearchInfo.matchInfoCache.length - 1;
        }

        if (this.lastSearchInfo.matchInfoCache.length) {
            const matchInfo = this.lastSearchInfo.matchInfoCache[this.lastSearchInfo.activeMatchIndex];
            const row = this.paging ? matchInfo.row % this.perPage : matchInfo.row;

            IgxTextHighlightDirective.setActiveHighlight(this.id, matchInfo.column, row, matchInfo.index, matchInfo.page);

            if (scroll !== false) {
                this.scrollTo(matchInfo.row, matchInfo.column, matchInfo.page);
            }
        } else {
            IgxTextHighlightDirective.setActiveHighlight(this.id, -1, -1, -1, -1);
        }

        return this.lastSearchInfo.matchInfoCache.length;
    }

    get filteredSortedData(): any[] {
        let data: any[] = this.filteredData ? this.filteredData : this.data;

        if (this.sortingExpressions &&
            this.sortingExpressions.length > 0) {

            const sortingPipe = new IgxGridSortingPipe(this.gridAPI);
            data = sortingPipe.transform(data, this.sortingExpressions, this.id, -1);
        }

        return data;
    }

    private scrollTo(row: number, column: number, page: number): void {
        if (this.paging) {
            this.page = page;
        }

        this.scrollDirective(this.verticalScrollContainer, row);

        if (this.pinnedColumns.length) {
            if (column >= this.pinnedColumns.length) {
                column -= this.pinnedColumns.length;
                this.scrollDirective(this.rowList.first.virtDirRow, column);
            }
        } else {
            this.scrollDirective(this.rowList.first.virtDirRow, column);
        }
    }

    private scrollDirective(directive: IgxForOfDirective<any>, goal: number): void {
        const state = directive.state;
        const start = state.startIndex;
        const size = state.chunkSize - 1;

        if (start >= goal) {
            directive.scrollTo(goal);
        } else if (start + size <= goal) {
            directive.scrollTo(goal - size + 1);
        }
    }

    private rebuildMatchCache() {
        this.lastSearchInfo.matchInfoCache = [];

        const caseSensitive = this.lastSearchInfo.caseSensitive;
        const searchText = caseSensitive ? this.lastSearchInfo.searchText : this.lastSearchInfo.searchText.toLowerCase();
        const data = this.filteredSortedData;
        const columnItems = this.visibleColumns.sort((c1, c2) => c1.visibleIndex - c2.visibleIndex).
            map((c) => ({ columnName: c.field, columnSearchable: c.searchable }));

        data.forEach((dataRow, i) => {
            const rowIndex = this.paging ? i % this.perPage : i;

            columnItems.forEach((columnItem, j) => {
                const value = dataRow[columnItem.columnName];
                if (value !== undefined && value !== null && columnItem.columnSearchable) {
                    let searchValue = caseSensitive ? String(value) : String(value).toLowerCase();
                    let occurenceIndex = 0;
                    let searchIndex = searchValue.indexOf(searchText);
                    const pageIndex = this.paging ? Math.floor(i / this.perPage) : 0;

                    while (searchIndex !== -1) {
                        this.lastSearchInfo.matchInfoCache.push({
                            row: rowIndex,
                            column: j,
                            page: pageIndex,
                            index: occurenceIndex++
                        });

                        searchValue = searchValue.substring(searchIndex + searchText.length);
                        searchIndex = searchValue.indexOf(searchText);
                    }
                }
            });
        });
    }

    private findHiglightedItem(): any {
        if (this.lastSearchInfo.searchText !== '') {
            const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);

            const activeIndex = (activeInfo.page * this.perPage) + activeInfo.rowIndex;
            const data = this.filteredSortedData;
            return data[activeIndex];
        } else {
            return null;
        }
    }

    private restoreHighlight(highlightedItem: any): void {
        const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);

        const data = this.filteredSortedData;
        const rowIndex = data.indexOf(highlightedItem);
        const page = this.paging ? Math.floor(rowIndex / this.perPage) : 0;
        const row = this.paging ? rowIndex % this.perPage : rowIndex;

        this.rebuildMatchCache();

        if (rowIndex !== -1) {
            IgxTextHighlightDirective.setActiveHighlight(this.id, activeInfo.columnIndex, row, activeInfo.index, page);

            this.lastSearchInfo.matchInfoCache.forEach((match, i) => {
                if (match.column === activeInfo.columnIndex &&
                    match.row === rowIndex &&
                    match.index === activeInfo.index &&
                    match.page === page) {
                    this.lastSearchInfo.activeMatchIndex = i;
                }
            });
        } else {
            this.lastSearchInfo.activeMatchIndex = 0;
            this.find(this.lastSearchInfo.searchText, 0, this.lastSearchInfo.caseSensitive, false);
        }
    }

    public onChipRemoved(event) {
        this.clearGrouping(event.owner.id);
    }

    public chipsOrderChanged(event) {
        const newGrouping = [];
        for (let i = 0; i < event.chipsArray.length; i++) {
            const expr = this.groupingExpressions.filter((item) => {
                return item.fieldName === event.chipsArray[i].id;
            })[0];

            if (!this.getColumnByName(expr.fieldName).groupable) {
                // disallow changing order if there are columns with groupable: false
                event.isValid = false;
                return;
            }
            newGrouping.push(expr);
        }
        this.groupingExpansionState = [];
        this.chipsGoupingExpressions = newGrouping;
        event.isValid = true;
    }

    public chipsMovingEnded() {
        this.groupingExpressions = this.chipsGoupingExpressions;
    }

    public onChipClicked(event) {
        const groupExpr = this.groupingExpressions;
        const column = this.getColumnByName(event.owner.id);
        const exprIndex = groupExpr.findIndex((expr) => expr.fieldName === column.field);
        const sortDirection = groupExpr[exprIndex].dir;
        groupExpr[exprIndex].dir = 3 - sortDirection;
        this.groupingExpressions = groupExpr;
    }
}
