import { NgModule } from '@angular/core';
import { IgxButtonDirective } from './button.directive';
import { IgxIconButtonDirective } from './icon-button.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgxButtonDirective, IgxIconButtonDirective],
    exports: [IgxButtonDirective, IgxIconButtonDirective]
})
export class IgxButtonModule {}
