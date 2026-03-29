import { NgModule } from '@angular/core';
import { IGX_LIST_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_LIST_DIRECTIVES
    ],
    exports: [
        ...IGX_LIST_DIRECTIVES
    ]
})

export class IgxListModule {}
