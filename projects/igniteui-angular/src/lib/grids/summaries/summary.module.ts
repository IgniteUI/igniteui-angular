import { NgModule } from '@angular/core';
import { IgxSummaryCellComponent } from './summary-cell.component';
import { IgxSummaryRowComponent } from './summary-row.component';
import { IgxSummaryDataPipe } from './grid-root-summary.pipe';
import { IgxGridSharedModules } from '../common/shared.module';
import { IgxGridPipesModule } from '../common/grid-pipes.module';


export { IgxSummaryCellComponent } from './summary-cell.component';
export { IgxSummaryRowComponent } from './summary-row.component';
export { IgxSummaryDataPipe } from './grid-root-summary.pipe';

@NgModule({
    declarations: [
        IgxSummaryCellComponent,
        IgxSummaryRowComponent,
        IgxSummaryDataPipe
    ],
    imports: [
        IgxGridPipesModule,
        IgxGridSharedModules
    ],
    exports: [
        IgxSummaryCellComponent,
        IgxSummaryRowComponent,
        IgxSummaryDataPipe
    ]
})
export class IgxGridSummaryModule {}
