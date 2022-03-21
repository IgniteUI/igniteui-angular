import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IgxGridModule } from '../grid/grid.module';
import { IgxChildGridRowComponent, IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxGridHierarchicalPipe, IgxGridHierarchicalPagingPipe } from './hierarchical-grid.pipes';
import { IgxRowIslandComponent } from './row-island.component';
import { IgxHierarchicalGridCellComponent } from './hierarchical-cell.component';

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxHierarchicalGridComponent,
        IgxHierarchicalRowComponent,
        IgxRowIslandComponent,
        IgxChildGridRowComponent,
        IgxHierarchicalGridCellComponent,
        IgxGridHierarchicalPipe,
        IgxGridHierarchicalPagingPipe
    ],
    exports: [
        IgxGridModule,
        IgxHierarchicalGridComponent,
        IgxHierarchicalRowComponent,
        IgxHierarchicalGridCellComponent,
        IgxRowIslandComponent,
        IgxChildGridRowComponent
    ],
    imports: [
        IgxGridModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgxHierarchicalGridModule {
}
