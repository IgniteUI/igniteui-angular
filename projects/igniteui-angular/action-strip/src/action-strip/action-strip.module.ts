import { NgModule } from '@angular/core';
import { IGX_ACTION_STRIP_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_ACTION_STRIP_DIRECTIVES
    ],
    exports: [
        ...IGX_ACTION_STRIP_DIRECTIVES
    ],
})
export class IgxActionStripModule { }
