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
    ApplicationRef
} from '@angular/core';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxGridSelectionService } from '../selection/selection.service';
import { IgxForOfSyncService, IgxForOfScrollSyncService } from '../../directives/for-of/for_of.sync.service';
import { ColumnType, GridType, IGX_GRID_BASE, RowType } from '../common/grid.interface';
import { IgxGridCRUDService } from '../common/crud.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { DEFAULT_PIVOT_KEYS, IDimensionsChange, IPivotConfiguration, IPivotDimension, IPivotValue, IValuesChange, PivotDimensionType } from './pivot-grid.interface';
import { IgxPivotHeaderRowComponent } from './pivot-header-row.component';
import { IgxColumnGroupComponent } from '../columns/column-group.component';
import { IgxColumnComponent } from '../columns/column.component';
import { PivotUtil } from './pivot-util';
import { GridPagingMode, GridSummaryCalculationMode, GridSummaryPosition } from '../common/enums';
import { WatchChanges } from '../watch-changes';
import { OverlaySettings } from '../../services/public_api';
import {
    IColumnMovingEndEventArgs, IColumnMovingEventArgs, IColumnMovingStartEventArgs,
    IColumnVisibilityChangedEventArgs, IGridEditDoneEventArgs, IGridEditEventArgs,
    IPinColumnCancellableEventArgs, IPinColumnEventArgs, IPinRowEventArgs, IRowDataEventArgs, IRowDragEndEventArgs, IRowDragStartEventArgs
} from '../common/events';
import { IgxGridRowComponent } from '../grid/grid-row.component';
import { DropPosition } from '../moving/moving.service';
import { DefaultPivotSortingStrategy, DimensionValuesFilteringStrategy, NoopPivotDimensionsStrategy } from '../../data-operations/pivot-strategy';
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

let NEXT_ID = 0;
const MINIMUM_COLUMN_WIDTH = 200;
const MINIMUM_COLUMN_WIDTH_SUPER_COMPACT = 104;
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-pivot-grid',
    templateUrl: 'pivot-grid.component.html',
    providers: [
        IgxGridCRUDService,
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
     * <igx-pivot-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true"
     *              (dimensionsChange)="dimensionsChange($event)"></igx-grid>
     * ```
     */
    @Output()
    public dimensionsChange = new EventEmitter<IDimensionsChange>();

    /**
     * Emitted when the values collection is changed via the grid chip area.
     *
     * @remarks
     * Returns the new dimension
     * @example
     * ```html
     * <igx-pivot-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true"
     *              (valuesChange)="valuesChange($event)"></igx-grid>
     * ```
    */
    @Output()
    public valuesChange = new EventEmitter<IValuesChange>();

    /** @hidden @internal */
    @ViewChild(IgxPivotHeaderRowComponent, { static: true })
    public theadRow: IgxPivotHeaderRowComponent;

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
    public superCompactMode = false;

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
    private _data;
    private _filteredData;
    private _pivotConfiguration: IPivotConfiguration = { rows: null, columns: null, values: null, filters: null };
    private p_id = `igx-pivot-grid-${NEXT_ID++}`;


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
    @Input()
    public get rowDraggable(): boolean {
        return;
    }


    public set rowDraggable(_val: boolean) {
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
        if (!this.selectionService.getSelectedRows()) {
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
        factoryResolver: ComponentFactoryResolver,
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
            factoryResolver,
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
        this.uniqueColumnValuesStrategy = this.uniqueColumnValuesStrategy || this.uniqueDimensionValuesStrategy;
        const config = this.pivotConfiguration;
        this.filteringExpressionsTree = PivotUtil.buildExpressionTree(config);
        super.ngOnInit();
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        // ignore any user defined columns and auto-generate based on pivot config.
        this.columnList.reset([]);
        Promise.resolve().then(() => {
            this.setupColumns();
        });
    }

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

    public uniqueDimensionValuesStrategy(column: IgxColumnComponent, exprTree: IFilteringExpressionsTree,
        done: (uniqueValues: any[]) => void) {
        const config = this.pivotConfiguration;
        const enabledDimensions = this.allDimensions.filter(x => x && x.enabled);
        const dim = PivotUtil.flatten(enabledDimensions).find(x => x.memberName === column.field);
        if (dim) {
            this.getDimensionData(dim, exprTree, uniqueValues => done(uniqueValues));
        }
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
        const config = this.pivotConfiguration;
        return (config.rows || []).concat((config.columns || [])).concat(config.filters || []).filter(x => x !== null && x !== undefined);
    }

    public getDimensionData(dim: IPivotDimension,
        dimExprTree: IFilteringExpressionsTree,
        done: (colVals: any[]) => void) {
        let columnValues = [];
        const data = this.gridAPI.get_data();
        const state = {
            expressionsTree: dimExprTree,
            strategy: this.filterStrategy || new DimensionValuesFilteringStrategy(),
            advancedFilteringExpressionsTree: this.advancedFilteringExpressionsTree
        };
        const filtered = DataUtil.filter(data, state, this);
        const allValuesHierarchy = PivotUtil.getFieldsHierarchy(
            filtered,
            [dim],
            PivotDimensionType.Column,
            this.pivotKeys
        );
        const flatData = Array.from(allValuesHierarchy.values());
        // Note: Once ESF supports tree view, we should revert this back.
        columnValues = flatData.map(record => record['value']);
        done(columnValues);
        return;
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
        if (this.shouldGenerate) {
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

    public get pivotRowWidths() {
        return this.rowDimensions.length ? this.rowDimensions.reduce((accumulator, dim) => accumulator + this.rowDimensionWidthToPixels(dim), 0) :
            this.rowDimensionWidthToPixels(this.emptyRowDimension);
    }

    public rowDimensionWidthToPixels(dim: IPivotDimension): number {
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

    public reverseDimensionWidthToPercent(width: number): number {
        return (width * 100 / this.calcWidth);
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
    public get totalHeight() {
        return this.calcHeight;
    }

    public getColumnGroupExpandState(col: IgxColumnComponent) {
        const state = this.columnGroupStates.get(col.field);
        // columns are expanded by default?
        return state !== undefined && state !== null ? state : false;
    }

    public toggleRowGroup(col: IgxColumnComponent, newState: boolean) {
        if (this.hasMultipleValues) {
            const parentCols = col.parent ? col.parent.children.toArray() : this.columns.filter(x => x.level === 0);
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
            const parentCols = col.parent ? col.parent.children : this.columns.filter(x => x.level === 0);
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

    /*
     * @hidden
     * @internal
     * Expose setup columns so it can used in pivot-header-row.component
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
        this.removeDimension(dimension);
        // add to target
        this.insertDimensionAt(dimension, targetCollectionType, index);
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
        if (prevCollectionType === null) return;
        const prevCollection = this.getDimensionsByType(prevCollectionType);
        const currentIndex = prevCollection.indexOf(dimension);
        prevCollection.splice(currentIndex, 1);
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

    protected getDimensionType(dimension: IPivotDimension): PivotDimensionType {
        return PivotUtil.flatten(this.pivotConfiguration.rows).indexOf(dimension) !== -1 ? PivotDimensionType.Row :
            PivotUtil.flatten(this.pivotConfiguration.columns).indexOf(dimension) !== -1 ? PivotDimensionType.Column :
                PivotUtil.flatten(this.pivotConfiguration.filters).indexOf(dimension) !== -1 ? PivotDimensionType.Filter : null;
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

    protected resolveToggle(groupColumn: IgxColumnComponent, state: boolean) {
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
        super.verticalScrollHandler(event);
        this.verticalRowDimScrollContainers.forEach(x => {
            x.onScroll(event);
            x.cdr.detectChanges();
        });
    }

    /**
     * @hidden
     */
    protected autogenerateColumns() {
        let columns = [];
        this.filterStrategy = this.filterStrategy ?? new DimensionValuesFilteringStrategy();
        const data = this.gridAPI.filterDataByExpressions(this.filteringExpressionsTree);
        this.dimensionDataColumns = this.generateDimensionColumns();
        let fieldsMap;
        if (this.pivotConfiguration.columnStrategy && this.pivotConfiguration.columnStrategy instanceof NoopPivotDimensionsStrategy) {
            const fields = this.generateDataFields(data);
            const rowFields = PivotUtil.flatten(this.pivotConfiguration.rows).map(x => x.memberName);
            const keyFields = Object.values(this.pivotKeys);
            const filteredFields = fields.filter(x => rowFields.indexOf(x) === -1 && keyFields.indexOf(x) === -1 &&
                x.indexOf(this.pivotKeys.rowDimensionSeparator + this.pivotKeys.level) === -1 &&
                x.indexOf(this.pivotKeys.rowDimensionSeparator + this.pivotKeys.records) === -1);
            fieldsMap = this.generateFromData(filteredFields);
        } else {
            fieldsMap = PivotUtil.getFieldsHierarchy(
                data,
                this.columnDimensions,
                PivotDimensionType.Column,
                this.pivotKeys
            );
        }
        columns = this.generateColumnHierarchy(fieldsMap, data);
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
        this.reflow();
        this._autoGeneratedCols = columns;

        this.columnList.reset(columns);
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
        const leafFields = PivotUtil.flatten(this.allDimensions, 0).filter(x => !x.childLevel).map(x => x.memberName);
        const columns = [];
        const factory = this.resolver.resolveComponentFactory(IgxColumnComponent);
        leafFields.forEach((field) => {
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
        const factoryColumnGroup = this.resolver.resolveComponentFactory(IgxColumnGroupComponent);
        let columns = [];
        if (fields.size === 0) {
            this.values.forEach((value) => {
                const ref = factoryColumn.create(this.viewRef.injector);
                ref.instance.header = value.displayName;
                ref.instance.field = value.member;
                ref.instance.parent = parent;
                ref.instance.width = MINIMUM_COLUMN_WIDTH + 'px';
                ref.instance.sortable = true;
                ref.instance.dataType = value.dataType || this.resolveDataTypes(data[0]);
                ref.instance.formatter = value.formatter;
                columns.push(ref.instance);
            });
            return columns;
        }
        const first = fields.keys().next().value;
        const dim: IPivotDimension = fields.get(first).dimension;
        let currentFields = fields;
        if (dim && dim.sortDirection) {
            const entries = Array.from(fields.entries());
            const expressions = [{
                dir: dim.sortDirection,
                fieldName: dim.memberName,
                strategy: DefaultPivotSortingStrategy.instance()
            }];
            const sorted = DataUtil.sort(cloneArray(entries, true), expressions, this.sortStrategy, this.gridAPI.grid);
            currentFields = new Map(sorted);
        }
        currentFields.forEach((value, key) => {
            let shouldGenerate = true;
            if (value.dimension && value.dimension.filter) {
                const state = {
                    expressionsTree: value.dimension.filter.filteringOperands[0],
                    strategy: this.filterStrategy || new DimensionValuesFilteringStrategy(),
                    advancedFilteringExpressionsTree: this.advancedFilteringExpressionsTree
                };
                const filtered = DataUtil.filter(cloneArray(value.records), state, this);
                if (filtered.length === 0) {
                    shouldGenerate = false;
                }
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
        ref.instance.width = this.resolveColumnDimensionWidth(value.dimension);
        ref.instance.dataType = this.pivotConfiguration.values[0]?.dataType || this.resolveDataTypes(data[0][key]);
        ref.instance.formatter = this.pivotConfiguration.values[0]?.formatter;
        ref.instance.sortable = true;
        ref.changeDetectorRef.detectChanges();
        return ref.instance;
    }

    protected resolveColumnDimensionWidth(dim: IPivotDimension) {
        if (dim.width) {
            return dim.width;
        }
        return this.superCompactMode ? MINIMUM_COLUMN_WIDTH_SUPER_COMPACT + 'px' : MINIMUM_COLUMN_WIDTH + 'px';
    }

    protected getMeasureChildren(colFactory, data, parent, hidden, parentWidth) {
        const cols = [];
        const count = this.values.length;
        const width = parentWidth ? parseInt(parentWidth, 10) / count :
            this.superCompactMode ? MINIMUM_COLUMN_WIDTH_SUPER_COMPACT : MINIMUM_COLUMN_WIDTH;
        const isPercent = parentWidth && parentWidth.indexOf('%') !== -1;
        this.values.forEach(val => {
            const ref = colFactory.create(this.viewRef.injector);
            ref.instance.header = val.displayName || val.member;
            ref.instance.field = parent.field + this.pivotKeys.columnDimensionSeparator + val.member;
            ref.instance.parent = parent;
            ref.instance.width = isPercent ? width + '%' : width + 'px';
            ref.instance.hidden = hidden;
            ref.instance.sortable = true;
            ref.instance.dataType = val.dataType || this.resolveDataTypes(data[0][val.member]);
            ref.instance.formatter = val.formatter;
            ref.changeDetectorRef.detectChanges();
            cols.push(ref.instance);
        });
        return cols;
    }

    public getPropName(dim: IPivotDimension) {
        return !!dim ?? dim.memberName + this.pivotKeys.rowDimensionSeparator + 'height';
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
}
