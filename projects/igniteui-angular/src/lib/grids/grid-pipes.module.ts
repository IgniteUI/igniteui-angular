import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxDatePipeComponent, IgxDecimalPipeComponent } from './grid.common';
import { IgxGridFilterConditionPipe, IgxGridTransactionPipe } from './grid-common.pipes';

@NgModule({
    declarations: [
        IgxDatePipeComponent,
        IgxDecimalPipeComponent,
        IgxGridFilterConditionPipe,
        IgxGridTransactionPipe
    ],
    exports: [
        IgxDatePipeComponent,
        IgxDecimalPipeComponent,
        IgxGridFilterConditionPipe,
        IgxGridTransactionPipe
    ],
    imports: [
        CommonModule
    ]
  })
export class IgxGridPipesModule { }
