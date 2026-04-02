import { NgModule } from '@angular/core';
import { IGX_PROGRESS_BAR_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_PROGRESS_BAR_DIRECTIVES
    ],
    exports: [
        ...IGX_PROGRESS_BAR_DIRECTIVES
    ]
})
export class IgxProgressBarModule { }
