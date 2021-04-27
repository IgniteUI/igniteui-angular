import { Component, ViewChild } from '@angular/core';
import { IgxDatePickerComponent } from 'igniteui-angular';
import { DateRangeDescriptor, DateRangeType } from 'projects/igniteui-angular/src/lib/core/dates/dateRange';

@Component({
    selector: 'app-date-picker-sample',
    styleUrls: ['date-picker.sample.scss'],
    templateUrl: 'date-picker.sample.html'
})

export class DatePickerSampleComponent {
    @ViewChild('dp5')
    public datePicker: IgxDatePickerComponent;

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
