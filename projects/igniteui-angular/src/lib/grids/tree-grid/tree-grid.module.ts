import { NgModule } from '@angular/core';
import { IgxTreeGridComponent } from './tree-grid.component';
import { IGX_GRID_COMMON_DIRECTIVES } from '../public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        IgxTreeGridComponent,
        ...IGX_GRID_COMMON_DIRECTIVES
    ],
    exports: [
        IgxTreeGridComponent,
        ...IGX_GRID_COMMON_DIRECTIVES
    ]
})
export class IgxTreeGridModule {
}
