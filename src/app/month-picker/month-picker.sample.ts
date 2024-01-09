import { Component } from '@angular/core';
import { IgxCardComponent, IgxMonthPickerComponent } from 'igniteui-angular';

@Component({
    selector: 'app-monthpicker',
    styleUrls: ['./month-picker.sample.scss'],
    templateUrl: './month-picker.sample.html',
    standalone: true,
    imports: [IgxCardComponent, IgxMonthPickerComponent]
})
export class MonthPickerSampleComponent {
    public date = new Date();
}
