import { NgModule } from '@angular/core';
import { IGX_NAVIGATION_DRAWER_DIRECTIVES } from './public_api';

/**
 * @hidden
 */
@NgModule({
    imports: [
        ...IGX_NAVIGATION_DRAWER_DIRECTIVES
    ],
    exports: [
        ...IGX_NAVIGATION_DRAWER_DIRECTIVES
    ]
})
export class IgxNavigationDrawerModule {}
