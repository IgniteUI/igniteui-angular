import { NgModule } from '@angular/core';
import { IgxToggleActionDirective, IgxToggleDirective } from './toggle.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgxToggleDirective, IgxToggleActionDirective],
    exports: [IgxToggleDirective, IgxToggleActionDirective]
})
export class IgxToggleModule { }
