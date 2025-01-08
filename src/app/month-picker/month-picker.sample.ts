import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxMonthPickerComponent, IgxButtonDirective } from 'igniteui-angular';

@Component({
    selector: 'app-monthpicker',
    styleUrls: ['./month-picker.sample.scss'],
    templateUrl: './month-picker.sample.html',
    imports: [IgxMonthPickerComponent, IgxButtonDirective, FormsModule]
})
export class MonthPickerSampleComponent {
    public date = new Date(2024, 1, 1);

    protected onSelected(event: Date | Date[]) {
        console.log(event);
    }

    protected changeSelection() {
        this.date = new Date(2028, this.date.getMonth() + 1, this.date.getDate());
    }

    protected onViewChanged(event) {
        console.log(event);
    }

    protected onActiveViewChanged(event: string) {
        console.log(event);
    }
}
