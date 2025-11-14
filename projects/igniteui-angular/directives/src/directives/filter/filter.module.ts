import { NgModule } from '@angular/core';
import { IgxFilterDirective, IgxFilterPipe } from './filter.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgxFilterDirective, IgxFilterPipe],
    exports: [IgxFilterDirective, IgxFilterPipe]
})
export class IgxFilterModule {
}
