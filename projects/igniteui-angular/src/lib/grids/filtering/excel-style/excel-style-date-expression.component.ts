import {
    Component,
    ChangeDetectionStrategy,
    ViewChild
} from '@angular/core';
import { IgxExcelStyleDefaultExpressionComponent } from './excel-style-default-expression.component';
import { IgxDatePickerComponent } from '../../../date-picker/date-picker.component';
import { KEYS } from '../../../core/utils';
import { IgxInputGroupComponent } from '../../../input-group';

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

    @ViewChild('inputGroupDateValues', { read: IgxInputGroupComponent })
    private inputGroupDateValues: IgxInputGroupComponent;

    protected get inputValuesElement() {
        return this.datePicker.getEditElement();
    }

    public openDatePicker(openDialog: Function) {
        openDialog();
    }

    public onInputValuesKeydown(event: KeyboardEvent) {
        if (event.altKey && (event.key === KEYS.DOWN_ARROW || event.key === KEYS.DOWN_ARROW_IE)) {
            this.toggleCustomDialogDropDown(this.inputGroupDateValues, this.dropdownValues);
        }

        event.stopPropagation();
    }
}
