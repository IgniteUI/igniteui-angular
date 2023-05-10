import { NgModule } from '@angular/core';
import { IGX_SELECT_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_SELECT_DIRECTIVES
    ],
    exports: [
        ...IGX_SELECT_DIRECTIVES
    ]
})
export class IgxSelectModule { }
