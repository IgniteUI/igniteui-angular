import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ContentChildren,
    ElementRef,
    Inject,
    Input,
    QueryList,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from '@angular/core';
import { IgxColumnGroupComponent } from '../columns/column-group.component';
import { IgxColumnLayoutComponent } from '../columns/column-layout.component';
import { IgxColumnComponent } from '../columns/column.component';
import { IGX_GRID_BASE, PivotGridType } from '../common/grid.interface';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
import { IgxRowDirective } from '../row.directive';
import { IPivotDimension, IPivotDimensionData } from './pivot-grid.interface';
import { IgxPivotRowDimensionHeaderGroupComponent } from './pivot-row-dimension-header-group.component';
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
    public dimension: IPivotDimension;

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

    @ViewChildren(IgxPivotRowDimensionHeaderGroupComponent)
    public headerGroups: QueryList<IgxPivotRowDimensionHeaderGroupComponent>

    constructor(
        @Inject(IGX_GRID_BASE) public grid: PivotGridType,
        protected ref: ElementRef<HTMLElement>,
        protected cdr: ChangeDetectorRef,
        protected resolver: ComponentFactoryResolver,
        protected viewRef: ViewContainerRef
    ) {
        super(ref, cdr);
    }

    /**
     * @hidden @internal
     */
    public rowDimensionData: IPivotDimensionData;

    public get rowDimensionColumn() {
        return this.rowDimensionData?.column;
    }

    /**
    * @hidden
    * @internal
    */
    public ngOnChanges(changes: SimpleChanges) {
        const rowDimConfig = this.grid.rowDimensions;
        if (changes.rowData) {
            // generate new rowDimension on row data change
            this.rowDimensionData = null;
            this.viewRef.clear();
            this.extractFromDimensions();
            this.viewRef.clear();
        }
        if (changes.width && this.rowDimensionData) {
            const data = this.rowDimensionData;
            data.column.width = this.grid.rowDimensionWidthToPixels(this.dimension) + 'px';
        }
    }


    /**
     * @hidden
     * @internal
     */
    public getRowDimensionKey(col: IgxColumnComponent) {
        const dimData = this.rowDimensionData;
        const key = PivotUtil.getRecordKey(this.rowData, dimData.dimension, dimData.prevDimensions, this.grid.pivotKeys);
        return key;
    }

    public getExpandState(col: IgxColumnComponent) {
        return this.grid.gridAPI.get_row_expansion_state(this.getRowDimensionKey(col));
    }

    public getLevel(col: IgxColumnComponent) {
        return this.rowData[col.field + this.grid.pivotKeys.rowDimensionSeparator + this.grid.pivotKeys.level];
    }

    public get rowSpan() {
        return this.rowData[this.rowDimensionData.dimension.memberName + this.grid.pivotKeys.rowDimensionSeparator + 'rowSpan'] || 1;
    }

    public get headerHeight() {
        return this.rowSpan * this.grid.rowHeight + (this.rowSpan - 1);
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

    protected extractFromDimensions() {
        const dimData = PivotUtil.getDimensionLevel(this.dimension, this.rowData, this.grid.pivotKeys);
        const prevDims = this.getPrevDims(this.dimension);
        let lvl = 0;
        prevDims.forEach(prev => {
            lvl += prev.level;
        });
        const col = this.extractFromDimension(dimData, this.rowData, lvl);
        this.rowDimensionData = {
            column: col,
            dimension: dimData.dimension,
            prevDimensions: prevDims
        };
    }

    protected getPrevDims(currDim) {
        const ind = this.grid.rowDimensions.indexOf(currDim);
        const prevDims = [];
        for (let i = 0; i < ind; i++) {
            const prevDim = this.grid.rowDimensions[i];
            const dimData = PivotUtil.getDimensionLevel(prevDim, this.rowData, this.grid.pivotKeys);
            prevDims.push(dimData.dimension);
        }
        return prevDims;
    }

    protected extractFromDimension(dimData, rowData: any[], lvl) {
        const field = dimData.dimension.memberName;
        const header = rowData[field];
        const col = this._createColComponent(field, header, dimData.dimension, lvl);
        return col;
    }

    protected _createColComponent(field: string, header: string, dim: IPivotDimension, lvl) {
        const ref = this.viewRef.createComponent(IgxColumnComponent);
        ref.instance.field = field;
        ref.instance.header = header;
        ref.instance.width = this.grid.rowDimensionWidthToPixels(this.dimension) + 'px';
        ref.instance.resizable = this.grid.rowDimensionResizing;
        (ref as any).instance._vIndex = this.grid.columns.length + this.rowIndex + this.rowIndex * this.grid.pivotConfiguration.rows.length;
        if (dim.childLevel && lvl >= PivotUtil.getTotalLvl(this.rowData, this.grid.pivotKeys)) {
            ref.instance.headerTemplate = this.headerTemplate;
        } else {
            ref.instance.headerTemplate = this.headerTemplateDefault;
        }
        return ref.instance;
    }
}
