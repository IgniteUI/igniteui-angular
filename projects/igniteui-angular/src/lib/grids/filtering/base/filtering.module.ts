import { NgModule } from '@angular/core';
import { IgxGridFilteringCellComponent } from './grid-filtering-cell.component';
import { IgxGridFilteringRowComponent } from './grid-filtering-row.component';
import { IgxGridSharedModules } from '../../common/shared.module';
import { IgxGridPipesModule } from '../../common/grid-pipes.module';


@NgModule({
    declarations: [
        IgxGridFilteringCellComponent,
        IgxGridFilteringRowComponent
    ],
    imports: [
        IgxGridSharedModules,
        IgxGridPipesModule
    ],
    exports: [
        IgxGridFilteringCellComponent,
        IgxGridFilteringRowComponent
    ]
})
export class IgxGridFilteringModule {}
