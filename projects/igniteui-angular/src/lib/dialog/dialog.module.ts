import { NgModule } from '@angular/core';
import { IGX_DIALOG_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_DIALOG_DIRECTIVES
    ],
    exports: [
        ...IGX_DIALOG_DIRECTIVES
    ]
})
export class IgxDialogModule { }
