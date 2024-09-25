import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DateRangeDescriptor, DateRangeType, IgxButtonDirective, IgxDatePickerComponent, IgxIconComponent, IgxLabelDirective, IgxPickerActionsDirective, IgxRippleDirective, IgxSuffixDirective } from 'igniteui-angular';
import { defineComponents, IgcDatePickerComponent, IgcButtonComponent, IgcIconComponent, registerIconFromText} from "igniteui-webcomponents";

defineComponents(IgcDatePickerComponent, IgcButtonComponent,IgcIconComponent);

const alarm = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>'
registerIconFromText('alarm', alarm);

@Component({
    selector: 'app-date-picker-showcase-sample',
    styleUrls: ['date-picker-showcase.sample.scss'],
    templateUrl: 'date-picker-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxDatePickerComponent, IgxLabelDirective, IgxSuffixDirective, IgxIconComponent, IgxPickerActionsDirective, IgxButtonDirective, IgxRippleDirective]
})

export class DatePickerShowcaseSampleComponent {
    public date1 = new Date();
    public date2 = new Date(new Date(this.date1.getFullYear(), this.date1.getMonth(), this.date1.getDate() + 1));
    public date3 = new Date(new Date(this.date2.getFullYear(), this.date2.getMonth(), this.date2.getDate() + 1));
    public date4 = new Date(new Date(this.date3.getFullYear(), this.date3.getMonth(), this.date3.getDate() + 1));
    public date5 = new Date(new Date(this.date4.getFullYear(), this.date4.getMonth(), this.date4.getDate() + 1));
    public date6 = new Date(new Date(this.date5.getFullYear(), this.date5.getMonth(), this.date5.getDate() + 1));
    public date7 = new Date(new Date(this.date6.getFullYear(), this.date6.getMonth(), this.date6.getDate() + 1));
    public today = new Date(this.date1);
    public nextYear = new Date(this.date1.getFullYear() + 1, this.date1.getMonth(), this.date1.getDate());

    public disabledDates: DateRangeDescriptor[] = [{ type: DateRangeType.Specific, dateRange: [this.date1, this.date2, this.date3] }];
    public specialDates: DateRangeDescriptor[] = [{ type: DateRangeType.Specific, dateRange: [this.date5, this.date6, this.date7] }];
}
