import { NgModule } from '@angular/core';
import { IGX_ACCORDION_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_ACCORDION_DIRECTIVES
    ],
    exports: [
        ...IGX_ACCORDION_DIRECTIVES
    ]
})
export class IgxAccordionModule {
}
