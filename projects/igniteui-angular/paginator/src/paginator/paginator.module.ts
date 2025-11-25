import { NgModule } from '@angular/core';
import { IGX_PAGINATOR_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_PAGINATOR_DIRECTIVES
    ],
    exports: [
        ...IGX_PAGINATOR_DIRECTIVES
    ]
})
export class IgxPaginatorModule { }
