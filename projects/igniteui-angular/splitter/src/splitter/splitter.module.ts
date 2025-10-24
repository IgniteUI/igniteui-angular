import { NgModule } from '@angular/core';
import { IGX_SPLITTER_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_SPLITTER_DIRECTIVES
    ],
    exports: [
        ...IGX_SPLITTER_DIRECTIVES
    ]
})
export class IgxSplitterModule { }
