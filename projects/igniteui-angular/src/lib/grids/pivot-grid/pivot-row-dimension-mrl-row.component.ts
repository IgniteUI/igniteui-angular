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
import { NgFor } from '@angular/common';
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
    imports: [NgFor, IgxPivotRowDimensionContentComponent, IgxPivotGridHorizontalRowCellMerging]
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

    /**
     * @hidden @internal
     */
    @Input()
    public rowIndex: number;

    /**
     * @hidden @internal
     */
    @Input()
    public rowGroup: IPivotGridRecord[];

    /**
     * @hidden @internal
     */
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
                res.push(this.grid.rowDimensionWidth(dim));
            });
            return  res.join(' ');
        }
    }

    public rowDimensionWidthCombined(dims: IPivotDimension[]) {
        let resWidth = 0;
        for (const dim of (dims || [])) {
            const rowDimWidth = this.grid.rowDimensionWidth(dim);
            if (rowDimWidth === 'fit-content') {
                return -1;
            } else {
                resWidth += parseFloat(rowDimWidth);
            }
        }
        return resWidth;
    }
}
