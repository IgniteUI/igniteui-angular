import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Input,
    QueryList,
    TemplateRef,
    forwardRef,
    AfterViewInit
} from '@angular/core';
import { DataType } from '../data-operations/data-util';
import { GridBaseAPIService } from './api.service';
import { IgxGridCellComponent } from './cell.component';
import { IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryOperand } from './summaries/grid-summary';
import { IgxRowComponent } from './row.component';
import {
    IgxCellEditorTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective,
    IgxFilterCellTemplateDirective
} from './grid.common';
import { IgxGridHeaderComponent } from './grid-header.component';
import { DefaultSortingStrategy, ISortingStrategy } from '../data-operations/sorting-strategy';
import { getNodeSizeViaRange, flatten } from '../core/utils';
import {
    IgxBooleanFilteringOperand,
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand,
    IgxStringFilteringOperand,
    IgxFilteringOperand
} from '../data-operations/filtering-condition';
import { IgxGridBaseComponent, IGridDataBindable } from './grid-base.component';
import { FilteringExpressionsTree } from '../data-operations/filtering-expressions-tree';
import { IgxGridFilteringCellComponent } from './filtering/grid-filtering-cell.component';
import { IgxGridHeaderGroupComponent } from './grid-header-group.component';
import { DeprecateProperty } from '../core/deprecateDecorators';
import { MRLColumnSizeInfo, MRLResizeColumnInfo } from '../data-operations/multi-row-layout.interfaces';
import { DisplayDensity } from '../core/displayDensity';

/**
 * **Ignite UI for Angular Column** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html#columns-configuration)
 *
 * The Ignite UI Column is used within an `igx-grid` element to define what data the column will show. Features such as sorting,
 * filtering & editing are enabled at the column level.  You can also provide a template containing custom content inside
 * the column using `ng-template` which will be used for all cells within the column.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-column',
    template: ``
})
export class IgxColumnComponent implements AfterContentInit {
    private _filterable = true;
    private _groupable = false;
    /**
     * Sets/gets the `field` value.
     * ```typescript
     * let columnField = this.column.field;
     * ```
     * ```html
     * <igx-column [field] = "'ID'"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public field: string;
    /**
     * Sets/gets the `header` value.
     * ```typescript
     * let columnHeader = this.column.header;
     * ```
     * ```html
     * <igx-column [header] = "'ID'"></igx-column>
     * ```
     *
     * @memberof IgxColumnComponent
     */
    @Input()
    public header = '';
    /**
     * Sets/gets whether the column is sortable.
     * Default value is `false`.
     * ```typescript
     * let isSortable = this.column.sortable;
     * ```
     * ```html
     * <igx-column [sortable] = "true"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public sortable = false;
    /**
     * Sets/gets whether the column is groupable.
     * Default value is `false`.
     * ```typescript
     * let isGroupable = this.column.groupable;
     * ```
     * ```html
     * <igx-column [groupable] = "true"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public get groupable() {
        return this._groupable;
    }
    public set groupable(val) {
        this._groupable = val;
        if (this.grid) {
            this.grid.cdr.markForCheck();
        }
    }
    /**
     * Gets whether the column is editable.
     * Default value is `false`.
     * ```typescript
     * let isEditable = this.column.editable;
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    get editable(): boolean {
        // Updating the primary key when grid has transactions should not be
        // allowed. We are aggregating the transactions by primary key. If one
        // change the primary key the transaction state for the related record
        // will be corrupted. This is why if this is primary kew column and
        // grid has transactions we return false here.
        const hasGrid = this.grid !== undefined;
        const rowEditable = hasGrid && this.grid.rowEditable;
        const hasTransactions = hasGrid && this.grid.transactions.enabled;

        if (this.isPrimaryColumn && (rowEditable || hasTransactions)) {
            return false;
        } else {
            if (this._editable !== undefined) {
                return this._editable;
            } else {
                return rowEditable;
            }
        }
    }
    /**
     * Sets whether the column is editable.
     * ```typescript
     * this.column.editable = true;
     * ```
     * ```html
     * <igx-column [editable] = "true"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    set editable(editable: boolean) {
        this._editable = editable;
    }
    /**
     * Sets/gets whether the column is filterable.
     * Default value is `true`.
     * ```typescript
     * let isFilterable = this.column.filterable;
     * ```
     * ```html
     * <igx-column [filterable] = "false"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public get filterable() {
        return this._filterable;
    }
    public set filterable(val) {
        this._filterable = val;
        if (this.grid) {
            this.grid.cdr.markForCheck();
        }
    }
    /**
     * Sets/gets whether the column is resizable.
     * Default value is `false`.
     * ```typescript
     * let isResizable = this.column.resizable;
     * ```
     * ```html
     * <igx-column [resizable] = "true"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public resizable = false;
    /**
     * Gets a value indicating whether the summary for the column is enabled.
     * ```typescript
     * let hasSummary = this.column.hasSummary;
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    get hasSummary() {
        return this._hasSummary;
    }
    /**
     * Sets a value indicating whether the summary for the column is enabled.
     * Default value is `false`.
     * ```html
     * <igx-column [hasSummary] = "true"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    set hasSummary(value) {
        this._hasSummary = value;

        if (this.grid) {
            this.grid.summaryService.recalculateSummaries();
        }
    }
    /**
     * Gets whether the column is hidden.
     * ```typescript
     * let isHidden = this.column.hidden;
     * ```
     *@memberof IgxColumnComponent
     */
    @Input()
    get hidden(): boolean {
        return this._hidden;
    }
    /**
     * Sets the column hidden property.
     * Default value is `false`.
     * ```typescript
     * <igx-column [hidden] = "true"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    set hidden(value: boolean) {
        if (this._hidden !== value) {
            this._hidden = value;
            if (this.grid) {
                this.grid.resetCaches();
                this.grid.endEdit(false);
            }
            // TODO: Simplify
            this.check();
            if (this.grid) {
                this.grid.refreshSearch(true);
                this.grid.summaryService.resetSummaryHeight();
                this.grid.reflow();
                this.grid.filteringService.refreshExpressions();
            }

            if (this.columnLayoutChild && this.parent.hidden !== value) {
                this.parent.hidden = value;
            }
        }
    }
    /**
     * Gets whether the hiding is disabled.
     * ```typescript
     * let isHidingDisabled =  this.column.disableHiding;
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    get disableHiding(): boolean {
        return this._disableHiding;
    }
    /**
     * Enables/disables hiding for the column.
     * Default value is `false`.
     * ```typescript
     * <igx-column [hidden] = "true"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    set disableHiding(value: boolean) {
        if (this._disableHiding !== value) {
            this._disableHiding = value;
            this.check();
        }
    }
    /**
     * Gets whether the pinning is disabled.
     * ```typescript
     * let isPinningDisabled =  this.column.disablePinning;
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    get disablePinning(): boolean {
        return this._disablePinning;
    }
    /**
     * Enables/disables pinning for the column.
     * Default value is `false`.
     * ```typescript
     * <igx-column [pinned] = "true"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    set disablePinning(value: boolean) {
        if (this._disablePinning !== value) {
            this._disablePinning = value;
            this.check();
        }
    }
    /**
     * Sets/gets whether the column is movable.
     * Default value is `false`.
     * ```typescript
     * let isMovable = this.column.movable;
     * ```
     * ```html
     * <igx-column [movable] = "true"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public movable = false;
    /**
     * Gets the `width` of the column.
     * ```typescript
     * let columnWidth = this.column.width;
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public get width(): string {
        return this.widthSetByUser ? this._width : this.defaultWidth;
    }
    /**
     * Sets the `width` of the column.
     * ```html
     * <igx-column [width] = "'25%'"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    public set width(value: string) {
        if (value) {
            this._calcWidth = null;
            this.calcPixelWidth = NaN;
            this.widthSetByUser = true;
            this._width = value;
            if (this.grid) {
                this.cacheCalcWidth();
                (this.grid as any)._derivePossibleWidth();
                this.grid.cdr.markForCheck();
            }
        }
    }

    /**
     * @hidden
     */
    public get calcWidth(): any {
        return this.getCalcWidth();
    }

    private _calcWidth = null;
    public calcPixelWidth: number;

    /**
     * Sets/gets the maximum `width` of the column.
     * ```typescript
     * let columnMaxWidth = this.column.width;
     * ```
     * ```html
     * <igx-column [maxWidth] = "'75%'"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public maxWidth: string;
    /**
     * Sets/gets the minimum `width` of the column.
     * Default value is `88`;
     * ```typescript
     * let columnMinWidth = this.column.minWidth;
     * ```
     * ```html
     * <igx-column [minWidth] = "'15%'"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public set minWidth(value: string) {
        const minVal = parseFloat(value);
        if (Number.isNaN(minVal)) { return; }
        this._defaultMinWidth = value;

    }
    public get minWidth(): string {
        return !this._defaultMinWidth ? this.defaultMinWidth : this._defaultMinWidth;
    }
    /**
     * Sets/gets the class selector of the column header.
     * ```typescript
     * let columnHeaderClass = this.column.headerClasses;
     * ```
     * ```html
     * <igx-column [headerClasses] = "'column-header'"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public headerClasses = '';

    /**
     * Sets/gets the class selector of the column group header.
     * ```typescript
     * let columnHeaderClass = this.column.headerGroupClasses;
     * ```
     * ```html
     * <igx-column [headerGroupClasses] = "'column-group-header'"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public headerGroupClasses = '';
    /**
     * Sets a conditional class selector of the column cells.
     * Accepts an object literal, containing key-value pairs,
     * where the key is the name of the CSS class, while the
     * value is either a callback function that returns a boolean,
     * or boolean, like so:
     * ```typescript
     * callback = (rowData, columnKey) => { return rowData[columnKey] > 6; }
     * cellClasses = { 'className' : this.callback };
     * ```
     * ```html
     * <igx-column [cellClasses] = "cellClasses"></igx-column>
     * <igx-column [cellClasses] = "{'class1' : true }"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public cellClasses: any;
    /**
     * Gets the column index.
     * ```typescript
     * let columnIndex = this.column.index;
     * ```
     * @memberof IgxColumnComponent
     */
    get index(): number {
        return this.grid.columns.indexOf(this);
    }
    /**
     * When autogenerating columns, the formatter is used to format the display of the column data
     * without modifying the underlying bound values.
     *
     * In this example, we check to see if the column name is Salary, and then provide a method as the column formatter
     * to format the value into a currency string.
     *
     * ```typescript
     * onColumnInit(column: IgxColumnComponent) {
     *   if (column.field == "Salary") {
     *     column.formatter = (salary => this.format(salary));
     *   }
     * }
     *
     * format(value: number) : string {
     *   return formatCurrency(value, "en-us", "$");
     * }
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    formatter: (value: any) => any;
    /**
     * Sets/gets whether the column filtering should be case sensitive.
     * Default value is `true`.
     * ```typescript
     * let filteringIgnoreCase = this.column.filteringIgnoreCase;
     * ```
     * ```html
     * <igx-column [filteringIgnoreCase] = "false"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public filteringIgnoreCase = true;
    /**
     * Sets/gets whether the column sorting should be case sensitive.
     * Default value is `true`.
     * ```typescript
     * let sortingIgnoreCase = this.column.sortingIgnoreCase;
     * ```
     * ```html
     * <igx-column [sortingIgnoreCase] = "false"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public sortingIgnoreCase = true;
    /**
     * Sets/gets the data type of the column values.
     * Default value is `string`.
     * ```typescript
     * let columnDataType = this.column.dataType;
     * ```
     * ```html
     * <igx-column [dataType] = "'number'"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public dataType: DataType = DataType.String;
    /**
     * Gets whether the column is `pinned`.
     * ```typescript
     * let isPinned = this.column.pinned;
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public get pinned(): boolean {
        return this._pinned;
    }
    /**
     * Sets whether the column is pinned.
     * Default value is `false`.
     * ```html
     * <igx-column [pinned] = "true"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    public set pinned(value: boolean) {
        if (this._pinned !== value) {
            if (this.grid && this.width && !isNaN(parseInt(this.width, 10))) {
                value ? this.pin() : this.unpin();
                return;
            }
            /* No grid/width available at initialization. `initPinning` in the grid
               will re-init the group (if present)
            */
            this._pinned = value;
        }
    }
    /**
     * @deprecated
     * Gets/Sets the `id` of the `igx-grid`.
     * ```typescript
     * let columnGridId = this.column.gridID;
     * ```
     * ```typescript
     * this.column.gridID = 'grid-1';
     * ```
     * @memberof IgxColumnComponent
     */
    @DeprecateProperty(`The property is deprecated. Please, use \`column.grid.id\` instead.`)
    public gridID: string;
    /**
     * Gets the column `summaries`.
     * ```typescript
     * let columnSummaries = this.column.summaries;
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public get summaries(): any {
        return this._summaries;
    }
    /**
     * Sets the column `summaries`.
     * ```typescript
     * this.column.summaries = IgxNumberSummaryOperand;
     * ```
     * @memberof IgxColumnComponent
     */
    public set summaries(classRef: any) {
        this._summaries = new classRef();

        if (this.grid) {
            this.grid.summaryService.removeSummariesCachePerColumn(this.field);
            (this.grid as any)._summaryPipeTrigger++;
            this.grid.summaryService.recalculateSummaries();
        }
    }
    /**
     * Sets/gets whether the column is `searchable`.
     * Default value is `true`.
     * ```typescript
     * let isSearchable =  this.column.searchable';
     * ```
     * ```html
     *  <igx-column [searchable] = "false"></igx-column>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public searchable = true;
    /**
     * Gets the column `filters`.
     * ```typescript
     * let columnFilters = this.column.filters'
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public get filters(): IgxFilteringOperand {
        return this._filters;
    }
    /**
     * Sets the column `filters`.
     * ```typescript
     * this.column.filters = IgxBooleanFilteringOperand.instance().
     * ```
     * @memberof IgxColumnComponent
     */
    public set filters(instance: IgxFilteringOperand) {
        this._filters = instance;
    }
    /**
     * Gets the column `sortStrategy`.
     * ```typescript
     * let sortStrategy = this.column.sortStrategy'
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public get sortStrategy(): ISortingStrategy {
        return this._sortStrategy;
    }
    /**
     * Sets the column `sortStrategy`.
     * ```typescript
     * this.column.sortStrategy = new CustomSortingStrategy().
     *
     * class CustomSortingStrategy extends SortingStrategy {
     * ...
     * }
     * ```
     * @memberof IgxColumnComponent
     */
    public set sortStrategy(classRef: ISortingStrategy) {
        this._sortStrategy = classRef;
    }
    /**
    * Gets the function that compares values for grouping.
    * ```typescript
    * let groupingComparer = this.column.groupingComparer'
    * ```
    * @memberof IgxColumnComponent
    */
    @Input()
    public get groupingComparer(): (a: any, b: any) => number {
        return this._groupingComparer;
    }
    /**
     * Sets a custom function to compare values for grouping.
     * Subsequent values in the sorted data that the function returns 0 for are grouped.
     * ```typescript
     * this.column.groupingComparer = (a: any, b: any) => { return a === b ? 0 : -1; }
     * ```
     * @memberof IgxColumnComponent
     */
    public set groupingComparer(funcRef: (a: any, b: any) => number) {
        this._groupingComparer = funcRef;
    }
    /**
     * Gets the default minimum `width` of the column.
     * ```typescript
     * let defaultMinWidth =  this.column.defaultMinWidth;
     * ```
     * @memberof IgxColumnComponent
     */
    get defaultMinWidth(): string {
        if (!this.grid) { return '80'; }
        switch (this.grid.displayDensity) {
            case DisplayDensity.cosy:
                return '64';
            case DisplayDensity.compact:
                return '56';
            default:
                return '80';
        }
    }
    /**
     * The reference to the `igx-grid` owner.
     * ```typescript
     * let gridComponent = this.column.grid;
     * ```
     * @memberof IgxColumnComponent
     */
    public grid: IgxGridBaseComponent;
    /**
     * Returns a reference to the `bodyTemplate`.
     * ```typescript
     * let bodyTemplate = this.column.bodyTemplate;
     * ```
     * @memberof IgxColumnComponent
     */
    @Input('cellTemplate')
    get bodyTemplate(): TemplateRef<any> {
        return this._bodyTemplate;
    }
    /**
     * Sets the body template.
     * ```html
     * <ng-template #bodyTemplate igxCell let-val>
     *    <div style = "background-color: yellowgreen" (click) = "changeColor(val)">
     *       <span> {{val}} </span>
     *    </div>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'bodyTemplate'", {read: TemplateRef })
     * public bodyTemplate: TemplateRef<any>;
     * this.column.bodyTemplate = this.bodyTemplate;
     * ```
     * @memberof IgxColumnComponent
     */
    set bodyTemplate(template: TemplateRef<any>) {
        this._bodyTemplate = template;
        if (this.grid) {
            this.grid.cdr.markForCheck();
        }
    }
    /**
     * Returns a reference to the header template.
     * ```typescript
     * let headerTemplate = this.column.headerTemplate;
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    get headerTemplate(): TemplateRef<any> {
        return this._headerTemplate;
    }
    /**
     * Sets the header template.
     * Note that the column header height is fixed and any content bigger than it will be cut off.
     * ```html
     * <ng-template #headerTemplate>
     *   <div style = "background-color:black" (click) = "changeColor(val)">
     *       <span style="color:red" >{{column.field}}</span>
     *   </div>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'headerTemplate'", {read: TemplateRef })
     * public headerTemplate: TemplateRef<any>;
     * this.column.headerTemplate = this.headerTemplate;
     * ```
     * @memberof IgxColumnComponent
     */
    set headerTemplate(template: TemplateRef<any>) {
        this._headerTemplate = template;
        if (this.grid) {
            this.grid.cdr.markForCheck();
        }
    }
    /**
     * Returns a reference to the inline editor template.
     * ```typescript
     * let inlineEditorTemplate = this.column.inlineEditorTemplate;
     * ```
     * @memberof IgxColumnComponent
     */
    @Input('cellEditorTemplate')
    get inlineEditorTemplate(): TemplateRef<any> {
        return this._inlineEditorTemplate;
    }
    /**
     * Sets the inline editor template.
     * ```html
     * <ng-template #inlineEditorTemplate igxCellEditor let-cell="cell">
     *     <input type="string" [(ngModel)]="cell.value"/>
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'inlineEditorTemplate'", {read: TemplateRef })
     * public inlineEditorTemplate: TemplateRef<any>;
     * this.column.inlineEditorTemplate = this.inlineEditorTemplate;
     * ```
     * @memberof IgxColumnComponent
     */
    set inlineEditorTemplate(template: TemplateRef<any>) {
        this._inlineEditorTemplate = template;
        if (this.grid) {
            this.grid.cdr.markForCheck();
        }
    }
    /**
     * Returns a reference to the `filterCellTemplate`.
     * ```typescript
     * let filterCellTemplate = this.column.filterCellTemplate;
     * ```
     * @memberof IgxColumnComponent
     */
    @Input('filterCellTemplate')
    get filterCellTemplate(): TemplateRef<any> {
        return this._filterCellTemplate;
    }
    /**
     * Sets the quick filter template.
     * ```html
     * <ng-template #filterCellTemplate IgxFilterCellTemplate let-column="column">
     *    <input (input)="onInput()">
     * </ng-template>
     * ```
     * ```typescript
     * @ViewChild("'filterCellTemplate'", {read: TemplateRef })
     * public filterCellTemplate: TemplateRef<any>;
     * this.column.filterCellTemplate = this.filterCellTemplate;
     * ```
     * @memberof IgxColumnComponent
     */
    set filterCellTemplate(template: TemplateRef<any>) {
        this._filterCellTemplate = template;
    }
    /**
     * Gets the cells of the column.
     * ```typescript
     * let columnCells =  this.column.cells;
     * ```
     * @memberof IgxColumnComponent
     */
    get cells(): IgxGridCellComponent[] {
        return this.grid.rowList.filter((row) => row instanceof IgxRowComponent)
            .map((row) => {
                if (row.cells) {
                    return row.cells.filter((cell) => cell.columnIndex === this.index);
                }
            }).reduce((a, b) => a.concat(b), []);
    }
    /**
     * Gets the column visible index.
     * If the column is not visible, returns `-1`.
     * ```typescript
     * let visibleColumnIndex =  this.column.visibleIndex;
     * ```
     * @memberof IgxColumnComponent
     */
    get visibleIndex(): number {
        if (!isNaN(this._vIndex)) {
            return this._vIndex;
        }
        const unpinnedColumns = this.grid.unpinnedColumns.filter(c => !c.columnGroup);
        const pinnedColumns = this.grid.pinnedColumns.filter(c => !c.columnGroup);
        let col = this;
        let vIndex = -1;

        if (this.columnGroup) {
            col = this.allChildren.filter(c => !c.columnGroup)[0] as any;
        }
        if (this.columnLayoutChild) {
            return this.parent.childrenVisibleIndexes.find(x => x.column === this).index;
        }

        if (!this.pinned) {
            const indexInCollection = unpinnedColumns.indexOf(col);
            vIndex = indexInCollection === -1 ? -1 : pinnedColumns.length + indexInCollection;
        } else {
            vIndex = pinnedColumns.indexOf(col);
        }
        this._vIndex = vIndex;
        return vIndex;
    }
    /**
     * Returns a boolean indicating if the column is a `ColumnGroup`.
     * ```typescript
     * let columnGroup =  this.column.columnGroup;
     * ```
     * @memberof IgxColumnComponent
     */
    get columnGroup() {
        return false;
    }
    /**
     * Returns a boolean indicating if the column is a `ColumnLayout` for multi-row layout.
     * ```typescript
     * let columnGroup =  this.column.columnGroup;
     * ```
     * @memberof IgxColumnComponent
     */
    get columnLayout() {
        return false;
    }

     /**
     * Returns a boolean indicating if the column is a child of a `ColumnLayout` for multi-row layout.
     * ```typescript
     * let columnLayoutChild =  this.column.columnLayoutChild;
     * ```
     * @memberof IgxColumnComponent
     */
    get columnLayoutChild() {
        return this.parent && this.parent.columnLayout;
    }

    /**
     * Returns the children columns collection.
     * Returns an empty array if the column does not contain children columns.
     * ```typescript
     * let childrenColumns =  this.column.allChildren;
     * ```
     * @memberof IgxColumnComponent
     */
    get allChildren(): IgxColumnComponent[] {
        return [];
    }
    /**
     * Returns the level of the column in a column group.
     * Returns `0` if the column doesn't have a `parent`.
     * ```typescript
     * let columnLevel =  this.column.level;
     * ```
     * @memberof IgxColumnComponent
     */
    get level() {
        let ptr = this.parent;
        let lvl = 0;

        while (ptr) {
            lvl++;
            ptr = ptr.parent;
        }
        return lvl;
    }

    get isLastPinned(): boolean {
        return this.grid.pinnedColumns[this.grid.pinnedColumns.length - 1] === this;
    }
    get gridRowSpan(): number {
        return this.rowEnd && this.rowStart ? this.rowEnd - this.rowStart : 1;
    }
    get gridColumnSpan(): number {
        return this.colEnd && this.colStart ? this.colEnd - this.colStart : 1;
    }

    /**
     * Row index where the current field should end.
     * The amount of rows between rowStart and rowEnd will determine the amount of spanning rows to that field
     * ```html
     * <igx-column-layout>
     *   <igx-column [rowEnd]="2" [rowStart]="1" [colStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public rowEnd: number;

    /**
     * Column index where the current field should end.
     * The amount of columns between colStart and colEnd will determine the amount of spanning columns to that field
     * ```html
     * <igx-column-layout>
     *   <igx-column [colEnd]="3" [rowStart]="1" [colStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input()
    public colEnd: number;

    /**
     * Row index from which the field is starting.
     * ```html
     * <igx-column-layout>
     *   <igx-column [rowStart]="1" [colStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input() rowStart: number;

    /**
     * Column index from which the field is starting.
     * ```html
     * <igx-column-layout>
     *   <igx-column [colStart]="1" [rowStart]="1"></igx-column>
     * </igx-column-layout>
     * ```
     * @memberof IgxColumnComponent
     */
    @Input() colStart: number;

    /**
     * hidden
     */
    public defaultWidth: string;

    /**
     * hidden
     */
    public widthSetByUser: boolean;

    /**
     * Returns the filteringExpressionsTree of the column.
     * ```typescript
     * let tree =  this.column.filteringExpressionsTree;
     * ```
     * @memberof IgxColumnComponent
     */
    get filteringExpressionsTree(): FilteringExpressionsTree {
        return this.grid.filteringExpressionsTree.find(this.field) as FilteringExpressionsTree;
    }
    /**
     * Sets/gets the parent column.
     * ```typescript
     * let parentColumn = this.column.parent;
     * ```
     * ```typescript
     * this.column.parent = higherLevelColumn;
     * ```
     * @memberof IgxColumnComponent
     */
    parent = null;
    /**
     * Sets/gets the children columns.
     * ```typescript
     * let columnChildren = this.column.children;
     * ```
     * ```typescript
     * this.column.children = childrenColumns;
     * ```
     * @memberof IgxColumnComponent
     */
    children: QueryList<IgxColumnComponent>;
    /**
     *@hidden
     */
    protected _unpinnedIndex;
    /**
     *@hidden
     */
    protected _pinned = false;
    /**
     *@hidden
     */
    protected _bodyTemplate: TemplateRef<any>;
    /**
     *@hidden
     */
    protected _headerTemplate: TemplateRef<any>;
    /**
     *@hidden
     */
    protected _inlineEditorTemplate: TemplateRef<any>;
    /**
     *@hidden
     */
    protected _filterCellTemplate: TemplateRef<any>;
    /**
     *@hidden
     */
    protected _summaries = null;
    /**
     *@hidden
     */
    protected _filters = null;
    /**
     *@hidden
     */
    protected _sortStrategy: ISortingStrategy = DefaultSortingStrategy.instance();
    /**
     *@hidden
     */
    protected _groupingComparer: (a: any, b: any) => number;
    /**
     *@hidden
     */
    protected _hidden = false;
    /**
     *@hidden
     */
    protected _index: number;
    /**
     *@hidden
     */
    protected _disableHiding = false;
    /**
     *@hidden
     */
    protected _disablePinning = false;
    /**
     *@hidden
     */
    protected _width: string;
    /**
     *@hidden
     */
    protected _defaultMinWidth = '';
    /**
     *@hidden
     */
    protected _hasSummary = false;
    /**
     * @hidden
     */
    protected _editable: boolean;
    /**
     * @hidden
     */
    protected get isPrimaryColumn(): boolean {
        return this.field !== undefined && this.grid !== undefined && this.field === this.grid.primaryKey;
    }
    /**
     *@hidden
     */
    @ContentChild(IgxCellTemplateDirective, { read: IgxCellTemplateDirective, static: true })
    protected cellTemplate: IgxCellTemplateDirective;
    /**
     *@hidden
     */
    @ContentChildren(IgxCellHeaderTemplateDirective, { read: IgxCellHeaderTemplateDirective, descendants: false })
    protected headTemplate: QueryList<IgxCellHeaderTemplateDirective>;
    /**
     *@hidden
     */
    @ContentChild(IgxCellEditorTemplateDirective, { read: IgxCellEditorTemplateDirective, static: true })
    protected editorTemplate: IgxCellEditorTemplateDirective;

    protected _vIndex = NaN;
    /**
     *@hidden
     */
    @ContentChild(IgxFilterCellTemplateDirective, { read: IgxFilterCellTemplateDirective, static: true })
    public filterCellTemplateDirective: IgxFilterCellTemplateDirective;

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>, public cdr: ChangeDetectorRef) { }

    /**
     * @hidden
     * @internal
     */
    public resetCaches() {
        this._vIndex = NaN;
        if (this.grid) {
            this.cacheCalcWidth();
        }
    }

    /**
     *@hidden
     */
    public ngAfterContentInit(): void {
        if (this.cellTemplate) {
            this._bodyTemplate = this.cellTemplate.template;
        }
        if (this.headTemplate && this.headTemplate.length) {
            this._headerTemplate = this.headTemplate.toArray()[0].template;
        }
        if (this.editorTemplate) {
            this._inlineEditorTemplate = this.editorTemplate.template;
        }
        if (this.filterCellTemplateDirective) {
            this._filterCellTemplate = this.filterCellTemplateDirective.template;
        }
        if (!this.summaries) {
            switch (this.dataType) {
                case DataType.String:
                case DataType.Boolean:
                    this.summaries = IgxSummaryOperand;
                    break;
                case DataType.Number:
                    this.summaries = IgxNumberSummaryOperand;
                    break;
                case DataType.Date:
                    this.summaries = IgxDateSummaryOperand;
                    break;
                default:
                    this.summaries = IgxSummaryOperand;
                    break;
            }
        }
        if (!this.filters) {
            switch (this.dataType) {
                case DataType.Boolean:
                    this.filters = IgxBooleanFilteringOperand.instance();
                    break;
                case DataType.Number:
                    this.filters = IgxNumberFilteringOperand.instance();
                    break;
                case DataType.Date:
                    this.filters = IgxDateFilteringOperand.instance();
                    break;
                case DataType.String:
                default:
                    this.filters = IgxStringFilteringOperand.instance();
                    break;
            }
        }
    }

    /**
     * @hidden
     */
    getGridTemplate(isRow: boolean, isIE: boolean): string {
        if (isRow) {
            const rowsCount = this.grid.multiRowLayoutRowSize;
            return isIE ?
                `(1fr)[${rowsCount}]` :
                `repeat(${rowsCount},1fr)`;
        } else {
            return this.getColumnSizesString(this.children);
        }
    }

    public getInitialChildColumnSizes(children: QueryList<IgxColumnComponent>): Array<MRLColumnSizeInfo> {
        const columnSizes: MRLColumnSizeInfo[] = [];
        // find the smallest col spans
        children.forEach(col => {
            if (!col.colStart) {
                return;
            }
            const newWidthSet =  col.widthSetByUser && columnSizes[col.colStart - 1] && !columnSizes[col.colStart - 1].widthSetByUser;
            const newSpanSmaller = columnSizes[col.colStart - 1] && columnSizes[col.colStart - 1].colSpan > col.gridColumnSpan;
            const bothWidthsSet = col.widthSetByUser && columnSizes[col.colStart - 1] && columnSizes[col.colStart - 1].widthSetByUser;
            const bothWidthsNotSet = !col.widthSetByUser && columnSizes[col.colStart - 1] && !columnSizes[col.colStart - 1].widthSetByUser;

            if (columnSizes[col.colStart - 1] === undefined) {
                // If nothing is defined yet take any column at first
                // We use colEnd to know where the column actually ends, because not always it starts where we have it set in columnSizes.
                columnSizes[col.colStart - 1] = {
                    ref: col,
                    width: col.widthSetByUser || this.grid.columnWidthSetByUser ? parseInt(col.calcWidth, 10) : null,
                    colSpan: col.gridColumnSpan,
                    colEnd: col.colStart + col.gridColumnSpan,
                    widthSetByUser: col.widthSetByUser
                };
            } else if (newWidthSet || (newSpanSmaller && ((bothWidthsSet) || (bothWidthsNotSet)))) {
                // If a column is set already it should either not have width defined or have width with bigger span than the new one.

                /**
                 *  If replaced column has bigger span, we want to fill the remaining columns
                 *  that the replacing column does not fill with the old one.
                 **/
                if (bothWidthsSet && newSpanSmaller) {
                    // Start from where the new column set would end and apply the old column to the rest depending on how much it spans.
                    // We have not yet replaced it so we can use it directly from the columnSizes collection.
                    // This is where colEnd is used because the colStart of the old column is not actually i + 1.
                    for (let i = col.colStart - 1 + col.gridColumnSpan; i < columnSizes[col.colStart - 1].colEnd - 1; i++) {
                        if (!columnSizes[i] || !columnSizes[i].widthSetByUser) {
                            columnSizes[i] = columnSizes[col.colStart - 1];
                        } else {
                            break;
                        }
                    }
                }

                // Replace the old column with the new one.
                columnSizes[col.colStart - 1] = {
                    ref: col,
                    width: col.widthSetByUser || this.grid.columnWidthSetByUser ? parseInt(col.calcWidth, 10) : null,
                    colSpan: col.gridColumnSpan,
                    colEnd: col.colStart + col.gridColumnSpan,
                    widthSetByUser: col.widthSetByUser
                };
            } else if (bothWidthsSet && columnSizes[col.colStart - 1].colSpan < col.gridColumnSpan) {
                // If the column already in the columnSizes has smaller span, we still need to fill any empty places with the current col.
                // Start from where the smaller column set would end and apply the bigger column to the rest depending on how much it spans.
                // Since here we do not have it in columnSizes we set it as a new column keeping the same colSpan.
                for (let i = col.colStart - 1 + columnSizes[col.colStart - 1].colSpan; i < col.colStart - 1 + col.gridColumnSpan; i++) {
                    if (!columnSizes[i] || !columnSizes[i].widthSetByUser) {
                        columnSizes[i] = {
                            ref: col,
                            width: col.widthSetByUser || this.grid.columnWidthSetByUser ? parseInt(col.calcWidth, 10) : null,
                            colSpan: col.gridColumnSpan,
                            colEnd: col.colStart + col.gridColumnSpan,
                            widthSetByUser: col.widthSetByUser
                        };
                    } else {
                        break;
                    }
                }
            }
        });

        // Flatten columnSizes so there are not columns with colSpan > 1
        for (let i = 0; i < columnSizes.length; i++) {
            if (columnSizes[i] && columnSizes[i].colSpan > 1) {
                let j = 1;

                // Replace all empty places depending on how much the current column spans starting from next col.
                for (; j < columnSizes[i].colSpan && i + j + 1 < columnSizes[i].colEnd; j++) {
                    if (columnSizes[i + j] &&
                        ((!columnSizes[i].width && columnSizes[i + j].width) ||
                         (!columnSizes[i].width && !columnSizes[i + j].width && columnSizes[i + j].colSpan <= columnSizes[i].colSpan) ||
                        (!!columnSizes[i + j].width && columnSizes[i + j].colSpan <= columnSizes[i].colSpan))) {
                        // If we reach an already defined column that has width and the current doesn't have or
                        // if the reached column has bigger colSpan we stop.
                        break;
                    } else {
                        const width = columnSizes[i].widthSetByUser ?
                            columnSizes[i].width / columnSizes[i].colSpan :
                            columnSizes[i].width;
                        columnSizes[i + j] = {
                            ref: columnSizes[i].ref,
                            width: width,
                            colSpan: 1,
                            colEnd: columnSizes[i].colEnd,
                            widthSetByUser: columnSizes[i].widthSetByUser
                        };
                    }
                }

                // Update the current column width so it is divided between all columns it spans and set it to 1.
                columnSizes[i].width = columnSizes[i].widthSetByUser ?
                    columnSizes[i].width / columnSizes[i].colSpan :
                    columnSizes[i].width;
                columnSizes[i].colSpan = 1;

                // Update the index based on how much we have replaced. Subtract 1 because we started from 1.
                i += j - 1;
            }
        }

        return columnSizes;
    }

    public getFilledChildColumnSizes(children: QueryList<IgxColumnComponent>): Array<string> {
        const columnSizes = this.getInitialChildColumnSizes(children);

        // fill the gaps if there are any
        const result: string[] = [];
        for (let i = 0; i < columnSizes.length; i++) {
            if (columnSizes[i] && !!columnSizes[i].width) {
                result.push(columnSizes[i].width + 'px');
            } else {
                result.push(parseInt(this.grid.getPossibleColumnWidth(), 10) + 'px');
            }
        }
        return result;
    }

    protected getColumnSizesString(children: QueryList<IgxColumnComponent>): string {
       const res = this.getFilledChildColumnSizes(children);
       return res.join(' ');
    }

    public getResizableColUnderEnd(): MRLResizeColumnInfo[] {
        if (this.columnLayout || !this.columnLayoutChild || this.columnGroup) {
            return [{ target: this, spanUsed: 1 }];
        }

        const columnSized = this.getInitialChildColumnSizes(this.parent.children);
        const targets: MRLResizeColumnInfo[] = [];
        const colEnd = this.colEnd ? this.colEnd : this.colStart + 1;

        for (let i = 0; i < columnSized.length; i++) {
            if (this.colStart <= i + 1 && i + 1 < colEnd) {
                targets.push({ target: columnSized[i].ref, spanUsed: 1});
            }
        }

        const targetsSquashed: MRLResizeColumnInfo[] = [];
        for (let j = 0; j < targets.length; j++) {
            if (targetsSquashed.length && targetsSquashed[targetsSquashed.length - 1].target.field === targets[j].target.field) {
                targetsSquashed[targetsSquashed.length - 1].spanUsed++;
            } else {
                targetsSquashed.push(targets[j]);
            }
        }

        return targetsSquashed;
    }

    /**
     * Pins the column at the provided index in the pinned area. Defaults to index `0` if not provided.
     * Returns `true` if the column is successfully pinned. Returns `false` if the column cannot be pinned.
     * Column cannot be pinned if:
     * - Is already pinned
     * - index argument is out of range
     * - The pinned area exceeds 80% of the grid width
     * ```typescript
     * let success = this.column.pin();
     * ```
     * @memberof IgxColumnComponent
     */
    public pin(index?: number): boolean {
        // TODO: Probably should the return type of the old functions
        // should be moved as a event parameter.
        if (this.grid) {
            this.grid.endEdit(true);
        }
        if (this._pinned) {
            return false;
        }

        if (this.parent && !this.parent.pinned) {
            return this.topLevelParent.pin(index);
        }

        const grid = (this.grid as any);
        const hasIndex = index !== undefined;
        if (hasIndex && (index < 0 || index >= grid.pinnedColumns.length)) {
            return false;
        }

        const width = parseInt(this.width, 10);

        if (!this.parent && (grid.getUnpinnedWidth(true) - width < grid.unpinnedAreaMinWidth)) {
            return false;
        }

        this._pinned = true;
        this._unpinnedIndex = grid._unpinnedColumns.indexOf(this);
        index = index !== undefined ? index : grid._pinnedColumns.length;
        const targetColumn = grid._pinnedColumns[index];
        const args = { column: this, insertAtIndex: index, isPinned: true };
        grid.onColumnPinning.emit(args);

        if (grid._pinnedColumns.indexOf(this) === -1) {
            grid._pinnedColumns.splice(args.insertAtIndex, 0, this);

            if (grid._unpinnedColumns.indexOf(this) !== -1) {
                grid._unpinnedColumns.splice(grid._unpinnedColumns.indexOf(this), 1);
            }
        }

        if (hasIndex) {
            grid._moveColumns(this, targetColumn);
        }

        if (this.columnGroup) {
            this.allChildren.forEach(child => child.pin());
            grid.reinitPinStates();
        }

        grid.resetCaches();
        grid.cdr.detectChanges();
        if (this.columnLayoutChild) {
            this.grid.columns.filter(x => x.columnLayout).forEach( x => x.populateVisibleIndexes());
        }
        this.grid.filteringService.refreshExpressions();
        this.grid.refreshSearch(true);
        return true;
    }
    /**
     * Unpins the column and place it at the provided index in the unpinned area. Defaults to index `0` if not provided.
     * Returns `true` if the column is successfully unpinned. Returns `false` if the column cannot be unpinned.
     * Column cannot be unpinned if:
     * - Is already unpinned
     * - index argument is out of range
     * ```typescript
     * let success = this.column.unpin();
     * ```
     * @memberof IgxColumnComponent
     */
    public unpin(index?: number): boolean {
        if (this.grid) {
            this.grid.endEdit(true);
        }
        if (!this._pinned) {
            return false;
        }

        if (this.parent && this.parent.pinned) {
            return this.topLevelParent.unpin(index);
        }

        const grid = (this.grid as any);
        const hasIndex = index !== undefined;
        if (hasIndex && (index < 0 || index >= grid._unpinnedColumns.length)) {
            return false;
        }

        index = (index !== undefined ? index :
            this._unpinnedIndex !== undefined ? this._unpinnedIndex : this.index);
        this._pinned = false;

        const targetColumn = grid._unpinnedColumns[index];

        grid._unpinnedColumns.splice(index, 0, this);
        if (grid._pinnedColumns.indexOf(this) !== -1) {
            grid._pinnedColumns.splice(grid._pinnedColumns.indexOf(this), 1);
        }

        if (hasIndex) {
            grid._moveColumns(this, targetColumn);
        }

        if (this.columnGroup) {
            this.allChildren.forEach(child => child.unpin());
        }

        grid.reinitPinStates();
        grid.resetCaches();

        const insertAtIndex = grid._unpinnedColumns.indexOf(this);
        const args = { column: this, insertAtIndex, isPinned: false };
        grid.onColumnPinning.emit(args);

        grid.cdr.detectChanges();
        if (this.columnLayoutChild) {
            this.grid.columns.filter(x => x.columnLayout).forEach( x => x.populateVisibleIndexes());
        }
        this.grid.filteringService.refreshExpressions();
        this.grid.refreshSearch(true);

        return true;
    }
    /**
     * Returns a reference to the top level parent column.
     * ```typescript
     * let topLevelParent =  this.column.topLevelParent;
     * ```
     * @memberof IgxColumnComponent
     */
    get topLevelParent() {
        let parent = this.parent;
        while (parent && parent.parent) {
            parent = parent.parent;
        }
        return parent;
    }
    /**
     *@hidden
     */
    protected check() {
        if (this.grid) {
            this.grid.markForCheck();
        }
    }

    /**
     * Returns a reference to the header of the column.
     * ```typescript
     * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
     * let headerCell = column.headerCell;
     * ```
     * @memberof IgxColumnComponent
     */
    get headerCell(): IgxGridHeaderComponent {
        return this.grid.headerCellList.find((header) => header.column === this);
    }

    /**
    * Returns a reference to the filter cell of the column.
    * ```typescript
    * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
    * let filterell = column.filterell;
    * ```
    * @memberof IgxColumnComponent
    */
    get filterCell(): IgxGridFilteringCellComponent {
        return this.grid.filterCellList.find((filterCell) => filterCell.column === this);
    }

    /**
     * Returns a reference to the header group of the column.
     * @memberof IgxColumnComponent
     */
    get headerGroup(): IgxGridHeaderGroupComponent {
        return this.grid.headerGroupsList.find((headerGroup) => headerGroup.column === this);
    }

    /**
     * Autosize the column to the longest currently visible cell value, including the header cell.
     * ```typescript
     * @ViewChild('grid') grid: IgxGridComponent;
     *
     * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
     * column.autosize();
     * ```
     * @memberof IgxColumnComponent
     */
    public autosize() {
        if (!this.columnGroup) {

            this.width = this.getLargestCellWidth();

            this.grid.markForCheck();
            this.grid.reflow();
        }
    }

    /**
     * @hidden
     */
    public getCalcWidth(): any {
        if (this._calcWidth !== null && !isNaN(this.calcPixelWidth)) {
            return this._calcWidth;
        }
        this.cacheCalcWidth();
        return this._calcWidth;
    }

    /**
     * @hidden
     * Returns the size (in pixels) of the longest currently visible cell, including the header cell.
     * ```typescript
     * @ViewChild('grid') grid: IgxGridComponent;
     *
     * let column = this.grid.columnList.filter(c => c.field === 'ID')[0];
     * let size = column.getLargestCellWidth();
     * ```
     * @memberof IgxColumnComponent
     */
    public getLargestCellWidth(): string {
        const range = this.grid.document.createRange();
        const largest = new Map<number, number>();

        if (this.cells.length > 0) {
            let cellsContentWidths = [];
            if (this.cells[0].nativeElement.children.length > 0) {
                this.cells.forEach((cell) => cellsContentWidths.push(cell.calculateSizeToFit(range)));
            } else {
                cellsContentWidths = this.cells.map((cell) => getNodeSizeViaRange(range, cell.nativeElement));
            }

            const index = cellsContentWidths.indexOf(Math.max(...cellsContentWidths));
            const cellStyle = this.grid.document.defaultView.getComputedStyle(this.cells[index].nativeElement);
            const cellPadding = parseFloat(cellStyle.paddingLeft) + parseFloat(cellStyle.paddingRight) +
                parseFloat(cellStyle.borderRightWidth);

            largest.set(Math.max(...cellsContentWidths), cellPadding);
        }

        if (this.headerCell) {
            let headerCell;
            if (this.headerTemplate && this.headerCell.elementRef.nativeElement.children[0].children.length > 0) {
                headerCell = Math.max(...Array.from(this.headerCell.elementRef.nativeElement.children[0].children)
                    .map((child) => getNodeSizeViaRange(range, child)));
            } else {
                headerCell = getNodeSizeViaRange(range, this.headerCell.elementRef.nativeElement.children[0]);
            }

            if (this.sortable || this.filterable) {
                headerCell += this.headerCell.elementRef.nativeElement.children[1].getBoundingClientRect().width;
            }

            const headerStyle = this.grid.document.defaultView.getComputedStyle(this.headerCell.elementRef.nativeElement);
            const headerPadding = parseFloat(headerStyle.paddingLeft) + parseFloat(headerStyle.paddingRight) +
                parseFloat(headerStyle.borderRightWidth);
            largest.set(headerCell, headerPadding);

        }

        const largestCell = Math.max(...Array.from(largest.keys()));
        const width = Math.ceil(largestCell + largest.get(largestCell));

        if (Number.isNaN(width)) {
            return this.width;
        } else {
            return width + 'px';
        }
    }

    /**
     *@hidden
     */
    public getCellWidth() {
        const colWidth = this.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;

        if (this.columnLayoutChild) {
            return '';
        }

        if (colWidth && !isPercentageWidth) {

            let cellWidth = colWidth;
            if (typeof cellWidth !== 'string' || cellWidth.endsWith('px') === false) {
                cellWidth += 'px';
            }

            return cellWidth;
        } else {
            return colWidth;
        }
    }

    /**
     * @hidden
     * @internal
     */
    protected cacheCalcWidth(): any {
        const grid = this.gridAPI.grid;
        const colWidth = this.width;
        const isPercentageWidth = colWidth && typeof colWidth === 'string' && colWidth.indexOf('%') !== -1;
        if (isPercentageWidth) {
            this._calcWidth = parseInt(colWidth, 10) / 100 * (grid.calcWidth - grid.featureColumnsWidth);
        } else if (!colWidth) {
            // no width
            this._calcWidth = this.defaultWidth || grid.getPossibleColumnWidth();
        } else {
            this._calcWidth = this.width;
        }
        this.calcPixelWidth = parseInt(this._calcWidth, 10);
    }

    /**
     * @hidden
     */
    public populateVisibleIndexes() { }
}


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: IgxColumnComponent, useExisting: forwardRef(() => IgxColumnGroupComponent) }],
    selector: 'igx-column-group',
    template: ``
})
export class IgxColumnGroupComponent extends IgxColumnComponent implements AfterContentInit {

    @ContentChildren(IgxColumnComponent, { read: IgxColumnComponent })
    children = new QueryList<IgxColumnComponent>();
    /**
     * Gets the column group `summaries`.
     * ```typescript
     * let columnGroupSummaries = this.columnGroup.summaries;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public get summaries(): any {
        return this._summaries;
    }
    /**
     * Sets the column group `summaries`.
     * ```typescript
     * this.columnGroup.summaries = IgxNumberSummaryOperand;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    public set summaries(classRef: any) { }
    /**
     * Sets/gets whether the column group is `searchable`.
     * Default value is `true`.
     * ```typescript
     * let isSearchable =  this.columnGroup.searchable;
     * ```
     * ```html
     *  <igx-column-group [searchable] = "false"></igx-column-group>
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public searchable = true;
    /**
     * Gets the column group `filters`.
     * ```typescript
     * let columnGroupFilters = this.columnGroup.filters;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public get filters(): any {
        return this._filters;
    }
    /**
     * Sets the column group `filters`.
     * ```typescript
     * this.columnGroup.filters = IgxStringFilteringOperand;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    public set filters(classRef: any) { }

    /**
     * Returns a reference to the body template.
     * ```typescript
     * let bodyTemplate = this.columnGroup.bodyTemplate;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get bodyTemplate(): TemplateRef<any> {
        return this._bodyTemplate;
    }
    /**
     * @hidden
     */
    set bodyTemplate(template: TemplateRef<any>) { }

    /**
     * Returns a reference to the inline editor template.
     * ```typescript
     * let inlineEditorTemplate = this.columnGroup.inlineEditorTemplate;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get inlineEditorTemplate(): TemplateRef<any> {
        return this._inlineEditorTemplate;
    }
    /**
     * @hidden
     */
    set inlineEditorTemplate(template: TemplateRef<any>) { }
    /**
     * Gets the column group cells.
     * ```typescript
     * let columnCells = this.columnGroup.cells;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get cells(): IgxGridCellComponent[] {
        return [];
    }
    /**
     * Gets whether the column group is hidden.
     * ```typescript
     * let isHidden = this.columnGroup.hidden;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    get hidden() {
        return this.allChildren.every(c => c.hidden);
    }
    /**
     * Sets the column group hidden property.
     * ```typescript
     * <igx-column [hidden] = "true"></igx-column>
     * ```
     * @memberof IgxColumnGroupComponent
     */
    set hidden(value: boolean) {
        this._hidden = value;
        this.children.forEach(child => child.hidden = value);
    }
    /**
     *@hidden
     */
    ngAfterContentInit() {
        /*
            @ContentChildren with descendants still returns the `parent`
            component in the query list.
        */
        if (this.headTemplate && this.headTemplate.length) {
            this._headerTemplate = this.headTemplate.toArray()[0].template;
        }
        this.children.reset(this.children.toArray().slice(1));
        this.children.forEach(child => {
            child.parent = this;
        });
    }
    /**
     * Returns the children columns collection.
     * ```typescript
     * let columns =  this.columnGroup.allChildren;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get allChildren(): IgxColumnComponent[] {
        return flatten(this.children.toArray());
    }
    /**
     * Returns a boolean indicating if the column is a `ColumnGroup`.
     * ```typescript
     * let isColumnGroup =  this.columnGroup.columnGroup
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get columnGroup() {
        return true;
    }
    /**
     * Returns a boolean indicating if the column is a `ColumnLayout` for multi-row layout.
     * ```typescript
     * let columnGroup =  this.column.columnGroup;
     * ```
     * @memberof IgxColumnComponent
     */
    get columnLayout() {
        return false;
    }
    /**
     * Gets the width of the column group.
     * ```typescript
     * let columnGroupWidth = this.columnGroup.width;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get width() {
        let isChildrenWidthInPercent = false, width;
        width = `${this.children.reduce((acc, val) => {
            if (val.hidden) {
                return acc;
            }
            if (typeof val.width === 'string' && val.width.indexOf('%') !== -1) {
                   isChildrenWidthInPercent = true;
            }
            return acc + parseInt(val.width, 10);
        }, 0)}`;
        return isChildrenWidthInPercent ? width + '%' : width;
    }

    set width(val) { }

    constructor(public gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>, public cdr: ChangeDetectorRef) {
        // D.P. constructor duplication due to es6 compilation, might be obsolete in the future
        super(gridAPI, cdr);
    }
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: IgxColumnComponent, useExisting: forwardRef(() => IgxColumnLayoutComponent) }],
    selector: 'igx-column-layout',
    template: ``
})
export class IgxColumnLayoutComponent extends IgxColumnGroupComponent implements AfterContentInit {
    public childrenVisibleIndexes = [];
    /**
     * Gets the width of the column layout.
     * ```typescript
     * let columnGroupWidth = this.columnGroup.width;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    get width(): any {
        const width = this.getFilledChildColumnSizes(this.children).reduce((acc, val) => acc + parseInt(val, 10), 0);
        return width;
    }

    set width(val: any) { }

    get columnLayout() {
        return true;
    }

    /**
     * @hidden
     */
    public getCalcWidth(): any {
        let borderWidth = 0;

        if (this.headerGroup && this.headerGroup.hasLastPinnedChildColumn) {
            const headerStyles = this.grid.document.defaultView.getComputedStyle(this.headerGroup.element.nativeElement.children[0]);
            borderWidth = parseInt(headerStyles.borderRightWidth, 10);
        }

        return super.getCalcWidth() + borderWidth;
    }

    /**
     * Gets the column visible index.
     * If the column is not visible, returns `-1`.
     * ```typescript
     * let visibleColumnIndex =  this.column.visibleIndex;
     * ```
     * @memberof IgxColumnComponent
     */
    get visibleIndex(): number {
        if (!isNaN(this._vIndex)) {
            return this._vIndex;
        }

        const unpinnedColumns = this.grid.unpinnedColumns.filter(c => c.columnLayout && !c.hidden);
        const pinnedColumns = this.grid.pinnedColumns.filter(c => c.columnLayout && !c.hidden);
        let vIndex = -1;

        if (!this.pinned) {
            const indexInCollection = unpinnedColumns.indexOf(this);
            vIndex = indexInCollection === -1 ? -1 : pinnedColumns.length + indexInCollection;
        } else {
            vIndex = pinnedColumns.indexOf(this);
        }
        this._vIndex = vIndex;
        return vIndex;
    }

    /*
     * Gets whether the column layout is hidden.
     * ```typescript
     * let isHidden = this.columnGroup.hidden;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    get hidden() {
        return this._hidden;
    }

    /**
     * Sets the column layout hidden property.
     * ```typescript
     * <igx-column-layout [hidden] = "true"></igx-column->
     * ```
     * @memberof IgxColumnGroupComponent
     */
    set hidden(value: boolean) {
        this._hidden = value;
        this.children.forEach(child => child.hidden = value);
        if (this.grid && this.grid.columns && this.grid.columns.length > 0) {
            // reset indexes in case columns are hidden/shown runtime
            this.grid.columns.filter(x => x.columnGroup).forEach( x => x.populateVisibleIndexes());
        }
    }

    /**
     *@hidden
    */
    ngAfterContentInit() {
        super.ngAfterContentInit();
        if (!this.hidden) {
            this.hidden = this.allChildren.some(x => x.hidden);
        } else {
            this.children.forEach(child => child.hidden = this.hidden);
        }

        this.children.forEach(child => {
            child.disableHiding = true;
            child.disablePinning = true;
            child.movable = false;
        });
    }

    /*
     * Gets whether the group contains the last pinned child column of the column layout.
     * ```typescript
     * let columsHasLastPinned = this.columnLayout.hasLastPinnedChildColumn;
     * ```
     * @memberof IgxColumnLayoutComponent
     */
    get hasLastPinnedChildColumn() {
        return this.children.some(child => child.isLastPinned);
    }

    /**
     *@hidden
    */
    public populateVisibleIndexes() {
        this.childrenVisibleIndexes = [];
        const grid = this.gridAPI.grid;
        const columns = grid && grid.pinnedColumns && grid.unpinnedColumns ? grid.pinnedColumns.concat(grid.unpinnedColumns) : [];
        const orderedCols = columns
        .filter(x => !x.columnGroup && !x.hidden)
        .sort((a, b) => a.rowStart - b.rowStart || columns.indexOf(a.parent) - columns.indexOf(b.parent) || a.colStart - b.colStart);
        this.children.forEach(child => {
            const rs = child.rowStart || 1;
            let vIndex = 0;
            // filter out all cols with larger rowStart
            const cols = orderedCols.filter(c =>
                !c.columnGroup && (c.rowStart || 1) <= rs);
            vIndex = cols.indexOf(child);
            this.childrenVisibleIndexes.push({column: child, index: vIndex});
        });
    }

}
