import { DOCUMENT } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ContentChildren,
    ContentChild,
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
    ViewContainerRef,
    HostListener
} from '@angular/core';
import { of, Subject } from 'rxjs';
import { debounceTime, delay, merge, repeat, take, takeUntil } from 'rxjs/operators';
import { IgxSelectionAPIService } from '../core/selection';
import { cloneArray, DisplayDensity } from '../core/utils';
import { DataType } from '../data-operations/data-util';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { GroupedRecords, IGroupByRecord } from '../data-operations/groupby-record.interface';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
import { IForOfState, IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { IgxBaseExporter, IgxExporterOptionsBase } from '../services/index';
import { IgxCheckboxComponent } from './../checkbox/checkbox.component';
import { IgxGridAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { IColumnVisibilityChangedEventArgs } from './column-hiding-item.directive';
import { IgxColumnComponent } from './column.component';
import { ISummaryExpression } from './grid-summary';
import { IgxGroupByRowTemplateDirective, IgxColumnMovingDragDirective } from './grid.common';
import { IgxGridToolbarComponent } from './grid-toolbar.component';
import { IgxGridSortingPipe, IgxGridPreGroupingPipe } from './grid.pipes';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './row.component';
import { DataUtil, IFilteringOperation, IFilteringExpressionsTree, FilteringExpressionsTree } from '../../public_api';

let NEXT_ID = 0;
const DEBOUNCE_TIME = 16;
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
    options: IgxExporterOptionsBase;
    cancel: boolean;
}

export interface IColumnMovingStartEventArgs {
    source: IgxColumnComponent;
}

export interface IColumnMovingEventArgs {
    source: IgxColumnComponent;
    cancel: boolean;
}

export interface IColumnMovingEndEventArgs {
    source: IgxColumnComponent;
    target: IgxColumnComponent;
    cancel: boolean;
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
export class IgxGridComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {

    @Input()
    public data = [];

    @Input()
    public autoGenerate = false;

    @HostBinding('attr.id')
    @Input()
    public id = `igx-grid-${NEXT_ID++}`;

    @Input()
    public get filteringLogic() {
        return this._filteringExpressionsTree.operator;
    }

    public set filteringLogic(value: FilteringLogic) {
        this._filteringExpressionsTree.operator = value;
    }

    @Input()
    get filteringExpressionsTree() {
        return this._filteringExpressionsTree;
    }

    set filteringExpressionsTree(value) {
        if (value) {
            this._filteringExpressionsTree = value;
            this.clearSummaryCache();
            this._pipeTrigger++;
            this.cdr.markForCheck();
            requestAnimationFrame(() => this.cdr.detectChanges());
        }
    }

    get filteredData() {
        return this._filteredData;
    }

    set filteredData(value) {
        this._filteredData = value;

        if (this.rowSelectable) {
            this.updateHeaderChecboxStatusOnFilter(this._filteredData);
        }

        this.restoreHighlight();
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
        if (this.gridAPI.get(this.id)) {
            this.gridAPI.arrange_sorting_expressions(this.id);
            /* grouping should work in conjunction with sorting
            and without overriding seperate sorting expressions */
            this._applyGrouping();
            this.cdr.markForCheck();
        } else {
            // setter called before grid is registered in grid API service
            this.sortingExpressions.unshift.apply(this.sortingExpressions, this._groupingExpressions);
        }
    }

    @Input()
    get groupingExpansionState() {
        return this._groupingExpandState;
    }

    set groupingExpansionState(value) {
        const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);

        let highlightItem = null;
        if (this.collapsedHighlightedItem) {
            highlightItem = this.collapsedHighlightedItem.item;
        } else if (this.lastSearchInfo.matchInfoCache.length) {
            highlightItem = this.lastSearchInfo.matchInfoCache[this.lastSearchInfo.activeMatchIndex].item;
        }

        this._groupingExpandState = cloneArray(value);

        this.refreshSearch();

        if (highlightItem !== null && this.groupingExpressions.length) {
            const index = this.filteredSortedData.indexOf(highlightItem);
            const groupRow = this.getGroupByRecords()[index];

            if (!this.isExpandedGroup(groupRow)) {
                IgxTextHighlightDirective.clearActiveHighlight(this.id);
                this.collapsedHighlightedItem = {
                    info: activeInfo,
                    item: highlightItem
                };
            } else if (this.collapsedHighlightedItem !== null) {
                const collapsedInfo = this.collapsedHighlightedItem.info;
                IgxTextHighlightDirective.setActiveHighlight(this.id, {
                    columnIndex: collapsedInfo.columnIndex,
                    rowIndex: collapsedInfo.rowIndex,
                    index: collapsedInfo.index,
                    page: collapsedInfo.page
                });
            }
        }
        this.cdr.detectChanges();
    }

    private collapsedHighlightedItem: any = null;

    @Input()
    public groupsExpanded = true;

    public groupsRecords: IGroupByRecord[] = [];

    @Input()
    get paging(): boolean {
        return this._paging;
    }

    set paging(value: boolean) {
        this._paging = value;
        this._pipeTrigger++;

        if (this._ngAfterViewInitPaassed) {
            this.cdr.detectChanges();
            this.calculateGridHeight();
            this.cdr.detectChanges();
        }
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

        this.restoreHighlight();
    }

    @Input()
    public paginationTemplate: TemplateRef<any>;

    @Input()
    public get displayDensity(): DisplayDensity | string {
        return this._displayDensity;
    }

    public set displayDensity(val: DisplayDensity | string) {
        switch (val) {
            case 'compact':
                this._displayDensity = DisplayDensity.compact;
                break;
            case 'cosy':
                this._displayDensity = DisplayDensity.cosy;
                break;
            case 'comfortable':
            default:
                this._displayDensity = DisplayDensity.comfortable;
        }
        this.onDensityChanged.emit();
    }

    @Input()
    get columnHiding() {
        return this._columnHiding;
    }

    set columnHiding(value) {
        if (this._columnHiding !== value) {
            this._columnHiding = value;
            if (this.gridAPI.get(this.id)) {
                this.markForCheck();
                if (this._ngAfterViewInitPaassed) {
                    this.calculateGridSizes();
                }
            }
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

    @Input()
    public evenRowCSS = 'igx-grid__tr--even';

    @Input()
    public oddRowCSS = 'igx-grid__tr--odd';

    @Input()
    public  get rowHeight()  {
        return this._rowHeight ? this._rowHeight : this.defaultRowHeight;
    }

    public set rowHeight(value) {
        this._rowHeight = parseInt(value, 10);
    }

    @Input()
    public columnWidth: string = null;

    @Input()
    public primaryKey;

    @Input()
    public emptyGridMessage = 'No records found.';

    @Input()
    public columnHidingTitle = '';

    @Input()
    get columnPinning() {
        return this._columnPinning;
    }

    set columnPinning(value) {
        if (this._columnPinning !== value) {
            this._columnPinning = value;
            if (this.gridAPI.get(this.id)) {
                this.markForCheck();
                if (this._ngAfterViewInitPaassed) {
                    this.calculateGridSizes();
                }
            }
        }
    }

    @Input()
    public columnPinningTitle = '';

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
    public onFilteringDone = new EventEmitter<IFilteringExpressionsTree>();

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

    @Output()
    protected onDensityChanged = new EventEmitter<any>();

    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: true })
    public columnList: QueryList<IgxColumnComponent>;

    @ContentChild(IgxGroupByRowTemplateDirective, { read: IgxGroupByRowTemplateDirective })
    protected groupTemplate: IgxGroupByRowTemplateDirective;

    @ViewChildren('row')
    public rowList: QueryList<any>;

    @ViewChildren(IgxGridRowComponent, { read: IgxGridRowComponent })
    public dataRowList: QueryList<any>;

    @ViewChildren(IgxGridGroupByRowComponent, { read: IgxGridGroupByRowComponent })
    public groupsRowList: QueryList<IgxGridGroupByRowComponent>;

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

    @ViewChild('summaries')
    public summaries: ElementRef;

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('attr.class')
    get hostClass(): string {
        switch (this._displayDensity) {
            case DisplayDensity.cosy:
                return 'igx-grid--cosy';
            case DisplayDensity.compact:
                return 'igx-grid--compact';
            default:
                return 'igx-grid';
        }
    }

    get groupAreaHostClass(): string {
        switch (this._displayDensity) {
            case DisplayDensity.cosy:
                return 'igx-drop-area--cosy';
            case DisplayDensity.compact:
                return 'igx-drop-area--compact';
            default:
                return 'igx-drop-area';
        }
    }

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
        this._sortingExpressions = cloneArray(value);
        this.cdr.markForCheck();

        this.restoreHighlight();
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

    get maxLevelHeaderDepth() {
        if (this._maxLevelHeaderDepth === null) {
            this._maxLevelHeaderDepth =  this.columnList.reduce((acc, col) => Math.max(acc, col.level), 0);
        }
        return this._maxLevelHeaderDepth;
    }

    get hiddenColumnsCount() {
        return this.columnList.filter((col) => col.columnGroup === false && col.hidden === true).length;
    }

    @Input()
    get hiddenColumnsText() {
        return this._hiddenColumnsText;
    }

    set hiddenColumnsText(value) {
        this._hiddenColumnsText = value;

    }

    @Input()
    get pinnedColumnsText() {
        return this._pinnedColumnsText;
    }

    set pinnedColumnsText(value) {
        this._pinnedColumnsText = value;
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

    public get shouldShowToolbar(): boolean {
        return this.showToolbar &&
               (this.columnHiding ||
                this.columnPinning ||
                this.exportExcel ||
                this.exportCsv ||
                (this.toolbarTitle && this.toolbarTitle !== null && this.toolbarTitle !== ''));
    }

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

    public draggedColumn: IgxColumnComponent;
    public isColumnResizing: boolean;
    public isColumnMoving: boolean;

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
    protected _filteringExpressionsTree: IFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    protected _sortingExpressions = [];
    protected _maxLevelHeaderDepth = null;
    protected _groupingExpressions = [];
    protected _groupingExpandState: IGroupByExpandState[] = [];
    protected _groupRowTemplate: TemplateRef<any>;
    protected _groupAreaTemplate: TemplateRef<any>;
    protected _columnHiding = false;
    protected _columnPinning = false;
    private _filteredData = null;
    private resizeHandler;
    private columnListDiffer;
    private _hiddenColumnsText = '';
    private _pinnedColumnsText = '';
    private _height = '100%';
    private _width = '100%';
    private _rowHeight;
    private _displayDensity = DisplayDensity.comfortable;
    private _ngAfterViewInitPaassed = false;

    constructor(
        private gridAPI: IgxGridAPIService,
        public selectionAPI: IgxSelectionAPIService,
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
        this.calcWidth = this._width && this._width.indexOf('%') === -1 ? parseInt(this._width, 10) : 0;
        this.calcHeight = 0;
        this.calcRowCheckboxWidth = 0;

        this.onRowAdded.pipe(takeUntil(this.destroy$)).subscribe(() => this.clearSummaryCache());
        this.onRowDeleted.pipe(takeUntil(this.destroy$)).subscribe(() => this.clearSummaryCache());
        this.onFilteringDone.pipe(takeUntil(this.destroy$)).subscribe(() => this.clearSummaryCache());
        this.onEditDone.pipe(takeUntil(this.destroy$)).subscribe((editCell) => this.clearSummaryCache(editCell));
        this.onColumnMoving.pipe(takeUntil(this.destroy$)).subscribe((source) => {
            this.gridAPI.submit_value(this.id);
        });
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
        const vertScrDC = this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement;
        vertScrDC.addEventListener('scroll', (evt) => { this.scrollHandler(evt); });
    }

    public ngAfterViewInit() {
        this.zone.runOutsideAngular(() => {
            this.document.defaultView.addEventListener('resize', this.resizeHandler);
        });
        this._derivePossibleWidth();
        this.initPinning();
        this.calculateGridSizes();
        this.onDensityChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
            requestAnimationFrame(() => {
                this.summariesHeight = 0;
                this.reflow();
            });
        });
        this._ngAfterViewInitPaassed = true;
    }

    public ngOnDestroy() {
        this.zone.runOutsideAngular(() => this.document.defaultView.removeEventListener('resize', this.resizeHandler));
        this.destroy$.next(true);
        this.destroy$.complete();
        this.gridAPI.unset(this.id);
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

    get defaultRowHeight(): number {
        switch (this._displayDensity) {
            case DisplayDensity.compact:
                return 32;
            case DisplayDensity.cosy:
                return 40;
            case DisplayDensity.comfortable:
            default:
                return 50;
        }
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
        return this._unpinnedColumns.filter((col) => !col.hidden); // .sort((col1, col2) => col1.index - col2.index);
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

    public getCellByColumn(rowIndex: number, columnField: string): IgxGridCellComponent {
        const columnId = this.columnList.map((column) => column.field).indexOf(columnField);
        if (columnId !== -1) {
            return this.gridAPI.get_cell_by_index(this.id, rowIndex, columnId);
        }
    }

    public getCellByKey(rowSelector: any, columnField: string): IgxGridCellComponent {
        return this.gridAPI.get_cell_by_key(this.id, rowSelector, columnField);
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
        // Take only top level columns
        const cols = this.visibleColumns.filter(col => col.level === 0 && !col.pinned);
        let totalWidth = 0;
        let i = 0;
        for (i; i < cols.length; i++) {
            totalWidth += parseInt(cols[i].width, 10) || 0;
        }
        return totalWidth;
    }

    protected _moveColumns(from: IgxColumnComponent, to: IgxColumnComponent) {
        const list = this.columnList.toArray();
        const fi = list.indexOf(from);
        const ti = list.indexOf(to);

        const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);
        const activeColumnIndex = activeInfo.columnIndex;
        let activeColumn = null;

        if (activeInfo.columnIndex !== -1) {
            activeColumn = list[activeColumnIndex];
        }

        list.splice(ti, 0, ...list.splice(fi, 1));
        const newList = this._resetColumnList(list);
        this.columnList.reset(newList);
        this.columnList.notifyOnChanges();

        if (activeColumn !== null && activeColumn !== undefined) {
            const newIndex = newList.indexOf(activeColumn);
            IgxColumnComponent.updateHighlights(activeColumnIndex, newIndex, this);
        }
    }

    protected _resetColumnList(list?) {
        if (!list) {
            list = this.columnList.toArray();
        }
        let newList = [];
        list.filter(c => c.level === 0).forEach(p => {
            newList.push(p);
            if (p.columnGroup) {
                newList = newList.concat(p.allChildren);
            }
        });
        return newList;
    }

    protected _moveChildColumns(parent: IgxColumnComponent, from: IgxColumnComponent, to: IgxColumnComponent) {
        const buffer = parent.children.toArray();
        const fi = buffer.indexOf(from);
        const ti = buffer.indexOf(to);
        buffer.splice(ti, 0, ...buffer.splice(fi, 1));
        parent.children.reset(buffer);
    }

    public moveColumn(column: IgxColumnComponent, dropTarget: IgxColumnComponent) {
        if (column.level !== dropTarget.level) {
            return;
        }
        this.gridAPI.submit_value(this.id);
        if (column.level) {
            this._moveChildColumns(column.parent, column, dropTarget);
        }

        if (dropTarget.pinned && column.pinned) {
            const pinned = this._pinnedColumns;
            pinned.splice(pinned.indexOf(dropTarget), 0, ...pinned.splice(pinned.indexOf(column), 1));
        }

        if (dropTarget.pinned && !column.pinned) {
            column.pin(dropTarget.index);
        }

        if (!dropTarget.pinned && column.pinned) {
            column.pinned = false;
        }

        this._moveColumns(column, dropTarget);
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
        if (this.primaryKey !== undefined && this.primaryKey !== null) {
            const row = this.gridAPI.get_row_by_key(this.id, rowSelector);
            if (row) {
                const index = this.data.indexOf(row.rowData);
                const editableCell = this.gridAPI.get_cell_inEditMode(this.id);
                if (editableCell && editableCell.cellID.rowID === row.rowID) {
                    this.gridAPI.escape_editMode(this.id, editableCell.cellID);
                }
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
    }

    public updateCell(value: any, rowSelector: any, column: string): void {
        if (this.primaryKey !== undefined && this.primaryKey !== null) {
            const columnEdit = this.columnList.toArray().filter((col) => col.field === column);
            if (columnEdit.length > 0) {
                const columnId = this.columnList.toArray().indexOf(columnEdit[0]);
                const editableCell = this.gridAPI.get_cell_inEditMode(this.id);
                if (editableCell && editableCell.cellID.rowID === rowSelector &&
                    editableCell.cellID.columnID === columnId) {
                        this.gridAPI.escape_editMode(this.id, editableCell.cellID);
                }
                this.gridAPI.update_cell(this.id, rowSelector, columnId, value);
                this.cdr.markForCheck();
                this.refreshSearch();
            }
        }
    }

    public updateRow(value: any, rowSelector: any): void {
        if (this.primaryKey !== undefined && this.primaryKey !== null) {
            const row = this.gridAPI.get_row_by_key(this.id, rowSelector);
            if (row) {
                const editableCell = this.gridAPI.get_cell_inEditMode(this.id);
                if (editableCell && editableCell.cellID.rowID === row.rowID) {
                    this.gridAPI.escape_editMode(this.id, editableCell.cellID);
                }
                if (this.rowSelectable === true && row.isSelected) {
                    this.deselectRows([row.rowID]);
                    this.gridAPI.update_row(value, this.id, row);
                    this.selectRows([value[this.primaryKey]]);
                } else {
                    this.gridAPI.update_row(value, this.id, row);
                }
                this.cdr.markForCheck();
                this.refreshSearch();
            }
        }
    }

    public sort(expression: ISortingExpression | Array<ISortingExpression>): void;
    public sort(...rest): void {
        this.gridAPI.escape_editMode(this.id);
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._sortMultiple(rest[0]);
        } else {
            this._sort(rest[0]);
        }
    }
    public groupBy(expression: ISortingExpression | Array<ISortingExpression>): void;
    public groupBy(...rest): void {
        this.gridAPI.submit_value(this.id);
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._groupByMultiple(rest[0]);
        } else {
            this._groupBy(rest[0]);
        }
        this.cdr.detectChanges();
        this.calculateGridSizes();
        this.onGroupingDone.emit(this.sortingExpressions);

        this.restoreHighlight();
    }

    public clearGrouping(name?: string): void {
        this.gridAPI.clear_groupby(this.id, name);
        this.calculateGridSizes();

        this.restoreHighlight();
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

    public filter(name: string, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase?: boolean) {
        const col = this.gridAPI.get_column_by_name(this.id, name);
        const filteringIgnoreCase = ignoreCase || (col ? col.filteringIgnoreCase : false);

        if (conditionOrExpressionTree) {
            this.gridAPI.filter(this.id, name, value, conditionOrExpressionTree, filteringIgnoreCase);
        } else {
            const expressionsTreeForColumn = this._filteringExpressionsTree.find(name);
            if (expressionsTreeForColumn instanceof FilteringExpressionsTree) {
                this.gridAPI.filter(this.id, name, value, expressionsTreeForColumn, filteringIgnoreCase);
            } else {
                const expressionForColumn = expressionsTreeForColumn as IFilteringExpression;
                this.gridAPI.filter(this.id, name, value, expressionForColumn.condition, filteringIgnoreCase);
            }
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
        if (name) {
            const column = this.gridAPI.get_column_by_name(this.id, name);
            if (!column) {
                return;
            }
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

    public clearSummaryCache(editCell?) {
        if (editCell && editCell.cell) {
            this.gridAPI.remove_summary(this.id, editCell.cell.column.filed);
        } else {
            this.gridAPI.remove_summary(this.id);
        }
    }

    // TODO: We have return values here. Move them to event args ??

    public pinColumn(columnName: string | IgxColumnComponent, index?): boolean {
        const col = columnName instanceof IgxColumnComponent ? columnName : this.getColumnByName(columnName);
        return col.pin(index);
    }

    public unpinColumn(columnName: string | IgxColumnComponent, index?): boolean {
        const col = columnName instanceof IgxColumnComponent ? columnName : this.getColumnByName(columnName);
        return col.unpin(index);
    }

    public toggleAllGroupRows() {
        this.groupingExpansionState = [];
        this.groupsExpanded = !this.groupsExpanded;
    }


    /**
     * Recalculates grid width/height dimensions. Should be run when changing DOM elements dimentions manually that affect the grid's size.
     */
    public reflow() {
        this.calculateGridSizes();
    }

    public recalculateSummaries() {
        this.summariesHeight = 0;
        requestAnimationFrame(() => this.calculateGridSizes());
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
            if (row.cells) {
                row.cells.forEach((c) => {
                    c.clearHighlight();
                });
            }
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
        const summarizedColumns = this.columnList.filter(col => col.hasSummary);
        return summarizedColumns.length > 0 && summarizedColumns.some(col => !col.hidden);
    }

    get hasMovableColumns(): boolean {
        return this.columnList && this.columnList.some((col) => col.movable);
    }

    get hasColumnGroups(): boolean {
        return this.columnList.some(col => col.columnGroup);
    }

    get selectedCells(): IgxGridCellComponent[] | any[] {
        if (this.rowList) {
            return this.rowList.filter((row) => row instanceof IgxGridRowComponent).map((row) => row.cells.filter((cell) => cell.selected))
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

        // TODO: Calculate based on grid density
        if (this.maxLevelHeaderDepth) {
            this.theadRow.nativeElement.style.height = `${(this.maxLevelHeaderDepth + 1) * this.defaultRowHeight + 1}px`;
        }

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
        if (this.paging && this.paginator) {
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

        return Math.abs(gridHeight - toolbarHeight -
            this.theadRow.nativeElement.offsetHeight -
            this.summariesHeight - pagingHeight - groupAreaHeight -
            footerBordersAndScrollbars -
            this.scr.nativeElement.clientHeight);
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
        this.columnList.filter((col) => col.hasSummary && !col.hidden).forEach((column) => {
            this.gridAPI.set_summary_by_column_name(this.id, column.field);
            const getCurrentSummaryColumn = this.gridAPI.get_summaries(this.id).get(column.field);
            if (getCurrentSummaryColumn) {
                if (maxSummaryLength < getCurrentSummaryColumn.length) {
                    maxSummaryLength = getCurrentSummaryColumn.length;
                }
            }
        });
        return maxSummaryLength * this.defaultRowHeight;
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
            if (col.level === 0) {
                sum += parseInt(col.width, 10);
            }
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

    onlyTopLevel(arr) {
        return arr.filter(c => c.level === 0);
    }

    protected initColumns(collection: QueryList<IgxColumnComponent>, cb: any = null) {

        // XXX: Deprecate index
        this._columns = this.columnList.toArray();

        collection.forEach((column: IgxColumnComponent) => {
            column.gridID = this.id;
            if (!column.width) {
                column.width = this.columnWidth;
            }
            if (cb) {
                cb(column);
            }
        });
        this.reinitPinStates();
    }

    protected reinitPinStates() {
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
        return this._filteringExpressionsTree.filteringOperands.length > 0 ?
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

    @HostListener('scroll', ['$event'])
    public scrollHandler(event) {
        this.parentVirtDir.getHorizontalScroll().scrollLeft += event.target.scrollLeft;
        this.verticalScrollContainer.getVerticalScroll().scrollTop += event.target.scrollTop;
        event.target.scrollLeft = 0;
        event.target.scrollTop = 0;
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
        this.gridAPI.escape_editMode(this.id);

        if (this.collapsedHighlightedItem) {
            this.collapsedHighlightedItem = null;
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
                if (row.cells) {
                    row.cells.forEach((c) => {
                        c.highlightText(text, caseSensitiveResolved);
                    });
                }
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

            IgxTextHighlightDirective.setActiveHighlight(this.id, {
                columnIndex: matchInfo.column,
                rowIndex: matchInfo.row,
                index: matchInfo.index,
                page: matchInfo.page
            });

            if (scroll !== false) {
                this.scrollTo(matchInfo.row, matchInfo.column, matchInfo.page, matchInfo.groupByRecord);
            }
        } else {
            IgxTextHighlightDirective.clearActiveHighlight(this.id);
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

    protected initPinning() {
        this._pinnedColumns.forEach(col => {
            if (col.parent) {
                col.parent.pinned = true;
            }
            if (col.columnGroup) {
                col.children.forEach(child => child.pinned = true);
            }
        });
        this._pinnedColumns = this.columnList.filter(col => col.pinned);
    }

    private scrollTo(row: number, column: number, page: number, groupByRecord?: IGroupByRecord): void {
        if (this.paging) {
            this.page = page;
        }

        if (groupByRecord && !this.isExpandedGroup(groupByRecord)) {
            this.toggleGroup(groupByRecord);
        }

        this.scrollDirective(this.verticalScrollContainer, row);

        const scrollRow = this.rowList.find(r => r.virtDirRow);
        const virtDir = scrollRow ? scrollRow.virtDirRow : null;

        if (this.pinnedColumns.length) {
            if (column >= this.pinnedColumns.length) {
                column -= this.pinnedColumns.length;
                this.scrollDirective(virtDir, column);
            }
        } else {
            this.scrollDirective(virtDir, column);
        }
    }

    private scrollDirective(directive: IgxForOfDirective<any>, goal: number): void {
        if (!directive) {
            return;
        }

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
        const columnItems = this.visibleColumns.filter((c) => !c.columnGroup).sort((c1, c2) => c1.visibleIndex - c2.visibleIndex);

        const groupIndexData = this.getGroupIncrementData();
        const groupByRecords = this.getGroupByRecords();
        let collapsedRowsCount = 0;

        data.forEach((dataRow, i) => {
            const groupByRecord = groupByRecords ? groupByRecords[i] : null;
            const groupByIncrement = groupIndexData ? groupIndexData[i] : 0;
            const pagingIncrement = this.getPagingIncrement(groupByIncrement, groupIndexData, Math.floor(i / this.perPage));
            let rowIndex = this.paging ? (i % this.perPage) + pagingIncrement : i + groupByIncrement;

            if (this.paging && i % this.perPage === 0) {
                collapsedRowsCount = 0;
            }

            rowIndex -= collapsedRowsCount;

            if (groupByRecord && !this.isExpandedGroup(groupByRecord)) {
                collapsedRowsCount++;
            }

            columnItems.forEach((c, j) => {
                const value = c.formatter ? c.formatter(dataRow[c.field]) : dataRow[c.field];
                if (value !== undefined && value !== null && c.searchable) {
                    let searchValue = caseSensitive ? String(value) : String(value).toLowerCase();
                    let occurenceIndex = 0;
                    let searchIndex = searchValue.indexOf(searchText);
                    const pageIndex = this.paging ? Math.floor(i / this.perPage) : 0;

                    while (searchIndex !== -1) {
                        this.lastSearchInfo.matchInfoCache.push({
                            row: rowIndex,
                            column: j,
                            page: pageIndex,
                            index: occurenceIndex++,
                            groupByRecord: groupByRecord,
                            item: dataRow
                        });

                        searchValue = searchValue.substring(searchIndex + searchText.length);
                        searchIndex = searchValue.indexOf(searchText);
                    }
                }
            });
        });
    }

    // This method's idea is to get by how much each data row is offset by the group by rows before it.
    private getGroupIncrementData(): number[] {
        if (this.groupingExpressions && this.groupingExpressions.length) {
                const groupsRecords = this.getGroupByRecords();
                const groupByIncrements = [];
                const values = [];

                let prevHierarchy = null;
                let increment = 0;

                groupsRecords.forEach((gbr) => {
                    if (values.indexOf(gbr) === -1) {
                        let levelIncrement = 1;

                        if (prevHierarchy !== null) {
                            levelIncrement += this.getLevelIncrement(0, gbr.groupParent, prevHierarchy.groupParent);
                        } else {
                            // This is the first level we stumble upon, so we haven't accounted for any of its parents
                            levelIncrement += gbr.level;
                        }

                        increment += levelIncrement;
                        prevHierarchy = gbr;
                        values.push(gbr);
                    }

                    groupByIncrements.push(increment);
                });
                return groupByIncrements;
        } else {
            return null;
        }
    }

    private getLevelIncrement(currentIncrement, currentHierarchy, prevHierarchy) {
        if (currentHierarchy !== prevHierarchy && !!prevHierarchy && !!currentHierarchy) {
            return this.getLevelIncrement(++currentIncrement, currentHierarchy.groupParent, prevHierarchy.groupParent);
        } else {
            return currentIncrement;
        }
    }

    private getGroupByRecords(): IGroupByRecord[] {
        if (this.groupingExpressions && this.groupingExpressions.length) {
            const state = {
                expressions: this.groupingExpressions,
                expansion:  this.groupingExpansionState,
                defaultExpanded: this.groupsExpanded
            };

            return DataUtil.group(cloneArray(this.filteredSortedData), state).metadata;
        } else {
            return null;
        }
    }

    // For paging we need just the increment between the start of the page and the current row
    private getPagingIncrement(groupByIncrement: number, groupIndexData: number[], page: number) {
        let pagingIncrement = 0;

        if (this.paging && groupByIncrement) {
            const lastRowOnPrevPageInrement = page ? groupIndexData[page * this.perPage - 1] : 0;
            const firstRowOnThisPageInrement = groupIndexData[page * this.perPage];
            // If the page ends in the middle of the group, on the next page there is
            // one additional group by row. We need to account for this.
            const additionalPagingIncrement = lastRowOnPrevPageInrement === firstRowOnThisPageInrement ? 1 : 0;
            pagingIncrement = groupByIncrement - lastRowOnPrevPageInrement + additionalPagingIncrement;
        }

        return pagingIncrement;
    }

    private restoreHighlight(): void {
        if (this.lastSearchInfo.searchText) {
            const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);
            const matchInfo = this.lastSearchInfo.matchInfoCache[this.lastSearchInfo.activeMatchIndex];
            const data = this.filteredSortedData;
            const groupByIncrements = this.getGroupIncrementData();

            const rowIndex = matchInfo ? data.indexOf(matchInfo.item) : -1;
            const page = this.paging ? Math.floor(rowIndex / this.perPage) : 0;
            let increment = groupByIncrements && rowIndex !== -1 ? groupByIncrements[rowIndex] : 0;
            if (this.paging && increment) {
                increment = this.getPagingIncrement(increment, groupByIncrements, page);
            }

            const row = this.paging ? (rowIndex % this.perPage) + increment : rowIndex + increment;

            this.rebuildMatchCache();

            if (rowIndex !== -1) {
                if (this.collapsedHighlightedItem && groupByIncrements !== null) {
                    this.collapsedHighlightedItem.info.page = page;
                    this.collapsedHighlightedItem.info.rowIndex = row;
                } else {
                    IgxTextHighlightDirective.setActiveHighlight(this.id, {
                        columnIndex: activeInfo.columnIndex,
                        rowIndex: row,
                        index: activeInfo.index,
                        page: page
                    });

                    this.lastSearchInfo.matchInfoCache.forEach((match, i) => {
                        if (match.column === activeInfo.columnIndex &&
                            match.row === row &&
                            match.index === activeInfo.index &&
                            match.page === page) {
                            this.lastSearchInfo.activeMatchIndex = i;
                        }
                    });
                }
            } else {
                this.lastSearchInfo.activeMatchIndex = 0;
                this.find(this.lastSearchInfo.searchText, 0, this.lastSearchInfo.caseSensitive, false);
            }
        }
    }

    notGroups(arr) {
        return arr.filter(c => !c.columnGroup);
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
        this.markForCheck();
    }

    public chipsMovingEnded() {
        this.groupingExpressions = this.chipsGoupingExpressions;
        this.markForCheck();
    }

    public onChipClicked(event) {
        const sortingExpr = this.sortingExpressions;
        const columnExpr = sortingExpr.find((expr) => expr.fieldName === event.owner.id);
        columnExpr.dir = 3 - columnExpr.dir;
        this.sort(columnExpr);
        this.markForCheck();
    }

    public onChipKeyDown(event) {
        if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
            const sortingExpr = this.sortingExpressions;
            const columnExpr = sortingExpr.find((expr) => expr.fieldName === event.owner.id);
            columnExpr.dir = 3 - columnExpr.dir;
            this.sort(columnExpr);
            this.markForCheck();
        }
    }
}
