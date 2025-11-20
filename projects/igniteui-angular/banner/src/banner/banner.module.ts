import { NgModule } from '@angular/core';
import { IGX_BANNER_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [...IGX_BANNER_DIRECTIVES],
    exports: [...IGX_BANNER_DIRECTIVES]
})
export class IgxBannerModule { }
