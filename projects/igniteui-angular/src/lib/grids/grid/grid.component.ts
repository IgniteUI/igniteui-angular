import {
    Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ContentChild, ViewChildren,
    QueryList, ViewChild, ElementRef, TemplateRef, DoCheck, NgZone, ChangeDetectorRef, ComponentFactoryResolver,
    IterableDiffers, ViewContainerRef, Inject, AfterContentInit, HostBinding, forwardRef, OnInit, Optional
} from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseComponent, IgxGridTransaction, IFocusChangeEventArgs, IGridDataBindable, FilterMode } from '../grid-base.component';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxGridAPIService } from './grid-api.service';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { cloneArray } from '../../core/utils';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IgxGroupByRowTemplateDirective } from './grid.directives';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IDisplayDensityOptions, DisplayDensityToken } from '../../core/displayDensity';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IBaseChipEventArgs, IChipClickEventArgs, IChipKeyDownEventArgs } from '../../chips/chip.component';
import { IChipsAreaReorderEventArgs } from '../../chips/chips-area.component';
import { DataUtil } from '../../data-operations/data-util';
import { IgxSelectionAPIService } from '../../core/selection';
import { TransactionService, Transaction, State } from '../../services/transaction/transaction';
import { DOCUMENT } from '@angular/common';
import { IgxColumnComponent } from '../column.component';
import { takeUntil } from 'rxjs/operators';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { IgxColumnResizingService } from '../grid-column-resizing.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxGridSelectionService, IgxGridCRUDService } from '../../core/grid-selection';
import { IgxOverlayService } from '../../services/index';
import { IgxForOfSyncService } from '../../directives/for-of/for_of.sync.service';
import { IgxDragIndicatorIconDirective } from '../row-drag.directive';
import { IgxGridMRLNavigationService } from '../grid-mrl-navigation.service';

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
    providers: [IgxGridNavigationService, IgxGridSummaryService, IgxGridSelectionService, IgxGridCRUDService,
        { provide: GridBaseAPIService, useClass: IgxGridAPIService },
        { provide: IgxGridBaseComponent, useExisting: forwardRef(() => IgxGridComponent) },
        IgxFilteringService, IgxColumnResizingService, IgxForOfSyncService
    ],
    selector: 'igx-grid',
    templateUrl: './grid.component.html'
})
export class IgxGridComponent extends IgxGridBaseComponent implements IGridDataBindable, OnInit, DoCheck, AfterContentInit {
    private _id = `igx-grid-${NEXT_ID++}`;
    /**
     * @hidden @internal
     */
    public groupingResult: any[];

    /**
     * @hidden @internal
     */
    public groupingMetadata: any[];

    /**
     * @hidden @internal
     */
    public groupingFlatResult: any[];
    /**
     * @hidden
     */
    protected _groupingExpressions: IGroupingExpression[] = [];
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
    private _data;
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
        this._id = value;
    }

    /**
     * An @Input property that lets you fill the `IgxGridComponent` with an array of data.
     * ```html
     * <igx-grid [data]="Data" [autoGenerate]="true"></igx-grid>
     * ```
     * @memberof IgxGridComponent
    */
    @Input()
    public get data(): any[] {
        return this._data;
    }

    public set data(value: any[]) {
        this._data = value;
        this.summaryService.clearSummaryCache();
        if (this.shouldGenerate) {
            this.setupColumns();
            this.reflow();
        }
        this.cdr.markForCheck();
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
     * Sets the total number of records in the data source.
     * This property is required for remote grid virtualization to function when it is bound to remote data.
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

    private _gridAPI: IgxGridAPIService;
    private _filteredData = null;

    constructor(
        selectionService: IgxGridSelectionService,
        crudService: IgxGridCRUDService,
        public colResizingService: IgxColumnResizingService,
        gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>,
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
        @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
        summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
            super(selectionService,
                  crudService, gridAPI, selection, _transactions, elementRef, zone, document, cdr, resolver, differs, viewRef, navigation,
                  filteringService, overlayService, summaryService, _displayDensityOptions);
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
        if (this._gridAPI.grid) {
            /* grouping should work in conjunction with sorting
            and without overriding separate sorting expressions */
            this._applyGrouping();
            this._gridAPI.arrange_sorting_expressions();
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
        this._groupingExpandState = cloneArray(value);
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
        this.cdr.markForCheck();
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

    /**
     * @hidden
     */
    @ContentChild(IgxGroupByRowTemplateDirective, { read: IgxGroupByRowTemplateDirective, static: false })
    protected groupTemplate: IgxGroupByRowTemplateDirective;

    /**
     * The custom template, if any, that should be used when rendering the row drag indicator icon
     *
     * ```typescript
     * // Set in typescript
     * const myCustomTemplate: TemplateRef<any> = myComponent.customTemplate;
     * myComponent.dragIndicatorIconTemplate = myCustomTemplate;
     * ```
     * ```html
     * <!-- Set in markup -->
     *  <igx-grid #grid>
     *      ...
     *      <ng-template igxDragIndicatorIcon>
     *          <igx-icon fontSet="material">info</igx-icon>
     *      </ng-template>
     *  </igx-grid>
     * ```
     */
    @ContentChild(IgxDragIndicatorIconDirective, { read: TemplateRef, static: false })
    public dragIndicatorIconTemplate: TemplateRef<any> = null;

    @ViewChildren(IgxGridGroupByRowComponent, { read: IgxGridGroupByRowComponent })
    private _groupsRowList: QueryList<IgxGridGroupByRowComponent>;

    /**
     * @hidden
     */
    @ViewChild('defaultDropArea', { read: TemplateRef, static: true })
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
    @ViewChild('groupArea', { static: false })
    public groupArea: ElementRef;

    /**
     * @hidden
     */
    get groupAreaHostClass(): string {
        return this.getComponentDensityClass('igx-drop-area');
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
        this._gridAPI.submit_value();
        if (expression instanceof Array) {
            this._gridAPI.groupBy_multiple(expression);
        } else {
            this._gridAPI.groupBy(expression);
        }
        this.cdr.detectChanges();
        this.calculateGridSizes();
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
        this._gridAPI.clear_groupby(name);
        this.calculateGridSizes();
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
     * Expands the specified group and all of its parent groups.
     * ```typescript
     * public groupRow: IGroupByRecord;
     * this.grid.fullyExpandGroup(this.groupRow);
     * ```
     * @memberof IgxGridComponent
     */
    public fullyExpandGroup(groupRow: IGroupByRecord) {
        this._fullyExpandGroup(groupRow);
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
        if (this.columnList && !this.hasColumnLayouts) {
            this.groupingExpressions.forEach((expr) => {
                const col = this.getColumnByName(expr.fieldName);
                col.hidden = value;
            });
        }
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
        return this._gridAPI.groupBy_get_expanded_for_group(groupRow);
    }

    /**
     * @hidden
     */
    protected _toggleGroup(groupRow: IGroupByRecord) {
        this._gridAPI.groupBy_toggle_group(groupRow);
    }

    /**
     * @hidden
     */
    protected _fullyExpandGroup(groupRow: IGroupByRecord) {
        this._gridAPI.groupBy_fully_expand_group(groupRow);
    }

    /**
     * @hidden
     */
    protected _applyGrouping() {
        this._gridAPI.sort_multiple(this._groupingExpressions);
    }

    /**
     * @hidden
     */
    public isColumnGrouped(fieldName: string): boolean {
        return this.groupingExpressions.find(exp => exp.fieldName === fieldName) ? true : false;
    }

    /**
    * @hidden
    */
    public getContext(rowData, rowIndex): any {
        return {
            $implicit: rowData,
            index: rowIndex,
            templateID: this.isGroupByRecord(rowData) ? 'groupRow' : this.isSummaryRow(rowData) ? 'summaryRow' : 'dataRow'
        };
    }

    /**
    * @hidden
    */
    public get template(): TemplateRef<any> {
        if (this.filteredData && this.filteredData.length === 0) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyFilteredGridTemplate;
        }

        if (this.isLoading && (!this.data || this.dataLength === 0)) {
            return this.loadingGridTemplate ? this.loadingGridTemplate : this.loadingGridDefaultTemplate;
        }

        if (this.dataLength === 0) {
            return this.emptyGridTemplate ? this.emptyGridTemplate : this.emptyGridDefaultTemplate;
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
    protected get defaultTargetBodyHeight(): number {
        const allItems = this.totalItemCount || this.dataLength;
        return this.renderedRowHeight * Math.min(this._defaultTargetRecordNumber,
            this.paging ? Math.min(allItems, this.perPage) : allItems);
    }

    /**
     * @hidden
     */
    protected getGroupAreaHeight(): number {
        return this.groupArea ? this.groupArea.nativeElement.offsetHeight : 0;
    }

    /**
     * @hidden
     * Gets the combined width of the columns that are specific to the enabled grid features. They are fixed.
     * TODO: Remove for Angular 8. Calling parent class getter using super is not supported for now.
     */
    public getFeatureColumnsWidth() {
        let width = super.getFeatureColumnsWidth();

        if (this.groupingExpressions.length && this.headerGroupContainer) {
            width += this.headerGroupContainer.nativeElement.offsetWidth;
        }

        return width;
    }

    /**
     * @hidden
     */
    protected scrollTo(row: any | number, column: any | number): void {
        if (this.groupingExpressions && this.groupingExpressions.length
            && typeof(row) !== 'number') {
            const rowIndex = this.groupingResult.indexOf(row);
            const groupByRecord = this.groupingMetadata[rowIndex];
            if (groupByRecord) {
                this._fullyExpandGroup(groupByRecord);
            }
        }

        super.scrollTo(row, column, this.groupingFlatResult);
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
        const column = this.getColumnByName(expression.fieldName);
        return (column && column.header) || expression.fieldName;
    }

    /**
     * @hidden
     */
    public getColumnGroupable(fieldName: string): boolean {
        const column = this.getColumnByName(fieldName);
        return column && column.groupable;
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        if (this.allowFiltering && this.hasColumnLayouts) {
            this.filterMode = FilterMode.excelStyleFilter;
        }
        if (this.groupTemplate) {
            this._groupRowTemplate = this.groupTemplate.template;
        }
        super.ngAfterContentInit();

        if (this.hideGroupedColumns && this.columnList && this.groupingExpressions) {
            this._setGroupColsVisibility(this.hideGroupedColumns);
        }
        this._setupNavigationService();
    }

    public ngOnInit() {
        super.ngOnInit();
        this.onGroupingDone.pipe(takeUntil(this.destroy$)).subscribe((args) => {
            this.endEdit(true);
            this.summaryService.updateSummaryCache(args);
        });
    }

    public ngDoCheck(): void {
        super.ngDoCheck();
        if (this.groupingDiffer && this.columnList && !this.hasColumnLayouts) {
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

    /**
     * @inheritdoc
     */
    getSelectedData(formatters = false, headers = false): any[] {
        if (this.groupingExpressions.length) {
            const source = [];

            const process = (record) => {
                if (record.expression || record.summaries) {
                    source.push(null);
                    return;
                }
                source.push(record);

            };

            this.verticalScrollContainer.igxForOf.forEach(process);
            return this.extractDataFromSelection(source, formatters, headers);
        } else {
            return super.getSelectedData(formatters, headers);
        }
    }

    private _setupNavigationService() {
        if (this.hasColumnLayouts) {
            this.navigation = new IgxGridMRLNavigationService();
            this.navigation.grid = this;
        }
    }
}
