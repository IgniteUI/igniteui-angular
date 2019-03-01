import {
    Component,
    ChangeDetectionStrategy,
    ViewChild
} from '@angular/core';
import { IgxExcelStyleDefaultExpressionComponent } from './excel-style-default-expression.component';
import { IgxDatePickerComponent } from '../../../date-picker/date-picker.component';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-date-expression',
    templateUrl: './excel-style-date-expression.component.html'
})
export class IgxExcelStyleDateExpressionComponent extends IgxExcelStyleDefaultExpressionComponent {

    @ViewChild('datePicker', { read: IgxDatePickerComponent })
    private datePicker: IgxDatePickerComponent;

    protected get inputValuesElement() {
        return this.datePicker.getEditElement();
    }

    get inputDatePlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_row_date_placeholder'];
    }

    public openDatePicker(openDialog: Function) {
        openDialog();
    }
}
