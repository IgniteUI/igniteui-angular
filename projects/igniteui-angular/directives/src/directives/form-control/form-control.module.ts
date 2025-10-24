import { NgModule } from '@angular/core';
import { IgcFormControlDirective } from './form-control.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgcFormControlDirective],
    exports: [IgcFormControlDirective]
})
export class IgcFormsModule { }
