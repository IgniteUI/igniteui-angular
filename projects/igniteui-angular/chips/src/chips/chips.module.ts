import { NgModule } from '@angular/core';
import { IGX_CHIPS_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    exports: [
        ...IGX_CHIPS_DIRECTIVES
    ],
    imports: [
        ...IGX_CHIPS_DIRECTIVES
    ]
})
export class IgxChipsModule { }
