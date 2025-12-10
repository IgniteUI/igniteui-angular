import { Component, Input, ViewChild } from '@angular/core';
import { IgxExcelStyleDefaultExpressionComponent } from './excel-style-default-expression.component';
import { getLocaleFirstDayOfWeek } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { IgxSelectComponent, IgxSelectItemComponent } from 'igniteui-angular/select';
import { IgxInputDirective, IgxInputGroupComponent, IgxPrefixDirective } from 'igniteui-angular/input-group';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';
import { IgxOverlayOutletDirective, IgxPickerClearComponent, IgxPickerToggleComponent } from 'igniteui-angular/core';
import { IgxTimePickerComponent } from 'igniteui-angular/time-picker';
import { IgxButtonDirective, IgxDateTimeEditorDirective, IgxIconButtonDirective } from 'igniteui-angular/directives';
import { IgxButtonGroupComponent } from 'igniteui-angular/button-group';

/**
 * @hidden
 */
@Component({
    selector: 'igx-excel-style-date-expression',
    templateUrl: './excel-style-date-expression.component.html',
    imports: [IgxSelectComponent, IgxPrefixDirective, IgxIconComponent, IgxSelectItemComponent, IgxDatePickerComponent, IgxPickerToggleComponent, IgxPickerClearComponent, IgxTimePickerComponent, IgxInputGroupComponent, FormsModule, IgxInputDirective, IgxDateTimeEditorDirective, IgxButtonDirective, IgxButtonGroupComponent, IgxOverlayOutletDirective, IgxIconButtonDirective]
})
export class IgxExcelStyleDateExpressionComponent extends IgxExcelStyleDefaultExpressionComponent {
    @ViewChild('input', { read: IgxInputDirective, static: false })
    private input: IgxInputDirective;

    @ViewChild('picker')
    private picker: IgxDatePickerComponent | IgxTimePickerComponent;

    @Input()
    public get searchVal(): any {
        return this.expressionUI.expression.searchVal;
    }

    public set searchVal(value: any) {
        this.expressionUI.expression.searchVal = value ? new Date(Date.parse(value.toString())) : null;
    }

    protected override get inputValuesElement() {
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
