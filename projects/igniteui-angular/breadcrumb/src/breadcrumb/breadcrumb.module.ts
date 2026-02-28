import { NgModule } from '@angular/core';
import { IGX_BREADCRUMB_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_BREADCRUMB_DIRECTIVES
    ],
    exports: [
        ...IGX_BREADCRUMB_DIRECTIVES
    ]
})
export class IgxBreadcrumbModule { }
