import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    HostBinding,
    Input,
    IterableDiffers,
    ViewContainerRef,
    Output,
    EventEmitter,
    Inject,
    NgZone,
    forwardRef,
    Optional,
    OnInit,
    TemplateRef,
    QueryList,
    ContentChild,
    AfterContentInit,
    ViewChild
} from '@angular/core';
import { IgxSelectionAPIService } from '../../core/selection';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { IgxGridBaseComponent, IgxGridTransaction, IGridDataBindable } from '../grid-base.component';
import { GridBaseAPIService } from '../api.service';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IDisplayDensityOptions, DisplayDensityToken } from '../../core/displayDensity';
import { IRowToggleEventArgs } from './tree-grid.interfaces';
import { HierarchicalTransaction, HierarchicalState, TransactionType } from '../../services/transaction/transaction';
import { DOCUMENT } from '@angular/common';
import { IgxHierarchicalTransactionService } from '../../services/index';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxTreeGridNavigationService } from './tree-grid-navigation.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxGridSelectionService, IgxGridCRUDService } from '../../core/grid-selection';
import { mergeObjects } from '../../core/utils';
import { IgxOverlayService } from '../../services/index';
import { IgxColumnResizingService } from '../grid-column-resizing.service';
import { IgxColumnComponent } from '../column.component';
import { first, takeUntil } from 'rxjs/operators';
import { IgxRowLoadingIndicatorTemplateDirective } from './tree-grid.directives';
import { IgxForOfSyncService } from '../../directives/for-of/for_of.sync.service';
import { IgxDragIndicatorIconDirective } from '../row-drag.directive';

let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Tree Grid** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html)
 *
 * The Ignite UI Tree Grid displays and manipulates hierarchical data with consistent schema formatted as a table and
 * provides features such as sorting, filtering, editing, column pinning, paging, column moving and hiding.
 *
 * Example:
 * ```html
 * <igx-tree-grid [data]="employeeData" primaryKey="employeeID" foreignKey="PID" autoGenerate="false">
 *   <igx-column field="first" header="First Name"></igx-column>
 *   <igx-column field="last" header="Last Name"></igx-column>
 *   <igx-column field="role" header="Role"></igx-column>
 * </igx-tree-grid>
 * ```
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-tree-grid',
    templateUrl: 'tree-grid.component.html',
    providers: [
        IgxGridSelectionService, IgxGridCRUDService, IgxTreeGridNavigationService, IgxGridSummaryService,
        { provide: GridBaseAPIService, useClass: IgxTreeGridAPIService },
        { provide: IgxGridBaseComponent, useExisting: forwardRef(() => IgxTreeGridComponent) }, IgxFilteringService, IgxForOfSyncService]
})
export class IgxTreeGridComponent extends IgxGridBaseComponent implements IGridDataBindable, OnInit, AfterContentInit {
    private _id = `igx-tree-grid-${NEXT_ID++}`;
    private _data;
    private _rowLoadingIndicatorTemplate: TemplateRef<any>;

    /**
     * An @Input property that sets the value of the `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-tree-grid [id]="'igx-tree-grid-1'"></igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridComponent
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
     * An @Input property that lets you fill the `IgxTreeGridComponent` with an array of data.
     * ```html
     * <igx-tree-grid [data]="Data" [autoGenerate]="true"></igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridComponent
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
	 * @memberof IgxTreeGridComponent
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
	 * @memberof IgxTreeGridComponent
     */
    set filteredData(value) {
        this._filteredData = value;

        if (this.rowSelectable) {
            this.updateHeaderCheckboxStatusOnFilter(this._filteredData);
        }
    }

    /**
     * Get transactions service for the grid.
     * @experimental @hidden
     */
    get transactions(): IgxHierarchicalTransactionService<HierarchicalTransaction, HierarchicalState> {
        return this._transactions;
    }

    /**
    * @hidden
    */
    public flatData: any[];

    /**
    * @hidden
    */
    public processedExpandedFlatData: any[];

    /**
     * Returns an array of the root level `ITreeGridRecord`s.
     * ```typescript
     * // gets the root record with index=2
     * const states = this.grid.rootRecords[2];
     * ```
	 * @memberof IgxTreeGridComponent
     */
    public rootRecords: ITreeGridRecord[];

    /**
     * Returns a map of all `ITreeGridRecord`s.
     * ```typescript
     * // gets the record with primaryKey=2
     * const states = this.grid.records.get(2);
     * ```
	 * @memberof IgxTreeGridComponent
     */
    public records: Map<any, ITreeGridRecord> = new Map<any, ITreeGridRecord>();

    /**
     * Returns an array of processed (filtered and sorted) root `ITreeGridRecord`s.
     * ```typescript
     * // gets the processed root record with index=2
     * const states = this.grid.processedRootRecords[2];
     * ```
	 * @memberof IgxTreeGridComponent
     */
    public processedRootRecords: ITreeGridRecord[];

    /**
     * Returns a map of all processed (filtered and sorted) `ITreeGridRecord`s.
     * ```typescript
     * // gets the processed record with primaryKey=2
     * const states = this.grid.processedRecords.get(2);
     * ```
	 * @memberof IgxTreeGridComponent
     */
    public processedRecords: Map<any, ITreeGridRecord> = new Map<any, ITreeGridRecord>();

    /**
     * An @Input property that sets the child data key of the `IgxTreeGridComponent`.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [childDataKey]="'employees'" [autoGenerate]="true"></igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridComponent
     */
    @Input()
    public childDataKey;

    /**
     * An @Input property that sets the foreign key of the `IgxTreeGridComponent`.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'" [autoGenerate]="true">
     * </igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridComponent
     */
    @Input()
    public foreignKey;

    /**
     * An @Input property that sets the key indicating whether a row has children.
     * This property is only used for load on demand scenarios.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'"
     *                [loadChildrenOnDemand]="loadChildren"
     *                [hasChildrenKey]="'hasEmployees'">
     * </igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridComponent
     */
    @Input()
    public hasChildrenKey;

    /**
     * An @Input property indicating whether child records should be deleted when their parent gets deleted.
     * By default it is set to true and deletes all children along with the parent.
     * ```html
     * <igx-tree-grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'" cascadeOnDelete="false">
     * </igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridComponent
     */
    @Input()
    public cascadeOnDelete = true;

    private _expansionDepth = Infinity;

    /**
     * An @Input property that sets the count of levels to be expanded in the `IgxTreeGridComponent`. By default it is
     * set to `Infinity` which means all levels would be expanded.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [childDataKey]="'employees'" expansionDepth="1" [autoGenerate]="true"></igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridComponent
     */
    @Input()
    public get expansionDepth(): number {
        return this._expansionDepth;
    }

    public set expansionDepth(value: number) {
        this._expansionDepth = value;
        this.cdr.markForCheck();
    }

    private _expansionStates: Map<any, boolean> = new Map<any, boolean>();

    /**
     * Returns a list of key-value pairs [row ID, expansion state]. Includes only states that differ from the default one.
     * ```typescript
     * const expansionStates = this.grid.expansionStates;
     * ```
	 * @memberof IgxTreeGridComponent
     */
    @Input()
    public get expansionStates() {
        return this._expansionStates;
    }

    /**
     * Sets a list of key-value pairs [row ID, expansion state].
     * ```typescript
     * const states = new Map<any, boolean>();
     * states.set(1, true);
     * this.grid.expansionStates = states;
     * ```
	 * @memberof IgxTreeGridComponent
     */
    public set expansionStates(value) {
        this._expansionStates = this.cloneMap(value);
        this.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    @ContentChild(IgxRowLoadingIndicatorTemplateDirective, { read: IgxRowLoadingIndicatorTemplateDirective })
    protected rowLoadingTemplate: IgxRowLoadingIndicatorTemplateDirective;

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

    /**
     * An @Input property that provides a template for the row loading indicator when load on demand is enabled.
     * ```html
     * <ng-template #rowLoadingTemplate>
     *     <igx-icon fontSet="material">loop</igx-icon>
     * </ng-template>
     *
     * <igx-tree-grid #grid [data]="employeeData" [primaryKey]="'ID'" [foreignKey]="'parentID'"
     *                [loadChildrenOnDemand]="loadChildren"
     *                [rowLoadingIndicatorTemplate]="rowLoadingTemplate">
     * </igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridComponent
     */
    @Input()
    public get rowLoadingIndicatorTemplate(): TemplateRef<any> {
        return this._rowLoadingIndicatorTemplate;
    }

    public set rowLoadingIndicatorTemplate(value: TemplateRef<any>) {
        this._rowLoadingIndicatorTemplate = value;
        this.cdr.markForCheck();
    }

    /**
     * An @Input property that provides a callback for loading child rows on demand.
     * ```html
     * <igx-tree-grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'" [loadChildrenOnDemand]="loadChildren">
     * </igx-tree-grid>
     * ```
     * ```typescript
     * public loadChildren = (parentID: any, done: (children: any[]) => void) => {
     *     this.dataService.getData(parentID, children => done(children));
     * }
     * ```
	 * @memberof IgxTreeGridComponent
     */
    @Input()
    public loadChildrenOnDemand: (parentID: any, done: (children: any[]) => void) => void;

    /**
     * Emitted when the expanded state of a row gets changed.
     * ```typescript
     * rowToggle(event: IRowToggleEventArgs){
     *  // the id of the row
     *  const rowID = event.rowID;
     *  // the new expansion state
     *  const newExpandedState = event.expanded;
     *  // the original event that triggered onRowToggle
     *  const originalEvent = event.event;
     *  // whether the event should be cancelled
     *  event.cancel = true;
     * }
     * ```
     * ```html
     * <igx-tree-grid [data]="employeeData" (onRowToggle)="rowToggle($event)" [autoGenerate]="true"></igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridComponent
     */
    @Output()
    public onRowToggle = new EventEmitter<IRowToggleEventArgs>();

    /**
     * @hidden
     */
    public loadingRows = new Set<any>();

    private _gridAPI: IgxTreeGridAPIService;
    private _filteredData = null;

    /**
     * @hidden
     * @internal
     */
    @ViewChild('dragIndicatorIconBase', { read: TemplateRef })
    public dragIndicatorIconBase: TemplateRef<any>;

    constructor(
        selectionService: IgxGridSelectionService,
        crudService: IgxGridCRUDService,
        public colResizingService: IgxColumnResizingService,
        gridAPI: GridBaseAPIService<IgxGridBaseComponent & IGridDataBindable>,
        selection: IgxSelectionAPIService,
        @Inject(IgxGridTransaction) protected _transactions: IgxHierarchicalTransactionService<HierarchicalTransaction, HierarchicalState>,
        elementRef: ElementRef,
        zone: NgZone,
        @Inject(DOCUMENT) public document,
        cdr: ChangeDetectorRef,
        resolver: ComponentFactoryResolver,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        navigation: IgxTreeGridNavigationService,
        filteringService: IgxFilteringService,
        @Inject(IgxOverlayService) protected overlayService: IgxOverlayService,
        summaryService: IgxGridSummaryService,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
            super(selectionService, crudService, gridAPI, selection,
                _transactions, elementRef, zone, document, cdr, resolver, differs, viewRef, navigation,
                filteringService, overlayService, summaryService, _displayDensityOptions);
        this._gridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        super.ngOnInit();

        this.onRowToggle.pipe(takeUntil(this.destroy$)).subscribe((args) => {
            this.loadChildrenOnRowExpansion(args);
        });
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        if (this.rowLoadingTemplate) {
            this._rowLoadingIndicatorTemplate = this.rowLoadingTemplate.template;
        }
        super.ngAfterContentInit();
    }

    private loadChildrenOnRowExpansion(args: IRowToggleEventArgs) {
        if (this.loadChildrenOnDemand) {
            const parentID = args.rowID;

            if (args.expanded && !this._expansionStates.has(parentID)) {
                this.loadingRows.add(parentID);

                this.loadChildrenOnDemand(parentID, children => {
                    this.loadingRows.delete(parentID);
                    this.addChildRows(children, parentID);
                    this.cdr.markForCheck();

                    requestAnimationFrame(() => {
                        const cellID = this.selection.first_item(`${this.id}-cell`);
                        if (cellID) {
                            const cell = this._gridAPI.get_cell_by_index(cellID.rowIndex, cellID.columnID);
                            if (cell) {
                                cell.nativeElement.focus();
                            }
                        }
                    });
                });
            }
        }
    }

    private addChildRows(children: any[], parentID: any) {
        if (this.primaryKey && this.foreignKey) {
            for (const child of children) {
                child[this.foreignKey] = parentID;
            }
            this.data.push(...children);
        } else if (this.childDataKey) {
            let parent = this.records.get(parentID);
            let parentData = parent.data;

            if (this.transactions.enabled && this.transactions.getAggregatedChanges(true).length) {
                const path = [];
                while (parent) {
                    path.push(parent.rowID);
                    parent = parent.parent;
                }

                let collection = this.data;
                let record: any;
                for (let i = path.length - 1; i >= 0; i--) {
                    const pid = path[i];
                    record = collection.find(r => r[this.primaryKey] === pid);

                    if (!record) {
                        break;
                    }
                    collection = record[this.childDataKey];
                }
                if (record) {
                    parentData = record;
                }
            }

            parentData[this.childDataKey] = children;
        }

        this._pipeTrigger++;
    }

    private cloneMap(mapIn: Map<any, boolean>): Map<any, boolean> {
        const mapCloned: Map<any, boolean> = new Map<any, boolean>();

        mapIn.forEach((value: boolean, key: any, mapObj: Map<any, boolean>) => {

            mapCloned.set(key, value);
        });

        return mapCloned;
    }

    /**
     * Expands the `IgxTreeGridRowComponent` with the specified rowID.
     * @param rowID The identifier of the row to be expanded.
     * ```typescript
     * this.grid.expandRow(2);
     * ```
	 * @memberof IgxTreeGridComponent
     */
    public expandRow(rowID: any) {
        this._gridAPI.expand_row(rowID);
    }

    /**
     * Collapses the `IgxTreeGridRowComponent` with the specified rowID.
     * @param rowID The identifier of the row to be collapsed.
     * ```typescript
     * this.grid.collapseRow(2);
     * ```
	 * @memberof IgxTreeGridComponent
     */
    public collapseRow(rowID: any) {
        this._gridAPI.collapse_row(rowID);
    }

    /**
     * Toggles the expansion state of the `IgxTreeGridRowComponent` with the specified rowID.
     * @param rowID The identifier of the row to be toggled.
     * ```typescript
     * this.grid.toggleRow(2);
     * ```
	 * @memberof IgxTreeGridComponent
     */
    public toggleRow(rowID: any) {
        this._gridAPI.toggle_row_expansion(rowID);
    }

    /**
     * Expands all rows.
     * ```typescript
     * this.grid.expandAll();
     * ```
	 * @memberof IgxTreeGridComponent
     */
    public expandAll() {
        this._expansionDepth = Infinity;
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * Collapses all rows.
     * ```typescript
     * this.grid.collapseAll();
     * ```
	 * @memberof IgxTreeGridComponent
     */
    public collapseAll() {
        this._expansionDepth = 0;
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * Creates a new `IgxTreeGridRowComponent` with the given data. If a parentRowID is not specified, the newly created
     * row would be added at the root level. Otherwise, it would be added as a child of the row whose primaryKey matches
     * the specified parentRowID. If the parentRowID does not exist, an error would be thrown.
     * ```typescript
     * const record = {
     *     ID: this.grid.data[this.grid1.data.length - 1].ID + 1,
     *     Name: this.newRecord
     * };
     * this.grid.addRow(record, 1); // Adds a new child row to the row with ID=1.
     * ```
     * @param data
     * @param parentRowID
     * @memberof IgxTreeGridComponent
     */
    public addRow(data: any, parentRowID?: any) {
        if (parentRowID) {
            super.endEdit(true);

            const state = this.transactions.getState(parentRowID);
            // we should not allow adding of rows as child of deleted row
            if (state && state.type === TransactionType.DELETE) {
                throw Error(`Cannot add child row to deleted parent row`);
            }

            const parentRecord = this.records.get(parentRowID);

            if (!parentRecord) {
                throw Error('Invalid parent row ID!');
            }
            this.summaryService.clearSummaryCache({rowID: parentRecord.rowID});
            if (this.primaryKey && this.foreignKey) {
                data[this.foreignKey] = parentRowID;
                super.addRow(data);
            } else {
                const parentData = parentRecord.data;
                const childKey = this.childDataKey;
                if (this.transactions.enabled) {
                    const rowId = this.primaryKey ? data[this.primaryKey] : data;
                    const path: any[] = [];
                    path.push(...this.generateRowPath(parentRowID));
                    path.push(parentRowID);
                    this.transactions.add({
                        id: rowId,
                        path: path,
                        newValue: data,
                        type: TransactionType.ADD
                    } as HierarchicalTransaction,
                        null);
                } else {
                    if (!parentData[childKey]) {
                        parentData[childKey] = [];
                    }
                    parentData[childKey].push(data);
                }
                this.onRowAdded.emit({ data });
                this._pipeTrigger++;
                this.cdr.markForCheck();
            }
        } else {
            if (this.primaryKey && this.foreignKey) {
                const rowID = data[this.foreignKey];
                this.summaryService.clearSummaryCache({rowID: rowID});
            }
            super.addRow(data);
        }
    }

    /** @hidden */
    public deleteRowById(rowId: any) {
        //  if this is flat self-referencing data, and CascadeOnDelete is set to true
        //  and if we have transactions we should start pending transaction. This allows
        //  us in case of delete action to delete all child rows as single undo action
        this._gridAPI.deleteRowById(rowId);

    }

    /** @hidden */
    public generateRowPath(rowId: any): any[] {
        const path: any[] = [];
        let record = this.records.get(rowId);

        while (record.parent) {
            path.push(record.parent.rowID);
            record = record.parent;
        }

        return path.reverse();
    }

    /**
     * @hidden @internal
     */
    protected getDataBasedBodyHeight(): number {
        return !this.flatData || (this.flatData.length < this._defaultTargetRecordNumber) ?
            0 : this.defaultTargetBodyHeight;
    }

    /**
     * @hidden
     */
    protected scrollTo(row: any | number, column: any | number): void {
        let delayScrolling = false;
        let record: ITreeGridRecord;

        if (typeof(row) !== 'number') {
            const rowData = row;
            const rowID = this._gridAPI.get_row_id(rowData);
            record = this.processedRecords.get(rowID);
            this._gridAPI.expand_path_to_record(record);

            if (this.paging) {
                const rowIndex = this.processedExpandedFlatData.indexOf(rowData);
                const page = Math.floor(rowIndex / this.perPage);

                if (this.page !== page) {
                    delayScrolling = true;
                    this.page = page;
                }
            }
        }

        if (delayScrolling) {
            this.verticalScrollContainer.onDataChanged.pipe(first()).subscribe(() => {
                this.scrollDirective(this.verticalScrollContainer,
                    typeof(row) === 'number' ? row : this.verticalScrollContainer.igxForOf.indexOf(record));
            });
        } else {
            this.scrollDirective(this.verticalScrollContainer,
                typeof(row) === 'number' ? row : this.verticalScrollContainer.igxForOf.indexOf(record));
        }

        this.scrollToHorizontally(column);
    }

    /**
    * @hidden
    */
    public getContext(rowData, rowIndex): any {
        return {
            $implicit: rowData,
            index: rowIndex,
            templateID: this.isSummaryRow(rowData) ? 'summaryRow' : 'dataRow'
        };
    }

    getSelectedData(): any[] {
        const source = [];

        const process = (record) => {
            if (record.summaries) {
                source.push(null);
                return;
            }
            source.push(record.data);
        };

        this.verticalScrollContainer.igxForOf.forEach(process);
        return this.extractDataFromSelection(source);
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

    protected writeToData(rowIndex: number, value: any) {
        mergeObjects(this.flatData[rowIndex], value);
    }

    /**
     * @hidden
    */
   protected initColumns(collection: QueryList<IgxColumnComponent>, cb: Function = null) {
        if (this.hasColumnLayouts) {
            // invalid configuration - tree grid should not allow column layouts
            // remove column layouts
            const nonColumnLayoutColumns = this.columnList.filter((col) => !col.columnLayout && !col.columnLayoutChild);
            this.columnList.reset(nonColumnLayoutColumns);
        }
        super.initColumns(collection, cb);
    }
}
