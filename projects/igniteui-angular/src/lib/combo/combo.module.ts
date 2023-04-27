import { NgModule } from '@angular/core';
import { IGX_COMBO_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_COMBO_DIRECTIVES
    ],
    exports: [
        ...IGX_COMBO_DIRECTIVES
    ]
})
export class IgxComboModule { }
