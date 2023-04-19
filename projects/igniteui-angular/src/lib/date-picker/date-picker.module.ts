import { NgModule } from '@angular/core';
import { IgxDatePickerComponent } from './date-picker.component';
import { IgxPickerActionsDirective, IgxPickerClearComponent, IgxPickerToggleComponent } from '../date-common/picker-icons.common';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        IgxDatePickerComponent,
        IgxPickerToggleComponent,
        IgxPickerClearComponent,
        IgxPickerActionsDirective,
        IgxLabelDirective,
        IgxPrefixDirective,
        IgxSuffixDirective
    ],
    exports: [
        IgxDatePickerComponent,
        IgxPickerToggleComponent,
        IgxPickerClearComponent,
        IgxPickerActionsDirective,
        IgxLabelDirective,
        IgxPrefixDirective,
        IgxSuffixDirective
    ]
})
export class IgxDatePickerModule { }
