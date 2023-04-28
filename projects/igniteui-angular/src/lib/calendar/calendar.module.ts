import { NgModule } from '@angular/core';
import { IGX_CALENDAR_DIRECTIVES } from './public_api';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        ...IGX_CALENDAR_DIRECTIVES
    ],
    exports: [
        ...IGX_CALENDAR_DIRECTIVES
    ]
})
export class IgxCalendarModule { }
