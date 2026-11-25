import { Component, ChangeDetectionStrategy, forwardRef } from '@angular/core';
import { NgTemplateOutlet, NgStyle, NgClass } from '@angular/common';
import {
    IgxGridCellComponent,
    IgxGridCellStyleClassesPipe,
    IgxGridCellStylesPipe,
    IgxGridDataMapperPipe,
    IgxGridNotGroupedPipe,
    IgxGridTopLevelColumns,
    IgxGridTransactionStatePipe,
    IgxRowDirective,
    IgxRowDragDirective,
    RowType
} from 'igniteui-angular/grids/core';
import { IgxGridExpandableCellComponent } from './expandable-cell.component';
import { IgxGridForOfDirective } from 'igniteui-angular/directives';
import { IgxCheckboxComponent } from 'igniteui-angular/checkbox';
import { ColumnType } from 'igniteui-angular/core';

/* blazorIndirectRender */
/* blazorElement */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-row',
    templateUrl: './grid-row.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxGridRowComponent) }],
    imports: [NgTemplateOutlet, IgxRowDragDirective, IgxGridForOfDirective, NgStyle, IgxCheckboxComponent, IgxGridCellComponent, NgClass, IgxGridExpandableCellComponent, IgxGridNotGroupedPipe, IgxGridTopLevelColumns, IgxGridCellStylesPipe, IgxGridCellStyleClassesPipe, IgxGridDataMapperPipe, IgxGridTransactionStatePipe]
})
export class IgxGridRowComponent extends IgxRowDirective {

    public getContext(col: ColumnType, row: RowType) {
        return {
            $implicit: col,
            row
        };
    }

    public getContextMRL(pinnedCols: ColumnType[], row: RowType) {
        return {
            $implicit: pinnedCols,
            row
        };
    }
}
