import { NgModule } from '@angular/core';
import { IGX_GRID_COLUMN_DIRECTIVES, IGX_GRID_VALIDATION_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_GRID_VALIDATION_DIRECTIVES,
        ...IGX_GRID_COLUMN_DIRECTIVES
    ],
    exports: [
        ...IGX_GRID_VALIDATION_DIRECTIVES,
        ...IGX_GRID_COLUMN_DIRECTIVES
    ]
})
export class IgxGridColumnModule { }
