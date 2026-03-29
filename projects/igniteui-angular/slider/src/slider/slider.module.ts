import { NgModule } from '@angular/core';
import { IGX_SLIDER_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_SLIDER_DIRECTIVES
    ],
    exports: [
        ...IGX_SLIDER_DIRECTIVES
    ]
})
export class IgxSliderModule { }
