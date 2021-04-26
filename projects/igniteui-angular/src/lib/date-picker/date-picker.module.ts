import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxCalendarModule } from '../calendar/public_api';
import { IgxCalendarContainerModule } from '../date-common/calendar-container/calendar-container.component';
import { IgxPickersCommonModule } from '../date-common/picker-icons.common';
import { IgxDateTimeEditorModule } from '../directives/date-time-editor/public_api';
import { IgxMaskModule } from '../directives/mask/mask.directive';
import { IgxTextSelectionModule } from '../directives/text-selection/text-selection.directive';
import { IgxIconModule } from '../icon/public_api';
import { IgxInputGroupModule } from '../input-group/public_api';
import { IgxDatePickerComponent } from './date-picker.component';

/** @hidden */
@NgModule({
    declarations: [
        IgxDatePickerComponent
    ],
    exports: [
        IgxDatePickerComponent,
        IgxPickersCommonModule
    ],
    imports: [
        FormsModule,
        CommonModule,
        IgxIconModule,
        IgxMaskModule,
        IgxCalendarModule,
        IgxInputGroupModule,
        IgxPickersCommonModule,
        IgxTextSelectionModule,
        IgxDateTimeEditorModule,
        IgxCalendarContainerModule,
    ]
})
export class IgxDatePickerModule { }
