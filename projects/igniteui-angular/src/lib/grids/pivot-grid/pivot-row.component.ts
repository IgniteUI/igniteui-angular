import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    forwardRef,
    HostBinding,
    Input,
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

    @Input()
    public pivotRowWidths: number;

    /**
     * @hidden @internal
     */
    @ViewChild('headerTemplate', { read: TemplateRef, static: true })
    public headerTemplate: TemplateRef<any>;

    /**
     * @hidden @internal
     */
    @ViewChild('headerDefaultTemplate', { read: TemplateRef, static: true })
    public headerTemplateDefault: TemplateRef<any>;

    public rowDimensionData: IPivotDimensionData[] = [];

    public get rowDimension() {
        return this.rowDimensionData?.map(x => x.column);
    }

    /**
     * @hidden
     */
    @Input()
    @HostBinding('attr.aria-selected')
    public get selected(): boolean {
        let isSelected = false;
        this.rowDimensionData.forEach(x => {
            const key = this.getRowDimensionKey(x.column as IgxColumnComponent);
            if (this.selectionService.isPivotRowSelected(key)) {
                isSelected = true;
            }
        });
        return isSelected;
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
            const dimData = this.rowDimensionData.find(x => x.column.field === col.field);
            const key =  PivotUtil.getRecordKey(this.data, dimData.dimension, dimData.prevDimensions, this.grid.pivotKeys);
            return key;
    }

    public getExpandState(col: IgxColumnComponent) {
        return this.grid.gridAPI.get_row_expansion_state(this.getRowDimensionKey(col));
    }

    public getLevel(col: IgxColumnComponent) {
        return this.data[col.field + '_level'];
    }


    /**
     * @hidden
     * @internal
     */
    public ngOnChanges(changes: SimpleChanges) {
        const rowDimConfig = this.grid.rowDimensions;
        if (changes.data || rowDimConfig.length !== this.rowDimensionData.length) {
            // generate new rowDimension on row data change
            this.rowDimensionData = [];
            this.viewRef.clear();
            this.extractFromDimensions(rowDimConfig, 0);
        }
        if (changes.pivotRowWidths && this.rowDimensionData) {
            for (const dim of rowDimConfig) {
                const dimData = PivotUtil.getDimensionLevel(dim, this.data, this.grid.pivotKeys);
                const data = this.rowDimensionData.find(x => x.dimension.memberName === dimData.dimension.memberName);
                data.column.width = this.grid.resolveRowDimensionWidth(dim) + 'px';
            }
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

    /**
     * @hidden @internal
     */
    public selectPivotRow(col: any, event?: any) {
        if (this.grid.rowSelection === 'none') {
            return;
        }
        event?.stopPropagation();
        const key = this.getRowDimensionKey(col);
        if (this.grid.selectionService.isRowSelected(key)) {
            this.grid.selectionService.deselectRow(key, event);
        } else {
            this.grid.selectionService.selectRowById(key, true, event);
        }
    }

    protected extractFromDimensions(rowDimConfig: IPivotDimension[], level: number) {
        let dimIndex = 0;
        let currentLvl = 0;
        currentLvl += level;
        const prev = [];
        for (const dim of rowDimConfig) {
            const dimData = PivotUtil.getDimensionLevel(dim, this.data, this.grid.pivotKeys);
            dimIndex += dimData.level;
            currentLvl += dimData.level;
            const column = this.extractFromDimension(dimData.dimension, dimIndex, currentLvl, dim);
            this.rowDimensionData.push({
                column,
                dimension: dimData.dimension,
                prevDimensions: [...prev]
            });
            prev.push(dimData.dimension);
        }
    }

    protected extractFromDimension(dim: IPivotDimension, index: number = 0, lvl = 0, rootDim: IPivotDimension) {
        const field = dim.memberName;
        const header = this.data[field];
        const col = this._createColComponent(field, header, index, dim, lvl, rootDim);
        return col;
    }

    protected _createColComponent(field: string, header: string, index: number = 0,
         dim: IPivotDimension, lvl = 0, rootDim: IPivotDimension) {
        const ref = this.viewRef.createComponent(IgxColumnComponent);
        ref.instance.field = field;
        ref.instance.header = header;
        ref.instance.width = this.grid.resolveRowDimensionWidth(rootDim) + 'px';
        (ref as any).instance._vIndex = this.grid.columns.length + index + this.index * this.grid.pivotConfiguration.rows.length;
        if (dim.childLevel && lvl >= PivotUtil.getTotalLvl(this.data, this.grid.pivotKeys)) {
            ref.instance.headerTemplate = this.headerTemplate;
        } else {
            ref.instance.headerTemplate = this.headerTemplateDefault;
        }
        return ref.instance;
    }
}
