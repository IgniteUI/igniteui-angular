import { Component, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { IgxRowDirective } from '../row.directive';
import { IgxGridNotGroupedPipe, IgxGridTopLevelColumns, IgxGridCellStylesPipe, IgxGridCellStyleClassesPipe, IgxGridDataMapperPipe, IgxGridTransactionStatePipe } from '../common/pipes';
import { IgxGridExpandableCellComponent } from './expandable-cell.component';
import { IgxGridCellComponent } from '../cell.component';
import { IgxCheckboxComponent } from '../../checkbox/checkbox.component';
import { IgxGridForOfDirective } from '../../directives/for-of/for_of.directive';
import { IgxRowDragDirective } from '../row-drag.directive';
import { NgTemplateOutlet, NgIf, NgFor, NgStyle, NgClass } from '@angular/common';

/* blazorIndirectRender */
/* blazorElement */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-row',
    templateUrl: './grid-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxGridRowComponent) }],
    imports: [NgTemplateOutlet, NgIf, IgxRowDragDirective, NgFor, IgxGridForOfDirective, NgStyle, IgxCheckboxComponent, IgxGridCellComponent, NgClass, IgxGridExpandableCellComponent, IgxGridNotGroupedPipe, IgxGridTopLevelColumns, IgxGridCellStylesPipe, IgxGridCellStyleClassesPipe, IgxGridDataMapperPipe, IgxGridTransactionStatePipe]
})
export class IgxGridRowComponent extends IgxRowDirective {

    public getContext(col, row) {
        return {
            $implicit: col,
            row
        };
    }

    public get mrlRightPinnedOffset(): string {
        return !this.grid.isPinningToStart ?
            - this.grid.pinnedWidth - this.grid.headerFeaturesWidth + 'px' :
            null;
    }

    public getContextMRL(pinnedCols, row) {
        return {
            $implicit: pinnedCols,
            row
        };
    }
}
