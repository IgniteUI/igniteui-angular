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
    IgxColumnActionEnabledPipe,
    IgxFilterActionColumnsPipe,
    IgxSortActionColumnsPipe,
    IgxGridDataMapperPipe,
    IgxStringReplacePipe,
    IgxGridTransactionStatePipe,
    IgxColumnFormatterPipe,
    IgxSummaryFormatterPipe,
    IgxGridAddRowPipe,
    IgxHeaderGroupWidthPipe
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
        IgxColumnActionEnabledPipe,
        IgxFilterActionColumnsPipe,
        IgxSortActionColumnsPipe,
        IgxGridDataMapperPipe,
        IgxStringReplacePipe,
        IgxGridTransactionStatePipe,
        IgxGridAddRowPipe,
        IgxColumnFormatterPipe,
        IgxSummaryFormatterPipe,
        IgxHeaderGroupWidthPipe
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
        IgxColumnActionEnabledPipe,
        IgxFilterActionColumnsPipe,
        IgxSortActionColumnsPipe,
        IgxGridDataMapperPipe,
        IgxStringReplacePipe,
        IgxGridTransactionStatePipe,
        IgxGridAddRowPipe,
        IgxColumnFormatterPipe,
        IgxSummaryFormatterPipe,
        IgxHeaderGroupWidthPipe
    ],
    imports: [
        CommonModule
    ]
  })
export class IgxGridPipesModule { }
