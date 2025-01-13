import { NgModule } from '@angular/core';
import { IgSizeDirective } from './ig-size.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgSizeDirective],
    exports: [IgSizeDirective]
})
export class IgSizeModule {
}
