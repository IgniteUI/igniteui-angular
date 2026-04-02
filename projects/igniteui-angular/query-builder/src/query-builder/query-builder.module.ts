import { NgModule } from '@angular/core';
import { IGX_QUERY_BUILDER_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_QUERY_BUILDER_DIRECTIVES
    ],
    exports: [
        ...IGX_QUERY_BUILDER_DIRECTIVES
    ]
})
export class IgxQueryBuilderModule { }
