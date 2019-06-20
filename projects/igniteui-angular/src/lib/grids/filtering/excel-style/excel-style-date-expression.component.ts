import {
    Component,
    ChangeDetectionStrategy,
    ViewChild,
    Input
} from '@angular/core';
import { IgxExcelStyleDefaultExpressionComponent } from './excel-style-default-expression.component';
import { IgxDatePickerComponent } from '../../../date-picker/date-picker.component';
import { DisplayDensity } from '../../../core/density';

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

    @ViewChild('datePicker', { read: IgxDatePickerComponent, static: true })
    private datePicker: IgxDatePickerComponent;

    protected get inputValuesElement() {
        return this.datePicker.getEditElement();
    }

    @Input()
    public displayDensity: DisplayDensity;

    get inputDatePlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_row_date_placeholder'];
    }
}
