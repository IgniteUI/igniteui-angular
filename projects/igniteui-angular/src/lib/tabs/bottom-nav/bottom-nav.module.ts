import { NgModule } from '@angular/core';
import { IGX_BOTTOM_NAV_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_BOTTOM_NAV_DIRECTIVES
    ],
    exports: [
        ...IGX_BOTTOM_NAV_DIRECTIVES
    ]
})
export class IgxBottomNavModule { }
