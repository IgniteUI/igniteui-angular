import { NgModule } from '@angular/core';
import { IgxSummaryCellComponent } from './summary-cell.component';
import { IgxSummaryRowComponent } from './summary-row.component';
import { IgxSummaryDataPipe } from './grid-root-summary.pipe';
import { IgxGridSharedModules } from '../common/shared.module';



export { IgxSummaryCellComponent } from './summary-cell.component';
export { IgxSummaryRowComponent } from './summary-row.component';
export { IgxSummaryDataPipe } from './grid-root-summary.pipe';

@NgModule({
    imports: [
    IgxGridSharedModules,
    IgxSummaryCellComponent,
    IgxSummaryRowComponent,
    IgxSummaryDataPipe
],
    exports: [
        IgxSummaryCellComponent,
        IgxSummaryRowComponent,
        IgxSummaryDataPipe
    ]
})
export class IgxGridSummaryModule {}
