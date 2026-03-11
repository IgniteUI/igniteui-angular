import { NgModule } from '@angular/core';
import { IGX_TREE_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_TREE_DIRECTIVES
    ],
    exports: [
        ...IGX_TREE_DIRECTIVES
    ]
})
export class IgxTreeModule { }
