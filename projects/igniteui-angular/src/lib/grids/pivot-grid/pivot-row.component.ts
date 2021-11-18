import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    forwardRef,
    Inject,
    OnChanges,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { IgxRowDirective } from '../row.directive';
import { IgxGridSelectionService } from '../selection/selection.service';
import { IPivotDimension, IPivotDimensionData } from './pivot-grid.interface';
import { PivotUtil } from './pivot-util';
import { IgxColumnComponent } from '../columns/column.component';
import { IGX_GRID_BASE, PivotGridType } from '../common/grid.interface';


const MINIMUM_COLUMN_WIDTH = 200;
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row',
    templateUrl: './pivot-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxPivotRowComponent) }]
})
export class IgxPivotRowComponent extends IgxRowDirective implements OnChanges {

    /**
     * @hidden @internal
     */
     @ViewChild('headerTemplate', { read: TemplateRef, static: true })
     public headerTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
     @ViewChild('headerTemplateGray', { read: TemplateRef, static: true })
     public headerTemplateGray: TemplateRef<any>;

    public rowDimensionData: IPivotDimensionData[] = [];

    public get rowDimension() {
        return this.rowDimensionData?.map(x => x.column);
    }

    constructor(
        @Inject(IGX_GRID_BASE) public grid: PivotGridType,
        public selectionService: IgxGridSelectionService,
        public element: ElementRef<HTMLElement>,
        public cdr: ChangeDetectorRef,
        protected resolver: ComponentFactoryResolver,
        protected viewRef: ViewContainerRef
    ){
        super(grid, selectionService, element, cdr);
    }
    /**
     * @hidden
     * @internal
     */
     public get viewIndex(): number {
        return this.index;
    }

    /**
     * @hidden
     * @internal
     */
    public getRowDimensionKey(col: IgxColumnComponent) {
            const dimData = this.rowDimensionData.find(x => x.column === col);
            const key =  PivotUtil.getRecordKey(this.data, dimData.dimension, dimData.prevDimensions);
            return key;
    }

    public getExpandState(col: IgxColumnComponent) {
        return this.grid.gridAPI.get_row_expansion_state(this.getRowDimensionKey(col));
    }


    /**
     * @hidden
     * @internal
     */
    public ngOnChanges(changes: SimpleChanges) {
        if (changes.rowData) {
            // generate new rowDimension on row data change
            this.rowDimensionData = [];
            const rowDimConfig = this.grid.rowDimensions;
            this.viewRef.clear();
            this.extractFromDimensions(rowDimConfig, 0);
        }
    }

    public getCellClass(col: any) {
        const configuration = this.grid.pivotConfiguration;
        if (configuration.values.length === 1) {
            return configuration.values[0].styles;
        }
        const colName = col.field.split('-');
        const measureName = colName[colName.length - 1];
        return this.grid.pivotConfiguration.values.find(v => v.member === measureName)?.styles;
    }

    protected extractFromDimensions(rowDimConfig: IPivotDimension[], level: number) {
        let dimIndex = 0;
        let currentLvl = 0;
        currentLvl += level;
        const prev = [];
        for (const dim of rowDimConfig) {
            const dimData = PivotUtil.getDimensionLevel(dim, this.data,
                  { aggregations: 'aggregations', records: 'records', children: 'children', level: 'level'});
            dimIndex += dimData.level;
            currentLvl += dimData.level;
            const column = this.extractFromDimension(dimData.dimension, dimIndex, currentLvl);
            this.rowDimensionData.push({
                column,
                dimension: dimData.dimension,
                prevDimensions: [...prev]
            });
            prev.push(dimData.dimension);
        }
    }

    protected extractFromDimension(dim: IPivotDimension, index: number = 0, lvl = 0) {
        const field = dim.memberName;
        const header = this.data[field];
        const col = this._createColComponent(field, header, index, dim, lvl);
        return col;
    }

    protected _createColComponent(field: string, header: string, index: number = 0, dim: IPivotDimension, lvl = 0) {
        const factoryColumn = this.resolver.resolveComponentFactory(IgxColumnComponent);
        const ref = this.viewRef.createComponent(factoryColumn, null, this.viewRef.injector);
        ref.instance.field = field;
        ref.instance.header = header;
        ref.instance.width = MINIMUM_COLUMN_WIDTH + 'px';
        (ref as any).instance._vIndex = this.grid.columns.length + index + this.index * this.grid.pivotConfiguration.rows.length;
        if (dim.childLevel && lvl >= PivotUtil.getTotalLvl(this.data)) {
            ref.instance.headerTemplate = this.headerTemplate;
        } else if (lvl < PivotUtil.getTotalLvl(this.data)) {
            ref.instance.headerTemplate = this.headerTemplateGray;
        }
        return ref.instance;
    }
}
