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
    ViewContainerRef,
    Output,
    EventEmitter,
    Inject,
    NgZone,
    forwardRef
} from '@angular/core';
import { IgxSelectionAPIService } from '../../core/selection';
import { cloneArray, mergeObjects } from '../../core/utils';
import { DisplayDensity } from '../../core/displayDensity';
import { ISortingExpression } from '../../data-operations/sorting-expression.interface';
import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { IgxGridBaseComponent, IgxGridTransaction } from '../grid-base.component';
import { GridBaseAPIService } from '../api.service';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IRowToggleEventArgs } from './tree-grid.interfaces';
import { TransactionService, HierarchicalTransaction } from '../../services/transaction/transaction';
import { DOCUMENT } from '@angular/common';
import { IgxGridNavigationService } from '../grid-navigation.service';

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
    selector: 'igx-tree-grid',
    templateUrl: 'tree-grid.component.html',
    providers: [ { provide: GridBaseAPIService, useClass: IgxTreeGridAPIService },
        { provide: IgxGridBaseComponent, useExisting: forwardRef(() => IgxTreeGridComponent) } ]
})
export class IgxTreeGridComponent extends IgxGridBaseComponent {
    private _id = `igx-tree-grid-${NEXT_ID++}`;

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

    /**
    * @hidden
    */
    public flatData: any[];

    public rootRecords: ITreeGridRecord[];

    public records: Map<any, ITreeGridRecord> = new Map<any, ITreeGridRecord>();

    public processedRootRecords: ITreeGridRecord[];

    public processedRecords: Map<any, ITreeGridRecord> = new Map<any, ITreeGridRecord>();

    /**
     * An @Input property that sets the child data key of the `IgxTreeGridComponent`.
     * ```html
     * <igx-tree-grid #grid [data]="localData" [showToolbar]="true" [childDataKey]="employees" [autoGenerate]="true"></igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridRowComponent
     */
    @Input()
    public childDataKey;

    /**
     * An @Input property that sets the foreign key of the `IgxTreeGridComponent`.
     * ```html
     * <igx-tree-grid #grid [data]="localData" [primaryKey]="employeeID" [foreignKey]="parentID" [autoGenerate]="true"></igx-tree-grid>
     * ```
	 * @memberof IgxTreeGridRowComponent
     */
    @Input()
    public foreignKey;

    private _expansionDepth = Infinity;

    /**
     * An @Input property that sets the count of levels to expand by default in the `IgxTreeGridComponent`.
     * ```html
     * <igx-tree-grid #grid [data]="localData" [childDataKey]="employees" expandedLevels="1" [autoGenerate]="true"></iigx-tree-grid>
     * ```
	 * @memberof IgxTreeGridRowComponent
     */
    @Input()
    public get expansionDepth(): number {
        return this._expansionDepth;
    }

    public set expansionDepth(value: number) {
        this._expansionDepth = value;
        this.cdr.markForCheck();
    }

    private _expansionStates:  Map<any, boolean> = new Map<any, boolean>();

    @Input()
    public get expansionStates() {
        return this._expansionStates;
    }

    public set expansionStates(value) {
        this._expansionStates = this.cloneMap(value);
        this.cdr.detectChanges();
    }

    @Output()
    public onRowToggle = new EventEmitter<IRowToggleEventArgs>();

    private _gridAPI: IgxTreeGridAPIService;

    constructor(
        gridAPI: GridBaseAPIService<IgxGridBaseComponent>,
        selection: IgxSelectionAPIService,
        @Inject(IgxGridTransaction) _transactions: TransactionService<HierarchicalTransaction>,
        elementRef: ElementRef,
        zone: NgZone,
        @Inject(DOCUMENT) public document,
        cdr: ChangeDetectorRef,
        resolver: ComponentFactoryResolver,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        navigation: IgxGridNavigationService) {
            super(gridAPI, selection, _transactions, elementRef, zone, document, cdr, resolver, differs, viewRef, navigation);
        this._gridAPI = <IgxTreeGridAPIService>gridAPI;
    }

    /**
     * Returns if the `IgxGridComponent` has summarized columns.
     * ```typescript
     * const summarizedGrid = this.grid.hasSummarizedColumns;
     * ```
	 * @memberof IgxGridComponent
     */
    get hasSummarizedColumns(): boolean {
        return false;
    }

    private cloneMap(mapIn: Map<any, boolean>):  Map<any, boolean> {
        const mapCloned: Map<any, boolean> = new Map<any, boolean>();

        mapIn.forEach((value: boolean, key: any, mapObj: Map<any, boolean>) => {

          mapCloned.set(key, value);
        });

        return mapCloned;
    }

    public expandRow(rowID: any) {
        this._gridAPI.expand_row(this.id, rowID);
    }

    public collapseRow(rowID: any) {
        this._gridAPI.collapse_row(this.id, rowID);
    }

    public toggleRow(rowID: any) {
        this._gridAPI.toggle_row_expansion(this.id, rowID);
    }

    public expandAll() {
        this._expansionDepth = Infinity;
        this.expansionStates = new Map<any, boolean>();
    }

    public collapseAll() {
        this._expansionDepth = 0;
        this.expansionStates = new Map<any, boolean>();
    }

    public addRow(data: any, parentRowID?: any) {
        if (parentRowID) {
            const parentRecord = this.records.get(parentRowID);

            if (!parentRecord) {
                throw Error('Invalid parent row ID!');
            }

            if (this.primaryKey && this.foreignKey) {
                data[this.foreignKey] = parentRowID;
                super.addRow(data);
            } else {
                const parentData = parentRecord.data;
                const childKey = this.childDataKey;
                if (!parentData[childKey]) {
                    parentData[childKey] = [];
                }
                parentData[childKey].push(data);

                this.onRowAdded.emit({ data });
                this._pipeTrigger++;
                this.cdr.markForCheck();

                this.refreshSearch();
            }
        } else {
            super.addRow(data);
        }
    }

    /**
     * @hidden
     */
    protected deleteRowFromData(rowID: any, index: number) {
         if (this.primaryKey && this.foreignKey) {
            super.deleteRowFromData(rowID, index);
        } else {
            const record = this.records.get(rowID);
            const childData = record.parent ? record.parent.data[this.childDataKey] : this.data;
            index = this.primaryKey ? childData.map(c => c[this.primaryKey]).indexOf(rowID) :
                childData.indexOf(rowID);
            childData.splice(index, 1);
        }
    }

    /**
     * @hidden
     */
    protected calcMaxSummaryHeight() {
        return 0;
    }

    /**
     * @hidden
     */
    protected getExportExcel(): boolean {
        return false;
    }

    /**
     * @hidden
     */
    protected getExportCsv(): boolean {
        return false;
    }

    /**
    * @hidden
    */
   public getContext(rowData): any {
        return {
            $implicit: rowData,
            templateID: 'dataRow'
        };
    }

    protected writeToData(rowIndex: number, value: any) {
        mergeObjects(this.flatData[rowIndex], value);
    }
}
