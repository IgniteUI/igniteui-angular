import {
    Component,
    ViewChild,
    Input
} from '@angular/core';
import { IgxExcelStyleDefaultExpressionComponent } from './excel-style-default-expression.component';
import { DisplayDensity } from '../../../core/density';
import { IgxInputDirective } from '../../../directives/input/input.directive';

/**
 * @hidden
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-excel-style-date-expression',
    templateUrl: './excel-style-date-expression.component.html'
})
export class IgxExcelStyleDateExpressionComponent extends IgxExcelStyleDefaultExpressionComponent {
    @Input()
    public displayDensity: DisplayDensity;

    @ViewChild('input', { read: IgxInputDirective, static: false })
    private input: IgxInputDirective;

    protected get inputValuesElement() {
        return this.input;
    }

    public get inputDatePlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_row_date_placeholder'];
    }

    public get inputTimePlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_row_time_placeholder'];
    }
}
