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
    /**
     * @hidden
     */
    @Input()
    @HostBinding('attr.aria-selected')
    public get selected(): boolean {
        let isSelected = false;
        let prevDims = [];
        for (let rowDim of this.grid.rowDimensions) {
            const dimData = PivotUtil.getDimensionLevel(rowDim, this.data, this.grid.pivotKeys);
            const key = PivotUtil.getRecordKey(this.data, dimData.dimension, prevDims, this.grid.pivotKeys);
            if (this.selectionService.isPivotRowSelected(key)) {
                isSelected = true;
            }
            prevDims.push(dimData.dimension);
        }
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
