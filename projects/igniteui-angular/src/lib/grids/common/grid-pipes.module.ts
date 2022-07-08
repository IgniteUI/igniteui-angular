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
    IgxGridRowPinningPipe,
    IgxGridDataMapperPipe,
    IgxStringReplacePipe,
    IgxGridTransactionStatePipe,
    IgxGridTransactionInvalidStatePipe,
    IgxColumnFormatterPipe,
    IgxSummaryFormatterPipe,
    IgxGridAddRowPipe,
    IgxGridRowClassesPipe,
    IgxGridRowStylesPipe,
} from './pipes';
export * from './pipes';

@NgModule({
    declarations: [
        IgxGridFilterConditionPipe,
        IgxGridTransactionPipe,
        IgxGridNotGroupedPipe,
        IgxGridTopLevelColumns,
        IgxGridCellStylesPipe,
        IgxGridCellStyleClassesPipe,
        IgxGridPaginatorOptionsPipe,
        IgxHasVisibleColumnsPipe,
        IgxGridRowPinningPipe,
        IgxGridDataMapperPipe,
        IgxStringReplacePipe,
        IgxGridTransactionStatePipe,
        IgxGridTransactionInvalidStatePipe,
        IgxGridAddRowPipe,
        IgxColumnFormatterPipe,
        IgxSummaryFormatterPipe,
        IgxGridRowClassesPipe,
        IgxGridRowStylesPipe
    ],
    exports: [
        IgxGridFilterConditionPipe,
        IgxGridTransactionPipe,
        IgxGridNotGroupedPipe,
        IgxGridTopLevelColumns,
        IgxGridCellStylesPipe,
        IgxGridCellStyleClassesPipe,
        IgxGridPaginatorOptionsPipe,
        IgxHasVisibleColumnsPipe,
        IgxGridRowPinningPipe,
        IgxGridDataMapperPipe,
        IgxStringReplacePipe,
        IgxGridTransactionStatePipe,
        IgxGridTransactionInvalidStatePipe,
        IgxGridAddRowPipe,
        IgxColumnFormatterPipe,
        IgxSummaryFormatterPipe,
        IgxGridRowClassesPipe,
        IgxGridRowStylesPipe
    ],
    imports: [
        CommonModule
    ]
  })
export class IgxGridPipesModule { }
