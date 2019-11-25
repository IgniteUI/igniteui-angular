import { NgModule } from '@angular/core';
import { IgxDateRangeComponent } from './igx-date-range.component';
import { IgxDateRangeBaseDirective } from './igx-date-range-base.directive';
import { IgxDateRangeStartDirective, IgxDateRangeEndDirective, IgxDateRangeDirective } from './igx-date-range.directives';
import { IgxCalendarModule } from '../calendar/index';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { CommonModule } from '@angular/common';
import { IgxButtonModule } from '../directives/button/button.directive';
import { IgxInputGroupModule } from '../input-group/index';
import { IgxIconModule } from '../icon/index';

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxDateRangeComponent,
        IgxDateRangeBaseDirective,
        IgxDateRangeStartDirective,
        IgxDateRangeEndDirective,
        IgxDateRangeDirective
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
        IgxDateRangeBaseDirective,
        IgxDateRangeStartDirective,
        IgxDateRangeEndDirective,
        IgxDateRangeDirective
    ]
})
export class IgxDateRangeModule { }
