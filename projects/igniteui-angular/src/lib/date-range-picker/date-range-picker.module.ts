import { NgModule } from '@angular/core';
import { IGX_DATE_RANGE_PICKER_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_DATE_RANGE_PICKER_DIRECTIVES
    ],
    exports: [
        ...IGX_DATE_RANGE_PICKER_DIRECTIVES
    ]
})
export class IgxDateRangePickerModule { }
