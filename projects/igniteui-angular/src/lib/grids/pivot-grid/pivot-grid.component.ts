import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
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
    ContentChild,
    createComponent,
    EnvironmentInjector,
    CUSTOM_ELEMENTS_SCHEMA,
    booleanAttribute,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { DOCUMENT, NgTemplateOutlet, NgIf, NgClass, NgStyle, NgFor } from '@angular/common';

import { first, take, takeUntil} from 'rxjs/operators';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxGridSelectionService } from '../selection/selection.service';
import { IgxForOfSyncService, IgxForOfScrollSyncService } from '../../directives/for-of/for_of.sync.service';
import { ColumnType, GridType, IGX_GRID_BASE, IgxColumnTemplateContext, RowType } from '../common/grid.interface';
import { IgxGridCRUDService } from '../common/crud.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { DEFAULT_PIVOT_KEYS, IDimensionsChange, IgxPivotGridValueTemplateContext, IPivotConfiguration, IPivotConfigurationChangedEventArgs, IPivotDimension, IPivotValue, IValuesChange, PivotDimensionType, IPivotUISettings, PivotRowLayoutType, PivotSummaryPosition } from './pivot-grid.interface';
import { IgxPivotHeaderRowComponent } from './pivot-header-row.component';
import { IgxColumnGroupComponent } from '../columns/column-group.component';
import { IgxColumnComponent } from '../columns/column.component';
import { PivotUtil } from './pivot-util';
import { FilterMode, GridPagingMode, GridSummaryCalculationMode, GridSummaryPosition, Size } from '../common/enums';
import { WatchChanges } from '../watch-changes';
import { OverlaySettings } from '../../services/public_api';
import {
    IGridEditEventArgs,
    ICellPosition,
    IColumnMovingEndEventArgs, IColumnMovingEventArgs, IColumnMovingStartEventArgs,
    IColumnVisibilityChangedEventArgs,
    IGridEditDoneEventArgs,
    IGridToolbarExportEventArgs,
    IPinColumnCancellableEventArgs,
    IPinColumnEventArgs,
    IPinRowEventArgs,
    IRowDataCancelableEventArgs,
    IRowDataEventArgs,
    IRowDragEndEventArgs,
    IRowDragStartEventArgs
} from '../common/events';
import { IgxGridRowComponent } from '../grid/grid-row.component';
import { DropPosition } from '../moving/moving.service';
import { DimensionValuesFilteringStrategy, NoopPivotDimensionsStrategy } from '../../data-operations/pivot-strategy';
import { IgxGridExcelStyleFilteringComponent, IgxExcelStyleColumnOperationsTemplateDirective, IgxExcelStyleFilterOperationsTemplateDirective } from '../filtering/excel-style/excel-style-filtering.component';
import { IgxPivotGridNavigationService } from './pivot-grid-navigation.service';
import { IgxPivotColumnResizingService } from '../resizing/pivot-grid/pivot-resizing.service';
import { IgxFlatTransactionFactory, IgxOverlayService, State, Transaction, TransactionService } from '../../services/public_api';
import { cloneArray, PlatformUtil, resizeObservable } from '../../core/utils';
import { IgxPivotFilteringService } from './pivot-filtering.service';
import { DataUtil } from '../../data-operations/data-util';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IgxGridTransaction } from '../common/types';
import { GridBaseAPIService } from '../api.service';
import { IForOfDataChangingEventArgs, IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { IgxPivotRowDimensionContentComponent } from './pivot-row-dimension-content.component';
import { IgxPivotGridColumnResizerComponent } from '../resizing/pivot-grid/pivot-resizer.component';
import { ISortingExpression, SortingDirection } from '../../data-operations/sorting-strategy';
import { PivotSortUtil } from './pivot-sort-util';
import { IFilteringStrategy } from '../../data-operations/filtering-strategy';
import { IgxPivotRowDimensionHeaderTemplateDirective, IgxPivotValueChipTemplateDirective } from './pivot-grid.directives';
import { IFilteringOperation } from '../../data-operations/filtering-condition';
import { IgxGridValidationService } from '../grid/grid-validation.service';
import { IgxPivotRowPipe, IgxPivotRowExpansionPipe, IgxPivotAutoTransform, IgxPivotColumnPipe, IgxPivotGridFilterPipe, IgxPivotGridSortingPipe, IgxPivotGridColumnSortingPipe, IgxPivotCellMergingPipe, IgxPivotGridHorizontalRowGrouping } from './pivot-grid.pipes';
import { IgxGridRowClassesPipe, IgxGridRowStylesPipe } from '../common/pipes';
import { IgxExcelStyleSearchComponent } from '../filtering/excel-style/excel-style-search.component';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxSnackbarComponent } from '../../snackbar/snackbar.component';
import { IgxCircularProgressBarComponent } from '../../progressbar/progressbar.component';
import { IgxToggleDirective, IgxOverlayOutletDirective } from '../../directives/toggle/toggle.directive';
import { IgxPivotRowComponent } from './pivot-row.component';
import { IgxTemplateOutletDirective } from '../../directives/template-outlet/template_outlet.directive';
import { IgxColumnMovingDropDirective } from '../moving/moving.drop.directive';
import { IgxGridDragSelectDirective } from '../selection/drag-select.directive';
import { IgxGridBodyDirective } from '../grid.common';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { DefaultDataCloneStrategy, IDataCloneStrategy } from '../../data-operations/data-clone-strategy';
import { IgxTextHighlightService } from '../../directives/text-highlight/text-highlight.service';
import { IgxPivotRowHeaderGroupComponent } from './pivot-row-header-group.component';
import { IgxPivotDateDimension } from './pivot-grid-dimensions';
import { IgxPivotRowDimensionMrlRowComponent } from './pivot-row-dimension-mrl-row.component';

let NEXT_ID = 0;
const MINIMUM_COLUMN_WIDTH = 200;
const MINIMUM_COLUMN_WIDTH_SUPER_COMPACT = 104;

/* blazorAdditionalDependency: Column */
/* blazorAdditionalDependency: ColumnGroup */
/* blazorAdditionalDependency: ColumnLayout */
/* blazorAdditionalDependency: GridToolbar */
/* blazorAdditionalDependency: GridToolbarActions */
/* blazorAdditionalDependency: GridToolbarTitle */
/* blazorAdditionalDependency: GridToolbarAdvancedFiltering */
/* blazorAdditionalDependency: GridToolbarExporter */
/* blazorAdditionalDependency: GridToolbarHiding */
/* blazorAdditionalDependency: GridToolbarPinning */
/* blazorAdditionalDependency: ActionStrip */
/* blazorAdditionalDependency: GridActionsBaseDirective */
/* blazorAdditionalDependency: GridEditingActions */
/* blazorAdditionalDependency: GridPinningActions */
/* blazorAdditionalDependency: PivotDateDimension */
/* blazorIndirectRender */
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
        IgxColumnResizingService,
        GridBaseAPIService,
        { provide: IGX_GRID_BASE, useExisting: IgxPivotGridComponent },
        { provide: IgxFilteringService, useClass: IgxPivotFilteringService },
        IgxPivotGridNavigationService,
        IgxPivotColumnResizingService,
        IgxForOfSyncService,
        IgxForOfScrollSyncService
    ],
    imports: [
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        NgTemplateOutlet,
        IgxPivotHeaderRowComponent,
        IgxGridBodyDirective,
        IgxGridDragSelectDirective,
        IgxColumnMovingDropDirective,
        IgxGridForOfDirective,
        IgxTemplateOutletDirective,
        IgxPivotRowComponent,
        IgxToggleDirective,
        IgxCircularProgressBarComponent,
        IgxSnackbarComponent,
        IgxOverlayOutletDirective,
        IgxPivotGridColumnResizerComponent,
        IgxIconComponent,
        IgxPivotRowDimensionContentComponent,
        IgxGridExcelStyleFilteringComponent,
        IgxExcelStyleColumnOperationsTemplateDirective,
        IgxExcelStyleFilterOperationsTemplateDirective,
        IgxExcelStyleSearchComponent,
        IgxGridRowClassesPipe,
        IgxGridRowStylesPipe,
        IgxPivotRowPipe,
        IgxPivotRowExpansionPipe,
        IgxPivotAutoTransform,
        IgxPivotColumnPipe,
        IgxPivotGridFilterPipe,
        IgxPivotGridSortingPipe,
        IgxPivotGridColumnSortingPipe,
        IgxPivotCellMergingPipe,
        IgxPivotGridHorizontalRowGrouping,
        IgxPivotRowDimensionMrlRowComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgxPivotGridComponent extends IgxGridBaseDirective implements OnInit, AfterContentInit,
    GridType, AfterViewInit, OnChanges {

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
     * Emitted when any of the pivotConfiguration properties is changed via the grid chip area.
     *
     * @example
     * ```html
     * <igx-pivot-grid #grid [data]="localData" [height]="'305px'"
     *              (pivotConfigurationChanged)="configurationChanged($event)"></igx-grid>
     * ```
     */
    @Output()
    public pivotConfigurationChange = new EventEmitter<IPivotConfigurationChangedEventArgs>();


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
    public override theadRow: IgxPivotHeaderRowComponent;

    /**
    * @hidden @internal
    */
    @ContentChild(IgxPivotValueChipTemplateDirective, { read: IgxPivotValueChipTemplateDirective })
    protected valueChipTemplateDirective: IgxPivotValueChipTemplateDirective;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxPivotRowDimensionHeaderTemplateDirective, { read: IgxPivotRowDimensionHeaderTemplateDirective })
    protected rowDimensionHeaderDirective: IgxPivotRowDimensionHeaderTemplateDirective;

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
    public rowDimensionHeaderTemplate: TemplateRef<IgxColumnTemplateContext>;

    /* mustSetInCodePlatforms: WebComponents;Blazor;React */
    /* @tsTwoWayProperty (true, "PivotConfigurationChange", "Detail.PivotConfiguration", false) */
    /**
     * Gets/Sets the pivot configuration with all related dimensions and values.
     *
     * @example
     * ```html
     * <igx-pivot-grid [pivotConfiguration]="config"></igx-pivot-grid>
     * ```
     */
    @Input()
    public set pivotConfiguration(value: IPivotConfiguration) {
        this._pivotConfiguration = value;
        this.emitInitEvents(this._pivotConfiguration);
        this.filteringExpressionsTree = PivotUtil.buildExpressionTree(value);
        if (!this._init) {
            this.setupColumns();
        }
        this.notifyChanges(true);
    }

    /* mustSetInCodePlatforms: WebComponents;Blazor */
    public get pivotConfiguration() {
        return this._pivotConfiguration || { rows: null, columns: null, values: null, filters: null };
    }

    /**
     * Gets/Sets whether to auto-generate the pivot configuration based on the provided data.
     *
     * @remarks
     * The default value is false. When set to true, it will override all dimensions and values in the pivotConfiguration.
     * @example
     * ```html
     * <igx-pivot-grid [data]="Data" [autoGenerateConfig]="true"></igx-pivot-grid>
     * ```
     */
    @Input({ transform: booleanAttribute })
    public autoGenerateConfig = false;

    @Input()
    /**
     * Gets/Sets the pivot ui settings for the pivot grid - chips and their
     * corresponding containers for row, filter, column dimensions and values
     * as well as headers for the row dimensions values.
     * @example
     * ```html
     * <igx-pivot-grid [pivotUI]="{ showRowHeaders: true }"></igx-pivot-grid>
     * ```
     */
    public set pivotUI(value: IPivotUISettings) {
        this._pivotUI = Object.assign(this._pivotUI, value || {});
        this.pipeTrigger++;
        this.notifyChanges(true);
    }

    public get pivotUI() {
        return this._pivotUI;
    }

    /**
     * @hidden @internal
     */
    @HostBinding('attr.role')
    public role = 'grid';


    /**
     * Enables a super compact theme for the component.
     * @remarks
     * Overrides the grid size option if one is set.
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
        this._superCompactMode = value;
    }

    /** @hidden @internal */
    public override get gridSize() {
        if (this.superCompactMode) {
            return Size.Small;
        }
        return super.gridSize;
    }


    /**
     * Gets/Sets the values clone strategy of the pivot grid when assigning them to different dimensions.
     *
     * @example
     * ```html
     *  <igx-pivot-grid #grid [data]="localData" [pivotValueCloneStrategy]="customCloneStrategy"></igx-pivot-grid>
     * ```
     * @hidden @internal
     */
    @Input()
    public get pivotValueCloneStrategy(): IDataCloneStrategy {
        return this._pivotValueCloneStrategy;
    }

    public set pivotValueCloneStrategy(strategy: IDataCloneStrategy) {
        if (strategy) {
            this._pivotValueCloneStrategy = strategy;
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
    @ViewChildren('rowDimensionContainer', { read: ElementRef })
    public rowDimensionContainer: QueryList<ElementRef<any>>;

    /**
     * @hidden @internal
     */
    @ViewChild(IgxPivotGridColumnResizerComponent)
    public override resizeLine: IgxPivotGridColumnResizerComponent;

    /**
     * @hidden @internal
     */
    @ViewChildren(IgxGridExcelStyleFilteringComponent, { read: IgxGridExcelStyleFilteringComponent })
    public override excelStyleFilteringComponents: QueryList<IgxGridExcelStyleFilteringComponent>;

    /**
     * @hidden @internal
     */
    @ViewChildren(IgxPivotRowDimensionContentComponent)
    protected rowDimensionContentCollection: QueryList<IgxPivotRowDimensionContentComponent>;

    /**
     * @hidden @internal
     */
    public override get minColumnWidth() {
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
    public verticalRowDimScrollContainers: QueryList<IgxGridForOfDirective<any, any[]>>;

    /**
     * @hidden @internal
     */
    @ViewChildren(IgxPivotRowDimensionMrlRowComponent)
    public rowDimensionMrlRowsCollection: QueryList<IgxPivotRowDimensionMrlRowComponent>;

    /**
     * @hidden @internal
     */
    @Input()
    public override addRowEmptyTemplate: TemplateRef<void>;

    /**
     * @hidden @internal
     */
    @Input()
    public override autoGenerateExclude: string[] = [];

    /**
     * @hidden @internal
     */
    @Input()
    public override snackbarDisplayTime = 6000;

    /**
     * @hidden @internal
     */
    @Output()
    public override cellEdit = new EventEmitter<IGridEditEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override cellEditDone = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override cellEditEnter = new EventEmitter<IGridEditEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override cellEditExit = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override columnMovingStart = new EventEmitter<IColumnMovingStartEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override columnMoving = new EventEmitter<IColumnMovingEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override columnMovingEnd = new EventEmitter<IColumnMovingEndEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override columnPin = new EventEmitter<IPinColumnCancellableEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override columnPinned = new EventEmitter<IPinColumnEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowAdd = new EventEmitter<IRowDataCancelableEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowAdded = new EventEmitter<IRowDataEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowDeleted = new EventEmitter<IRowDataEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowDelete = new EventEmitter<IRowDataCancelableEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowDragStart = new EventEmitter<IRowDragStartEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowDragEnd = new EventEmitter<IRowDragEndEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowEditEnter = new EventEmitter<IGridEditEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowEdit = new EventEmitter<IGridEditEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowEditDone = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowEditExit = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowPinning = new EventEmitter<IPinRowEventArgs>();

    /**
     * @hidden @internal
     */
    @Output()
    public override rowPinned = new EventEmitter<IPinRowEventArgs>();

    /** @hidden @internal */
    public columnGroupStates = new Map<string, boolean>();
    /** @hidden @internal */
    public dimensionDataColumns: any[];
    /** @hidden @internal */
    public get pivotKeys() {
        return this.pivotConfiguration.pivotKeys || DEFAULT_PIVOT_KEYS;
    }
    /** @hidden @internal */
    public override get type(): GridType["type"] {
        return 'pivot';
    }

    /**
     * @hidden @internal
     */
    public override dragRowID = null;

    /**
    * @hidden @internal
    */
    public override get rootSummariesEnabled(): boolean {
        return false;
    }

    /**
     * @hidden @internal
     */
    public rowDimensionResizing = true;

    private _emptyRowDimension: IPivotDimension = { memberName: '', enabled: true, level: 0 };
    /**
     * @hidden @internal
     */
    public get emptyRowDimension(): IPivotDimension {
        return this._emptyRowDimension;
    }

    protected _pivotValueCloneStrategy: IDataCloneStrategy = new DefaultDataCloneStrategy();
    protected override _defaultExpandState = false;
    protected override _filterStrategy: IFilteringStrategy = new DimensionValuesFilteringStrategy();
    protected regroupTrigger = 0;
    private _data;
    private _pivotConfiguration: IPivotConfiguration = { rows: null, columns: null, values: null, filters: null };
    private p_id = `igx-pivot-grid-${NEXT_ID++}`;
    private _superCompactMode = false;
    private _pivotUI: IPivotUISettings = {
        showConfiguration: true,
        showRowHeaders: false,
        rowLayout: PivotRowLayoutType.Vertical,
        horizontalSummariesPosition: PivotSummaryPosition.Bottom
    };
    private _sortableColumns = true;
    private _visibleRowDimensions: IPivotDimension[] = [];
    private _shouldUpdateSizes = false;

    /**
    * Gets/Sets the default expand state for all rows.
    */
    @Input({ transform: booleanAttribute })
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
    public override get pagingMode() {
        return;
    }

    public override set pagingMode(_val: GridPagingMode) {
    }

    /**
     * @hidden @internal
     */
    @WatchChanges()
    @Input({ transform: booleanAttribute })
    public override get hideRowSelectors() {
        return;
    }

    public override set hideRowSelectors(_value: boolean) {
    }

    /**
     * @hidden @internal
     */
    public override autoGenerate = true;

    /**
     * @hidden @internal
     */
    public override get actionStrip() {
        return undefined as any;
    }

    /**
     * @hidden @internal
     * @deprecated in version 18.2.0. This property is no longer supported.
     */
    public override get shouldGenerate(): boolean {
        return false;
    }

    public override set shouldGenerate(value: boolean) {
    }

    /**
     * @hidden @internal
     */
    public override moving = false;

    /**
     * @hidden @internal
     */
    public override toolbarExporting = new EventEmitter<IGridToolbarExportEventArgs>();

    /**
     * @hidden @internal
     */
    @Input({ transform: booleanAttribute })
    public override get rowDraggable(): boolean {
        return;
    }


    public override set rowDraggable(_val: boolean) {
    }

    /**
     * @hidden @internal
     */
    @Input({ transform: booleanAttribute })
    public override get allowAdvancedFiltering() {
        return false;
    }

    public override set allowAdvancedFiltering(_value) {
    }

    /**
     * @hidden @internal
     */
    @Input()
    public override get filterMode() {
        return FilterMode.quickFilter;
    }

    public override set filterMode(_value: FilterMode) {
    }

    /**
     * @hidden @internal
     */
    @Input({ transform: booleanAttribute })
    public override get allowFiltering() {
        return false;
    }

    public override set allowFiltering(_value) {
    }

    /**
     * @hidden @internal
     */
    @Input()
    public override get page(): number {
        return 0;
    }

    public override set page(_val: number) {
    }

    /**
     * @hidden @internal
     */
    @Input()
    public override get perPage(): number {
        return;
    }

    public override set perPage(_val: number) {
    }

    /**
     * @hidden @internal
     */
    public override get pinnedColumns(): IgxColumnComponent[] {
        return [];
    }

    /**
    * @hidden @internal
    */
    public override get unpinnedColumns(): IgxColumnComponent[] {
        return super.unpinnedColumns;
    }

    /**
    * @hidden @internal
    */
    public override get unpinnedDataView(): any[] {
        return super.unpinnedDataView;
    }

    /**
    * @hidden @internal
    */
    public override get unpinnedWidth() {
        return super.unpinnedWidth;
    }

    /**
     * @hidden @internal
     */
    public override get pinnedWidth() {
        return super.pinnedWidth;
    }

    /**
     * @hidden @internal
     */
    @Input()
    public override set summaryRowHeight(_value: number) {
    }

    public override get summaryRowHeight(): number {
        return 0;
    }

    /**
     * @hidden @internal
     */
    public override get transactions(): TransactionService<Transaction, State> {
        return this._transactions;
    }



    /**
     * @hidden @internal
     */
    public override get dragIndicatorIconTemplate(): TemplateRef<any> {
        return;
    }

    public override set dragIndicatorIconTemplate(_val: TemplateRef<any>) {
    }

    /**
     * @hidden @internal
     */
    @WatchChanges()
    @Input({ transform: booleanAttribute })
    public override get rowEditable(): boolean {
        return;
    }

    public override set rowEditable(_val: boolean) {
    }

    /**
     * @hidden @internal
     */
    @Input()
    public override get pinning() {
        return {};
    }
    public override set pinning(_value) {
    }

    /**
     * @hidden @internal
     */
    @Input()
    public override get summaryPosition() {
        return;
    }

    public override set summaryPosition(_value: GridSummaryPosition) {
    }

    /**
     * @hidden @interal
     */
    @Input()
    public override get summaryCalculationMode() {
        return;
    }

    public override set summaryCalculationMode(_value: GridSummaryCalculationMode) {
    }

    /**
     * @hidden @interal
     */
    @Input({ transform: booleanAttribute })
    public override get showSummaryOnCollapse() {
        return;
    }

    public override set showSummaryOnCollapse(_value: boolean) {
    }

    /**
     * @hidden @internal
     */
    public override get hiddenColumnsCount() {
        return null;
    }

    /**
     * @hidden @internal
     */
    public override get pinnedColumnsCount() {
        return null;
    }

    /**
     * @hidden @internal
     */
    @Input({ transform: booleanAttribute })
    public override get batchEditing(): boolean {
        return;
    }

    public override set batchEditing(_val: boolean) {
    }

    /* csSuppress */
    public override get selectedRows(): any[] {
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

    constructor(
        validationService: IgxGridValidationService,
        selectionService: IgxGridSelectionService,
        colResizingService: IgxPivotColumnResizingService,
        gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        transactionFactory: IgxFlatTransactionFactory,
        elementRef: ElementRef<HTMLElement>,
        zone: NgZone,
        @Inject(DOCUMENT) document,
        cdr: ChangeDetectorRef,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        injector: Injector,
        envInjector: EnvironmentInjector,
        navigation: IgxPivotGridNavigationService,
        filteringService: IgxFilteringService,
        textHighlightService: IgxTextHighlightService,
        @Inject(IgxOverlayService) overlayService: IgxOverlayService,
        summaryService: IgxGridSummaryService,
        @Inject(LOCALE_ID) localeId: string,
        platform: PlatformUtil,
        @Optional() @Inject(IgxGridTransaction) _diTransactions?: TransactionService<Transaction, State>
    ) {
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
            differs,
            viewRef,
            injector,
            envInjector,
            navigation,
            filteringService,
            textHighlightService,
            overlayService,
            summaryService,
            localeId,
            platform,
            _diTransactions);
    }

    public override navigation: IgxPivotGridNavigationService;

    /**
     * @hidden
     */
    public override ngOnInit() {
        // pivot grid always generates columns automatically.
        this.autoGenerate = true;
        super.ngOnInit();
    }

    /**
     * @hidden
     */
    public override ngAfterContentInit() {
        // ignore any user defined columns and auto-generate based on pivot config.
        this.updateColumns([]);
        Promise.resolve().then(() => {
            if (this.autoGenerateConfig) {
                this.generateConfig();
            }
            this.setupColumns();
        });
        if (this.valueChipTemplateDirective) {
            this.valueChipTemplate = this.valueChipTemplateDirective.template;
        }
        if (this.rowDimensionHeaderDirective) {
            this.rowDimensionHeaderTemplate = this.rowDimensionHeaderDirective.template;
        }
    }

    /**
     * @hidden @internal
     */
    public override ngAfterViewInit() {
        Promise.resolve().then(() => {
            super.ngAfterViewInit();
        });
    }

    /**
     * @hidden @internal
     */
    public ngOnChanges(changes: SimpleChanges) {
        if (changes.superCompactMode && !changes.superCompactMode.isFirstChange()) {
            this._shouldUpdateSizes = true;
            resizeObservable(this.verticalScrollContainer.displayContainer).pipe(take(1), takeUntil(this.destroy$)).subscribe(() => this.resizeNotify.next());
        }
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

    protected get allVisibleDimensions() {
        const config = this._pivotConfiguration;
        if (!config) return [];
        const uniqueVisibleRowDims = this.visibleRowDimensions.filter(dim => !config.rows.find(configRow => configRow.memberName === dim.memberName));
        const rows = (config.rows || []).concat(...uniqueVisibleRowDims);
        return rows.concat((config.columns || [])).concat(config.filters || []).filter(x => x !== null && x !== undefined);
    }

    protected override get shouldResize(): boolean {
        if (!this.dataRowList.first?.cells || this.dataRowList.first.cells.length === 0) {
            return false;
        }
        const isSizePropChanged = super.shouldResize;
        if (isSizePropChanged || this._shouldUpdateSizes) {
            this._shouldUpdateSizes = false;
            return true;
        }
        return false;
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
    public override featureColumnsWidth() {
        return this.pivotRowWidths || 0;
    }

    /* blazorSuppress */
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
    /* blazorSuppress */
    public set id(value: string) {
        this.p_id = value;
    }

    /* treatAsRef */
    /* blazorAlternateType: object */
    /**
     * Gets/Sets the array of data that populates the component.
     * ```html
     * <igx-pivot-grid [data]="Data"></igx-pivot-grid>
     * ```
     */
    @Input()
    public set data(value: any[] | null) {
        this._data = value || [];
        if (!this._init) {
            if (this.autoGenerateConfig) {
                this.generateConfig();
            }
            this.setupColumns();
            this.reflow();
        }
        this.cdr.markForCheck();
        if (this.height === null || this.height.indexOf('%') !== -1) {
            // If the height will change based on how much data there is, recalculate sizes in igxForOf.
            this.notifyChanges(true);
        }
    }

    /* treatAsRef */
    /* blazorAlternateType: object */
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
        return this.visibleRowDimensions.length ? this.visibleRowDimensions.reduce((accumulator, dim) => accumulator + this.rowDimensionWidthToPixels(dim), 0) :
            this.rowDimensionWidthToPixels(this.emptyRowDimension);
    }

    /**
     * @hidden @internal
     */
    public rowDimensionWidth(dim): string {
        const isAuto = dim.width && dim.width.indexOf('auto') !== -1;
        if (isAuto) {
            return dim.autoWidth ? dim.autoWidth + 'px' : 'fit-content';
        } else {
            return this.rowDimensionWidthToPixels(dim) + 'px';
        }
    }

    /**
     * @hidden @internal
     */
    public rowDimensionWidthToPixels(dim: IPivotDimension): number {
        if (!dim?.width) {
            return MINIMUM_COLUMN_WIDTH;
        }
        const isPercent = dim.width && dim.width.indexOf('%') !== -1;
        const isAuto = dim.width && dim.width.indexOf('auto') !== -1;
        if (isPercent) {
            return Math.round(parseFloat(dim.width) / 100 * this.calcWidth);
        } else if (isAuto) {
            return dim.autoWidth;
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

    /** @hidden @internal */
    public get pivotContentCalcWidth() {
        const totalDimWidth = this.rowDimensions.length > 0 ?
            this.rowDimensions.map((dim) => this.rowDimensionWidthToPixels(dim)).reduce((prev, cur) => prev + cur) :
            0;
        return this.calcWidth - totalDimWidth;
    }

    /** @hidden @internal */
    public get pivotPinnedWidth() {
        return !this._init ? (this.isPinningToStart ? this.pinnedWidth : this.headerFeaturesWidth) : 0;
    }

    /** @hidden @internal */
    public get pivotUnpinnedWidth() {
        return this.unpinnedWidth || 0;
    }

    /** @hidden @internal */
    public get rowDimensions() {
        return this.pivotConfiguration.rows?.filter(x => x.enabled) || [];
    }

    /** @hidden @internal */
    public set visibleRowDimensions(value: IPivotDimension[]) {
        this._visibleRowDimensions = value;
    }

    public get visibleRowDimensions() {
        return this._visibleRowDimensions || this.rowDimensions;
    }

    /** @hidden @internal */
    public get columnDimensions() {
        return this.pivotConfiguration.columns?.filter(x => x.enabled) || [];
    }

    /** @hidden @internal */
    public get filterDimensions() {
        return this.pivotConfiguration.filters?.filter(x => x.enabled) || [];
    }

    /** @hidden @internal */
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
    public override isRecordPinnedByIndex(_rowIndex: number) {
        return null;
    }

    /**
     * @hidden @internal
     */
    public override toggleColumnVisibility(_args: IColumnVisibilityChangedEventArgs) {
        return;
    }

    /**
     * @hidden @internal
     */
    public override expandAll() {
    }

    /**
     * @hidden @internal
     */
    public override collapseAll() {
    }

    /**
     * @hidden @internal
     */
    public override expandRow(_rowID: any) {
    }

    /**
     * @hidden @internal
     */
    public override collapseRow(_rowID: any) {
    }

    /**
     * @hidden @internal
     */
    public override get pinnedRows(): IgxGridRowComponent[] {
        return;
    }

    /**
     * @hidden @internal
     */
    @Input()
    public override get totalRecords(): number {
        return;
    }

    public override set totalRecords(_total: number) {
    }

    /**
     * @hidden @internal
     */
    public override moveColumn(_column: IgxColumnComponent, _target: IgxColumnComponent, _pos: DropPosition = DropPosition.AfterDropTarget) {
    }

    /**
     * @hidden @internal
     */
    public override addRow(_data: any): void {
    }

    /**
     * @hidden @internal
     */
    public override deleteRow(_rowSelector: any): any {
    }

    /**
     * @hidden @internal
     */
    public override updateCell(_value: any, _rowSelector: any, _column: string): void {
    }

    /**
     * @hidden @internal
     */
    public override updateRow(_value: any, _rowSelector: any): void {
    }

    /**
     * @hidden @internal
     */
    public override enableSummaries(..._rest) {
    }

    /**
     * @hidden @internal
     */
    public override disableSummaries(..._rest) {
    }

    /**
     * @hidden @internal
     */
    public override pinColumn(_columnName: string | IgxColumnComponent, _index?): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public override unpinColumn(_columnName: string | IgxColumnComponent, _index?): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public override pinRow(_rowID: any, _index?: number, _row?: RowType): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public override unpinRow(_rowID: any, _row?: RowType): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public override get pinnedRowHeight() {
        return;
    }

    /**
     * @hidden @internal
     */
    public override get hasEditableColumns(): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public override get hasSummarizedColumns(): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public override get hasMovableColumns(): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public override get pinnedDataView(): any[] {
        return [];
    }

    /**
     * @hidden @internal
     */
    public override openAdvancedFilteringDialog(_overlaySettings?: OverlaySettings) {
    }

    /**
     * @hidden @internal
     */
    public override closeAdvancedFilteringDialog(_applyChanges: boolean) {
    }

    /**
     * @hidden @internal
     */
    public override endEdit(_commit = true, _event?: Event): boolean {
        return;
    }

    /**
     * @hidden @internal
     */
    public override beginAddRowById(_rowID: any, _asChild?: boolean): void {
    }

    /**
     * @hidden @internal
     */
    public override beginAddRowByIndex(_index: number): void {
    }

    /**
     * @hidden @internal
     */
    public override clearSearch() { }

    /**
    * @hidden @internal
    */
    public override refreshSearch(_updateActiveInfo?: boolean, _endEdit = true): number {
        return 0;
    }

    /**
    * @hidden @internal
    */
    public override findNext(_text: string, _caseSensitive?: boolean, _exactMatch?: boolean): number {
        return 0;
    }

    /**
    * @hidden @internal
    */
    public override findPrev(_text: string, _caseSensitive?: boolean, _exactMatch?: boolean): number {
        return 0;
    }

    /**
    * @hidden @internal
    */
    public override getNextCell(currRowIndex: number, curVisibleColIndex: number,
        callback: (IgxColumnComponent) => boolean = null): ICellPosition {
        return super.getNextCell(currRowIndex, curVisibleColIndex, callback);
    }

    /**
    * @hidden @internal
    */
    public override getPreviousCell(currRowIndex: number, curVisibleColIndex: number,
        callback: (IgxColumnComponent) => boolean = null): ICellPosition {
        return super.getPreviousCell(currRowIndex, curVisibleColIndex, callback);
    }

    /**
    * @hidden @internal
    */
    public override getPinnedWidth(takeHidden = false) {
        return super.getPinnedWidth(takeHidden);
    }

    /**
     * @hidden @internal
     */
    public override get totalHeight() {
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
    public override setupColumns() {
        super.setupColumns();
    }

    /**
    * @hidden @internal
    */
    public override dataRebinding(event: IForOfDataChangingEventArgs) {
        if (this.hasHorizontalLayout) {
            this.dimensionDataColumns = this.generateDimensionColumns();
        }

        super.dataRebinding(event);
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
            const relatedDims: string[] = PivotUtil.flatten([dimension]).map((x: IPivotDimension) => x.memberName);
            const contentCollection =  this.getContentCollection(dimension);
            const content = contentCollection.filter(x => relatedDims.indexOf(x.dimension.memberName) !== -1);
            const headers = content.map(x => x.headerGroups.toArray()).flat().map(x => x.header && x.header.refInstance);
            if (this.pivotUI.showRowHeaders) {
                const dimensionHeader = this.theadRow.rowDimensionHeaders.find(x => x.column.field === dimension.memberName);
                headers.push(dimensionHeader);
            }
            const autoWidth = this.getLargesContentWidth(headers);
            if (dimension.width === "auto") {
                dimension.autoWidth = parseFloat(autoWidth);
            } else {
                dimension.width = autoWidth;
            }
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
        this.pivotConfigurationChange.emit({ pivotConfiguration: this.pivotConfiguration });
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
        this.pivotConfigurationChange.emit({ pivotConfiguration: this.pivotConfiguration });
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
        this.pivotConfigurationChange.emit({ pivotConfiguration: this.pivotConfiguration });
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
            this.pivotConfigurationChange.emit({ pivotConfiguration: this.pivotConfiguration });
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
        this.pivotConfigurationChange.emit({ pivotConfiguration: this.pivotConfiguration });
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
        if (this.pivotUI.rowLayout === PivotRowLayoutType.Vertical) {
            while (dim.childLevel) {
                dim.childLevel.sortDirection = dimension.sortDirection;
                dim = dim.childLevel;
            }
        }

        this.pipeTrigger++;
        this.dimensionsSortingExpressionsChange.emit(this.dimensionsSortingExpressions);
        if (dimensionType === PivotDimensionType.Column) {
            this.setupColumns();
        }
        this.cdr.detectChanges();
        this.pivotConfigurationChange.emit({ pivotConfiguration: this.pivotConfiguration });
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
    public filterDimension(dimension: IPivotDimension, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree) {
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
    public getRowDimensionByName(memberName: string) {
        const visibleRows = this.pivotUI.rowLayout === PivotRowLayoutType.Vertical ?
         this.pivotConfiguration.rows :
         PivotUtil.flatten(this.pivotConfiguration.rows);
        const dimIndex = visibleRows.findIndex((target) => target.memberName === memberName);
        const dim = visibleRows[dimIndex];
        return dim;
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

    protected getPivotRowHeaderContentWidth(headerGroup: IgxPivotRowHeaderGroupComponent) {
        const headerSizes = this.getHeaderCellWidth(headerGroup.header.refInstance.nativeElement);
        return headerSizes.width + headerSizes.padding;
    }

    protected getLargesContentWidth(contents: ElementRef[]): string {
        const largest = new Map<number, number>();
        if (contents.length > 0) {
            const cellsContentWidths = [];
            contents.forEach((elem) => {
                elem instanceof IgxPivotRowHeaderGroupComponent ?
                    cellsContentWidths.push(this.getPivotRowHeaderContentWidth(elem)) :
                    cellsContentWidths.push(this.getHeaderCellWidth(elem.nativeElement).width);
            });
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

    /** @hidden @internal */
    public get hasHorizontalLayout() {
        return this.pivotUI.rowLayout === PivotRowLayoutType.Horizontal;
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
        // max 10 rows, row size depends on grid size
        const maxHeight = this.renderedRowHeight * 10;
        return `${maxHeight}px`;
    }

    /**
    * @hidden
    */
    public get excelStyleFilterMinHeight(): string {
        // min 5 rows, row size depends on grid size
        const minHeight = this.renderedRowHeight * 5;
        return `${minHeight}px`;
    }

    /** @hidden @internal */
    public override get activeDescendant() {
        const activeElem = this.navigation.activeNode;
        if ((this.navigation as IgxPivotGridNavigationService).isRowHeaderActive ||
            (this.navigation as IgxPivotGridNavigationService).isRowDimensionHeaderActive) {
            if (!activeElem || !Object.keys(activeElem).length) {
                return this.id;
            }

            return `${this.id}_${activeElem.row}_${activeElem.column}`;
        }

        return super.activeDescendant;
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

    protected override buildDataView(data: any[]) {
        this._dataView = data;
    }

    /**
     * @hidden @internal
     */
    protected override getDataBasedBodyHeight(): number {
        const dvl = this.dataView?.length || 0;
        return dvl < this._defaultTargetRecordNumber ? 0 : this.defaultTargetBodyHeight;
    }

    protected override horizontalScrollHandler(event) {
        const scrollLeft = event.target.scrollLeft;
        this.theadRow.headerContainers.forEach(headerForOf => {
            headerForOf.onHScroll(scrollLeft);
        });
        super.horizontalScrollHandler(event);
    }

    protected override verticalScrollHandler(event) {
        this.verticalRowDimScrollContainers.forEach(x => {
            x.onScroll(event);
        });
        super.verticalScrollHandler(event);
    }

    /**
     * @hidden
     */
    protected override autogenerateColumns() {
        let columns = [];
        const data = this.gridAPI.filterDataByExpressions(this.filteringExpressionsTree);
        this.dimensionDataColumns = this.generateDimensionColumns();
        const flattenedColumnsWithSorting = PivotUtil.flatten(this.columnDimensions).filter(dim => dim.sortDirection);
        const expressions = flattenedColumnsWithSorting.length > 0 ? PivotSortUtil.generateDimensionSortingExpressions(flattenedColumnsWithSorting) : [];
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
                this.pivotKeys,
                this.pivotValueCloneStrategy
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
        this.pipeTrigger++;
        this.reflow();
    }

    protected generateDimensionColumns(): IgxColumnComponent[] {
        const columns = [];
        this.allVisibleDimensions.forEach((dim) => {
            const ref = createComponent(IgxColumnComponent, { environmentInjector: this.envInjector, elementInjector: this.injector });
            ref.instance.field = dim.memberName;
            ref.instance.header = dim.displayName || dim.memberName;
            ref.instance.headerTemplate = this.rowDimensionHeaderTemplate;
            ref.instance.resizable = this.rowDimensionResizing;
            ref.instance.sortable = dim.sortable === undefined ? true : dim.sortable;
            ref.instance.width = this.rowDimensionWidth(dim);
            ref.changeDetectorRef.detectChanges();
            columns.push(ref.instance);
        });
        return columns;
    }

    protected override calculateGridSizes(recalcFeatureWidth = true) {
        super.calculateGridSizes(recalcFeatureWidth);
        if (this.hasDimensionsToAutosize) {
            this.cdr.detectChanges();
            this.zone.onStable.pipe(first()).subscribe(() => {
                requestAnimationFrame(() => {
                    this.autoSizeDimensionsInView();
                });
            });
        }
    }

    protected getContentCollection(dimenstion: IPivotDimension) {
        let contentCollection;
        if (this.hasHorizontalLayout) {
            const allMrlContents = this.rowDimensionMrlRowsCollection.map(mrlRow => mrlRow.contentCells.toArray()).flat();
            contentCollection = allMrlContents.filter(cell => cell.rootDimension === dimenstion);
        } else {
            contentCollection = this.rowDimensionContentCollection.toArray();
        }
        return contentCollection;
    }

    protected autoSizeDimensionsInView() {
        if (!this.hasDimensionsToAutosize) return;
        for (const dim of this.visibleRowDimensions) {
            if (dim.width === 'auto') {
                const contentWidths = [];
                const relatedDims = PivotUtil.flatten([dim]).map(x => x.memberName);
                const contentCollection = this.getContentCollection(dim);
                const content = contentCollection.filter(x => relatedDims.indexOf(x.dimension.memberName) !== -1);
                const headers = content.map(x => x.headerGroups.toArray()).flat().map(x => x.header && x.header.refInstance);
                headers.forEach((header) => contentWidths.push(header?.nativeElement?.offsetWidth || 0));
                if (this.pivotUI.showRowHeaders) {
                    const dimensionHeader = this.theadRow.rowDimensionHeaders.find(x => x.column.field === dim.memberName);
                    contentWidths.push(parseFloat(this.getLargesContentWidth([dimensionHeader])));
                }
                const max = Math.max(...contentWidths);
                if (max === 0) {
                    // cells not in DOM yet...
                    continue;
                }
                const maxSize = Math.ceil(Math.max(...contentWidths));
                dim.autoWidth = maxSize;
            }
        }

        if (this.isColumnWidthSum) {
            this.calcWidth = this.getColumnWidthSum();
        }
    }

    /** @hidden @internal */
    public get hasDimensionsToAutosize() {
        return this.rowDimensions.some(x => x.width === 'auto' && !x.autoWidth);
    }

    protected generateFromData(fields: string[]) {
        const separator = this.pivotKeys.columnDimensionSeparator;
        const dataArr = fields.map(x => x.split(separator)).sort(x => x.length);
        const hierarchy = new Map<string, any>();
        const columnDimensions =  PivotUtil.flatten(this.columnDimensions);
        dataArr.forEach(arr => {
            let currentHierarchy = hierarchy;
            const path = [];
            let index = 0;
            for (const val of arr) {
                path.push(val);
                const newPath = path.join(separator);
                let targetHierarchy = currentHierarchy.get(newPath);
                if (!targetHierarchy) {
                    const currentColumnDimension = columnDimensions[index];
                    currentHierarchy.set(newPath, { value: newPath, expandable: !!currentColumnDimension.childLevel, children: new Map<string, any>(), dimension: currentColumnDimension });
                    targetHierarchy = currentHierarchy.get(newPath);
                }
                currentHierarchy = targetHierarchy.children;
                index++;
            }
        });
        return hierarchy;
    }

    protected generateColumnHierarchy(fields: Map<string, any>, data, parent = null): IgxColumnComponent[] {
        let columns = [];
        if (fields.size === 0) {
            this.values.forEach((value) => {
                const ref = createComponent(IgxColumnComponent, { environmentInjector: this.envInjector, elementInjector: this.injector });
                ref.instance.header = value.displayName;
                ref.instance.field = value.member;
                ref.instance.parent = parent;
                ref.instance.sortable = true;
                ref.instance.dataType = value.dataType || this.resolveDataTypes(data.length ? data[0][value.member] : null);
                ref.instance.formatter = value.formatter;
                columns.push(ref.instance);
            });
            return columns;
        }
        const currentFields = fields;
        currentFields.forEach((value) => {
            let shouldGenerate = true;
            if (data.length === 0) {
                shouldGenerate = false;
            }
            if (shouldGenerate && (value.children == null || value.children.length === 0 || value.children.size === 0)) {
                const col = this.createColumnForDimension(value, data, parent, this.hasMultipleValues);
                columns.push(col);
                if (this.hasMultipleValues) {
                    const measureChildren = this.getMeasureChildren(data, col, false, value.dimension.width);
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
                    let measureChildren = this.getMeasureChildren(data, col, true, value.dimension.width);
                    const nestedChildren = filteredChildren;
                    //const allChildren = children.concat(measureChildren);
                    col.children.reset(nestedChildren);
                    columns = columns.concat(children);
                    if (value.dimension.childLevel) {
                        const sibling = this.createColumnForDimension(value, data, parent, true);
                        columns.push(sibling);

                        measureChildren = this.getMeasureChildren(data, sibling, false, value.dimension?.width);
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


    protected generateConfig() {
        if (!this.data) return;

        const data = this.data;
        const fields = this.generateDataFields(data);
        const columnDimensions: IPivotDimension[] = [];
        const rowDimensions: IPivotDimension[] = [];
        const values: IPivotValue[] = [];
        let isFirstDate = true;
        fields.forEach((field) => {
            const dataType = this.resolveDataTypes(data[0][field]);
            switch (dataType) {
                case "number":
                    {
                        const value: IPivotValue = {
                            member: field,
                            displayName: field,
                            dataType: dataType,
                            aggregate: {
                                key: 'sum',
                                label: 'Sum',
                                aggregatorName: "SUM"
                            },
                            enabled: true
                        };
                        values.push(value);
                        break;
                }
            case "date":
            {
                const dimension: IPivotDimension = new IgxPivotDateDimension(
                    {
                        memberName: field,
                        enabled: isFirstDate,
                        dataType: dataType
                    }
                )
                rowDimensions.push(dimension);
                isFirstDate = false;
                break;
            }
                default: {
                    const dimension: IPivotDimension = {
                        memberName: field,
                        enabled: false,
                        dataType: dataType
                    };
                    columnDimensions.push(dimension);
                    break;
                }
            }
        });
        const config: IPivotConfiguration = {
            columns: columnDimensions,
            rows: rowDimensions,
            values: values
        };
        this.pivotConfiguration = config;
    }

    protected createColumnForDimension(value: any, data: any, parent: ColumnType, isGroup: boolean) {
        const key = value.value;
        const ref = isGroup ?
            createComponent(IgxColumnGroupComponent, { environmentInjector: this.envInjector, elementInjector: this.injector }) :
            createComponent(IgxColumnComponent, { environmentInjector: this.envInjector, elementInjector: this.injector });
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

    protected getMeasureChildren(data, parent, hidden, parentWidth) {
        const cols = [];
        const count = this.values.length;
        const childWidth = parseInt(parentWidth, 10) / count;
        const isPercent = parentWidth && parentWidth.indexOf('%') !== -1;
        const isAuto = parentWidth && parentWidth.indexOf('auto') !== -1;
        this.values.forEach(val => {
            const ref = createComponent(IgxColumnComponent, { environmentInjector: this.envInjector, elementInjector: this.injector });
            ref.instance.header = val.displayName || val.member;
            ref.instance.field = parent.field + this.pivotKeys.columnDimensionSeparator + val.member;
            ref.instance.parent = parent;
            if (parentWidth) {
                ref.instance.width = isAuto ? 'auto' : isPercent ? childWidth + '%' : childWidth + 'px';
            }
            ref.instance.hidden = hidden;
            ref.instance.sortable = this._sortableColumns;
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
    public emptyPivotGridTemplate: TemplateRef<void>;

    /**
    * @hidden @internal
    */
    public override get template(): TemplateRef<any> {
        const allEnabledDimensions = this.rowDimensions.concat(this.columnDimensions);
        if (allEnabledDimensions.length === 0 && this.values.length === 0) {
            // no enabled values and dimensions
            return this.emptyPivotGridTemplate || this.defaultEmptyPivotGridTemplate;
        }
        return super.template;
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

    protected rowDimensionByName(memberName: string) {
        return this.visibleRowDimensions.find((rowDim) => rowDim.memberName === memberName);
    }

    protected calculateResizerTop() {
        return this.pivotUI.showRowHeaders ?
            (this.theadRow.pivotFilterContainer?.nativeElement.offsetHeight || 0) + (this.theadRow.pivotRowContainer?.nativeElement.offsetHeight || 0) :
            this.theadRow.nativeElement.offsetHeight;
    }

    protected override updateDefaultRowHeight() {
        super.updateDefaultRowHeight();
        if (this.hasHorizontalLayout) {
            // Trigger pipes to recalc heights for the horizontal layout mrl rows.
            this.regroupTrigger++;
        }
    }
}
