import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    ComponentFactoryResolver,
    ElementRef,
    HostBinding,
    Inject,
    Input,
    IterableDiffers,
    LOCALE_ID,
    NgZone,
    OnInit,
    Output,
    Optional,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef,
    Injector,
    NgModuleRef,
    ApplicationRef,
    ContentChild
} from '@angular/core';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxGridSelectionService } from '../selection/selection.service';
import { IgxForOfSyncService, IgxForOfScrollSyncService } from '../../directives/for-of/for_of.sync.service';
import { ColumnType, GridType, IGX_GRID_BASE, RowType } from '../common/grid.interface';
import { IgxGridCRUDService } from '../common/crud.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { DEFAULT_PIVOT_KEYS, IDimensionsChange, IgxPivotGridValueTemplateContext, IPivotConfiguration, IPivotDimension, IPivotValue, IValuesChange, PivotDimensionType } from './pivot-grid.interface';
import { IgxPivotHeaderRowComponent } from './pivot-header-row.component';
import { IgxColumnGroupComponent } from '../columns/column-group.component';
import { IgxColumnComponent } from '../columns/column.component';
import { PivotUtil } from './pivot-util';
import { FilterMode, GridPagingMode, GridSummaryCalculationMode, GridSummaryPosition } from '../common/enums';
import { WatchChanges } from '../watch-changes';
import { OverlaySettings } from '../../services/public_api';
import {
    ICellPosition,
    IColumnMovingEndEventArgs, IColumnMovingEventArgs, IColumnMovingStartEventArgs,
    IColumnVisibilityChangedEventArgs, IGridEditDoneEventArgs, IGridEditEventArgs,
    IGridToolbarExportEventArgs,
    IPinColumnCancellableEventArgs, IPinColumnEventArgs, IPinRowEventArgs, IRowDataEventArgs, IRowDragEndEventArgs, IRowDragStartEventArgs
} from '../common/events';
import { IgxGridRowComponent } from '../grid/grid-row.component';
import { DropPosition } from '../moving/moving.service';
import { DimensionValuesFilteringStrategy, NoopPivotDimensionsStrategy } from '../../data-operations/pivot-strategy';
import { IgxGridExcelStyleFilteringComponent } from '../filtering/excel-style/grid.excel-style-filtering.component';
import { IgxPivotGridNavigationService } from './pivot-grid-navigation.service';
import { IgxPivotColumnResizingService } from '../resizing/pivot-grid/pivot-resizing.service';
import { IgxFlatTransactionFactory, IgxOverlayService, State, Transaction, TransactionService } from '../../services/public_api';
import { DOCUMENT } from '@angular/common';
import { DisplayDensity, DisplayDensityToken, IDensityChangedEventArgs, IDisplayDensityOptions } from '../../core/displayDensity';
import { cloneArray, PlatformUtil } from '../../core/utils';
import { IgxPivotFilteringService } from './pivot-filtering.service';
import { DataUtil } from '../../data-operations/data-util';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IgxGridTransaction } from '../common/types';
import { GridBaseAPIService } from '../api.service';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { IgxPivotRowDimensionContentComponent } from './pivot-row-dimension-content.component';
import { IgxPivotGridColumnResizerComponent } from '../resizing/pivot-grid/pivot-resizer.component';
import { IgxActionStripComponent } from '../../action-strip/action-strip.component';
import { IPageEventArgs } from '../../paginator/paginator-interfaces';
import { ISortingExpression, SortingDirection } from '../../data-operations/sorting-strategy';
import { PivotSortUtil } from './pivot-sort-util';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IgxPivotValueChipTemplateDirective } from './pivot-grid.directives';
import { IFilteringOperation } from '../../data-operations/filtering-condition';
import { IgxGridValidationService } from '../grid/grid-validation.service';

let NEXT_ID = 0;
const MINIMUM_COLUMN_WIDTH = 200;
const MINIMUM_COLUMN_WIDTH_SUPER_COMPACT = 104;

/**
 * Pivot Grid provides a way to present and manipulate data in a pivot table view.
 *
 * @igxModule IgxPivotGridModule
 * @igxGroup Grids & Lists
 * @igxKeywords pivot, grid, table
 * @igxTheme igx-grid-theme
 * @remarks
 * The Ignite UI Pivot Grid is used for grouping and aggregating simple flat data into a pivot table.  Once data
 * has been bound and the dimensions and values configured it can be manipulated via sorting and filtering.
 * @example
 * ```html
 * <igx-pivot-grid [data]="data" [pivotConfiguration]="configuration">
 * </igx-pivot-grid>
 * ```
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-pivot-grid',
    templateUrl: 'pivot-grid.component.html',
    providers: [
        IgxGridCRUDService,
        IgxGridValidationService,
        IgxGridSummaryService,
        IgxGridSelectionService,
        GridBaseAPIService,
        { provide: IGX_GRID_BASE, useExisting: IgxPivotGridComponent },
        { provide: IgxFilteringService, useClass: IgxPivotFilteringService },
        IgxPivotGridNavigationService,
        IgxPivotColumnResizingService,
        IgxForOfSyncService,
        IgxForOfScrollSyncService
    ]
})
export class IgxPivotGridComponent extends IgxGridBaseDirective implements OnInit, AfterContentInit,
    GridType, AfterViewInit {

    /**
     * Emitted when the dimension collection is changed via the grid chip area.
     *
     * @remarks
     * Returns the new dimension collection and its type:
     * @example
     * ```html
     * <igx-pivot-grid #grid [data]="localData" [height]="'305px'"
     *              (dimensionsChange)="dimensionsChange($event)"></igx-grid>
     * ```
     */
    @Output()
    public dimensionsChange = new EventEmitter<IDimensionsChange>();


    /**
     * Emitted when the dimension is initialized.
     * @remarks
     * Emits the dimension that is about to be initialized.
     * @example
     * ```html
     * <igx-pivot-grid #grid [data]="localData" [height]="'305px'"
     *              (dimensionInit)="dimensionInit($event)"></igx-pivot-grid>
     * ```
     */
    @Output()
    public dimensionInit = new EventEmitter<IPivotDimension>();

    /**
     * Emitted when the value is initialized.
     * @remarks
     * Emits the value that is about to be initialized.
     * @example
     * ```html
     * <igx-pivot-grid #grid [data]="localData" [height]="'305px'"
     *              (valueInit)="valueInit($event)"></igx-pivot-grid>
     * ```
     */
    @Output()
    public valueInit = new EventEmitter<IPivotValue>();


    /**
     * Emitted when a dimension is sorted.
     *
     * @example
     * ```html
     * <igx-pivot-grid #grid [data]="localData" [height]="'305px'"
     *              (dimensionsSortingExpressionsChange)="dimensionsSortingExpressionsChange($event)"></igx-pivot-grid>
     * ```
     */
    @Output()
    public dimensionsSortingExpressionsChange = new EventEmitter<ISortingExpression[]>();

    /**
     * Emitted when the values collection is changed via the grid chip area.
     *
     * @remarks
     * Returns the new dimension
     * @example
     * ```html
     * <igx-pivot-grid #grid [data]="localData" [height]="'305px'"
     *              (valuesChange)="valuesChange($event)"></igx-grid>
     * ```
    */
    @Output()
    public valuesChange = new EventEmitter<IValuesChange>();


    /**
     * Gets the sorting expressions generated for the dimensions.
     *
     * @example
     * ```typescript
     * const expressions = this.grid.dimensionsSortingExpressions;
     * ```
     */
    public get dimensionsSortingExpressions() {
        const allEnabledDimensions = this.rowDimensions.concat(this.columnDimensions);
        const dimensionsSortingExpressions = PivotSortUtil.generateDimensionSortingExpressions(allEnabledDimensions);
        return dimensionsSortingExpressions;
    }

    /** @hidden @internal */
    @ViewChild(IgxPivotHeaderRowComponent, { static: true })
    public theadRow: IgxPivotHeaderRowComponent;

    /**
    * @hidden @internal
    */
    @ContentChild(IgxPivotValueChipTemplateDirective, { read: IgxPivotValueChipTemplateDirective })
    protected valueChipTemplateDirective: IgxPivotValueChipTemplateDirective;

    /**
     * Gets/Sets a custom template for the value chips.
     *
     * @example
     * ```html
     * <igx-pivot-grid [valueChipTemplate]="myTemplate"><igx-pivot-grid>
     * ```
     */
     @Input()
     public valueChipTemplate: TemplateRef<IgxPivotGridValueTemplateContext>;

    @Input()
    /**
     * Gets/Sets the pivot configuration with all related dimensions and values.
     *
     * @example
     * ```html
     * <igx-pivot-grid [pivotConfiguration]="config"></igx-pivot-grid>
     * ```
     */
    public set pivotConfiguration(value: IPivotConfiguration) {
        this._pivotConfiguration = value;
        this.emitInitEvents(this._pivotConfiguration);
        this.filteringExpressionsTree = PivotUtil.buildExpressionTree(value);
        if (!this._init) {
            this.setupColumns();
        }
        this.notifyChanges(true);
    }

    public get pivotConfiguration() {
        return this._pivotConfiguration || { rows: null, columns: null, values: null, filters: null };
    }

    @Input()
    /**
     * Gets/Sets the pivot configuration ui for the pivot grid - chips and their
     * corresponding containers for row, filter, column dimensions and values
     *
     * @example
     * ```html
     * <igx-pivot-grid [showPivotConfigurationUI]="false"></igx-pivot-grid>
     * ```
     */
    public showPivotConfigurationUI: boolean = true;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.role')
    public role = 'grid';


    /**
     * Enables a super compact theme for the component.
     * @remarks
     * Overrides the displayDensity option if one is set.
     * @example
     * ```html
     * <igx-pivot-grid [superCompactMode]="true"></igx-pivot-grid>
     * ```
     */
    @HostBinding('class.igx-grid__pivot--super-compact')
    @Input()
    public get superCompactMode() {
        return this._superCompactMode;
    }

    public set superCompactMode(value) {
        Promise.resolve().then(() => {
            // wait for the current detection cycle to end before triggering a new one.
            this._superCompactMode = value;
            this.cdr.detectChanges();
        });
    }

    /**
    * Returns the theme of the component.
    * The default theme is `comfortable`.
    * Available options are `comfortable`, `cosy`, `compact`.
    * @remarks
    * If set while superCompactMode is enabled will have no affect.
    * ```typescript
    * let componentTheme = this.component.displayDensity;
    * ```
    */
    @Input()
    public get displayDensity(): DisplayDensity {
        if (this.superCompactMode) {
            return DisplayDensity.compact;
        }
        return super.displayDensity;
    }

    /**
    * Sets the theme of the component.
    */
    public set displayDensity(val: DisplayDensity) {
        const currentDisplayDensity = this._displayDensity;
        this._displayDensity = val as DisplayDensity;

        if (currentDisplayDensity !== this._displayDensity) {
            const densityChangedArgs: IDensityChangedEventArgs = {
                oldDensity: currentDisplayDensity,
                newDensity: this._displayDensity
            };

            this.onDensityChanged.emit(densityChangedArgs);
        }
    }

    /**
     * @hidden @internal
     */
    @ViewChild('record_template', { read: TemplateRef, static: true })
    public recordTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('headerTemplate', { read: TemplateRef, static: true })
    public headerTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild(IgxPivotGridColumnResizerComponent)
    public resizeLine: IgxPivotGridColumnResizerComponent;

    /**
     * @hidden @internal
     */
    @ViewChildren(IgxGridExcelStyleFilteringComponent, { read: IgxGridExcelStyleFilteringComponent })
    public excelStyleFilteringComponents: QueryList<IgxGridExcelStyleFilteringComponent>;

    /**
     * @hidden @internal
     */
    @ViewChildren(IgxPivotRowDimensionContentComponent)
    protected rowDimensionContentCollection: QueryList<IgxPivotRowDimensionContentComponent>;

    /**
     * @hidden @internal
     */
    protected get minColumnWidth() {
        if (this.superCompactMode) {
            return MINIMUM_COLUMN_WIDTH_SUPER_COMPACT;
        } else {
            return MINIMUM_COLUMN_WIDTH;
        }
    }

    /**
     * @hidden @internal
     */
    @ViewChildren('verticalRowDimScrollContainer', { read: IgxGridForOfDirective })
    public verticalRowDimScrollContainers: QueryList<IgxGridForOfDirective<any>>;

    /**
     * @hidden @interal
     */
    @Input()
    public addRowEmptyTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @Input()
    public snackbarDisplayTime = 6000;

    /**
     * @hidden @internal
     */
    @Output()
    public cellEdit = new EventEmitter<IGridEditEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public cellEditDone = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public cellEditEnter = new EventEmitter<IGridEditEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public cellEditExit = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public columnMovingStart = new EventEmitter<IColumnMovingStartEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public columnMoving = new EventEmitter<IColumnMovingEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public columnMovingEnd = new EventEmitter<IColumnMovingEndEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public columnPin = new EventEmitter<IPinColumnCancellableEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public columnPinned = new EventEmitter<IPinColumnEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowAdd = new EventEmitter<IGridEditEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowAdded = new EventEmitter<IRowDataEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowDeleted = new EventEmitter<IRowDataEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowDelete = new EventEmitter<IGridEditEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowDragStart = new EventEmitter<IRowDragStartEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowDragEnd = new EventEmitter<IRowDragEndEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowEditEnter = new EventEmitter<IGridEditEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowEdit = new EventEmitter<IGridEditEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowEditDone = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowEditExit = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowPinning = new EventEmitter<IPinRowEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public rowPinned = new EventEmitter<IPinRowEventArgs>();

    public columnGroupStates = new Map<string, boolean>();
    public dimensionDataColumns;
    public get pivotKeys() {
        return this.pivotConfiguration.pivotKeys || DEFAULT_PIVOT_KEYS;
    }
    public isPivot = true;

    /**
     * @hidden @internal
     */
    public dragRowID = null;

    /**
    * @hidden @internal
    */
    public get rootSummariesEnabled(): boolean {
        return false;
    }

    /**
     * @hidden @internal
     */
    public rowDimensionResizing = true;

    /**
     * @hidden @internal
     */
    private _emptyRowDimension: IPivotDimension = { memberName: '', enabled: true, level: 0 };
    public get emptyRowDimension(): IPivotDimension {
        return this._emptyRowDimension;
    }

    protected _defaultExpandState = false;
    protected _filterStrategy: IFilteringStrategy = new DimensionValuesFilteringStrategy();
    private _data;
    private _filteredData;
    private _pivotConfiguration: IPivotConfiguration = { rows: null, columns: null, values: null, filters: null };
    private p_id = `igx-pivot-grid-${NEXT_ID++}`;
    private _superCompactMode = false;

    /**
    * Gets/Sets the default expand state for all rows.
    */
    @Input()
    public get defaultExpandState() {
        return this._defaultExpandState;
    }

    public set defaultExpandState(val: boolean) {
        this._defaultExpandState = val;
    }

    /**
     * @hidden @internal
     */
    @Input()
    public get pagingMode() {
        return;
    }

    public set pagingMode(_val: GridPagingMode) {
    }

    /**
     * @hidden @internal
     */
    @WatchChanges()
    @Input()
    public get hideRowSelectors() {
        return;
    }

    public set hideRowSelectors(_value: boolean) {
    }

    /**
     * @hidden @internal
     */
    public autoGenerate = true;

    /**
     * @hidden @internal
     */
    public actionStrip: IgxActionStripComponent;

    /**
     * @hidden @internal
     */
    public pageChange = new EventEmitter<number>();

    /**
     * @hidden @internal
     */
    public pagingDone = new EventEmitter<IPageEventArgs>();

    /**
     * @hidden @internal
     */
    public perPageChange = new EventEmitter<number>();

    /**
     * @hidden @internal
     */
    public shouldGenerate: boolean;

    /**
     * @hidden @internal
     */
    public moving = false;

    /**
     * @hidden @internal
     */
    public toolbarExporting = new EventEmitter<IGridToolbarExportEventArgs>();

    /**
     * @hidden @internal
     */
    @Input()
    public get rowDraggable(): boolean {
        return;
    }


    public set rowDraggable(_val: boolean) {
    }

    /**
     * @hidden @internal
     */
    @Input()
    public get allowAdvancedFiltering() {
        return false;
    }

    public set allowAdvancedFiltering(_value) {
    }

    /**
     * @hidden @internal
     */
    @Input()
    public get filterMode() {
        return FilterMode.quickFilter;
    }

    public set filterMode(_value: FilterMode) {
    }

    /**
     * @hidden @internal
     */
    @Input()
    public get allowFiltering() {
        return false;
    }

    public set allowFiltering(_value) {
    }

    /**
     * @hidden @internal
     */
    public get isFirstPage(): boolean {
        return true;
    }

    /**
     * @hidden @internal
     */
    public get isLastPage(): boolean {
        return true;
    }

    /**
     * @hidden @internal
     */
    @Input()
    public get page(): number {
        return 0;
    }

    public set page(_val: number) {
    }


    /**
     * @hidden @internal
     */
    @Input()
    public get paging(): boolean {
        return false;
    }

    public set paging(_value: boolean) {
    }

    /**
     * @hidden @internal
     */
    @Input()
    public get perPage(): number {
        return;
    }

    public set perPage(_val: number) {
    }

    /**
     * @hidden @internal
     */
    public get pinnedColumns(): IgxColumnComponent[] {
        return [];
    }

    /**
    * @hidden @internal
    */
    public get unpinnedColumns(): IgxColumnComponent[] {
        return super.unpinnedColumns;
    }

    /**
    * @hidden @internal
    */
    public get unpinnedDataView(): any[] {
        return super.unpinnedDataView;
    }

    /**
    * @hidden @internal
    */
    public get unpinnedWidth() {
        return super.unpinnedWidth;
    }

    /**
     * @hidden @internal
     */
    public get pinnedWidth() {
        return super.pinnedWidth;
    }

    /**
     * @hidden @internal
     */
    @Input()
    public set summaryRowHeight(_value: number) {
    }

    public get summaryRowHeight(): number {
        return 0;
    }

    /**
     * @hidden @internal
     */
    public get totalPages(): number {
        return;
    }

    /**
     * @hidden @internal
     */
    public get transactions(): TransactionService<Transaction, State> {
        return this._transactions;
    }



    /**
     * @hidden @internal
     */
    public get dragIndicatorIconTemplate(): TemplateRef<any> {
        return;
    }

    public set dragIndicatorIconTemplate(_val: TemplateRef<any>) {
    }

    /**
     * @hidden @internal
     */
    @WatchChanges()
    @Input()
    public get rowEditable(): boolean {
        return;
    }

    public set rowEditable(_val: boolean) {
    }

    /**
     * @hidden @internal
     */
    @Input()
    public get pinning() {
        return {};
    }
    public set pinning(_value) {
    }

    /**
     * @hidden @internal
     */
    @Input()
    public get summaryPosition() {
        return;
    }

    public set summaryPosition(_value: GridSummaryPosition) {
    }

    /**
     * @hidden @interal
     */
    @Input()
    public get summaryCalculationMode() {
        return;
    }

    public set summaryCalculationMode(_value: GridSummaryCalculationMode) {
    }

    /**
     * @hidden @interal
     */
    @Input()
    public get showSummaryOnCollapse() {
        return;
    }

    public set showSummaryOnCollapse(_value: boolean) {
    }

    /**
     * @hidden @internal
     */
    public get hiddenColumnsCount() {
        return null;
    }

    /**
     * @hidden @internal
     */
    public get pinnedColumnsCount() {
        return null;
    }

    /**
     * @hidden @internal
     */
    @Input()
    public get batchEditing(): boolean {
        return;
    }

    public set batchEditing(_val: boolean) {
    }

    public get selectedRows(): any[] {
        if (this.selectionService.getSelectedRows().length === 0) {
            return [];
        }
        const selectedRowIds = [];
        this.dataView.forEach(record => {
            const prev = [];
            for (const dim of this.rowDimensions) {
                let currDim = dim;
                let shouldBreak = false;
                do {
                    const key = PivotUtil.getRecordKey(record, currDim);
                    if (this.selectionService.isPivotRowSelected(key) && !selectedRowIds.find(x => x === record)) {
                        selectedRowIds.push(record);
                        shouldBreak = true;
                        break;
                    }
                    currDim = currDim.childLevel;
                } while (currDim);
                prev.push(dim);
                if (shouldBreak) {
                    break;
                }
            }

        });

        return selectedRowIds;
    }

    /**
     * Gets the default row height.
     *
     * @example
     * ```typescript
     * const rowHeigh = this.grid.defaultRowHeight;
     * ```
     */
    public get defaultRowHeight(): number {
        if (this.superCompactMode) {
            return 24;
        }
        return super.defaultRowHeight;
    }

    constructor(
        validationService: IgxGridValidationService,
        public selectionService: IgxGridSelectionService,
        public colResizingService: IgxPivotColumnResizingService,
        gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        protected transactionFactory: IgxFlatTransactionFactory,
        elementRef: ElementRef<HTMLElement>,
        zone: NgZone,
        @Inject(DOCUMENT) public document,
        cdr: ChangeDetectorRef,
        resolver: ComponentFactoryResolver,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        appRef: ApplicationRef,
        moduleRef: NgModuleRef<any>,
        injector: Injector,
        navigation: IgxPivotGridNavigationService,
        filteringService: IgxFilteringService,
        @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
        public summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Inject(LOCALE_ID) localeId: string,
        protected platform: PlatformUtil,
        @Optional() @Inject(IgxGridTransaction) protected _diTransactions?: TransactionService<Transaction, State>) {
        super(
            validationService,
            selectionService,
            colResizingService,
            gridAPI,
            transactionFactory,
            elementRef,
            zone,
            document,
            cdr,
            resolver,
            differs,
            viewRef,
            appRef,
            moduleRef,
            injector,
            navigation,
            filteringService,
            overlayService,
            summaryService,
            _displayDensityOptions,
            localeId,
            platform);
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        // pivot grid always generates columns automatically.
        this.autoGenerate = true;
        super.ngOnInit();
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        // ignore any user defined columns and auto-generate based on pivot config.
        this.updateColumns([]);
        Promise.resolve().then(() => {
            this.setupColumns();
        });
        if (this.valueChipTemplateDirective) {
            this.valueChipTemplate = this.valueChipTemplateDirective.template;
        }
    }

    /**
     * @hidden @internal
     */
    public ngAfterViewInit() {
        Promise.resolve().then(() => {
            super.ngAfterViewInit();
        });
    }

    /**
     * Notifies for dimension change.
     */
    public notifyDimensionChange(regenerateColumns = false) {
        if (regenerateColumns) {
            this.setupColumns();
        }
        this.pipeTrigger++;
        this.cdr.detectChanges();
    }

    /**
     * Gets the full list of dimensions.
     *
     * @example
     * ```typescript
     * const dimensions = this.grid.allDimensions;
     * ```
     */
    public get allDimensions() {
        const config = this._pivotConfiguration;
        if (!config) return [];
        return (config.rows || []).concat((config.columns || [])).concat(config.filters || []).filter(x => x !== null && x !== undefined);
    }

    /** @hidden @internal */
    public createFilterESF(dropdown: any, column: ColumnType, options: OverlaySettings, shouldReatach: boolean) {
        options.outlet = this.outlet;
        if (dropdown) {
            dropdown.initialize(column, this.overlayService);
            if (shouldReatach) {
                const id = this.overlayService.attach(dropdown.element, options);
                dropdown.overlayComponentId = id;
                return { id, ref: undefined };
            }
            return { id: dropdown.overlayComponentId, ref: undefined };
        }
    }

    /** @hidden */
    public featureColumnsWidth() {
        return this.pivotRowWidths;
    }

    /**
     * Gets/Sets the value of the `id` attribute.
     *
     * @remarks
     * If not provided it will be automatically generated.
     * @example
     * ```html
     * <igx-pivot-grid [id]="'igx-pivot-1'" [data]="Data"></igx-pivot-grid>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public get id(): string {
        return this.p_id;
    }
    public set id(value: string) {
        this.p_id = value;
    }

    /**
     * An @Input property that lets you fill the `IgxPivotGridComponent` with an array of data.
     * ```html
     * <igx-pivot-grid [data]="Data"></igx-pivot-grid>
     * ```
     */
    @Input()
    public set data(value: any[] | null) {
        this._data = value || [];
        if (!this._init) {
            this.setupColumns();
            this.reflow();
        }
        this.cdr.markForCheck();
        if (this.height === null || this.height.indexOf('%') !== -1) {
            // If the height will change based on how much data there is, recalculate sizes in igxForOf.
            this.notifyChanges(true);
        }
    }

    /**
     * Returns an array of data set to the component.
     * ```typescript
     * let data = this.grid.data;
     * ```
     */
    public get data(): any[] | null {
        return this._data;
    }
    /**
     * Sets an array of objects containing the filtered data.
     * ```typescript
     * this.grid.filteredData = [{
     *       ID: 1,
     *       Name: "A"
     * }];
     * ```
     */
    public set filteredData(value) {
        this._filteredData = value;
    }

    /**
     * Returns an array of objects containing the filtered data.
     * ```typescript
     * let filteredData = this.grid.filteredData;
     * ```
     *
     * @memberof IgxHierarchicalGridComponent
     */
    public get filteredData() {
        return this._filteredData;
    }


    /**
     * @hidden
     */
    public getContext(rowData, rowIndex): any {
        return {
            $implicit: rowData,
            templateID: {
                type: 'dataRow',
                id: null
            },
            index: this.getDataViewIndex(rowIndex, false)
        };
    }

    /**
     * @hidden @internal
     */
    public get pivotRowWidths() {
        return this.rowDimensions.length ? this.rowDimensions.reduce((accumulator, dim) => accumulator + this.rowDimensionWidthToPixels(dim), 0) :
            this.rowDimensionWidthToPixels(this.emptyRowDimension);
    }

    /**
     * @hidden @internal
     */
    public rowDimensionWidthToPixels(dim: IPivotDimension, ignoreBeforeInit: boolean = false): number {
        if (!ignoreBeforeInit && this.shouldGenerate) {
            return 0;
        }

        if (!dim.width) {
            return MINIMUM_COLUMN_WIDTH;
        }
        const isPercent = dim.width && dim.width.indexOf('%') !== -1;
        if (isPercent) {
            return parseFloat(dim.width) / 100 * this.calcWidth;
        } else {
            return parseInt(dim.width, 10);
        }
    }

    /**
     * @hidden @internal
     */
    public reverseDimensionWidthToPercent(width: number): number {
        return (width * 100 / this.calcWidth);
    }

    public get pivotContentCalcWidth() {
        const totalDimWidth = this.rowDimensions.length > 0 ?
            this.rowDimensions.map((dim) => this.rowDimensionWidthToPixels(dim)).reduce((prev, cur) => prev + cur) :
            0;
        return this.calcWidth - totalDimWidth;
    }

    public get pivotPinnedWidth() {
        return !this.shouldGenerate ? (this.isPinningToStart ? this.pinnedWidth : this.headerFeaturesWidth) : 0;
    }

    public get pivotUnpinnedWidth() {
        return !this.shouldGenerate ? this.unpinnedWidth : 0;
    }

    public get rowDimensions() {
        return this.pivotConfiguration.rows?.filter(x => x.enabled) || [];
    }

    public get columnDimensions() {
        return this.pivotConfiguration.columns?.filter(x => x.enabled) || [];
    }

    public get filterDimensions() {
        return this.pivotConfiguration.filters?.filter(x => x.enabled) || [];
    }

    public get values() {
        return this.pivotConfiguration.values?.filter(x => x.enabled) || [];
    }

    public toggleColumn(col: IgxColumnComponent) {
        const state = this.columnGroupStates.get(col.field);
        const newState = !state;
        this.columnGroupStates.set(col.field, newState);
        this.toggleRowGroup(col, newState);
        this.reflow();
    }

    protected override getColumnWidthSum(): number {
        let colSum = super.getColumnWidthSum();
        colSum += this.rowDimensions.map(dim => this.rowDimensionWidthToPixels(dim, true)).reduce((prev, cur) => prev + cur, 0);
        return colSum;
    }

    /**
     * @hidden @internal
     */
    public isRecordPinnedByIndex(_rowIndex: number) {
        return null;
    }

    /**
     * @hidden @internal
     */
    public toggleColumnVisibility(_args: IColumnVisibilityChangedEventArgs) {
        return;
    }

    /**
     * @hidden @internal
     */
    public expandAll() {
    }

    /**
     * @hidden @internal
     */
    public collapseAll() {
    }

    /**
     * @hidden @internal
     */
    public expandRow(_rowID: any) {
    }

    /**
     * @hidden @internal
     */
    public collapseRow(_rowID: any) {
    }

    /**
     * @hidden @internal
     */
    public get pinnedRows(): IgxGridRowComponent[] {
        return;
    }

    /**
     * @hidden @internal
     */
    @Input()
    public get totalRecords(): number {
        return;
    }

    public set totalRecords(_total: number) {
    }

    /**
     * @hidden @internal
     */
    public moveColumn(_column: IgxColumnComponent, _target: IgxColumnComponent, _pos: DropPosition = DropPosition.AfterDropTarget) {
    }

    /**
     * @hidden @internal
     */
    public addRow(_data: any): void {
    }

    /**
     * @hidden @internal
     */
    public deleteRow(_rowSelector: any): any {
    }

    /**
     * @hidden @internal
     */
    public updateCell(_value: any, _rowSelector: any, _column: string): void {
    }

    /**
     * @hidden @internal
     */
    public updateRow(_value: any, _rowSelector: any): void {
    }

    /**
     * @hidden @internal
     */
    public enableSummaries(..._rest) {
    }

    /**
     * @hidden @internal
     */
    public disableSummaries(..._rest) {
    }

    /**
     * @hidden @internal
     */
    public pinColumn(_columnName: string | IgxColumnComponent, _index?): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public unpinColumn(_columnName: string | IgxColumnComponent, _index?): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public pinRow(_rowID: any, _index?: number, _row?: RowType): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public unpinRow(_rowID: any, _row?: RowType): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public get pinnedRowHeight() {
        return;
    }

    /**
     * @hidden @internal
     */
    public get hasEditableColumns(): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public get hasSummarizedColumns(): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public get hasMovableColumns(): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public get pinnedDataView(): any[] {
        return [];
    }

    /**
     * @hidden @internal
     */
    public openAdvancedFilteringDialog(_overlaySettings?: OverlaySettings) {
    }

    /**
     * @hidden @internal
     */
    public closeAdvancedFilteringDialog(_applyChanges: boolean) {
    }

    /**
     * @hidden @internal
     */
    public endEdit(_commit = true, _event?: Event) {
    }

    /**
     * @hidden @internal
     */
    public beginAddRowById(_rowID: any, _asChild?: boolean): void {
    }

    /**
     * @hidden @internal
     */
    public beginAddRowByIndex(_index: number): void {
    }

    /**
     * @hidden @internal
     */
    public clearSearch() { }

    /**
     * @hidden @internal
     */
    public paginate(_val: number): void {
    }

    /**
    * @hidden @internal
    */
    public nextPage(): void {
    }

    /**
    * @hidden @internal
    */
    public previousPage(): void {
    }

    /**
    * @hidden @internal
    */
    public refreshSearch(_updateActiveInfo?: boolean, _endEdit = true): number {
        return 0;
    }

    /**
    * @hidden @internal
    */
    public findNext(_text: string, _caseSensitive?: boolean, _exactMatch?: boolean): number {
        return 0;
    }

    /**
    * @hidden @internal
    */
    public findPrev(_text: string, _caseSensitive?: boolean, _exactMatch?: boolean): number {
        return 0;
    }

    /**
    * @hidden @internal
    */
    public getNextCell(currRowIndex: number, curVisibleColIndex: number,
        callback: (IgxColumnComponent) => boolean = null): ICellPosition {
        return super.getNextCell(currRowIndex, curVisibleColIndex, callback);
    }

    /**
    * @hidden @internal
    */
    public getPreviousCell(currRowIndex: number, curVisibleColIndex: number,
        callback: (IgxColumnComponent) => boolean = null): ICellPosition {
        return super.getPreviousCell(currRowIndex, curVisibleColIndex, callback);
    }

    /**
    * @hidden @internal
    */
    public getPinnedWidth(takeHidden = false) {
        return super.getPinnedWidth(takeHidden);
    }

    /**
     * @hidden @internal
     */
    public get totalHeight() {
        return this.calcHeight;
    }

    public getColumnGroupExpandState(col: IgxColumnComponent) {
        const state = this.columnGroupStates.get(col.field);
        // columns are expanded by default?
        return state !== undefined && state !== null ? state : false;
    }

    public toggleRowGroup(col: IgxColumnComponent, newState: boolean) {
        if (!col) return;
        if (this.hasMultipleValues) {
            const parentCols = col.parent ? col.parent.children.toArray() : this._autoGeneratedCols.filter(x => x.level === 0);
            const siblingCol = parentCols.filter(x => x.header === col.header && x !== col)[0];
            const currIndex = parentCols.indexOf(col);
            const siblingIndex = parentCols.indexOf(siblingCol);
            if (currIndex < siblingIndex) {
                // clicked on the full hierarchy header
                this.resolveToggle(col, newState);
                siblingCol.headerTemplate = this.headerTemplate;
            } else {
                // clicked on summary parent column that contains just the measures
                col.headerTemplate = undefined;
                this.resolveToggle(siblingCol, newState);
            }
        } else {
            const parentCols = col.parent ? col.parent.children : this._autoGeneratedCols.filter(x => x.level === 0);
            const fieldColumn = parentCols.filter(x => x.header === col.header && !x.columnGroup)[0];
            const groupColumn = parentCols.filter(x => x.header === col.header && x.columnGroup)[0];
            this.resolveToggle(groupColumn, newState);
            if (newState) {
                fieldColumn.headerTemplate = this.headerTemplate;
            } else {
                fieldColumn.headerTemplate = undefined;
            }
        }
    }

    /**
    * @hidden @internal
    */
    public setupColumns() {
        super.setupColumns();
    }

    /**
     * Auto-sizes row dimension cells.
     *
     * @remarks
     * Only sizes based on the dimension cells in view.
     * @example
     * ```typescript
     * this.grid.autoSizeRowDimension(dimension);
     * ```
     * @param dimension The row dimension to size.
     */
    public autoSizeRowDimension(dimension: IPivotDimension) {
        if (this.getDimensionType(dimension) === PivotDimensionType.Row) {
            const relatedDims = PivotUtil.flatten([dimension]).map(x => x.memberName);
            const content = this.rowDimensionContentCollection.filter(x => relatedDims.indexOf(x.dimension.memberName) !== -1);
            const headers = content.map(x => x.headerGroups.toArray()).flat().map(x => x.header && x.header.refInstance);
            const autoWidth = this.getLargesContentWidth(headers);
            dimension.width = autoWidth;
            this.pipeTrigger++;
            this.cdr.detectChanges();
        }
    }

    /**
     * Inserts dimension in target collection by type at specified index or at the collection's end.
     *
     * @example
     * ```typescript
     * this.grid.insertDimensionAt(dimension, PivotDimensionType.Row, 1);
     * ```
     * @param dimension The dimension that will be added.
     * @param targetCollectionType The target collection type to add to. Can be Row, Column or Filter.
     * @param index The index in the collection at which to add.
     * This parameter is optional. If not set it will add it to the end of the collection.
     */
    public insertDimensionAt(dimension: IPivotDimension, targetCollectionType: PivotDimensionType, index?: number) {
        const targetCollection = this.getDimensionsByType(targetCollectionType);
        if (index !== undefined) {
            targetCollection.splice(index, 0, dimension);
        } else {
            targetCollection.push(dimension);
        }
        if (targetCollectionType === PivotDimensionType.Column) {
            this.setupColumns();
        }
        this.pipeTrigger++;
        this.dimensionsChange.emit({ dimensions: targetCollection, dimensionCollectionType: targetCollectionType });
        if (targetCollectionType === PivotDimensionType.Filter) {
            this.dimensionDataColumns = this.generateDimensionColumns();
            this.reflow();
        }
    }

    /**
     * Move dimension from its currently collection to the specified target collection by type at specified index or at the collection's end.
     *
     * @example
     * ```typescript
     * this.grid.moveDimension(dimension, PivotDimensionType.Row, 1);
     * ```
     * @param dimension The dimension that will be moved.
     * @param targetCollectionType The target collection type to move it to. Can be Row, Column or Filter.
     * @param index The index in the collection at which to add.
     * This parameter is optional. If not set it will add it to the end of the collection.
     */
    public moveDimension(dimension: IPivotDimension, targetCollectionType: PivotDimensionType, index?: number) {
        const prevCollectionType = this.getDimensionType(dimension);
        if (prevCollectionType === null) return;
        // remove from old collection
        this._removeDimensionInternal(dimension);
        // add to target
        this.insertDimensionAt(dimension, targetCollectionType, index);

        if (prevCollectionType === PivotDimensionType.Column) {
            this.setupColumns();
        }
    }

    /**
     * Removes dimension from its currently collection.
     * @remarks
     * This is different than toggleDimension that enabled/disables the dimension.
     * This completely removes the specified dimension from the collection.
     * @example
     * ```typescript
     * this.grid.removeDimension(dimension);
     * ```
     * @param dimension The dimension to be removed.
     */
    public removeDimension(dimension: IPivotDimension) {
        const prevCollectionType = this.getDimensionType(dimension);
        this._removeDimensionInternal(dimension);
        if (prevCollectionType === PivotDimensionType.Column) {
            this.setupColumns();
        }
        if (prevCollectionType === PivotDimensionType.Filter) {
            this.reflow();
        }
        this.pipeTrigger++;
        this.cdr.detectChanges();
    }

    /**
     * Toggles the dimension's enabled state on or off.
     * @remarks
     * The dimension remains in its current collection. This just changes its enabled state.
     * @example
     * ```typescript
     * this.grid.toggleDimension(dimension);
     * ```
     * @param dimension The dimension to be toggled.
     */
    public toggleDimension(dimension: IPivotDimension) {
        const dimType = this.getDimensionType(dimension);
        if (dimType === null) return;
        const collection = this.getDimensionsByType(dimType);
        dimension.enabled = !dimension.enabled;
        if (dimType === PivotDimensionType.Column) {
            this.setupColumns();
        }
        if (!dimension.enabled && dimension.filter) {
            this.filteringService.clearFilter(dimension.memberName);
        }
        this.pipeTrigger++;
        this.dimensionsChange.emit({ dimensions: collection, dimensionCollectionType: dimType });
        this.cdr.detectChanges();
        if (dimType === PivotDimensionType.Filter) {
            this.reflow();
        }
    }

    /**
     * Inserts value at specified index or at the end.
     *
     * @example
     * ```typescript
     * this.grid.insertValueAt(value, 1);
     * ```
     * @param value The value definition that will be added.
     * @param index The index in the collection at which to add.
     * This parameter is optional. If not set it will add it to the end of the collection.
     */
    public insertValueAt(value: IPivotValue, index?: number) {
        if (!this.pivotConfiguration.values) {
            this.pivotConfiguration.values = [];
        }
        const values = this.pivotConfiguration.values;
        if (index !== undefined) {
            values.splice(index, 0, value);
        } else {
            values.push(value);
        }
        this.setupColumns();
        this.pipeTrigger++;
        this.cdr.detectChanges();
        this.valuesChange.emit({ values });
    }

    /**
     * Move value from its currently at specified index or at the end.
     *
     * @example
     * ```typescript
     * this.grid.moveValue(value, 1);
     * ```
     * @param value The value that will be moved.
     * @param index The index in the collection at which to add.
     * This parameter is optional. If not set it will add it to the end of the collection.
     */
    public moveValue(value: IPivotValue, index?: number) {
        if (this.pivotConfiguration.values.indexOf(value) === -1) return;
        // remove from old index
        this.removeValue(value);
        // add to new
        this.insertValueAt(value, index);
    }

    /**
     * Removes value from collection.
     * @remarks
     * This is different than toggleValue that enabled/disables the value.
     * This completely removes the specified value from the collection.
     * @example
     * ```typescript
     * this.grid.removeValue(dimension);
     * ```
     * @param value The value to be removed.
     */
    public removeValue(value: IPivotValue,) {
        const values = this.pivotConfiguration.values;
        const currentIndex = values.indexOf(value);
        if (currentIndex !== -1) {
            values.splice(currentIndex, 1);
            this.setupColumns();
            this.pipeTrigger++;
            this.valuesChange.emit({ values });
        }
    }

    /**
     * Toggles the value's enabled state on or off.
     * @remarks
     * The value remains in its current collection. This just changes its enabled state.
     * @example
     * ```typescript
     * this.grid.toggleValue(value);
     * ```
     * @param value The value to be toggled.
     */
    public toggleValue(value: IPivotValue) {
        if (this.pivotConfiguration.values.indexOf(value) === -1) return;
        value.enabled = !value.enabled;
        this.setupColumns();
        this.pipeTrigger++;
        this.valuesChange.emit({ values: this.pivotConfiguration.values });
        this.reflow();
    }

    /**
     * Sort the dimension and its children in the provided direction.
     * @example
     * ```typescript
     * this.grid.sortDimension(dimension, SortingDirection.Asc);
     * ```
     * @param value The value to be toggled.
     */
    public sortDimension(dimension: IPivotDimension, sortDirection: SortingDirection) {
        const dimensionType = this.getDimensionType(dimension);
        dimension.sortDirection = sortDirection;
        // apply same sort direction to children.
        let dim = dimension;
        while (dim.childLevel) {
            dim.childLevel.sortDirection = dimension.sortDirection;
            dim = dim.childLevel;
        }
        this.pipeTrigger++;
        this.dimensionsSortingExpressionsChange.emit(this.dimensionsSortingExpressions);
        if (dimensionType === PivotDimensionType.Column) {
            this.setupColumns();
        }
        this.cdr.detectChanges();
    }

    /**
     * Filters a single `IPivotDimension`.
     *
     * @example
     * ```typescript
     * public filter() {
     *      const set = new Set();
     *      set.add('Value 1');
     *      set.add('Value 2');
     *      this.grid1.filterDimension(this.pivotConfigHierarchy.rows[0], set, IgxStringFilteringOperand.instance().condition('in'));
     * }
     * ```
     */
    public filterDimension(dimension: IPivotDimension, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree ) {
        this.filteringService.filter(dimension.memberName, value, conditionOrExpressionTree);
        const dimensionType = this.getDimensionType(dimension);
        if (dimensionType === PivotDimensionType.Column) {
            this.setupColumns();
        }
        this.cdr.detectChanges();
    }

    /**
     * @hidden @internal
     */
    public getDimensionsByType(dimension: PivotDimensionType) {
        switch (dimension) {
            case PivotDimensionType.Row:
                if (!this.pivotConfiguration.rows) {
                    this.pivotConfiguration.rows = [];
                }
                return this.pivotConfiguration.rows;
            case PivotDimensionType.Column:
                if (!this.pivotConfiguration.columns) {
                    this.pivotConfiguration.columns = [];
                }
                return this.pivotConfiguration.columns;
            case PivotDimensionType.Filter:
                if (!this.pivotConfiguration.filters) {
                    this.pivotConfiguration.filters = [];
                }
                return this.pivotConfiguration.filters;
            default:
                return null;
        }
    }

    /**
     * @hidden @internal
     */
    public resizeRowDimensionPixels(dimension: IPivotDimension, newWidth: number) {
        const isPercentageWidth = dimension.width && typeof dimension.width === 'string' && dimension.width.indexOf('%') !== -1;
        if (isPercentageWidth) {
            dimension.width = this.reverseDimensionWidthToPercent(newWidth).toFixed(2) + '%';
        } else {
            dimension.width = newWidth + 'px';
        }

        // Notify the grid to reflow, to update if horizontal scrollbar needs to be rendered/removed.
        this.pipeTrigger++;
        this.cdr.detectChanges();
    }

    /*
    * @hidden
    * @internal
    */
    protected _removeDimensionInternal(dimension) {
        const prevCollectionType = this.getDimensionType(dimension);
        if (prevCollectionType === null) return;
        const prevCollection = this.getDimensionsByType(prevCollectionType);
        const currentIndex = prevCollection.indexOf(dimension);
        prevCollection.splice(currentIndex, 1);
        this.pipeTrigger++;
        this.cdr.detectChanges();
    }

    protected getDimensionType(dimension: IPivotDimension): PivotDimensionType {
        return PivotUtil.flatten(this.pivotConfiguration.rows).indexOf(dimension) !== -1 ? PivotDimensionType.Row :
            PivotUtil.flatten(this.pivotConfiguration.columns).indexOf(dimension) !== -1 ? PivotDimensionType.Column :
                (!!this.pivotConfiguration.filters && PivotUtil.flatten(this.pivotConfiguration.filters).indexOf(dimension) !== -1) ?
                    PivotDimensionType.Filter : null;
    }

    protected getLargesContentWidth(contents: ElementRef[]): string {
        const largest = new Map<number, number>();
        if (contents.length > 0) {
            const cellsContentWidths = [];
            contents.forEach((elem) => cellsContentWidths.push(this.getHeaderCellWidth(elem.nativeElement).width));
            const index = cellsContentWidths.indexOf(Math.max(...cellsContentWidths));
            const cellStyle = this.document.defaultView.getComputedStyle(contents[index].nativeElement);
            const cellPadding = parseFloat(cellStyle.paddingLeft) + parseFloat(cellStyle.paddingRight) +
                parseFloat(cellStyle.borderLeftWidth) + parseFloat(cellStyle.borderRightWidth);
            largest.set(Math.max(...cellsContentWidths), cellPadding);
        }
        const largestCell = Math.max(...Array.from(largest.keys()));
        const width = Math.ceil(largestCell + largest.get(largestCell));

        if (Number.isNaN(width)) {
            return null;
        } else {
            return width + 'px';
        }
    }

    /**
    * @hidden
    */
    public get hasMultipleValues() {
        return this.values.length > 1;
    }

    /**
    * @hidden
    */
    public get excelStyleFilterMaxHeight() {
        // max 10 rows, row size depends on density
        const maxHeight = this.renderedRowHeight * 10;
        return `${maxHeight}px`;
    }

    /**
    * @hidden
    */
    public get excelStyleFilterMinHeight(): string {
        // min 5 rows, row size depends on density
        const minHeight = this.renderedRowHeight * 5;
        return `${minHeight}px`;
    }

    protected resolveToggle(groupColumn: IgxColumnComponent, state: boolean) {
        if (!groupColumn) return;
        groupColumn.hidden = state;
        this.columnGroupStates.set(groupColumn.field, state);
        const childrenTotal = this.hasMultipleValues ?
            groupColumn.children.filter(x => x.columnGroup && x.children.filter(y => !y.columnGroup).length === this.values.length) :
            groupColumn.children.filter(x => !x.columnGroup);
        const childrenSubgroups = this.hasMultipleValues ?
            groupColumn.children.filter(x => x.columnGroup && x.children.filter(y => !y.columnGroup).length === 0) :
            groupColumn.children.filter(x => x.columnGroup);
        childrenTotal.forEach(group => {
            const newState = this.columnGroupStates.get(group.field) || state;
            if (newState) {
                group.headerTemplate = this.headerTemplate;
            } else {
                group.headerTemplate = undefined;
            }
        });
        if (!groupColumn.hidden && childrenSubgroups.length > 0) {
            childrenSubgroups.forEach(group => {
                const newState = this.columnGroupStates.get(group.field) || state;
                this.resolveToggle(group, newState);
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    protected calcGridHeadRow() {
    }

    protected buildDataView(data: any[]) {
        this._dataView = data;
    }

    /**
     * @hidden @internal
     */
    protected getDataBasedBodyHeight(): number {
        const dvl = this.dataView?.length || 0;
        return dvl < this._defaultTargetRecordNumber ? 0 : this.defaultTargetBodyHeight;
    }

    protected horizontalScrollHandler(event) {
        const scrollLeft = event.target.scrollLeft;
        this.theadRow.headerContainers.forEach(headerForOf => {
            headerForOf.onHScroll(scrollLeft);
        });
        super.horizontalScrollHandler(event);
    }

    protected verticalScrollHandler(event) {
        this.verticalRowDimScrollContainers.forEach(x => {
            x.onScroll(event);
        });
        super.verticalScrollHandler(event);
    }

    /**
     * @hidden
     */
    protected autogenerateColumns() {
        let columns = [];
        const data = this.gridAPI.filterDataByExpressions(this.filteringExpressionsTree);
        this.dimensionDataColumns = this.generateDimensionColumns();
        const flattenedColumnsWithSorting = PivotUtil.flatten(this.columnDimensions).filter(dim => dim.sortDirection);
        const expressions =  flattenedColumnsWithSorting.length > 0? PivotSortUtil.generateDimensionSortingExpressions(flattenedColumnsWithSorting) : [];
        let sortedData = data;
        if (expressions.length > 0) {
            sortedData = DataUtil.sort(cloneArray(data), expressions, this.sortStrategy, this);
        }
        let fieldsMap;
        if (this.pivotConfiguration.columnStrategy && this.pivotConfiguration.columnStrategy instanceof NoopPivotDimensionsStrategy) {
            const fields = this.generateDataFields(sortedData);
            if (fields.length === 0) return;
            const rowFields = PivotUtil.flatten(this.pivotConfiguration.rows).map(x => x.memberName);
            const keyFields = Object.values(this.pivotKeys);
            const filteredFields = fields.filter(x => rowFields.indexOf(x) === -1 && keyFields.indexOf(x) === -1 &&
                x.indexOf(this.pivotKeys.rowDimensionSeparator + this.pivotKeys.level) === -1 &&
                x.indexOf(this.pivotKeys.rowDimensionSeparator + this.pivotKeys.records) === -1);
            fieldsMap = this.generateFromData(filteredFields);
        } else {
            fieldsMap = PivotUtil.getFieldsHierarchy(
                sortedData,
                this.columnDimensions,
                PivotDimensionType.Column,
                this.pivotKeys
            );
        }
        columns = this.generateColumnHierarchy(fieldsMap, sortedData);
        this._autoGeneratedCols = columns;
        // reset expansion states if any are stored.
        this.columnGroupStates.forEach((value, key) => {
            if (value) {
                const primaryColumn = columns.find(x => x.field === key && x.headerTemplate === this.headerTemplate);
                const groupSummaryColumn = columns.find(x => x.field === key && x.headerTemplate !== this.headerTemplate);
                this.toggleRowGroup(primaryColumn, value);
                if (groupSummaryColumn) {
                    groupSummaryColumn.headerTemplate = this.headerTemplate;
                }
            }
        });

        this.updateColumns(columns);
        this.reflow();
        if (data && data.length > 0) {
            this.shouldGenerate = false;
        }
    }

    protected getComponentDensityClass(baseStyleClass: string): string {
        if (this.superCompactMode) {
            return `${baseStyleClass}--${DisplayDensity.compact} igx-grid__pivot--super-compact`;
        }
        return super.getComponentDensityClass(baseStyleClass);
    }

    protected generateDimensionColumns(): IgxColumnComponent[] {
        const rootFields = this.allDimensions.map(x => x.memberName);
        const columns = [];
        const factory = this.resolver.resolveComponentFactory(IgxColumnComponent);
        rootFields.forEach((field) => {
            const ref = factory.create(this.viewRef.injector);
            ref.instance.field = field;
            ref.changeDetectorRef.detectChanges();
            columns.push(ref.instance);
        });
        return columns;
    }

    protected generateFromData(fields: string[]) {
        const separator = this.pivotKeys.columnDimensionSeparator;
        const dataArr = fields.map(x => x.split(separator)).sort(x => x.length);
        const hierarchy = new Map<string, any>();
        dataArr.forEach(arr => {
            let currentHierarchy = hierarchy;
            const path = [];
            for (const val of arr) {
                path.push(val);
                const newPath = path.join(separator);
                let targetHierarchy = currentHierarchy.get(newPath);
                if (!targetHierarchy) {
                    currentHierarchy.set(newPath, { value: newPath, expandable: true, children: new Map<string, any>(), dimension: this.columnDimensions[0] });
                    targetHierarchy = currentHierarchy.get(newPath);
                }
                currentHierarchy = targetHierarchy.children;
            }
        });
        return hierarchy;
    }

    protected generateColumnHierarchy(fields: Map<string, any>, data, parent = null): IgxColumnComponent[] {
        const factoryColumn = this.resolver.resolveComponentFactory(IgxColumnComponent);
        let columns = [];
        if (fields.size === 0) {
            this.values.forEach((value) => {
                const ref = factoryColumn.create(this.viewRef.injector);
                ref.instance.header = value.displayName;
                ref.instance.field = value.member;
                ref.instance.parent = parent;
                ref.instance.sortable = true;
                ref.instance.dataType = value.dataType || this.resolveDataTypes(data[0][value.member]);
                ref.instance.formatter = value.formatter;
                columns.push(ref.instance);
            });
            return columns;
        }
        let currentFields = fields;
        currentFields.forEach((value) => {
            let shouldGenerate = true;
            if (data.length === 0) {
                shouldGenerate = false;
            }
            if (shouldGenerate && (value.children == null || value.children.length === 0 || value.children.size === 0)) {
                const col = this.createColumnForDimension(value, data, parent, this.hasMultipleValues);
                columns.push(col);
                if (this.hasMultipleValues) {
                    const measureChildren = this.getMeasureChildren(factoryColumn, data, col, false, value.dimension.width);
                    col.children.reset(measureChildren);
                    columns = columns.concat(measureChildren);
                }

            } else if (shouldGenerate) {
                const col = this.createColumnForDimension(value, data, parent, true);
                if (value.expandable) {
                    col.headerTemplate = this.headerTemplate;
                }
                const children = this.generateColumnHierarchy(value.children, data, col);
                const filteredChildren = children.filter(x => x.level === col.level + 1);
                columns.push(col);
                if (this.hasMultipleValues) {
                    let measureChildren = this.getMeasureChildren(factoryColumn, data, col, true, value.dimension.width);
                    const nestedChildren = filteredChildren;
                    //const allChildren = children.concat(measureChildren);
                    col.children.reset(nestedChildren);
                    columns = columns.concat(children);
                    if (value.dimension.childLevel) {
                        const sibling = this.createColumnForDimension(value, data, parent, true);
                        columns.push(sibling);

                        measureChildren = this.getMeasureChildren(factoryColumn, data, sibling, false, value.dimension?.width);
                        sibling.children.reset(measureChildren);
                        columns = columns.concat(measureChildren);
                    }

                } else {
                    col.children.reset(filteredChildren);
                    columns = columns.concat(children);
                    if (value.dimension.childLevel) {
                        const sibling = this.createColumnForDimension(value, data, parent, false);
                        columns.push(sibling);
                    }
                }
            }
        });

        return columns;
    }

    protected createColumnForDimension(value: any, data: any, parent: ColumnType, isGroup: boolean) {
        const factoryColumn = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const factoryColumnGroup = this.resolver.resolveComponentFactory(IgxColumnGroupComponent);
        const key = value.value;
        const ref = isGroup ?
            factoryColumnGroup.create(this.viewRef.injector) :
            factoryColumn.create(this.viewRef.injector);
        ref.instance.header = parent != null ? key.split(parent.header + this.pivotKeys.columnDimensionSeparator)[1] : key;
        ref.instance.field = key;
        ref.instance.parent = parent;
        if (value.dimension.width) {
            ref.instance.width = value.dimension.width;
        }
        const valueDefinition = this.values[0];
        ref.instance.dataType = valueDefinition?.dataType || this.resolveDataTypes(data[0][valueDefinition?.member]);
        ref.instance.formatter = valueDefinition?.formatter;
        ref.instance.sortable = true;
        ref.changeDetectorRef.detectChanges();
        return ref.instance;
    }

    protected resolveColumnDimensionWidth(dim: IPivotDimension) {
        if (dim.width) {
            return dim.width;
        }
        return this.minColumnWidth + 'px';
    }

    protected getMeasureChildren(colFactory, data, parent, hidden, parentWidth) {
        const cols = [];
        const count = this.values.length;
        const childWidth = parseInt(parentWidth, 10) / count;
        const isPercent = parentWidth && parentWidth.indexOf('%') !== -1;
        this.values.forEach(val => {
            const ref = colFactory.create(this.viewRef.injector);
            ref.instance.header = val.displayName || val.member;
            ref.instance.field = parent.field + this.pivotKeys.columnDimensionSeparator + val.member;
            ref.instance.parent = parent;
            if (parentWidth) {
                ref.instance.width = isPercent ? childWidth + '%' : childWidth + 'px';
            }
            ref.instance.hidden = hidden;
            ref.instance.sortable = true;
            ref.instance.dataType = val.dataType || this.resolveDataTypes(data[0][val.member]);
            ref.instance.formatter = val.formatter;
            ref.changeDetectorRef.detectChanges();
            cols.push(ref.instance);
        });
        return cols;
    }

    /**
    * @hidden @internal
    */
    @ViewChild('emptyPivotGridTemplate', { read: TemplateRef, static: true })
    public defaultEmptyPivotGridTemplate: TemplateRef<any>;

    /**
     * Gets/Sets a custom template when pivot grid is empty.
     *
     * @example
     * ```html
     * <igx-pivot-grid [emptyPivotGridTemplate]="myTemplate"><igx-pivot-grid>
     * ```
     */
    @Input()
    public emptyPivotGridTemplate: TemplateRef<any>;

    /**
    * @hidden @internal
    */
    public get template(): TemplateRef<any> {
        const allEnabledDimensions = this.rowDimensions.concat(this.columnDimensions);
        if (allEnabledDimensions.length === 0 && this.values.length === 0) {
            // no enabled values and dimensions
            return this.emptyPivotGridTemplate || this.defaultEmptyPivotGridTemplate;
        }
        super.template;
    }

    private emitInitEvents(pivotConfig: IPivotConfiguration) {
        const dimensions = PivotUtil.flatten(this.allDimensions);
        dimensions.forEach(dim => {
            this.dimensionInit.emit(dim);
        });
        const values = pivotConfig?.values;
        values?.forEach(val => {
            this.valueInit.emit(val);
        });
    }
}
