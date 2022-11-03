import { DOCUMENT, formatNumber, getLocaleNumberFormat, NumberFormatStyle } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    ApplicationRef,
    ChangeDetectorRef,
    ComponentFactory,
    ComponentFactoryResolver,
    ComponentRef,
    ContentChild,
    ContentChildren,
    Directive,
    DoCheck,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Inject,
    Injector,
    Input,
    IterableChangeRecord,
    IterableDiffers,
    LOCALE_ID,
    NgModuleRef,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from '@angular/core';
import { formatDate, resizeObservable } from '../core/utils';
import 'igniteui-trial-watermark';
import { Subject, pipe, fromEvent, animationFrameScheduler, merge } from 'rxjs';
import { takeUntil, first, filter, throttleTime, map, shareReplay, takeWhile } from 'rxjs/operators';
import { cloneArray, mergeObjects, compareMaps, resolveNestedPath, isObject, PlatformUtil } from '../core/utils';
import { GridColumnDataType } from '../data-operations/data-util';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { IForOfDataChangingEventArgs, IgxGridForOfDirective } from '../directives/for-of/for_of.directive';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { ISummaryExpression } from './summaries/grid-summary';
import { RowEditPositionStrategy, IPinningConfig } from './grid.common';
import { IgxGridToolbarComponent } from './toolbar/grid-toolbar.component';
import { IgxRowDirective } from './row.directive';
import { IgxOverlayOutletDirective, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import {
    FilteringExpressionsTree, IFilteringExpressionsTree, FilteringExpressionsTreeType
} from '../data-operations/filtering-expressions-tree';
import { IFilteringOperation } from '../data-operations/filtering-condition';
import { Transaction, TransactionType, TransactionService, State } from '../services/public_api';
import {
    IgxRowAddTextDirective,
    IgxRowEditTemplateDirective,
    IgxRowEditTabStopDirective,
    IgxRowEditTextDirective,
    IgxRowEditActionsDirective
} from './grid.rowEdit.directive';
import { IgxGridNavigationService, IActiveNode } from './grid-navigation.service';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase, DisplayDensity } from '../core/displayDensity';
import { IgxFilteringService } from './filtering/grid-filtering.service';
import { IgxGridFilteringCellComponent } from './filtering/base/grid-filtering-cell.component';
import { WatchChanges } from './watch-changes';
import { IgxGridHeaderGroupComponent } from './headers/grid-header-group.component';
import { IGridResourceStrings } from '../core/i18n/grid-resources';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IgxGridSummaryService } from './summaries/grid-summary.service';
import { IgxSummaryRowComponent } from './summaries/summary-row.component';
import { IgxGridSelectionService } from './selection/selection.service';
import { IgxEditRow, IgxCell, IgxAddRow } from './common/crud.service';
import { ICachedViewLoadedEventArgs, IgxTemplateOutletDirective } from '../directives/template-outlet/template_outlet.directive';
import { IgxExcelStyleLoadingValuesTemplateDirective } from './filtering/excel-style/excel-style-search.component';
import { IgxGridColumnResizerComponent } from './resizing/resizer.component';
import { CharSeparatedValueData } from '../services/csv/char-separated-value-data';
import { IgxColumnResizingService } from './resizing/resizing.service';
import { FilteringStrategy, IFilteringStrategy } from '../data-operations/filtering-strategy';
import {
    IgxRowExpandedIndicatorDirective, IgxRowCollapsedIndicatorDirective, IgxHeaderExpandIndicatorDirective,
    IgxHeaderCollapseIndicatorDirective, IgxExcelStyleHeaderIconDirective, IgxSortAscendingHeaderIconDirective,
    IgxSortDescendingHeaderIconDirective, IgxSortHeaderIconDirective
} from './grid/grid.directives';
import {
    GridKeydownTargetType,
    GridSelectionMode,
    GridSummaryPosition,
    GridSummaryCalculationMode,
    FilterMode,
    ColumnPinningPosition,
    RowPinningPosition,
    GridPagingMode,
    GridValidationTrigger
} from './common/enums';
import {
    IGridCellEventArgs,
    IRowSelectionEventArgs,
    IPinColumnEventArgs,
    IGridEditEventArgs,
    IRowDataEventArgs,
    IColumnResizeEventArgs,
    IColumnMovingStartEventArgs,
    IColumnMovingEventArgs,
    IColumnMovingEndEventArgs,
    IGridKeydownEventArgs,
    IRowDragStartEventArgs,
    IRowDragEndEventArgs,
    IGridClipboardEvent,
    IGridToolbarExportEventArgs,
    ISearchInfo,
    ICellPosition,
    IRowToggleEventArgs,
    IColumnSelectionEventArgs,
    IPinRowEventArgs,
    IGridScrollEventArgs,
    IGridEditDoneEventArgs,
    IActiveNodeChangeEventArgs,
    ISortingEventArgs,
    IFilteringEventArgs,
    IColumnVisibilityChangedEventArgs,
    IColumnVisibilityChangingEventArgs,
    IPinColumnCancellableEventArgs
} from './common/events';
import { IgxAdvancedFilteringDialogComponent } from './filtering/advanced-filtering/advanced-filtering-dialog.component';
import {
    ColumnType,
    GridServiceType,
    GridType,
    IgxColumn,
    IGridFormGroupCreatedEventArgs,
    IGridValidationStatusEventArgs,
    IgxGridEmptyTemplateContext,
    IgxGridHeaderTemplateContext,
    IgxGridRowDragGhostContext,
    IgxGridRowEditActionsTemplateContext,
    IgxGridRowEditTemplateContext,
    IgxGridRowEditTextTemplateContext,
    IgxGridRowTemplateContext,
    IgxGridTemplateContext,
    IgxHeadSelectorTemplateContext,
    IgxRowSelectorTemplateContext,
    IGX_GRID_SERVICE_BASE,
    ISizeInfo,
    RowType
} from './common/grid.interface';
import { DropPosition } from './moving/moving.service';
import { IgxHeadSelectorDirective, IgxRowSelectorDirective } from './selection/row-selectors';
import { IgxColumnComponent } from './columns/column.component';
import { IgxColumnGroupComponent } from './columns/column-group.component';
import { IgxRowDragGhostDirective, IgxDragIndicatorIconDirective } from './row-drag.directive';
import { IgxSnackbarComponent } from '../snackbar/snackbar.component';
import { v4 as uuidv4 } from 'uuid';
import { IgxActionStripComponent } from '../action-strip/action-strip.component';
import { IgxGridRowComponent } from './grid/grid-row.component';
import { IPageEventArgs } from '../paginator/paginator-interfaces';
import { IgxPaginatorComponent } from '../paginator/paginator.component';
import { IgxGridHeaderRowComponent } from './headers/grid-header-row.component';
import { IgxGridGroupByAreaComponent } from './grouping/grid-group-by-area.component';
import { IgxFlatTransactionFactory, TRANSACTION_TYPE } from '../services/transaction/transaction-factory.service';
import { ISortingOptions } from './columns/interfaces';
import { GridSelectionRange, IgxGridTransaction } from './common/types';
import { VerticalAlignment, HorizontalAlignment, PositionSettings, OverlaySettings } from '../services/overlay/utilities';
import { IgxOverlayService } from '../services/overlay/overlay';
import { ConnectedPositioningStrategy } from '../services/overlay/position/connected-positioning-strategy';
import { ContainerPositionStrategy } from '../services/overlay/position/container-position-strategy';
import { AbsoluteScrollStrategy } from '../services/overlay/scroll/absolute-scroll-strategy';
import { Action, StateUpdateEvent, TransactionEventOrigin } from '../services/transaction/transaction';
import { ISortingExpression } from '../data-operations/sorting-strategy';
import { IGridSortingStrategy } from './common/strategy';
import { IgxGridExcelStyleFilteringComponent } from './filtering/excel-style/grid.excel-style-filtering.component';
import { IgxGridHeaderComponent } from './headers/grid-header.component';
import { IgxGridFilteringRowComponent } from './filtering/base/grid-filtering-row.component';
import { DefaultDataCloneStrategy, IDataCloneStrategy } from '../data-operations/data-clone-strategy';
import { IgxGridCellComponent } from './cell.component';
import { IgxGridValidationService } from './grid/grid-validation.service';

let FAKE_ROW_ID = -1;
const DEFAULT_ITEMS_PER_PAGE = 15;
const MINIMUM_COLUMN_WIDTH = 136;
const FILTER_ROW_HEIGHT = 50;
// By default row editing overlay outlet is inside grid body so that overlay is hidden below grid header when scrolling.
// In cases when grid has 1-2 rows there isn't enough space in grid body and row editing overlay should be shown above header.
// Default row editing overlay height is higher then row height that is why the case is valid also for row with 2 rows.
// More accurate calculation is not possible, cause row editing overlay is still not shown and we don't know its height,
// but in the same time we need to set row editing overlay outlet before opening the overlay itself.
const MIN_ROW_EDITING_COUNT_THRESHOLD = 2;

@Directive()
export abstract class IgxGridBaseDirective extends DisplayDensityBase implements GridType,
    OnInit, DoCheck, OnDestroy, AfterContentInit, AfterViewInit {

    /**
     * Gets/Sets the display time for the row adding snackbar notification.
     *
     * @remarks
     * By default it is 6000ms.
     */
    @Input()
    public snackbarDisplayTime = 6000;

    /**
     * Gets/Sets whether to auto-generate the columns.
     *
     * @remarks
     * The default value is false. When set to true, it will override all columns declared through code or in markup.
     * @example
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public autoGenerate = false;

    /**
     * Controls whether columns moving is enabled in the grid.
     *
     */
    @Input()
    public moving = false;

    /**
     * Gets/Sets a custom template when empty.
     *
     * @example
     * ```html
     * <igx-grid [id]="'igx-grid-1'" [data]="Data" [emptyGridTemplate]="myTemplate" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public emptyGridTemplate: TemplateRef<void>;

    /**
     * Gets/Sets a custom template for adding row UI when grid is empty.
     *
     * @example
     * ```html
     * <igx-grid [id]="'igx-grid-1'" [data]="Data" [addRowEmptyTemplate]="myTemplate" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public addRowEmptyTemplate: TemplateRef<void>;

    /**
     * Gets/Sets a custom template when loading.
     *
     * @example
     * ```html
     * <igx-grid [id]="'igx-grid-1'" [data]="Data" [loadingGridTemplate]="myTemplate" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public loadingGridTemplate: TemplateRef<void>;

    /**
     * Get/Set IgxSummaryRow height
     */
    @Input()
    public set summaryRowHeight(value: number) {
        this._summaryRowHeight = value | 0;
        this.summaryService.summaryHeight = value;
        if (!this._init) {
            this.reflow();
        }
    }

    public get summaryRowHeight(): number {
        if (this.hasSummarizedColumns && this.rootSummariesEnabled) {
            return this._summaryRowHeight || this.summaryService.calcMaxSummaryHeight();
        }
        return 0;
    }

    public get hasColumnsToAutosize() {
        return this._columns.some(x => x.width === 'fit-content');
    }

    /**
     * Gets/Sets the data clone strategy of the grid when in edit mode.
     *
     * @example
     * ```html
     *  <igx-grid #grid [data]="localData" [dataCloneStrategy]="customCloneStrategy"></igx-grid>
     * ```
     */
    @Input()
    public get dataCloneStrategy(): IDataCloneStrategy {
        return this._dataCloneStrategy;
    }

    public set dataCloneStrategy(strategy: IDataCloneStrategy) {
        if (strategy) {
            this._dataCloneStrategy = strategy;
            this._transactions.cloneStrategy = strategy;
        }
    }

    /**
     * Controls the copy behavior of the grid.
     */
    @Input()
    public clipboardOptions = {
        /**
         * Enables/disables the copy behavior
         */
        enabled: true,
        /**
         * Include the columns headers in the clipboard output.
         */
        copyHeaders: true,
        /**
         * Apply the columns formatters (if any) on the data in the clipboard output.
         */
        copyFormatters: true,
        /**
         * The separator used for formatting the copy output. Defaults to `\t`.
         */
        separator: '\t'
    };

    /**
     * Emitted after filtering is performed.
     *
     * @remarks
     * Returns the filtering expressions tree of the column for which filtering was performed.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true"
     *              (filteringExpressionsTreeChange)="filteringExprTreeChange($event)"></igx-grid>
     * ```
     */
    @Output()
    public filteringExpressionsTreeChange = new EventEmitter<IFilteringExpressionsTree>();

    /**
     * Emitted after advanced filtering is performed.
     *
     * @remarks
     * Returns the advanced filtering expressions tree.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true"
     *           (advancedFilteringExpressionsTreeChange)="advancedFilteringExprTreeChange($event)"></igx-grid>
     * ```
     */
    @Output()
    public advancedFilteringExpressionsTreeChange = new EventEmitter<IFilteringExpressionsTree>();

    /**
     * Emitted when grid is scrolled horizontally/vertically.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true"
     *              (gridScroll)="onScroll($event)"></igx-grid>
     * ```
     */
    @Output()
    public gridScroll = new EventEmitter<IGridScrollEventArgs>();

    /**
     * @deprecated in version 12.1.0. Use the corresponding output exposed by the `igx-paginator` component instead
     *
     * Emitted after the current page is changed.
     *
     *
     * @example
     * ```html
     * <igx-grid (pageChange)="onPageChange($event)"></igx-grid>
     * ```
     * ```typescript
     * public onPageChange(page: number) {
     *   this.currentPage = page;
     * }
     * ```
     */
    @Output()
    public pageChange = new EventEmitter<number>();

    /**
     * @deprecated in version 12.1.0. Use the corresponding output exposed by the `igx-paginator` component instead
     *
     * Emitted when `perPage` property value of the grid is changed.
     *
     *
     * @example
     * ```html
     * <igx-grid #grid (perPageChange)="onPerPageChange($event)" [autoGenerate]="true"></igx-grid>
     * ```
     * ```typescript
     * public onPerPageChange(perPage: number) {
     *   this.perPage = perPage;
     * }
     * ```
     */
    @Output()
    public perPageChange = new EventEmitter<number>();

    /**
     * @hidden
     * @internal
     */
    @Input()
    public class = '';

    /**
     * @deprecated in version 12.2.0. We suggest using `rowClasses` property instead
     *
     * Gets/Sets the styling classes applied to all even `IgxGridRowComponent`s in the grid.
     *
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [evenRowCSS]="'igx-grid--my-even-class'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public evenRowCSS = 'igx-grid__tr--even';

    /**
     * @deprecated in version 12.2.0. We suggest using `rowClasses` property instead
     *
     * Gets/Sets the styling classes applied to all odd `IgxGridRowComponent`s in the grid.
     *
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [evenRowCSS]="'igx-grid--my-odd-class'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public oddRowCSS = 'igx-grid__tr--odd';

    /**
     * Sets a conditional class selector to the grid's row element.
     * Accepts an object literal, containing key-value pairs,
     * where the key is the name of the CSS class and the value is
     * either a callback function that returns a boolean, or boolean, like so:
     * ```typescript
     * callback = (row: RowType) => { return row.selected > 6; }
     * rowClasses = { 'className' : this.callback };
     * ```
     * ```html
     * <igx-grid #grid [data]="Data" [rowClasses] = "rowClasses" [autoGenerate]="true"></igx-grid>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public rowClasses: any;

    /**
     * Sets conditional style properties on the grid row element.
     * It accepts an object literal where the keys are
     * the style properties and the value is an expression to be evaluated.
     * ```typescript
     * styles = {
     *  background: 'yellow',
     *  color: (row: RowType) => row.selected : 'red': 'white'
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="Data" [rowStyles]="styles" [autoGenerate]="true"></igx-grid>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public rowStyles = null;

    /**
     * Gets/Sets the primary key.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [primaryKey]="'ProductID'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public primaryKey: any;

    /**
     * Gets/Sets a unique values strategy used by the Excel Style Filtering
     *
     * @remarks
     * Provides a callback for loading unique column values on demand.
     * If this property is provided, the unique values it generates will be used by the Excel Style Filtering.
     * @example
     * ```html
     * <igx-grid [data]="localData" [filterMode]="'excelStyleFilter'" [uniqueColumnValuesStrategy]="columnValuesStrategy"></igx-grid>
     * ```
     */
    @Input()
    public uniqueColumnValuesStrategy: (column: ColumnType,
        filteringExpressionsTree: IFilteringExpressionsTree,
        done: (values: any[]) => void) => void;

    /** @hidden @internal */
    @ContentChildren(IgxGridExcelStyleFilteringComponent, { read: IgxGridExcelStyleFilteringComponent, descendants: false })
    public excelStyleFilteringComponents: QueryList<IgxGridExcelStyleFilteringComponent>;

    /** @hidden @internal */
    public get excelStyleFilteringComponent() {
        return this.excelStyleFilteringComponents?.first;
    }

    public get headerGroups() {
        return this.theadRow.groups;
    }

    /**
     * Emitted when a cell is clicked.
     *
     * @remarks
     * Returns the `IgxGridCell`.
     * @example
     * ```html
     * <igx-grid #grid (cellClick)="cellClick($event)" [data]="localData" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public cellClick = new EventEmitter<IGridCellEventArgs>();


    /**
     * Emitted when formGroup is created on edit of row/cell.
     *
     * @example
     * ```html
     * <igx-grid #grid (formGroupCreated)="formGroupCreated($event)" [data]="localData" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public formGroupCreated = new EventEmitter<IGridFormGroupCreatedEventArgs>();

    /**
     * Emitted when grid's validation status changes.
     *
     * @example
     * ```html
     * <igx-grid #grid (validationStatusChange)="validationStatusChange($event)" [data]="localData" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public validationStatusChange = new EventEmitter<IGridValidationStatusEventArgs>();

    /**
     * Emitted when a cell is selected.
     *
     * @remarks
     *  Returns the `IgxGridCell`.
     * @example
     * ```html
     * <igx-grid #grid (selected)="onCellSelect($event)" [data]="localData" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public selected = new EventEmitter<IGridCellEventArgs>();

    /**
     *  Emitted when `IgxGridRowComponent` is selected.
     *
     * @example
     * ```html
     * <igx-grid #grid (rowSelectionChanging)="rowSelectionChanging($event)" [data]="localData" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowSelectionChanging = new EventEmitter<IRowSelectionEventArgs>();

    /**
     *  Emitted when `IgxColumnComponent` is selected.
     *
     * @example
     * ```html
     * <igx-grid #grid (columnSelectionChanging)="columnSelectionChanging($event)" [data]="localData" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public columnSelectionChanging = new EventEmitter<IColumnSelectionEventArgs>();

    /**
     * Emitted before `IgxColumnComponent` is pinned.
     *
     * @remarks
     * The index at which to insert the column may be changed through the `insertAtIndex` property.
     * @example
     * ```typescript
     * public columnPinning(event) {
     *     if (event.column.field === "Name") {
     *       event.insertAtIndex = 0;
     *     }
     * }
     * ```
     */
    @Output()
    public columnPin = new EventEmitter<IPinColumnCancellableEventArgs>();

    /**
     * Emitted after `IgxColumnComponent` is pinned.
     *
     * @remarks
     * The index that the column is inserted at may be changed through the `insertAtIndex` property.
     * @example
     * ```typescript
     * public columnPinning(event) {
     *     if (event.column.field === "Name") {
     *       event.insertAtIndex = 0;
     *     }
     * }
     * ```
     */
    @Output()
    public columnPinned = new EventEmitter<IPinColumnEventArgs>();

    /**
     * Emitted when cell enters edit mode.
     *
     * @remarks
     * This event is cancelable.
     * @example
     * ```html
     * <igx-grid #grid3 (cellEditEnter)="editStart($event)" [data]="data" [primaryKey]="'ProductID'">
     * </igx-grid>
     * ```
     */
    @Output()
    public cellEditEnter = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emitted when cell exits edit mode.
     *
     * @example
     * ```html
     * <igx-grid #grid3 (cellEditExit)="editExit($event)" [data]="data" [primaryKey]="'ProductID'">
     * </igx-grid>
     * ```
     */
    @Output()
    public cellEditExit = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * Emitted when cell has been edited.
     *
     * @remarks
     * Event is fired after editing is completed, when the cell is exiting edit mode.
     * This event is cancelable.
     * @example
     * ```html
     * <igx-grid #grid3 (cellEdit)="editDone($event)" [data]="data" [primaryKey]="'ProductID'">
     * </igx-grid>
     * ```
     */
    @Output()
    public cellEdit = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emitted after cell has been edited and editing has been committed.
     *
     * @example
     * ```html
     * <igx-grid #grid3 (cellEditDone)="editDone($event)" [data]="data" [primaryKey]="'ProductID'">
     * </igx-grid>
     * ```
     */
    @Output()
    public cellEditDone = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * Emitted when a row enters edit mode.
     *
     * @remarks
     * Emitted when [rowEditable]="true".
     * This event is cancelable.
     * @example
     * ```html
     * <igx-grid #grid3 (rowEditEnter)="editStart($event)" [primaryKey]="'ProductID'" [rowEditable]="true">
     * </igx-grid>
     * ```
     */
    @Output()
    public rowEditEnter = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emitted when exiting edit mode for a row.
     *
     * @remarks
     * Emitted when [rowEditable]="true" & `endEdit(true)` is called.
     * Emitted when changing rows during edit mode, selecting an un-editable cell in the edited row,
     * performing paging operation, column resizing, pinning, moving or hitting `Done`
     * button inside of the rowEditingOverlay, or hitting the `Enter` key while editing a cell.
     * This event is cancelable.
     * @example
     * ```html
     * <igx-grid #grid3 (rowEdit)="editDone($event)" [data]="data" [primaryKey]="'ProductID'" [rowEditable]="true">
     * </igx-grid>
     * ```
     */
    @Output()
    public rowEdit = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emitted after exiting edit mode for a row and editing has been committed.
     *
     * @remarks
     * Emitted when [rowEditable]="true" & `endEdit(true)` is called.
     * Emitted when changing rows during edit mode, selecting an un-editable cell in the edited row,
     * performing paging operation, column resizing, pinning, moving or hitting `Done`
     * button inside of the rowEditingOverlay, or hitting the `Enter` key while editing a cell.
     * @example
     * ```html
     * <igx-grid #grid3 (rowEditDone)="editDone($event)" [data]="data" [primaryKey]="'ProductID'" [rowEditable]="true">
     * </igx-grid>
     * ```
     */
    @Output()
    public rowEditDone = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * Emitted when row editing is canceled.
     *
     * @remarks
     * Emits when [rowEditable]="true" & `endEdit(false)` is called.
     * Emitted when changing hitting `Esc` key during cell editing and when click on the `Cancel` button
     * in the row editing overlay.
     * @example
     * ```html
     * <igx-grid #grid3 (rowEditExit)="editExit($event)" [data]="data" [primaryKey]="'ProductID'" [rowEditable]="true">
     * </igx-grid>
     * ```
     */
    @Output()
    public rowEditExit = new EventEmitter<IGridEditDoneEventArgs>();

    /**
     * Emitted when a column is initialized.
     *
     * @remarks
     * Returns the column object.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (columnInit)="initColumns($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public columnInit = new EventEmitter<IgxColumnComponent>();

    /**
     * Emitted before sorting expressions are applied.
     *
     * @remarks
     * Returns an `ISortingEventArgs` object. `sortingExpressions` key holds the sorting expressions.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [autoGenerate]="true" (sorting)="sorting($event)"></igx-grid>
     * ```
     */
    @Output()
    public sorting = new EventEmitter<ISortingEventArgs>();

    /**
     * Emitted after sorting is completed.
     *
     * @remarks
     * Returns the sorting expression.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [autoGenerate]="true" (sortingDone)="sortingDone($event)"></igx-grid>
     * ```
     */
    @Output()
    public sortingDone = new EventEmitter<ISortingExpression | ISortingExpression[]>();

    /**
     * Emitted before filtering expressions are applied.
     *
     * @remarks
     * Returns an `IFilteringEventArgs` object. `filteringExpressions` key holds the filtering expressions for the column.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true" (filtering)="filtering($event)"></igx-grid>
     * ```
     */
    @Output()
    public filtering = new EventEmitter<IFilteringEventArgs>();

    /**
     * Emitted after filtering is performed through the UI.
     *
     * @remarks
     * Returns the filtering expressions tree of the column for which filtering was performed.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true" (filteringDone)="filteringDone($event)"></igx-grid>
     * ```
     */
    @Output()
    public filteringDone = new EventEmitter<IFilteringExpressionsTree>();

    /**
     * @deprecated in version 12.1.0. Use the corresponding output exposed by the `igx-paginator` component instead
     *
     * Emitted after paging is performed.
     *
     *
     * @remarks
     * Returns an object consisting of the previous and next pages.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true" (pagingDone)="pagingDone($event)"></igx-grid>
     * ```
     */
    @Output()
    public pagingDone = new EventEmitter<IPageEventArgs>();

    /**
     * Emitted when a row is added.
     *
     * @remarks
     * Returns the data for the new `IgxGridRowComponent` object.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (rowAdded)="rowAdded($event)" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowAdded = new EventEmitter<IRowDataEventArgs>();

    /**
     * Emitted when a row is deleted.
     *
     * @remarks
     * Returns an `IRowDataEventArgs` object.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (rowDeleted)="rowDeleted($event)" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowDeleted = new EventEmitter<IRowDataEventArgs>();

    /**
     * Emmited when deleting a row.
     *
     * @remarks
     * This event is cancelable.
     * Returns an `IGridEditEventArgs` object.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (rowDelete)="rowDelete($event)" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowDelete = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emmited just before the newly added row is commited.
     *
     * @remarks
     * This event is cancelable.
     * Returns an `IGridEditEventArgs` object.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (rowAdd)="rowAdd($event)" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowAdd = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emitted after column is resized.
     *
     * @remarks
     * Returns the `IgxColumnComponent` object's old and new width.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (columnResized)="resizing($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public columnResized = new EventEmitter<IColumnResizeEventArgs>();

    /**
     * Emitted when a cell is right clicked.
     *
     * @remarks
     * Returns the `IgxGridCell` object.
     * ```html
     * <igx-grid #grid [data]="localData" (contextMenu)="contextMenu($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public contextMenu = new EventEmitter<IGridCellEventArgs>();

    /**
     * Emitted when a cell is double clicked.
     *
     * @remarks
     * Returns the `IgxGridCell` object.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" (doubleClick)="dblClick($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public doubleClick = new EventEmitter<IGridCellEventArgs>();

    /**
     * Emitted before column visibility is changed.
     *
     * @remarks
     * Args: { column: any, newValue: boolean }
     * @example
     * ```html
     * <igx-grid (columnVisibilityChanging)="visibilityChanging($event)"></igx-grid>
     * ```
     */
    @Output()
    public columnVisibilityChanging = new EventEmitter<IColumnVisibilityChangingEventArgs>();

    /**
     * Emitted after column visibility is changed.
     *
     * @remarks
     * Args: { column: IgxColumnComponent, newValue: boolean }
     * @example
     * ```html
     * <igx-grid (columnVisibilityChanged)="visibilityChanged($event)"></igx-grid>
     * ```
     */
    @Output()
    public columnVisibilityChanged = new EventEmitter<IColumnVisibilityChangedEventArgs>();

    /**
     * Emitted when column moving starts.
     *
     * @remarks
     * Returns the moved `IgxColumnComponent` object.
     * @example
     * ```html
     * <igx-grid (columnMovingStart)="movingStart($event)"></igx-grid>
     * ```
     */
    @Output()
    public columnMovingStart = new EventEmitter<IColumnMovingStartEventArgs>();

    /**
     * Emitted during the column moving operation.
     *
     * @remarks
     * Returns the source and target `IgxColumnComponent` objects. This event is cancelable.
     * @example
     * ```html
     * <igx-grid (columnMoving)="moving($event)"></igx-grid>
     * ```
     */
    @Output()
    public columnMoving = new EventEmitter<IColumnMovingEventArgs>();

    /**
     * Emitted when column moving ends.
     *
     * @remarks
     * Returns the source and target `IgxColumnComponent` objects.
     * @example
     * ```html
     * <igx-grid (columnMovingEnd)="movingEnds($event)"></igx-grid>
     * ```
     */
    @Output()
    public columnMovingEnd = new EventEmitter<IColumnMovingEndEventArgs>();

    /**
     * Emitted when keydown is triggered over element inside grid's body.
     *
     * @remarks
     * This event is fired only if the key combination is supported in the grid.
     * Return the target type, target object and the original event. This event is cancelable.
     * @example
     * ```html
     *  <igx-grid (gridKeydown)="customKeydown($event)"></igx-grid>
     * ```
     */
    @Output()
    public gridKeydown = new EventEmitter<IGridKeydownEventArgs>();

    /**
     * Emitted when start dragging a row.
     *
     * @remarks
     * Return the dragged row.
     */
    @Output()
    public rowDragStart = new EventEmitter<IRowDragStartEventArgs>();

    /**
     * Emitted when dropping a row.
     *
     * @remarks
     * Return the dropped row.
     */
    @Output()
    public rowDragEnd = new EventEmitter<IRowDragEndEventArgs>();

    /**
     * Emitted when a copy operation is executed.
     *
     * @remarks
     * Fired only if copy behavior is enabled through the [`clipboardOptions`]{@link IgxGridBaseDirective#clipboardOptions}.
     */
    @Output()
    public gridCopy = new EventEmitter<IGridClipboardEvent>();

    /**
     * @hidden @internal
     */
    @Output()
    public expansionStatesChange = new EventEmitter<Map<any, boolean>>();

    /**
     * Emitted when the expanded state of a row gets changed.
     *
     * @example
     * ```html
     * <igx-grid [data]="employeeData" (rowToggle)="rowToggle($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowToggle = new EventEmitter<IRowToggleEventArgs>();

    /**
     * Emitted when the pinned state of a row is changed.
     *
     * @example
     * ```html
     * <igx-grid [data]="employeeData" (rowPinning)="rowPin($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowPinning = new EventEmitter<IPinRowEventArgs>();

    /**
     * Emitted when the pinned state of a row is changed.
     *
     * @example
     * ```html
     * <igx-grid [data]="employeeData" (rowPinned)="rowPin($event)" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Output()
    public rowPinned = new EventEmitter<IPinRowEventArgs>();

    /**
     * Emmited when the active node is changed.
     *
     * @example
     * ```
     * <igx-grid [data]="data" [autoGenerate]="true" (activeNodeChange)="activeNodeChange($event)"></igx-grid>
     * ```
     */
    @Output()
    public activeNodeChange = new EventEmitter<IActiveNodeChangeEventArgs>();

    /**
     * Emitted before sorting is performed.
     *
     * @remarks
     * Returns the sorting expressions.
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [autoGenerate]="true" (sortingExpressionsChange)="sortingExprChange($event)"></igx-grid>
     * ```
     */
    @Output()
    public sortingExpressionsChange = new EventEmitter<ISortingExpression[]>();


    /**
     * Emitted when an export process is initiated by the user.
     *
     * @example
     * ```typescript
     * toolbarExporting(event: IGridToolbarExportEventArgs){
     *     const toolbarExporting = event;
     * }
     * ```
     */
    @Output()
    public toolbarExporting = new EventEmitter<IGridToolbarExportEventArgs>();

    /* End of toolbar related definitions */

    /**
     * Emitted when making a range selection.
     *
     * @remarks
     * Range selection can be made either through drag selection or through keyboard selection.
     */
    @Output()
    public rangeSelected = new EventEmitter<GridSelectionRange>();

    /** Emitted after the ngAfterViewInit hook. At this point the grid exists in the DOM */
    @Output()
    public rendered = new EventEmitter<boolean>();

    /**
     * @hidden @internal
     */
    @Output()
    public localeChange = new EventEmitter<boolean>();

    /**
     * Emitted before the grid's data view is changed because of a data operation, rebinding, etc.
     *
     * @example
     * ```typescript
     *  <igx-grid #grid [data]="localData" [autoGenerate]="true" (dataChanging)='handleDataChangingEvent()'></igx-grid>
     * ```
     */
    @Output()
    public dataChanging = new EventEmitter<IForOfDataChangingEventArgs>();

    /**
     * Emitted after the grid's data view is changed because of a data operation, rebinding, etc.
     *
     * @example
     * ```typescript
     *  <igx-grid #grid [data]="localData" [autoGenerate]="true" (dataChanged)='handleDataChangedEvent()'></igx-grid>
     * ```
     */
    @Output()
    public dataChanged = new EventEmitter<any>();

    /**
     * @hidden @internal
     */
    @ViewChild(IgxSnackbarComponent)
    public addRowSnackbar: IgxSnackbarComponent;

    /**
     * @hidden @internal
     */
    @ViewChild(IgxGridColumnResizerComponent)
    public resizeLine: IgxGridColumnResizerComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('loadingOverlay', { read: IgxToggleDirective, static: true })
    public loadingOverlay: IgxToggleDirective;

    /**
     * @hidden @internal
     */
    @ViewChild('igxLoadingOverlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    public loadingOutlet: IgxOverlayOutletDirective;

    /**
     * @hidden @internal
     */
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: true })
    public columnList: QueryList<IgxColumnComponent> = new QueryList<IgxColumnComponent>();

    @ContentChild(IgxActionStripComponent)
    public actionStrip: IgxActionStripComponent;

    /**
     * @hidden @internal
     */
    @ContentChild(IgxExcelStyleLoadingValuesTemplateDirective, { read: IgxExcelStyleLoadingValuesTemplateDirective, static: true })
    public excelStyleLoadingValuesTemplateDirective: IgxExcelStyleLoadingValuesTemplateDirective;

    /**
     * A template reference for the template when the filtered grid is empty.
     *
     * @example
     * ```
     * const emptyTempalte = this.grid.emptyGridTemplate;
     * ```
     */
    @ViewChild('emptyFilteredGrid', { read: TemplateRef, static: true })
    public emptyFilteredGridTemplate: TemplateRef<any>;

    /**
     * A template reference for the template when the grid is empty.
     *
     * @example
     * ```
     * const emptyTempalte = this.grid.emptyGridTemplate;
     * ```
     */
    @ViewChild('defaultEmptyGrid', { read: TemplateRef, static: true })
    public emptyGridDefaultTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultLoadingGrid', { read: TemplateRef, static: true })
    public loadingGridDefaultTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('scrollContainer', { read: IgxGridForOfDirective, static: true })
    public parentVirtDir: IgxGridForOfDirective<any>;

    /**
     * @hidden
     * @internal
     */
    @ContentChildren(IgxHeadSelectorDirective, { read: TemplateRef, descendants: false })
    public headSelectorsTemplates: QueryList<TemplateRef<IgxHeadSelectorTemplateContext>>;

    /**
     * @hidden
     * @internal
     */
    @ContentChildren(IgxRowSelectorDirective, { read: TemplateRef, descendants: false })
    public rowSelectorsTemplates: QueryList<TemplateRef<IgxRowSelectorTemplateContext>>;

    /**
     * @hidden
     * @internal
     */
    @ContentChildren(IgxRowDragGhostDirective, { read: TemplateRef, descendants: false })
    public dragGhostCustomTemplates: QueryList<TemplateRef<IgxGridRowDragGhostContext>>;


    /**
     * Gets the custom template, if any, used for row drag ghost.
     */
    @Input()
    public get dragGhostCustomTemplate() {
        return this._dragGhostCustomTemplate || this.dragGhostCustomTemplates.first;
    }

    /**
     * Sets a custom template for the row drag ghost.
     *```html
     * <ng-template #template igxRowDragGhost>
     *    <igx-icon>menu</igx-icon>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'template'", {read: TemplateRef })
     * public template: TemplateRef<any>;
     * this.grid.dragGhostCustomTemplate = this.template;
     * ```
     */
    public set dragGhostCustomTemplate(template: TemplateRef<IgxGridRowDragGhostContext>) {
        this._dragGhostCustomTemplate = template;
    }


    /**
     * @hidden @internal
     */
    @ViewChild('verticalScrollContainer', { read: IgxGridForOfDirective, static: true })
    public verticalScrollContainer: IgxGridForOfDirective<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('verticalScrollHolder', { read: IgxGridForOfDirective, static: true })
    public verticalScroll: IgxGridForOfDirective<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('scr', { read: ElementRef, static: true })
    public scr: ElementRef;

    /** @hidden @internal */
    @ViewChild('headSelectorBaseTemplate', { read: TemplateRef, static: true })
    public headerSelectorBaseTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('footer', { read: ElementRef })
    public footer: ElementRef;

    public get headerContainer() {
        return this.theadRow?.headerForOf;
    }

    public get headerSelectorContainer() {
        return this.theadRow?.headerSelectorContainer;
    }

    public get headerDragContainer() {
        return this.theadRow?.headerDragContainer;
    }

    public get headerGroupContainer() {
        return this.theadRow?.headerGroupContainer;
    }

    public get filteringRow(): IgxGridFilteringRowComponent {
        return this.theadRow?.filterRow;
    }

    /** @hidden @internal */
    @ViewChild(IgxGridHeaderRowComponent, { static: true })
    public theadRow: IgxGridHeaderRowComponent;

    /** @hidden @internal */
    @ViewChild(IgxGridGroupByAreaComponent)
    public groupArea: IgxGridGroupByAreaComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('tbody', { static: true })
    public tbody: ElementRef;

    /**
     * @hidden @internal
     */
    @ViewChild('pinContainer', { read: ElementRef })
    public pinContainer: ElementRef;

    /**
     * @hidden @internal
     */
    @ViewChild('tfoot', { static: true })
    public tfoot: ElementRef<HTMLElement>;

    /**
     * @hidden @internal
     */
    @ViewChild('igxRowEditingOverlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    public rowEditingOutletDirective: IgxOverlayOutletDirective;

    /**
     * @hidden @internal
     */
    @ViewChildren(IgxTemplateOutletDirective, { read: IgxTemplateOutletDirective })
    public tmpOutlets: QueryList<any> = new QueryList<any>();

    /**
     * @hidden
     * @internal
     */
    @ViewChild('dragIndicatorIconBase', { read: TemplateRef, static: true })
    public dragIndicatorIconBase: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ContentChildren(IgxRowEditTemplateDirective, { descendants: false, read: TemplateRef })
    public rowEditCustomDirectives: QueryList<TemplateRef<IgxGridRowEditTemplateContext>>;

    /**
     * @hidden @internal
     */
    @ContentChildren(IgxRowEditTextDirective, { descendants: false, read: TemplateRef })
    public rowEditTextDirectives: QueryList<TemplateRef<IgxGridRowEditTextTemplateContext>>;

    /**
     * Gets the row edit text template.
     */
    @Input()
    public get rowEditTextTemplate(): TemplateRef<IgxGridRowEditTextTemplateContext> {
        return this._rowEditTextTemplate || this.rowEditTextDirectives.first;
    }
    /**
     * Sets the row edit text template.
     *```html
     * <ng-template #template igxRowEditText let-rowChangesCount>
     * Changes: {{rowChangesCount}}
     * </ng-template>
     * ```
     *```typescript
     * @ViewChild('template', {read: TemplateRef })
     * public template: TemplateRef<any>;
     * this.grid.rowEditTextTemplate = this.template;
     * ```
     */
    public set rowEditTextTemplate(template: TemplateRef<IgxGridRowEditTextTemplateContext>) {
        this._rowEditTextTemplate = template;
    }

    /**
     * @hidden @internal
     */
    @ContentChild(IgxRowAddTextDirective, { read: TemplateRef })
    public rowAddText: TemplateRef<IgxGridEmptyTemplateContext>;

    /**
     * Gets the row add text template.
     */
    @Input()
    public get rowAddTextTemplate(): TemplateRef<IgxGridEmptyTemplateContext> {
        return this._rowAddTextTemplate || this.rowAddText;
    }
    /**
     * Sets the row add text template.
     *```html
     * <ng-template #template igxRowAddText>
     * Adding Row
     * </ng-template>
     * ```
     *```typescript
     * @ViewChild('template', {read: TemplateRef })
     * public template: TemplateRef<any>;
     * this.grid.rowAddTextTemplate = this.template;
     * ```
     */
    public set rowAddTextTemplate(template: TemplateRef<IgxGridEmptyTemplateContext>) {
        this._rowAddTextTemplate = template;
    }

    /**
     * @hidden @internal
     */
    @ContentChildren(IgxRowEditActionsDirective, { descendants: false, read: TemplateRef })
    public rowEditActionsDirectives: QueryList<TemplateRef<IgxGridRowEditActionsTemplateContext>>;

    /**
     * Gets the row edit actions template.
     */
    @Input()
    public get rowEditActionsTemplate(): TemplateRef<IgxGridRowEditActionsTemplateContext> {
        return this._rowEditActionsTemplate || this.rowEditActionsDirectives.first;
    }
    /**
     * Sets the row edit actions template.
     *```html
     * <ng-template #template igxRowEditActions let-endRowEdit>
     * <button igxButton igxRowEditTabStop (click)="endRowEdit(false)">Cancel</button>
     * <button igxButton igxRowEditTabStop (click)="endRowEdit(true)">Apply</button>
     * </ng-template>
     * ```
     *```typescript
     * @ViewChild('template', {read: TemplateRef })
     * public template: TemplateRef<any>;
     * this.grid.rowEditActionsTemplate = this.template;
     * ```
     */
    public set rowEditActionsTemplate(template: TemplateRef<IgxGridRowEditActionsTemplateContext>) {
        this._rowEditActionsTemplate = template;
    }

    /**
     * The custom template, if any, that should be used when rendering a row expand indicator.
     */
    @ContentChild(IgxRowExpandedIndicatorDirective, { read: TemplateRef })
    public rowExpandedIndicatorTemplate: TemplateRef<IgxGridRowTemplateContext> = null;

    /**
     * The custom template, if any, that should be used when rendering a row collapse indicator.
     */
    @ContentChild(IgxRowCollapsedIndicatorDirective, { read: TemplateRef })
    public rowCollapsedIndicatorTemplate: TemplateRef<IgxGridRowTemplateContext> = null;

    /**
     * The custom template, if any, that should be used when rendering a header expand indicator.
     */
    @ContentChild(IgxHeaderExpandIndicatorDirective, { read: TemplateRef })
    public headerExpandIndicatorTemplate: TemplateRef<IgxGridTemplateContext> = null;

    /**
     * The custom template, if any, that should be used when rendering a header collapse indicator.
     */
    @ContentChild(IgxHeaderCollapseIndicatorDirective, { read: TemplateRef })
    public headerCollapseIndicatorTemplate: TemplateRef<IgxGridTemplateContext> = null;

    /**
     * The custom template, if any, that should be used when rendering a row expand indicator.
     */
    @ContentChild(IgxExcelStyleHeaderIconDirective, { read: TemplateRef })
    public excelStyleHeaderIconDirectiveTemplate: TemplateRef<IgxGridHeaderTemplateContext> = null;

    /**
     * Gets the excel style header icon.
    */
    @Input()
    public get excelStyleHeaderIconTemplate(): TemplateRef<IgxGridHeaderTemplateContext> {
        return this._excelStyleHeaderIconTemplate || this.excelStyleHeaderIconDirectiveTemplate;
    }

    /**
     * Sets the excel style header icon.
     *```html
     *<ng-template #template igxExcelStyleHeaderIcon>
     * <igx-icon>filter_alt</igx-icon>
     *</ng-template>
     * ```
     *```typescript
     * @ViewChild('template', {read: TemplateRef })
     * public template: TemplateRef<any>;
     * this.grid.excelStyleHeaderIconTemplate = this.template;
     * ```
    */
    public set excelStyleHeaderIconTemplate(template: TemplateRef<IgxGridHeaderTemplateContext>) {
        this._excelStyleHeaderIconTemplate = template;
    }


    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxSortAscendingHeaderIconDirective, { read: TemplateRef })
    public sortAscendingHeaderIconDirectiveTemplate: TemplateRef<IgxGridHeaderTemplateContext> = null;

    /**
     * The custom template, if any, that should be used when rendering a header sorting indicator when columns are sorted in asc order.
     */
    @Input()
    public get sortAscendingHeaderIconTemplate(): TemplateRef<IgxGridHeaderTemplateContext> {
        return this._sortAscendingHeaderIconTemplate;
    }

    /**
     * Sets a custom template that should be used when rendering a header sorting indicator when columns are sorted in asc order.
     *```html
     * <ng-template #template igxSortAscendingHeaderIcon>
     *    <igx-icon>expand_less</igx-icon>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'template'", {read: TemplateRef })
     * public template: TemplateRef<any>;
     * this.grid.sortAscendingHeaderIconTemplate = this.template;
     * ```
     */
    public set sortAscendingHeaderIconTemplate(template: TemplateRef<IgxGridHeaderTemplateContext>) {
        this._sortAscendingHeaderIconTemplate = template;
    }


    @ContentChild(IgxSortDescendingHeaderIconDirective, { read: TemplateRef })
    public sortDescendingHeaderIconDirectiveTemplate: TemplateRef<IgxGridHeaderTemplateContext> = null;

    /**
     * The custom template, if any, that should be used when rendering a header sorting indicator when columns are sorted in desc order.
     */
    @Input()
    public get sortDescendingHeaderIconTemplate() {
        return this._sortDescendingHeaderIconTemplate;
    }

    /**
     * Sets a custom template that should be used when rendering a header sorting indicator when columns are sorted in desc order.
     *```html
     * <ng-template #template igxSortDescendingHeaderIcon>
     *    <igx-icon>expand_more</igx-icon>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'template'", {read: TemplateRef })
     * public template: TemplateRef<any>;
     * this.grid.sortDescendingHeaderIconTemplate = this.template;
     * ```
     */
    public set sortDescendingHeaderIconTemplate(template: TemplateRef<IgxGridHeaderTemplateContext>) {
            this._sortDescendingHeaderIconTemplate = template;
    }

    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxSortHeaderIconDirective, { read: TemplateRef })
    public sortHeaderIconDirectiveTemplate: TemplateRef<IgxGridHeaderTemplateContext> = null;

    /**
     * Gets custom template, if any, that should be used when rendering a header sorting indicator when columns are not sorted.
     */
    @Input()
    public get sortHeaderIconTemplate(): TemplateRef<IgxGridHeaderTemplateContext> {
        return this._sortHeaderIconTemplate;
    }

    /**
     * Sets a custom template that should be used when rendering a header sorting indicator when columns are not sorted.
     *```html
     * <ng-template #template igxSortHeaderIcon>
     *    <igx-icon>unfold_more</igx-icon>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'template'", {read: TemplateRef })
     * public template: TemplateRef<any>;
     * this.grid.sortHeaderIconTemplate = this.template;
     * ```
     */
    public set sortHeaderIconTemplate(template: TemplateRef<IgxGridHeaderTemplateContext>) {
        this._sortHeaderIconTemplate = template;
    }

    /**
     * @hidden
     * @internal
     */
    @ContentChildren(IgxDragIndicatorIconDirective, { read: TemplateRef, descendants: false })
    public dragIndicatorIconTemplates: QueryList<TemplateRef<IgxGridEmptyTemplateContext>>;

    /**
     * @hidden @internal
     */
    @ViewChildren(IgxRowEditTabStopDirective)
    public rowEditTabsDEFAULT: QueryList<IgxRowEditTabStopDirective>;

    /**
     * @hidden @internal
     */
    @ContentChildren(IgxRowEditTabStopDirective, { descendants: true })
    public rowEditTabsCUSTOM: QueryList<IgxRowEditTabStopDirective>;

    /**
     * @hidden @internal
     */
    @ViewChild('rowEditingOverlay', { read: IgxToggleDirective })
    public rowEditingOverlay: IgxToggleDirective;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.role')
    public hostRole = 'grid';

    /** @hidden @internal */
    @ContentChildren(IgxGridToolbarComponent)
    public toolbar: QueryList<IgxGridToolbarComponent>;

    /** @hidden @internal */
    @ContentChildren(IgxPaginatorComponent)
    protected paginationComponents: QueryList<IgxPaginatorComponent>;

    /**
     * @hidden @internal
     */
    @ViewChild('igxFilteringOverlayOutlet', { read: IgxOverlayOutletDirective, static: true })
    protected _outletDirective: IgxOverlayOutletDirective;

    /**
     * @hidden @internal
     */
    @ViewChild('sink', { read: ViewContainerRef, static: true })
    public anchor: ViewContainerRef;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultExpandedTemplate', { read: TemplateRef, static: true })
    protected defaultExpandedTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultCollapsedTemplate', { read: TemplateRef, static: true })
    protected defaultCollapsedTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultESFHeaderIcon', { read: TemplateRef, static: true })
    protected defaultESFHeaderIconTemplate: TemplateRef<any>;

    @ViewChildren('summaryRow', { read: IgxSummaryRowComponent })
    protected _summaryRowList: QueryList<IgxSummaryRowComponent>;

    @ViewChildren('row')
    private _rowList: QueryList<IgxGridRowComponent>;

    @ViewChildren('pinnedRow')
    private _pinnedRowList: QueryList<IgxGridRowComponent>;

    /**
     * @hidden @internal
     */
    @ViewChild('defaultRowEditTemplate', { read: TemplateRef, static: true })
    private defaultRowEditTemplate: TemplateRef<IgxGridRowEditTemplateContext>;

    @ViewChildren(IgxRowDirective, { read: IgxRowDirective })
    private _dataRowList: QueryList<IgxRowDirective>;

    /**
     * Gets/Sets the resource strings.
     *
     * @remarks
     * By default it uses EN resources.
     */
    @Input()
    public set resourceStrings(value: IGridResourceStrings) {
        this._resourceStrings = Object.assign({}, this._resourceStrings, value);
    }

    public get resourceStrings(): IGridResourceStrings {
        if (!this._resourceStrings) {
            this._resourceStrings = CurrentResourceStrings.GridResStrings;
        }
        return this._resourceStrings;
    }

    /**
     * Gets/Sets the filtering logic of the `IgxGridComponent`.
     *
     * @remarks
     * The default is AND.
     * @example
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true" [filteringLogic]="filtering"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public get filteringLogic() {
        return this._filteringExpressionsTree.operator;
    }

    public set filteringLogic(value: FilteringLogic) {
        this._filteringExpressionsTree.operator = value;
    }

    /**
     * Gets/Sets the filtering state.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true" [(filteringExpressionsTree)]="model.filteringExpressions"></igx-grid>
     * ```
     * @remarks
     * Supports two-way binding.
     */
    @WatchChanges()
    @Input()
    public get filteringExpressionsTree() {
        return this._filteringExpressionsTree;
    }

    public set filteringExpressionsTree(value) {
        if (value && value instanceof FilteringExpressionsTree) {
            const val = (value as FilteringExpressionsTree);
            for (let index = 0; index < val.filteringOperands.length; index++) {
                if (!(val.filteringOperands[index] instanceof FilteringExpressionsTree)) {
                    const newExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And, val.filteringOperands[index].fieldName);
                    newExpressionsTree.filteringOperands.push(val.filteringOperands[index] as IFilteringExpression);
                    val.filteringOperands[index] = newExpressionsTree;
                }
            }

            value.type = FilteringExpressionsTreeType.Regular;
            this._filteringExpressionsTree = value;
            this.filteringPipeTrigger++;
            this.filteringExpressionsTreeChange.emit(this._filteringExpressionsTree);

            if (this.filteringService.isFilteringExpressionsTreeEmpty(this._filteringExpressionsTree) &&
                this.filteringService.isFilteringExpressionsTreeEmpty(this._advancedFilteringExpressionsTree)) {
                this.filteredData = null;
            }

            this.filteringService.refreshExpressions();
            this.selectionService.clearHeaderCBState();
            this.summaryService.clearSummaryCache();
            this.notifyChanges();
        }
    }

    /**
     * Gets/Sets the advanced filtering state.
     *
     * @example
     * ```typescript
     * let advancedFilteringExpressionsTree = this.grid.advancedFilteringExpressionsTree;
     * this.grid.advancedFilteringExpressionsTree = logic;
     * ```
     */
    @WatchChanges()
    @Input()
    public get advancedFilteringExpressionsTree() {
        return this._advancedFilteringExpressionsTree;
    }

    public set advancedFilteringExpressionsTree(value) {
        if (value && value instanceof FilteringExpressionsTree) {
            value.type = FilteringExpressionsTreeType.Advanced;
            this._advancedFilteringExpressionsTree = value;
            this.filteringPipeTrigger++;
        } else {
            this._advancedFilteringExpressionsTree = null;
        }
        this.advancedFilteringExpressionsTreeChange.emit(this._advancedFilteringExpressionsTree);

        if (this.filteringService.isFilteringExpressionsTreeEmpty(this._filteringExpressionsTree) &&
            this.filteringService.isFilteringExpressionsTreeEmpty(this._advancedFilteringExpressionsTree)) {
            this.filteredData = null;
        }

        this.selectionService.clearHeaderCBState();
        this.summaryService.clearSummaryCache();
        this.notifyChanges();

        // Wait for the change detection to update filtered data through the pipes and then emit the event.
        requestAnimationFrame(() => this.filteringDone.emit(this._advancedFilteringExpressionsTree));
    }

    /**
     * Gets/Sets the locale.
     *
     * @remarks
     * If not set, returns browser's language.
     */
    @Input()
    public get locale(): string {
        return this._locale;
    }

    public set locale(value: string) {
        if (value !== this._locale) {
            this._locale = value;
            this._currencyPositionLeft = undefined;
            this.summaryService.clearSummaryCache();
            this.pipeTrigger++;
            this.notifyChanges();
            this.localeChange.next();
        }
    }

    @Input()
    public get pagingMode() {
        return this._pagingMode;
    }

    public set pagingMode(val: GridPagingMode) {
        this._pagingMode = val;
        this.pipeTrigger++;
        this.notifyChanges(true);
    }

    /**
     * @deprecated in version 12.1.0. Use the corresponding method exposed by the `igx-paginator`
     *
     * Gets/Sets whether the paging feature is enabled.
     *
     *
     * @remarks
     * The default state is disabled (false).
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true">
     *  <igx-paginator></igx-paginator>
     * </igx-grid>
     * ```
     */
    @Input()
    public get paging(): boolean {
        return this._paging;
    }

    public set paging(value: boolean) {
        this._paging = value;
        this.pipeTrigger++;
    }

    /**
     * @deprecated in version 12.1.0. Use `page` property form `paginator` component instead
     *
     * Gets/Sets the current page index.
     *
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true">
     *  <igx-paginator [(page)]="model.page"></igx-paginator>
     * </igx-grid>
     * ```
     * @remarks
     * Supports two-way binding.
     */
    @Input()
    public get page(): number {
        return this.paginator?.page || 0;
    }

    public set page(val: number) {
        if (this.paginator) {
            this.paginator.page = val;
        }
    }

    /**
     * @deprecated in version 12.1.0. Use `perPage` property from `paginator` component instead
     *
     * Gets/Sets the number of visible items per page.
     *
     *
     * @remarks
     * The default is 15.
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true">
     *  <igx-paginator [(perPage)]="model.perPage"></igx-paginator>
     * </igx-grid>
     * ```
     */
    @Input()
    public get perPage(): number {
        return this.paginator?.perPage || DEFAULT_ITEMS_PER_PAGE;
    }

    public set perPage(val: number) {
        this._perPage = val;
        if (this.paginator) {
            this.paginator.perPage = val;
        }
    }

    /**
     * Gets/Sets if the row selectors are hidden.
     *
     * @remarks
     *  By default row selectors are shown
     */
    @WatchChanges()
    @Input()
    public get hideRowSelectors() {
        return this._hideRowSelectors;
    }

    public set hideRowSelectors(value: boolean) {
        this._hideRowSelectors = value;
        this.notifyChanges(true);
    }

    /**
     * Gets/Sets whether rows can be moved.
     *
     * @example
     * ```html
     * <igx-grid #grid [rowDraggable]="true"></igx-grid>
     * ```
     */
    @Input()
    public get rowDraggable(): boolean {
        return this._rowDrag && this.hasVisibleColumns;
    }

    /**
     * Gets/Sets the trigger for validators used when editing the grid.
     *
     * @example
     * ```html
     * <igx-grid #grid validationTrigger='blur'></igx-grid>
     * ```
     */
    @Input()
    public validationTrigger: GridValidationTrigger = 'change';


    public set rowDraggable(val: boolean) {
        this._rowDrag = val;
        this.notifyChanges(true);
    }

    /**
     * @hidden
     * @internal
     */
    public rowDragging = false;

    /**
     * Gets the row ID that is being dragged.
     *
     * @remarks
     * The row ID is either the primaryKey value or the data record instance.
     */
    public dragRowID = null;

    /**
     * Gets/Sets whether the rows are editable.
     *
     * @remarks
     * By default it is set to false.
     * @example
     * ```html
     * <igx-grid #grid [rowEditable]="true" [primaryKey]="'ProductID'" ></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public get rowEditable(): boolean {
        return this._rowEditable;
    }

    public set rowEditable(val: boolean) {
        if (!this._init) {
            this.refreshGridState();
        }
        this._rowEditable = val;
        this.notifyChanges();
    }

    /**
     * Gets/Sets the height.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @WatchChanges()
    @HostBinding('style.height')
    @Input()
    public get height(): string | null {
        return this._height;
    }

    public set height(value: string | null) {
        if (this._height !== value) {
            this._height = value;
            this.nativeElement.style.height = value;
            this.notifyChanges(true);
        }
    }

    /**
     * @hidden @internal
     */
    @HostBinding('style.width')
    public get hostWidth() {
        return this._width || this._hostWidth;
    }

    /**
     * Gets/Sets the width of the grid.
     *
     * @example
     * ```typescript
     * let gridWidth = this.grid.width;
     * ```
     */
    @WatchChanges()
    @Input()
    public get width(): string | null {
        return this._width;
    }

    public set width(value: string | null) {
        if (this._width !== value) {
            this._width = value;
            this.nativeElement.style.width = value;
            this.notifyChanges(true);
        }
    }

    /**
     * Gets the width of the header.
     *
     * @example
     * ```html
     * let gridHeaderWidth = this.grid.headerWidth;
     * ```
     */
    public get headerWidth() {
        return parseInt(this.width, 10) - 17;
    }

    /**
     * Gets/Sets the row height.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [rowHeight]="100" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public get rowHeight() {
        return this._rowHeight ? this._rowHeight : this.defaultRowHeight;
    }

    public set rowHeight(value) {
        this._rowHeight = parseInt(value, 10);
    }

    /**
     * Gets/Sets the default width of the columns.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [columnWidth]="100" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public get columnWidth(): string {
        return this._columnWidth;
    }
    public set columnWidth(value: string) {
        this._columnWidth = value;
        this.columnWidthSetByUser = true;
        this.notifyChanges(true);
    }

    /**
     * Get/Sets the message displayed when there are no records.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [emptyGridMessage]="'The grid is empty'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public set emptyGridMessage(value: string) {
        this._emptyGridMessage = value;
    }
    public get emptyGridMessage(): string {
        return this._emptyGridMessage || this.resourceStrings.igx_grid_emptyGrid_message;
    }

    /**
     * Gets/Sets whether the grid is going to show a loading indicator.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [isLoading]="true" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public set isLoading(value: boolean) {
        if (this._isLoading !== value) {
            this._isLoading = value;
            if (!!this.data) {
                this.evaluateLoadingState();
            }
        }
        Promise.resolve().then(() => {
            // wait for the current detection cycle to end before triggering a new one.
            this.notifyChanges();
        });
    }

    public get isLoading(): boolean {
        return this._isLoading;
    }

    /**
     * Gets/Sets whether the columns should be auto-generated once again after the initialization of the grid
     *
     * @remarks
     * This will allow to bind the grid to remote data and having auto-generated columns at the same time.
     * Note that after generating the columns, this property would be disabled to avoid re-creating
     * columns each time a new data is assigned.
     * @example
     * ```typescript
     *  this.grid.shouldGenerate = true;
     * ```
     */
    public shouldGenerate: boolean;

    /**
     * Gets/Sets the message displayed when there are no records and the grid is filtered.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [emptyGridMessage]="'The grid is empty'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public set emptyFilteredGridMessage(value: string) {
        this._emptyFilteredGridMessage = value;
    }

    public get emptyFilteredGridMessage(): string {
        return this._emptyFilteredGridMessage || this.resourceStrings.igx_grid_emptyFilteredGrid_message;
    }

    /**
     * Gets/Sets the initial pinning configuration.
     *
     * @remarks
     * Allows to apply pinning the columns to the start or the end.
     * Note that pinning to both sides at a time is not allowed.
     * @example
     * ```html
     * <igx-grid [pinning]="pinningConfig"></igx-grid>
     * ```
     */
    @Input()
    public get pinning() {
        return this._pinning;
    }
    public set pinning(value) {
        if (value !== this._pinning) {
            this.resetCaches();
        }
        this._pinning = value;
    }

    /**
     * Gets/Sets if the filtering is enabled.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [allowFiltering]="true" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public get allowFiltering() {
        return this._allowFiltering;
    }

    public set allowFiltering(value) {
        if (this._allowFiltering !== value) {
            this._allowFiltering = value;
            this.filteringService.registerSVGIcons();

            if (!this._init) {
                this.calcGridHeadRow();
            }

            this.filteringService.isFilterRowVisible = false;
            this.filteringService.filteredColumn = null;

            this.notifyChanges(true);
        }
    }

    /**
     * Gets/Sets a value indicating whether the advanced filtering is enabled.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [allowAdvancedFiltering]="true" [autoGenerate]="true"></igx-grid>
     * ```
     */
    @Input()
    public get allowAdvancedFiltering() {
        return this._allowAdvancedFiltering;
    }

    public set allowAdvancedFiltering(value) {
        if (this._allowAdvancedFiltering !== value) {
            this._allowAdvancedFiltering = value;
            this.filteringService.registerSVGIcons();

            if (!this._init) {
                this.notifyChanges(true);
            }
        }
    }

    /**
     * Gets/Sets the filter mode.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [filterMode]="'quickFilter'" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     * @remarks
     * By default it's set to FilterMode.quickFilter.
     */
    @Input()
    public get filterMode() {
        return this._filterMode;
    }

    public set filterMode(value: FilterMode) {
        this._filterMode = value;

        if (this.filteringService.isFilterRowVisible) {
            this.filteringRow.close();
        }
        this.notifyChanges(true);
    }

    /**
     * Gets/Sets the summary position.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" summaryPosition="top" [autoGenerate]="true"></igx-grid>
     * ```
     * @remarks
     * By default it is bottom.
     */
    @Input()
    public get summaryPosition() {
        return this._summaryPosition;
    }

    public set summaryPosition(value: GridSummaryPosition) {
        this._summaryPosition = value;
        this.notifyChanges();
    }

    /**
     * Gets/Sets the summary calculation mode.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" summaryCalculationMode="rootLevelOnly" [autoGenerate]="true"></igx-grid>
     * ```
     * @remarks
     * By default it is rootAndChildLevels which means the summaries are calculated for the root level and each child level.
     */
    @Input()
    public get summaryCalculationMode() {
        return this._summaryCalculationMode;
    }

    public set summaryCalculationMode(value: GridSummaryCalculationMode) {
        this._summaryCalculationMode = value;
        if (!this._init) {
            this.crudService.endEdit(false);
            this.summaryService.resetSummaryHeight();
            this.notifyChanges(true);
        }
    }

    /**
     * Controls whether the summary row is visible when groupBy/parent row is collapsed.
     *
     * @example
     * ```html
     * <igx-grid #grid [data]="localData" [showSummaryOnCollapse]="true" [autoGenerate]="true"></igx-grid>
     * ```
     * @remarks
     * By default showSummaryOnCollapse is set to 'false' which means that the summary row is not visible
     * when the groupBy/parent row is collapsed.
     */
    @Input()
    public get showSummaryOnCollapse() {
        return this._showSummaryOnCollapse;
    }

    public set showSummaryOnCollapse(value: boolean) {
        this._showSummaryOnCollapse = value;
        this.notifyChanges();
    }

    /**
     * Gets/Sets the filtering strategy of the grid.
     *
     * @example
     * ```html
     *  <igx-grid #grid [data]="localData" [filterStrategy]="filterStrategy"></igx-grid>
     * ```
     */
    @Input()
    public get filterStrategy(): IFilteringStrategy {
        return this._filterStrategy;
    }

    public set filterStrategy(classRef: IFilteringStrategy) {
        this._filterStrategy = classRef;
    }

    /**
     * Gets/Sets the sorting strategy of the grid.
     *
     * @example
     * ```html
     *  <igx-grid #grid [data]="localData" [sortStrategy]="sortStrategy"></igx-grid>
     * ```
     */
    @Input()
    public get sortStrategy(): IGridSortingStrategy {
        return this._sortingStrategy;
    }

    public set sortStrategy(value: IGridSortingStrategy) {
        this._sortingStrategy = value;
    }

    /**
     * Gets/Sets the sorting options - single or multiple sorting.
     * Accepts an `ISortingOptions` object with any of the `mode` properties.
     *
     * @example
     * ```typescript
     * const _sortingOptions: ISortingOptions = {
     *      mode: 'single'
     * }
     * ```html
     * <igx-grid [sortingOptions]="sortingOptions"><igx-grid>
     * ```
     */
    @Input()
    public set sortingOptions(value: ISortingOptions) {
        this.clearSort();
        this._sortingOptions = Object.assign(this._sortingOptions, value);
    }

    /**
     * @hidden
     * @internal
     */
    public get sortingOptions() {
        return this._sortingOptions;
    }

    /**
     * Gets/Sets the current selection state.
     *
     * @remarks
     * Represents the selected rows' IDs (primary key or rowData)
     * @example
     * ```html
     * <igx-grid [data]="localData" primaryKey="ID" rowSelection="multiple" [selectedRows]="[0, 1, 2]"><igx-grid>
     * ```
     */
    @Input()
    public set selectedRows(rowIDs: any[]) {
        this.selectRows(rowIDs || [], true);
    }

    public get selectedRows(): any[] {
        return this.selectionService.getSelectedRows();
    }


    /**
     * A list of all `IgxGridHeaderGroupComponent`.
     *
     * @example
     * ```typescript
     * const headerGroupsList = this.grid.headerGroupsList;
     * ```
     */
    public get headerGroupsList(): IgxGridHeaderGroupComponent[] {
        return this.theadRow.groups;
    }

    /**
     * A list of all `IgxGridHeaderComponent`.
     *
     * @example
     * ```typescript
     * const headers = this.grid.headerCellList;
     * ```
     */
    public get headerCellList(): IgxGridHeaderComponent[] {
        return this.headerGroupsList.map(headerGroup => headerGroup.header).filter(header => header);
    }

    /**
     * A list of all `IgxGridFilteringCellComponent`.
     *
     * @example
     * ```typescript
     * const filterCells = this.grid.filterCellList;
     * ```
     */
    public get filterCellList(): IgxGridFilteringCellComponent[] {
        return this.headerGroupsList.map(group => group.filter).filter(cell => cell);
    }

    /**
     * @hidden @internal
     */
    public get summariesRowList() {
        const res = new QueryList<any>();
        if (!this._summaryRowList) {
            return res;
        }
        const sumList = this._summaryRowList.filter((item) => item.element.nativeElement.parentElement !== null);
        res.reset(sumList);
        return res;
    }

    /**
     * A list of `IgxGridRowComponent`.
     *
     * @example
     * ```typescript
     * const rowList = this.grid.rowList;
     * ```
     */
    public get rowList() {
        const res = new QueryList<IgxRowDirective>();
        if (!this._rowList) {
            return res;
        }
        const rList = this._rowList
            .filter((item) => item.element.nativeElement.parentElement !== null)
            .sort((a, b) => a.index - b.index);
        res.reset(rList);
        return res;
    }

    /**
     * A list of currently rendered `IgxGridRowComponent`'s.
     *
     * @example
     * ```typescript
     * const dataList = this.grid.dataRowList;
     * ```
     */
    public get dataRowList(): QueryList<IgxRowDirective> {
        const res = new QueryList<IgxRowDirective>();
        if (!this._dataRowList) {
            return res;
        }
        const rList = this._dataRowList.filter(item => item.element.nativeElement.parentElement !== null).sort((a, b) => a.index - b.index);
        res.reset(rList);
        return res;
    }

    /**
     * Gets the header row selector template.
     */
    @Input()
    public get headSelectorTemplate(): TemplateRef<IgxHeadSelectorTemplateContext> {
        return this._headSelectorTemplate || this.headSelectorsTemplates.first;
    }

    /**
     * Sets the header row selector template.
     * ```html
     * <ng-template #template igxHeadSelector let-headContext>
     * {{ headContext.selectedCount }} / {{ headContext.totalCount  }}
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'template'", {read: TemplateRef })
     * public template: TemplateRef<any>;
     * this.grid.headSelectorTemplate = this.template;
     * ```
     */
    public set headSelectorTemplate(template: TemplateRef<IgxHeadSelectorTemplateContext>) {
        this._headSelectorTemplate = template;
    }

    /**
     * @hidden
     * @internal
     */
    public get isPinningToStart() {
        return this.pinning.columns !== ColumnPinningPosition.End;
    }

    /**
     * @hidden
     * @internal
     */
    public get isRowPinningToTop() {
        return this.pinning.rows !== RowPinningPosition.Bottom;
    }

    /**
     * Gets the row selector template.
     */
    @Input()
    public get rowSelectorTemplate(): TemplateRef<IgxRowSelectorTemplateContext> {
        return this._rowSelectorTemplate || this.rowSelectorsTemplates.first;
    }

    /**
         * Sets a custom template for the row selectors.
         * ```html
         * <ng-template #template igxRowSelector let-rowContext>
         *    <igx-checkbox [checked]="rowContext.selected"></igx-checkbox>
         * </ng-template>
         * ```
         * ```typescript
         * @ViewChild("'template'", {read: TemplateRef })
         * public template: TemplateRef<any>;
         * this.grid.rowSelectorTemplate = this.template;
         * ```
         */
    public set rowSelectorTemplate(template: TemplateRef<IgxRowSelectorTemplateContext>) {
        this._rowSelectorTemplate = template;
    }

    /**
     * @hidden @internal
     */
    public get rowOutletDirective() {
        return this.rowEditingOutletDirective;
    }

    /**
     * @hidden @internal
     */
    public get parentRowOutletDirective() {
        return this.outlet;
    }

    /**
     * @hidden @internal
     */
    public get rowEditCustom(): TemplateRef<IgxGridRowEditTemplateContext> {
        if (this.rowEditCustomDirectives && this.rowEditCustomDirectives.first) {
            return this.rowEditCustomDirectives.first;
        }
        return null;
    }

    /**

    /**
     * @hidden @internal
     */
    public get rowEditContainer(): TemplateRef<IgxGridRowEditTemplateContext> {
        return this.rowEditCustom ? this.rowEditCustom : this.defaultRowEditTemplate;
    }

    /**
     * The custom template, if any, that should be used when rendering the row drag indicator icon
     */
    @Input()
    public get dragIndicatorIconTemplate(): TemplateRef<IgxGridEmptyTemplateContext> {
        return this._customDragIndicatorIconTemplate || this.dragIndicatorIconTemplates.first;
    }

    /**
     * Sets a custom template that should be used when rendering the row drag indicator icon.
     *```html
     * <ng-template #template igxDragIndicatorIcon>
     *    <igx-icon>expand_less</igx-icon>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'template'", {read: TemplateRef })
     * public template: TemplateRef<any>;
     * this.grid.dragIndicatorIconTemplate = this.template;
     * ```
     */
    public set dragIndicatorIconTemplate(val: TemplateRef<IgxGridEmptyTemplateContext>) {
        this._customDragIndicatorIconTemplate = val;
    }

    /**
     * @hidden @internal
     */
    public get firstEditableColumnIndex(): number {
        const index = this.visibleColumns.filter(col => col.editable)
            .map(c => c.visibleIndex).sort((a, b) => a - b);
        return index.length ? index[0] : null;
    }

    /**
     * @hidden @internal
     */
    public get lastEditableColumnIndex(): number {
        const index = this.visibleColumns.filter(col => col.editable)
            .map(c => c.visibleIndex).sort((a, b) => a > b ? -1 : 1);
        return index.length ? index[0] : null;
    }

    /**
     * @hidden @internal
     * TODO: Nav service logic doesn't handle 0 results from this querylist
     */
    public get rowEditTabs(): QueryList<IgxRowEditTabStopDirective> {
        return this.rowEditTabsCUSTOM.length ? this.rowEditTabsCUSTOM : this.rowEditTabsDEFAULT;
    }

    public get activeDescendant() {
        const activeElem = this.navigation.activeNode;

        if (!activeElem || !Object.keys(activeElem).length) {
            return this.id;
        }

        return activeElem.row < 0 ?
            `${this.id}_${activeElem.row}_${activeElem.mchCache.level}_${activeElem.column}` :
            `${this.id}_${activeElem.row}_${activeElem.column}`;
    }

    /**
     * @hidden @internal
     */
    @HostBinding('attr.class')
    public get hostClass(): string {
        // TODO: This blocks further updates to the class (dynamic custom, different density)
        if (this._class === '') {
            const classes = [this.getComponentDensityClass('igx-grid')];
            // The custom classes should be at the end.
            if (this.class !== '') {
                classes.push(this.class);
            }
            this._class = classes.join(' ');

        }
        return this._class;
    }

    public get bannerClass(): string {
        const position = this.rowEditPositioningStrategy.isTop ? 'igx-banner__border-top' : 'igx-banner__border-bottom';
        return `${this.getComponentDensityClass('igx-banner')} ${position}`;
    }

    /**
     * Gets/Sets the sorting state.
     *
     * @remarks
     * Supports two-way data binding.
     * @example
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true" [(sortingExpressions)]="model.sortingExpressions"></igx-grid>
     * ```
     */
    @WatchChanges()
    @Input()
    public get sortingExpressions(): ISortingExpression[] {
        return this._sortingExpressions;
    }

    public set sortingExpressions(value: ISortingExpression[]) {
        this._sortingExpressions = cloneArray(value);
        this.sortingExpressionsChange.emit(this._sortingExpressions);
        this.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public get maxLevelHeaderDepth() {
        if (this._maxLevelHeaderDepth === null) {
            this._maxLevelHeaderDepth = this.hasColumnLayouts ?
                this._columns.reduce((acc, col) => Math.max(acc, col.rowStart), 0) :
                this._columns.reduce((acc, col) => Math.max(acc, col.level), 0);
        }
        return this._maxLevelHeaderDepth;
    }

    /**
     * Gets the number of hidden columns.
     *
     * @example
     * ```typescript
     * const hiddenCol = this.grid.hiddenColumnsCount;
     * ``
     */
    public get hiddenColumnsCount() {
        return this._columns.filter((col) => col.columnGroup === false && col.hidden === true).length;
    }

    /**
     * Gets the number of pinned columns.
     */
    public get pinnedColumnsCount() {
        return this.pinnedColumns.filter(col => !col.columnLayout).length;
    }

    /**
     * Gets/Sets whether the grid has batch editing enabled.
     * When batch editing is enabled, changes are not made directly to the underlying data.
     * Instead, they are stored as transactions, which can later be committed w/ the `commit` method.
     *
     * @example
     * ```html
     * <igx-grid [batchEditing]="true" [data]="someData">
     * </igx-grid>
     * ```
     */
    @Input()
    public get batchEditing(): boolean {
        return this._batchEditing;
    }

    public set batchEditing(val: boolean) {
        if (val !== this._batchEditing) {
            delete this._transactions;
            this._batchEditing = val;
            this.switchTransactionService(val);
            this.subscribeToTransactions();
        }
    }

    /**
     * Get transactions service for the grid.
     */
    public get transactions(): TransactionService<Transaction, State> {
        if (this._diTransactions && !this.batchEditing) {
            return this._diTransactions;
        }
        return this._transactions;
    }

    /**
     * @hidden @internal
     */
    public get currentRowState(): any {
        return this._currentRowState;
    }

    /**
     * @hidden @internal
     */
    public get currencyPositionLeft(): boolean {
        if (this._currencyPositionLeft !== undefined) {
            return this._currencyPositionLeft;
        }
        const format = getLocaleNumberFormat(this.locale, NumberFormatStyle.Currency);
        const formatParts = format.split(',');
        const i = formatParts.indexOf(formatParts.find(c => c.includes('¤')));
        return this._currencyPositionLeft = i < 1;
    }

    /**
     * Gets/Sets cell selection mode.
     *
     * @remarks
     * By default the cell selection mode is multiple
     * @param selectionMode: GridSelectionMode
     */
    @WatchChanges()
    @Input()
    public get cellSelection() {
        return this._cellSelectionMode;
    }

    public set cellSelection(selectionMode: GridSelectionMode) {
        this._cellSelectionMode = selectionMode;
        // if (this.gridAPI.grid) {
        this.selectionService.clear(true);
        this.notifyChanges();
        // }
    }

    /**
     * Gets/Sets row selection mode
     *
     * @remarks
     * By default the row selection mode is 'none'
     * Note that in IgxGrid and IgxHierarchicalGrid 'multipleCascade' behaves like 'multiple'
     */
    @WatchChanges()
    @Input()
    public get rowSelection() {
        return this._rowSelectionMode;
    }

    public set rowSelection(selectionMode: GridSelectionMode) {
        this._rowSelectionMode = selectionMode;
        if (!this._init) {
            this.selectionService.clearAllSelectedRows();
            this.notifyChanges(true);
        }
    }

    /**
     * Gets/Sets column selection mode
     *
     * @remarks
     * By default the row selection mode is none
     * @param selectionMode: GridSelectionMode
     */
    @WatchChanges()
    @Input()
    public get columnSelection() {
        return this._columnSelectionMode;
    }

    public set columnSelection(selectionMode: GridSelectionMode) {
        this._columnSelectionMode = selectionMode;
        // if (this.gridAPI.grid) {
        this.selectionService.clearAllSelectedColumns();
        this.notifyChanges(true);
        // }
    }

    /**
     * @hidden @internal
     */
    public set pagingState(value) {
        this._pagingState = value;
        if (this.paginator && !this._init) {
            this.paginator.totalRecords = value.metadata.countRecords;
        }
    }

    public get pagingState() {
        return this._pagingState;
    }

    /**
     * @hidden @internal
     */
    public rowEditMessage;

    /**
     * @hidden @internal
     */
    public snackbarActionText = this.resourceStrings.igx_grid_snackbar_addrow_actiontext;

    /**
     * @hidden @internal
     */
    public calcWidth: number;
    /**
     * @hidden @internal
     */
    public calcHeight = 0;
    /**
     * @hidden @internal
     */
    public tfootHeight: number;

    /**
     * @hidden @internal
     */
    public disableTransitions = false;

    /**
     * @hidden @internal
     */
    public lastSearchInfo: ISearchInfo = {
        searchText: '',
        caseSensitive: false,
        exactMatch: false,
        activeMatchIndex: 0,
        matchInfoCache: []
    };

    /**
     * @hidden @internal
     */
    public columnWidthSetByUser = false;

    /**
     * @hidden @internal
     */
    public pinnedRecords: any[];

    /**
     * @hidden @internal
     */
    public unpinnedRecords: any[];

    /**
     * @hidden @internal
     */
    public rendered$ = this.rendered.asObservable().pipe(shareReplay({ bufferSize: 1, refCount: true }));

    /** @hidden @internal */
    public resizeNotify = new Subject<void>();

    /** @hidden @internal */
    public rowAddedNotifier = new Subject<IRowDataEventArgs>();

    /** @hidden @internal */
    public rowDeletedNotifier = new Subject<IRowDataEventArgs>();

    /** @hidden @internal */
    public pipeTriggerNotifier = new Subject();

    /** @hidden @internal */
    public _filteredSortedPinnedData: any[];

    /** @hidden @internal */
    public _filteredSortedUnpinnedData: any[];

    /** @hidden @internal */
    public _filteredPinnedData: any[];

    /**
     * @hidden
     */
    public _filteredUnpinnedData;
    /**
     * @hidden @internal
     */
    public _destroyed = false;
    /**
     * @hidden @internal
     */
    public _totalRecords = -1;
    /**
     * @hidden @internal
     */
    public columnsWithNoSetWidths = null;
    /**
     * @hidden @internal
     */
    public pipeTrigger = 0;
    /**
     * @hidden @internal
     */
    public filteringPipeTrigger = 0;
    /**
     * @hidden @internal
     */
    public summaryPipeTrigger = 0;

    /**
    * @hidden @internal
    */
    public EMPTY_DATA = [];

    public isPivot = false;

    /** @hidden @internal */
    public _baseFontSize: number;

    /**
     * @hidden
     */
    public destroy$ = new Subject<any>();

    /**
     * @hidden
     */
    protected _perPage = DEFAULT_ITEMS_PER_PAGE;
    /**
     * @hidden
     */
    protected _paging = false;
    /**
     * @hidden
     */
    protected _pagingMode = GridPagingMode.Local;
    /**
     * @hidden
     */
    protected _pagingState;
    /**
     * @hidden
     */
    protected _hideRowSelectors = false;
    /**
     * @hidden
     */
    protected _rowDrag = false;
    /**
     * @hidden
     */
    protected _columns: IgxColumnComponent[] = [];
    /**
     * @hidden
     */
    protected _columnConfig: IgxColumn[] = [];
    /**
     * @hidden
     */
    protected _pinnedColumns: IgxColumnComponent[] = [];
    /**
     * @hidden
     */
    protected _unpinnedColumns: IgxColumnComponent[] = [];
    /**
     * @hidden
     */
    protected _filteringExpressionsTree: IFilteringExpressionsTree = new FilteringExpressionsTree(FilteringLogic.And);
    /**
     * @hidden
     */
    protected _advancedFilteringExpressionsTree: IFilteringExpressionsTree;
    /**
     * @hidden
     */
    protected _sortingExpressions: Array<ISortingExpression> = [];
    /**
     * @hidden
     */
    protected _maxLevelHeaderDepth = null;
    /**
     * @hidden
     */
    protected _columnHiding = false;
    /**
     * @hidden
     */
    protected _columnPinning = false;

    protected _pinnedRecordIDs = [];

    /**
     * @hidden
     */
    protected _hasVisibleColumns;
    protected _allowFiltering = false;
    protected _allowAdvancedFiltering = false;
    protected _filterMode: FilterMode = FilterMode.quickFilter;


    protected _defaultTargetRecordNumber = 10;
    protected _expansionStates: Map<any, boolean> = new Map<any, boolean>();
    protected _defaultExpandState = false;
    protected _headerFeaturesWidth = NaN;
    protected _init = true;
    protected _cdrRequestRepaint = false;
    protected _userOutletDirective: IgxOverlayOutletDirective;
    protected _transactions: TransactionService<Transaction, State>;
    protected _batchEditing = false;
    protected _sortingOptions: ISortingOptions = { mode: 'multiple' };
    protected _filterStrategy: IFilteringStrategy = new FilteringStrategy();
    protected _autoGeneratedCols = [];
    protected _dataView = [];

    /** @hidden @internal */
    public get paginator() {
        return this.paginationComponents?.first;
    }

    /**
     * @hidden @internal
     */
    public get scrollSize() {
        return this.verticalScrollContainer.getScrollNativeSize();
    }

    private _rowEditable = false;
    private _currentRowState: any;
    private _filteredSortedData = null;

    private _customDragIndicatorIconTemplate: TemplateRef<IgxGridEmptyTemplateContext>;
    private _excelStyleHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext>;
    private _rowSelectorTemplate: TemplateRef<IgxRowSelectorTemplateContext>;
    private _headSelectorTemplate: TemplateRef<IgxHeadSelectorTemplateContext>;
    private _rowEditTextTemplate: TemplateRef<IgxGridRowEditTextTemplateContext>;
    private _rowAddTextTemplate: TemplateRef<IgxGridEmptyTemplateContext>;
    private _rowEditActionsTemplate: TemplateRef<IgxGridRowEditActionsTemplateContext>;
    private _dragGhostCustomTemplate: TemplateRef<IgxGridRowDragGhostContext>;

    private _cdrRequests = false;
    private _resourceStrings;
    private _emptyGridMessage = null;
    private _emptyFilteredGridMessage = null;
    private _isLoading = false;
    private _locale: string;
    private overlayIDs = [];
    private _sortingStrategy: IGridSortingStrategy;
    private _pinning: IPinningConfig = { columns: ColumnPinningPosition.Start };

    private _hostWidth;
    private _advancedFilteringOverlayId: string;
    private _advancedFilteringPositionSettings: PositionSettings = {
        verticalDirection: VerticalAlignment.Middle,
        horizontalDirection: HorizontalAlignment.Center,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle
    };

    private _advancedFilteringOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: false,
        modal: false,
        positionStrategy: new ConnectedPositioningStrategy(this._advancedFilteringPositionSettings),
    };

    private columnListDiffer;
    private rowListDiffer;
    private _height: string | null = '100%';
    private _width: string | null = '100%';
    private _rowHeight;
    private _horizontalForOfs: Array<IgxGridForOfDirective<any>> = [];
    private _multiRowLayoutRowSize = 1;
    // Caches
    private _totalWidth = NaN;
    private _pinnedVisible = [];
    private _unpinnedVisible = [];
    private _pinnedWidth = NaN;
    private _unpinnedWidth = NaN;
    private _visibleColumns = [];
    private _columnGroups = false;

    private _columnWidth: string;

    private _summaryPosition: GridSummaryPosition = GridSummaryPosition.bottom;
    private _summaryCalculationMode: GridSummaryCalculationMode = GridSummaryCalculationMode.rootAndChildLevels;
    private _showSummaryOnCollapse = false;
    private _summaryRowHeight = 0;
    private _cellSelectionMode: GridSelectionMode = GridSelectionMode.multiple;
    private _rowSelectionMode: GridSelectionMode = GridSelectionMode.none;
    private _selectRowOnClick = true;
    private _columnSelectionMode: GridSelectionMode = GridSelectionMode.none;

    private lastAddedRowIndex;
    private _currencyPositionLeft: boolean;

    private rowEditPositioningStrategy = new RowEditPositionStrategy({
        horizontalDirection: HorizontalAlignment.Right,
        verticalDirection: VerticalAlignment.Bottom,
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Bottom,
        closeAnimation: null
    });

    private rowEditSettings: OverlaySettings = {
        scrollStrategy: new AbsoluteScrollStrategy(),
        modal: false,
        closeOnOutsideClick: false,
        outlet: this.rowOutletDirective,
        positionStrategy: this.rowEditPositioningStrategy
    };

    private transactionChange$ = new Subject<void>();
    private _rendered = false;
    private readonly DRAG_SCROLL_DELTA = 10;
    private _dataCloneStrategy: IDataCloneStrategy = new DefaultDataCloneStrategy();
    private _class = '';
    private _autoSize = false;
    private _sortHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext> = null;
    private _sortAscendingHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext> = null;
    private _sortDescendingHeaderIconTemplate: TemplateRef<IgxGridHeaderTemplateContext> = null;

    /**
     * @hidden @internal
     */
    protected get minColumnWidth() {
        return MINIMUM_COLUMN_WIDTH;
    }

    /**
     * @hidden @internal
     */
    public abstract id: string;
    public abstract data: any[] | null;
    public abstract filteredData: any[];
    /**
     * Returns an array containing the filtered sorted data.
     *
     * @example
     * ```typescript
     * const filteredSortedData = this.grid1.filteredSortedData;
     * ```
     */
    public get filteredSortedData(): any[] {
        return this._filteredSortedData;
    }

    /**
     * @hidden @internal
     */
    public get rowChangesCount() {
        if (!this.crudService.row) {
            return 0;
        }
        const f = (obj: any) => {
            let changes = 0;
            Object.keys(obj).forEach(key => isObject(obj[key]) ? changes += f(obj[key]) : changes++);
            return changes;
        };
        const rowChanges = this.transactions.getAggregatedValue(this.crudService.row.id, false);
        return rowChanges ? f(rowChanges) : 0;
    }

    /**
     * @hidden @internal
     */
    public get dataWithAddedInTransactionRows() {
        const result = cloneArray(this.gridAPI.get_all_data());
        if (this.transactions.enabled) {
            result.push(...this.transactions.getAggregatedChanges(true)
                .filter(t => t.type === TransactionType.ADD)
                .map(t => t.newValue));
        }

        if (this.crudService.row && this.crudService.row.getClassName() === IgxAddRow.name) {
            result.splice(this.crudService.row.index, 0, this.crudService.row.data);
        }

        return result;
    }

    /**
     * @hidden @internal
     */
    public get dataLength() {
        return this.transactions.enabled ? this.dataWithAddedInTransactionRows.length : this.gridAPI.get_all_data().length;
    }

    /**
     * @hidden @internal
     */
    public get template(): TemplateRef<any> {
        if (this.isLoading && (this.hasZeroResultFilter || this.hasNoData)) {
            return this.loadingGridTemplate ? this.loadingGridTemplate : this.loadingGridDefaultTemplate;
        }

        if (this.hasZeroResultFilter) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyFilteredGridTemplate;
        }

        if (this.hasNoData) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyGridDefaultTemplate;
        }
    }

    /**
     * @hidden @internal
     */
    private get hasZeroResultFilter(): boolean {
        return this.filteredData && this.filteredData.length === 0;
    }

    /**
     * @hidden @internal
     */
    private get hasNoData(): boolean {
        return !this.data || this.dataLength === 0;
    }

    /**
     * @hidden @internal
     */
    public get shouldOverlayLoading(): boolean {
        return this.isLoading && !this.hasNoData && !this.hasZeroResultFilter;
    }

    /**
     * @hidden @internal
     */
    public get isMultiRowSelectionEnabled(): boolean {
        return this.rowSelection === GridSelectionMode.multiple
            || this.rowSelection === GridSelectionMode.multipleCascade;
    }

    /**
     * @hidden @internal
     */
    public get isRowSelectable(): boolean {
        return this.rowSelection !== GridSelectionMode.none;
    }

    /**
     * @hidden @internal
     */
    public get isCellSelectable() {
        return this.cellSelection !== GridSelectionMode.none;
    }

    /**
     * @hidden @internal
     */
    public get columnInDrag() {
        return this.gridAPI.cms.column;
    }

    constructor(
        public validation: IgxGridValidationService,
        public selectionService: IgxGridSelectionService,
        public colResizingService: IgxColumnResizingService,
        @Inject(IGX_GRID_SERVICE_BASE) public gridAPI: GridServiceType,
        protected transactionFactory: IgxFlatTransactionFactory,
        private elementRef: ElementRef<HTMLElement>,
        protected zone: NgZone,
        @Inject(DOCUMENT) public document: any,
        public cdr: ChangeDetectorRef,
        protected resolver: ComponentFactoryResolver,
        protected differs: IterableDiffers,
        protected viewRef: ViewContainerRef,
        private appRef: ApplicationRef,
        private moduleRef: NgModuleRef<any>,
        private injector: Injector,
        public navigation: IgxGridNavigationService,
        public filteringService: IgxFilteringService,
        @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
        public summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Inject(LOCALE_ID) private localeId: string,
        protected platform: PlatformUtil,
        @Optional() @Inject(IgxGridTransaction) protected _diTransactions?: TransactionService<Transaction, State>
    ) {
        super(_displayDensityOptions);
        this.locale = this.locale || this.localeId;
        this._transactions = this.transactionFactory.create(TRANSACTION_TYPE.None);
        this._transactions.cloneStrategy = this.dataCloneStrategy;
        this.cdr.detach();
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('mouseleave')
    public hideActionStrip() {
        this.actionStrip?.hide();
    }

    /**
     * @hidden
     * @internal
     */
    public get headerFeaturesWidth() {
        return this._headerFeaturesWidth;
    }

    /**
     * @hidden
     * @internal
     */
    public isDetailRecord(_rec) {
        return false;
    }

    /**
     * @hidden
     * @internal
     */
    public isGroupByRecord(_rec) {
        return false;
    }

    /**
     * @hidden @internal
     */
    public isGhostRecord(record: any): boolean {
        return record.ghostRecord !== undefined;
    }
    /**
     * @hidden @internal
     */
    public isAddRowRecord(record: any): boolean {
        return record.addRow !== undefined;
    }

    /**
     * @hidden
     * Returns the row index of a row that takes into account the full view data like pinning.
     */
    public getDataViewIndex(rowIndex, pinned) {
        if (pinned && !this.isRowPinningToTop) {
            rowIndex = rowIndex + this.unpinnedDataView.length;
        } else if (!pinned && this.isRowPinningToTop) {
            rowIndex = rowIndex + this.pinnedDataView.length;
        }
        return rowIndex;
    }

    /**
     * @hidden
     * @internal
     */
    public get hasDetails() {
        return false;
    }

    /**
     * Returns the state of the grid virtualization.
     *
     * @remarks
     * Includes the start index and how many records are rendered.
     * @example
     * ```typescript
     * const gridVirtState = this.grid1.virtualizationState;
     * ```
     */
    public get virtualizationState() {
        return this.verticalScrollContainer.state;
    }

    /**
     * @hidden
     */
    public set virtualizationState(state) {
        this.verticalScrollContainer.state = state;
    }

    /**
     * @hidden
     * @internal
     */
    public hideOverlays() {
        this.overlayIDs.forEach(overlayID => {
            const overlay = this.overlayService.getOverlayById(overlayID);

            if (overlay?.visible && !overlay.closeAnimationPlayer?.hasStarted()) {
                this.overlayService.hide(overlayID);

                this.nativeElement.focus();
            }
        });
    }

    /**
     * Returns whether the record is pinned or not.
     *
     * @param rowIndex Index of the record in the `dataView` collection.
     *
     * @hidden
     * @internal
     */
    public isRecordPinnedByViewIndex(rowIndex: number) {
        return this.hasPinnedRecords && (this.isRowPinningToTop && rowIndex < this.pinnedDataView.length) ||
            (!this.isRowPinningToTop && rowIndex >= this.unpinnedDataView.length);
    }

    /**
     * Returns whether the record is pinned or not.
     *
     * @param rowIndex Index of the record in the `filteredSortedData` collection.
     */
    public isRecordPinnedByIndex(rowIndex: number) {
        return this.hasPinnedRecords && (this.isRowPinningToTop && rowIndex < this._filteredSortedPinnedData.length) ||
            (!this.isRowPinningToTop && rowIndex >= this._filteredSortedUnpinnedData.length);
    }

    /**
     * @hidden
     * @internal
     */
    public isRecordPinned(rec) {
        return this.getInitialPinnedIndex(rec) !== -1;
    }

    /**
     * @hidden
     * @internal
     * Returns the record index in order of pinning by the user. Does not consider sorting/filtering.
     */
    public getInitialPinnedIndex(rec) {
        const id = this.gridAPI.get_row_id(rec);
        return this._pinnedRecordIDs.indexOf(id);
    }

    /**
     * @hidden
     * @internal
     */
    public get hasPinnedRecords() {
        return this._pinnedRecordIDs.length > 0;
    }

    /**
     * @hidden
     * @internal
     */
    public get pinnedRecordsCount() {
        return this._pinnedRecordIDs.length;
    }

    /**
     * @hidden
     * @internal
     */
    public get crudService() {
        return this.gridAPI.crudService;
    }

    /**
     * @hidden
     * @internal
     */
    public _setupServices() {
        this.gridAPI.grid = this as any;
        this.crudService.grid = this as any;
        this.selectionService.grid = this as any;
        this.validation.grid = this as any;
        this.navigation.grid = this as any;
        this.filteringService.grid = this as any;
        this.summaryService.grid = this as any;
    }

    /**
     * @hidden
     * @internal
     */
    public _setupListeners() {
        const destructor = takeUntil<any>(this.destroy$);
        fromEvent(this.nativeElement, 'focusout').pipe(filter(() => !!this.navigation.activeNode), destructor).subscribe((event) => {
            if (!this.crudService.cell &&
                !!this.navigation.activeNode &&
                ((event.target === this.tbody.nativeElement && this.navigation.activeNode.row >= 0 &&
                    this.navigation.activeNode.row < this.dataView.length)
                    || (event.target === this.theadRow.nativeElement && this.navigation.activeNode.row === -1)
                    || (event.target === this.tfoot.nativeElement && this.navigation.activeNode.row === this.dataView.length)) &&
                !(this.rowEditable && this.crudService.rowEditingBlocked && this.crudService.rowInEditMode)) {
                this.navigation.lastActiveNode = this.navigation.activeNode;
                this.navigation.activeNode = {} as IActiveNode;
                this.notifyChanges();
            }
        });
        this.rowAddedNotifier.pipe(destructor).subscribe(args => this.refreshGridState(args));
        this.rowDeletedNotifier.pipe(destructor).subscribe(args => {
            this.summaryService.deleteOperation = true;
            this.summaryService.clearSummaryCache(args);
        });

        this.subscribeToTransactions();

        this.resizeNotify.pipe(
            filter(() => !this._init),
            throttleTime(0, animationFrameScheduler, { leading: true, trailing: true }),
            destructor
        )
            .subscribe(() => {
                this.zone.run(() => {
                    // do not trigger reflow if element is detached.
                    if (this.nativeElement?.isConnected) {
                        this.notifyChanges(true);
                    }
                });
            });

        this.pipeTriggerNotifier.pipe(takeUntil(this.destroy$)).subscribe(() => this.pipeTrigger++);
        this.columnMovingEnd.pipe(destructor).subscribe(() => this.crudService.endEdit(false));

        this.overlayService.opening.pipe(destructor).subscribe((event) => {
            if (this._advancedFilteringOverlayId === event.id) {
                const instance = event.componentRef.instance as IgxAdvancedFilteringDialogComponent;
                if (instance) {
                    instance.initialize(this as any, this.overlayService, event.id);
                }
            }
        });

        this.overlayService.opened.pipe(destructor).subscribe((event) => {
            const overlaySettings = this.overlayService.getOverlayById(event.id)?.settings;

            // do not hide the advanced filtering overlay on scroll
            if (this._advancedFilteringOverlayId === event.id) {
                const instance = event.componentRef.instance as IgxAdvancedFilteringDialogComponent;
                if (instance) {
                    instance.lastActiveNode = this.navigation.activeNode;
                    instance.queryBuilder.setAddButtonFocus();
                }
                return;
            }

            // do not hide the overlay if it's attached to a row
            if (this.rowEditingOverlay?.overlayId === event.id) {
                return;
            }

            if (overlaySettings?.outlet === this.outlet && this.overlayIDs.indexOf(event.id) === -1) {
                this.overlayIDs.push(event.id);
            }
        });

        this.overlayService.closed.pipe(filter(() => !this._init), destructor).subscribe((event) => {
            if (this._advancedFilteringOverlayId === event.id) {
                this.overlayService.detach(this._advancedFilteringOverlayId);
                this._advancedFilteringOverlayId = null;
                return;
            }

            const ind = this.overlayIDs.indexOf(event.id);
            if (ind !== -1) {
                this.overlayIDs.splice(ind, 1);
            }
        });

        this.verticalScrollContainer.dataChanging.pipe(filter(() => !this._init), destructor).subscribe(($event) => {
            const shouldRecalcSize = this.isPercentHeight &&
                (!this.calcHeight || this.calcHeight === this.getDataBasedBodyHeight() ||
                    this.calcHeight === this.renderedRowHeight * this._defaultTargetRecordNumber);
            if (shouldRecalcSize) {
                this.calculateGridHeight();
                $event.containerSize = this.calcHeight;
            }
            this.evaluateLoadingState();
        });

        this.verticalScrollContainer.scrollbarVisibilityChanged.pipe(filter(() => !this._init), destructor).subscribe(() => {
            // called to recalc all widths that may have changes as a result of
            // the vert. scrollbar showing/hiding
            this.notifyChanges(true);
            this.cdr.detectChanges();
        });

        this.verticalScrollContainer.contentSizeChange.pipe(filter(() => !this._init), throttleTime(30), destructor).subscribe(() => {
            this.notifyChanges(true);
        });

        this.onDensityChanged.pipe(destructor).subscribe(() => {
            this._autoSize = this.isPercentHeight && this.calcHeight !== this.getDataBasedBodyHeight();
            this.crudService.endEdit(false);
            if (this._summaryRowHeight === 0) {
                this.summaryService.summaryHeight = 0;
            }
            this.notifyChanges(true);
        });
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        super.ngOnInit();
        this._setupServices();
        this._setupListeners();
        this.rowListDiffer = this.differs.find([]).create(null);
        // compare based on field, not on object ref.
        this.columnListDiffer = this.differs.find([]).create((index, col: ColumnType) => col.field);
        this.calcWidth = this.width && this.width.indexOf('%') === -1 ? parseInt(this.width, 10) : 0;
        this.shouldGenerate = this.autoGenerate;
    }

    /**
     * @hidden
     * @internal
     */
    public resetColumnsCaches() {
        this._columns.forEach(column => column.resetCaches());
    }

    /**
     * @hidden @internal
     */
    public generateRowID(): string | number {
        const primaryColumn = this._columns.find(col => col.field === this.primaryKey);
        const idType = this.data.length ?
            this.resolveDataTypes(this.data[0][this.primaryKey]) : primaryColumn ? primaryColumn.dataType : 'string';
        return idType === 'string' ? uuidv4() : FAKE_ROW_ID--;
    }

    /**
     * @hidden
     * @internal
     */
    public resetForOfCache() {
        const firstVirtRow = this.dataRowList.first;
        if (firstVirtRow) {
            if (this._cdrRequests) {
                firstVirtRow.virtDirRow.cdr.detectChanges();
            }
            firstVirtRow.virtDirRow.assumeMaster();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public setFilteredData(data, pinned: boolean) {
        if (this.hasPinnedRecords && pinned) {
            this._filteredPinnedData = data || [];
            const filteredUnpinned = this._filteredUnpinnedData || [];
            const filteredData = [... this._filteredPinnedData, ...filteredUnpinned];
            this.filteredData = filteredData.length > 0 ? filteredData : this._filteredUnpinnedData;
        } else if (this.hasPinnedRecords && !pinned) {
            this._filteredUnpinnedData = data;
        } else {
            this.filteredData = data;
        }
    }

    /**
     * @hidden
     * @internal
     */
    public resetColumnCollections() {
        this._visibleColumns.length = 0;
        this._pinnedVisible.length = 0;
        this._unpinnedVisible.length = 0;
    }

    /**
     * @hidden
     * @internal
     */
    public resetCachedWidths() {
        this._unpinnedWidth = NaN;
        this._pinnedWidth = NaN;
        this._totalWidth = NaN;
    }

    /**
     * @hidden
     * @internal
     */
    public resetCaches(recalcFeatureWidth = true) {
        if (recalcFeatureWidth) {
            this._headerFeaturesWidth = NaN;
        }
        this.resetColumnsCaches();
        this.resetColumnCollections();
        this.resetCachedWidths();
        this.resetForOfCache();
        this.hasVisibleColumns = undefined;
        this._columnGroups = this._columns.some(col => col.columnGroup);
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        if (this.sortHeaderIconDirectiveTemplate) {
            this.sortHeaderIconTemplate = this.sortHeaderIconDirectiveTemplate;
        }

        if (this.sortAscendingHeaderIconDirectiveTemplate) {
            this.sortAscendingHeaderIconTemplate = this.sortAscendingHeaderIconDirectiveTemplate;
        }

        if (this.sortDescendingHeaderIconDirectiveTemplate) {
            this.sortDescendingHeaderIconTemplate = this.sortDescendingHeaderIconDirectiveTemplate;
        }

        this.setupColumns();
        this.toolbar.changes.pipe(filter(() => !this._init), takeUntil(this.destroy$)).subscribe(() => this.notifyChanges(true));
        this.setUpPaginator();
        this.paginationComponents.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.setUpPaginator();
        });
        if (this.actionStrip) {
            this.actionStrip.menuOverlaySettings.outlet = this.outlet;
        }
    }

    /**
     * @hidden @internal
     */
    public dataRebinding(event: IForOfDataChangingEventArgs) {
        this.dataChanging.emit(event);
    }

    /**
     * @hidden @internal
     */
    public dataRebound(event) {
        this.dataChanged.emit(event);
    }

    /** @hidden @internal */
    public createFilterDropdown(column: ColumnType, options: OverlaySettings) {
        options.outlet = this.outlet;
        if (this.excelStyleFilteringComponent) {
            this.excelStyleFilteringComponent.initialize(column, this.overlayService);
            const id = this.overlayService.attach(this.excelStyleFilteringComponent.element, options);
            this.excelStyleFilteringComponent.overlayComponentId = id;
            return { id, ref: undefined };
        }
        const ref = this.createComponentInstance(IgxGridExcelStyleFilteringComponent);
        ref.instance.initialize(column, this.overlayService);
        const id = this.overlayService.attach(ref.instance.element, options);
        ref.instance.overlayComponentId = id;
        return { ref, id };
    }

    private createComponentInstance(component: any) {
        let dynamicFactory: ComponentFactory<any>;
        const factoryResolver = this.moduleRef
            ? this.moduleRef.componentFactoryResolver
            : this.resolver;
        try {
            dynamicFactory = factoryResolver.resolveComponentFactory(component);
        } catch (error) {
            console.error(error);
            return null;
        }

        const injector = this.moduleRef
            ? this.moduleRef.injector
            : this.injector;
        const dynamicComponent: ComponentRef<any> = dynamicFactory.create(
            injector
        );
        this.appRef.attachView(dynamicComponent.hostView);

        return dynamicComponent;
    }

    /** @hidden @internal */
    public setUpPaginator() {
        if (this.paginator) {
            if (this._rendered) {
                // D.P.: update existing pipe pagingState if none was set
                this.pipeTrigger++;
                this.cdr.markForCheck();
            }
            this.paginator.pageChange.pipe(takeWhile(() => !!this.paginator), filter(() => !this._init))
                .subscribe((page: number) => {
                    this.pageChange.emit(page);
                });
            this.paginator.pagingDone.pipe(takeWhile(() => !!this.paginator), filter(() => !this._init))
                .subscribe((args: IPageEventArgs) => {
                    this.selectionService.clear(true);
                    this.pagingDone.emit({ previous: args.previous, current: args.current });
                    this.crudService.endEdit(false);
                    this.pipeTrigger++;
                    this.navigateTo(0);
                    this.notifyChanges();
                });
            this.paginator.perPageChange.pipe(takeWhile(() => !!this.paginator), filter(() => !this._init))
                .subscribe((perPage: number) => {
                    this.selectionService.clear(true);
                    this.perPageChange.emit(perPage);
                    this.paginator.page = 0;
                    this.crudService.endEdit(false);
                    this.notifyChanges();
                });
        } else {
            this.markForCheck();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public setFilteredSortedData(data, pinned: boolean) {
        data = data || [];
        if (this.pinnedRecordsCount > 0) {
            if (pinned) {
                this._filteredSortedPinnedData = data;
                this.pinnedRecords = data;
                this._filteredSortedData = this.isRowPinningToTop ? [... this._filteredSortedPinnedData, ... this._filteredSortedUnpinnedData] :
                    [... this._filteredSortedUnpinnedData, ... this._filteredSortedPinnedData];
                this.refreshSearch(true, false);
            } else {
                this._filteredSortedUnpinnedData = data;
            }
        } else {
            this._filteredSortedData = data;
            this.refreshSearch(true, false);
        }
        this.buildDataView(data);
    }

    /**
     * @hidden @internal
     */
    public resetHorizontalVirtualization() {
        const elementFilter = (item: IgxRowDirective | IgxSummaryRowComponent) => this.isDefined(item.nativeElement.parentElement);
        this._horizontalForOfs = [
            ...this._dataRowList.filter(elementFilter).map(item => item.virtDirRow),
            ...this._summaryRowList.filter(elementFilter).map(item => item.virtDirRow)
        ];
    }

    /**
     * @hidden @internal
     */
    public _setupRowObservers() {
        const elementFilter = (item: IgxRowDirective | IgxSummaryRowComponent) => this.isDefined(item.nativeElement.parentElement);
        const extractForOfs = pipe(map((collection: any[]) => collection.filter(elementFilter).map(item => item.virtDirRow)));
        const rowListObserver = extractForOfs(this._dataRowList.changes);
        const summaryRowObserver = extractForOfs(this._summaryRowList.changes);
        rowListObserver.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.resetHorizontalVirtualization();
        });
        summaryRowObserver.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.resetHorizontalVirtualization();
        });
        this.resetHorizontalVirtualization();
    }

    /**
     * @hidden @internal
     */
    public _zoneBegoneListeners() {
        this.zone.runOutsideAngular(() => {
            this.verticalScrollContainer.getScroll().addEventListener('scroll', this.verticalScrollHandler.bind(this));
            this.headerContainer?.getScroll().addEventListener('scroll', this.horizontalScrollHandler.bind(this));
            if (this.hasColumnsToAutosize) {
                this.headerContainer?.dataChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
                    this.cdr.detectChanges();
                    this.zone.onStable.pipe(first()).subscribe(() => {
                        this.autoSizeColumnsInView();
                    });
                });
            }
            fromEvent(window, 'resize').pipe(takeUntil(this.destroy$)).subscribe(() => this.resizeNotify.next());
            resizeObservable(this.nativeElement).pipe(takeUntil(this.destroy$)).subscribe(() => this.resizeNotify.next());
        });
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this.initPinning();
        this.calculateGridSizes();
        this._init = false;
        this.cdr.reattach();
        this._setupRowObservers();
        this._zoneBegoneListeners();

        const vertScrDC = this.verticalScrollContainer.displayContainer;
        vertScrDC.addEventListener('scroll', this.preventContainerScroll.bind(this));

        this._pinnedRowList.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe((change: QueryList<IgxGridRowComponent>) => {
                this.onPinnedRowsChanged(change);
            });

        this.addRowSnackbar?.clicked.subscribe(() => {
            const rec = this.filteredSortedData[this.lastAddedRowIndex];
            this.scrollTo(rec, 0);
            this.addRowSnackbar.close();
        });

        // Keep the stream open for future subscribers
        this.rendered$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.paginator) {
                this.paginator.perPage = this._perPage !== DEFAULT_ITEMS_PER_PAGE ? this._perPage : this.paginator.perPage;
                this.paginator.totalRecords = this.totalRecords ? this.totalRecords : this.paginator.totalRecords;
                this.paginator.overlaySettings = { outlet: this.outlet };
            }
            if (this.hasColumnsToAutosize) {
                this.autoSizeColumnsInView();
            }
            this._rendered = true;
        });
        Promise.resolve().then(() => this.rendered.next(true));
    }

    /**
     * @hidden @internal
     */
    public notifyChanges(repaint = false) {
        this._cdrRequests = true;
        this._cdrRequestRepaint = repaint;
        this.cdr.markForCheck();
    }

    /**
     * @hidden @internal
     */
    public ngDoCheck() {
        super.ngDoCheck();
        if (this._init) {
            return;
        }

        if (this._cdrRequestRepaint) {
            this.resetNotifyChanges();
            this.calculateGridSizes();
            this.refreshSearch(true);
            return;
        }

        if (this._cdrRequests) {
            this.resetNotifyChanges();
            this.cdr.detectChanges();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public getDragGhostCustomTemplate() {

        return this.dragGhostCustomTemplate;
    }

    /**
     * @hidden @internal
     */
    public ngOnDestroy() {
        this.tmpOutlets.forEach((tmplOutlet) => {
            tmplOutlet.cleanCache();
        });

        this.destroy$.next(true);
        this.destroy$.complete();
        this.transactionChange$.next();
        this.transactionChange$.complete();
        this._destroyed = true;

        if (this._advancedFilteringOverlayId) {
            this.overlayService.detach(this._advancedFilteringOverlayId);
            delete this._advancedFilteringOverlayId;
        }

        this.overlayIDs.forEach(overlayID => {
            const overlay = this.overlayService.getOverlayById(overlayID);

            if (overlay && !overlay.detached) {
                this.overlayService.detach(overlayID);
            }
        });

        this.zone.runOutsideAngular(() => {
            this.verticalScrollContainer?.getScroll()?.removeEventListener('scroll', this.verticalScrollHandler);
            this.headerContainer?.getScroll()?.removeEventListener('scroll', this.horizontalScrollHandler);
            const vertScrDC = this.verticalScrollContainer?.displayContainer;
            vertScrDC?.removeEventListener('scroll', this.preventContainerScroll);
        });
    }

    /**
     * Toggles the specified column's visibility.
     *
     * @example
     * ```typescript
     * this.grid1.toggleColumnVisibility({
     *       column: this.grid1.columns[0],
     *       newValue: true
     * });
     * ```
     */
    public toggleColumnVisibility(args: IColumnVisibilityChangedEventArgs) {
        const col = args.column ? this._columns.find((c) => c === args.column) : undefined;

        if (!col) {
            return;
        }
        col.toggleVisibility(args.newValue);
    }

    /**
     * Gets/Sets a list of key-value pairs [row ID, expansion state].
     *
     * @remarks
     * Includes only states that differ from the default one.
     * Supports two-way binding.
     * @example
     * ```html
     * <igx-grid #grid [data]="data" [(expansionStates)]="model.expansionStates">
     * </igx-grid>
     * ```
     */
    @Input()
    public get expansionStates() {
        return this._expansionStates;
    }

    public set expansionStates(value) {
        this._expansionStates = new Map<any, boolean>(value);
        this.expansionStatesChange.emit(this._expansionStates);
        this.notifyChanges(true);
        if (this.gridAPI.grid) {
            this.cdr.detectChanges();
        }
    }

    /**
     * Expands all rows.
     *
     * @example
     * ```typescript
     * this.grid.expandAll();
     * ```
     */
    public expandAll() {
        this._defaultExpandState = true;
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * Collapses all rows.
     *
     * @example
     * ```typescript
     * this.grid.collapseAll();
     * ```
     */
    public collapseAll() {
        this._defaultExpandState = false;
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * Expands the row by its id.
     *
     * @remarks
     * ID is either the primaryKey value or the data record instance.
     * @example
     * ```typescript
     * this.grid.expandRow(rowID);
     * ```
     * @param rowID The row id - primaryKey value or the data record instance.
     */
    public expandRow(rowID: any) {
        this.gridAPI.set_row_expansion_state(rowID, true);
    }

    /**
     * Collapses the row by its id.
     *
     * @remarks
     * ID is either the primaryKey value or the data record instance.
     * @example
     * ```typescript
     * this.grid.collapseRow(rowID);
     * ```
     * @param rowID The row id - primaryKey value or the data record instance.
     */
    public collapseRow(rowID: any) {
        this.gridAPI.set_row_expansion_state(rowID, false);
    }


    /**
     * Toggles the row by its id.
     *
     * @remarks
     * ID is either the primaryKey value or the data record instance.
     * @example
     * ```typescript
     * this.grid.toggleRow(rowID);
     * ```
     * @param rowID The row id - primaryKey value or the data record instance.
     */
    public toggleRow(rowID: any) {
        const rec = this.gridAPI.get_rec_by_id(rowID);
        const state = this.gridAPI.get_row_expansion_state(rec);
        this.gridAPI.set_row_expansion_state(rowID, !state);
    }

    /**
     * @hidden
     * @internal
     */
    public getDefaultExpandState(_rec: any) {
        return this._defaultExpandState;
    }

    /**
     * Gets the native element.
     *
     * @example
     * ```typescript
     * const nativeEl = this.grid.nativeElement.
     * ```
     */
    public get nativeElement() {
        return this.elementRef.nativeElement;
    }

    /**
     * Gets/Sets the outlet used to attach the grid's overlays to.
     *
     * @remark
     * If set, returns the outlet defined outside the grid. Otherwise returns the grid's internal outlet directive.
     */
    @Input()
    public get outlet() {
        return this.resolveOutlet();
    }

    public set outlet(val: IgxOverlayOutletDirective) {
        this._userOutletDirective = val;
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
        switch (this.displayDensity) {
            case DisplayDensity.cosy:
                return 40;
            case DisplayDensity.compact:
                return 32;
            default:
                return 50;
        }
    }

    /**
     * @hidden @internal
     */
    public get defaultSummaryHeight(): number {
        switch (this.displayDensity) {
            case DisplayDensity.cosy:
                return 30;
            case DisplayDensity.compact:
                return 24;
            default:
                return 36;
        }
    }

    /**
     * Returns the `IgxGridHeaderGroupComponent`'s minimum allowed width.
     *
     * @remarks
     * Used internally for restricting header group component width.
     * The values below depend on the header cell default right/left padding values.
     */
    public get defaultHeaderGroupMinWidth(): number {
        switch (this.displayDensity) {
            case DisplayDensity.cosy:
                return 32;
            case DisplayDensity.compact:
                return 24;
            default:
                return 48;
        }
    }

    /**
     * Gets the current width of the container for the pinned `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const pinnedWidth = this.grid.getPinnedWidth;
     * ```
     */
    public get pinnedWidth() {
        if (!isNaN(this._pinnedWidth)) {
            return this._pinnedWidth;
        }
        this._pinnedWidth = this.getPinnedWidth();
        return this._pinnedWidth;
    }

    /**
     * Gets the current width of the container for the unpinned `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const unpinnedWidth = this.grid.getUnpinnedWidth;
     * ```
     */
    public get unpinnedWidth() {
        if (!isNaN(this._unpinnedWidth)) {
            return this._unpinnedWidth;
        }
        this._unpinnedWidth = this.getUnpinnedWidth();
        return this._unpinnedWidth;
    }

    /**
     * @hidden @internal
     */
    public get isHorizontalScrollHidden() {
        const diff = this.unpinnedWidth - this.totalWidth;
        return this.width === null || diff >= 0;
    }

    /**
     * @hidden @internal
     * Gets the header cell inner width for auto-sizing.
     */
    public getHeaderCellWidth(element: HTMLElement): ISizeInfo {
        const range = this.document.createRange();
        const headerWidth = this.platform.getNodeSizeViaRange(range,
            element,
            element.parentElement);

        const headerStyle = this.document.defaultView.getComputedStyle(element);
        const headerPadding = parseFloat(headerStyle.paddingLeft) + parseFloat(headerStyle.paddingRight) +
            parseFloat(headerStyle.borderRightWidth);

        // Take into consideration the header group element, since column pinning applies borders to it if its not a columnGroup.
        const headerGroupStyle = this.document.defaultView.getComputedStyle(element.parentElement);
        const borderSize = parseFloat(headerGroupStyle.borderRightWidth) + parseFloat(headerGroupStyle.borderLeftWidth);
        return { width: Math.ceil(headerWidth), padding: Math.ceil(headerPadding + borderSize) };
    }

    /**
     * @hidden @internal
     * Gets the combined width of the columns that are specific to the enabled grid features. They are fixed.
     */
    public featureColumnsWidth(expander?: ElementRef) {
        if (Number.isNaN(this._headerFeaturesWidth)) {
            // TODO: platformUtil.isBrowser check
            const rowSelectArea = this.headerSelectorContainer?.nativeElement?.getBoundingClientRect ?
                this.headerSelectorContainer.nativeElement.getBoundingClientRect().width : 0;
            const rowDragArea = this.rowDraggable && this.headerDragContainer?.nativeElement?.getBoundingClientRect ?
                this.headerDragContainer.nativeElement.getBoundingClientRect().width : 0;
            const groupableArea = this.headerGroupContainer?.nativeElement?.getBoundingClientRect ?
                this.headerGroupContainer.nativeElement.getBoundingClientRect().width : 0;
            const expanderWidth = expander?.nativeElement?.getBoundingClientRect ? expander.nativeElement.getBoundingClientRect().width : 0;
            this._headerFeaturesWidth = rowSelectArea + rowDragArea + groupableArea + expanderWidth;
        }
        return this._headerFeaturesWidth;
    }

    /**
     * @hidden @internal
     */
    public get summariesMargin() {
        return this.featureColumnsWidth();
    }

    /**
     * Gets an array of `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const colums = this.grid.columns.
     * ```
     */
    public get columns(): IgxColumnComponent[] {
        return this._columns || [];
    }

    @Input()
    public set columns(config: IgxColumn[]) {
        this._columnConfig = config;
        if (this._rendered) {
            this.configToColumns(config);
            this.onColumnsChanged(this.columnList);
        }
    }

    /**
     * Gets an array of the pinned `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const pinnedColumns = this.grid.pinnedColumns.
     * ```
     */
    public get pinnedColumns(): IgxColumnComponent[] {
        if (this._pinnedVisible.length) {
            return this._pinnedVisible;
        }
        this._pinnedVisible = this._pinnedColumns.filter(col => !col.hidden);
        return this._pinnedVisible;
    }

    /**
     * Gets an array of the pinned `IgxRowComponent`s.
     *
     * @example
     * ```typescript
     * const pinnedRow = this.grid.pinnedRows;
     * ```
     */
    public get pinnedRows(): IgxGridRowComponent[] {
        return this._pinnedRowList.toArray().sort((a, b) => a.index - b.index);
    }

    /**
     * Gets an array of unpinned `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const unpinnedColumns = this.grid.unpinnedColumns.
     * ```
     */
    public get unpinnedColumns(): IgxColumnComponent[] {
        if (this._unpinnedVisible.length) {
            return this._unpinnedVisible;
        }
        this._unpinnedVisible = this._unpinnedColumns.filter((col) => !col.hidden);
        return this._unpinnedVisible;
    }

    /**
     * Gets the `width` to be set on `IgxGridHeaderGroupComponent`.
     */
    public getHeaderGroupWidth(column: IgxColumnComponent): string {
        return this.hasColumnLayouts
            ? ''
            : `${Math.max(parseFloat(column.calcWidth), this.defaultHeaderGroupMinWidth)}px`;
    }

    /**
     * Returns the `IgxColumnComponent` by field name.
     *
     * @example
     * ```typescript
     * const myCol = this.grid1.getColumnByName("ID");
     * ```
     * @param name
     */
    public getColumnByName(name: string): IgxColumnComponent {
        return this._columns.find((col) => col.field === name);
    }

    public getColumnByVisibleIndex(index: number): IgxColumnComponent {
        return this.visibleColumns.find((col) =>
            !col.columnGroup && !col.columnLayout &&
            col.visibleIndex === index
        );
    }

    /**
     * Returns an array of visible `IgxColumnComponent`s.
     *
     * @example
     * ```typescript
     * const visibleColumns = this.grid.visibleColumns.
     * ```
     */
    public get visibleColumns(): IgxColumnComponent[] {
        if (this._visibleColumns.length) {
            return this._visibleColumns;
        }
        this._visibleColumns = this._columns.filter(c => !c.hidden);
        return this._visibleColumns;
    }

    /**
     * @deprecated in version 12.1.0. Use the corresponding property exposed by the `igx-paginator`
     *
     * Gets the total number of pages.
     *
     *
     * @example
     * ```typescript
     * const totalPages = this.grid.totalPages;
     * ```
     */
    public get totalPages(): number {
        return this.paginator?.totalPages;
    }

    /**
     * @deprecated in version 12.1.0. Use the corresponding property exposed by the `igx-paginator`
     *
     * Gets if the current page is the first page.
     *
     *
     * @example
     * ```typescript
     * const firstPage = this.grid.isFirstPage;
     * ```
     */
    public get isFirstPage(): boolean {
        return this.paginator?.isLastPage;
    }

    /**
     * @deprecated in version 12.1.0. Use the corresponding method exposed by the `igx-paginator`
     *
     * Goes to the next page, if the grid is not already at the last page.
     *
     *
     * @example
     * ```typescript
     * this.grid1.nextPage();
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public nextPage(): void {
        this.paginator?.nextPage();
    }

    /**
     * @deprecated in version 12.1.0. Use the corresponding method exposed by the `igx-paginator`
     *
     * Goes to the previous page, if the grid is not already at the first page.
     *
     * @example
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public previousPage(): void {
        this.paginator?.previousPage();
    }

    /**
     * Returns the total number of records.
     *
     * @remarks
     * Only functions when paging is enabled.
     * @example
     * ```typescript
     * const totalRecords = this.grid.totalRecords;
     * ```
     */
    @Input()
    public get totalRecords(): number {
        return this._totalRecords >= 0 ? this._totalRecords : this.pagingState?.metadata.countRecords;
    }

    public set totalRecords(total: number) {
        if (total >= 0) {
            if (this.paginator) {
                this.paginator.totalRecords = total;
            }
            this._totalRecords = total;
            this.pipeTrigger++;
            this.notifyChanges();
        }
    }

    /**
     * @deprecated in version 12.1.0. Use the corresponding property exposed by the `igx-paginator`
     *
     * Returns if the current page is the last page.
     *
     *
     * @example
     * ```typescript
     * const lastPage = this.grid.isLastPage;
     * ```
     */
    public get isLastPage(): boolean {
        return this.paginator.isLastPage;
    }

    /**
     * Returns the total width of the `IgxGridComponent`.
     *
     * @example
     * ```typescript
     * const gridWidth = this.grid.totalWidth;
     * ```
     */
    public get totalWidth(): number {
        if (!isNaN(this._totalWidth)) {
            return this._totalWidth;
        }
        // Take only top level columns
        const cols = this.visibleColumns.filter(col => col.level === 0 && !col.pinned);
        let totalWidth = 0;
        let i = 0;
        for (i; i < cols.length; i++) {
            totalWidth += parseInt(cols[i].calcWidth, 10) || 0;
        }
        this._totalWidth = totalWidth;
        return totalWidth;
    }

    /**
     * @hidden
     * @internal
     */
    public get showRowSelectors(): boolean {
        return this.isRowSelectable && this.hasVisibleColumns && !this.hideRowSelectors;
    }

    /**
     * @hidden
     * @internal
     */
    public get showAddButton() {
        return this.rowEditable && this.dataView.length === 0 && this._columns.length > 0;
    }

    /**
     * @hidden
     * @internal
     */
    public get showDragIcons(): boolean {
        return this.rowDraggable && this._columns.length > this.hiddenColumnsCount;
    }

    /**
     * @hidden
     * @internal
     */
    protected _getDataViewIndex(index: number): number {
        let newIndex = index;
        if ((index < 0 || index >= this.dataView.length) && this.pagingMode === 1 && this.page !== 0) {
            newIndex = index - this.perPage * this.page;
        } else if (this.gridAPI.grid.verticalScrollContainer.isRemote) {
            newIndex = index - this.gridAPI.grid.virtualizationState.startIndex;
        }
        return newIndex;
    }

    /**
     * @hidden
     * @internal
     */
    protected getDataIndex(dataViewIndex: number): number {
        let newIndex = dataViewIndex;
        if (this.gridAPI.grid.verticalScrollContainer.isRemote) {
            newIndex = dataViewIndex + this.gridAPI.grid.virtualizationState.startIndex;
        }
        return newIndex;
    }

    /**
     * Places a column before or after the specified target column.
     *
     * @example
     * ```typescript
     * grid.moveColumn(column, target);
     * ```
     */
    public moveColumn(column: IgxColumnComponent, target: IgxColumnComponent, pos: DropPosition = DropPosition.AfterDropTarget) {
        // M.A. May 11th, 2021 #9508 Make the event cancelable
        const eventArgs: IColumnMovingEndEventArgs = { source: column, target, cancel: false };

        this.columnMovingEnd.emit(eventArgs);

        if (eventArgs.cancel) {
            return;
        }

        if (column === target || (column.level !== target.level) ||
            (column.topLevelParent !== target.topLevelParent)) {
            return;
        }

        if (column.level) {
            this._moveChildColumns(column.parent, column, target, pos);
        }

        let columnPinStateChanged;
        // pinning and unpinning will work correctly even without passing index
        // but is easier to calclulate the index here, and later use it in the pinning event args
        if (target.pinned && !column.pinned) {
            const pinnedIndex = this._pinnedColumns.indexOf(target);
            const index = pos === DropPosition.AfterDropTarget ? pinnedIndex + 1 : pinnedIndex;
            columnPinStateChanged = column.pin(index);
        }

        if (!target.pinned && column.pinned) {
            const unpinnedIndex = this._unpinnedColumns.indexOf(target);
            const index = pos === DropPosition.AfterDropTarget ? unpinnedIndex + 1 : unpinnedIndex;
            columnPinStateChanged = column.unpin(index);
        }

        // if (target.pinned && column.pinned && !columnPinStateChanged) {
        //     this._reorderColumns(column, target, pos, this._pinnedColumns);
        // }

        // if (!target.pinned && !column.pinned && !columnPinStateChanged) {
        //     this._reorderColumns(column, target, pos, this._unpinnedColumns);
        // }

        this._moveColumns(column, target, pos);
        this._columnsReordered(column);
    }

    /**
     * @deprecated in version 12.1.0. Use the corresponding method exposed by the `igx-paginator`
     *
     * Goes to the desired page index.
     *
     *
     * @example
     * ```typescript
     * this.grid1.paginate(1);
     * ```
     * @param val
     */
    public paginate(val: number): void {
        this.paginator?.paginate(val);
    }

    /**
     * Triggers change detection for the `IgxGridComponent`.
     * Calling markForCheck also triggers the grid pipes explicitly, resulting in all updates being processed.
     * May degrade performance if used when not needed, or if misused:
     * ```typescript
     * // DON'Ts:
     * // don't call markForCheck from inside a loop
     * // don't call markForCheck when a primitive has changed
     * grid.data.forEach(rec => {
     *  rec = newValue;
     *  grid.markForCheck();
     * });
     *
     * // DOs
     * // call markForCheck after updating a nested property
     * grid.data.forEach(rec => {
     *  rec.nestedProp1.nestedProp2 = newValue;
     * });
     * grid.markForCheck();
     * ```
     *
     * @example
     * ```typescript
     * grid.markForCheck();
     * ```
     */
    public markForCheck() {
        this.pipeTrigger++;
        this.cdr.detectChanges();
    }

    /**
     * Creates a new `IgxGridRowComponent` and adds the data record to the end of the data source.
     *
     * @example
     * ```typescript
     * this.grid1.addRow(record);
     * ```
     * @param data
     */
    public addRow(data: any): void {
        // commit pending states prior to adding a row
        this.crudService.endEdit(true);
        this.gridAPI.addRowToData(data);

        this.rowAddedNotifier.next({ data: data, owner: this });
        this.pipeTrigger++;
        this.notifyChanges();
    }

    /**
     * Removes the `IgxGridRowComponent` and the corresponding data record by primary key.
     *
     * @remarks
     * Requires that the `primaryKey` property is set.
     * The method accept rowSelector as a parameter, which is the rowID.
     * @example
     * ```typescript
     * this.grid1.deleteRow(0);
     * ```
     * @param rowSelector
     */
    public deleteRow(rowSelector: any): any {
        if (this.primaryKey !== undefined && this.primaryKey !== null) {
            return this.deleteRowById(rowSelector);
        }
    }

    /** @hidden */
    public deleteRowById(rowId: any): any {
        const args = {
            rowID: rowId,
            cancel: false,
            rowData: this.getRowData(rowId),
            oldValue: null,
            owner: this
        };
        this.rowDelete.emit(args);
        if (args.cancel) {
            return;
        }

        const record = this.gridAPI.deleteRowById(rowId);
        if (record !== null && record !== undefined) {
            this.rowDeleted.emit({ data: record, owner: this });
        }
        return record;
    }

    /**
     * Updates the `IgxGridRowComponent` and the corresponding data record by primary key.
     *
     * @remarks
     * Requires that the `primaryKey` property is set.
     * @example
     * ```typescript
     * this.gridWithPK.updateCell('Updated', 1, 'ProductName');
     * ```
     * @param value the new value which is to be set.
     * @param rowSelector corresponds to rowID.
     * @param column corresponds to column field.
     */
    public updateCell(value: any, rowSelector: any, column: string): void {
        if (this.isDefined(this.primaryKey)) {
            const col = this._columns.find(c => c.field === column);
            if (col) {
                // Simplify
                const rowData = this.gridAPI.getRowData(rowSelector);
                const index = this.gridAPI.get_row_index_in_data(rowSelector);
                // If row passed is invalid
                if (index < 0) {
                    return;
                }

                const id = {
                    rowID: rowSelector,
                    columnID: col.index,
                    rowIndex: index
                };

                const cell = new IgxCell(id, index, col, rowData[col.field], value, rowData, this as any);
                const formControl = this.validation.getFormControl(cell.id.rowID, cell.column.field);
                formControl.setValue(value);
                this.gridAPI.update_cell(cell);
                this.cdr.detectChanges();
            }
        }
    }

    /**
     * Updates the `IgxGridRowComponent`
     *
     * @remarks
     * The row is specified by
     * rowSelector parameter and the data source record with the passed value.
     * This method will apply requested update only if primary key is specified in the grid.
     * @example
     * ```typescript
     * grid.updateRow({
     *       ProductID: 1, ProductName: 'Spearmint', InStock: true, UnitsInStock: 1, OrderDate: new Date('2005-03-21')
     *   }, 1);
     * ```
     * @param value–
     * @param rowSelector correspond to rowID
     */
    // TODO: prevent event invocation
    public updateRow(value: any, rowSelector: any): void {
        if (this.isDefined(this.primaryKey)) {
            const editableCell = this.crudService.cell;
            if (editableCell && editableCell.id.rowID === rowSelector) {
                this.crudService.endCellEdit();
            }
            const row = new IgxEditRow(rowSelector, -1, this.gridAPI.getRowData(rowSelector), this as any);
            this.gridAPI.update_row(row, value);

            // TODO: fix for #5934 and probably break for #5763
            // consider adding of third optional boolean parameter in updateRow.
            // If developer set this parameter to true we should call notifyChanges(true), and
            // vise-versa if developer set it to false we should call notifyChanges(false).
            // The parameter should default to false
            this.notifyChanges();
        }
    }

    /**
     * Returns the data that is contained in the row component.
     *
     * @remarks
     * If the primary key is not specified the row selector match the row data.
     * @example
     * ```typescript
     * const data = grid.getRowData(94741);
     * ```
     * @param rowSelector correspond to rowID
     */
    public getRowData(rowSelector: any) {
        if (!this.primaryKey) {
            return rowSelector;
        }
        const data = this.gridAPI.get_all_data(this.transactions.enabled);
        const index = this.gridAPI.get_row_index_in_data(rowSelector);
        return index < 0 ? {} : data[index];
    }

    /**
     * Sort a single `IgxColumnComponent`.
     *
     * @remarks
     * Sort the `IgxGridComponent`'s `IgxColumnComponent` based on the provided array of sorting expressions.
     * @example
     * ```typescript
     * this.grid.sort({ fieldName: name, dir: SortingDirection.Asc, ignoreCase: false });
     * ```
     */
    public sort(expression: ISortingExpression | Array<ISortingExpression>): void {
        const sortingState = cloneArray(this.sortingExpressions);

        if (expression instanceof Array) {
            for (const each of expression) {
                this.gridAPI.prepare_sorting_expression([sortingState], each);
            }
        } else {
            if (this._sortingOptions.mode === 'single') {
                this._columns.forEach((col) => {
                    if (!(col.field === expression.fieldName)) {
                        this.clearSort(col.field);
                    }
                });
            }
            this.gridAPI.prepare_sorting_expression([sortingState], expression);
        }

        const eventArgs: ISortingEventArgs = { owner: this, sortingExpressions: sortingState, cancel: false };
        this.sorting.emit(eventArgs);

        if (eventArgs.cancel) {
            return;
        }

        this.crudService.endEdit(false);
        if (expression instanceof Array) {
            this.gridAPI.sort_multiple(expression);
        } else {
            this.gridAPI.sort(expression);
        }
        requestAnimationFrame(() => this.sortingDone.emit(expression));
    }

    /**
     * Filters a single `IgxColumnComponent`.
     *
     * @example
     * ```typescript
     * public filter(term) {
     *      this.grid.filter("ProductName", term, IgxStringFilteringOperand.instance().condition("contains"));
     * }
     * ```
     * @param name
     * @param value
     * @param conditionOrExpressionTree
     * @param ignoreCase
     */
    public filter(name: string, value: any, conditionOrExpressionTree?: IFilteringOperation | IFilteringExpressionsTree,
        ignoreCase?: boolean) {
        this.filteringService.filter(name, value, conditionOrExpressionTree, ignoreCase);
    }

    /**
     * Filters all the `IgxColumnComponent` in the `IgxGridComponent` with the same condition.
     *
     * @example
     * ```typescript
     * grid.filterGlobal('some', IgxStringFilteringOperand.instance().condition('contains'));
     * ```
     * @param value
     * @param condition
     * @param ignoreCase
     */
    public filterGlobal(value: any, condition, ignoreCase?) {
        this.filteringService.filterGlobal(value, condition, ignoreCase);
    }

    /**
     * Enables summaries for the specified column and applies your customSummary.
     *
     * @remarks
     * If you do not provide the customSummary, then the default summary for the column data type will be applied.
     * @example
     * ```typescript
     * grid.enableSummaries([{ fieldName: 'ProductName' }, { fieldName: 'ID' }]);
     * ```
     * Enable summaries for the listed columns.
     * @example
     * ```typescript
     * grid.enableSummaries('ProductName');
     * ```
     * @param rest
     */
    public enableSummaries(...rest) {
        if (rest.length === 1 && Array.isArray(rest[0])) {
            this._multipleSummaries(rest[0], true);
        } else {
            this._summaries(rest[0], true, rest[1]);
        }
    }

    /**
     * Disable summaries for the specified column.
     *
     * @example
     * ```typescript
     * grid.disableSummaries('ProductName');
     * ```
     * @remarks
     * Disable summaries for the listed columns.
     * @example
     * ```typescript
     * grid.disableSummaries([{ fieldName: 'ProductName' }]);
     * ```
     */
    public disableSummaries(...rest) {
        if (rest.length === 1 && Array.isArray(rest[0])) {
            this._disableMultipleSummaries(rest[0]);
        } else {
            this._summaries(rest[0], false);
        }
    }

    /**
     * If name is provided, clears the filtering state of the corresponding `IgxColumnComponent`.
     *
     * @remarks
     * Otherwise clears the filtering state of all `IgxColumnComponent`s.
     * @example
     * ```typescript
     * this.grid.clearFilter();
     * ```
     * @param name
     */
    public clearFilter(name?: string) {
        this.filteringService.clearFilter(name);
    }

    /**
     * If name is provided, clears the sorting state of the corresponding `IgxColumnComponent`.
     *
     * @remarks
     * otherwise clears the sorting state of all `IgxColumnComponent`.
     * @example
     * ```typescript
     * this.grid.clearSort();
     * ```
     * @param name
     */
    public clearSort(name?: string) {
        if (!name) {
            this.sortingExpressions = [];
            return;
        }
        if (!this.gridAPI.get_column_by_name(name)) {
            return;
        }
        this.gridAPI.clear_sort(name);
    }

    /**
     * @hidden @internal
     */
    public refreshGridState(_args?) {
        this.crudService.endEdit(true);
        this.selectionService.clearHeaderCBState();
        this.summaryService.clearSummaryCache();
        this.cdr.detectChanges();
    }

    // TODO: We have return values here. Move them to event args ??

    /**
     * Pins a column by field name.
     *
     * @remarks
     * Returns whether the operation is successful.
     * @example
     * ```typescript
     * this.grid.pinColumn("ID");
     * ```
     * @param columnName
     * @param index
     */
    public pinColumn(columnName: string | IgxColumnComponent, index?): boolean {
        const col = columnName instanceof IgxColumnComponent ? columnName : this.getColumnByName(columnName);
        return col.pin(index);
    }

    /**
     * Unpins a column by field name. Returns whether the operation is successful.
     *
     * @example
     * ```typescript
     * this.grid.pinColumn("ID");
     * ```
     * @param columnName
     * @param index
     */
    public unpinColumn(columnName: string | IgxColumnComponent, index?): boolean {
        const col = columnName instanceof IgxColumnComponent ? columnName : this.getColumnByName(columnName);
        return col.unpin(index);
    }

    /**
     * Pin the row by its id.
     *
     * @remarks
     * ID is either the primaryKey value or the data record instance.
     * @example
     * ```typescript
     * this.grid.pinRow(rowID);
     * ```
     * @param rowID The row id - primaryKey value or the data record instance.
     * @param index The index at which to insert the row in the pinned collection.
     */
    public pinRow(rowID: any, index?: number, row?: RowType): boolean {
        if (this._pinnedRecordIDs.indexOf(rowID) !== -1) {
            return false;
        }

        const eventArgs: IPinRowEventArgs = {
            insertAtIndex: index,
            isPinned: true,
            rowID,
            row,
            cancel: false
        };
        this.rowPinning.emit(eventArgs);

        if (eventArgs.cancel) {
            return;
        }

        this.crudService.endEdit(false);

        const insertIndex = typeof eventArgs.insertAtIndex === 'number' ? eventArgs.insertAtIndex : this._pinnedRecordIDs.length;
        this._pinnedRecordIDs.splice(insertIndex, 0, rowID);
        this.pipeTrigger++;
        if (this.gridAPI.grid) {
            this.cdr.detectChanges();
            this.rowPinned.emit(eventArgs);
        }

        return true;
    }

    /**
     * Unpin the row by its id.
     *
     * @remarks
     * ID is either the primaryKey value or the data record instance.
     * @example
     * ```typescript
     * this.grid.unpinRow(rowID);
     * ```
     * @param rowID The row id - primaryKey value or the data record instance.
     */
    public unpinRow(rowID: any, row?: RowType): boolean {
        const index = this._pinnedRecordIDs.indexOf(rowID);
        if (index === -1) {
            return false;
        }
        const eventArgs: IPinRowEventArgs = {
            isPinned: false,
            rowID,
            row,
            cancel: false
        };
        this.rowPinning.emit(eventArgs);

        if (eventArgs.cancel) {
            return;
        }

        this.crudService.endEdit(false);
        this._pinnedRecordIDs.splice(index, 1);
        this.pipeTrigger++;
        if (this.gridAPI.grid) {
            this.cdr.detectChanges();
            this.rowPinned.emit(eventArgs);
        }

        return true;
    }

    public get pinnedRowHeight() {
        const containerHeight = this.pinContainer ? this.pinContainer.nativeElement.offsetHeight : 0;
        return this.hasPinnedRecords ? containerHeight : 0;
    }

    public get totalHeight() {
        return this.calcHeight ? this.calcHeight + this.pinnedRowHeight : this.calcHeight;
    }

    /**
     * Recalculates grid width/height dimensions.
     *
     * @remarks
     * Should be run when changing DOM elements dimentions manually that affect the grid's size.
     * @example
     * ```typescript
     * this.grid.reflow();
     * ```
     */
    public reflow() {
        this.calculateGridSizes();
    }

    /**
     * Finds the next occurrence of a given string in the grid and scrolls to the cell if it isn't visible.
     *
     * @remarks
     * Returns how many times the grid contains the string.
     * @example
     * ```typescript
     * this.grid.findNext("financial");
     * ```
     * @param text the string to search.
     * @param caseSensitive optionally, if the search should be case sensitive (defaults to false).
     * @param exactMatch optionally, if the text should match the entire value  (defaults to false).
     */
    public findNext(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return this.find(text, 1, caseSensitive, exactMatch);
    }

    /**
     * Finds the previous occurrence of a given string in the grid and scrolls to the cell if it isn't visible.
     *
     * @remarks
     * Returns how many times the grid contains the string.
     * @example
     * ```typescript
     * this.grid.findPrev("financial");
     * ```
     * @param text the string to search.
     * @param caseSensitive optionally, if the search should be case sensitive (defaults to false).
     * @param exactMatch optionally, if the text should match the entire value (defaults to false).
     */
    public findPrev(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return this.find(text, -1, caseSensitive, exactMatch);
    }

    /**
     * Reapplies the existing search.
     *
     * @remarks
     * Returns how many times the grid contains the last search.
     * @example
     * ```typescript
     * this.grid.refreshSearch();
     * ```
     * @param updateActiveInfo
     */
    public refreshSearch(updateActiveInfo?: boolean, endEdit = true): number {
        if (this.lastSearchInfo.searchText) {
            this.rebuildMatchCache();

            if (updateActiveInfo) {
                const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);
                this.lastSearchInfo.matchInfoCache.forEach((match, i) => {
                    if (match.column === activeInfo.column &&
                        match.row === activeInfo.row &&
                        match.index === activeInfo.index &&
                        compareMaps(match.metadata, activeInfo.metadata)) {
                        this.lastSearchInfo.activeMatchIndex = i;
                    }
                });
            }

            return this.find(this.lastSearchInfo.searchText,
                0,
                this.lastSearchInfo.caseSensitive,
                this.lastSearchInfo.exactMatch,
                false,
                endEdit);
        } else {
            return 0;
        }
    }

    /**
     * Removes all the highlights in the cell.
     *
     * @example
     * ```typescript
     * this.grid.clearSearch();
     * ```
     */
    public clearSearch() {
        this.lastSearchInfo = {
            searchText: '',
            caseSensitive: false,
            exactMatch: false,
            activeMatchIndex: 0,
            matchInfoCache: []
        };

        this.rowList.forEach((row) => {
            if (row.cells) {
                row.cells.forEach((c: IgxGridCellComponent) => {
                    c.clearHighlight();
                });
            }
        });
    }

    /**
     * Returns if the `IgxGridComponent` has sortable columns.
     *
     * @example
     * ```typescript
     * const sortableGrid = this.grid.hasSortableColumns;
     * ```
     */
    public get hasSortableColumns(): boolean {
        return this._columns.some((col) => col.sortable);
    }

    /**
     * Returns if the `IgxGridComponent` has editable columns.
     *
     * @example
     * ```typescript
     * const editableGrid = this.grid.hasEditableColumns;
     * ```
     */
    public get hasEditableColumns(): boolean {
        return this._columns.some((col) => col.editable);
    }

    /**
     * Returns if the `IgxGridComponent` has filterable columns.
     *
     * @example
     * ```typescript
     * const filterableGrid = this.grid.hasFilterableColumns;
     * ```
     */
    public get hasFilterableColumns(): boolean {
        return this._columns.some((col) => col.filterable);
    }

    /**
     * Returns if the `IgxGridComponent` has summarized columns.
     *
     * @example
     * ```typescript
     * const summarizedGrid = this.grid.hasSummarizedColumns;
     * ```
     */
    public get hasSummarizedColumns(): boolean {
        const summarizedColumns = this._columns.filter(col => col.hasSummary && !col.hidden);
        return summarizedColumns.length > 0;
    }

    /**
     * @hidden @internal
     */
    public get rootSummariesEnabled(): boolean {
        return this.summaryCalculationMode !== GridSummaryCalculationMode.childLevelsOnly;
    }

    /**
     * @hidden @internal
     */
    public get hasVisibleColumns(): boolean {
        if (this._hasVisibleColumns === undefined) {
            return this._columns ? this._columns.some(c => !c.hidden) : false;
        }
        return this._hasVisibleColumns;
    }

    public set hasVisibleColumns(value) {
        this._hasVisibleColumns = value;
    }
    /**
     * Returns if the `IgxGridComponent` has moveable columns.
     *
     * @deprecated
     * Use `IgxGridComponent.moving` instead.
     *
     * @example
     * ```typescript
     * const movableGrid = this.grid.hasMovableColumns;
     * ```
     */
    public get hasMovableColumns(): boolean {
        return this.moving;
    }

    /**
     * Returns if the `IgxGridComponent` has column groups.
     *
     * @example
     * ```typescript
     * const groupGrid = this.grid.hasColumnGroups;
     * ```
     */
    public get hasColumnGroups(): boolean {
        return this._columnGroups;
    }
    /**
     * Returns if the `IgxGridComponent` has column layouts for multi-row layout definition.
     *
     * @example
     * ```typescript
     * const layoutGrid = this.grid.hasColumnLayouts;
     * ```
     */
    public get hasColumnLayouts() {
        return !!this._columns.some(col => col.columnLayout);
    }


    /**
     * @hidden @internal
     */
    public get multiRowLayoutRowSize() {
        return this._multiRowLayoutRowSize;
    }

    /**
     * @hidden
     */
    protected get rowBasedHeight() {
        return this.dataLength * this.rowHeight;
    }

    /**
     * @hidden
     */
    protected get isPercentWidth() {
        return this.width && this.width.indexOf('%') !== -1;
    }

    /**
     * @hidden @internal
     */
    public get isPercentHeight() {
        return this._height && this._height.indexOf('%') !== -1;
    }

    /**
     * @hidden
     */
    protected get defaultTargetBodyHeight(): number {
        const allItems = this.dataLength;
        return this.renderedRowHeight * Math.min(this._defaultTargetRecordNumber,
            this.paginator ? Math.min(allItems, this.paginator.perPage) : allItems);
    }

    /**
     * @hidden @internal
     * The rowHeight input is bound to min-height css prop of rows that adds a 1px border in all cases
     */
    public get renderedRowHeight(): number {
        return this.rowHeight + 1;
    }

    /**
     * @hidden @internal
     */
    public get outerWidth() {
        return this.hasVerticalScroll() ? this.calcWidth + this.scrollSize : this.calcWidth;
    }

    /**
     * @hidden @internal
     * Gets the visible content height that includes header + tbody + footer.
     */
    public getVisibleContentHeight() {
        let height = this.theadRow.nativeElement.clientHeight + this.tbody.nativeElement.clientHeight;
        if (this.hasSummarizedColumns) {
            height += this.tfoot.nativeElement.clientHeight;
        }
        return height;
    }

    /**
     * @hidden @internal
     */
    public getPossibleColumnWidth(baseWidth: number = null) {
        let computedWidth;
        if (baseWidth !== null) {
            computedWidth = baseWidth;
        } else {
            computedWidth = this.calcWidth ||
                parseInt(this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue('width'), 10);
        }

        computedWidth -= this.featureColumnsWidth();

        const visibleChildColumns = this.visibleColumns.filter(c => !c.columnGroup);


        // Column layouts related
        let visibleCols = [];
        const columnBlocks = this.visibleColumns.filter(c => c.columnGroup);
        const colsPerBlock = columnBlocks.map(block => block.getInitialChildColumnSizes(block.children));
        const combinedBlocksSize = colsPerBlock.reduce((acc, item) => acc + item.length, 0);
        colsPerBlock.forEach(blockCols => visibleCols = visibleCols.concat(blockCols));
        //

        const columnsWithSetWidths = this.hasColumnLayouts ?
            visibleCols.filter(c => c.widthSetByUser) :
            visibleChildColumns.filter(c => c.widthSetByUser);

        const columnsToSize = this.hasColumnLayouts ?
            combinedBlocksSize - columnsWithSetWidths.length :
            visibleChildColumns.length - columnsWithSetWidths.length;
        const sumExistingWidths = columnsWithSetWidths
            .reduce((prev, curr) => {
                const colWidth = curr.width;
                let widthValue = parseInt(colWidth, 10);
                if (isNaN(widthValue)) {
                    widthValue = MINIMUM_COLUMN_WIDTH;
                }
                const currWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1 ?
                    widthValue / 100 * computedWidth :
                    widthValue;
                return prev + currWidth;
            }, 0);

        // When all columns are hidden, return 0px width
        if (!sumExistingWidths && !columnsToSize) {
            return '0px';
        }

        const columnWidth = Math.floor(!Number.isFinite(sumExistingWidths) ?
            Math.max(computedWidth / columnsToSize, this.minColumnWidth) :
            Math.max((computedWidth - sumExistingWidths) / columnsToSize, this.minColumnWidth));

        return columnWidth + 'px';
    }

    /**
     * @hidden @internal
     */
    public hasVerticalScroll() {
        if (this._init) {
            return false;
        }
        const isScrollable = this.verticalScrollContainer ? this.verticalScrollContainer.isScrollable() : false;
        return !!(this.calcWidth && this.dataView && this.dataView.length > 0 && isScrollable);
    }

    /**
     * Gets calculated width of the pinned area.
     *
     * @example
     * ```typescript
     * const pinnedWidth = this.grid.getPinnedWidth();
     * ```
     * @param takeHidden If we should take into account the hidden columns in the pinned area.
     */
    public getPinnedWidth(takeHidden = false) {
        const fc = takeHidden ? this._pinnedColumns : this.pinnedColumns;
        let sum = 0;
        for (const col of fc) {
            if (col.level === 0) {
                sum += parseInt(col.calcWidth, 10);
            }
        }
        if (this.isPinningToStart) {
            sum += this.featureColumnsWidth();
        }

        return sum;
    }

    /**
     * @hidden @internal
     */
    public isColumnGrouped(_fieldName: string): boolean {
        return false;
    }

    /**
     * @hidden @internal
     * TODO: REMOVE
     */
    public onHeaderSelectorClick(event) {
        if (!this.isMultiRowSelectionEnabled) {
            return;
        }
        if (this.selectionService.areAllRowSelected()) {
            this.selectionService.clearRowSelection(event);
        } else {
            this.selectionService.selectAllRows(event);
        }
    }

    /**
     * @hidden @internal
     */
    public get headSelectorBaseAriaLabel() {
        if (this._filteringExpressionsTree.filteringOperands.length > 0) {
            return this.selectionService.areAllRowSelected() ? 'Deselect all filtered' : 'Select all filtered';
        }

        return this.selectionService.areAllRowSelected() ? 'Deselect all' : 'Select all';
    }

    /**
     * @hidden
     * @internal
     */
    public get totalRowsCountAfterFilter() {
        if (this.data) {
            return this.selectionService.allData.length;
        }

        return 0;
    }

    /**
     * Returns the currently transformed paged/filtered/sorted/grouped pinned row data, displayed in the grid.
     *
     * @example
     * ```typescript
     *      const pinnedDataView = this.grid.pinnedDataView;
     * ```
     */
    public get pinnedDataView(): any[] {
        return this.pinnedRecords ? this.pinnedRecords : [];
    }

    /**
     * Returns currently transformed paged/filtered/sorted/grouped unpinned row data, displayed in the grid.
     *
     * @example
     * ```typescript
     *      const pinnedDataView = this.grid.pinnedDataView;
     * ```
     */
    public get unpinnedDataView(): any[] {
        return this.unpinnedRecords ? this.unpinnedRecords : this.verticalScrollContainer?.igxForOf || [];
    }

    /**
     * Returns the currently transformed paged/filtered/sorted/grouped/pinned/unpinned row data, displayed in the grid.
     *
     * @example
     * ```typescript
     *      const dataView = this.grid.dataView;
     * ```
     */
    public get dataView() {
        return this._dataView;
    }

    /**
     * Gets/Sets whether clicking over a row should select/deselect it
     *
     * @remarks
     * By default it is set to true
     * @param enabled: boolean
     */
    @WatchChanges()
    @Input()
    public get selectRowOnClick() {
        return this._selectRowOnClick;
    }

    public set selectRowOnClick(enabled: boolean) {
        this._selectRowOnClick = enabled;
    }

    /**
     * Select specified rows by ID.
     *
     * @example
     * ```typescript
     * this.grid.selectRows([1,2,5], true);
     * ```
     * @param rowIDs
     * @param clearCurrentSelection if true clears the current selection
     */
    public selectRows(rowIDs: any[], clearCurrentSelection?: boolean) {
        this.selectionService.selectRowsWithNoEvent(rowIDs, clearCurrentSelection);
        this.notifyChanges();
    }

    /**
     * Deselect specified rows by ID.
     *
     * @example
     * ```typescript
     * this.grid.deselectRows([1,2,5]);
     * ```
     * @param rowIDs
     */
    public deselectRows(rowIDs: any[]) {
        this.selectionService.deselectRowsWithNoEvent(rowIDs);
        this.notifyChanges();
    }

    /**
     * Selects all rows
     *
     * @remarks
     * By default if filtering is in place, selectAllRows() and deselectAllRows() select/deselect all filtered rows.
     * If you set the parameter onlyFilterData to false that will select all rows in the grid exept deleted rows.
     * @example
     * ```typescript
     * this.grid.selectAllRows();
     * this.grid.selectAllRows(false);
     * ```
     * @param onlyFilterData
     */
    public selectAllRows(onlyFilterData = true) {
        const data = onlyFilterData && this.filteredData ? this.filteredData : this.gridAPI.get_all_data(true);
        const rowIDs = this.selectionService.getRowIDs(data).filter(rID => !this.gridAPI.row_deleted_transaction(rID));
        this.selectRows(rowIDs);
    }

    /**
     * Deselects all rows
     *
     * @remarks
     * By default if filtering is in place, selectAllRows() and deselectAllRows() select/deselect all filtered rows.
     * If you set the parameter onlyFilterData to false that will deselect all rows in the grid exept deleted rows.
     * @example
     * ```typescript
     * this.grid.deselectAllRows();
     * ```
     * @param onlyFilterData
     */
    public deselectAllRows(onlyFilterData = true) {
        if (onlyFilterData && this.filteredData && this.filteredData.length > 0) {
            this.deselectRows(this.selectionService.getRowIDs(this.filteredData));
        } else {
            this.selectionService.clearAllSelectedRows();
            this.notifyChanges();
        }
    }

    /**
     * @hidden @internal
     */
    public clearCellSelection(): void {
        this.selectionService.clear(true);
        this.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public dragScroll(delta: { left: number; top: number }): void {
        const horizontal = this.headerContainer.getScroll();
        const vertical = this.verticalScrollContainer.getScroll();
        const { left, top } = delta;

        horizontal.scrollLeft += left * this.DRAG_SCROLL_DELTA;
        vertical.scrollTop += top * this.DRAG_SCROLL_DELTA;
    }

    /**
     * @hidden @internal
     */
    public isDefined(arg: any): boolean {
        return arg !== undefined && arg !== null;
    }

    /**
     * @hidden @internal
     */
    public selectRange(arg: GridSelectionRange | GridSelectionRange[] | null | undefined): void {
        if (!this.isDefined(arg)) {
            this.clearCellSelection();
            return;
        }
        if (arg instanceof Array) {
            arg.forEach(range => this.setSelection(range));
        } else {
            this.setSelection(arg);
        }
        this.notifyChanges();
    }

    /**
     * @hidden @internal
     */
    public columnToVisibleIndex(field: string | number): number {
        const visibleColumns = this.visibleColumns;
        if (typeof field === 'number') {
            return field;
        }
        return visibleColumns.find(column => column.field === field).visibleIndex;
    }

    /**
     * @hidden @internal
     */
    public setSelection(range: GridSelectionRange): void {
        const startNode = { row: range.rowStart, column: this.columnToVisibleIndex(range.columnStart) };
        const endNode = { row: range.rowEnd, column: this.columnToVisibleIndex(range.columnEnd) };

        this.selectionService.pointerState.node = startNode;
        this.selectionService.selectRange(endNode, this.selectionService.pointerState);
        this.selectionService.addRangeMeta(endNode, this.selectionService.pointerState);
        this.selectionService.initPointerState();
    }

    /**
     * @hidden @internal
     */
    public getSelectedRanges(): GridSelectionRange[] {
        return this.selectionService.ranges;
    }

    /**
     *
     * Returns an array of the current cell selection in the form of `[{ column.field: cell.value }, ...]`.
     *
     * @remarks
     * If `formatters` is enabled, the cell value will be formatted by its respective column formatter (if any).
     * If `headers` is enabled, it will use the column header (if any) instead of the column field.
     */
    public getSelectedData(formatters = false, headers = false) {
        const source = this.filteredSortedData;
        return this.extractDataFromSelection(source, formatters, headers);
    }

    /**
     * Get current selected columns.
     *
     * @example
     * Returns an array with selected columns
     * ```typescript
     * const selectedColumns = this.grid.selectedColumns();
     * ```
     */
    public selectedColumns(): ColumnType[] {
        const fields = this.selectionService.getSelectedColumns();
        return fields.map(field => this.getColumnByName(field)).filter(field => field);
    }

    /**
     * Select specified columns.
     *
     * @example
     * ```typescript
     * this.grid.selectColumns(['ID','Name'], true);
     * ```
     * @param columns
     * @param clearCurrentSelection if true clears the current selection
     */
    public selectColumns(columns: string[] | ColumnType[], clearCurrentSelection?: boolean) {
        let fieldToSelect: string[] = [];
        if (columns.length === 0 || typeof columns[0] === 'string') {
            fieldToSelect = columns as string[];
        } else {
            (columns as ColumnType[]).forEach(col => {
                if (col.columnGroup) {
                    const children = col.allChildren.filter(c => !c.columnGroup).map(c => c.field);
                    fieldToSelect = [...fieldToSelect, ...children];
                } else {
                    fieldToSelect.push(col.field);
                }
            });
        }

        this.selectionService.selectColumnsWithNoEvent(fieldToSelect, clearCurrentSelection);
        this.notifyChanges();
    }

    /**
     * Deselect specified columns by field.
     *
     * @example
     * ```typescript
     * this.grid.deselectColumns(['ID','Name']);
     * ```
     * @param columns
     */
    public deselectColumns(columns: string[] | ColumnType[]) {
        let fieldToDeselect: string[] = [];
        if (columns.length === 0 || typeof columns[0] === 'string') {
            fieldToDeselect = columns as string[];
        } else {
            (columns as ColumnType[]).forEach(col => {
                if (col.columnGroup) {
                    const children = col.allChildren.filter(c => !c.columnGroup).map(c => c.field);
                    fieldToDeselect = [...fieldToDeselect, ...children];
                } else {
                    fieldToDeselect.push(col.field);
                }
            });
        }
        this.selectionService.deselectColumnsWithNoEvent(fieldToDeselect);
        this.notifyChanges();
    }

    /**
     * Deselects all columns
     *
     * @example
     * ```typescript
     * this.grid.deselectAllColumns();
     * ```
     */
    public deselectAllColumns() {
        this.selectionService.clearAllSelectedColumns();
        this.notifyChanges();
    }

    /**
     * Selects all columns
     *
     * @example
     * ```typescript
     * this.grid.deselectAllColumns();
     * ```
     */
    public selectAllColumns() {
        this.selectColumns(this._columns.filter(c => !c.columnGroup));
    }

    /**
     *
     * Returns an array of the current columns selection in the form of `[{ column.field: cell.value }, ...]`.
     *
     * @remarks
     * If `formatters` is enabled, the cell value will be formatted by its respective column formatter (if any).
     * If `headers` is enabled, it will use the column header (if any) instead of the column field.
     */
    public getSelectedColumnsData(formatters = false, headers = false) {
        const source = this.filteredSortedData ? this.filteredSortedData : this.data;
        return this.extractDataFromColumnsSelection(source, formatters, headers);
    }


    public combineSelectedCellAndColumnData(columnData: any[], formatters = false, headers = false) {
        const source = this.filteredSortedData;
        return this.extractDataFromSelection(source, formatters, headers, columnData);
    }

    /**
     * @hidden @internal
     */
    public preventContainerScroll = (evt) => {
        if (evt.target.scrollTop !== 0) {
            this.verticalScrollContainer.addScrollTop(evt.target.scrollTop);
            evt.target.scrollTop = 0;
        }
        if (evt.target.scrollLeft !== 0) {
            this.headerContainer.scrollPosition += evt.target.scrollLeft;
            evt.target.scrollLeft = 0;
        }
    };

    /**
     * @hidden
     * @internal
     */
    public copyHandler(event) {
        const eventPathElements = event.composedPath().map(el => el.tagName?.toLowerCase());
        if (eventPathElements.includes('igx-grid-filtering-row') ||
            eventPathElements.includes('igx-grid-filtering-cell')) {
            return;
        }

        const selectedColumns = this.gridAPI.grid.selectedColumns();
        const columnData = this.getSelectedColumnsData(this.clipboardOptions.copyFormatters, this.clipboardOptions.copyHeaders);
        let selectedData;
        if (event.type === 'copy') {
            selectedData = this.getSelectedData(this.clipboardOptions.copyFormatters, this.clipboardOptions.copyHeaders);
        };

        let data = [];
        let result;

        if (event.code === 'KeyC' && (event.ctrlKey || event.metaKey) && event.currentTarget.className === 'igx-grid-thead__wrapper') {
            if (selectedData.length) {
                if (columnData.length === 0) {
                    result = this.prepareCopyData(event, selectedData);
                } else {
                    data = this.combineSelectedCellAndColumnData(columnData, this.clipboardOptions.copyFormatters,
                        this.clipboardOptions.copyHeaders);
                    result = this.prepareCopyData(event, data[0], data[1]);
                }
            } else {
                data = columnData;
                result = this.prepareCopyData(event, data);
            }

            navigator.clipboard.writeText(result).then().catch(e => console.error(e));
        } else if (!this.clipboardOptions.enabled || this.crudService.cellInEditMode || event.type === 'keydown') {
            return;
        } else {
            if (selectedColumns.length) {
                data = this.combineSelectedCellAndColumnData(columnData, this.clipboardOptions.copyFormatters,
                    this.clipboardOptions.copyHeaders);
                result = this.prepareCopyData(event, data[0], data[1]);
            } else {
                data = selectedData;
                result = this.prepareCopyData(event, data);
            }
            event.clipboardData.setData('text/plain', result);
        }
    }

    /**
     * @hidden @internal
     */
    public prepareCopyData(event, data, keys?) {
        const ev = { data, cancel: false } as IGridClipboardEvent;
        this.gridCopy.emit(ev);

        if (ev.cancel) {
            return;
        }

        const transformer = new CharSeparatedValueData(ev.data, this.clipboardOptions.separator);
        let result = keys ? transformer.prepareData(keys) : transformer.prepareData();

        if (!this.clipboardOptions.copyHeaders) {
            result = result.substring(result.indexOf('\n') + 1);
        }

        if (data && data.length > 0 && Object.values(data[0]).length === 1) {
            result = result.slice(0, -2);
        }

        event.preventDefault();

        /* Necessary for the hiearachical case but will probably have to
           change how getSelectedData is propagated in the hiearachical grid
        */
        event.stopPropagation();

        return result;
    }

    /**
     * @hidden @internal
     */
    public showSnackbarFor(index: number) {
        this.addRowSnackbar.actionText = index === -1 ? '' : this.snackbarActionText;
        this.lastAddedRowIndex = index;
        this.addRowSnackbar.open();
    }

    /**
     * Navigates to a position in the grid based on provided `rowindex` and `visibleColumnIndex`.
     *
     * @remarks
     * Also can execute a custom logic over the target element,
     * through a callback function that accepts { targetType: GridKeydownTargetType, target: Object }
     * @example
     * ```typescript
     *  this.grid.navigateTo(10, 3, (args) => { args.target.nativeElement.focus(); });
     * ```
     */
    public navigateTo(rowIndex: number, visibleColIndex = -1, cb: (args: any) => void = null) {
        const totalItems = (this as any).totalItemCount ?? this.dataView.length - 1;
        if (rowIndex < 0 || rowIndex > totalItems || (visibleColIndex !== -1
            && this._columns.map(col => col.visibleIndex).indexOf(visibleColIndex) === -1)) {
            return;
        }
        if (this.dataView.slice(rowIndex, rowIndex + 1).find(rec => rec.expression || rec.childGridsData)) {
            visibleColIndex = -1;
        }
        // If the target row is pinned no need to scroll as well.
        const shouldScrollVertically = this.navigation.shouldPerformVerticalScroll(rowIndex, visibleColIndex);
        const shouldScrollHorizontally = this.navigation.shouldPerformHorizontalScroll(visibleColIndex, rowIndex);
        if (shouldScrollVertically) {
            this.navigation.performVerticalScrollToCell(rowIndex, visibleColIndex, () => {
                if (shouldScrollHorizontally) {
                    this.navigation.performHorizontalScrollToCell(visibleColIndex, () =>
                        this.executeCallback(rowIndex, visibleColIndex, cb));
                } else {
                    this.executeCallback(rowIndex, visibleColIndex, cb);
                }
            });
        } else if (shouldScrollHorizontally) {
            this.navigation.performHorizontalScrollToCell(visibleColIndex, () => {
                if (shouldScrollVertically) {
                    this.navigation.performVerticalScrollToCell(rowIndex, visibleColIndex, () =>
                        this.executeCallback(rowIndex, visibleColIndex, cb));
                } else {
                    this.executeCallback(rowIndex, visibleColIndex, cb);
                }
            });
        } else {
            this.executeCallback(rowIndex, visibleColIndex, cb);
        }
    }

    /**
     * Returns `ICellPosition` which defines the next cell,
     * according to the current position, that match specific criteria.
     *
     * @remarks
     * You can pass callback function as a third parameter of `getPreviousCell` method.
     * The callback function accepts IgxColumnComponent as a param
     * @example
     * ```typescript
     *  const nextEditableCellPosition = this.grid.getNextCell(0, 3, (column) => column.editable);
     * ```
     */
    public getNextCell(currRowIndex: number, curVisibleColIndex: number,
        callback: (IgxColumnComponent) => boolean = null): ICellPosition {
        const columns = this._columns.filter(col => !col.columnGroup && col.visibleIndex >= 0);
        const dataViewIndex = this._getDataViewIndex(currRowIndex);
        if (!this.isValidPosition(dataViewIndex, curVisibleColIndex)) {
            return { rowIndex: currRowIndex, visibleColumnIndex: curVisibleColIndex };
        }
        const colIndexes = callback ? columns.filter((col) => callback(col)).map(editCol => editCol.visibleIndex).sort((a, b) => a - b) :
            columns.map(editCol => editCol.visibleIndex).sort((a, b) => a - b);
        const nextCellIndex = colIndexes.find(index => index > curVisibleColIndex);
        if (this.dataView.slice(dataViewIndex, dataViewIndex + 1)
            .find(rec => !rec.expression && !rec.summaries && !rec.childGridsData && !rec.detailsData) && nextCellIndex !== undefined) {
            return { rowIndex: currRowIndex, visibleColumnIndex: nextCellIndex };
        } else {
            const nextIndex = this.getNextDataRowIndex(currRowIndex)
            if (colIndexes.length === 0 || nextIndex === currRowIndex) {
                return { rowIndex: currRowIndex, visibleColumnIndex: curVisibleColIndex };
            } else {
                return { rowIndex: nextIndex, visibleColumnIndex: colIndexes[0] };
            }
        }
    }

    /**
     * Returns `ICellPosition` which defines the previous cell,
     * according to the current position, that match specific criteria.
     *
     * @remarks
     * You can pass callback function as a third parameter of `getPreviousCell` method.
     * The callback function accepts IgxColumnComponent as a param
     * @example
     * ```typescript
     *  const previousEditableCellPosition = this.grid.getPreviousCell(0, 3, (column) => column.editable);
     * ```
     */
    public getPreviousCell(currRowIndex: number, curVisibleColIndex: number,
        callback: (IgxColumnComponent) => boolean = null): ICellPosition {
        const columns = this._columns.filter(col => !col.columnGroup && col.visibleIndex >= 0);
        const dataViewIndex = this._getDataViewIndex(currRowIndex);
        if (!this.isValidPosition(dataViewIndex, curVisibleColIndex)) {
            return { rowIndex: currRowIndex, visibleColumnIndex: curVisibleColIndex };
        }
        const colIndexes = callback ? columns.filter((col) => callback(col)).map(editCol => editCol.visibleIndex).sort((a, b) => b - a) :
            columns.map(editCol => editCol.visibleIndex).sort((a, b) => b - a);
        const prevCellIndex = colIndexes.find(index => index < curVisibleColIndex);
        if (this.dataView.slice(dataViewIndex, dataViewIndex + 1)
            .find(rec => !rec.expression && !rec.summaries && !rec.childGridsData && !rec.detailsData) && prevCellIndex !== undefined) {
            return { rowIndex: currRowIndex, visibleColumnIndex: prevCellIndex };
        } else {
            const prevIndex = this.getNextDataRowIndex(currRowIndex, true);
            if (colIndexes.length === 0 || prevIndex === currRowIndex) {
                return { rowIndex: currRowIndex, visibleColumnIndex: curVisibleColIndex };
            } else {
                return { rowIndex: prevIndex, visibleColumnIndex: colIndexes[0] };
            }
        }
    }

    /**
     * @hidden
     * @internal
     */
    public endRowEditTabStop(commit = true, event?: Event) {
        const canceled = this.crudService.endEdit(commit, event);

        if (canceled) {
            return true;
        }

        const activeCell = this.gridAPI.grid.navigation.activeNode;
        if (activeCell && activeCell.row !== -1) {
            this.tbody.nativeElement.focus();
        }
    }

    /**
     * @hidden @internal
     */
    public trackColumnChanges(index, col) {
        return col.field + col._calcWidth;
    }

    /**
     * @hidden
     */
    public isExpandedGroup(_group: IGroupByRecord): boolean {
        return undefined;
    }

    /**
     * @hidden @internal
     * TODO: MOVE to CRUD
     */
    public openRowOverlay(id) {
        this.configureRowEditingOverlay(id, this.rowList.length <= MIN_ROW_EDITING_COUNT_THRESHOLD);

        this.rowEditingOverlay.open(this.rowEditSettings);
        this.rowEditingOverlay.element.addEventListener('wheel', this.rowEditingWheelHandler.bind(this));
    }

    /**
     * @hidden @internal
     */
    public closeRowEditingOverlay() {
        this.rowEditingOverlay.element.removeEventListener('wheel', this.rowEditingWheelHandler);
        this.rowEditPositioningStrategy.isTopInitialPosition = null;
        this.rowEditingOverlay.close();
        this.rowEditingOverlay.element.parentElement.style.display = '';
    }

    /**
     * @hidden @internal
     */
    public toggleRowEditingOverlay(show) {
        const rowStyle = this.rowEditingOverlay.element.style;
        if (show) {
            rowStyle.display = 'block';
        } else {
            rowStyle.display = 'none';
        }
    }

    /**
     * @hidden @internal
     */
    public repositionRowEditingOverlay(row: RowType) {
        if (row && !this.rowEditingOverlay.collapsed) {
            const rowStyle = this.rowEditingOverlay.element.parentElement.style;
            if (row) {
                rowStyle.display = '';
                this.configureRowEditingOverlay(row.key);
                this.rowEditingOverlay.reposition();
            } else {
                rowStyle.display = 'none';
            }
        }
    }

    /**
     * @hidden @internal
     */
    public cachedViewLoaded(args: ICachedViewLoadedEventArgs) {
        if (this.hasHorizontalScroll()) {
            const tmplId = args.context.templateID.type;
            const index = args.context.index;
            args.view.detectChanges();
            this.zone.onStable.pipe(first()).subscribe(() => {
                const row = tmplId === 'dataRow' ? this.gridAPI.get_row_by_index(index) : null;
                const summaryRow = tmplId === 'summaryRow' ? this.summariesRowList.find((sr) => sr.dataRowIndex === index) : null;
                if (row && row instanceof IgxRowDirective) {
                    this._restoreVirtState(row);
                } else if (summaryRow) {
                    this._restoreVirtState(summaryRow);
                }
            });
        }
    }

    /**
     * Opens the advanced filtering dialog.
     */
    public openAdvancedFilteringDialog(overlaySettings?: OverlaySettings) {
        const settings = overlaySettings ? overlaySettings : this._advancedFilteringOverlaySettings;
        if (!this._advancedFilteringOverlayId) {
            this._advancedFilteringOverlaySettings.target =
                (this as any).rootGrid ? (this as any).rootGrid.nativeElement : this.nativeElement;
            this._advancedFilteringOverlaySettings.outlet = this.outlet;

            this._advancedFilteringOverlayId = this.overlayService.attach(
                IgxAdvancedFilteringDialogComponent,
                settings,
                {
                    injector: this.viewRef.injector,
                    componentFactoryResolver: this.resolver
                });
            this.overlayService.show(this._advancedFilteringOverlayId);
        }
    }

    /**
     * Closes the advanced filtering dialog.
     *
     * @param applyChanges indicates whether the changes should be applied
     */
    public closeAdvancedFilteringDialog(applyChanges: boolean) {
        if (this._advancedFilteringOverlayId) {
            const advancedFilteringOverlay = this.overlayService.getOverlayById(this._advancedFilteringOverlayId);
            const advancedFilteringDialog = advancedFilteringOverlay.componentRef.instance as IgxAdvancedFilteringDialogComponent;

            if (applyChanges) {
                advancedFilteringDialog.applyChanges();
            }
            advancedFilteringDialog.closeDialog();
        }
    }

    /**
     * @hidden @internal
     */
    public getEmptyRecordObjectFor(inRow: RowType) {
        const row = { ...inRow?.data };
        Object.keys(row).forEach(key => row[key] = undefined);
        const id = this.generateRowID();
        row[this.primaryKey] = id;
        return { rowID: id, data: row, recordRef: row };
    }

    /**
     * @hidden @internal
     */
    public hasHorizontalScroll() {
        return this.totalWidth - this.unpinnedWidth > 0;
    }

    /**
     * @hidden @internal
     */
    public isSummaryRow(rowData): boolean {
        return rowData && rowData.summaries && (rowData.summaries instanceof Map);
    }

    /**
     * @hidden @internal
     */
    public triggerPipes() {
        this.pipeTrigger++;
        this.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    public rowEditingWheelHandler(event: WheelEvent) {
        if (event.deltaY > 0) {
            this.verticalScrollContainer.scrollNext();
        } else {
            this.verticalScrollContainer.scrollPrev();
        }
    }

    /**
     * @hidden
     */
    public getUnpinnedIndexById(id) {
        return this.unpinnedRecords.findIndex(x => x[this.primaryKey] === id);
    }

    /**
     * Finishes the row transactions on the current row.
     *
     * @remarks
     * If `commit === true`, passes them from the pending state to the data (or transaction service)
     * @example
     * ```html
     * <button igxButton (click)="grid.endEdit(true)">Commit Row</button>
     * ```
     * @param commit
     */
    // TODO: Facade for crud service refactoring. To be removed
    // TODO: do not remove this, as it is used in rowEditTemplate, but mark is as internal and hidden
    public endEdit(commit = true, event?: Event) {
        this.crudService.endEdit(commit, event);
    }

    /**
     * Enters add mode by spawning the UI under the specified row by rowID.
     *
     * @remarks
     * If null is passed as rowID, the row adding UI is spawned as the first record in the data view
     * @remarks
     * Spawning the UI to add a child for a record only works if you provide a rowID
     * @example
     * ```typescript
     * this.grid.beginAddRowById('ALFKI');
     * this.grid.beginAddRowById('ALFKI', true);
     * this.grid.beginAddRowById(null);
     * ```
     * @param rowID - The rowID to spawn the add row UI for, or null to spawn it as the first record in the data view
     * @param asChild - Whether the record should be added as a child. Only applicable to igxTreeGrid.
     */
    public beginAddRowById(rowID: any, asChild?: boolean): void {
        let index = rowID;
        if (rowID == null) {
            if (asChild) {
                console.warn('The record cannot be added as a child to an unspecified record.');
                return;
            }
            index = null;
        } else {
            // find the index of the record with that PK
            index = this.gridAPI.get_rec_index_by_id(rowID, this.dataView);
            if (index === -1) {
                console.warn('No row with the specified ID was found.');
                return;
            }
        }

        this._addRowForIndex(index, asChild);
    }

    protected _addRowForIndex(index: number, asChild?: boolean) {
        if (!this.dataView.length) {
            this.beginAddRowForIndex(index, asChild);
            return;
        }
        // check if the index is valid - won't support anything outside the data view
        if (index >= 0 && index < this.dataView.length) {
            // check if the index is in the view port
            if ((index < this.virtualizationState.startIndex ||
                index >= this.virtualizationState.startIndex + this.virtualizationState.chunkSize) &&
                !this.isRecordPinnedByViewIndex(index)) {
                this.verticalScrollContainer.chunkLoad
                    .pipe(first(), takeUntil(this.destroy$))
                    .subscribe(() => {
                        this.beginAddRowForIndex(index, asChild);
                    });
                this.navigateTo(index);
                this.notifyChanges(true);
                return;
            }
            this.beginAddRowForIndex(index, asChild);
        } else {
            console.warn('The row with the specified PK or index is outside of the current data view.');
        }
    }

    /**
     * Enters add mode by spawning the UI at the specified index.
     *
     * @remarks
     * Accepted values for index are integers from 0 to this.grid.dataView.length
     * @example
     * ```typescript
     * this.grid.beginAddRowByIndex(0);
     * ```
     * @param index - The index to spawn the UI at. Accepts integers from 0 to this.grid.dataView.length
     */
    public beginAddRowByIndex(index: number): void {
        if (index === 0) {
            return this.beginAddRowById(null);
        }
        return this._addRowForIndex(index - 1);
    }

    /**
     * @hidden
     */
    public preventHeaderScroll(args) {
        if (args.target.scrollLeft !== 0) {
            (this.navigation as any).forOfDir().getScroll().scrollLeft = args.target.scrollLeft;
            args.target.scrollLeft = 0;
        }
    }

    protected beginAddRowForIndex(index: number, asChild: boolean = false) {
        // TODO is row from rowList suitable for enterAddRowMode
        const row = index == null ?
            null : this.rowList.find(r => r.index === index);
        if (row !== undefined) {
            this.crudService.enterAddRowMode(row, asChild);
        } else {
            console.warn('No row with the specified PK or index was found.');
        }
    }

    protected switchTransactionService(val: boolean) {
        if (val) {
            this._transactions = this.transactionFactory.create(TRANSACTION_TYPE.Base);
        } else {
            this._transactions = this.transactionFactory.create(TRANSACTION_TYPE.None);
        }

        if (this.dataCloneStrategy) {
            this._transactions.cloneStrategy = this.dataCloneStrategy;
        }
    }

    protected subscribeToTransactions(): void {
        this.transactionChange$.next();
        this.transactions.onStateUpdate.pipe(takeUntil(merge(this.destroy$, this.transactionChange$)))
            .subscribe(this.transactionStatusUpdate.bind(this));
    }

    protected transactionStatusUpdate(event: StateUpdateEvent) {
        let actions: Action<Transaction>[] = [];
        if (event.origin === TransactionEventOrigin.REDO) {
            actions = event.actions ? event.actions.filter(x => x.transaction.type === TransactionType.DELETE) : [];
        } else if (event.origin === TransactionEventOrigin.UNDO) {
            actions = event.actions ? event.actions.filter(x => x.transaction.type === TransactionType.ADD) : [];
        }
        if (actions.length > 0) {
            for (const action of actions) {
                if (this.selectionService.isRowSelected(action.transaction.id)) {
                    this.selectionService.deselectRow(action.transaction.id);
                }
            }
        }
        if (event.origin === TransactionEventOrigin.REDO || event.origin === TransactionEventOrigin.UNDO) {
            event.actions.forEach(x => {
                if (x.transaction.type === TransactionType.UPDATE) {
                    const value = this.transactions.getAggregatedValue(x.transaction.id, true);
                    this.validation.update(x.transaction.id, value ?? x.recordRef);
                } else if (x.transaction.type === TransactionType.DELETE || x.transaction.type === TransactionType.ADD) {
                    const value = this.transactions.getAggregatedValue(x.transaction.id, true);
                    if (value) {
                        this.validation.create(x.transaction.id, value ?? x.recordRef);
                        this.validation.update(x.transaction.id, value ?? x.recordRef);
                        this.validation.markAsTouched(x.transaction.id);
                    } else {
                        this.validation.clear(x.transaction.id);
                    }
                }

            });
        }
        this.selectionService.clearHeaderCBState();
        this.summaryService.clearSummaryCache();
        this.pipeTrigger++;
        this.notifyChanges();
    };

    protected writeToData(rowIndex: number, value: any) {
        mergeObjects(this.gridAPI.get_all_data()[rowIndex], value);
    }

    protected _restoreVirtState(row) {
        // check virtualization state of data record added from cache
        // in case state is no longer valid - update it.
        const rowForOf = row.virtDirRow;
        const gridScrLeft = rowForOf.getScroll().scrollLeft;
        const left = -parseInt(rowForOf.dc.instance._viewContainer.element.nativeElement.style.left, 10);
        const actualScrollLeft = left + rowForOf.getColumnScrollLeft(rowForOf.state.startIndex);
        if (gridScrLeft !== actualScrollLeft) {
            rowForOf.onHScroll(gridScrLeft);
            rowForOf.cdr.detectChanges();
        }
    }

    protected changeRowEditingOverlayStateOnScroll(row: RowType) {
        if (!this.rowEditable || !this.rowEditingOverlay || this.rowEditingOverlay.collapsed) {
            return;
        }
        if (!row) {
            this.toggleRowEditingOverlay(false);
        } else {
            this.repositionRowEditingOverlay(row);
        }
    }

    /**
     * Should be called when data and/or isLoading input changes so that the overlay can be
     * hidden/shown based on the current value of shouldOverlayLoading
     */
    protected evaluateLoadingState() {
        if (this.shouldOverlayLoading) {
            // a new overlay should be shown
            const overlaySettings: OverlaySettings = {
                outlet: this.loadingOutlet,
                closeOnOutsideClick: false,
                positionStrategy: new ContainerPositionStrategy()
            };
            this.loadingOverlay.open(overlaySettings);
        } else {
            this.loadingOverlay.close();
        }
    }

    /**
     * @hidden
     * Sets grid width i.e. this.calcWidth
     */
    protected calculateGridWidth() {
        let width;

        if (this.isPercentWidth) {
            /* width in %*/
            const computed = this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue('width');
            width = computed.indexOf('%') === -1 ? parseInt(computed, 10) : null;
        } else {
            width = parseInt(this.width, 10);
        }

        if (!width && this.nativeElement) {
            width = this.nativeElement.offsetWidth;
        }


        if (this.width === null || !width) {
            width = this.getColumnWidthSum();
        }

        if (this.hasVerticalScroll() && this.width !== null) {
            width -= this.scrollSize;
        }
        if ((Number.isFinite(width) || width === null) && width !== this.calcWidth) {
            this.calcWidth = width;
        }
        this._derivePossibleWidth();
    }

    /**
     * @hidden
     * Sets columns defaultWidth property
     */
    protected _derivePossibleWidth() {
        if (!this.columnWidthSetByUser) {
            this._columnWidth = this.width !== null ? this.getPossibleColumnWidth() : this.minColumnWidth + 'px';
        }
        this._columns.forEach((column: IgxColumnComponent) => {
            if (this.hasColumnLayouts && parseInt(this._columnWidth, 10)) {
                const columnWidthCombined = parseInt(this._columnWidth, 10) * (column.colEnd ? column.colEnd - column.colStart : 1);
                column.defaultWidth = columnWidthCombined + 'px';
            } else {
                // D.K. March 29th, 2021 #9145 Consider min/max width when setting defaultWidth property
                column.defaultWidth = this.getExtremumBasedColWidth(column);
                column.resetCaches();
            }
        });
        this.resetCachedWidths();
    }

    /**
     * @hidden
     * @internal
     */
    protected getExtremumBasedColWidth(column: IgxColumnComponent): string {
        let width = this._columnWidth;
        if (width && typeof width !== 'string') {
            width = String(width);
        }
        const minWidth = width.indexOf('%') === -1 ? column.minWidthPx : column.minWidthPercent;
        const maxWidth = width.indexOf('%') === -1 ? column.maxWidthPx : column.maxWidthPercent;
        if (column.hidden) {
            return width;
        }

        if (minWidth > parseFloat(width)) {
            width = String(column.minWidth);
        } else if (maxWidth < parseFloat(width)) {
            width = String(column.maxWidth);
        }

        // if no px or % are defined in maxWidth/minWidth consider it px
        if (width.indexOf('%') === -1 && width.indexOf('px') === -1) {
            width += 'px';
        }
        return width;
    }

    protected resetNotifyChanges() {
        this._cdrRequestRepaint = false;
        this._cdrRequests = false;
    }

    /** @hidden @internal */
    public resolveOutlet() {
        return this._userOutletDirective ? this._userOutletDirective : this._outletDirective;
    }

    /**
     * Reorder columns in the main columnList and _columns collections.
     *
     * @hidden
     */
    protected _moveColumns(from: IgxColumnComponent, to: IgxColumnComponent, pos: DropPosition) {
        const orderedList = this._pinnedColumns.concat(this._unpinnedColumns);
        const list = orderedList;
        this._reorderColumns(from, to, pos, list);
        const newList = this._resetColumnList(list);
        this.updateColumns(newList);
    }


    /**
     * Update internal column's collection.
     * @hidden
     */
    public updateColumns(newColumns: IgxColumnComponent[]) {
        // update internal collections to retain order.
        this._pinnedColumns = newColumns
            .filter((c) => c.pinned);
        this._unpinnedColumns = newColumns.filter((c) => !c.pinned);
        this._columns = newColumns;
        this.resetCaches();
    }

    /**
     * @hidden
     */
    protected _resetColumnList(list?) {
        if (!list) {
            list = this._columns;
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

    /**
     * Reorders columns inside the passed column collection.
     * When reordering column group collection, the collection is not flattened.
     * In all other cases, the columns collection is flattened, this is why adittional calculations on the dropIndex are done.
     *
     * @hidden
     */
    protected _reorderColumns(from: IgxColumnComponent, to: IgxColumnComponent, position: DropPosition, columnCollection: any[],
        inGroup = false) {
        const fromIndex = columnCollection.indexOf(from);
        const childColumnsCount = inGroup ? 1 : from.allChildren.length + 1;
        columnCollection.splice(fromIndex, childColumnsCount);
        let dropIndex = columnCollection.indexOf(to);
        if (position === DropPosition.AfterDropTarget) {
            dropIndex++;
            if (!inGroup && to.columnGroup) {
                dropIndex += to.allChildren.length;
            }
        }
        columnCollection.splice(dropIndex, 0, from);
    }

    /**
     * Reorder column group collection.
     *
     * @hidden
     */
    protected _moveChildColumns(parent: IgxColumnComponent, from: IgxColumnComponent, to: IgxColumnComponent, pos: DropPosition) {
        const buffer = parent.children.toArray();
        this._reorderColumns(from, to, pos, buffer, true);
        parent.children.reset(buffer);
    }

    /**
     * @hidden @internal
     */
    protected setupColumns() {
        if (this.autoGenerate) {
            this.autogenerateColumns();
        } else {
            this._columns = this.getColumnList();
        }
        if (!this.columnList.length && this._columnConfig.length) {
            this.configToColumns(this._columnConfig);
        }

        this.initColumns(this._columns, (col: IgxColumnComponent) => this.columnInit.emit(col));
        this.columnListDiffer.diff(this.columnList);

        this.columnList.changes
            .pipe(takeUntil(this.destroy$))
            .subscribe((change: QueryList<IgxColumnComponent>) => {
                this.onColumnsChanged(change);
            });
    }

    protected getColumnList() {
        return this.columnList.toArray();
    }

    /**
     * @hidden
     */
    protected deleteRowFromData(rowID: any, index: number) {
        //  if there is a row (index !== 0) delete it
        //  if there is a row in ADD or UPDATE state change it's state to DELETE
        if (index !== -1) {
            if (this.transactions.enabled) {
                const transaction: Transaction = { id: rowID, type: TransactionType.DELETE, newValue: null };
                this.transactions.add(transaction, this.data[index]);
            } else {
                this.data.splice(index, 1);
            }
        } else {
            const state: State = this.transactions.getState(rowID);
            this.transactions.add({ id: rowID, type: TransactionType.DELETE, newValue: null }, state && state.recordRef);
        }
    }


    /**
     * @hidden @internal
     */
    protected getDataBasedBodyHeight(): number {
        return !this.data || (this.data.length < this._defaultTargetRecordNumber) ?
            0 : this.defaultTargetBodyHeight;
    }

    /**
     * @hidden @internal
     */
    protected onPinnedRowsChanged(change: QueryList<IgxGridRowComponent>) {
        const diff = this.rowListDiffer.diff(change);
        if (diff) {
            this.notifyChanges(true);
        }
    }

    /**
     * @hidden
     */
    protected onColumnsChanged(change: QueryList<IgxColumnComponent>) {
        const diff = this.columnListDiffer.diff(change);

        if (this.autoGenerate && this._columns.length === 0 && this._autoGeneratedCols.length > 0) {
            // In Ivy if there are nested conditional templates the content children are re-evaluated
            // hence autogenerated columns are cleared and need to be reset.
            this.updateColumns(this._autoGeneratedCols);
            return;
        }
        if (diff) {
            let added = false;
            let removed = false;
            diff.forEachAddedItem((record: IterableChangeRecord<IgxColumnComponent>) => {
                added = true;
                if (record.item.pinned) {
                    this._pinnedColumns.push(record.item);
                } else {
                    this._unpinnedColumns.push(record.item);
                }
            });

            this.initColumns(this.columnList.toArray(), (col: IgxColumnComponent) => this.columnInit.emit(col));

            diff.forEachRemovedItem((record: IterableChangeRecord<IgxColumnComponent | IgxColumnGroupComponent>) => {
                const isColumnGroup = record.item instanceof IgxColumnGroupComponent;
                if (!isColumnGroup) {
                    // Clear Grouping
                    this.gridAPI.clear_groupby(record.item.field);

                    // Clear Filtering
                    this.filteringService.clear_filter(record.item.field);

                    // Close filter row
                    if (this.filteringService.isFilterRowVisible
                        && this.filteringService.filteredColumn
                        && this.filteringService.filteredColumn.field === record.item.field) {
                        this.filteringRow.close();
                    }

                    // Clear Sorting
                    this.gridAPI.clear_sort(record.item.field);

                    // Remove column selection
                    this.selectionService.deselectColumnsWithNoEvent([record.item.field]);
                }
                removed = true;
            });

            this.resetCaches();

            if (added || removed) {
                this.summaryService.clearSummaryCache();
                Promise.resolve().then(() => {
                    // `onColumnsChanged` can be executed midway a current detectChange cycle and markForCheck will be ignored then.
                    // This ensures that we will wait for the current cycle to end so we can trigger a new one and ngDoCheck to fire.
                    this.notifyChanges(true);
                });
            }
        }
    }

    /**
     * @hidden
     */
    protected calculateGridSizes(recalcFeatureWidth = true) {
        /*
            TODO: (R.K.) This layered lasagne should be refactored
            ASAP. The reason I have to reset the caches so many times is because
            after teach `detectChanges` call they are filled with invalid
            state. Of course all of this happens midway through the grid
            sizing process which of course, uses values from the caches, thus resulting
            in a broken layout.
        */
        this.resetCaches(recalcFeatureWidth);
        this.cdr.detectChanges();
        const hasScroll = this.hasVerticalScroll();
        this.calculateGridWidth();
        this.resetCaches(recalcFeatureWidth);
        this.cdr.detectChanges();
        this.calculateGridHeight();

        if (this.rowEditable) {
            this.repositionRowEditingOverlay(this.crudService.rowInEditMode);
        }

        if (this.filteringService.isFilterRowVisible) {
            this.filteringRow.resetChipsArea();
        }

        this.cdr.detectChanges();
        // in case scrollbar has appeared recalc to size correctly.
        if (hasScroll !== this.hasVerticalScroll()) {
            this.calculateGridWidth();
            this.cdr.detectChanges();
        }
        if (this.zone.isStable) {
            this.zone.run(() => {
                this._applyWidthHostBinding();
                this.cdr.detectChanges();
            });
        } else {
            this.zone.onStable.pipe(first()).subscribe(() => {
                this.zone.run(() => {
                    this._applyWidthHostBinding();
                });
            });
        }
        this.resetCaches(recalcFeatureWidth);
        if (this.hasColumnsToAutosize) {
            this.cdr.detectChanges();
            this.zone.onStable.pipe(first()).subscribe(() => {
                this.autoSizeColumnsInView();
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    protected calcGridHeadRow() {
        if (this.maxLevelHeaderDepth) {
            this._baseFontSize = parseFloat(getComputedStyle(this.document.documentElement).getPropertyValue('font-size'));
            let minSize = (this.maxLevelHeaderDepth + 1) * this.defaultRowHeight / this._baseFontSize;
            if (this._allowFiltering && this._filterMode === FilterMode.quickFilter) {
                minSize += (FILTER_ROW_HEIGHT + 1) / this._baseFontSize;
            }
            this.theadRow.nativeElement.style.minHeight = `${minSize}rem`;
        }
    }

    /**
     * @hidden
     * Sets TBODY height i.e. this.calcHeight
     */
    protected calculateGridHeight() {
        this.calcGridHeadRow();

        this.calcHeight = this._calculateGridBodyHeight();
        if (this.pinnedRowHeight && this.calcHeight) {
            this.calcHeight -= this.pinnedRowHeight;
        }
    }

    /**
     * @hidden
     */
    protected getGroupAreaHeight(): number {
        return 0;
    }

    /**
     * @hidden
     */
    protected getComputedHeight(elem) {
        return elem.offsetHeight ? parseFloat(this.document.defaultView.getComputedStyle(elem).getPropertyValue('height')) : 0;
    }
    /**
     * @hidden
     */
    protected getFooterHeight(): number {
        return this.summaryRowHeight || this.getComputedHeight(this.tfoot.nativeElement);
    }
    /**
     * @hidden
     */
    protected getTheadRowHeight(): number {
        // D.P.: Before CSS loads,theadRow computed height will be 'auto'->NaN, so use 0 fallback
        const height = this.getComputedHeight(this.theadRow.nativeElement) || 0;
        return (!this.allowFiltering || (this.allowFiltering && this.filterMode !== FilterMode.quickFilter)) ?
            height - this.getFilterCellHeight() :
            height;
    }

    /**
     * @hidden
     */
    protected getToolbarHeight(): number {
        let toolbarHeight = 0;
        if (this.toolbar.first) {
            toolbarHeight = this.getComputedHeight(this.toolbar.first.nativeElement);
        }
        return toolbarHeight;
    }

    /**
     * @hidden
     */
    protected getPagingFooterHeight(): number {
        let pagingHeight = 0;
        if (this.footer) {
            const height = this.getComputedHeight(this.footer.nativeElement);
            pagingHeight = this.footer.nativeElement.firstElementChild ?
                height : 0;
        }
        return pagingHeight;
    }

    /**
     * @hidden
     */
    protected getFilterCellHeight(): number {
        const headerGroupNativeEl = (this.headerGroupsList.length !== 0) ?
            this.headerGroupsList[0].nativeElement : null;
        const filterCellNativeEl = (headerGroupNativeEl) ?
            headerGroupNativeEl.querySelector('igx-grid-filtering-cell') as HTMLElement : null;
        return (filterCellNativeEl) ? filterCellNativeEl.offsetHeight : 0;
    }

    /**
     * @hidden
     */
    protected _calculateGridBodyHeight(): number {
        if (!this._height) {
            return null;
        }
        const actualTheadRow = this.getTheadRowHeight();
        const footerHeight = this.getFooterHeight();
        const toolbarHeight = this.getToolbarHeight();
        const pagingHeight = this.getPagingFooterHeight();
        const groupAreaHeight = this.getGroupAreaHeight();
        const scrHeight = this.getComputedHeight(this.scr.nativeElement);
        const renderedHeight = toolbarHeight + actualTheadRow +
            footerHeight + pagingHeight + groupAreaHeight +
            scrHeight;

        let gridHeight = 0;

        if (this.isPercentHeight) {
            const computed = this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue('height');
            const autoSize = this._shouldAutoSize(renderedHeight);
            if (autoSize || computed.indexOf('%') !== -1) {
                const bodyHeight = this.getDataBasedBodyHeight();
                return bodyHeight > 0 ? bodyHeight : null;
            }
            gridHeight = parseFloat(computed);
        } else {
            gridHeight = parseInt(this._height, 10);
        }
        const height = Math.abs(gridHeight - renderedHeight);

        if (Math.round(height) === 0 || isNaN(gridHeight)) {
            const bodyHeight = this.defaultTargetBodyHeight;
            return bodyHeight > 0 ? bodyHeight : null;
        }
        return height;
    }

    protected checkContainerSizeChange() {
        const parentElement = this.nativeElement.parentElement || (this.nativeElement.getRootNode() as any).host;
        const origHeight = parentElement.offsetHeight;
        this.nativeElement.style.display = 'none';
        const height = parentElement.offsetHeight;
        this.nativeElement.style.display = '';
        return origHeight !== height;
    }

    protected _shouldAutoSize(renderedHeight) {
        this.tbody.nativeElement.style.display = 'none';
        const parentElement = this.nativeElement.parentElement || (this.nativeElement.getRootNode() as any).host;
        let res = !parentElement ||
        parentElement.clientHeight === 0 ||
        parentElement.clientHeight === renderedHeight;
        if ((!this.platform.isChromium && !this.platform.isFirefox) || this._autoSize) {
            // If grid causes the parent container to extend (for example when container is flex)
            // we should always auto-size since the actual size of the container will continuously change as the grid renders elements.
            this._autoSize = false;
            res = this.checkContainerSizeChange();
        }
        this.tbody.nativeElement.style.display = '';
        return res;
    }

    /**
     * @hidden
     * Gets calculated width of the unpinned area
     * @param takeHidden If we should take into account the hidden columns in the pinned area.
     */
    protected getUnpinnedWidth(takeHidden = false) {
        let width = this.isPercentWidth ?
            this.calcWidth :
            parseInt(this.width, 10) || parseInt(this.hostWidth, 10) || this.calcWidth;
        if (this.hasVerticalScroll() && !this.isPercentWidth) {
            width -= this.scrollSize;
        }
        if (!this.isPinningToStart) {
            width -= this.featureColumnsWidth();
        }

        return width - this.getPinnedWidth(takeHidden);
    }

    /**
     * @hidden
     */
    protected _summaries(fieldName: string, hasSummary: boolean, summaryOperand?: any) {
        const column = this.gridAPI.get_column_by_name(fieldName);
        if (column) {
            column.hasSummary = hasSummary;
            if (summaryOperand) {
                if (this.rootSummariesEnabled) {
                    this.summaryService.retriggerRootPipe++;
                }
                column.summaries = summaryOperand;
            }
        }
    }

    /**
     * @hidden
     */
    protected _multipleSummaries(expressions: ISummaryExpression[], hasSummary: boolean) {
        expressions.forEach((element) => {
            this._summaries(element.fieldName, hasSummary, element.customSummary);
        });
    }
    /**
     * @hidden
     */
    protected _disableMultipleSummaries(expressions) {
        expressions.forEach((column) => {
            const columnName = column && column.fieldName ? column.fieldName : column;
            this._summaries(columnName, false);
        });
    }

    /**
     * @hidden
     */
    public resolveDataTypes(rec) {
        if (typeof rec === 'number') {
            return GridColumnDataType.Number;
        } else if (typeof rec === 'boolean') {
            return GridColumnDataType.Boolean;
        } else if (typeof rec === 'object' && rec instanceof Date) {
            return GridColumnDataType.Date;
        }
        return GridColumnDataType.String;
    }

    /**
     * @hidden
     */
    protected autogenerateColumns() {
        const data = this.gridAPI.get_data();
        const factory = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const fields = this.generateDataFields(data);
        const columns = [];

        fields.forEach((field) => {
            const ref = factory.create(this.viewRef.injector);
            ref.instance.field = field;
            ref.instance.dataType = this.resolveDataTypes(data[0][field]);
            ref.changeDetectorRef.detectChanges();
            columns.push(ref.instance);
        });
        this._autoGeneratedCols = columns;

        this.updateColumns(columns);
        if (data && data.length > 0) {
            this.shouldGenerate = false;
        }
    }

    protected generateDataFields(data: any[]): string[] {
        return Object.keys(data && data.length !== 0 ? data[0] : []);
    }

    /**
     * @hidden
     */
    protected initColumns(collection: IgxColumnComponent[], cb: (args: any) => void = null) {
        this._columnGroups = collection.some(col => col.columnGroup);
        if (this.hasColumnLayouts) {
            // Set overall row layout size
            collection.forEach((col) => {
                if (col.columnLayout) {
                    const layoutSize = col.children ?
                        col.children.reduce((acc, val) => Math.max(val.rowStart + val.gridRowSpan - 1, acc), 1) :
                        1;
                    this._multiRowLayoutRowSize = Math.max(layoutSize, this._multiRowLayoutRowSize);
                }
            });
        }
        if (this.hasColumnLayouts && this.hasColumnGroups) {
            // invalid configuration - multi-row and column groups
            // remove column groups
            const columnLayoutColumns = collection.filter((col) => col.columnLayout || col.columnLayoutChild);
            collection = columnLayoutColumns;
        }
        this._maxLevelHeaderDepth = null;
        collection.forEach((column: IgxColumnComponent) => {
            column.defaultWidth = this.columnWidthSetByUser ? this._columnWidth : column.defaultWidth ? column.defaultWidth : '';

            if (cb) {
                cb(column);
            }
        });

        this.updateColumns(collection);

        if (this.hasColumnLayouts) {
            collection.forEach((column: IgxColumnComponent) => {
                column.populateVisibleIndexes();
            });
        }
    }

    /**
     * @hidden
     */
    protected reinitPinStates() {
        this._pinnedColumns = this._columns
            .filter((c) => c.pinned).sort((a, b) => this._pinnedColumns.indexOf(a) - this._pinnedColumns.indexOf(b));
        this._unpinnedColumns = this.hasColumnGroups ? this._columns.filter((c) => !c.pinned) :
            this._columns.filter((c) => !c.pinned)
                .sort((a, b) => this._unpinnedColumns.indexOf(a) - this._unpinnedColumns.indexOf(b));
    }

    protected extractDataFromSelection(source: any[], formatters = false, headers = false, columnData?: any[]): any[] {
        let columnsArray: IgxColumnComponent[];
        let record = {};
        let selectedData = [];
        let keys = [];
        const selectionCollection = new Map();
        const keysAndData = [];
        const activeEl = this.selectionService.activeElement;

        if (this.nativeElement.tagName.toLowerCase() === 'igx-hierarchical-grid') {
            const expansionRowIndexes = [];
            for (const [key, value] of this.expansionStates.entries()) {
                if (value) {
                    expansionRowIndexes.push(key);
                }
            }
            if (this.selectionService.selection.size > 0) {
                if (expansionRowIndexes.length > 0) {
                    for (const [key, value] of this.selectionService.selection.entries()) {
                        let updatedKey = key;
                        expansionRowIndexes.forEach(row => {
                            let rowIndex;
                            if (!isNaN(row.ID)) {
                                rowIndex = Number(row.ID);
                            } else {
                                rowIndex = Number(row);
                            }

                            if (updatedKey > Number(rowIndex)) {
                                updatedKey--;
                            }
                        });
                        selectionCollection.set(updatedKey, value);
                    }
                }
            } else if (activeEl) {
                if (expansionRowIndexes.length > 0) {
                    expansionRowIndexes.forEach(row => {
                        if (activeEl.row > Number(row)) {
                            activeEl.row--;
                        }
                    });
                }
            }
        }

        const totalItems = (this as any).totalItemCount ?? 0;
        const isRemote = totalItems && totalItems > this.dataView.length;
        let selectionMap;
        if (this.nativeElement.tagName.toLowerCase() === 'igx-hierarchical-grid' && selectionCollection.size > 0) {
            selectionMap = isRemote ? Array.from(selectionCollection) :
                Array.from(selectionCollection).filter((tuple) => tuple[0] < source.length);
        } else {
            selectionMap = isRemote ? Array.from(this.selectionService.selection) :
                Array.from(this.selectionService.selection).filter((tuple) => tuple[0] < source.length);
        }

        if (this.cellSelection === GridSelectionMode.single && activeEl) {
            selectionMap.push([activeEl.row, new Set<number>().add(activeEl.column)]);
        }

        if (this.cellSelection === GridSelectionMode.none && activeEl) {
            selectionMap.push([activeEl.row, new Set<number>().add(activeEl.column)]);
        }

        if (columnData) {
            selectedData = columnData;
        }

        // eslint-disable-next-line prefer-const
        for (let [row, set] of selectionMap) {
            row = this.paginator && (this.pagingMode === GridPagingMode.Local && source === this.filteredSortedData) ? row + (this.paginator.perPage * this.paginator.page) : row;
            row = isRemote ? row - this.virtualizationState.startIndex : row;
            if (!source[row] || source[row].detailsData !== undefined) {
                continue;
            }
            const temp = Array.from(set);
            for (const each of temp) {
                columnsArray = this.getSelectableColumnsAt(each);
                columnsArray.forEach((col) => {
                    if (col) {
                        const key = headers ? col.header || col.field : col.field;
                        const rowData = source[row].ghostRecord ? source[row].recordRef : source[row];
                        const value = resolveNestedPath(rowData, col.field);
                        record[key] = formatters && col.formatter ? col.formatter(value, rowData) : value;
                        if (columnData) {
                            if (!record[key]) {
                                record[key] = '';
                            }
                            record[key] = record[key].toString().concat('recordRow-' + row);
                        }
                    }
                });
            }
            if (Object.keys(record).length) {
                if (columnData) {
                    if (!keys.length) {
                        keys = Object.keys(columnData[0]);
                    }
                    for (const [key, value] of Object.entries(record)) {
                        if (!keys.includes(key)) {
                            keys.push(key);
                        }
                        let c: any = value;
                        const rowNumber = +c.split('recordRow-')[1];
                        c = c.split('recordRow-')[0];
                        record[key] = c;
                        const mergedObj = Object.assign(selectedData[rowNumber], record);
                        selectedData[rowNumber] = mergedObj;
                    }
                } else {
                    selectedData.push(record);
                }
            }
            record = {};
        }

        if (keys.length) {
            keysAndData.push(selectedData);
            keysAndData.push(keys);
            return keysAndData;
        } else {
            return selectedData;
        }
    }

    protected getSelectableColumnsAt(index) {
        if (this.hasColumnLayouts) {
            const visibleLayoutColumns = this.visibleColumns
                .filter(col => col.columnLayout)
                .sort((a, b) => a.visibleIndex - b.visibleIndex);
            const colLayout = visibleLayoutColumns[index];
            return colLayout ? colLayout.children.toArray() : [];
        } else {
            const visibleColumns = this.visibleColumns
                .filter(col => !col.columnGroup)
                .sort((a, b) => a.visibleIndex - b.visibleIndex);
            return [visibleColumns[index]];
        }
    }

    protected autoSizeColumnsInView() {
        if (!this.hasColumnsToAutosize) return;
        const vState = this.headerContainer.state;
        let colResized = false;
        const unpinnedInView = this.headerContainer.igxGridForOf.slice(vState.startIndex, vState.startIndex + vState.chunkSize).flatMap(x => x.columnGroup ? x.allChildren : x);
        const columnsInView = this.pinnedColumns.concat(unpinnedInView);
        for (const col of columnsInView) {
            if (!col.autoSize && col.headerCell) {
                const cellsContentWidths = [];
                if (col._cells.length !== this.rowList.length) {
                    this.rowList.forEach(x => x.cdr.detectChanges());
                }
                const cells = this._dataRowList.map(x => x.cells.find(c => c.column === col));
                cells.forEach((cell) => cellsContentWidths.push(cell?.nativeElement?.offsetWidth || 0));
                const max = Math.max(...cellsContentWidths);
                if (max === 0) {
                    // cells not in DOM yet...
                    continue;
                }
                const header = this.headerCellList.find(x => x.column === col);
                cellsContentWidths.push(header.nativeElement.offsetWidth);
                let maxSize = Math.ceil(Math.max(...cellsContentWidths)) + 1;
                if (col.maxWidth && maxSize > col.maxWidthPx) {
                    maxSize = col.maxWidthPx;
                } else if (maxSize < col.minWidthPx) {
                    maxSize = col.minWidthPx;
                }
                col.autoSize = maxSize;
                col.resetCaches();
                colResized = true;
            }
        }
        if (colResized) {
            this.resetCachedWidths();
            this.cdr.detectChanges();
        }
    }

    protected extractDataFromColumnsSelection(source: any[], formatters = false, headers = false): any[] {
        let record = {};
        const selectedData = [];
        const selectedColumns = this.selectedColumns();
        if (selectedColumns.length === 0) {
            return [];
        }

        for (const data of source) {
            selectedColumns.forEach((col) => {
                const key = headers ? col.header || col.field : col.field;
                record[key] = formatters && col.formatter ? col.formatter(data[col.field], data)
                    : data[col.field];
            });

            if (Object.keys(record).length) {
                selectedData.push(record);
            }
            record = {};
        }
        return selectedData;
    }

    /**
     * @hidden
     */
    protected initPinning() {
        const pinnedColumns = [];
        const unpinnedColumns = [];

        this.calculateGridWidth();
        this.resetCaches();
        // When a column is a group or is inside a group, pin all related.
        this._pinnedColumns.forEach(col => {
            if (col.parent) {
                col.parent.pinned = true;
            }
            if (col.columnGroup) {
                col.children.forEach(child => child.pinned = true);
            }
        });

        // Make sure we don't exceed unpinned area min width and get pinned and unpinned col collections.
        // We take into account top level columns (top level groups and non groups).
        // If top level is unpinned the pinning handles all children to be unpinned as well.
        for (const column of this._columns) {
            if (column.pinned && !column.parent) {
                pinnedColumns.push(column);
            } else if (column.pinned && column.parent) {
                if (column.topLevelParent.pinned) {
                    pinnedColumns.push(column);
                } else {
                    column.pinned = false;
                    unpinnedColumns.push(column);
                }
            } else {
                unpinnedColumns.push(column);
            }
        }

        // Assign the applicable collections.
        this._pinnedColumns = pinnedColumns;
        this._unpinnedColumns = unpinnedColumns;
        this.notifyChanges();
    }

    /**
     * @hidden
     */
    protected scrollTo(row: any | number, column: any | number, inCollection = this._filteredSortedUnpinnedData): void {
        let delayScrolling = false;

        if (this.paginator && typeof (row) !== 'number') {
            const rowIndex = inCollection.indexOf(row);
            const page = Math.floor(rowIndex / this.paginator.perPage);

            if (this.paginator.page !== page) {
                delayScrolling = true;
                this.paginator.page = page;
            }
        }

        if (delayScrolling) {
            this.verticalScrollContainer.dataChanged.pipe(first()).subscribe(() => {
                this.scrollDirective(this.verticalScrollContainer,
                    typeof (row) === 'number' ? row : this.unpinnedDataView.indexOf(row));
            });
        } else {
            this.scrollDirective(this.verticalScrollContainer,
                typeof (row) === 'number' ? row : this.unpinnedDataView.indexOf(row));
        }

        this.scrollToHorizontally(column);
    }

    /**
     * @hidden
     */
    protected scrollToHorizontally(column: any | number) {
        let columnIndex = typeof column === 'number' ? column : this.getColumnByName(column).visibleIndex;
        const scrollRow = this.rowList.find(r => !!r.virtDirRow);
        const virtDir = scrollRow ? scrollRow.virtDirRow : null;
        if (this.isPinningToStart && this.pinnedColumns.length) {
            if (columnIndex >= this.pinnedColumns.length) {
                columnIndex -= this.pinnedColumns.length;
                this.scrollDirective(virtDir, columnIndex);
            }
        } else {
            this.scrollDirective(virtDir, columnIndex);
        }
    }

    /**
     * @hidden
     */
    protected scrollDirective(directive: IgxGridForOfDirective<any>, goal: number): void {
        if (!directive) {
            return;
        }
        directive.scrollTo(goal);
    }

    private getColumnWidthSum(): number {
        let colSum = 0;
        const cols = this.hasColumnLayouts ?
            this.visibleColumns.filter(x => x.columnLayout) : this.visibleColumns.filter(x => !x.columnGroup);
        cols.forEach((item) => {
            colSum += parseInt((item.calcWidth || item.defaultWidth), 10) || this.minColumnWidth;
        });
        if (!colSum) {
            return null;
        }
        this.cdr.detectChanges();
        colSum += this.featureColumnsWidth();
        return colSum;
    }

    private configToColumns(config: IgxColumn[]) {
        const factory = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const columns: IgxColumnComponent[] = [];

        config.forEach(column => {
            const newColumn = factory.create(this.viewRef.injector);
            for (const prop in column) {
                newColumn.instance[prop] = column[prop];
            }
            newColumn.changeDetectorRef.detectChanges();
            columns.push(newColumn.instance);
        });

        this.columnList.reset(columns);
    }

    /**
     * Notify changes, reset cache and populateVisibleIndexes.
     *
     * @hidden
     */
    private _columnsReordered(column: IgxColumnComponent) {
        this.notifyChanges();
        if (this.hasColumnLayouts) {
            this._columns.filter(x => x.columnLayout).forEach(x => x.populateVisibleIndexes());
        }
        // after reordering is done reset cached column collections.
        this.resetColumnCollections();
        column.resetCaches();
    }

    protected buildDataView(data: any[]) {
        this._dataView = this.isRowPinningToTop ?
            [...this.pinnedDataView, ...this.unpinnedDataView] :
            [...this.unpinnedDataView, ...this.pinnedDataView];
    }

    private _applyWidthHostBinding() {
        let width = this._width;
        if (width === null) {
            let currentWidth = this.calcWidth;
            if (this.hasVerticalScroll()) {
                currentWidth += this.scrollSize;
            }
            width = currentWidth + 'px';
            this.resetCaches();
        }
        this._hostWidth = width;
        this.cdr.markForCheck();
    }

    protected verticalScrollHandler(event) {
        this.verticalScrollContainer.onScroll(event);
        this.disableTransitions = true;

        this.zone.run(() => {
            this.zone.onStable.pipe(first()).subscribe(() => {
                this.verticalScrollContainer.chunkLoad.emit(this.verticalScrollContainer.state);
                if (this.rowEditable) {
                    this.changeRowEditingOverlayStateOnScroll(this.crudService.rowInEditMode);
                }
            });
        });
        this.disableTransitions = false;

        this.hideOverlays();
        this.actionStrip?.hide();
        if (this.actionStrip) {
            this.actionStrip.context = null;
        }
        const args: IGridScrollEventArgs = {
            direction: 'vertical',
            event,
            scrollPosition: this.verticalScrollContainer.scrollPosition
        };
        this.gridScroll.emit(args);
    }

    protected horizontalScrollHandler(event) {
        const scrollLeft = event.target.scrollLeft;
        this.headerContainer.onHScroll(scrollLeft);
        this._horizontalForOfs.forEach(vfor => vfor.onHScroll(scrollLeft));
        this.cdr.markForCheck();

        this.zone.run(() => {
            this.zone.onStable.pipe(first()).subscribe(() => {
                this.parentVirtDir.chunkLoad.emit(this.headerContainer.state);
                requestAnimationFrame(() => {
                    this.autoSizeColumnsInView();
                });
            });
        });

        this.hideOverlays();
        const args: IGridScrollEventArgs = { direction: 'horizontal', event, scrollPosition: this.headerContainer.scrollPosition };
        this.gridScroll.emit(args);
    }

    private executeCallback(rowIndex, visibleColIndex = -1, cb: (args: any) => void = null) {
        if (!cb) {
            return;
        }
        let row = this.summariesRowList.filter(s => s.index !== 0).concat(this.rowList.toArray()).find(r => r.index === rowIndex);
        if (!row) {
            if ((this as any).totalItemCount) {
                this.verticalScrollContainer.dataChanged.pipe(first()).subscribe(() => {
                    this.cdr.detectChanges();
                    row = this.summariesRowList.filter(s => s.index !== 0).concat(this.rowList.toArray()).find(r => r.index === rowIndex);
                    const cbArgs = this.getNavigationArguments(row, visibleColIndex);
                    cb(cbArgs);
                });
            }
            const dataViewIndex = this._getDataViewIndex(rowIndex);
            if (this.dataView[dataViewIndex].detailsData) {
                this.navigation.setActiveNode({ row: rowIndex });
                this.cdr.detectChanges();
            }

            return;
        }
        const args = this.getNavigationArguments(row, visibleColIndex);
        cb(args);
    }

    private getNavigationArguments(row, visibleColIndex) {
        let targetType: GridKeydownTargetType; let target;
        switch (row.nativeElement.tagName.toLowerCase()) {
            case 'igx-grid-groupby-row':
                targetType = 'groupRow';
                target = row;
                break;
            case 'igx-grid-summary-row':
                targetType = 'summaryCell';
                target = visibleColIndex !== -1 ?
                    row.summaryCells.find(c => c.visibleColumnIndex === visibleColIndex) : row.summaryCells.first;
                break;
            case 'igx-child-grid-row':
                targetType = 'hierarchicalRow';
                target = row;
                break;
            default:
                targetType = 'dataCell';
                target = visibleColIndex !== -1 ? row.cells.find(c => c.visibleColumnIndex === visibleColIndex) : row.cells.first;
                break;
        }
        return { targetType, target };
    }

    private getNextDataRowIndex(currentRowIndex, previous = false): number {
        const resolvedIndex = this._getDataViewIndex(currentRowIndex);
        if (currentRowIndex < 0 || (currentRowIndex === 0 && previous) || (resolvedIndex >= this.dataView.length - 1 && !previous)) {
            return currentRowIndex;
        }
        // find next/prev record that is editable.
        const nextRowIndex = previous ? this.findPrevEditableDataRowIndex(currentRowIndex) :
            this.dataView.findIndex((rec, index) =>
                index > resolvedIndex && this.isEditableDataRecordAtIndex(index));
        const nextDataIndex = this.getDataIndex(nextRowIndex);
        return nextDataIndex !== -1 ? nextDataIndex : currentRowIndex;
    }

    /**
     * Returns the previous editable row index or -1 if no such row is found.
     *
     * @param currentIndex The index of the current editable record.
     */
    private findPrevEditableDataRowIndex(currentIndex): number {
        let i = this.dataView.length;
        const resolvedIndex = this._getDataViewIndex(currentIndex);
        while (i--) {
            if (i < resolvedIndex && this.isEditableDataRecordAtIndex(i)) {
                return i;
            }
        }
        return -1;
    }


    /**
     * Returns if the record at the specified data view index is a an editable data record.
     * If record is group rec, summary rec, child rec, ghost rec. etc. it is not editable.
     *
     * @param dataViewIndex The index of that record in the data view.
     *
     */
    // TODO: Consider moving it into CRUD
    private isEditableDataRecordAtIndex(dataViewIndex) {
        const rec = this.dataView[dataViewIndex];
        return !rec.expression && !rec.summaries && !rec.childGridsData && !rec.detailsData &&
            !this.isGhostRecordAtIndex(dataViewIndex);
    }

    /**
     * Returns if the record at the specified data view index is a ghost.
     * If record is pinned but is not in pinned area then it is a ghost record.
     *
     * @param dataViewIndex The index of that record in the data view.
     */
    private isGhostRecordAtIndex(dataViewIndex) {
        const isPinned = this.isRecordPinned(this.dataView[dataViewIndex]);
        const isInPinnedArea = this.isRecordPinnedByViewIndex(dataViewIndex);
        return isPinned && !isInPinnedArea;
    }

    private isValidPosition(rowIndex, colIndex): boolean {
        const rows = this.summariesRowList.filter(s => s.index !== 0).concat(this.rowList.toArray()).length;
        const cols = this._columns.filter(col => !col.columnGroup && col.visibleIndex >= 0 && !col.hidden).length;
        if (rows < 1 || cols < 1) {
            return false;
        }
        if (rowIndex > -1 && rowIndex < this.dataView.length &&
            colIndex > - 1 && colIndex <= Math.max(...this.visibleColumns.map(c => c.visibleIndex))) {
            return true;
        }
        return false;
    }

    private find(text: string, increment: number, caseSensitive?: boolean, exactMatch?: boolean, scroll?: boolean, endEdit = true) {
        if (!this.rowList) {
            return 0;
        }

        if (endEdit) {
            this.crudService.endEdit(false);
        }

        if (!text) {
            this.clearSearch();
            return 0;
        }

        const caseSensitiveResolved = caseSensitive ? true : false;
        const exactMatchResolved = exactMatch ? true : false;
        let rebuildCache = false;

        if (this.lastSearchInfo.searchText !== text ||
            this.lastSearchInfo.caseSensitive !== caseSensitiveResolved ||
            this.lastSearchInfo.exactMatch !== exactMatchResolved) {
            this.lastSearchInfo = {
                searchText: text,
                activeMatchIndex: 0,
                caseSensitive: caseSensitiveResolved,
                exactMatch: exactMatchResolved,
                matchInfoCache: []
            };

            rebuildCache = true;
        } else {
            this.lastSearchInfo.activeMatchIndex += increment;
        }

        if (rebuildCache) {
            this.rowList.forEach((row) => {
                if (row.cells) {
                    row.cells.forEach((c: IgxGridCellComponent) => {
                        c.highlightText(text, caseSensitiveResolved, exactMatchResolved);
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
            this.lastSearchInfo = { ...this.lastSearchInfo };

            if (scroll !== false) {
                this.scrollTo(matchInfo.row, matchInfo.column);
            }

            IgxTextHighlightDirective.setActiveHighlight(this.id, {
                column: matchInfo.column,
                row: matchInfo.row,
                index: matchInfo.index,
                metadata: matchInfo.metadata,
            });

        } else {
            IgxTextHighlightDirective.clearActiveHighlight(this.id);
        }

        return this.lastSearchInfo.matchInfoCache.length;
    }

    private rebuildMatchCache() {
        this.lastSearchInfo.matchInfoCache = [];

        const caseSensitive = this.lastSearchInfo.caseSensitive;
        const exactMatch = this.lastSearchInfo.exactMatch;
        const searchText = caseSensitive ? this.lastSearchInfo.searchText : this.lastSearchInfo.searchText.toLowerCase();
        const data = this.filteredSortedData;
        const columnItems = this.visibleColumns.filter((c) => !c.columnGroup).sort((c1, c2) => c1.visibleIndex - c2.visibleIndex);
        data.forEach((dataRow, rowIndex) => {
            columnItems.forEach((c) => {
                const pipeArgs = this.getColumnByName(c.field).pipeArgs;
                const value = c.formatter ? c.formatter(resolveNestedPath(dataRow, c.field), dataRow) :
                    c.dataType === 'number' ? formatNumber(resolveNestedPath(dataRow, c.field), this.locale, pipeArgs.digitsInfo) :
                        c.dataType === 'date'
                            ? formatDate(resolveNestedPath(dataRow, c.field), pipeArgs.format, this.locale, pipeArgs.timezone)
                            : resolveNestedPath(dataRow, c.field);
                if (value !== undefined && value !== null && c.searchable) {
                    let searchValue = caseSensitive ? String(value) : String(value).toLowerCase();

                    if (exactMatch) {
                        if (searchValue === searchText) {
                            const metadata = new Map<string, any>();
                            metadata.set('pinned', this.isRecordPinnedByIndex(rowIndex));
                            this.lastSearchInfo.matchInfoCache.push({
                                row: dataRow,
                                column: c.field,
                                index: 0,
                                metadata,
                            });
                        }
                    } else {
                        let occurenceIndex = 0;
                        let searchIndex = searchValue.indexOf(searchText);

                        while (searchIndex !== -1) {
                            const metadata = new Map<string, any>();
                            metadata.set('pinned', this.isRecordPinnedByIndex(rowIndex));
                            this.lastSearchInfo.matchInfoCache.push({
                                row: dataRow,
                                column: c.field,
                                index: occurenceIndex++,
                                metadata,
                            });

                            searchValue = searchValue.substring(searchIndex + searchText.length);
                            searchIndex = searchValue.indexOf(searchText);
                        }
                    }
                }
            });
        });
    }

    // TODO: About to Move to CRUD
    private configureRowEditingOverlay(rowID: any, useOuter = false) {
        let settings = this.rowEditSettings;
        const overlay = this.overlayService.getOverlayById(this.rowEditingOverlay.overlayId);
        if (overlay) {
            settings = overlay.settings;
        }
        settings.outlet = useOuter ? this.parentRowOutletDirective : this.rowOutletDirective;
        this.rowEditPositioningStrategy.settings.container = this.tbody.nativeElement;
        const pinned = this._pinnedRecordIDs.indexOf(rowID) !== -1;
        const targetRow = !pinned ?
            this.gridAPI.get_row_by_key(rowID) as IgxRowDirective
            : this.pinnedRows.find(x => x.key === rowID) as IgxRowDirective;
        if (!targetRow) {
            return;
        }
        settings.target = targetRow.element.nativeElement;
        this.toggleRowEditingOverlay(true);
    }
}
