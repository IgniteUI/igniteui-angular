import { NgModule } from '@angular/core';
import { IgxCarouselComponent } from './carousel.component';
import { IgxSlideComponent } from './slide.component';
import { IgxCarouselIndicatorDirective, IgxCarouselNextButtonDirective, IgxCarouselPrevButtonDirective } from './carousel.directives';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        IgxCarouselComponent,
        IgxSlideComponent,
        IgxCarouselIndicatorDirective,
        IgxCarouselNextButtonDirective,
        IgxCarouselPrevButtonDirective
    ],
    exports: [
        IgxCarouselComponent,
        IgxSlideComponent,
        IgxCarouselIndicatorDirective,
        IgxCarouselNextButtonDirective,
        IgxCarouselPrevButtonDirective
    ]
})
export class IgxCarouselModule {
}
