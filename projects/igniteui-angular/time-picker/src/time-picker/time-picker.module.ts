import { NgModule } from '@angular/core';
import { IGX_TIME_PICKER_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_TIME_PICKER_DIRECTIVES
    ],
    exports: [
        ...IGX_TIME_PICKER_DIRECTIVES
    ]
})
export class IgxTimePickerModule { }
