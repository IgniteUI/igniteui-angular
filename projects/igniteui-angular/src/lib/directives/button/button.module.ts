import { NgModule } from '@angular/core';
import { IgxButtonDirective } from './button.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgxButtonDirective],
    exports: [IgxButtonDirective]
})
export class IgxButtonModule {}
