import { NgModule } from '@angular/core';
import { IGX_NAVBAR_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_NAVBAR_DIRECTIVES
    ],
    exports: [
        ...IGX_NAVBAR_DIRECTIVES
    ]
})

export class IgxNavbarModule {}
