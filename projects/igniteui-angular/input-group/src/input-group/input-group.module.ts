import { NgModule } from '@angular/core';
import { IGX_INPUT_GROUP_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_INPUT_GROUP_DIRECTIVES
    ],
    exports: [
        ...IGX_INPUT_GROUP_DIRECTIVES
    ]
})

export class IgxInputGroupModule {}
