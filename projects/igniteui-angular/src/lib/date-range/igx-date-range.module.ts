import { NgModule } from '@angular/core';
import { IgxDateRangeComponent } from './igx-date-range.component';
import { IgxDateRangeBaseDirective } from './igx-date-range-base.directive';
import { IgxDateRangeStartDirective, IgxDateRangeEndDirective, IgxDateRangeDirective } from './igx-date-range.directives';
import { IgxCalendarModule } from '../calendar/index';
import { IgxToggleModule } from '../directives/toggle/toggle.directive';
import { CommonModule } from '@angular/common';
import { IgxButtonModule } from '../directives/button/button.directive';

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
        IgxCalendarModule,
        IgxToggleModule,
        IgxButtonModule
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
