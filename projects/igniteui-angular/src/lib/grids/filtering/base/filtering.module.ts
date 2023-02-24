import { NgModule } from '@angular/core';
import { IgxGridFilteringCellComponent } from './grid-filtering-cell.component';
import { IgxGridFilteringRowComponent } from './grid-filtering-row.component';
import { IgxGridSharedModules } from '../../common/shared.module';



export { IgxGridFilteringCellComponent as θIgxGridFilteringCellComponent } from './grid-filtering-cell.component';
export { IgxGridFilteringRowComponent as θIgxGridFilteringRowComponent } from './grid-filtering-row.component';

@NgModule({
    imports: [
    IgxGridSharedModules,
    IgxGridFilteringCellComponent,
    IgxGridFilteringRowComponent
],
    exports: [
        IgxGridFilteringCellComponent,
        IgxGridFilteringRowComponent
    ]
})
export class IgxGridFilteringModule { }
