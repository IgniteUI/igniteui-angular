import { NgModule } from '@angular/core';
import { IGX_DROP_DOWN_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_DROP_DOWN_DIRECTIVES
    ],
    exports: [
        ...IGX_DROP_DOWN_DIRECTIVES
    ]
})
export class IgxDropDownModule { }
