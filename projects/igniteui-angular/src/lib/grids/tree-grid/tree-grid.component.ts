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
    Optional
} from '@angular/core';
import { IgxSelectionAPIService } from '../../core/selection';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { IgxGridBaseComponent, IgxGridTransaction } from '../grid-base.component';
import { GridBaseAPIService } from '../api.service';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IDisplayDensityOptions, DisplayDensityToken } from '../../core/displayDensity';
import { IRowToggleEventArgs } from './tree-grid.interfaces';
import { TransactionService, HierarchicalTransaction, HierarchicalState, TransactionType } from '../../services/transaction/transaction';
import { DOCUMENT } from '@angular/common';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { mergeObjects } from '../../core/utils';
import { IgxHierarchicalTransactionService } from '../../services';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxSummaryResult } from '../summaries/grid-summary';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';

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
    providers: [IgxGridNavigationService, IgxGridSummaryService, { provide: GridBaseAPIService, useClass: IgxTreeGridAPIService },
        { provide: IgxGridBaseComponent, useExisting: forwardRef(() => IgxTreeGridComponent) }, IgxFilteringService]
})
export class IgxTreeGridComponent extends IgxGridBaseComponent {
    private _id = `igx-tree-grid-${NEXT_ID++}`;

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
        if (this._id !== value) {
            const oldId = this._id;
            this._id = value;
            this._gridAPI.reset(oldId, this._id);
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
     * <igx-tree-grid #grid [data]="employeeData" [childDataKey]="employees" [autoGenerate]="true"></igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridComponent
     */
    @Input()
    public childDataKey;

    /**
     * An @Input property that sets the foreign key of the `IgxTreeGridComponent`.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [primaryKey]="employeeID" [foreignKey]="parentID" [autoGenerate]="true"></igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridComponent
     */
    @Input()
    public foreignKey;

    /**
     * An @Input property indicating whether child records should be deleted when their parent gets deleted.
     * By default it is set to true and deletes all children along with the parent.
     * ```html
     * <igx-tree-grid [data]="employeeData" [primaryKey]="employeeID" [foreignKey]="parentID" cascadeOnDelete="false" [autoGenerate]="true">
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
     * <igx-tree-grid #grid [data]="employeeData" [childDataKey]="employees" expansionDepth="1" [autoGenerate]="true"></igx-tree-grid>
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

    private _gridAPI: IgxTreeGridAPIService;

    constructor(
        gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
        selection: IgxSelectionAPIService,
        @Inject(IgxGridTransaction) protected _transactions: IgxHierarchicalTransactionService<HierarchicalTransaction, HierarchicalState>,
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
        this._gridAPI = <IgxTreeGridAPIService>gridAPI;
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
        this._gridAPI.expand_row(this.id, rowID);
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
        this._gridAPI.collapse_row(this.id, rowID);
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
        this._gridAPI.toggle_row_expansion(this.id, rowID);
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

                this.refreshSearch();
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
        const flatDataWithCascadeOnDeleteAndTransactions =
            this.primaryKey &&
            this.foreignKey &&
            this.cascadeOnDelete &&
            this.transactions.enabled;

        if (flatDataWithCascadeOnDeleteAndTransactions) {
            this.transactions.startPending();
        }

        super.deleteRowById(rowId);

        if (flatDataWithCascadeOnDeleteAndTransactions) {
            this.transactions.endPending(true);
        }
    }

    /** @hidden */
    protected deleteRowFromData(rowID: any, index: number) {
        if (this.primaryKey && this.foreignKey) {
            super.deleteRowFromData(rowID, index);

            if (this.cascadeOnDelete) {
                const treeRecord = this.records.get(rowID);
                if (treeRecord && treeRecord.children && treeRecord.children.length > 0) {
                    for (let i = 0; i < treeRecord.children.length; i++) {
                        const child = treeRecord.children[i];
                        super.deleteRowById(child.rowID);
                    }
                }
            }
        } else {
            const record = this.records.get(rowID);
            const collection = record.parent ? record.parent.data[this.childDataKey] : this.data;
            index = this.primaryKey ?
                collection.map(c => c[this.primaryKey]).indexOf(rowID) :
                collection.indexOf(rowID);

            const selectedChildren = [];
            this._gridAPI.get_selected_children(this.id, record, selectedChildren);
                if (selectedChildren.length > 0) {
                this.deselectRows(selectedChildren);
            }

            if (this.transactions.enabled) {
                const path = this.generateRowPath(rowID);
                this.transactions.add({
                        id: rowID,
                        type: TransactionType.DELETE,
                        newValue: null,
                        path: path
                    },
                    collection[index]
                );
            } else {
                collection.splice(index, 1);
            }
        }
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
     * @hidden
     */
    protected restoreHighlight(): void {
    }

    /**
     * @hidden
     */
    public refreshSearch(updateActiveInfo?: boolean): number {
        return 0;
    }

    /**
     * @hidden
     */
    public findNext(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return 0;
    }

    /**
     * @hidden
     */
    public findPrev(text: string, caseSensitive?: boolean, exactMatch?: boolean): number {
        return 0;
    }

    /**
     * @hidden
     */
    public clearSearch() {
    }

    /**
    * @hidden
    */
    public getContext(rowData): any {
        return {
            $implicit: rowData,
            templateID: this.isSummaryRow(rowData) ? 'summaryRow' : 'dataRow'
        };
    }
}
