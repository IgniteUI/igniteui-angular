import { NgModule } from '@angular/core';
import { IGX_STEPPER_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_STEPPER_DIRECTIVES
    ],
    exports: [
        ...IGX_STEPPER_DIRECTIVES
    ]
})
export class IgxStepperModule { }
