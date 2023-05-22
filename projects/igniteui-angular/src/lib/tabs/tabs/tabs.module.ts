import { NgModule } from '@angular/core';
import { IGX_TABS_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_TABS_DIRECTIVES
    ],
    exports: [
        ...IGX_TABS_DIRECTIVES
    ]
})
export class IgxTabsModule { }
