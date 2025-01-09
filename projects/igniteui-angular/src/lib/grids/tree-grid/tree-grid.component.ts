import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    Input,
    OnInit,
    TemplateRef,
    ContentChild,
    AfterContentInit,
    ViewChild,
    DoCheck,
    AfterViewInit,
    ElementRef,
    NgZone,
    Inject,
    ChangeDetectorRef,
    IterableDiffers,
    ViewContainerRef,
    Optional,
    LOCALE_ID,
    Injector,
    EnvironmentInjector,
    CUSTOM_ELEMENTS_SCHEMA,
    booleanAttribute
} from '@angular/core';
import { DOCUMENT, NgIf, NgClass, NgFor, NgTemplateOutlet, NgStyle } from '@angular/common';

import { IgxTreeGridAPIService } from './tree-grid-api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { ITreeGridRecord } from './tree-grid.interfaces';
import { IRowDataCancelableEventArgs, IRowDataEventArgs, IRowToggleEventArgs } from '../common/events';
import {
    HierarchicalTransaction,
    HierarchicalState,
    TransactionType,
    TransactionEventOrigin,
    StateUpdateEvent
} from '../../services/transaction/transaction';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IgxGridSelectionService } from '../selection/selection.service';
import { mergeObjects, PlatformUtil } from '../../core/utils';
import { first, takeUntil } from 'rxjs/operators';
import { IgxRowLoadingIndicatorTemplateDirective } from './tree-grid.directives';
import { IgxForOfSyncService, IgxForOfScrollSyncService } from '../../directives/for-of/for_of.sync.service';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { CellType, GridServiceType, GridType, IGX_GRID_BASE, IGX_GRID_SERVICE_BASE, RowType } from '../common/grid.interface';
import { IgxColumnComponent } from '../columns/column.component';
import { IgxTreeGridSelectionService } from './tree-grid-selection.service';
import { GridSelectionMode } from '../common/enums';
import { IgxSummaryRow, IgxTreeGridRow } from '../grid-public-row';
import { IgxGridCRUDService } from '../common/crud.service';
import { IgxTreeGridGroupByAreaComponent } from '../grouping/tree-grid-group-by-area.component';
import { IgxGridCell } from '../grid-public-cell';
import { IgxHierarchicalTransactionFactory } from '../../services/transaction/transaction-factory.service';
import { IgxColumnResizingService } from '../resizing/resizing.service';
import { HierarchicalTransactionService } from '../../services/transaction/hierarchical-transaction';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { IgxGridTransaction } from '../common/types';
import { TreeGridFilteringStrategy } from './tree-grid.filtering.strategy';
import { IgxGridValidationService } from '../grid/grid-validation.service';
import { IgxTreeGridSummaryPipe } from './tree-grid.summary.pipe';
import { IgxTreeGridFilteringPipe } from './tree-grid.filtering.pipe';
import { IgxTreeGridHierarchizingPipe, IgxTreeGridFlatteningPipe, IgxTreeGridSortingPipe, IgxTreeGridPagingPipe, IgxTreeGridTransactionPipe, IgxTreeGridNormalizeRecordsPipe, IgxTreeGridAddRowPipe } from './tree-grid.pipes';
import { IgxSummaryDataPipe } from '../summaries/grid-root-summary.pipe';
import { IgxHasVisibleColumnsPipe, IgxGridRowPinningPipe, IgxGridRowClassesPipe, IgxGridRowStylesPipe, IgxStringReplacePipe } from '../common/pipes';
import { IgxGridColumnResizerComponent } from '../resizing/resizer.component';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxRowEditTabStopDirective } from '../grid.rowEdit.directive';
import { IgxRippleDirective } from '../../directives/ripple/ripple.directive';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { IgxSnackbarComponent } from '../../snackbar/snackbar.component';
import { IgxCircularProgressBarComponent } from '../../progressbar/progressbar.component';
import { IgxOverlayOutletDirective, IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import { IgxSummaryRowComponent } from '../summaries/summary-row.component';
import { IgxTreeGridRowComponent } from './tree-grid-row.component';
import { IgxTemplateOutletDirective } from '../../directives/template-outlet/template_outlet.directive';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { IgxColumnMovingDropDirective } from '../moving/moving.drop.directive';
import { IgxGridDragSelectDirective } from '../selection/drag-select.directive';
import { IgxGridBodyDirective } from '../grid.common';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
import { IgxTextHighlightService } from '../../directives/text-highlight/text-highlight.service';

let NEXT_ID = 0;

/* blazorAdditionalDependency: Column */
/* blazorAdditionalDependency: ColumnGroup */
/* blazorAdditionalDependency: ColumnLayout */
/* blazorAdditionalDependency: GridToolbar */
/* blazorAdditionalDependency: GridToolbarActions */
/* blazorAdditionalDependency: GridToolbarTitle */
/* blazorAdditionalDependency: GridToolbarAdvancedFiltering */
/* blazorAdditionalDependency: GridToolbarExporter */
/* blazorAdditionalDependency: GridToolbarHiding */
/* blazorAdditionalDependency: GridToolbarPinning */
/* blazorAdditionalDependency: ActionStrip */
/* blazorAdditionalDependency: GridActionsBaseDirective */
/* blazorAdditionalDependency: GridEditingActions */
/* blazorAdditionalDependency: GridPinningActions */
/* blazorIndirectRender */
/**
 * **Ignite UI for Angular Tree Grid** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid)
 *
 * The Ignite UI Tree Grid displays and manipulates hierarchical data with consistent schema formatted as a table and
 * provides features such as sorting, filtering, editing, column pinning, paging, column moving and hiding.
 *
 * Example:
 * ```html
 * <igx-tree-grid [data]="employeeData" primaryKey="employeeID" foreignKey="PID" [autoGenerate]="false">
 *   <igx-column field="first" header="First Name"></igx-column>
 *   <igx-column field="last" header="Last Name"></igx-column>
 *   <igx-column field="role" header="Role"></igx-column>
 * </igx-tree-grid>
 * ```
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-tree-grid',
    templateUrl: 'tree-grid.component.html',
    providers: [
        IgxGridCRUDService,
        IgxGridValidationService,
        IgxGridSummaryService,
        IgxGridNavigationService,
        { provide: IgxGridSelectionService, useClass: IgxTreeGridSelectionService },
        { provide: IGX_GRID_SERVICE_BASE, useClass: IgxTreeGridAPIService },
        { provide: IGX_GRID_BASE, useExisting: IgxTreeGridComponent },
        IgxFilteringService,
        IgxColumnResizingService,
        IgxForOfSyncService,
        IgxForOfScrollSyncService
    ],
    imports: [
        NgIf,
        NgFor,
        NgClass,
        NgStyle,
        NgTemplateOutlet,
        IgxGridHeaderRowComponent,
        IgxGridBodyDirective,
        IgxGridDragSelectDirective,
        IgxColumnMovingDropDirective,
        IgxGridForOfDirective,
        IgxTemplateOutletDirective,
        IgxTreeGridRowComponent,
        IgxSummaryRowComponent,
        IgxOverlayOutletDirective,
        IgxToggleDirective,
        IgxCircularProgressBarComponent,
        IgxSnackbarComponent,
        IgxButtonDirective,
        IgxRippleDirective,
        IgxRowEditTabStopDirective,
        IgxIconComponent,
        IgxGridColumnResizerComponent,
        IgxHasVisibleColumnsPipe,
        IgxGridRowPinningPipe,
        IgxGridRowClassesPipe,
        IgxGridRowStylesPipe,
        IgxSummaryDataPipe,
        IgxTreeGridHierarchizingPipe,
        IgxTreeGridFlatteningPipe,
        IgxTreeGridSortingPipe,
        IgxTreeGridFilteringPipe,
        IgxTreeGridPagingPipe,
        IgxTreeGridTransactionPipe,
        IgxTreeGridSummaryPipe,
        IgxTreeGridNormalizeRecordsPipe,
        IgxTreeGridAddRowPipe,
        IgxStringReplacePipe
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgxTreeGridComponent extends IgxGridBaseDirective implements GridType, OnInit, AfterViewInit, DoCheck, AfterContentInit {
    /**
     * Sets the child data key of the `IgxTreeGridComponent`.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [childDataKey]="'employees'" [autoGenerate]="true"></igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public childDataKey: string;

    /**
     * Sets the foreign key of the `IgxTreeGridComponent`.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'" [autoGenerate]="true">
     * </igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public foreignKey: string;

    /**
     * Sets the key indicating whether a row has children.
     * This property is only used for load on demand scenarios.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'"
     *                [loadChildrenOnDemand]="loadChildren"
     *                [hasChildrenKey]="'hasEmployees'">
     * </igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public hasChildrenKey: string;

    /**
     * Sets whether child records should be deleted when their parent gets deleted.
     * By default it is set to true and deletes all children along with the parent.
     * ```html
     * <igx-tree-grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'" cascadeOnDelete="false">
     * </igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input({ transform: booleanAttribute })
    public cascadeOnDelete = true;

    /* csSuppress */
    /**
     * Sets a callback for loading child rows on demand.
     * ```html
     * <igx-tree-grid [data]="employeeData" [primaryKey]="'employeeID'" [foreignKey]="'parentID'" [loadChildrenOnDemand]="loadChildren">
     * </igx-tree-grid>
     * ```
     * ```typescript
     * public loadChildren = (parentID: any, done: (children: any[]) => void) => {
     *     this.dataService.getData(parentID, children => done(children));
     * }
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public loadChildrenOnDemand: (parentID: any, done: (children: any[]) => void) => void;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.role')
    public role = 'treegrid';

    /**
     * Sets the value of the `id` attribute. If not provided it will be automatically generated.
     * ```html
     * <igx-tree-grid [id]="'igx-tree-grid-1'"></igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-tree-grid-${NEXT_ID++}`;

    /**
     * @hidden
     * @internal
     */
    @ContentChild(IgxTreeGridGroupByAreaComponent, { read: IgxTreeGridGroupByAreaComponent })
    public treeGroupArea: IgxTreeGridGroupByAreaComponent;

    /**
     * @hidden @internal
     */
    @ViewChild('record_template', { read: TemplateRef, static: true })
    protected recordTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('summary_template', { read: TemplateRef, static: true })
    protected summaryTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild(IgxRowLoadingIndicatorTemplateDirective, { read: IgxRowLoadingIndicatorTemplateDirective })
    protected rowLoadingTemplate: IgxRowLoadingIndicatorTemplateDirective;

    /**
     * @hidden
     */
    public flatData: any[] | null;

    /**
     * @hidden
     */
    public processedExpandedFlatData: any[] | null;

    /**
     * Returns an array of the root level `ITreeGridRecord`s.
     * ```typescript
     * // gets the root record with index=2
     * const states = this.grid.rootRecords[2];
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public rootRecords: ITreeGridRecord[];

    /* blazorSuppress */
    /**
     * Returns a map of all `ITreeGridRecord`s.
     * ```typescript
     * // gets the record with primaryKey=2
     * const states = this.grid.records.get(2);
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public records: Map<any, ITreeGridRecord> = new Map<any, ITreeGridRecord>();

    /**
     * Returns an array of processed (filtered and sorted) root `ITreeGridRecord`s.
     * ```typescript
     * // gets the processed root record with index=2
     * const states = this.grid.processedRootRecords[2];
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public processedRootRecords: ITreeGridRecord[];

    /* blazorSuppress */
    /**
     * Returns a map of all processed (filtered and sorted) `ITreeGridRecord`s.
     * ```typescript
     * // gets the processed record with primaryKey=2
     * const states = this.grid.processedRecords.get(2);
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public processedRecords: Map<any, ITreeGridRecord> = new Map<any, ITreeGridRecord>();

    /**
     * @hidden
     */
    public loadingRows = new Set<any>();

    protected override _filterStrategy = new TreeGridFilteringStrategy();
    protected override _transactions: HierarchicalTransactionService<HierarchicalTransaction, HierarchicalState>;
    private _data;
    private _rowLoadingIndicatorTemplate: TemplateRef<void>;
    private _expansionDepth = Infinity;

     /* treatAsRef */
    /**
     * Gets/Sets the array of data that populates the component.
     * ```html
     * <igx-tree-grid [data]="Data" [autoGenerate]="true"></igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public get data(): any[] | null {
        return this._data;
    }

     /* treatAsRef */
    public set data(value: any[] | null) {
        const oldData = this._data;
        this._data = value || [];
        this.summaryService.clearSummaryCache();
        if (!this._init) {
            this.validation.updateAll(this._data);
        }
        if (this.autoGenerate && this._data.length > 0 && this.shouldRecreateColumns(oldData, this._data)) {
            this.setupColumns();
        }
        this.checkPrimaryKeyField();
        this.cdr.markForCheck();
    }

    /** @hidden @internal */
    public override get type(): GridType["type"] {
        return 'tree';
    }

    /**
     * Get transactions service for the grid.
     *
     * @experimental @hidden
     */
    public override get transactions() {
        if (this._diTransactions && !this.batchEditing) {
            return this._diTransactions;
        }
        return this._transactions;
    }

    /**
     * Sets the count of levels to be expanded in the `IgxTreeGridComponent`. By default it is
     * set to `Infinity` which means all levels would be expanded.
     * ```html
     * <igx-tree-grid #grid [data]="employeeData" [childDataKey]="'employees'" expansionDepth="1" [autoGenerate]="true"></igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public get expansionDepth(): number {
        return this._expansionDepth;
    }

    public set expansionDepth(value: number) {
        this._expansionDepth = value;
        this.notifyChanges();
    }

    /**
     * Template for the row loading indicator when load on demand is enabled.
     * ```html
     * <ng-template #rowLoadingTemplate>
     *     <igx-icon>loop</igx-icon>
     * </ng-template>
     *
     * <igx-tree-grid #grid [data]="employeeData" [primaryKey]="'ID'" [foreignKey]="'parentID'"
     *                [loadChildrenOnDemand]="loadChildren"
     *                [rowLoadingIndicatorTemplate]="rowLoadingTemplate">
     * </igx-tree-grid>
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    @Input()
    public get rowLoadingIndicatorTemplate(): TemplateRef<void> {
        return this._rowLoadingIndicatorTemplate;
    }

    public set rowLoadingIndicatorTemplate(value: TemplateRef<void>) {
        this._rowLoadingIndicatorTemplate = value;
        this.notifyChanges();
    }

    // Kind of stupid
    // private get _gridAPI(): IgxTreeGridAPIService {
    //     return this.gridAPI as IgxTreeGridAPIService;
    // }

    constructor(
        validationService: IgxGridValidationService,
        selectionService: IgxGridSelectionService,
        colResizingService: IgxColumnResizingService,
        @Inject(IGX_GRID_SERVICE_BASE) gridAPI: GridServiceType,
        // public gridAPI: GridBaseAPIService<IgxGridBaseDirective & GridType>,
        transactionFactory: IgxHierarchicalTransactionFactory,
        _elementRef: ElementRef<HTMLElement>,
        _zone: NgZone,
        @Inject(DOCUMENT) document: any,
        cdr: ChangeDetectorRef,
        differs: IterableDiffers,
        viewRef: ViewContainerRef,
        injector: Injector,
        envInjector: EnvironmentInjector,
        navigation: IgxGridNavigationService,
        filteringService: IgxFilteringService,
        textHighlightService: IgxTextHighlightService,
        @Inject(IgxOverlayService) overlayService: IgxOverlayService,
        summaryService: IgxGridSummaryService,
        @Inject(LOCALE_ID) localeId: string,
        platform: PlatformUtil,
        @Optional() @Inject(IgxGridTransaction) protected override _diTransactions?:
            HierarchicalTransactionService<HierarchicalTransaction, HierarchicalState>,
    ) {
        super(
            validationService,
            selectionService,
            colResizingService,
            gridAPI,
            transactionFactory,
            _elementRef,
            _zone,
            document,
            cdr,
            differs,
            viewRef,
            injector,
            envInjector,
            navigation,
            filteringService,
            textHighlightService,
            overlayService,
            summaryService,
            localeId,
            platform,
            _diTransactions,
        );
    }

    /**
     * @hidden
     */
    public override ngOnInit() {
        super.ngOnInit();

        this.rowToggle.pipe(takeUntil(this.destroy$)).subscribe((args) => {
            this.loadChildrenOnRowExpansion(args);
        });

        // TODO: cascade selection logic should be refactor to be handled in the already existing subs
        this.rowAddedNotifier.pipe(takeUntil(this.destroy$)).subscribe(args => {
            if (this.rowSelection === GridSelectionMode.multipleCascade) {
                let rec = this.gridAPI.get_rec_by_id(this.primaryKey ? args.data[this.primaryKey] : args.data);
                if (rec && rec.parent) {
                    this.gridAPI.grid.selectionService.updateCascadeSelectionOnFilterAndCRUD(
                        new Set([rec.parent]), rec.parent.key);
                } else {
                    // The record is still not available
                    // Wait for the change detection to update records through pipes
                    requestAnimationFrame(() => {
                        rec = this.gridAPI.get_rec_by_id(this.primaryKey ?
                            args.data[this.primaryKey] : args.data);
                        if (rec && rec.parent) {
                            this.gridAPI.grid.selectionService.updateCascadeSelectionOnFilterAndCRUD(
                                new Set([rec.parent]), rec.parent.key);
                        }
                        this.notifyChanges();
                    });
                }
            }
        });

        this.rowDeletedNotifier.pipe(takeUntil(this.destroy$)).subscribe(args => {
            if (this.rowSelection === GridSelectionMode.multipleCascade) {
                if (args.data) {
                    const rec = this.gridAPI.get_rec_by_id(
                        this.primaryKey ? args.data[this.primaryKey] : args.data);
                    this.handleCascadeSelection(args, rec);
                } else {
                    // if a row has been added and before commiting the transaction deleted
                    const leafRowsDirectParents = new Set<any>();
                    this.records.forEach(record => {
                        if (record && (!record.children || record.children.length === 0) && record.parent) {
                            leafRowsDirectParents.add(record.parent);
                        }
                    });
                    // Wait for the change detection to update records through pipes
                    requestAnimationFrame(() => {
                        this.gridAPI.grid.selectionService.updateCascadeSelectionOnFilterAndCRUD(leafRowsDirectParents);
                        this.notifyChanges();
                    });
                }
            }
        });

        this.filteringDone.pipe(takeUntil(this.destroy$)).subscribe(() => {
            if (this.rowSelection === GridSelectionMode.multipleCascade) {
                const leafRowsDirectParents = new Set<any>();
                this.records.forEach(record => {
                    if (record && (!record.children || record.children.length === 0) && record.parent) {
                        leafRowsDirectParents.add(record.parent);
                    }
                });
                this.gridAPI.grid.selectionService.updateCascadeSelectionOnFilterAndCRUD(leafRowsDirectParents);
                this.notifyChanges();
            }
        });
    }

    /**
     * @hidden
     */
    public override ngAfterViewInit() {
        super.ngAfterViewInit();
        // TODO: pipesExectured event
        // run after change detection in super triggers pipes for records structure
        if (this.rowSelection === GridSelectionMode.multipleCascade && this.selectedRows.length) {
            const selRows = this.selectedRows;
            this.selectionService.clearRowSelection();
            this.selectRows(selRows, true);
            this.cdr.detectChanges();
        }
    }

    /**
     * @hidden
     */
    public override ngAfterContentInit() {
        if (this.rowLoadingTemplate) {
            this._rowLoadingIndicatorTemplate = this.rowLoadingTemplate.template;
        }
        super.ngAfterContentInit();
    }

    public override getDefaultExpandState(record: ITreeGridRecord) {
        return record.children && record.children.length && record.level < this.expansionDepth;
    }

    /**
     * Expands all rows.
     * ```typescript
     * this.grid.expandAll();
     * ```
     *
     * @memberof IgxTreeGridComponent
     */
    public override expandAll() {
        this._expansionDepth = Infinity;
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * Collapses all rows.
     *
     * ```typescript
     * this.grid.collapseAll();
     *  ```
     *
     * @memberof IgxTreeGridComponent
     */
    public override collapseAll() {
        this._expansionDepth = 0;
        this.expansionStates = new Map<any, boolean>();
    }

    /**
     * @hidden
     */
    public override refreshGridState(args?: IRowDataEventArgs) {
        super.refreshGridState();
        if (this.primaryKey && this.foreignKey && args) {
            const rowID = args.data[this.foreignKey];
            this.summaryService.clearSummaryCache({ rowID });
            this.pipeTrigger++;
            this.cdr.detectChanges();
        }
    }

    /* blazorCSSuppress */
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
     *
     * @param data
     * @param parentRowID
     * @memberof IgxTreeGridComponent
     */
    // TODO: remove evt emission
    public override addRow(data: any, parentRowID?: any) {
        this.crudService.endEdit(true);
        this.gridAPI.addRowToData(data, parentRowID);

        this.rowAddedNotifier.next({
            data: data,
            rowData: data, owner: this,
            primaryKey: data[this.primaryKey],
            rowKey: data[this.primaryKey]
        });
        this.pipeTrigger++;
        this.notifyChanges();
    }

    /**
     * Enters add mode by spawning the UI with the context of the specified row by index.
     *
     * @remarks
     * Accepted values for index are integers from 0 to this.grid.dataView.length
     * @remarks
     * When adding the row as a child, the parent row is the specified row.
     * @remarks
     * To spawn the UI on top, call the function with index = null or a negative number.
     * In this case trying to add this row as a child will result in error.
     * @example
     * ```typescript
     * this.grid.beginAddRowByIndex(10);
     * this.grid.beginAddRowByIndex(10, true);
     * this.grid.beginAddRowByIndex(null);
     * ```
     * @param index - The index to spawn the UI at. Accepts integers from 0 to this.grid.dataView.length
     * @param asChild - Whether the record should be added as a child. Only applicable to igxTreeGrid.
     */
    public override beginAddRowByIndex(index: number, asChild?: boolean): void {
        if (index === null || index < 0) {
            return this.beginAddRowById(null, asChild);
        }
        return this._addRowForIndex(index - 1, asChild);
    }

    /**
     * @hidden
     */
    public getContext(rowData: any, rowIndex: number, pinned?: boolean): any {
        return {
            $implicit: this.isGhostRecord(rowData) ? rowData.recordRef : rowData,
            index: this.getDataViewIndex(rowIndex, pinned),
            templateID: {
                type: this.isSummaryRow(rowData) ? 'summaryRow' : 'dataRow',
                id: null
            },
            disabled: this.isGhostRecord(rowData) ? rowData.recordRef.isFilteredOutParent === undefined : false
        };
    }

    /**
     * @hidden
     * @internal
     */
    public override getInitialPinnedIndex(rec) {
        const id = this.gridAPI.get_row_id(rec);
        return this._pinnedRecordIDs.indexOf(id);
    }

    /**
     * @hidden
     * @internal
     */
    public override isRecordPinned(rec) {
        return this.getInitialPinnedIndex(rec.data) !== -1;
    }

    /**
     *
     * Returns an array of the current cell selection in the form of `[{ column.field: cell.value }, ...]`.
     *
     * @remarks
     * If `formatters` is enabled, the cell value will be formatted by its respective column formatter (if any).
     * If `headers` is enabled, it will use the column header (if any) instead of the column field.
     */
    public override getSelectedData(formatters = false, headers = false): any[] {
        let source = [];

        const process = (record) => {
            if (record.summaries) {
                source.push(null);
                return;
            }
            source.push(record.data);
        };

        this.unpinnedDataView.forEach(process);
        source = this.isRowPinningToTop ? [...this.pinnedDataView, ...source] : [...source, ...this.pinnedDataView];
        return this.extractDataFromSelection(source, formatters, headers);
    }

    /**
     * @hidden @internal
     */
    public override getEmptyRecordObjectFor(inTreeRow: RowType) {
        const treeRowRec = inTreeRow?.treeRow || null;
        const row = { ...treeRowRec };
        const data = treeRowRec?.data || {};
        row.data = { ...data };
        Object.keys(row.data).forEach(key => {
            // persist foreign key if one is set.
            if (this.foreignKey && key === this.foreignKey) {
                row.data[key] = treeRowRec.data[this.crudService.addRowParent?.asChild ? this.primaryKey : key];
            } else {
                row.data[key] = undefined;
            }
        });
        let id = this.generateRowID();
        const rootRecPK = this.foreignKey && this.rootRecords && this.rootRecords.length > 0 ?
            this.rootRecords[0].data[this.foreignKey] : null;
        if (id === rootRecPK) {
            // safeguard in case generated id matches the root foreign key.
            id = this.generateRowID();
        }
        row.key = id;
        row.data[this.primaryKey] = id;
        return { rowID: id, data: row.data, recordRef: row };
    }

    /** @hidden */
    public override deleteRowById(rowId: any): any {
        //  if this is flat self-referencing data, and CascadeOnDelete is set to true
        //  and if we have transactions we should start pending transaction. This allows
        //  us in case of delete action to delete all child rows as single undo action
        const args: IRowDataCancelableEventArgs = {
            rowID: rowId,
            primaryKey: rowId,
            rowKey: rowId,
            cancel: false,
            rowData: this.getRowData(rowId),
            data: this.getRowData(rowId),
            oldValue: null,
            owner: this
        };
        this.rowDelete.emit(args);
        if (args.cancel) {
            return;
        }

        const record = this.gridAPI.deleteRowById(rowId);
        const key = record[this.primaryKey];
        if (record !== null && record !== undefined) {
            const rowDeletedEventArgs: IRowDataEventArgs = {
                data: record,
                rowData: record,
                owner: this,
                primaryKey: key,
                rowKey: key
            };
            this.rowDeleted.emit(rowDeletedEventArgs);
        }
        return record;
    }

    /**
     * Returns the `IgxTreeGridRow` by index.
     *
     * @example
     * ```typescript
     * const myRow = treeGrid.getRowByIndex(1);
     * ```
     * @param index
     */
    public getRowByIndex(index: number): RowType {
        if (index < 0 || index >= this.dataView.length) {
            return undefined;
        }
        return this.createRow(index);
    }

    /**
     * Returns the `RowType` object by the specified primary key.
     *
     * @example
     * ```typescript
     * const myRow = this.treeGrid.getRowByIndex(1);
     * ```
     * @param index
     */
    public getRowByKey(key: any): RowType {
        const rec = this.filteredSortedData ? this.primaryKey ? this.filteredSortedData.find(r => r[this.primaryKey] === key) :
            this.filteredSortedData.find(r => r === key) : undefined;
        const index = this.dataView.findIndex(r => r.data && r.data === rec);
        if (index < 0 || index >= this.filteredSortedData.length) {
            return undefined;
        }
        return new IgxTreeGridRow(this as any, index, rec);
    }

    /**
     * Returns the collection of all RowType for current page.
     *
     * @hidden @internal
     */
    public allRows(): RowType[] {
        return this.dataView.map((rec, index) => this.createRow(index));
    }

    /**
     * Returns the collection of `IgxTreeGridRow`s for current page.
     *
     * @hidden @internal
     */
    public dataRows(): RowType[] {
        return this.allRows().filter(row => row instanceof IgxTreeGridRow);
    }

    /**
     * Returns an array of the selected `IgxGridCell`s.
     *
     * @example
     * ```typescript
     * const selectedCells = this.grid.selectedCells;
     * ```
     */
    public get selectedCells(): CellType[] {
        return this.dataRows().map((row) => row.cells.filter((cell) => cell.selected))
            .reduce((a, b) => a.concat(b), []);
    }

    /**
     * Returns a `CellType` object that matches the conditions.
     *
     * @example
     * ```typescript
     * const myCell = this.grid1.getCellByColumn(2, "UnitPrice");
     * ```
     * @param rowIndex
     * @param columnField
     */
    public getCellByColumn(rowIndex: number, columnField: string): CellType {
        const row = this.getRowByIndex(rowIndex);
        const column = this.columns.find((col) => col.field === columnField);
        if (row && row instanceof IgxTreeGridRow && column) {
            return new IgxGridCell(this as any, rowIndex, column);
        }
    }

    /**
     * Returns a `CellType` object that matches the conditions.
     *
     * @remarks
     * Requires that the primaryKey property is set.
     * @example
     * ```typescript
     * grid.getCellByKey(1, 'index');
     * ```
     * @param rowSelector match any rowID
     * @param columnField
     */
    public getCellByKey(rowSelector: any, columnField: string): CellType {
        const row = this.getRowByKey(rowSelector);
        const column = this.columns.find((col) => col.field === columnField);
        if (row && column) {
            return new IgxGridCell(this as any, row.index, column);
        }
    }

    public override pinRow(rowID: any, index?: number): boolean {
        const row = this.getRowByKey(rowID);
        return super.pinRow(rowID, index, row);
    }

    public override unpinRow(rowID: any): boolean {
        const row = this.getRowByKey(rowID);
        return super.unpinRow(rowID, row);
    }

    /** @hidden */
    public generateRowPath(rowId: any): any[] {
        const path: any[] = [];
        let record = this.records.get(rowId);

        while (record.parent) {
            path.push(record.parent.key);
            record = record.parent;
        }

        return path.reverse();
    }

    /** @hidden */
    public isTreeRow(record: any): boolean {
        return record.key !== undefined && record.data;
    }

    /** @hidden */
    public override getUnpinnedIndexById(id) {
        return this.unpinnedRecords.findIndex(x => x.data[this.primaryKey] === id);
    }

    /**
     * @hidden
     */
    public createRow(index: number, data?: any): RowType {
        let row: RowType;
        const dataIndex = this._getDataViewIndex(index);
        const rec: any = data ?? this.dataView[dataIndex];

        if (this.isSummaryRow(rec)) {
            row = new IgxSummaryRow(this as any, index, rec.summaries);
        }

        if (!row && rec) {
            const isTreeRow = this.isTreeRow(rec);
            const dataRec = isTreeRow ? rec.data : rec;
            const treeRow = isTreeRow ? rec : undefined;
            row = new IgxTreeGridRow(this as any, index, dataRec, treeRow);
        }

        return row;
    }

    protected override generateDataFields(data: any[]): string[] {
        return super.generateDataFields(data).filter(field => field !== this.childDataKey);
    }

    protected override transactionStatusUpdate(event: StateUpdateEvent) {
        let actions = [];
        if (event.origin === TransactionEventOrigin.REDO) {
            actions = event.actions ? event.actions.filter(x => x.transaction.type === TransactionType.DELETE) : [];
            if (this.rowSelection === GridSelectionMode.multipleCascade) {
                this.handleCascadeSelection(event);
            }
        } else if (event.origin === TransactionEventOrigin.UNDO) {
            actions = event.actions ? event.actions.filter(x => x.transaction.type === TransactionType.ADD) : [];
            if (this.rowSelection === GridSelectionMode.multipleCascade) {
                if (event.actions[0].transaction.type === 'add') {
                    const rec = this.gridAPI.get_rec_by_id(event.actions[0].transaction.id);
                    this.handleCascadeSelection(event, rec);
                } else {
                    this.handleCascadeSelection(event);
                }
            }
        }
        if (actions.length) {
            for (const action of actions) {
                this.deselectChildren(action.transaction.id);
            }
        }
        super.transactionStatusUpdate(event);
    }

    protected findRecordIndexInView(rec) {
        return this.dataView.findIndex(x => x.data[this.primaryKey] === rec[this.primaryKey]);
    }

    /**
     * @hidden @internal
     */
    protected override getDataBasedBodyHeight(): number {
        return !this.flatData || (this.flatData.length < this._defaultTargetRecordNumber) ?
            0 : this.defaultTargetBodyHeight;
    }

    /**
     * @hidden
     */
    protected override scrollTo(row: any | number, column: any | number): void {
        let delayScrolling = false;
        let record: ITreeGridRecord;

        if (typeof (row) !== 'number') {
            const rowData = row;
            const rowID = this.gridAPI.get_row_id(rowData);
            record = this.processedRecords.get(rowID);
            this.gridAPI.expand_path_to_record(record);

            if (this.paginator) {
                const rowIndex = this.processedExpandedFlatData.indexOf(rowData);
                const page = Math.floor(rowIndex / this.perPage);

                if (this.page !== page) {
                    delayScrolling = true;
                    this.page = page;
                }
            }
        }

        if (delayScrolling) {
            this.verticalScrollContainer.dataChanged.pipe(first()).subscribe(() => {
                this.scrollDirective(this.verticalScrollContainer,
                    typeof (row) === 'number' ? row : this.unpinnedDataView.indexOf(record));
            });
        } else {
            this.scrollDirective(this.verticalScrollContainer,
                typeof (row) === 'number' ? row : this.unpinnedDataView.indexOf(record));
        }

        this.scrollToHorizontally(column);
    }

    protected override writeToData(rowIndex: number, value: any) {
        mergeObjects(this.flatData[rowIndex], value);
    }

    /**
     * @hidden
     */
    protected override initColumns(collection: IgxColumnComponent[], cb: (args: any) => void = null) {
        if (this.hasColumnLayouts) {
            // invalid configuration - tree grid should not allow column layouts
            // remove column layouts
            const nonColumnLayoutColumns = this.columns.filter((col) => !col.columnLayout && !col.columnLayoutChild);
            this.updateColumns(nonColumnLayoutColumns);
        }
        super.initColumns(collection, cb);
    }

    /**
     * @hidden @internal
     */
    protected override getGroupAreaHeight(): number {
        return this.treeGroupArea ? this.getComputedHeight(this.treeGroupArea.nativeElement) : 0;
    }

    /**
     * @description A recursive way to deselect all selected children of a given record
     * @param recordID ID of the record whose children to deselect
     * @hidden
     * @internal
     */
    private deselectChildren(recordID): void {
        const selectedChildren = [];
        // G.E. Apr 28, 2021 #9465 Records which are not in view can also be selected so we need to
        // deselect them as well, hence using 'records' map instead of getRowByKey() method which will
        // return only row components (i.e. records in view).
        const rowToDeselect = this.records.get(recordID);
        this.selectionService.deselectRowsWithNoEvent([recordID]);
        this.gridAPI.get_selected_children(rowToDeselect, selectedChildren);
        if (selectedChildren.length > 0) {
            selectedChildren.forEach(x => this.deselectChildren(x));
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
                    path.push(parent.key);
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
        this.selectionService.clearHeaderCBState();
        this.pipeTrigger++;
        if (this.rowSelection === GridSelectionMode.multipleCascade) {
            // Force pipe triggering for building the data structure
            this.cdr.detectChanges();
            if (this.selectionService.isRowSelected(parentID)) {
                this.selectionService.rowSelection.delete(parentID);
                this.selectionService.selectRowsWithNoEvent([parentID]);
            }
        }
    }

    private loadChildrenOnRowExpansion(args: IRowToggleEventArgs) {
        if (this.loadChildrenOnDemand) {
            const parentID = args.rowID;

            if (args.expanded && !this._expansionStates.has(parentID)) {
                this.loadingRows.add(parentID);

                this.loadChildrenOnDemand(parentID, children => {
                    this.loadingRows.delete(parentID);
                    this.addChildRows(children, parentID);
                    this.notifyChanges();
                });
            }
        }
    }

    private handleCascadeSelection(event: IRowDataEventArgs | StateUpdateEvent, rec: ITreeGridRecord = null) {
        // Wait for the change detection to update records through the pipes
        requestAnimationFrame(() => {
            if (rec === null) {
                rec = this.gridAPI.get_rec_by_id((event as StateUpdateEvent).actions[0].transaction.id);
            }
            if (rec && rec.parent) {
                this.gridAPI.grid.selectionService.updateCascadeSelectionOnFilterAndCRUD(
                    new Set([rec.parent]), rec.parent.key
                );
                this.notifyChanges();
            }
        });
    }
}
