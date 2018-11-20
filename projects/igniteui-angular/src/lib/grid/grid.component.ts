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
    HostListener,
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
import { Subject, of } from 'rxjs';
import { take, takeUntil, debounceTime, merge, delay, repeat } from 'rxjs/operators';
import { IgxSelectionAPIService } from '../core/selection';
import { cloneArray, DisplayDensity } from '../core/utils';
import { DataType, DataUtil } from '../data-operations/data-util';
import { FilteringLogic, IFilteringExpression } from '../data-operations/filtering-expression.interface';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { IGroupingExpression } from '../data-operations/grouping-expression.interface';
import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { IForOfState, IgxForOfDirective } from '../directives/for-of/for_of.directive';
import { IgxTextHighlightDirective } from '../directives/text-highlight/text-highlight.directive';
import { IgxBaseExporter, IgxExporterOptionsBase } from '../services/index';
import { IgxCheckboxComponent } from './../checkbox/checkbox.component';
import { IgxGridAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { IColumnVisibilityChangedEventArgs } from './column-hiding-item.directive';
import { IgxColumnComponent } from './column.component';
import { ISummaryExpression } from './grid-summary';
import { IgxGroupByRowTemplateDirective } from './grid.common';
import { IgxGridToolbarComponent } from './grid-toolbar.component';
import { IgxGridSortingPipe } from './grid.pipes';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './row.component';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IFilteringExpressionsTree, FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IFilteringOperation } from '../data-operations/filtering-condition';

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

    /**
     * An @Input property that lets you fill the `IgxGridComponent` with an array of data.
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public data = [];

    /**
     * An @Input property that autogenerates the `IgxGridComponent` columns.
     * The default value is false.
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public autoGenerate = false;

    /**
     * An @Input property that sets the value of the `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-grid [id]="'igx-grid-1'" [data]="Data" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-grid-${NEXT_ID++}`;

    /**
     * An @Input property that sets a custom template when the `IgxGridComponent` is empty.
     * ```html
     * <igx-grid [id]="'igx-grid-1'" [data]="Data" [emptyGridTemplate]="myTemplate" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public emptyGridTemplate: TemplateRef<any>;

    @Input()
    public get filteringLogic() {
        return this._filteringExpressionsTree.operator;
    }

    /**
     * Sets the filtering logic of the `IgxGridComponent`.
     * The default is AND.
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true" [filteringLogic]="filtering"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    public set filteringLogic(value: FilteringLogic) {
        this._filteringExpressionsTree.operator = value;
    }

    /**
     * Returns the filtering state of `IgxGridComponent`.
     * ```typescript
     * let filteringExpressionsTree = this.grid.filteringExpressionsTree;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    get filteringExpressionsTree() {
        return this._filteringExpressionsTree;
    }

    /**
     * Sets the filtering state of the `IgxGridComponent`.
     * ```typescript
     * const logic = new FilteringExpressionsTree(FilteringLogic.And, "ID");
     * logic.filteringOperands = [
     *     {
     *          condition: IgxNumberFilteringOperand.instance().condition('greaterThan'),
     *          fieldName: 'ID',
     *          searchVal: 1
     *     }
     * ];
     * this.grid.filteringExpressionsTree = (logic);
     * ```
     * @memberof IgxGridComponent
     */
    set filteringExpressionsTree(value) {
        if (value) {
            this._filteringExpressionsTree = value;
            this.clearSummaryCache();
            this._pipeTrigger++;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        }
    }

    /**
     * Returns an array of objects containing the filtered data in the `IgxGridComponent`.
     * ```typescript
     * let filteredData = this.grid.filteredData;
     * ```
     * @memberof IgxGridComponent
     */
    get filteredData() {
        return this._filteredData;
    }

    /**
     * Sets an array of objects containing the filtered data in the `IgxGridComponent`.
     * ```typescript
     * this.grid.filteredData = [{
     *       ID: 1,
     *       Name: "A"
     * }];
     * ```
     * @memberof IgxGridComponent
     */
    set filteredData(value) {
        this._filteredData = value;

        if (this.rowSelectable) {
            this.updateHeaderCheckboxStatusOnFilter(this._filteredData);
        }

        this.restoreHighlight();
    }

    /**
     * Returns the group by state of the `IgxGridComponent`.
     * ```typescript
     * let groupByState = this.grid.groupingExpressions;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    get groupingExpressions(): IGroupingExpression[] {
        return this._groupingExpressions;
    }

    /**
     * Sets the group by state of the `IgxGridComponent`.
     * ```typescript
     * this.grid.groupingExpressions = [{
     *     fieldName: "ID",
     *     dir: SortingDirection.Asc,
     *     ignoreCase: false
     * }];
     * ```
     * @memberof IgxGridComponent
     */
    set groupingExpressions(value: IGroupingExpression[]) {
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

    /**
     * Returns a list of expansion states for group rows.
     * Includes only states that differ from the default one (controlled through groupsExpanded and states that the user has changed.
     * Contains the expansion state (expanded: boolean) and the unique identifier for the group row (Array).
     * ```typescript
     * const groupExpState = this.grid.groupingExpansionState;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    get groupingExpansionState() {
        return this._groupingExpandState;
    }

    /**
     * Sets a list of expansion states for group rows.
     * ```typescript
     *      this.grid.groupingExpansionState = [{
     *      expanded: false,
     *      hierarchy: [{ fieldName: 'ID', value: 1 }]
     *   }];
     * // You can use DataUtil.getHierarchy(groupRow) to get the group `IgxGridRowComponent` hierarchy.
     * ```
     * @memberof IgxGridComponent
     */
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

    /**
     * An @Input property that determines whether created groups are rendered expanded or collapsed.
     * The default rendered state is expanded.
     * ```html
     * <igx-grid #grid [data]="Data" [groupsExpanded]="false" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public groupsExpanded = true;

    /**
     * A hierarchical representation of the group by records.
     * ```typescript
     * let groupRecords = this.grid.groupsRecords;
     * ```
     * @memberof IgxGridComponent
     */
    public groupsRecords: IGroupByRecord[] = [];

    /**
     * Returns whether the paging feature is enabled/disabled.
     * The default state is disabled (false).
     * ```
     * const paging = this.grid.paging;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    get paging(): boolean {
        return this._paging;
    }

    /**
     * Enables/Disables the paging feature.
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true" [paging]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    set paging(value: boolean) {
        this._paging = value;
        this._pipeTrigger++;

        if (this._ngAfterViewInitPaassed) {
            this.cdr.detectChanges();
            this.calculateGridHeight();
            this.cdr.detectChanges();
        }
    }

    /**
     * Returns the current page index.
     * ```html
     * let gridPage = this.grid.page;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    get page(): number {
        return this._page;
    }

    /**
     * Sets the current page index.
     * <igx-grid #grid [data]="Data" [paging]="true" [page]="5" [autoGenerate]="true"></igx-grid>
     */
    set page(val: number) {
        if (val < 0 || val > this.totalPages - 1) {
            return;
        }

        this.onPagingDone.emit({ previous: this._page, current: val });
        this._page = val;
        this.cdr.markForCheck();
    }

    /**
     * Returns the number of visible items per page of the `IgxGridComponent`.
     * The default is 15.
     * ```html
     * let itemsPerPage = this.grid.perPage;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    get perPage(): number {
        return this._perPage;
    }

    /**
     * Sets the number of visible items per page of the `IgxGridComponent`.
     * ```html
     * <igx-grid #grid [data]="Data" [paging]="true" [perPage]="5" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    set perPage(val: number) {
        if (val < 0) {
            return;
        }

        this._perPage = val;
        this.page = 0;

        this.restoreHighlight();
    }

    /**
     * You can provide a custom `ng-template` for the pagination UI of the grid.
     * ```html
     * <igx-grid #grid [paging]="true" [myTemplate]="myTemplate" [height]="'305px'"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public paginationTemplate: TemplateRef<any>;

    /**
     * Return the display density currently applied to the grid.
     * The default value is `comfortable`.
     * Available options are `comfortable`, `cosy`, `compact`.
     * ```typescript
     * let gridTheme = this.grid.displayDensity;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public get displayDensity(): DisplayDensity | string {
        return this._displayDensity;
    }

    /**
     * Sets the display density currently applied to the grid.
     * ```html
     * <igx-grid #grid [data]="localData" [displayDensity]="'compact'" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
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

    /**
     * Returns whether the column hiding UI for the `IgxGridComponent` is enabled.
     * By default it is disabled (false).
     * ```typescript
     * let gridColHiding = this.grid.columnHiding;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    get columnHiding() {
        return this._columnHiding;
    }

    /**
     * Sets whether the column hiding UI for the `IgxGridComponent` is enabled.
     * In order for the UI to work, you need to enable the toolbar as shown in the example below.
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true" [showToolbar]="true" [columnHiding]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
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

    /**
     * Sets whether the `IgxGridRowComponent` selection is enabled.
     * By default it is set to false.
     * ```typescript
     * let rowSelectable = this.grid.rowSelectable;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    get rowSelectable(): boolean {
        return this._rowSelection;
    }

    /**
     * Sets whether rows can be selected.
     * ```html
     * <igx-grid #grid [showToolbar]="true" [rowSelectable]="true" [columnHiding]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    set rowSelectable(val: boolean) {
        this._rowSelection = val;
        if (this.gridAPI.get(this.id)) {

            // should selection persist?
            this.allRowsSelected = false;
            this.deselectAllRows();
            this.markForCheck();
        }
    }

    /**
     * Returns the height of the `IgxGridComponent`.
     * ```typescript
     * let gridHeight = this.grid.height;
     * ```
     * @memberof IgxGridComponent
     */
    @HostBinding('style.height')
    @Input()
    public get height() {
        return this._height;
    }

    /**
     * Sets the height of the `IgxGridComponent`.
     * ```html
     * <igx-grid #grid [data]="Data" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    public set height(value: any) {
        if (this._height !== value) {
            this._height = value;
            requestAnimationFrame(() => {
                this.calculateGridHeight();
                this.cdr.markForCheck();
            });
        }
    }

    /**
     * Returns the width of the `IgxGridComponent`.
     * ```typescript
     * let gridWidth = this.grid.width;
     * ```
     * @memberof IgxGridComponent
     */
    @HostBinding('style.width')
    @Input()
    public get width() {
        return this._width;
    }

    /**
     * Sets the width of the `IgxGridComponent`.
     * ```html
     * <igx-grid #grid [data]="Data" [width]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
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

    /**
     * Returns the width of the header of the `IgxGridComponent`.
     * ```html
     * let gridHeaderWidth = this.grid.headerWidth;
     * ```
     * @memberof IgxGridComponent
     */
    get headerWidth() {
        return parseInt(this._width, 10) - 17;
    }

    /**
     * An @Input property that adds styling classes applied to all even `IgxGridRowComponent`s in the grid.
     * ```html
     * <igx-grid #grid [data]="Data" [evenRowCSS]="'igx-grid--my-even-class'" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public evenRowCSS = 'igx-grid__tr--even';

    /**
     * An @Input property that adds styling classes applied to all odd `IgxGridRowComponent`s in the grid.
     * ```html
     * <igx-grid #grid [data]="Data" [evenRowCSS]="'igx-grid--my-odd-class'" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public oddRowCSS = 'igx-grid__tr--odd';

    /**
     * Returns the row height.
     * ```typescript
     * const rowHeight = this.grid.rowHeight;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public  get rowHeight()  {
        return this._rowHeight ? this._rowHeight : this.defaultRowHeight;
    }

    /**
     * Sets the row height.
     * ```html
     * <igx-grid #grid [data]="localData" [showToolbar]="true" [rowHeight]="100" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    public set rowHeight(value) {
        this._rowHeight = parseInt(value, 10);
    }

    /**
     * An @Input property that sets the default width of the `IgxGridComponent`'s columns.
     * ```html
     * <igx-grid #grid [data]="localData" [showToolbar]="true" [columnWidth]="100" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public get columnWidth(): string {
        return this._columnWidth;
    }
    public set columnWidth(value: string) {
        this._columnWidth = value;
        this._columnWidthSetByUser = true;
    }

    /**
     * An @Input property that sets the primary key of the `IgxGridComponent`.
     * ```html
     * <igx-grid #grid [data]="localData" [showToolbar]="true" [primaryKey]="6" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public primaryKey;

    /**
     * An @Input property that sets the message displayed when there are no records.
     * ```html
     * <igx-grid #grid [data]="Data" [emptyGridMessage]="'The grid is empty'" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public emptyGridMessage = 'Grid has no data.';

    /**
     * An @Input property that sets the message displayed when there are no records and the grid is filtered.
     * ```html
     * <igx-grid #grid [data]="Data" [emptyGridMessage]="'The grid is empty'" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
     @Input()
    public emptyFilteredGridMessage = 'No records found.';

    /**
     * An @Input property that sets the message displayed inside the GroupBy drop area where columns can be dragged on.
     * Note: The grid needs to have at least one groupable column in order the GroupBy area to be displayed.
     * ```html
     * <igx-grid dropAreaMessage="Drop here to group!">
     *      <igx-column [groupable]="true" field="ID"></igx-column>
     * </igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public dropAreaMessage = 'Drag a column header and drop it here to group by that column.';

    /**
     * An @Input property that sets the template that will be rendered as a GroupBy drop area.
     * Note: The grid needs to have at least one groupable column in order the GroupBy area to be displayed.
     * ```html
     * <igx-grid [dropAreaTemplate]="dropAreaRef">
     *      <igx-column [groupable]="true" field="ID"></igx-column>
     * </igx-grid>
     *
     * <ng-template #myDropArea>
     *      <span> Custom drop area! </span>
     * </ng-template>
     * ```
     * ```ts
     * @ViewChild('myDropArea', { read: TemplateRef })
     * public dropAreaRef: TemplateRef<any>;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public dropAreaTemplate: TemplateRef<any>;

    /**
     * An @Input property that sets the title to be displayed in the built-in column hiding UI.
     * ```html
     * <igx-grid [showToolbar]="true" [columnHiding]="true" columnHidingTitle="Column Hiding"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public columnHidingTitle = '';

    /**
     * Returns if the built-in column pinning UI should be shown in the toolbar.
     * ```typescript
     *  let colPinning = this.grid.columnPinning;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    get columnPinning() {
        return this._columnPinning;
    }

    /**
     * Sets if the built-in column pinning UI should be shown in the toolbar.
     * By default it's disabled.
     * ```html
     * <igx-grid #grid [data]="localData" [columnPinning]="'true" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
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

    /**
     * An @Input property that sets the title to be displayed in the UI of the column pinning.
     * ```html
     * <igx-grid #grid [data]="localData" [columnPinning]="'true" [columnPinningTitle]="'Column Hiding'" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public columnPinningTitle = '';

    /**
     * Emitted when `IgxGridCellComponent` is clicked. Returns the `IgxGridCellComponent`.
     * ```html
     * <igx-grid #grid (onCellClick)="onCellClick($event)" [data]="localData" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     * ```typescript
     * public onCellClick(e){
     *     alert("The cell has been clicked!");
     * }
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onCellClick = new EventEmitter<IGridCellEventArgs>();

    /**
     * Emitted when `IgxGridCellComponent` is selected. Returns the `IgxGridCellComponent`.
     * ```html
     * <igx-grid #grid (onSelection)="onCellSelect($event)" [data]="localData" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     * ```typescript
     * public onCellSelect(e){
     *     alert("The cell has been selected!");
     * }
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onSelection = new EventEmitter<IGridCellEventArgs>();

    /**
     *  Emitted when `IgxGridRowComponent` is selected.
     * ```html
     * <igx-grid #grid (onRowSelectionChange)="onRowClickChange($event)" [data]="localData" [autoGenerate]="true"></igx-grid>
     * ```
     * ```typescript
     * public onCellClickChange(e){
     *     alert("The selected row has been changed!");
     * }
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onRowSelectionChange = new EventEmitter<IRowSelectionEventArgs>();

    /**
     * Emitted when `IgxColumnComponent` is pinned.
     * The index that the column is inserted at may be changed through the `insertAtIndex` property.
     * ```typescript
     * public columnPinning(event) {
     *     if (event.column.field === "Name") {
     *       event.insertAtIndex = 0;
     *     }
     * }
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onColumnPinning = new EventEmitter<IPinColumnEventArgs>();

    /**
     * An @Output property emitting an event when `IgxGridCellComponent` or `IgxGridRowComponent`
     * editing has been performed in the grid.
     * On `IgxGridCellComponent` editing, both `IgxGridCellComponent` and `IgxGridRowComponent`
     * objects in the event arguments are defined for the corresponding
     * `IgxGridCellComponent` that is being edited and the `IgxGridRowComponent` the `IgxGridCellComponent` belongs to.
     * On `IgxGridRowComponent` editing, only the `IgxGridRowComponent` object is defined, for the `IgxGridRowComponent`
     * that is being edited.
     * The `IgxGridCellComponent` object is null on `IgxGridRowComponent` editing.
     * ```typescript
     * editDone(event: IgxColumnComponent){
     *    const column: IgxColumnComponent = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid3 (onEditDone)="editDone($event)" [data]="remote | async" (onSortingDone)="process($event)"
     *          [primaryKey]="'ProductID'" [rowSelectable]="true">
     *          <igx-column [sortable]="true" [field]="'ProductID'"></igx-column>
     *          <igx-column [editable]="true" [field]="'ProductName'"></igx-column>
     *          <igx-column [sortable]="true" [field]="'UnitsInStock'" [header]="'Units in Stock'"></igx-column>
     * </igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onEditDone = new EventEmitter<IGridEditEventArgs>();

    /**
     * Emitted when a grid column is initialized. Returns the column object.
     * ```html
     * <igx-grid #grid [data]="localData" [onColumnInit]="initColumns($event)" [autoGenerate]="true"</igx-grid>
     * ```
     * ```typescript
     * initColumns(event: IgxColumnComponent) {
     * const column: IgxColumnComponent = event;
     *       column.filterable = true;
     *       column.sortable = true;
     *       column.editable = true;
     * }
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onColumnInit = new EventEmitter<IgxColumnComponent>();

    /**
     * Emitted when sorting is performed through the UI. Returns the sorting expression.
     * ```html
     * <igx-grid #grid [data]="localData" [autoGenerate]="true" (onSortingDone)="sortingDone($event)"></igx-grid>
     * ```
     * ```typescript
     * sortingDone(event: SortingDirection){
     *     const sortingDirection = event;
     * }
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onSortingDone = new EventEmitter<ISortingExpression>();

    /**
     * Emitted when filtering is performed through the UI.
     * Returns the filtering expressions tree of the column for which filtering was performed.
     * ```typescript
     * filteringDone(event: IFilteringExpressionsTree){
     *     const filteringTree = event;
     *}
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true" (onFilteringDone)="filteringDone($event)"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onFilteringDone = new EventEmitter<IFilteringExpressionsTree>();

    /**
     * Emitted when paging is performed. Returns an object consisting of the previous and next pages.
     * ```typescript
     * pagingDone(event: IPageEventArgs){
     *     const paging = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" [height]="'305px'" [autoGenerate]="true" (onPagingDone)="pagingDone($event)"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onPagingDone = new EventEmitter<IPageEventArgs>();

    /**
     * Emitted when a `IgxGridRowComponent` is being added to the `IgxGridComponent` through the API.
     * Returns the data for the new `IgxGridRowComponent` object.
     * ```typescript
     * rowAdded(event: IRowDataEventArgs){
     *    const rowInfo = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onRowAdded)="rowAdded($event)" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onRowAdded = new EventEmitter<IRowDataEventArgs>();

    /**
     * Emitted when a `IgxGridRowComponent` is deleted through the `IgxGridComponent` API.
     * Returns an `IRowDataEventArgs` object.
     * ```typescript
     * rowDeleted(event: IRowDataEventArgs){
     *    const rowInfo = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onRowDeleted)="rowDeleted($event)" [height]="'305px'" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onRowDeleted = new EventEmitter<IRowDataEventArgs>();

    /**
     * Emitted when a new `IgxColumnComponent` is grouped or ungrouped.
     * Returns the `ISortingExpression` related to the grouping operation.
     * ```typescript
     * groupingDone(event: any){
     *     const grouping = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onGroupingDone)="groupingDone($event)" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onGroupingDone = new EventEmitter<ISortingExpression[]>();

    /**
     * Emitted when a new chunk of data is loaded from virtualization.
     * ```typescript
     *  <igx-grid #grid [data]="localData" [autoGenerate]="true" (onDataPreLoad)='handleDataPreloadEvent()'></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onDataPreLoad = new EventEmitter<IForOfState>();

    /**
     * Emitted when `IgxColumnComponent` is resized.
     * Returns the `IgxColumnComponent` object's old and new width.
     * ```typescript
     * resizing(event: IColumnResizeEventArgs){
     *     const grouping = event;
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onColumnResized)="resizing($event)" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onColumnResized = new EventEmitter<IColumnResizeEventArgs>();

    /**
     * Emitted when a `IgxGridCellComponent` is right clicked. Returns the `IgxGridCellComponent` object.
     * ```typescript
     * contextMenu(event: IGridCellEventArgs){
     *     const resizing = event;
     *     console.log(resizing);
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onContextMenu)="contextMenu($event)" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onContextMenu = new EventEmitter<IGridCellEventArgs>();

    /**
     * Emitted when a `IgxGridCellComponent` is double clicked. Returns the `IgxGridCellComponent` object.
     * ```typescript
     * dblClick(event: IGridCellEventArgs){
     *     const dblClick = event;
     *     console.log(dblClick);
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onDoubleClick)="dblClick($event)" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onDoubleClick = new EventEmitter<IGridCellEventArgs>();

    /**
     * Emitted when `IgxColumnComponent` visibility is changed. Args: { column: any, newValue: boolean }
     * ```typescript
     * visibilityChanged(event: IColumnVisibilityChangedEventArgs){
     *    const visiblity = event;
     * }
     * ```
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (onColumnVisibilityChanged)="visibilityChanged($event)"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onColumnVisibilityChanged = new EventEmitter<IColumnVisibilityChangedEventArgs>();

    /**
     * Emitted when `IgxColumnComponent` moving starts. Returns the moved `IgxColumnComponent` object.
     * ```typescript
     * movingStart(event: IColumnMovingStartEventArgs){
     *     const movingStarts = event;
     * }
     * ```
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (onColumnMovingStart)="movingStart($event)"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onColumnMovingStart = new EventEmitter<IColumnMovingStartEventArgs>();

    /**
     * Emitted throughout the `IgxColumnComponent` moving operation.
     * Returns the source and target `IgxColumnComponent` objects. This event is cancelable.
     * ```typescript
     * moving(event: IColumnMovingEventArgs){
     *     const moving = event;
     * }
     * ```
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (onColumnMoving)="moving($event)"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onColumnMoving = new EventEmitter<IColumnMovingEventArgs>();

    /**
     * Emitted when `IgxColumnComponent` moving ends.
     * Returns the source and target `IgxColumnComponent` objects. This event is cancelable.
     * ```typescript
     * movingEnds(event: IColumnMovingEndEventArgs){
     *     const movingEnds = event;
     * }
     * ```
     * ```html
     * <igx-grid [columnHiding]="true" [showToolbar]="true" (onColumnMovingEnd)="movingEnds($event)"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onColumnMovingEnd = new EventEmitter<IColumnMovingEndEventArgs>();

    /**
     * @hidden
     */
    @Output()
    protected onDensityChanged = new EventEmitter<any>();

    /**
     * @hidden
     */
    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent, descendants: true })
    public columnList: QueryList<IgxColumnComponent>;

    /**
     * @hidden
     */
    @ViewChildren(IgxGridHeaderComponent, { read: IgxGridHeaderComponent })
    public headerList: QueryList<IgxGridHeaderComponent>;

    /**
     * @hidden
     */
    @ContentChild(IgxGroupByRowTemplateDirective, { read: IgxGroupByRowTemplateDirective })
    protected groupTemplate: IgxGroupByRowTemplateDirective;


    @ViewChildren('row')
    private _rowList:  QueryList<any>;

    /**
     * A list of `IgxGridRowComponent`.
     * ```typescript
     * const rowList = this.grid.rowList;
     * ```
     * @memberof IgxGridComponent
     */
    public get rowList() {
        const res = new QueryList<any>();
        if (!this._rowList) {
            return res;
        }
        const rList = this._rowList.filter((item) => {
            return item.element.nativeElement.parentElement !== null;
        });
        res.reset(rList);
        return res;
    }

    @ViewChildren(IgxGridRowComponent, { read: IgxGridRowComponent })
    private _dataRowList: QueryList<any>;

    /**
     * A list of `IgxGridRowComponent`, currently rendered.
     * ```typescript
     * const dataList = this.grid.dataRowList;
     * ```
     * @memberof IgxGridComponent
     */
    public get dataRowList() {
        const res = new QueryList<any>();
        if (!this._dataRowList) {
            return res;
        }
        const rList = this._dataRowList.filter((item) => {
            return item.element.nativeElement.parentElement !== null;
        });
        res.reset(rList);
        return res;
    }

    @ViewChildren(IgxGridGroupByRowComponent, { read: IgxGridGroupByRowComponent })
    private _groupsRowList: QueryList<IgxGridGroupByRowComponent>;

    /**
     * A list of all group rows.
     * ```typescript
     * const groupList = this.grid.groupsRowList;
     * ```
     * @memberof IgxGridComponent
     */
    public get groupsRowList() {
        const res = new QueryList<any>();
        if (!this._groupsRowList) {
            return res;
        }
        const rList = this._groupsRowList.filter((item) => {
            return item.element.nativeElement.parentElement !== null;
        });
        res.reset(rList);
        return res;
    }


    /**
     * A template reference for the template when the filtered `IgxGridComponent` is empty.
     * ```
     * const emptyTempalte = this.grid.emptyGridTemplate;
     * ```
     * @memberof IgxGridComponent
     */
    @ViewChild('emptyFilteredGrid', { read: TemplateRef })
    public emptyFilteredGridTemplate: TemplateRef<any>;

    /**
     * A template reference for the template when the `IgxGridComponent` is empty.
     * ```
     * const emptyTempalte = this.grid.emptyGridTemplate;
     * ```
     * @memberof IgxGridComponent
     */
    @ViewChild('defaultEmptyGrid', { read: TemplateRef })
    public emptyGridDefaultTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('defaultDropArea', { read: TemplateRef })
    public defaultDropAreaTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ViewChild('scrollContainer', { read: IgxForOfDirective })
    public parentVirtDir: IgxForOfDirective<any>;

    /**
     * @hidden
     */
    @ViewChild('verticalScrollContainer', { read: IgxForOfDirective })
    public verticalScrollContainer: IgxForOfDirective<any>;

    /**
     * @hidden
     */
    @ViewChild('scr', { read: ElementRef })
    public scr: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('paginator', { read: ElementRef })
    public paginator: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('headerContainer', { read: IgxForOfDirective })
    public headerContainer: IgxForOfDirective<any>;

    /**
     * @hidden
     */
    @ViewChild('headerCheckboxContainer')
    public headerCheckboxContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('headerGroupContainer')
    public headerGroupContainer: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('headerCheckbox', { read: IgxCheckboxComponent })
    public headerCheckbox: IgxCheckboxComponent;

    /**
     * @hidden
     */
    @ViewChild('groupArea')
    public groupArea: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('theadRow')
    public theadRow: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('tbody')
    public tbody: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('tfoot')
    public tfoot: ElementRef;

    /**
     * @hidden
     */
    @ViewChild('summaries')
    public summaries: ElementRef;

    /**
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

    /**
     * @hidden
     */
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

    /**
     * @hidden
     */
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

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public hostRole = 'grid';

    /**
     * @hidden
     */
    get pipeTrigger(): number {
        return this._pipeTrigger;
    }

    /**
     * Returns the sorting state of the `IgxGridComponent`.
     * ```typescript
     * const sortingState = this.grid.sortingExpressions;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    get sortingExpressions(): ISortingExpression [] {
        return this._sortingExpressions;
    }

    /**
     * Sets the sorting state of the `IgxGridComponent`.
     * ```typescript
     * this.grid.sortingExpressions = [{
     *     fieldName: "ID",
     *     dir: SortingDirection.Desc,
     *     ignoreCase: true
     * }];
     * ```
     * @memberof IgxGridComponent
     */
    set sortingExpressions(value: ISortingExpression []) {
        this._sortingExpressions = cloneArray(value);
        this.cdr.markForCheck();

        this.restoreHighlight();
    }

    /**
     * Returns the state of the grid virtualization, including the start index and how many records are rendered.
     * ```typescript
     * const gridVirtState = this.grid1.virtualizationState;
     * ```
     * @memberof IgxGridComponent
     */
    get virtualizationState() {
        return this.verticalScrollContainer.state;
    }

    /**
     * @hidden
     */
    set virtualizationState(state) {
        this.verticalScrollContainer.state = state;
    }

    /**
     * Returns the total number of records in the data source.
     * Works only with remote grid virtualization.
     * ```typescript
     * const itemCount = this.grid1.totalItemCount;
     * ```
     * @memberof IgxGridComponent
     */
    get totalItemCount() {
        return this.verticalScrollContainer.totalItemCount;
    }

    /**
     * Sets the total number of records in the data source.
     * This property is required for virtualization to function when the grid is bound remotely.
     * ```typescript
     * this.grid1.totalItemCount = 55;
     * ```
     * @memberof IgxGridComponent
     */
    set totalItemCount(count) {
        this.verticalScrollContainer.totalItemCount = count;
        this.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    get maxLevelHeaderDepth() {
        if (this._maxLevelHeaderDepth === null) {
            this._maxLevelHeaderDepth =  this.columnList.reduce((acc, col) => Math.max(acc, col.level), 0);
        }
        return this._maxLevelHeaderDepth;
    }

    /**
     * Returns the number of hidden `IgxColumnComponent`.
     * ```typescript
     * const hiddenCol = this.grid.hiddenColumnsCount;
     * ``
     */
    get hiddenColumnsCount() {
        return this.columnList.filter((col) => col.columnGroup === false && col.hidden === true).length;
    }

    /**
     * Returns the text to be displayed inside the toggle button
     * for the built-in column hiding UI of the`IgxColumnComponent`.
     * ```typescript
     * const hiddenColText = this.grid.hiddenColumnsText;
     * ``
     */
    @Input()
    get hiddenColumnsText() {
        return this._hiddenColumnsText;
    }

    /**
     * Sets the text to be displayed inside the toggle button
     * for the built-in column hiding UI of the`IgxColumnComponent`.
     * ```typescript
     * <igx-grid [columnHiding]="true" [showToolbar]="true" [hiddenColumnsText]="'Hidden Columns'"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    set hiddenColumnsText(value) {
        this._hiddenColumnsText = value;

    }

    /**
     * Returns the text to be displayed inside the toggle button
     * for the built-in column pinning UI of the`IgxColumnComponent`.
     * ```typescript
     * const pinnedText = this.grid.pinnedColumnsText;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    get pinnedColumnsText() {
        return this._pinnedColumnsText;
    }

    /**
     * Sets the text to be displayed inside the toggle button
     * for the built-in column pinning UI of the`IgxColumnComponent`.
     * ```html
     * <igx-grid [pinnedColumnsText]="'PinnedCols Text" [data]="data" [width]="'100%'" [height]="'500px'"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    set pinnedColumnsText(value) {
        this._pinnedColumnsText = value;
    }

    /* Toolbar related definitions */
    private _showToolbar = false;
    private _exportExcel = false;
    private _exportCsv = false;
    private _chipsDragged = false;
    private _toolbarTitle: string = null;
    private _exportText: string = null;
    private _exportExcelText: string = null;
    private _exportCsvText: string = null;

    /**
     * Provides access to the `IgxToolbarComponent`.
     * ```typescript
     * const gridToolbar = this.grid.toolbar;
     * ```
     * @memberof IgxGridComponent
     */
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

    /**
     * Returns whether the `IgxGridComponent`'s toolbar is shown or hidden.
     * ```typescript
     * const toolbarGrid = this.grid.showToolbar;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public get showToolbar(): boolean {
        return this._showToolbar;
    }

    /**
     * Shows or hides the `IgxGridComponent`'s toolbar.
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" ></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    public set showToolbar(newValue: boolean) {
        if (this._showToolbar !== newValue) {
            this._showToolbar = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    /**
     * Returns the toolbar's title.
     * ```typescript
     * const toolbarTitle  = this.grid.toolbarTitle;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public get toolbarTitle(): string {
        return this._toolbarTitle;
    }

    /**
     * Sets the toolbar's title.
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" [toolbarTitle]="'My Grid'"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    public set toolbarTitle(newValue: string) {
        if (this._toolbarTitle !== newValue) {
            this._toolbarTitle = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    /**
     * Returns whether the option for exporting to MS Excel is enabled or disabled.
     * ```typescript
     * cosnt excelExporter = this.grid.exportExcel;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public get exportExcel(): boolean {
        return this._exportExcel;
    }

    /**
     * Enable or disable the option for exporting to MS Excel.
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" [exportExcel]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    public set exportExcel(newValue: boolean) {
        if (this._exportExcel !== newValue) {
            this._exportExcel = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    /**
     * Returns whether the option for exporting to CSV is enabled or disabled.
     * ```typescript
     * const exportCsv = this.grid.exportCsv;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public get exportCsv(): boolean {
        return this._exportCsv;
    }

    /**
     * Enable or disable the option for exporting to CSV.
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [autoGenerate]="true" [exportCsv]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    public set exportCsv(newValue: boolean) {
        if (this._exportCsv !== newValue) {
            this._exportCsv = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    /**
     * Returns the textual content for the main export button.
     * ```typescript
     * const exportText = this.grid.exportText;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public get exportText(): string {
        return this._exportText;
    }

    /**
     * Sets the textual content for the main export button.
     * ```html
     * <igx-grid [data]="localData" [showToolbar]="true" [exportText]="'My Exporter'" [exportCsv]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    public set exportText(newValue: string) {
        if (this._exportText !== newValue) {
            this._exportText = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    /**
     * Returns the textual content for the MS Excel export button.
     * ```typescript
     * const excelText = this.grid.exportExcelText;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public get exportExcelText(): string {
        return this._exportExcelText;
    }

    /**
     * Sets the textual content for the MS Excel export button.
     * ```html
     * <igx-grid [exportExcelText]="'My Excel Exporter" [showToolbar]="true" [exportText]="'My Exporter'" [exportCsv]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    public set exportExcelText(newValue: string) {
        if (this._exportExcelText !== newValue) {
            this._exportExcelText = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    /**
     * Returns the textual content for the CSV export button.
     * ```typescript
     * const csvText = this.grid.exportCsvText;
     * ```
     * @memberof IgxGridComponent
     */
    @Input()
    public get exportCsvText(): string {
        return this._exportCsvText;
    }

    /**
     * Sets the textual content for the CSV export button.
     * ```html
     * <igx-grid [exportCsvText]="'My Csv Exporter" [showToolbar]="true" [exportText]="'My Exporter'" [exportExcel]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
     */
    public set exportCsvText(newValue: string) {
        if (this._exportCsvText !== newValue) {
            this._exportCsvText = newValue;
            this.cdr.markForCheck();
            if (this._ngAfterViewInitPaassed) {
                this.calculateGridSizes();
            }
        }
    }

    /**
     * Emitted when an export process is initiated by the user.
     * ```typescript
     * toolbarExporting(event: IGridToolbarExportEventArgs){
     *     const toolbarExporting = event;
     * }
     * ```
     * @memberof IgxGridComponent
     */
    @Output()
    public onToolbarExporting = new EventEmitter<IGridToolbarExportEventArgs>();

    /* End of toolbar related definitions */

    /**
     * @hidden
     */
    public pagingState;
    /**
     * @hidden
     */
    public calcWidth: number;
    /**
     * @hidden
     */
    public calcRowCheckboxWidth: number;
    /**
     * @hidden
     */
    public calcHeight: number;
    /**
     * @hidden
     */
    public tfootHeight: number;
    /**
     * @hidden
     */
    public chipsGoupingExpressions = [];
    /**
     * @hidden
     */
    public summariesHeight: number;

    /**
     * @hidden
     */
    public draggedColumn: IgxColumnComponent;
    /**
     * @hidden
     */
    public isColumnResizing: boolean;
    /**
     * @hidden
     */
    public isColumnMoving: boolean;

    /**
     * @hidden
     */
    public eventBus = new Subject<boolean>();

    /**
     * @hidden
     */
    public allRowsSelected = false;

    /**
     * @hidden
     */
    public lastSearchInfo: ISearchInfo = {
        searchText: '',
        caseSensitive: false,
        activeMatchIndex: 0,
        matchInfoCache: []
    };

    /**
     * @hidden
     */
    protected destroy$ = new Subject<boolean>();

    /**
     * @hidden
     */
    protected _perPage = 15;
    /**
     * @hidden
     */
    protected _page = 0;
    /**
     * @hidden
     */
    protected _paging = false;
    /**
     * @hidden
     */
    protected _rowSelection = false;
    /**
     * @hidden
     */
    protected _pipeTrigger = 0;
    /**
     * @hidden
     */
    protected _columns: IgxColumnComponent[] = [];
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
    protected _sortingExpressions = [];
    /**
     * @hidden
     */
    protected _maxLevelHeaderDepth = null;
    /**
     * @hidden
     */
    protected _groupingExpressions = [];
    /**
     * @hidden
     */
    protected _groupingExpandState: IGroupByExpandState[] = [];
    /**
     * @hidden
     */
    protected _groupRowTemplate: TemplateRef<any>;
    /**
     * @hidden
     */
    protected _groupAreaTemplate: TemplateRef<any>;
    /**
     * @hidden
     */
    protected _columnHiding = false;
    /**
     * @hidden
     */
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

    private _columnWidth: string;
    private _columnWidthSetByUser = false;

    private _defaultTargetRecordNumber = 10;

    constructor(
        private gridAPI: IgxGridAPIService,
        public selection: IgxSelectionAPIService,
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

    /**
     * @hidden
     */
    public ngOnInit() {
        this.gridAPI.register(this);
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

    /**
     * @hidden
     */
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

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this.zone.runOutsideAngular(() => {
            this.document.defaultView.addEventListener('resize', this.resizeHandler);
        });
        this.calculateGridWidth();
        this.initPinning();
        this.calculateGridSizes();
        this.onDensityChanged.pipe(takeUntil(this.destroy$)).subscribe(() => {
            requestAnimationFrame(() => {
                this.summariesHeight = 0;
                this.reflow();
            });
        });
        this._ngAfterViewInitPaassed = true;

        // In some rare cases we get the AfterViewInit before the grid is added to the DOM
        // and as a result we get 0 width and can't size ourselves properly.
        // In order to prevent that add a mutation observer that watches if we have been added.
        if (!this.calcWidth && this._width !== undefined) {
            const config = { childList: true, subtree: true };
            let observer: MutationObserver = null;
            const callback = (mutationsList) => {
                mutationsList.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        const addedNodes = new Array(...mutation.addedNodes);
                        addedNodes.forEach((node) => {
                            const added = this.checkIfGridIsAdded(node);
                            if (added) {
                                this.calculateGridWidth();
                                observer.disconnect();
                            }
                        });
                    }
                });
            };

            observer = new MutationObserver(callback);
            observer.observe(this.document.body, config);
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.zone.runOutsideAngular(() => this.document.defaultView.removeEventListener('resize', this.resizeHandler));
        this.destroy$.next(true);
        this.destroy$.complete();
        this.gridAPI.unset(this.id);
    }

    /**
     * @hidden
     */
    public dataLoading(event) {
        this.onDataPreLoad.emit(event);
    }

    /**
     * Toggles the specified column's visibility.
     * ```typescript
     * this.grid1.toggleColumnVisibility({
     *       column: this.grid1.columns[0],
     *       newValue: true
     * });
     * ```
     * @memberof IgxGridComponent
     */
    public toggleColumnVisibility(args: IColumnVisibilityChangedEventArgs) {
        const col = this.getColumnByName(args.column.field);
        col.hidden = args.newValue;
        this.onColumnVisibilityChanged.emit(args);

        this.markForCheck();
    }

    /**
     * Returns the native element of the `IgxGridComponent`.
     * ```typescript
     * const nativeEl = this.grid.nativeElement.
     * ```
     * @memberof IgxGridComponent
     */
    get nativeElement() {
        return this.elementRef.nativeElement;
    }

    /**
     * Returns the template reference of the `IgxGridComponent`'s group row.
     * ```
     * const groupRowTemplate = this.grid.groupRowTemplate;
     * ```
     * @memberof IgxGridComponent
     */
    get groupRowTemplate(): TemplateRef<any> {
        return this._groupRowTemplate;
    }

    /**
     * Sets the template reference of the `IgxGridComponent`'s group `IgxGridRowComponent`.
     * ```typescript
     * this.grid.groupRowTemplate = myRowTemplate.
     * ```
     * @memberof IgxGridComponent
     */
    set groupRowTemplate(template: TemplateRef<any>) {
        this._groupRowTemplate = template;
        this.markForCheck();
    }


    /**
     * Returns the template reference of the `IgxGridComponent`'s group area.
     * ```typescript
     * const groupAreaTemplate = this.grid.groupAreaTemplate;
     * ```
     * @memberof IgxGridComponent
     */
    get groupAreaTemplate(): TemplateRef<any> {
        return this._groupAreaTemplate;
    }

    /**
     * Sets the template reference of the `IgxGridComponent`'s group area.
     * ```typescript
     * this.grid.groupAreaTemplate = myAreaTemplate.
     * ```
     * @memberof IgxGridComponent
     */
    set groupAreaTemplate(template: TemplateRef<any>) {
        this._groupAreaTemplate = template;
        this.markForCheck();
    }

    /**
     * @hidden
     */
    get calcResizerHeight(): number {
        if (this.hasSummarizedColumns) {
            return this.theadRow.nativeElement.clientHeight + this.tbody.nativeElement.clientHeight +
                this.tfoot.nativeElement.clientHeight;
        }
        return this.theadRow.nativeElement.clientHeight + this.tbody.nativeElement.clientHeight;
    }

    /**
     * Returns the `IgxGridComponent`'s rows height.
     * ```typescript
     * const rowHeigh = this.grid.defaultRowHeight;
     * ```
     * @memberof IgxGridComponent
     */
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

    /**
     * Returns the maximum width of the container for the pinned `IgxColumnComponent`s.
     * ```typescript
     * const maxPinnedColWidth = this.grid.calcPinnedContainerMaxWidth;
     * ```
     * @memberof IgxGridComponent
     */
    get calcPinnedContainerMaxWidth(): number {
        return (this.calcWidth * 80) / 100;
    }

    /**
     * Returns the minimum width of the container for the unpinned `IgxColumnComponent`s.
     * ```typescript
     * const minUnpinnedColWidth = this.grid.unpinnedAreaMinWidth;
     * ```
     * @memberof IgxGridComponent
     */
    get unpinnedAreaMinWidth(): number {
        return (this.calcWidth * 20) / 100;
    }

    /**
     * Returns the current width of the container for the pinned `IgxColumnComponent`s.
     * ```typescript
     * const pinnedWidth = this.grid.getPinnedWidth;
     * ```
     * @memberof IgxGridComponent
     */
    get pinnedWidth() {
        return this.getPinnedWidth();
    }

    /**
     * Returns the current width of the container for the unpinned `IgxColumnComponent`s.
     * ```typescript
     * const unpinnedWidth = this.grid.getUnpinnedWidth;
     * ```
     * @memberof IgxGridComponent
     */
    get unpinnedWidth() {
        return this.getUnpinnedWidth();
    }

    /**
     * @hidden
     */
    get summariesMargin() {
        return this.rowSelectable ? this.calcRowCheckboxWidth : 0;
    }

    /**
     * Returns an array of `IgxColumnComponent`s.
     * ```typescript
     * const colums = this.grid.columns.
     * ```
     * @memberof IgxGridComponent
     */
    get columns(): IgxColumnComponent[] {
        return this._columns;
    }

    /**
     * Returns an array of the pinned `IgxColumnComponent`s.
     * ```typescript
     * const pinnedColumns = this.grid.pinnedColumns.
     * ```
     * @memberof IgxGridComponent
     */
    get pinnedColumns(): IgxColumnComponent[] {
        return this._pinnedColumns.filter((col) => !col.hidden);
    }

    /**
     * Returns an array of unpinned `IgxColumnComponent`s.
     * ```typescript
     * const unpinnedColumns = this.grid.unpinnedColumns.
     * ```
     * @memberof IgxGridComponent
     */
    get unpinnedColumns(): IgxColumnComponent[] {
        return this._unpinnedColumns.filter((col) => !col.hidden); // .sort((col1, col2) => col1.index - col2.index);
    }

    /**
     * Returns the `IgxColumnComponent` by field name.
     * ```typescript
     * const myCol = this.grid1.getColumnByName("ID");
     * ```
     * @param name
     * @memberof IgxGridComponent
     */
    public getColumnByName(name: string): IgxColumnComponent {
        return this.columnList.find((col) => col.field === name);
    }

    /**
     * Returns the `IgxColumnComponent` by index.
     * ```typescript
     * const myRow = this.grid1.getRowByIndex(1);
     * ```
     * @param index
     * @memberof IgxGridComponent
     */
    public getRowByIndex(index: number): IgxGridRowComponent {
        return this.gridAPI.get_row_by_index(this.id, index);
    }

    /**
     * Returns `IgxGridRowComponent` object by the specified primary key .
     * Requires that the `primaryKey` property is set.
     * ```typescript
     * const myRow = this.grid1.getRowByKey("cell5");
     * ```
     * @param keyValue
     * @memberof IgxGridComponent
     */
    public getRowByKey(keyValue: any): IgxGridRowComponent {
        return this.gridAPI.get_row_by_key(this.id, keyValue);
    }

    /**
     * Returns an array of visible `IgxColumnComponent`s.
     * ```typescript
     * const visibleColumns = this.grid.visibleColumns.
     * ```
     * @memberof IgxGridComponent
     */
    get visibleColumns(): IgxColumnComponent[] {
        return this.columnList.filter((col) => !col.hidden);
    }

    /**
     * Returns the `IgxGridCellComponent` that matches the conditions.
     * ```typescript
     * const myCell = this.grid1.getCellByColumn(2,"UnitPrice");
     * ```
     * @param rowIndex
     * @param columnField
     * @memberof IgxGridComponent
     */
    public getCellByColumn(rowIndex: number, columnField: string): IgxGridCellComponent {
        const columnId = this.columnList.map((column) => column.field).indexOf(columnField);
        if (columnId !== -1) {
            return this.gridAPI.get_cell_by_index(this.id, rowIndex, columnId);
        }
    }

    /**
     * Returns an `IgxGridCellComponent` object by the specified primary key and column field.
     * Requires that the primaryKey property is set.
     * ```typescript
     * grid.getCellByKey(1, 'index');
     * ```
     * @param rowSelector match any rowID
     * @param columnField
     * @memberof IgxGridComponent
     */
    public getCellByKey(rowSelector: any, columnField: string): IgxGridCellComponent {
        return this.gridAPI.get_cell_by_key(this.id, rowSelector, columnField);
    }

    /**
     * Returns the total number of pages.
     * ```typescript
     * const totalPages = this.grid.totalPages;
     * ```
     * @memberof IgxGridComponent
     */
    get totalPages(): number {
        if (this.pagingState) {
            return this.pagingState.metadata.countPages;
        }
        return -1;
    }

    /**
     * Returns the total number of records.
     * Only functions when paging is enabled.
     * ```typescript
     * const totalRecords = this.grid.totalRecords;
     * ```
     * @memberof IgxGridComponent
     */
    get totalRecords(): number {
        if (this.pagingState) {
            return this.pagingState.metadata.countRecords;
        }
    }

    /**
     * Returns if the current page is the first page.
     * ```typescript
     * const firstPage = this.grid.isFirstPage;
     * ```
     * @memberof IgxGridComponent
     */
    get isFirstPage(): boolean {
        return this.page === 0;
    }

    /**
     * Returns if the current page is the last page.
     * ```typescript
     * const lastPage = this.grid.isLastPage;
     * ```
     * @memberof IgxGridComponent
     */
    get isLastPage(): boolean {
        return this.page + 1 >= this.totalPages;
    }

    /**
     * Returns the total width of the `IgxGridComponent`.
     * ```typescript
     * const gridWidth = this.grid.totalWidth;
     * ```
     * @memberof IgxGridComponent
     */
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

    get showRowCheckboxes(): boolean {
        return this.rowSelectable && this.columns.length > this.hiddenColumnsCount;
    }

    /**
     * @hidden
     */
    protected _moveColumns(from: IgxColumnComponent, to: IgxColumnComponent) {
        const list = this.columnList.toArray();
        const fi = list.indexOf(from);
        const ti = list.indexOf(to);

        let activeColumn = null;
        let activeColumnIndex = -1;

        if (this.lastSearchInfo.searchText) {
            const activeInfo = IgxTextHighlightDirective.highlightGroupsMap.get(this.id);
            activeColumnIndex = activeInfo.columnIndex;

            if (activeColumnIndex !== -1) {
                activeColumn = list[activeColumnIndex];
            }
        }

        list.splice(ti, 0, ...list.splice(fi, 1));
        const newList = this._resetColumnList(list);
        this.columnList.reset(newList);
        this.columnList.notifyOnChanges();
        this._columns = this.columnList.toArray();

        if (activeColumn !== null && activeColumn !== undefined) {
            const newIndex = newList.indexOf(activeColumn);
            IgxColumnComponent.updateHighlights(activeColumnIndex, newIndex, this);
        }
    }

    /**
     * @hidden
     */
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

    /**
     * @hidden
     */
    protected _moveChildColumns(parent: IgxColumnComponent, from: IgxColumnComponent, to: IgxColumnComponent) {
        const buffer = parent.children.toArray();
        const fi = buffer.indexOf(from);
        const ti = buffer.indexOf(to);
        buffer.splice(ti, 0, ...buffer.splice(fi, 1));
        parent.children.reset(buffer);
    }

    /**
     * Moves a column to the specified drop target.
     * ```typescript
     * grid.moveColumn(compName, persDetails);
     * ```
     * @memberof IgxGridComponent
     */
    public moveColumn(column: IgxColumnComponent, dropTarget: IgxColumnComponent) {
        if ((column.level !== dropTarget.level) ||
            (column.topLevelParent !== dropTarget.topLevelParent)) {
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
            column.pin();
        }

        if (!dropTarget.pinned && column.pinned) {
            column.unpin();
        }

        this._moveColumns(column, dropTarget);
        this.cdr.detectChanges();
    }

    /**
     * Goes to the next page of the `IgxGridComponent`, if the grid is not already at the last page.
     * ```typescript
     * this.grid1.nextPage();
     * ```
     * @memberof IgxGridComponent
     */
    public nextPage(): void {
        if (!this.isLastPage) {
            this.page += 1;
        }
    }

    /**
     * Goes to the previous page of the `IgxGridComponent`, if the grid is not already at the first page.
     * ```typescript
     * this.grid1.previousPage();
     * ```
     * @memberof IgxGridComponent
     */
    public previousPage(): void {
        if (!this.isFirstPage) {
            this.page -= 1;
        }
    }

    /**
     * Goes to the desired page index.
     * ```typescript
     * this.grid1.paginate(1);
     * ```
     * @param val
     * @memberof IgxGridComponent
     */
    public paginate(val: number): void {
        if (val < 0 || val > this.totalPages - 1) {
            return;
        }

        this.page = val;
    }

    /**
     * Manually marks the `IgxGridComponent` for change detection.
     * ```typescript
     * this.grid1.markForCheck();
     * ```
     * @memberof IgxGridComponent
     */
    public markForCheck() {
        if (this.rowList) {
            this.rowList.forEach((row) => row.cdr.markForCheck());
        }
        this.cdr.detectChanges();
    }

    /**
     * Creates a new `IgxGridRowComponent` and adds the data record to the end of the data source.
     * ```typescript
     * const record = {
     *     ID: this.grid1.data[this.grid1.data.length - 1].ID + 1,
     *     Name: this.newRecord
     * };
     * this.grid1.addRow(record);
     * ```
     * @param data
     * @memberof IgxGridComponent
     */
    public addRow(data: any): void {
        this.data.push(data);
        this.onRowAdded.emit({ data });
        this._pipeTrigger++;
        this.cdr.markForCheck();

        this.refreshSearch();
    }

    /**
     * Removes the `IgxGridRowComponent` and the corresponding data record by primary key.
     * Requires that the `primaryKey` property is set.
     * The method accept rowSelector as a parameter, which is the rowID.
     * ```typescript
     * this.grid1.deleteRow(0);
     * ```
     * @param rowSelector
     * @memberof IgxGridComponent
     */
    public deleteRow(rowSelector: any): void {
        if (this.primaryKey !== undefined && this.primaryKey !== null) {
            const index = this.gridAPI.get(this.id).data.map((record) => record[this.gridAPI.get(this.id).primaryKey]).indexOf(rowSelector);
            if (index !== -1) {
                const editableCell = this.gridAPI.get_cell_inEditMode(this.id);
                if (editableCell && editableCell.cellID.rowID === rowSelector) {
                    this.gridAPI.escape_editMode(this.id, editableCell.cellID);
                }
                this.onRowDeleted.emit({ data: this.data[index] });
                this.data.splice(index, 1);
                if (this.rowSelectable === true && this.selection.is_item_selected(this.id, rowSelector)) {
                    this.deselectRows([rowSelector]);
                } else {
                    this.checkHeaderCheckboxStatus();
                }
                this._pipeTrigger++;
                this.cdr.markForCheck();

                this.refreshSearch();
                if (this.data.length % this.perPage === 0 && this.isLastPage && this.page !== 0) {
                    this.page--;
                }
            }
        }
    }

    /**
     * Updates the `IgxGridRowComponent` and the corresponding data record by primary key.
     * Requires that the `primaryKey` property is set.
     * ```typescript
     * this.gridWithPK.updateCell('Updated', 1, 'ProductName');
     * ```
     * @param value the new value which is to be set.
     * @param rowSelector corresponds to rowID.
     * @param column corresponds to column field.
     * @memberof IgxGridComponent
     */
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

    /**
     * Updates the `IgxGridRowComponent`, which is specified by
     * rowSelector parameter and the data source record with the passed value.
     * This method will apply requested update only if primary key is specified in the grid.
     * ```typescript
     * grid.updateRow({
     *       ProductID: 1, ProductName: 'Spearmint', InStock: true, UnitsInStock: 1, OrderDate: new Date('2005-03-21')
     *   }, 1);
     * ```
     * @param value
     * @param rowSelector correspond to rowID
     * @memberof IgxGridComponent
     */
    public updateRow(value: any, rowSelector: any): void {
        if (this.primaryKey !== undefined && this.primaryKey !== null) {
            const editableCell = this.gridAPI.get_cell_inEditMode(this.id);
            if (editableCell && editableCell.cellID.rowID === rowSelector) {
                this.gridAPI.escape_editMode(this.id, editableCell.cellID);
            }
            this.gridAPI.update_row(value, this.id, rowSelector);
            this.cdr.markForCheck();
            this.refreshSearch();
        }
    }

    /**
     * Sort a single `IgxColumnComponent`.
     * Sort the `IgxGridComponent`'s `IgxColumnComponent` based on the provided array of sorting expressions.
     * ```typescript
     * this.grid.sort({ fieldName: name, dir: SortingDirection.Asc, ignoreCase: false });
     * ```
     * @memberof IgxGridComponent
     */
    public sort(expression: ISortingExpression | Array<ISortingExpression>): void {
        this.gridAPI.escape_editMode(this.id);
        if (expression instanceof Array) {
            this.gridAPI.sort_multiple(this.id, expression);
        } else {
            this.gridAPI.sort(this.id, expression);
        }
    }

    /**
     * Groups by a new `IgxColumnComponent` based on the provided expression or modifies an existing one.
     * ```typescript
     * this.grid.groupBy({ fieldName: name, dir: SortingDirection.Asc, ignoreCase: false });
     * ```
     * @memberof IgxGridComponent
     */
    public groupBy(expression: IGroupingExpression | Array<IGroupingExpression>): void {
        this.gridAPI.submit_value(this.id);
        if (expression instanceof Array) {
            this.gridAPI.groupBy_multiple(this.id, expression);
        } else {
            this.gridAPI.groupBy(this.id, expression);
        }
        this.cdr.detectChanges();
        this.calculateGridSizes();
        this.onGroupingDone.emit(this.sortingExpressions);

        this.restoreHighlight();
    }

    /**
     * Clears all grouping in the grid, if no parameter is passed.
     * If a parameter is provided clears grouping for a particular column
     * ```typescript
     * this.grid.clearGrouping();
     * this.grid.clearGrouping("ID");
     * ```
     *
     */
    public clearGrouping(name?: string): void {
        this.gridAPI.clear_groupby(this.id, name);
        this.calculateGridSizes();

        this.restoreHighlight();
    }

    /**
     * Returns if a group is expanded or not.
     * ```typescript
     * public groupRow: IGroupByRecord;
     * const expandedGroup = this.grid.isExpandedGroup(this.groupRow);
     * ```
     * @memberof IgxGridComponent
     */
    public isExpandedGroup(group: IGroupByRecord): boolean {
        const state: IGroupByExpandState = this._getStateForGroupRow(group);
        return state ? state.expanded : this.groupsExpanded;
    }

    /**
     * Toggles the expansion state of a group.
     * ```typescript
     * public groupRow: IGroupByRecord;
     * const toggleExpGroup = this.grid.toggleGroup(this.groupRow);
     * ```
     * @memberof IgxGridComponent
     */
    public toggleGroup(groupRow: IGroupByRecord) {
        this._toggleGroup(groupRow);
    }

    /**
     * @hidden
     */
    public isGroupByRecord(record: any): boolean {
        // return record.records instance of GroupedRecords fails under Webpack
        return record.records && record.records.length;
    }

    /**
     * Returns if the grid's group by drop area is visible.
     * ```typescript
     * const dropVisible = this.grid.dropAreaVisible;
     * ```
     * @memberof IgxGridComponent
     */
    public get dropAreaVisible(): boolean {
        return (this.draggedColumn && this.draggedColumn.groupable) ||
            !this.chipsGoupingExpressions.length;
    }

    /**
     * Filters a single `IgxColumnComponent`.
     * ```typescript
     * public filter(term) {
     *      this.grid.filter("ProductName", term, IgxStringFilteringOperand.instance().condition("contains"));
     * }
     * ```
     * @param name
     * @param value
     * @param conditionOrExpressionTree
     * @param ignoreCase
     * @memberof IgxGridComponent
     */
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

    /**
     * Filters all the `IgxColumnComponent` in the `IgxGridComponent` with the same condition.
     * ```typescript
     * grid.filterGlobal('some', IgxStringFilteringOperand.instance().condition('contains'));
     * ```
     * @param value
     * @param condition
     * @param ignoreCase
     * @memberof IgxGridComponent
     */
    public filterGlobal(value: any, condition?, ignoreCase?) {
        this.gridAPI.filter_global(this.id, value, condition, ignoreCase);
    }

    /**
     * Enables summaries for the specified column and applies your customSummary.
     * If you do not provide the customSummary, then the default summary for the column data type will be applied.
     * ```typescript
     * grid.enableSummaries([{ fieldName: 'ProductName' }, { fieldName: 'ID' }]);
     * ```
     * Enable summaries for the listed columns.
     * ```typescript
     * grid.enableSummaries('ProductName');
     * ```
     * @param rest
     * @memberof IgxGridComponent
     */
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

    /**
     * Disable summaries for the specified column.
     * ```typescript
     * grid.disableSummaries('ProductName');
     * ```
     *
     * Disable summaries for the listed columns.
     * ```typescript
     * grid.disableSummaries([{ fieldName: 'ProductName' }]);
     * ```
     * @memberof IgxGridComponent
     */
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

    /**
     * If name is provided, clears the filtering state of the corresponding `IgxColumnComponent`,
     * otherwise clears the filtering state of all `IgxColumnComponent`s.
     * ```typescript
     * this.grid.clearFilter();
     * ```
     * @param name
     * @memberof IgxGridComponent
     */
    public clearFilter(name?: string) {
        if (name) {
            const column = this.gridAPI.get_column_by_name(this.id, name);
            if (!column) {
                return;
            }
        }

        this.gridAPI.clear_filter(this.id, name);
    }

    /**
     * If name is provided, clears the sorting state of the corresponding `IgxColumnComponent`,
     * otherwise clears the sorting state of all `IgxColumnComponent`.
     * ```typescript
     * this.grid.clearSort();
     * ```
     * @param name
     * @memberof IgxGridComponent
     */
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

    /**
     * @hidden
     */
    public clearSummaryCache(editCell?) {
        if (editCell && editCell.cell) {
            this.gridAPI.remove_summary(this.id, editCell.cell.column.filed);
        } else {
            this.gridAPI.remove_summary(this.id);
        }
    }

    // TODO: We have return values here. Move them to event args ??

    /**
     * Pins a column by field name. Returns whether the operation is successful.
     * ```typescript
     * this.grid.pinColumn("ID");
     * ```
     * @param columnName
     * @param index
     * @memberof IgxGridComponent
     */
    public pinColumn(columnName: string | IgxColumnComponent, index?): boolean {
        const col = columnName instanceof IgxColumnComponent ? columnName : this.getColumnByName(columnName);
        return col.pin(index);
    }

    /**
     * Unpins a column by field name. Returns whether the operation is successful.
     * ```typescript
     * this.grid.pinColumn("ID");
     * ```
     * @param columnName
     * @param index
     * @memberof IgxGridComponent
     */
    public unpinColumn(columnName: string | IgxColumnComponent, index?): boolean {
        const col = columnName instanceof IgxColumnComponent ? columnName : this.getColumnByName(columnName);
        return col.unpin(index);
    }

    /**
     * Toggles the expansion state of all group rows recursively.
     * ```typescript
     * this.grid.toggleAllGroupRows;
     * ```
     * @memberof IgxGridComponent
     */
    public toggleAllGroupRows() {
        this.groupingExpansionState = [];
        this.groupsExpanded = !this.groupsExpanded;
        this.cdr.detectChanges();
    }


    /**
     * Recalculates grid width/height dimensions. Should be run when changing DOM elements dimentions manually that affect the grid's size.
     * ```typescript
     * this.grid.reflow();
     * ```
     * @memberof IgxGridComponent
     */
    public reflow() {
        this.calculateGridSizes();
    }

    /**
     * Recalculates grid summary area.
     * Should be run for example when enabling or disabling summaries for a column.
     * ```typescript
     * this.grid.recalculateSummaries();
     * ```
     * @memberof IgxGridComponent
     */
    public recalculateSummaries() {
        this.summariesHeight = 0;
        requestAnimationFrame(() => this.calculateGridSizes());
    }

    /**
     * Finds the next occurrence of a given string in the grid and scrolls to the cell if it isn't visible.
     * Returns how many times the grid contains the string.
     * ```typescript
     * this.grid.findNext("financial");
     * ```
     * @param text the string to search.
     * @param caseSensitive optionally, if the search should be case sensitive (defaults to false).
     * @memberof IgxGridComponent
     */
    public findNext(text: string, caseSensitive?: boolean): number {
        return this.find(text, 1, caseSensitive);
    }

    /**
     * Finds the previous occurrence of a given string in the grid and scrolls to the cell if it isn't visible.
     * Returns how many times the grid contains the string.
     * ```typescript
     * this.grid.findPrev("financial");
     * ````
     * @param text the string to search.
     * @param caseSensitive optionally, if the search should be case sensitive (defaults to false).
     * @memberof IgxGridComponent
     */
    public findPrev(text: string, caseSensitive?: boolean): number {
        return this.find(text, -1, caseSensitive);
    }

    /**
     * Reapplies the existing search.
     * Returns how many times the grid contains the last search.
     * ```typescript
     * this.grid.refreshSearch();
     * ```
     * @param updateActiveInfo
     * @memberof IgxGridComponent
     */
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

    /**
     * Removes all the highlights in the cell.
     * ```typescript
     * this.grid.clearSearch();
     * ```
     * @memberof IgxGridComponent
     */
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

    /**
     * Returns if the `IgxGridComponent` has groupable columns.
     * ```typescript
     * const groupableGrid = this.grid.hasGroupableColumns;
     * ```
     * @memberof IgxGridComponent
     */
    get hasGroupableColumns(): boolean {
        return this.columnList.some((col) => col.groupable);
    }

    /**
     * Returns if the `IgxGridComponent` has sortable columns.
     * ```typescript
     * const sortableGrid = this.grid.hasSortableColumns;
     * ```
     * @memberof IgxGridComponent
     */
    get hasSortableColumns(): boolean {
        return this.columnList.some((col) => col.sortable);
    }

    /**
     * Returns if the `IgxGridComponent` has editable columns.
     * ```typescript
     * const editableGrid = this.grid.hasEditableColumns;
     * ```
     * @memberof IgxGridComponent
     */
    get hasEditableColumns(): boolean {
        return this.columnList.some((col) => col.editable);
    }

    /**
     * Returns if the `IgxGridComponent` has fiterable columns.
     * ```typescript
     * const filterableGrid = this.grid.hasFilterableColumns;
     * ```
     * @memberof IgxGridComponent
     */
    get hasFilterableColumns(): boolean {
        return this.columnList.some((col) => col.filterable);
    }

    /**
     * Returns if the `IgxGridComponent` has summarized columns.
     * ```typescript
     * const summarizedGrid = this.grid.hasSummarizedColumns;
     * ```
     * @memberof IgxGridComponent
     */
    get hasSummarizedColumns(): boolean {
        const summarizedColumns = this.columnList.filter(col => col.hasSummary);
        return summarizedColumns.length > 0 && summarizedColumns.some(col => !col.hidden);
    }

    /**
     * Returns if the `IgxGridComponent` has moveable columns.
     * ```typescript
     * const movableGrid = this.grid.hasMovableColumns;
     * ```
     * @memberof IgxGridComponent
     */
    get hasMovableColumns(): boolean {
        return this.columnList && this.columnList.some((col) => col.movable);
    }

    /**
     * Returns if the `IgxGridComponent` has column groups.
     * ```typescript
     * const groupGrid = this.grid.hasColumnGroups;
     * ```
     * @memberof IgxGridComponent
     */
    get hasColumnGroups(): boolean {
        return this.columnList.some(col => col.columnGroup);
    }

    /**
     * Returns an array of the selected `IgxGridCellComponent`s.
     * ```typescript
     * const selectedCells = this.grid.selectedCells;
     * ```
     * @memberof IgxGridComponent
     */
    get selectedCells(): IgxGridCellComponent[] | any[] {
        if (this.rowList) {
            return this.rowList.filter((row) => row instanceof IgxGridRowComponent).map((row) => row.cells.filter((cell) => cell.selected))
                .reduce((a, b) => a.concat(b), []);
        }
        return [];
    }

    /**
     * @hidden
     */
    protected get rowBasedHeight() {
        if (this.data && this.data.length) {
            return this.data.length * this.rowHeight;
        }
        return 0;
    }

    /**
     * @hidden
     */
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

    /**
     * @hidden
     */
    protected _derivePossibleWidth() {
        if (!this._columnWidthSetByUser) {
            this._columnWidth = this.getPossibleColumnWidth();
            this.initColumns(this.columnList, null);
        }
    }

    /**
     * @hidden
     */
    private get defaultTargetBodyHeight(): number {
        const allItems = this.totalItemCount || this.data.length;
        return this.rowHeight * Math.min(this._defaultTargetRecordNumber,
            this.paging ? Math.min(allItems, this.perPage) : allItems);
    }

    /**
     * @hidden
     */
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
                this.paginator.nativeElement.offsetHeight : 0;
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

    /**
     * @hidden
     */
    protected _calculateGridBodyHeight(gridHeight: number,
        toolbarHeight: number, pagingHeight: number, groupAreaHeight: number) {
        const footerBordersAndScrollbars = this.tfoot.nativeElement.offsetHeight -
            this.tfoot.nativeElement.clientHeight;
        if (isNaN(gridHeight)) {
            return this.defaultTargetBodyHeight;
        }

        return Math.abs(gridHeight - toolbarHeight -
            this.theadRow.nativeElement.offsetHeight -
            this.summariesHeight - pagingHeight - groupAreaHeight -
            footerBordersAndScrollbars -
            this.scr.nativeElement.clientHeight);
    }

    /**
     * @hidden
     */
    protected getPossibleColumnWidth() {
        let computedWidth = parseInt(
            this.document.defaultView.getComputedStyle(this.nativeElement).getPropertyValue('width'), 10);

        if (this.showRowCheckboxes) {
            computedWidth -= this.headerCheckboxContainer.nativeElement.clientWidth;
        }

        const visibleChildColumns = this.visibleColumns.filter(c => !c.columnGroup);

        const columnsWithSetWidths = visibleChildColumns.filter(c => c.widthSetByUser);
        const columnsToSize = visibleChildColumns.length - columnsWithSetWidths.length;

        const sumExistingWidths = columnsWithSetWidths
            .reduce((prev, curr) => prev + parseInt(curr.width, 10), 0);

        const columnWidth = !Number.isFinite(sumExistingWidths) ?
            Math.max(computedWidth / columnsToSize, MINIMUM_COLUMN_WIDTH) :
            Math.max((computedWidth - sumExistingWidths) / columnsToSize, MINIMUM_COLUMN_WIDTH);

        return columnWidth.toString();
    }

    /**
     * @hidden
     */
    protected calculateGridWidth() {
        const computed = this.document.defaultView.getComputedStyle(this.nativeElement);

        if (this._width && this._width.indexOf('%') !== -1) {
            /* width in %*/
            const width = parseInt(computed.getPropertyValue('width'), 10);
            if (Number.isFinite(width) && width !== this.calcWidth) {
                this.calcWidth = width;

                this.cdr.markForCheck();
            }
        } else {
            this.calcWidth = parseInt(this._width, 10);
        }

        this._derivePossibleWidth();
    }

    /**
     * @hidden
     */
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

    /**
     * @hidden
     */
    protected calculateGridSizes() {
        this.calculateGridWidth();
        this.cdr.detectChanges();
        this.calculateGridHeight();
        if (this.showRowCheckboxes) {
            this.calcRowCheckboxWidth = this.headerCheckboxContainer.nativeElement.clientWidth;
        }
        this.cdr.detectChanges();
    }

    /**
     * Gets calculated width of the pinned area.
     * ```typescript
     * const pinnedWidth = this.grid.getPinnedWidth();
     * ```
     * @param takeHidden If we should take into account the hidden columns in the pinned area.
     * @memberof IgxGridComponent
     */
    public getPinnedWidth(takeHidden = false) {
        const fc = takeHidden ? this._pinnedColumns : this.pinnedColumns;
        let sum = 0;
        for (const col of fc) {
            if (col.level === 0) {
                sum += parseInt(col.width, 10);
            }
        }
        if (this.showRowCheckboxes) {
            sum += this.calcRowCheckboxWidth;
        }

        if (this.groupingExpressions.length > 0 && this.headerGroupContainer) {
            sum += this.headerGroupContainer.nativeElement.clientWidth;
        }
        return sum;
    }

    /**
     * @hidden
     * Gets calculated width of the unpinned area
     * @param takeHidden If we should take into account the hidden columns in the pinned area.
     * @memberof IgxGridComponent
     */
    protected getUnpinnedWidth(takeHidden = false) {
        const width = this._width && this._width.indexOf('%') !== -1 ?
            this.calcWidth :
            parseInt(this._width, 10);
        return width - this.getPinnedWidth(takeHidden);
    }

    /**
     * @hidden
     */
    protected _getStateForGroupRow(groupRow: IGroupByRecord): IGroupByExpandState {
        return this.gridAPI.groupBy_get_expanded_for_group(this.id, groupRow);
    }

    /**
     * @hidden
     */
    protected _toggleGroup(groupRow: IGroupByRecord) {
        this.gridAPI.groupBy_toggle_group(this.id, groupRow);
    }

    /**
     * @hidden
     */
    protected _applyGrouping() {
        this.gridAPI.sort_multiple(this.id, this._groupingExpressions);
    }

    /**
     * @hidden
     */
    protected _summaries(fieldName: string, hasSummary: boolean, summaryOperand?: any) {
        const column = this.gridAPI.get_column_by_name(this.id, fieldName);
        column.hasSummary = hasSummary;
        if (summaryOperand) {
            column.summaries = summaryOperand;
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
    protected _disableMultipleSummaries(expressions: string[], hasSummary: boolean) {
        expressions.forEach((column) => { this._summaries(column, false); });
    }

    /**
     * @hidden
     */
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

    /**
     * @hidden
     */
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

    /**
     * @hidden
     */
    onlyTopLevel(arr) {
        return arr.filter(c => c.level === 0);
    }

    /**
     * @hidden
     */
    protected initColumns(collection: QueryList<IgxColumnComponent>, cb: any = null) {
        // XXX: Deprecate index
        this._columns = this.columnList.toArray();
        collection.forEach((column: IgxColumnComponent) => {
            column.gridID = this.id;
            column.defaultWidth = this.columnWidth;

            if (cb) {
                cb(column);
            }
        });

        this.reinitPinStates();
    }

    /**
     * @hidden
     */
    protected reinitPinStates() {
        this._pinnedColumns = this.columnList.filter((c) => c.pinned);
        this._unpinnedColumns = this.columnList.filter((c) => !c.pinned);
    }

    /**
     * @hidden
     */
    protected setEventBusSubscription() {
        this.eventBus.pipe(
            debounceTime(DEBOUNCE_TIME),
            takeUntil(this.destroy$)
        ).subscribe(() => this.cdr.detectChanges());
    }

    /**
     * @hidden
     */
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

    /**
     * @hidden
     */
    public onHeaderCheckboxClick(event) {
        this.allRowsSelected = event.checked;
        const newSelection =
            event.checked ?
                this.filteredData ?
                    this.selection.add_items(this.id, this.selection.get_all_ids(this._filteredData, this.primaryKey)) :
                    this.selection.get_all_ids(this.data, this.primaryKey) :
                this.filteredData ?
                    this.selection.delete_items(this.id, this.selection.get_all_ids(this._filteredData, this.primaryKey)) :
                    this.selection.get_empty();
        this.triggerRowSelectionChange(newSelection, null, event, event.checked);
        this.checkHeaderCheckboxStatus(event.checked);
    }

    /**
     * @hidden
     */
    get headerCheckboxAriaLabel() {
        return this._filteringExpressionsTree.filteringOperands.length > 0 ?
            this.headerCheckbox && this.headerCheckbox.checked ? 'Deselect all filtered' : 'Select all filtered' :
            this.headerCheckbox && this.headerCheckbox.checked ? 'Deselect all' : 'Select all';
    }

    public get template(): TemplateRef<any> {
        if (this.filteredData && this.filteredData.length === 0) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyFilteredGridTemplate;
        }

        if (this.data && this.data.length === 0) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyGridDefaultTemplate;
        }
    }

     /**
     * @hidden
     */
    public getContext(rowData): any {
        return {
            $implicit: rowData,
            templateID: this.isGroupByRecord(rowData) ? 'groupRow' : 'dataRow'
        };
    }


    /**
     * @hidden
     */
    public get dropAreaTemplateResolved(): TemplateRef<any> {
        if (this.dropAreaTemplate) {
            return this.dropAreaTemplate;
        } else {
            return this.defaultDropAreaTemplate;
        }
    }

    /**
     * @hidden
     */
    public checkHeaderCheckboxStatus(headerStatus?: boolean) {
        if (headerStatus === undefined) {
            const data = this.filteredData && this.filteredData.length ?  this.filteredData : this.data;
            this.allRowsSelected = this.selection.are_all_selected(this.id, data);
            if (this.headerCheckbox) {
                this.headerCheckbox.indeterminate = !this.allRowsSelected && !this.selection.are_none_selected(this.id);
                if (!this.headerCheckbox.indeterminate) {
                    this.headerCheckbox.checked = this.allRowsSelected;
                }
            }
            this.cdr.markForCheck();
        } else if (this.headerCheckbox) {
            this.headerCheckbox.checked = headerStatus !== undefined ? headerStatus : false;
        }
    }

    /**
     * @hidden
     */
    public filteredItemsStatus(componentID: string, filteredData: any[], primaryKey?) {
        const currSelection = this.selection.get(componentID);
        let atLeastOneSelected = false;
        let notAllSelected = false;
        if (currSelection) {
            for (const key of Object.keys(filteredData)) {
                const dataItem = primaryKey ? filteredData[key][primaryKey] : filteredData[key];
                if (currSelection.has(dataItem)) {
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

    /**
     * @hidden
     */
    public updateHeaderCheckboxStatusOnFilter(data) {
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

    /**
     * Get current selection state.
     * Returns an array with selected rows' IDs (primaryKey or rowData)
     * ```typescript
     * const selectedRows = this.grid.selectedRows();
     * ```
     * @memberof IgxGridComponent
     */
    public selectedRows(): any[] {
        let selection: Set<any>;
        selection = this.selection.get(this.id);
        return selection ? Array.from(selection) : [];
    }

    /**
     * Select specified rows by ID.
     * ```typescript
     * this.grid.selectRows([1,2,5], true);
     * ```
     * @param rowIDs
     * @param clearCurrentSelection if true clears the curren selection
     * @memberof IgxGridComponent
     */
    public selectRows(rowIDs: any[], clearCurrentSelection?: boolean) {
        let newSelection: Set<any>;
        newSelection = this.selection.add_items(this.id, rowIDs, clearCurrentSelection);
        this.triggerRowSelectionChange(newSelection);
    }

    /**
     * Deselect specified rows by ID.
     * ```typescript
     * this.grid.deselectRows([1,2,5]);
     * ```
     * @param rowIDs
     * @memberof IgxGridComponent
     */
    public deselectRows(rowIDs: any[]) {
        let newSelection: Set<any>;
        newSelection = this.selection.delete_items(this.id, rowIDs);
        this.triggerRowSelectionChange(newSelection);
    }

    /**
     * Selects all rows
     * Note: If filtering is in place, selectAllRows() and deselectAllRows() select/deselect all filtered rows.
     * ```typescript
     * this.grid.selectAllRows();
     * ```
     * @memberof IgxGridComponent
     */
    public selectAllRows() {
        this.triggerRowSelectionChange(this.selection.get_all_ids(this.data, this.primaryKey));
    }

    /**
     * Deselects all rows
     * ```typescript
     * this.grid.deselectAllRows();
     * ```
     * Note: If filtering is in place, selectAllRows() and deselectAllRows() select/deselect all filtered rows.
     */
    public deselectAllRows() {
        this.triggerRowSelectionChange(this.selection.get_empty());
    }

    /**
     * @hidden
     */
    public triggerRowSelectionChange(newSelectionAsSet: Set<any>, row?: IgxGridRowComponent, event?: Event, headerStatus?: boolean) {
        const oldSelectionAsSet = this.selection.get(this.id);
        const oldSelection = oldSelectionAsSet ? Array.from(oldSelectionAsSet) : [];
        const newSelection = newSelectionAsSet ? Array.from(newSelectionAsSet) : [];
        const args: IRowSelectionEventArgs = { oldSelection, newSelection, row, event };
        this.onRowSelectionChange.emit(args);
        newSelectionAsSet = this.selection.get_empty();
        for (let i = 0; i < args.newSelection.length; i++) {
            newSelectionAsSet.add(args.newSelection[i]);
        }
        this.selection.set(this.id, newSelectionAsSet);
        this.checkHeaderCheckboxStatus(headerStatus);
    }

    /**
     * @hidden
     */
    public navigateDown(rowIndex: number, columnIndex: number, event?) {
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
                this.performVerticalScroll(scrollAmount, rowIndex, columnIndex, event);
            } else {
                if (row instanceof IgxGridGroupByRowComponent) {
                    target.nativeElement.focus();
                } else {
                    (target as any)._updateCellSelectionStatus(true, event);
                }
            }
        } else {
            const contentHeight = this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.offsetHeight;
            const scrollOffset = parseInt(this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const lastRowOffset = contentHeight + scrollOffset - this.calcHeight;
            const scrollAmount = this.rowHeight + lastRowOffset;
            this.performVerticalScroll(scrollAmount, rowIndex, columnIndex, event);
        }
    }

    /**
     * @hidden
     */
    public navigateUp(rowIndex: number, columnIndex: number, event?) {
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
            if (this.rowHeight > Math.abs(containerTopOffset) // not the entire row is visible, due to grid offset
                && verticalScroll.scrollTop // the scrollbar is not at the first item
                && row.element.nativeElement.offsetTop < this.rowHeight) { // the target is in the first row
                    const scrollAmount = containerTopOffset < 0 ?
                    containerTopOffset :
                    -this.rowHeight + Math.abs(containerTopOffset);
                this.performVerticalScroll(scrollAmount, rowIndex - 1, columnIndex, event);
            }
            if (row instanceof IgxGridGroupByRowComponent) {
                target.nativeElement.focus();
            } else {
                (target as any)._updateCellSelectionStatus(true, event);
            }
        } else {
            const scrollOffset =
                -parseInt(this.verticalScrollContainer.dc.instance._viewContainer.element.nativeElement.style.top, 10);
            const scrollAmount = this.rowHeight + scrollOffset;
            this.performVerticalScroll(-scrollAmount, rowIndex, columnIndex, event);
        }
    }

    /**
     * @hidden
     */
    @HostListener('scroll', ['$event'])
    public scrollHandler(event) {
        this.parentVirtDir.getHorizontalScroll().scrollLeft += event.target.scrollLeft;
        this.verticalScrollContainer.getVerticalScroll().scrollTop += event.target.scrollTop;
        event.target.scrollLeft = 0;
        event.target.scrollTop = 0;
    }

    private _focusNextCell(rowIndex: number, columnIndex: number, dir?: string, event?) {
        let row = this.gridAPI.get_row_by_index(this.id, rowIndex);
        const virtualDir = dir !== undefined ? row.virtDirRow : this.verticalScrollContainer;
        this.subscribeNext(virtualDir, () => {
            let target;
            this.cdr.detectChanges();
            row = this.gridAPI.get_row_by_index(this.id, rowIndex);
            target = this.gridAPI.get_cell_by_visible_index(this.id, rowIndex, columnIndex);

            if (!target) {
                if (dir) {
                    target = dir === 'left' ? row.cells.first : row.cells.last;
                } else if (row instanceof IgxGridGroupByRowComponent) {
                    target = row.groupContent;
                    target.nativeElement.focus();
                    return;
                } else if (row) {
                    target = row.cells.first;
                } else {
                    return;
                }
            }
            target._updateCellSelectionStatus(true, event);
        });
    }

    private subscribeNext(virtualContainer: any, callback: (elem?) => void) {
        virtualContainer.onChunkLoad.pipe(take(1)).subscribe({
            next: (e: any) => {
                callback(e);
            }
        });
    }

    private performVerticalScroll(amount: number, rowIndex: number, columnIndex: number, event?) {
        const scrolled = this.verticalScrollContainer.addScrollTop(amount);
        if (scrolled) {
            this._focusNextCell(rowIndex, columnIndex, undefined, event);
        }
    }

    /**
     * @hidden
     */
    public trackColumnChanges(index, col) {
        return col.field + col.width;
    }

    private find(text: string, increment: number, caseSensitive?: boolean, scroll?: boolean) {
        if (!this.rowList) {
            return 0;
        }

        const editModeCell = this.gridAPI.get_cell_inEditMode(this.id);
        if (editModeCell) {
            this.gridAPI.escape_editMode(this.id);
        }

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

    /**
     * Returns an array containing the filtered data.
     * ```typescript
     * const filteredData = this.grid1.filteredSortedData;
     * ```
     * @memberof IgxGridComponent
     */
    get filteredSortedData(): any[] {
        let data: any[] = this.filteredData ? this.filteredData : this.data;

        if (this.sortingExpressions &&
            this.sortingExpressions.length > 0) {

            const sortingPipe = new IgxGridSortingPipe();
            data = sortingPipe.transform(data, this.sortingExpressions, -1);
        }

        return data;
    }

    /**
     * @hidden
     */
    protected initPinning() {
        let currentPinnedWidth = 0;
        const pinnedColumns = [];
        const unpinnedColumns = [];
        const newUnpinnedCols = [];

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
        for (let i = 0; i < this._columns.length; i++) {
            if (this._columns[i].pinned && !this._columns[i].parent) {
                // Pinned column. Check if with it the unpinned min width is exceeded.
                const colWidth = parseInt(this._columns[i].width, 10);
                if (currentPinnedWidth + colWidth > this.calcWidth - this.unpinnedAreaMinWidth) {
                    // unpinned min width is exceeded. Unpin the columns and add it to the unpinned collection.
                    this._columns[i].pinned = false;
                    unpinnedColumns.push(this._columns[i]);
                    newUnpinnedCols.push(this._columns[i]);
                } else {
                    // unpinned min width is not exceeded. Keep it pinned and add it to the pinned collection.
                    currentPinnedWidth += colWidth;
                    pinnedColumns.push(this._columns[i]);
                }
            } else if (this._columns[i].pinned && this._columns[i].parent) {
                if (this._columns[i].topLevelParent.pinned) {
                    pinnedColumns.push(this._columns[i]);
                } else {
                    this._columns[i].pinned = false;
                    unpinnedColumns.push(this._columns[i]);
                }
            } else {
                unpinnedColumns.push(this._columns[i]);
            }
        }

        if (newUnpinnedCols.length) {
            console.warn(
                'igxGrid - The pinned area exceeds maximum pinned width. ' +
                'The following columns were unpinned to prevent further issues:' +
                 newUnpinnedCols.map(col => '"' + col.header + '"').toString() + '. For more info see our documentation.'
            );
        }

        // Assign the applicaple collections.
        this._pinnedColumns = pinnedColumns;
        this._unpinnedColumns = unpinnedColumns;
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
        const isColumn = directive.igxForScrollOrientation === 'horizontal';

        const size = directive.getItemCountInView();

        if (start >= goal) {
            // scroll so that goal is at beggining of visible chunk
            directive.scrollTo(goal);
        } else if (start + size <= goal) {
            // scroll so that goal is at end of visible chunk
            if (isColumn) {
                directive.getHorizontalScroll().scrollLeft =
                    directive.getColumnScrollLeft(goal) -
                    parseInt(directive.igxForContainerSize, 10) +
                    parseInt(this.columns[goal].width, 10);
            } else {
                directive.scrollTo(goal - size + 1);
            }
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
                expansion: this.groupingExpansionState,
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

    private checkIfGridIsAdded(node): boolean {
        if (node === this.nativeElement) {
            return true;
        } else {
            for (const childNode of node.childNodes) {
                const added = this.checkIfGridIsAdded(childNode);
                if (added) {
                    return true;
                }
            }

            return false;
        }
    }

    /**
     * @hidden
     */
    notGroups(arr) {
        return arr.filter(c => !c.columnGroup);
    }

    /**
     * @hidden
     */
    public onChipRemoved(event) {
        this.clearGrouping(event.owner.id);
    }

    /**
     * @hidden
     */
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

        if (!this._chipsDragged) {
            this.groupingExpressions = this.chipsGoupingExpressions;
        }
        this.markForCheck();
    }

    /**
     * @hidden
     */
    public chipsMovingStarted() {
        this._chipsDragged = true;
    }

    /**
     * @hidden
     */
    public chipsMovingEnded() {
        this.groupingExpressions = this.chipsGoupingExpressions;
        this._chipsDragged = false;
        this.markForCheck();
    }

    /**
     * @hidden
     */
    public onChipClicked(event) {
        const sortingExpr = this.sortingExpressions;
        const columnExpr = sortingExpr.find((expr) => expr.fieldName === event.owner.id);
        columnExpr.dir = 3 - columnExpr.dir;
        this.sort(columnExpr);
        this.markForCheck();
    }

    /**
     * @hidden
     */
    public onChipKeyDown(event) {
        if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
            const sortingExpr = this.sortingExpressions;
            const columnExpr = sortingExpr.find((expr) => expr.fieldName === event.owner.id);
            columnExpr.dir = 3 - columnExpr.dir;
            this.sort(columnExpr);
            this.markForCheck();
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pagedown', ['$event'])
    public onKeydownPageDown(event) {
        event.preventDefault();
        this.verticalScrollContainer.scrollNextPage();
        this.nativeElement.focus();
    }

    /**
     * @hidden
     */
    @HostListener('keydown.pageup', ['$event'])
    public onKeydownPageUp(event) {
        event.preventDefault();
        this.verticalScrollContainer.scrollPrevPage();
        this.nativeElement.focus();
    }
}
