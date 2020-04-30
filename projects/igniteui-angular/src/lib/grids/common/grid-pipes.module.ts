import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    IgxGridFilterConditionPipe,
    IgxGridTransactionPipe,
    IgxGridNotGroupedPipe,
    IgxGridTopLevelColumns,
    IgxGridCellStylesPipe,
    IgxGridCellStyleClassesPipe,
    IgxGridPaginatorOptionsPipe,
    IgxHasVisibleColumnsPipe,
    IgxDatePipeComponent,
    IgxDecimalPipeComponent,
    IgxGridRowPinningPipe
} from './pipes';

@NgModule({
    declarations: [
        IgxDatePipeComponent,
        IgxDecimalPipeComponent,
        IgxGridFilterConditionPipe,
        IgxGridTransactionPipe,
        IgxGridNotGroupedPipe,
        IgxGridTopLevelColumns,
        IgxGridCellStylesPipe,
        IgxGridCellStyleClassesPipe,
        IgxGridPaginatorOptionsPipe,
        IgxHasVisibleColumnsPipe,
        IgxGridRowPinningPipe
    ],
    exports: [
        IgxDatePipeComponent,
        IgxDecimalPipeComponent,
        IgxGridFilterConditionPipe,
        IgxGridTransactionPipe,
        IgxGridNotGroupedPipe,
        IgxGridTopLevelColumns,
        IgxGridCellStylesPipe,
        IgxGridCellStyleClassesPipe,
        IgxGridPaginatorOptionsPipe,
        IgxHasVisibleColumnsPipe,
        IgxGridRowPinningPipe
    ],
    imports: [
        CommonModule
    ]
  })
export class IgxGridPipesModule { }
