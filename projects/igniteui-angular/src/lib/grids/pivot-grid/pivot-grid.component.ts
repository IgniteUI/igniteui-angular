import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    HostBinding,
    Input,
    OnInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { GridBaseAPIService } from '../api.service';
import { IgxFilteringService } from '../filtering/grid-filtering.service';
import { IgxGridSelectionService } from '../selection/selection.service';
import { IgxForOfSyncService, IgxForOfScrollSyncService } from '../../directives/for-of/for_of.sync.service';
import { GridType } from '../common/grid.interface';
import { IgxGridNavigationService } from '../grid-navigation.service';
import { IgxGridCRUDService } from '../common/crud.service';
import { IgxGridSummaryService } from '../summaries/grid-summary.service';
import { IPivotConfiguration } from './pivot-grid.interface';
import { IgxPivotHeaderRowComponent } from './pivot-header-row.component';

let NEXT_ID = 0;
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-pivot-grid',
    templateUrl: 'pivot-grid.component.html',
    providers: [
        IgxGridCRUDService,
        IgxGridSummaryService,
        IgxGridSelectionService,
        GridBaseAPIService,
        { provide: IgxGridBaseDirective, useExisting: forwardRef(() => IgxPivotGridComponent) },
        IgxFilteringService,
        IgxGridNavigationService,
        IgxForOfSyncService,
        IgxForOfScrollSyncService
    ]
})
export class IgxPivotGridComponent extends IgxGridBaseDirective implements OnInit,
    GridType {


    /** @hidden @internal */
    @ViewChild(IgxPivotHeaderRowComponent, { static: true })
    public theadRow: IgxPivotHeaderRowComponent;

    @Input()
    /**
     * Gets/Sets the pivot configuration with all related dimensions and values.
     *
     * @example
     * ```html
     * <igx-pivot-grid [pivotConfiguration]="config"></igx-pivot-grid>
     * ```
     */
    public pivotConfiguration: IPivotConfiguration = { rows: null, columns: null, values: null, filters: null };

    /**
     * @hidden @internal
     */
    @HostBinding('attr.role')
    public role = 'grid';

    /**
     * @hidden @internal
     */
     @ViewChild('record_template', { read: TemplateRef, static: true })
     protected recordTemplate: TemplateRef<any>;

    private _data;
    private _filteredData;
    private p_id = `igx-pivot-grid-${NEXT_ID++}`;

    /**
     * @hidden
     */
    public ngOnInit() {
        // pivot grid always generates columns automatically.
        this.autoGenerate = true;
        this.columnList.reset([]);
        super.ngOnInit();
    }

    /**
     * Gets/Sets the value of the `id` attribute.
     *
     * @remarks
     * If not provided it will be automatically generated.
     * @example
     * ```html
     * <igx-pivot-grid [id]="'igx-pivot-1'" [data]="Data"></igx-pivot-grid>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public get id(): string {
        return this.p_id;
    }
    public set id(value: string) {
        this.p_id = value;
    }

    /**
     * An @Input property that lets you fill the `IgxPivotGridComponent` with an array of data.
     * ```html
     * <igx-pivot-grid [data]="Data"></igx-pivot-grid>
     * ```
     */
    @Input()
    public set data(value: any[] | null) {
        this._data = value || [];
        if (this.shouldGenerate) {
            this.setupColumns();
            this.reflow();
        }
        this.cdr.markForCheck();
        if (this.height === null || this.height.indexOf('%') !== -1) {
            // If the height will change based on how much data there is, recalculate sizes in igxForOf.
            this.notifyChanges(true);
        }
    }

    /**
     * Returns an array of data set to the component.
     * ```typescript
     * let data = this.grid.data;
     * ```
     */
    public get data(): any[] | null {
        return this._data;
        }

    /**
     * Sets an array of objects containing the filtered data.
     * ```typescript
     * this.grid.filteredData = [{
     *       ID: 1,
     *       Name: "A"
     * }];
     * ```
     */
         public set filteredData(value) {
            this._filteredData = value;
        }

        /**
         * Returns an array of objects containing the filtered data.
         * ```typescript
         * let filteredData = this.grid.filteredData;
         * ```
         *
         * @memberof IgxHierarchicalGridComponent
         */
        public get filteredData() {
            return this._filteredData;
        }


    /**
     * @hidden
     */
    public getContext(rowData, rowIndex): any {
        return {
            $implicit: rowData,
            templateID: {
                type: 'dataRow',
                id: null
            },
            index: this.getDataViewIndex(rowIndex, false)
        };
    }

    public get pivotRows() {
        // TODO - resolve member if member is not string.
        const rowKeys = this.pivotConfiguration.rows.map(x => x.member);
        return this.columns.filter(x => rowKeys.indexOf(x.field) !== -1);
    }

    public get pivotRowWidths() {
        let width = 0;
        this.pivotRows.forEach(col => {
            width += col.calcWidth;
        });
        return width;
    }

    public get pivotColumns() {
        // TODO - resolve member if member is not string.
        const rowKeys = this.pivotConfiguration.rows.map(x => x.member);
        return this.columns.filter(x => rowKeys.indexOf(x.field) === -1);
    }

    public get unpinnedColumns(){
        const rowKeys = this.pivotConfiguration.rows.map(x => x.member);
        const cols = super.unpinnedColumns.filter(x => rowKeys.indexOf(x.field) === -1);
        return cols;
    }

    public get pinnedColumns(){
        const rowKeys = this.pivotConfiguration.rows.map(x => x.member);
        const cols = super.pinnedColumns.filter(x => rowKeys.indexOf(x.field) === -1);
        return cols;
    }
}
