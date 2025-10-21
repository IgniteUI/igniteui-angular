import { NgModule } from '@angular/core';
import { IgxRadioGroupDirective } from './radio-group.directive';
import { IgxRadioComponent } from 'igniteui-angular/radio';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgxRadioGroupDirective, IgxRadioComponent],
    exports: [IgxRadioGroupDirective, IgxRadioComponent]
})
export class IgxRadioModule {}
