import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    Inject,
    Input,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { IgxColumnGroupComponent } from '../columns/column-group.component';
import { IgxColumnLayoutComponent } from '../columns/column-layout.component';
import { IgxColumnComponent } from '../columns/column.component';
import { IGX_GRID_BASE, PivotGridType } from '../common/grid.interface';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
import { IgxRowDirective } from '../row.directive';
import { IPivotDimension, IPivotDimensionData } from './pivot-grid.interface';
import { PivotUtil } from './pivot-util';

/**
 *
 * For all intents & purposes treat this component as what a <thead> usually is in the default <table> element.
 *
 * This container holds the pivot grid header elements and their behavior/interactions.
 *
 * @hidden @internal
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-row-dimension-content',
    templateUrl: './pivot-row-dimension-content.component.html'
})
export class IgxPivotRowDimensionContentComponent extends IgxGridHeaderRowComponent {
    /**
     * @hidden
     * @internal
     */
    @Input()
    public rowIndex: number;

    @Input()
    public rowData: any;

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

    constructor(
        @Inject(IGX_GRID_BASE) public grid: PivotGridType,
        protected ref: ElementRef<HTMLElement>,
        protected cdr: ChangeDetectorRef,
        protected resolver: ComponentFactoryResolver,
        protected viewRef: ViewContainerRef
    ) {
        super(ref, cdr);
    }
    protected rowDimensionData: IPivotDimensionData[] = [];

    public get rowDimension() {
        return this.rowDimensionData?.filter(x => !x.isChild).map(x => x.column);
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
            this.viewRef.clear();
        }
        if (changes.pivotRowWidths && this.rowDimensionData) {
            for (const dim of rowDimConfig) {
                const dimData = PivotUtil.getDimensionLevel(dim, this.rowData, this.grid.pivotKeys);
                const data = this.rowDimensionData.find(x => x.dimension.memberName === dimData.dimension.memberName);
                data.column.width = this.grid.resolveRowDimensionWidth(dim) + 'px';
            }
        }
    }


    /**
     * @hidden
     * @internal
     */
    public getRowDimensionKey(col: IgxColumnComponent) {
        const dimData = this.rowDimensionData.find(x => x.column.field === col.field);
        const key = PivotUtil.getRecordKey(this.rowData, dimData.dimension, dimData.prevDimensions, this.grid.pivotKeys);
        return key;
    }

    public getExpandState(col: IgxColumnComponent) {
        return this.grid.gridAPI.get_row_expansion_state(this.getRowDimensionKey(col));
    }

    public getLevel(col: IgxColumnComponent) {
        return this.rowData[col.field + this.grid.pivotKeys.rowDimensionSeparator + this.grid.pivotKeys.level];
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
        let prevDim;
        for (const dim of rowDimConfig) {
            const dimData = PivotUtil.getDimensionLevel(dim, this.rowData, this.grid.pivotKeys);
            dimIndex += dimData.level;
            currentLvl += dimData.level;
            const prevChildren = prevDim ? this.rowData[prevDim.memberName + this.grid.pivotKeys.rowDimensionSeparator + this.grid.pivotKeys.children] : []; 
            if (prevChildren && prevChildren.length > 0) {
                const childrenCols = [];
                const layoutCol = this.rowDimensionData.find(x => x.column.columnLayout).column;
                prevChildren.forEach((childData, index) => {
                    const dimData = PivotUtil.getDimensionLevel(dim, childData, this.grid.pivotKeys);
                    dimIndex += dimData.level;
                    currentLvl += dimData.level;
                    const column = this.extractFromDimension(dimData.dimension, childData, [], dimIndex, currentLvl, dim, [...prev]);
                    column.rowStart = index + 1;
                    column.rowEnd = index + 2;
                    column.colStart = 2;
                    childrenCols.push(column);
                    this.rowDimensionData.push({
                        column,
                        dimension: dimData.dimension,
                        prevDimensions: [...prev],
                        isChild: true
                    });
                });
                const all_children = layoutCol.children.toArray().concat(childrenCols);
                layoutCol.children.reset(all_children);
                continue;
            }
            const children = this.rowData[dim.memberName + this.grid.pivotKeys.rowDimensionSeparator + this.grid.pivotKeys.children];
            const column = this.extractFromDimension(dimData.dimension, this.rowData, children, dimIndex, currentLvl, dim, [...prev]);
            this.rowDimensionData.push({
                column,
                dimension: dimData.dimension,
                prevDimensions: [...prev]
            });
            prevDim = dim;
            prev.push(dimData.dimension);
        }
    }

    protected extractFromDimension(dim: IPivotDimension, rowData: any[], children: any[], index: number = 0, lvl = 0, rootDim: IPivotDimension, prevDims) {
        const field = dim.memberName;
        const header = rowData[field];
        let col;
        if (children && children.length > 0) {
            const ref = this.viewRef.createComponent(IgxColumnLayoutComponent);
            col = ref.instance;
            ref.instance.field = 'group';
            const childCol = this._createColComponent(field, header, children, index, dim, lvl, rootDim);
            ref.instance.children.reset([childCol]);
            this.rowDimensionData.push({
                column: childCol,
                dimension: dim,
                prevDimensions: prevDims,
                isChild: true
            });
        } else {
            col = this._createColComponent(field, header, children, index, dim, lvl, rootDim);
        }
        return col;
    }

    protected _createColComponent(field: string, header: string, children: any[],
        index: number = 0,
        dim: IPivotDimension, lvl = 0, rootDim: IPivotDimension) {
        const ref = this.viewRef.createComponent(IgxColumnComponent);
        if (children && children.length > 0) {
            ref.instance.rowStart = 1;
            ref.instance.rowEnd = children.length + 1;
            ref.instance.colStart = 1;
        } else {
            ref.instance.colStart = 2;
            ref.instance.rowStart = 1;
            ref.instance.rowEnd = 2;
        }
        ref.instance.field = field;
        ref.instance.header = header;
        ref.instance.width = this.grid.resolveRowDimensionWidth(rootDim) + 'px';
        (ref as any).instance._vIndex = this.grid.columns.length + index + this.rowIndex * this.grid.pivotConfiguration.rows.length;
        if (dim.childLevel && lvl >= PivotUtil.getTotalLvl(this.rowData, this.grid.pivotKeys)) {
            ref.instance.headerTemplate = this.headerTemplate;
        } else {
            ref.instance.headerTemplate = this.headerTemplateDefault;
        }
        return ref.instance;
    }
}
