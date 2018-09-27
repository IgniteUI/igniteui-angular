import {
    ContentChild,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    HostBinding,
    Input,
    IterableDiffers,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from '@angular/core';
import { IgxSelectionAPIService } from '../core/selection';
import { cloneArray, DisplayDensity } from '../core/utils';
import { IGroupByExpandState } from '../data-operations/groupby-expand-state.interface';
import { IGroupByRecord } from '../data-operations/groupby-record.interface';
import { ISortingExpression } from '../data-operations/sorting-expression.interface';
import { IgxGridAPIService } from './grid-api.service';
import { IgxGroupByRowTemplateDirective } from './grid.misc';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridBaseComponent } from '../grid-common/grid-base.component';

import { IGridBaseComponent } from '../grid-common/common/grid-interfaces';
import { GridBaseAPIService } from '../grid-common/api.service';

let NEXT_ID = 0;

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
export class IgxGridComponent extends IgxGridBaseComponent {
    private _id = `igx-grid-${NEXT_ID++}`;

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
    protected _groupingExpandState: IGroupByExpandState[] = [];

    /**
     * @hidden
     */
    public chipsGoupingExpressions = [];

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
            this.gridAPI.reset(oldId, this._id);
        }
    }

    /**
     * Returns the group by state of the `IgxGridComponent`.
     * ```typescript
     * let groupByState = this.grid.groupingExpressions;
     * ```
	 * @memberof IgxGridComponent
     */
    @Input()
    get groupingExpressions() {
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
     * @hidden
     */
    @ContentChild(IgxGroupByRowTemplateDirective, { read: IgxGroupByRowTemplateDirective })
    public groupTemplate: IgxGroupByRowTemplateDirective;

    /**
     * A hierarchical representation of the group by records.
     * ```typescript
     * let groupRecords = this.grid.groupsRecords;
     * ```
	 * @memberof IgxGridComponent
     */
    public groupsRecords: IGroupByRecord[] = [];

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
        return this.gridAPI.get_row_list(this._groupsRowList);
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
     * Returns if the `IgxGridComponent` has groupable columns.
     * ```typescript
     * const groupableGrid = this.grid.hasGroupableColumns;
     * ```
	 * @memberof IgxGridComponent
     */
    get hasGroupableColumns(): boolean {
        return this.columnList.some((col) => col.groupable);
    }

    private gridAPI: IgxGridAPIService;

    constructor(
        gridAPI: GridBaseAPIService<IGridBaseComponent>,
        selection: IgxSelectionAPIService,
        elementRef: ElementRef,
        cdr: ChangeDetectorRef,
        resolver: ComponentFactoryResolver,
        differs: IterableDiffers,
        viewRef: ViewContainerRef) {
        super(gridAPI, selection, elementRef, cdr, resolver, differs, viewRef);
        this.gridAPI = <IgxGridAPIService>gridAPI;
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
     * Groups by a new `IgxColumnComponent` based on the provided expression or modifies an existing one.
     * ```typescript
     * this.grid.groupBy({ fieldName: name, dir: SortingDirection.Asc, ignoreCase: false });
     * ```
	 * @memberof IgxGridComponent
     */
    public groupBy(expression: ISortingExpression | Array<ISortingExpression>): void;
    public groupBy(...rest): void {
        this.gridAPI.submit_value(this.id);
        if (rest.length === 1 && rest[0] instanceof Array) {
            this._groupByMultiple(rest[0]);
        } else {
            this._groupBy(rest[0]);
        }
        this.cdr.detectChanges();
        this.reflow();
        this.onGroupingDone.emit(this.sortingExpressions);

        this.gridAPI.refresh_search(this.id, true);
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
        this.gridAPI.clear_group_by(this.id, name);
        this.reflow();

        this.gridAPI.refresh_search(this.id, true);
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
        this.gridAPI.group_by_toggle_group(this.id, groupRow);
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
     * @hidden
     */
    protected _groupBy(expression: ISortingExpression) {
        this.gridAPI.group_by(this.id, expression.fieldName, expression.dir, expression.ignoreCase);
    }

    /**
     * @hidden
     */
    protected _groupByMultiple(expressions: ISortingExpression[]) {
        this.gridAPI.group_by_multiple(this.id, expressions);
    }

    /**
     * @hidden
     */
    protected _getStateForGroupRow(groupRow: IGroupByRecord): IGroupByExpandState {
        return this.gridAPI.group_by_get_expanded_for_group(this.id, groupRow);
    }

    /**
     * @hidden
     */
    protected _applyGrouping() {
        this.gridAPI.sort_multiple_implementation(this.id, this._groupingExpressions);
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
   public getContext(rowData): any {
        return {
            $implicit: rowData,
            templateID: this.isGroupByRecord(rowData) ? 'groupRow' : 'dataRow'
        };
    }
}
