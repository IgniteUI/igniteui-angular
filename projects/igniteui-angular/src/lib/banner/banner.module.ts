import { NgModule } from '@angular/core';
import { IgxBannerComponent } from './banner.component';
import { IgxBannerActionsDirective } from './banner.directives';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgxBannerComponent, IgxBannerActionsDirective],
    exports: [IgxBannerComponent, IgxBannerActionsDirective]
})
export class IgxBannerModule { }
