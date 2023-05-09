import { NgModule } from '@angular/core';
import { IGX_CARD_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_CARD_DIRECTIVES
    ],
    exports: [
        ...IGX_CARD_DIRECTIVES
    ]
})
export class IgxCardModule { }
