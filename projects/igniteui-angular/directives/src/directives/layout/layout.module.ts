import { NgModule } from '@angular/core';
import { IgxFlexDirective, IgxLayoutDirective } from './layout.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgxFlexDirective, IgxLayoutDirective],
    exports: [IgxFlexDirective, IgxLayoutDirective]
})
export class IgxLayoutModule { }
