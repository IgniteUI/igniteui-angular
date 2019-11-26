import { NgModule } from '@angular/core';
import { IgxDateRangeComponent } from './igx-date-range.component';
import { IgxCalendarModule } from '../calendar/index';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { CommonModule } from '@angular/common';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxInputGroupModule } from '../input-group/index';
import { IgxIconModule } from '../icon/index';
import {
    IgxDateStartComponent, IgxDateEndComponent,
    IgxDateSingleComponent
} from './igx-date-range-inputs.common';

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxDateRangeComponent,
        IgxDateStartComponent,
        IgxDateEndComponent,
        IgxDateSingleComponent
    ],
    imports: [
        CommonModule,
        IgxIconModule,
        IgxButtonModule,
        IgxToggleModule,
        IgxCalendarModule,
        IgxInputGroupModule,
    ],
    exports: [
        IgxDateRangeComponent,
        IgxDateStartComponent,
        IgxDateEndComponent,
        IgxDateSingleComponent
    ]
})
export class IgxDateRangeModule { }
