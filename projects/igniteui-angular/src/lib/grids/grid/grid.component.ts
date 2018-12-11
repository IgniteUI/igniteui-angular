import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ContentChild, ViewChildren,
    QueryList, ViewChild, ElementRef, TemplateRef, DoCheck, NgZone, ChangeDetectorRef, ComponentFactoryResolver,
    IterableDiffers, ViewContainerRef, Inject, AfterContentInit, HostBinding, forwardRef, OnInit, Optional } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent, IgxGridTransaction, IFocusChangeEventArgs } from '../grid-base.component';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxGridAPIService } from './grid-api.service';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { cloneArray } from '../../core/utils';
import { IgxTextHighlightDirective } from '../../directives/text-highlight/text-highlight.directive';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IgxGroupByRowTemplateDirective } from './grid.directives';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase } from '../../core/displayDensity';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IBaseChipEventArgs, IChipClickEventArgs, IChipKeyDownEventArgs } from '../../chips/chip.component';
import { IChipsAreaReorderEventArgs } from '../../chips/chips-area.component';
import { DataUtil } from '../../data-operations/data-util';
import { IgxSelectionAPIService } from '../../core/selection';
import { TransactionService, Transaction, State } from '../../services/transaction/transaction';
import { DOCUMENT } from '@angular/common';
import { IgxGridSortingPipe } from './grid.pipes';
import { IgxColumnComponent } from '../column.component';
import { takeUntil } from 'rxjs/operators';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { IgxColumnResizingService } from '../grid-column-resizing.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';

let NEXT_ID = 0;

export interface IGridFocusChangeEventArgs extends IFocusChangeEventArgs {
    groupRow: IgxGridGroupByRowComponent;
}
export interface IGroupingDoneEventArgs {
    expressions: Array<ISortingExpression> | ISortingExpression;
    groupedColumns: Array<IgxColumnComponent> | IgxColumnComponent;
    ungroupedColumns: Array<IgxColumnComponent> | IgxColumnComponent;
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
    providers: [IgxGridNavigationService, IgxGridSummaryService,
        { provide: GridBaseAPIService, useClass: IgxGridAPIService },
        { provide: IgxGridBaseComponent, useExisting: forwardRef(() => IgxGridComponent) },
        IgxFilteringService, IgxColumnResizingService
    ],
    selector: 'igx-grid',
    templateUrl: './grid.component.html'
})
export class IgxGridComponent extends IgxGridBaseComponent implements OnInit, DoCheck, AfterContentInit {
    private _id = `igx-grid-${NEXT_ID++}`;
    /**
     * @hidden
     */
    protected _groupingExpressions: IGroupingExpression [] = [];
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
    protected groupingDiffer;
    private _hideGroupedColumns = false;
    private _dropAreaMessage = null;

    /**
     * An @Input property that sets the value of the `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-grid [id]="'igx-grid-1'" [data]="Data" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @HostBinding('attr.id')
    @Input()
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        if (this._id !== value) {
            const oldId = this._id;
            this._id = value;
            this._gridAPI.reset(oldId, this._id);
        }
    }

    private _gridAPI: IgxGridAPIService;

    constructor(
        gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
        selection: IgxSelectionAPIService,
        @Inject(IgxGridTransaction) _transactions: TransactionService<Transaction, State>,
        elementRef: ElementRef,
        zone: NgZone,
        @Inject(DOCUMENT) public document,
        cdr: ChangeDetectorRef,
        resolver: ComponentFactoryResolver,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        navigation: IgxGridNavigationService,
        filteringService: IgxFilteringService,
        summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
            super(gridAPI, selection, _transactions, elementRef, zone, document, cdr, resolver, differs, viewRef, navigation,
                  filteringService, summaryService, _displayDensityOptions);
            this._gridAPI = <IgxGridAPIService>gridAPI;
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
     * Sets the group by state of the `IgxGridComponent` and emits the `onGroupingDone`
     * event with the appropriate arguments.
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
        const oldExpressions: IGroupingExpression[] = this.groupingExpressions;
        const newExpressions: IGroupingExpression[] = value;
        this._groupingExpressions = cloneArray(value);
        this.chipsGoupingExpressions = cloneArray(value);
        if (this._gridAPI.get(this.id)) {
            this._gridAPI.arrange_sorting_expressions(this.id);
            /* grouping should work in conjunction with sorting
            and without overriding separate sorting expressions */
            this._applyGrouping();
            this.cdr.markForCheck();
        } else {
            // setter called before grid is registered in grid API service
            this.sortingExpressions.unshift.apply(this.sortingExpressions, this._groupingExpressions);
        }
        if (JSON.stringify(oldExpressions) !== JSON.stringify(newExpressions) && this.columnList) {
            const groupedCols: IgxColumnComponent[] = [];
            const ungroupedCols: IgxColumnComponent[] = [];
            const groupedColsArr = newExpressions.filter((obj) => {
                return !oldExpressions.some((obj2) => {
                    return obj.fieldName === obj2.fieldName;
                });
            });
            groupedColsArr.forEach((elem) => {
                groupedCols.push(this.getColumnByName(elem.fieldName));
            }, this);
            const ungroupedColsArr = oldExpressions.filter((obj) => {
                return !newExpressions.some((obj2) => {
                    return obj.fieldName === obj2.fieldName;
                });
            });
            ungroupedColsArr.forEach((elem) => {
                ungroupedCols.push(this.getColumnByName(elem.fieldName));
            }, this);
            this.cdr.detectChanges();
            const groupingDoneArgs: IGroupingDoneEventArgs = {
                expressions: newExpressions,
                groupedColumns: groupedCols,
                ungroupedColumns: ungroupedCols
            };
            this.onGroupingDone.emit(groupingDoneArgs);
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
     * An @Input property that sets whether the grouped columns should be hidden as well.
     * The default value is "false"
     * ```html
     * <igx-grid #grid [data]="localData" [hideGroupedColumns]="true" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get hideGroupedColumns() {
        return this._hideGroupedColumns;
    }

    public set hideGroupedColumns(value: boolean) {
        if (value) {
            this.groupingDiffer = this.differs.find(this.groupingExpressions).create();
        } else {
            this.groupingDiffer = null;
        }
        if (this.columnList && this.groupingExpressions) {
            this._setGroupColsVisibility(value);
        }

        this._hideGroupedColumns = value;
    }

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
    set dropAreaMessage(value: string) {
        this._dropAreaMessage = value;
    }

    /**
     * An accessor that returns the message displayed inside the GroupBy drop area where columns can be dragged on.
    */
    get dropAreaMessage(): string {
        return this._dropAreaMessage || this.resourceStrings.igx_grid_groupByArea_message;
    }

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
     * Emitted when a new `IgxColumnComponent` gets grouped/ungrouped, or multiple columns get
     * grouped/ungrouped at once by using the Group By API.
     * The `onGroupingDone` event would be raised only once if several columns get grouped at once by calling
     * the `groupBy()` or `clearGrouping()` API methods and passing an array as an argument.
     * The event arguments provide the `expressions`, `groupedColumns` and `ungroupedColumns` properties, which contain
     * the `ISortingExpression` and the `IgxColumnComponent` related to the grouping/ungrouping operation.
     * Please note that `groupedColumns` and `ungroupedColumns` show only the **newly** changed columns (affected by the **last**
     * grouping/ungrouping operation), not all columns which are currently grouped/ungrouped.
     * columns.
     * ```typescript
     * groupingDone(event: IGroupingDoneEventArgs){
     *     const expressions = event.expressions;
     *     //the newly grouped columns
     *     const groupedColumns = event.groupedColumns;
     *     //the newly ungrouped columns
     *     const ungroupedColumns = event.ungroupedColumns;
     * }
     * ```
     * ```html
     * <igx-grid #grid [data]="localData" (onGroupingDone)="groupingDone($event)" [autoGenerate]="true"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    @Output()
    public onGroupingDone = new EventEmitter<IGroupingDoneEventArgs>();

    @Output()
    public onFocusChange = new EventEmitter<IGridFocusChangeEventArgs>();

    /**
     * @hidden
     */
    @ContentChild(IgxGroupByRowTemplateDirective, { read: IgxGroupByRowTemplateDirective })
    protected groupTemplate: IgxGroupByRowTemplateDirective;

    @ViewChildren(IgxGridGroupByRowComponent, { read: IgxGridGroupByRowComponent })
    private _groupsRowList: QueryList<IgxGridGroupByRowComponent>;

    /**
     * @hidden
     */
    @ViewChild('defaultDropArea', { read: TemplateRef })
    public defaultDropAreaTemplate: TemplateRef<any>;

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
     * @hidden
     */
    @ViewChild('groupArea')
    public groupArea: ElementRef;

    /**
     * @hidden
     */
    get groupAreaHostClass(): string {
        if (this.isCosy()) {
            return 'igx-drop-area--cosy';
        } else if (this.isCompact()) {
            return 'igx-drop-area--compact';
        } else {
            return 'igx-drop-area';
        }
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
     * Groups by a new `IgxColumnComponent` based on the provided expression, or modifies an existing one.
     * Also allows for multiple columns to be grouped at once if an array of `ISortingExpression` is passed.
     * The onGroupingDone event would get raised only **once** if this method gets called multiple times with the same arguments.
     * ```typescript
     * this.grid.groupBy({ fieldName: name, dir: SortingDirection.Asc, ignoreCase: false });
     * this.grid.groupBy([
            { fieldName: name1, dir: SortingDirection.Asc, ignoreCase: false },
            { fieldName: name2, dir: SortingDirection.Desc, ignoreCase: true },
            { fieldName: name3, dir: SortingDirection.Desc, ignoreCase: false }
        ]);
     * ```
	 * @memberof IgxGridComponent
     */
    public groupBy(expression: IGroupingExpression | Array<IGroupingExpression>): void {
        this.endEdit(true);
        this._gridAPI.submit_value(this.id);
        if (expression instanceof Array) {
            this._gridAPI.groupBy_multiple(this.id, expression);
        } else {
            this._gridAPI.groupBy(this.id, expression);
        }
        this.cdr.detectChanges();
        this.calculateGridSizes();
        this.restoreHighlight();
    }

    /**
     * Clears all grouping in the grid, if no parameter is passed.
     * If a parameter is provided, clears grouping for a particular column or an array of columns.
     * ```typescript
     * this.grid.clearGrouping(); //clears all grouping
     * this.grid.clearGrouping("ID"); //ungroups a single column
     * this.grid.clearGrouping(["ID", "Column1", "Column2"]); //ungroups multiple columns
     * ```
     *
     */
    public clearGrouping(name?: string | Array<string>): void {
        this._gridAPI.clear_groupby(this.id, name);
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
     * Returns if the `IgxGridComponent` has groupable columns.
     * ```typescript
     * const groupableGrid = this.grid.hasGroupableColumns;
     * ```
	 * @memberof IgxGridComponent
     */
    get hasGroupableColumns(): boolean {
        return this.columnList.some((col) => col.groupable && !col.columnGroup);
    }

    private _setGroupColsVisibility(value) {
        this.groupingExpressions.forEach((expr) => {
            const col = this.getColumnByName(expr.fieldName);
            col.hidden = value;
        });
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
     * @hidden
     */
    protected _getStateForGroupRow(groupRow: IGroupByRecord): IGroupByExpandState {
        return this._gridAPI.groupBy_get_expanded_for_group(this.id, groupRow);
    }

    /**
     * @hidden
     */
    protected _toggleGroup(groupRow: IGroupByRecord) {
        this._gridAPI.groupBy_toggle_group(this.id, groupRow);
    }

    /**
     * @hidden
     */
    protected _applyGrouping() {
        this._gridAPI.sort_multiple(this.id, this._groupingExpressions);
    }

    /**
    * @hidden
    */
   public getContext(rowData): any {
        return {
            $implicit: rowData,
            templateID: this.isGroupByRecord(rowData) ? 'groupRow' : this.isSummaryRow(rowData) ? 'summaryRow' : 'dataRow'
        };
    }

    // This method's idea is to get by how much each data row is offset by the group by rows before it.
    /**
    * @hidden
    */
    protected getGroupIncrementData(): number[] {
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

    /**
     * @hidden
     */
    protected getGroupByRecords(): IGroupByRecord[] {
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

    /**
     * @hidden
     */
    public onChipRemoved(event: IBaseChipEventArgs) {
        this.clearGrouping(event.owner.id);
    }

    /**
     * @hidden
     */
    public chipsOrderChanged(event: IChipsAreaReorderEventArgs) {
        const newGrouping = [];
        for (let i = 0; i < event.chipsArray.length; i++) {
            const expr = this.groupingExpressions.filter((item) => {
                return item.fieldName === event.chipsArray[i].id;
            })[0];

            if (!this.getColumnByName(expr.fieldName).groupable) {
                // disallow changing order if there are columns with groupable: false
                return;
            }
            newGrouping.push(expr);
        }
        this.groupingExpansionState = [];
        this.chipsGoupingExpressions = newGrouping;

        if (event.originalEvent instanceof KeyboardEvent) {
            // When reordered using keyboard navigation, we don't have `onMoveEnd` event.
            this.groupingExpressions = this.chipsGoupingExpressions;
        }
        this.markForCheck();
    }

    /**
     * @hidden
     */
    public chipsMovingEnded() {
        this.groupingExpressions = this.chipsGoupingExpressions;
        this.markForCheck();
    }

    /**
     * @hidden
     */
    public onChipClicked(event: IChipClickEventArgs) {
        const sortingExpr = this.sortingExpressions;
        const columnExpr = sortingExpr.find((expr) => expr.fieldName === event.owner.id);
        columnExpr.dir = 3 - columnExpr.dir;
        this.sort(columnExpr);
        this.markForCheck();
    }

    /**
     * @hidden
     */
    public onChipKeyDown(event: IChipKeyDownEventArgs) {
        if (event.originalEvent.key === ' ' || event.originalEvent.key === 'Spacebar' || event.originalEvent.key === 'Enter') {
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
    protected getGroupAreaHeight(): number {
        return this.groupArea ? this.groupArea.nativeElement.offsetHeight : 0;
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
        let sum = super.getPinnedWidth(takeHidden);

        if (this.groupingExpressions.length > 0 && this.headerGroupContainer) {
            sum += this.headerGroupContainer.nativeElement.clientWidth;
        }
        return sum;
    }

    /**
     * @hidden
     */
    protected scrollTo(row: number, column: number, page: number, groupByRecord?: IGroupByRecord): void {
        if (groupByRecord && !this.isExpandedGroup(groupByRecord)) {
            this.toggleGroup(groupByRecord);
        }

        super.scrollTo(row, column, page, groupByRecord);
    }

    /**
     * @hidden
     */
    protected resolveFilteredSortedData(): any[] {
        let data: any[] = super.resolveFilteredSortedData();

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
    public getGroupByChipTitle(expression: IGroupingExpression): string {
        return this.getColumnByName(expression.fieldName).header || expression.fieldName;
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        if (this.groupTemplate) {
            this._groupRowTemplate = this.groupTemplate.template;
        }

        if (this.hideGroupedColumns && this.columnList && this.groupingExpressions) {
            this._setGroupColsVisibility(this.hideGroupedColumns);
        }
        super.ngAfterContentInit();
    }

    public ngOnInit() {
        super.ngOnInit();
        this.onGroupingDone.pipe(takeUntil(this.destroy$)).subscribe((args) =>  {
            this.endEdit(true);
            this.summaryService.updateSummaryCache(args);
        });
    }

    public ngDoCheck(): void {
        super.ngDoCheck();
        if (this.groupingDiffer) {
            const changes = this.groupingDiffer.diff(this.groupingExpressions);
            if (changes && this.columnList) {
                changes.forEachAddedItem((rec) => {
                    const col = this.getColumnByName(rec.item.fieldName);
                    col.hidden = true;
                });
                changes.forEachRemovedItem((rec) => {
                    const col = this.getColumnByName(rec.item.fieldName);
                    col.hidden = false;
                });
            }
        }
    }

}
