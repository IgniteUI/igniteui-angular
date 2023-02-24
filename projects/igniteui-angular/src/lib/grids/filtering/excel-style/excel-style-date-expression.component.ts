import { Component, Input, ViewChild } from '@angular/core';
import { IgxExcelStyleDefaultExpressionComponent } from './excel-style-default-expression.component';
import { DisplayDensity } from '../../../core/density';
import { IgxInputDirective } from '../../../directives/input/input.directive';
import { IgxDatePickerComponent } from '../../../date-picker/public_api';
import { IgxTimePickerComponent } from '../../../time-picker/time-picker.component';
import { getLocaleFirstDayOfWeek, NgIf, NgFor } from "@angular/common";
import { IgxOverlayOutletDirective } from '../../../directives/toggle/toggle.directive';
import { IgxButtonGroupComponent } from '../../../buttonGroup/buttonGroup.component';
import { IgxButtonDirective } from '../../../directives/button/button.directive';
import { IgxDateTimeEditorDirective } from '../../../directives/date-time-editor/date-time-editor.directive';
import { FormsModule } from '@angular/forms';
import { IgxInputGroupComponent } from '../../../input-group/input-group.component';
import { IgxPickerToggleComponent, IgxPickerClearComponent } from '../../../date-common/picker-icons.common';
import { IgxDatePickerComponent as IgxDatePickerComponent_1 } from '../../../date-picker/date-picker.component';
import { IgxSelectItemComponent } from '../../../select/select-item.component';
import { IgxIconComponent } from '../../../icon/icon.component';
import { IgxPrefixDirective } from '../../../directives/prefix/prefix.directive';
import { IgxSelectComponent } from '../../../select/select.component';

/**
 * @hidden
 */
@Component({
    selector: 'igx-excel-style-date-expression',
    templateUrl: './excel-style-date-expression.component.html',
    standalone: true,
    imports: [IgxSelectComponent, IgxPrefixDirective, NgIf, IgxIconComponent, NgFor, IgxSelectItemComponent, IgxDatePickerComponent_1, IgxPickerToggleComponent, IgxPickerClearComponent, IgxTimePickerComponent, IgxInputGroupComponent, FormsModule, IgxInputDirective, IgxDateTimeEditorDirective, IgxButtonDirective, IgxButtonGroupComponent, IgxOverlayOutletDirective]
})
export class IgxExcelStyleDateExpressionComponent extends IgxExcelStyleDefaultExpressionComponent {
    @Input()
    public displayDensity: DisplayDensity;

    @ViewChild('input', { read: IgxInputDirective, static: false })
    private input: IgxInputDirective;

    @ViewChild('picker')
    private picker: IgxDatePickerComponent | IgxTimePickerComponent;

    protected get inputValuesElement() {
        return this.picker?.getEditElement() || this.input?.nativeElement;
    }

    public get inputDatePlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_row_date_placeholder'];
    }

    public get inputTimePlaceholder(): string {
        return this.grid.resourceStrings['igx_grid_filter_row_time_placeholder'];
    }

    public get weekStart(): number {
        return getLocaleFirstDayOfWeek(this.grid.locale);
    }
}
