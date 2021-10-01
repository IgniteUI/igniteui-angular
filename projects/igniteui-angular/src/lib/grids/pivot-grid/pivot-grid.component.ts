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
import { IPivotConfiguration, IPivotDimension } from './pivot-grid.interface';
import { IgxPivotHeaderRowComponent } from './pivot-header-row.component';
import { IgxColumnGroupComponent } from '../columns/column-group.component';
import { IgxColumnComponent } from '../columns/column.component';
import { PivotUtil } from './pivot-util';

let NEXT_ID = 0;
const MINIMUM_COLUMN_WIDTH = 200;
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
     public recordTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('headerTemplate', { read: TemplateRef, static: true })
    public headerTemplate: TemplateRef<any>;


    public columnGroupStates = new Map<IgxColumnGroupComponent, boolean>();
    public isPivot = true;
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

    /** @hidden */
    public featureColumnsWidth() {
        return this.pivotRowWidths;
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

    public get pivotRowWidths() {
        const rowDimCount = this.pivotConfiguration.rows.length;
        return MINIMUM_COLUMN_WIDTH * rowDimCount;
    }

   public toggleColumn(col: IgxColumnComponent) {
       const state = this.columnGroupStates.get(col);
       this.columnGroupStates.set(col, !state);
   }

    /**
     * @hidden
     */
     protected autogenerateColumns() {
        const data = this.gridAPI.get_data();
        const fieldsMap = this.getFieldsHierarchy(data);
        const columns = this.generateColumnHierarchy(fieldsMap, data);
        this._autoGeneratedCols = columns;

        this.columnList.reset(columns);
        if (data && data.length > 0) {
            this.shouldGenerate = false;
        }
    }

    protected generateColumnHierarchy(fields:  Map<string, any>, data, parent = null): IgxColumnComponent[] {
        const factoryColumn = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const factoryColumnGroup = this.resolver.resolveComponentFactory(IgxColumnGroupComponent);
        let columns = [];
        fields.forEach((value, key) => {
            if (value.children == null || value.children.size === 0) {
                const ref = factoryColumn.create(this.viewRef.injector);
                ref.instance.header = key.split(parent.header + '-')[1];
                ref.instance.field = key;
                ref.instance.dataType = this.resolveDataTypes(data[0][key]);
                ref.instance.parent = parent;
                ref.instance.visibleWhenCollapsed = false;
                ref.changeDetectorRef.detectChanges();
                columns.push(ref.instance);
            } else {
                const ref = factoryColumnGroup.create(this.viewRef.injector);
                ref.instance.header = key;
                //ref.instance.headerTemplate = this.headerTemplate;
                const children = this.generateColumnHierarchy(value.children, data, ref.instance);

                const refChild = factoryColumn.create(this.viewRef.injector);
                refChild.instance.header = key;
                refChild.instance.field = key;
                refChild.instance.dataType = this.resolveDataTypes(data[0][key]);
                refChild.instance.parent = ref.instance;
                refChild.instance.visibleWhenCollapsed = true;

                children.push(refChild.instance);

                ref.changeDetectorRef.detectChanges();
                ref.instance.children.reset(children);
                ref.instance.collapsible = true;

                columns.push(ref.instance);
                columns = columns.concat(children);
            }
        });
        return columns;
    }

    protected getFieldsHierarchy(data){
        const hierarchy = new Map<string, any>();
        for (const rec of data) {
            const vals = PivotUtil.extractValuesFromDimension(this.pivotConfiguration.columns, rec);
            for (const val of vals) {
                if (hierarchy.get(val.value) != null && val.children) {
                    for (const child of val.children) {
                        hierarchy.get(val.value).children.set(child.value, child);
                    }
                } else {
                    const children = val.children;
                    hierarchy.set(val.value, val);
                    hierarchy.get(val.value).children = new Map<string, any>();
                    for (const child of children) {
                        hierarchy.get(val.value).children.set(child.value, child);
                    }
                }
            }
        }
        return hierarchy;
    }
}
