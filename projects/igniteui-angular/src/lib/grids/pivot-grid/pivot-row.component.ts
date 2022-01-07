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
export class IgxPivotRowComponent extends IgxRowDirective {

    @Input()
    public pivotRowWidths: number;
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

    public getCellClass(col: IgxColumnComponent) {
        const configuration = this.grid.pivotConfiguration;
        if (configuration.values.length === 1) {
            return configuration.values[0].styles;
        }
        const colName = col.field.split(this.grid.pivotKeys.columnDimensionSeparator);
        const measureName = colName[colName.length - 1];
        return this.grid.pivotConfiguration.values.find(v => v.member === measureName)?.styles;
    }

    public isCellActive(visibleColumnIndex) {
        const nav = this.grid.navigation
        const node = nav.activeNode;
        return node && Object.keys(node).length !== 0 ?
            !nav.isRowHeaderActive &&
            super.isCellActive(visibleColumnIndex) :
            false;
    }
}
