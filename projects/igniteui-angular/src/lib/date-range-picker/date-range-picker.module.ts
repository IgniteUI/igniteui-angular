import { NgModule } from '@angular/core';
import { IgxDateRangePickerComponent } from './date-range-picker.component';
import {
    IgxDateRangeStartComponent, IgxDateRangeEndComponent,
    IgxDateRangeSeparatorDirective
} from './date-range-picker-inputs.common';
import { IgxLabelDirective } from '../directives/label/label.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxHintDirective } from '../directives/hint/hint.directive';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        IgxDateRangePickerComponent,
        IgxDateRangeStartComponent,
        IgxDateRangeEndComponent,
        IgxDateRangeSeparatorDirective,
        IgxLabelDirective,
        IgxPrefixDirective,
        IgxSuffixDirective,
        IgxHintDirective
    ],
    exports: [
        IgxDateRangePickerComponent,
        IgxDateRangeStartComponent,
        IgxDateRangeEndComponent,
        IgxDateRangeSeparatorDirective,
        IgxLabelDirective,
        IgxPrefixDirective,
        IgxSuffixDirective,
        IgxHintDirective
    ]
})
export class IgxDateRangePickerModule { }
