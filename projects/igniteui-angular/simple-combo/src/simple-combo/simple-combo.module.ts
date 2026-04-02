import { NgModule } from '@angular/core';
import { IGX_SIMPLE_COMBO_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_SIMPLE_COMBO_DIRECTIVES
    ],
    exports: [
        ...IGX_SIMPLE_COMBO_DIRECTIVES
    ]
})
export class IgxSimpleComboModule { }
