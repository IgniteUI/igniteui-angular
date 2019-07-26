import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxDatePipeComponent, IgxDecimalPipeComponent } from './grid.common';
import {
    IgxGridFilterConditionPipe,
    IgxGridTransactionPipe,
    IgxGridNotGroupedPipe,
    IgxGridTopLevelColumns,
    IgxGridCellStylesPipe,
    IgxGridPaginatorOptionsPipe,
    IgxHasVisibleColumnsPipe
} from './grid-common.pipes';

@NgModule({
    declarations: [
        IgxDatePipeComponent,
        IgxDecimalPipeComponent,
        IgxGridFilterConditionPipe,
        IgxGridTransactionPipe,
        IgxGridNotGroupedPipe,
        IgxGridTopLevelColumns,
        IgxGridCellStylesPipe,
        IgxGridPaginatorOptionsPipe,
        IgxHasVisibleColumnsPipe
    ],
    exports: [
        IgxDatePipeComponent,
        IgxDecimalPipeComponent,
        IgxGridFilterConditionPipe,
        IgxGridTransactionPipe,
        IgxGridNotGroupedPipe,
        IgxGridTopLevelColumns,
        IgxGridCellStylesPipe,
        IgxGridPaginatorOptionsPipe,
        IgxHasVisibleColumnsPipe
    ],
    imports: [
        CommonModule
    ]
  })
export class IgxGridPipesModule { }
