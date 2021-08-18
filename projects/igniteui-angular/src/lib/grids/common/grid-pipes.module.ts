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
    IgxHeaderGroupWidthPipe,
    IgxGridRowClassesPipe,
    IgxGridRowStylesPipe
} from './pipes';

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
        IgxHeaderGroupWidthPipe,
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
        IgxColumnActionEnabledPipe,
        IgxFilterActionColumnsPipe,
        IgxSortActionColumnsPipe,
        IgxGridDataMapperPipe,
        IgxStringReplacePipe,
        IgxGridTransactionStatePipe,
        IgxGridAddRowPipe,
        IgxColumnFormatterPipe,
        IgxSummaryFormatterPipe,
        IgxHeaderGroupWidthPipe,
        IgxGridRowClassesPipe,
        IgxGridRowStylesPipe
    ],
    imports: [
        CommonModule
    ]
  })
export class IgxGridPipesModule { }
