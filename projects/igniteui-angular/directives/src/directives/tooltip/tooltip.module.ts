import { NgModule } from '@angular/core';
import { IGX_TOOLTIP_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
 @NgModule({
    imports: [...IGX_TOOLTIP_DIRECTIVES],
    exports: [...IGX_TOOLTIP_DIRECTIVES]
})
export class IgxTooltipModule { }
