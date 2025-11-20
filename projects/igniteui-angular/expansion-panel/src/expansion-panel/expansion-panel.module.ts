import { NgModule } from '@angular/core';
import { IGX_EXPANSION_PANEL_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_EXPANSION_PANEL_DIRECTIVES
    ],
    exports: [
        ...IGX_EXPANSION_PANEL_DIRECTIVES
    ]
})
export class IgxExpansionPanelModule { }
