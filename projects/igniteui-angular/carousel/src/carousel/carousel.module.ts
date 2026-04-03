import { NgModule } from '@angular/core';
import { IGX_CAROUSEL_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_CAROUSEL_DIRECTIVES
    ],
    exports: [
        ...IGX_CAROUSEL_DIRECTIVES
    ]
})
export class IgxCarouselModule {
}
