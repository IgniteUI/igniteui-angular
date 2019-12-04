import {
    Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ContentChild, ViewChildren,
    QueryList, ViewChild, ElementRef, TemplateRef, DoCheck, AfterContentInit, HostBinding, forwardRef, OnInit, AfterViewInit, HostListener
} from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxGridAPIService } from './grid-api.service';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { cloneArray, IBaseEventArgs } from '../../core/utils';
import { IGroupByRecord } from '../../data-operations/groupby-record.interface';
import { IgxGroupByRowTemplateDirective, IgxGridDetailTemplateDirective } from './grid.directives';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IGroupByExpandState } from '../../data-operations/groupby-expand-state.interface';
import { IBaseChipEventArgs, IChipClickEventArgs, IChipKeyDownEventArgs } from '../../chips/chip.component';
import { IChipsAreaReorderEventArgs } from '../../chips/chips-area.component';
import { IgxColumnComponent } from '../columns/column.component';
import { takeUntil, first } from 'rxjs/operators';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IGroupingExpression } from '../../data-operations/grouping-expression.interface';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxGridSelectionService, IgxGridCRUDService } from '../selection/selection.service';
import { IgxForOfSyncService, IgxForOfScrollSyncService } from '../../directives/for-of/for_of.sync.service';
import { IgxDragIndicatorIconDirective } from '../row-drag.directive';
import { IgxGridMRLNavigationService } from '../grid-mrl-navigation.service';
import { IgxRowIslandAPIService } from '../hierarchical-grid/row-island-api.service';
import { FilterMode } from '../common/enums';
import { GridType } from '../common/grid.interface';

let NEXT_ID = 0;

export interface IGroupingDoneEventArgs extends IBaseEventArgs {
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
    providers: [
        IgxGridNavigationService,
        IgxGridSummaryService,
        IgxGridSelectionService,
        IgxGridCRUDService,
        { provide: GridBaseAPIService, useClass: IgxGridAPIService },
        { provide: IgxGridBaseDirective, useExisting: forwardRef(() => IgxGridComponent) },
        IgxFilteringService,
        IgxColumnResizingService,
        IgxForOfSyncService,
        IgxForOfScrollSyncService,
        IgxRowIslandAPIService
    ],
    selector: 'igx-grid',
    templateUrl: './grid.component.html'
})
export class IgxGridComponent extends IgxGridBaseDirective implements GridType, OnInit, DoCheck, AfterContentInit, AfterViewInit {
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
        this._data = value || [];
        this.summaryService.clearSummaryCache();
        if (this.shouldGenerate) {
            this.setupColumns();
        }
        this.notifyChanges(true);
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

    private get _gridAPI(): IgxGridAPIService {
        return this.gridAPI as IgxGridAPIService;
    }
    private _filteredData = null;

    private childDetailTemplates: Map<any, any> = new Map();

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
     *
     * Two-way data binding.
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true" [(groupingExpressions)]="model.groupingExpressions"></igx-grid>
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
        this.groupingExpressionsChange.emit(this._groupingExpressions);
        this.chipsGoupingExpressions = cloneArray(value);
        if (this._gridAPI.grid) {
            /* grouping should work in conjunction with sorting
            and without overriding separate sorting expressions */
            this._applyGrouping();
            this._gridAPI.arrange_sorting_expressions();
            this.notifyChanges();
        } else {
            // setter called before grid is registered in grid API service
            this.sortingExpressions.unshift.apply(this.sortingExpressions, this._groupingExpressions);
        }
        if (!this._init && JSON.stringify(oldExpressions) !== JSON.stringify(newExpressions) && this.columnList) {
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
            this.notifyChanges();
            const groupingDoneArgs: IGroupingDoneEventArgs = {
                expressions: newExpressions,
                groupedColumns: groupedCols,
                ungroupedColumns: ungroupedCols
            };
            this.onGroupingDone.emit(groupingDoneArgs);
        }
    }

    /**
     *@hidden
     */
    @Output()
    public groupingExpressionsChange = new EventEmitter<IGroupingExpression[]>();

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
     *
     * Two-way data binding.
     * ```html
     * <igx-grid #grid [data]="Data" [autoGenerate]="true" [(groupingExpansionState)]="model.groupingExpansionState"></igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    set groupingExpansionState(value) {
        if (value !== this._groupingExpandState) {
            this.groupingExpansionStateChange.emit(value);
        }
        this._groupingExpandState = value;
        if (this.gridAPI.grid) {
            this.cdr.detectChanges();
        }
    }

    /**
   *@hidden
   */
    @Output()
    public groupingExpansionStateChange = new EventEmitter<IGroupByExpandState[]>();

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
        this.notifyChanges();
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
    @ContentChild(IgxGroupByRowTemplateDirective, { read: IgxGroupByRowTemplateDirective })
    protected groupTemplate: IgxGroupByRowTemplateDirective;

    /**
     * @hidden
     */
    @ContentChild(IgxGridDetailTemplateDirective, { read: IgxGridDetailTemplateDirective, static: false })
    protected gridDetailsTemplate: IgxGridDetailTemplateDirective;

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
    @ContentChild(IgxDragIndicatorIconDirective, { read: TemplateRef })
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
        }).sort((item1, item2) => item1.index - item2.index);
        res.reset(rList);
        return res;
    }

    /**
     * @hidden
     */
    @ViewChild('groupArea')
    public groupArea: ElementRef;

    @ViewChild('record_template', { read: TemplateRef, static: true })
    protected recordTemplate: TemplateRef<any>;

    @ViewChild('detail_template_container', { read: TemplateRef, static: true })
    protected detailTemplateContainer: TemplateRef<any>;

    @ContentChild(IgxGridDetailTemplateDirective, { read: TemplateRef, static: false })
    public detailTemplate: TemplateRef<any> = null;

    @ViewChild('group_template', { read: TemplateRef, static: true })
    protected defaultGroupTemplate: TemplateRef<any>;

    @ViewChild('summary_template', { read: TemplateRef, static: true })
    protected summaryTemplate: TemplateRef<any>;


    private _expansionStates: Map<any, boolean> = new Map<any, boolean>();


    /**
     * Returns a list of key-value pairs [row ID, expansion state]. Includes only states that differ from the default one.
     * ```typescript
     * const expansionStates = this.grid.expansionStates;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    public get expansionStates() {
        return this._expansionStates;
    }

    /**
     *@hidden
     */
    @Output()
    public expansionStatesChange = new EventEmitter<Map<any, boolean>>();

    /**
     *@hidden
     */
    @Output()
    private _focusIn = new  EventEmitter<any>();
    @HostListener('focusin') onFocusIn() {
        this._focusIn.emit();
    }

    /**
     * Sets a list of key-value pairs [row ID, expansion state].
     * ```typescript
     * const states = new Map<any, boolean>();
     * states.set(1, true);
     * this.grid.expansionStates = states;
     * ```
     *
     * Two-way data binding.
     * ```html
     * <igx-grid #grid [data]="data" [(expansionStates)]="model.expansionStates">
     * <ng-template igxGridDetail let-dataItem>
     * <div *ngIf="dataItem.Category">
     *  <header>{{dataItem.Category?.CategoryName}}</header>
     * <span>{{dataItem.Category?.Description}}</span>
     * </div>
     * </ng-template>
     * </igx-grid>
     * ```
	 * @memberof IgxGridComponent
     */
    public set expansionStates(value) {
        this._expansionStates = new Map<any, boolean>(value);
        this.expansionStatesChange.emit(this._expansionStates);
        if (this.gridAPI.grid) {
            this.cdr.detectChanges();
            this._focusActiveCell();
        }
    }

   /**
     * Expands all master rows.
     * ```typescript
     * this.grid.expandAll();
     * ```
	 * @memberof IgxGridComponent
    */
    public expandAll() {
        const expandedStates = this.expansionStates;
        this.data.forEach((rec) => {
            expandedStates.set(this.primaryKey ? rec[this.primaryKey] : rec, true);
        });
        this.expansionStates = expandedStates;
    }

   /**
     * Collapses all master rows.
     * ```typescript
     * this.grid.collapseAll();
     * ```
	 * @memberof IgxGridComponent
    */
    public collapseAll() {
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * Expands the master row by its id. ID is either the primaryKey value or the data record instance.
     * ```typescript
     * this.grid.expand(rowID);
     * ```
	 * @memberof IgxGridComponent
     */
    public expand(rowID: any) {
        const expandedStates = this.expansionStates;
        expandedStates.set(rowID, true);
        this.expansionStates = expandedStates;
    }

    /**
     * Collapses the master row by its id. ID is either the primaryKey value or the data record instance.
     * ```typescript
     * this.grid.collapse(rowID);
     * ```
	 * @memberof IgxGridComponent
    */
    public collapse(rowID: any) {
        const expandedStates = this.expansionStates;
        expandedStates.set(rowID, false);
        this.expansionStates = expandedStates;
    }


    /**
     * Toggles the master row by its id. ID is either the primaryKey value or the data record instance.
     * ```typescript
     * this.grid.toggle(rowID);
     * ```
	 * @memberof IgxGridComponent
    */
    public toggleRow(rowID: any) {
        const expandedStates = this.expansionStates;
        const state = expandedStates.get(rowID);
        expandedStates.set(rowID, !state);
        this.expansionStates = expandedStates;
    }

    public getDetailsContext(rowData, index) {
        return {
            $implicit: rowData,
            index: index
        };
    }

    public preventContainerScroll(evt) {
        if (evt.target.scrollTop !== 0 && this.hasDetails) {
            const activeElem = document.activeElement;
            this.verticalScrollContainer.addScrollTop(evt.target.scrollTop);
            evt.target.scrollTop = 0;
            this.verticalScrollContainer.onChunkLoad.pipe(first()).subscribe(() => {
                const active = this.selectionService.activeElement;
                const currRow = (this.navigation as any).getRowByIndex(active.row, '');
                // check if the focused element was a child of the details view
                if (this.isDetailRecord(active.row) && currRow && currRow.contains(activeElem)) {
                    // Some browsers (like Edge/IE) lose focus after scrolling even when the element was in the DOM.
                    (activeElem as any).focus({ preventScroll: true });
                    return;
                }
                const nextCellTarget = this.navigation.getCellElementByVisibleIndex(active.row, active.column);
                const nextRowTarget = (this.navigation as any).getRowByIndex(active.row + 1, '');
                if (nextCellTarget) {
                    nextCellTarget.focus({ preventScroll: true });
                } else if (nextRowTarget) {
                    nextRowTarget.focus({ preventScroll: true });
                }
            });
        }
    }

    /**
     * @hidden
     */
    public trackChanges(index, rec) {
        if (rec.detailsData !== undefined) {
            return rec.detailsData;
        }
        return rec;
    }

    public detailsViewFocused(container, rowIndex) {
        this.selectionService.activeElement = {
            row: rowIndex,
            column: this.selectionService.activeElement ? this.selectionService.activeElement.column : 0
        };
    }

    public detailsKeyboardHandler(event, rowIndex, container) {
        const colIndex = this.selectionService.activeElement ? this.selectionService.activeElement.column : 0;
        const shift = event.shiftKey;
        const ctrl = event.ctrlKey;
        const key = event.key.toLowerCase();
        const target = event.target;
        if (key === 'tab') {
            event.stopPropagation();
            const lastColIndex = this.unpinnedColumns[this.unpinnedColumns.length - 1].visibleIndex;
            if (shift && target === container) {
                // shift + tab from details to data row
                event.preventDefault();
                this.navigateTo(rowIndex - 1, lastColIndex,
                    (args) => args.target.nativeElement.focus());
            } else if (!shift) {
                // when the next element is focused via tab check if it is an element outside the details view
                // if so we have exited the details view and focus should move to the first cell in the next row
                this._focusIn.pipe(first()).subscribe(() => {
                    if (!container.contains(document.activeElement)) {
                      this.navigation.performTab(container, {row: rowIndex, column: lastColIndex});
                    }
                });
            }
        } else if (key === 'arrowup' && !ctrl && target === container) {
            this.navigation.navigateUp(container, {row: rowIndex, column: colIndex});
        } else if (key === 'arrowup' && ctrl && target === container) {
            this.navigation.navigateTop(colIndex);
        } else if (key === 'arrowdown' && !ctrl && target === container) {
            this.navigation.navigateDown(container, {row: rowIndex, column: colIndex});
        } else if (key === 'arrowdown' && ctrl && target === container) {
            this.navigation.navigateBottom(colIndex);
        }
    }


    public get hasDetails() {
        return !!this.gridDetailsTemplate;
    }

    /**
    * @hidden
    */
   public getRowTemplate(rowData) {
        if (this.isGroupByRecord(rowData)) {
            return this.defaultGroupTemplate;
        } else if (this.isSummaryRow(rowData)) {
            return this.summaryTemplate;
        }  else if (this.hasDetails && this.isDetailRecord(rowData)) {
                return this.detailTemplateContainer;
        } else {
            return this.recordTemplate;
        }
   }

   public isDetailRecord(record) {
    return record.detailsData !== undefined;
   }
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
        this.notifyChanges();
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
        this.notifyChanges();
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
        if (this.checkIfNoColumnField(expression)) {
            return;
        }
        this.endEdit(true);
        if (expression instanceof Array) {
            this._gridAPI.groupBy_multiple(expression);
        } else {
            this._gridAPI.groupBy(expression);
        }
        this.notifyChanges(true);
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
        this.notifyChanges(true);
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
        this.notifyChanges();
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
        this.notifyChanges();
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
        this.notifyChanges();
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
        if (this.isDetailRecord(rowData)) {
            const cachedData = this.childDetailTemplates.get(rowData.detailsData);
            const rowID = this.primaryKey ? rowData.detailsData[this.primaryKey] : this.data.indexOf(rowData.detailsData);
            if (cachedData) {
                const view = cachedData.view;
                const tmlpOutlet = cachedData.owner;
                return {
                    $implicit: rowData.detailsData,
                    moveView: view,
                    owner: tmlpOutlet,
                    index: this.dataView.indexOf(rowData),
                    templateID: 'detailRow-' + rowID
                };
            } else {
                // child rows contain unique grids, hence should have unique templates
                return {
                    $implicit: rowData.detailsData,
                    templateID: 'detailRow-' + rowID,
                    index: this.dataView.indexOf(rowData)
                };
            }
        }
        return {
            $implicit: rowData,
            index: rowIndex,
            templateID: this.isGroupByRecord(rowData) ? 'groupRow' : this.isSummaryRow(rowData) ? 'summaryRow' : 'dataRow'
        };
    }

     /**
     * @hidden
     */
    public viewCreatedHandler(args) {
        if (args.context.templateID.indexOf('detailRow') !== -1) {
            this.childDetailTemplates.set(args.context.$implicit, args);
        }
    }

    /**
     * @hidden
     */
    public viewMovedHandler(args) {
        if (args.context.templateID.indexOf('detailRow') !== -1) {
            // view was moved, update owner in cache
            const key = args.context.$implicit;
            const cachedData = this.childDetailTemplates.get(key);
            cachedData.owner = args.owner;
        }
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
        this.notifyChanges();
    }

    /**
     * @hidden
     */
    public chipsMovingEnded() {
        this.groupingExpressions = this.chipsGoupingExpressions;
        this.notifyChanges();
    }

    /**
     * @hidden
     */
    public onChipClicked(event: IChipClickEventArgs) {
        const sortingExpr = this.sortingExpressions;
        const columnExpr = sortingExpr.find((expr) => expr.fieldName === event.owner.id);
        columnExpr.dir = 3 - columnExpr.dir;
        this.sort(columnExpr);
        this.notifyChanges();
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
            this.notifyChanges();
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
    public get iconTemplate() {
        if (this.groupsExpanded) {
            return this.headerExpandIndicatorTemplate || this.defaultExpandedTemplate;
        } else {
            return this.headerCollapseIndicatorTemplate || this.defaultCollapsedTemplate;
        }
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
        super.ngAfterContentInit();
        if (this.allowFiltering && this.hasColumnLayouts) {
            this.filterMode = FilterMode.excelStyleFilter;
        }
        if (this.groupTemplate) {
            this._groupRowTemplate = this.groupTemplate.template;
        }

        if (this.hideGroupedColumns && this.columnList && this.groupingExpressions) {
            this._setGroupColsVisibility(this.hideGroupedColumns);
        }
        this._setupNavigationService();
    }
    public ngAfterViewInit() {
        super.ngAfterViewInit();
        this.verticalScrollContainer.onBeforeViewDestroyed.pipe(takeUntil(this.destroy$)).subscribe((view) => {
            const rowData = view.context.$implicit;
            if (this.isDetailRecord(rowData)) {
                const cachedData = this.childDetailTemplates.get(rowData.detailsData);
                if (cachedData) {
                    const tmlpOutlet = cachedData.owner;
                    tmlpOutlet._viewContainerRef.detach(0);
                }
            }
        });
    }

    public ngOnInit() {
        super.ngOnInit();
        this.onGroupingDone.pipe(takeUntil(this.destroy$)).subscribe((args) => {
            this.endEdit(true);
            this.summaryService.updateSummaryCache(args);
        });
    }

    public ngDoCheck(): void {
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
        super.ngDoCheck();
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

            this.dataView.forEach(process);
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

    private checkIfNoColumnField(expression: IGroupingExpression | Array<IGroupingExpression> | any): boolean {
        if (expression instanceof Array) {
            for (const singleExpression of expression) {
                if (!singleExpression.fieldName) {
                    return true;
                }
            }
            return false;
        }
        return !expression.fieldName;
    }

}
