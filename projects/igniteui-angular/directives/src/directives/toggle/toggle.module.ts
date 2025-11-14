import { NgModule } from '@angular/core';
import { IgxOverlayOutletDirective, IgxToggleActionDirective, IgxToggleDirective } from './toggle.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgxToggleDirective, IgxToggleActionDirective, IgxOverlayOutletDirective],
    exports: [IgxToggleDirective, IgxToggleActionDirective, IgxOverlayOutletDirective]
})
export class IgxToggleModule { }
