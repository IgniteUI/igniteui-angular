import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EnvironmentInjector,
    HostBinding,
    Inject,
    Injector,
    Input,
    QueryList,
    ViewChildren,
    ViewContainerRef
} from '@angular/core';
import { IGX_GRID_BASE, PivotGridType } from '../common/grid.interface';
import { IgxGridHeaderRowComponent } from '../headers/grid-header-row.component';
import { IPivotDimension, IPivotDimensionData, IPivotGridRecord } from './pivot-grid.interface';
import { IgxHeaderGroupWidthPipe, IgxHeaderGroupStylePipe } from '../headers/pipes';
import { IgxIconComponent } from '../../icon/icon.component';
import { NgClass, NgFor, NgStyle } from '@angular/common';
import { IgxPivotRowDimensionContentComponent } from './pivot-row-dimension-content.component';
import { IgxPivotGridHorizontalRowCellMerging } from './pivot-grid.pipes';

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
    selector: 'igx-pivot-row-dimension-mrl-row',
    templateUrl: './pivot-row-dimension-mrl-row.component.html',
    standalone: true,
    imports: [NgClass, NgStyle, NgFor, IgxIconComponent, IgxHeaderGroupWidthPipe, IgxHeaderGroupStylePipe,
        IgxPivotRowDimensionContentComponent, IgxPivotGridHorizontalRowCellMerging]
})
export class IgxPivotRowDimensionMrlRowComponent extends IgxGridHeaderRowComponent {

    @HostBinding('class.igx-grid__tbody-pivot-dimension')
    public pivotDim = true;

    @HostBinding('class.igx-grid__mrl-block')
    public mrlBlock =  true;

    @HostBinding('style.grid-template-rows')
    public get rowsTemplate(): string {
        return this.getRowMRLTemplate(true, this.rowGroup);
    }

    @HostBinding('style.grid-template-columns')
    public get colsTemplate(): string {
        return this.getRowMRLTemplate(false, this.rowGroup);
    }

    @Input()
    public rowIndex: number;

    @Input()
    public rowGroup: IPivotGridRecord[];

    @Input()
    public groupedData: IPivotGridRecord[][];

    /**
     * @hidden @internal
     */
    @ViewChildren(IgxPivotRowDimensionContentComponent)
    public contentCells: QueryList<IgxPivotRowDimensionContentComponent>

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

    protected getRowMRLTemplate(forRows: boolean, rows: IPivotGridRecord[]) {
        if (forRows) {
            return `repeat(${rows.length},1fr)`;
        } else if (this.grid.visibleRowDimensions && this.grid.dimensionDataColumns) {
            const res = [];
            this.grid.visibleRowDimensions.forEach(dim => {
                res.push(this.grid.rowDimensionWidthToPixels(dim) + "px");
            });
            return  res.join(' ');
        }
    }

    public rowDimensionWidthCombined(dims: IPivotDimension[]) {
        let resWidth = 0;
        for (const dim of dims) {
            resWidth += this.grid.rowDimensionWidthToPixels(dim);
        }
        return resWidth;
    }
}
