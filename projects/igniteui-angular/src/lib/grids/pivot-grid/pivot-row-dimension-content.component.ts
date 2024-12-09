import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    createComponent,
    ElementRef,
    EnvironmentInjector,
    HostBinding,
    Inject,
    Injector,
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
import { IgxHeaderGroupWidthPipe, IgxHeaderGroupStylePipe } from '../headers/pipes';
import { IgxIconComponent } from '../../icon/icon.component';
import { NgClass, NgStyle } from '@angular/common';
import { IMultiRowLayoutNode } from '../common/types';

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
    templateUrl: './pivot-row-dimension-content.component.html',
    imports: [IgxPivotRowDimensionHeaderGroupComponent, NgClass, NgStyle, IgxIconComponent, IgxHeaderGroupWidthPipe, IgxHeaderGroupStylePipe]
})
export class IgxPivotRowDimensionContentComponent extends IgxGridHeaderRowComponent implements OnChanges {
    @HostBinding('style.grid-row-start')
    public get rowStart(): string {
        return this.layout ? `${this.layout.rowStart}` : "";
    }

    @HostBinding('style.grid-row-end')
    public get rowsEnd(): string {
        return this.layout ? `${this.layout.rowEnd}` : "";
    }

    @HostBinding('style.grid-column-start')
    public get colStart(): string {
        return this.layout ? `${this.layout.colStart}` : "";
    }

    @HostBinding('style.grid-column-end')
    public get colEnd(): string {
        return this.layout ? `${this.layout.colEnd}` : "";
    }

    /**
     * @hidden
     * @internal
     */
    @Input()
    public rowIndex: number;

    /**
     * @hidden
     * @internal
     */
    @Input()
    public colIndex: number;

    @Input()
    public layout: IMultiRowLayoutNode;

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
        @Inject(IGX_GRID_BASE) public override grid: PivotGridType,
        ref: ElementRef<HTMLElement>,
        protected injector: Injector,
        protected envInjector: EnvironmentInjector,
        cdr: ChangeDetectorRef,
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
        this.grid.toggleRow(this.getRowDimensionKey());
        this.grid.navigation.onRowToggle(this.getExpandState(), this.dimension, this.rowData, this.layout);
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
        return this.grid.hasHorizontalLayout ? 0 : this.dimension.level;
    }

    protected getHeaderWidthFromDimension() {
        if (this.grid.hasHorizontalLayout) {
            return this.width === -1 ? 'fit-content' : this.width;
        }
        return this.grid.rowDimensionWidth(this.rootDimension);
    }

    protected extractFromDimensions() {
        if (this.dimension && this.rowData) {
            const col = this.extractFromDimension(this.dimension, this.rowData);
            const prevDims = [];
            this.rowDimensionData = {
                column: col,
                dimension: this.dimension,
                prevDimensions: prevDims
            };
        }
    }

    protected extractFromDimension(dim: IPivotDimension, rowData: IPivotGridGroupRecord) {
        const field = dim.memberName;
        const header = rowData?.dimensionValues.get(field);
        const col = this._createColComponent(field, header, dim);
        return col;
    }

    protected _createColComponent(field: string, header: string, dim: IPivotDimension) {
        const ref = createComponent(IgxColumnComponent, { environmentInjector: this.envInjector, elementInjector: this.injector});
        ref.instance.field = field;
        ref.instance.header = header;
        ref.instance.width = this.grid.rowDimensionWidthToPixels(this.rootDimension) + 'px';
        ref.instance.resizable = this.grid.rowDimensionResizing;
        (ref as any).instance._vIndex = this.grid.columns.length + this.rowIndex + this.rowIndex * this.grid.pivotConfiguration.rows.length;


        if (header && dim.childLevel && (!this.rowData.totalRecordDimensionName || this.rowData.totalRecordDimensionName !== dim.memberName)) {
            ref.instance.headerTemplate = this.headerTemplate;
        } else {
            ref.instance.headerTemplate = this.headerTemplateDefault;
        }
        return ref.instance;
    }
}
