import { NgModule } from '@angular/core';
import { IGX_BUTTON_GROUP_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [...IGX_BUTTON_GROUP_DIRECTIVES],
    exports: [...IGX_BUTTON_GROUP_DIRECTIVES]
})
export class IgxButtonGroupModule {}
