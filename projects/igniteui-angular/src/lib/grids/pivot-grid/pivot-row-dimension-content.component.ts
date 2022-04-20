import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    Inject,
    Input,
    OnChanges,
    QueryList,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from '@angular/core';
import { IgxColumnComponent } from '../columns/column.component';
import { IGX_GRID_BASE, PivotGridType } from '../common/grid.interface';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
import { IPivotDimension, IPivotDimensionData, IPivotGridGroupRecord } from './pivot-grid.interface';
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
export class IgxPivotRowDimensionContentComponent extends IgxGridHeaderRowComponent implements OnChanges {
    /**
     * @hidden
     * @internal
     */
    @Input()
    public rowIndex: number;

    @Input()
    public dimension: IPivotDimension;

    @Input()
    public rootDimension: IPivotDimension;

    @Input()
    public rowData: IPivotGridGroupRecord;

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
        if (changes.rowData) {
            // generate new rowDimension on row data change
            this.rowDimensionData = null;
            this.viewRef.clear();
            this.extractFromDimensions();
            this.viewRef.clear();
        }
        if (changes.width && this.rowDimensionData) {
            const data = this.rowDimensionData;
            data.column.width = this.grid.rowDimensionWidthToPixels(this.rootDimension) + 'px';
        }
    }

    /**
    * @hidden
    * @internal
    */
    public toggleRowDimension(event) {
        this.grid.toggleRow(this.getRowDimensionKey())
        event?.stopPropagation();
    }


    /**
     * @hidden
     * @internal
     */
    public getRowDimensionKey() {
        const dimData = this.rowDimensionData;
        const key = PivotUtil.getRecordKey(this.rowData, dimData.dimension);
        return key;
    }

    public getExpandState() {
        return this.grid.gridAPI.get_row_expansion_state(this.getRowDimensionKey());
    }

    public getLevel() {
        return this.dimension.level;
    }

    protected extractFromDimensions() {
        const col = this.extractFromDimension(this.dimension, this.rowData);
        const prevDims = [];
        this.rowDimensionData = {
            column: col,
            dimension: this.dimension,
            prevDimensions: prevDims
        };
    }

    protected extractFromDimension(dim: IPivotDimension, rowData: IPivotGridGroupRecord) {
        const field = dim.memberName;
        const header = rowData.dimensionValues.get(field);
        const col = this._createColComponent(field, header, dim);
        return col;
    }

    protected _createColComponent(field: string, header: string, dim: IPivotDimension) {
        const ref = this.viewRef.createComponent(IgxColumnComponent);
        ref.instance.field = field;
        ref.instance.header = header;
        ref.instance.width = this.grid.rowDimensionWidthToPixels(this.rootDimension) + 'px';
        ref.instance.resizable = this.grid.rowDimensionResizing;
        (ref as any).instance._vIndex = this.grid.columns.length + this.rowIndex + this.rowIndex * this.grid.pivotConfiguration.rows.length;
        if (dim.childLevel) {
            ref.instance.headerTemplate = this.headerTemplate;
        } else {
            ref.instance.headerTemplate = this.headerTemplateDefault;
        }
        return ref.instance;
    }
}
