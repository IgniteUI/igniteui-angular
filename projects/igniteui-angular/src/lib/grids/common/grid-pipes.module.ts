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
    IgxGridAddRowPipe,
    IgxHeaderGroupStylePipe
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
        IgxHeaderGroupStylePipe
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
        IgxHeaderGroupStylePipe
    ],
    imports: [
        CommonModule
    ]
  })
export class IgxGridPipesModule { }
