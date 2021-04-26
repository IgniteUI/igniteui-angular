import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, HostListener, NgModule, Directive, TemplateRef } from '@angular/core';

/**
 * Templates the default toggle icon in the picker.
 *
 * @remarks Can be applied to IgxDatePickerComponent, IgxTimePickerComponent, IgxDateRangePickerComponent
 *
 * @example
 * ```html
 * <igx-date-range-picker>
 *   <igx-picker-toggle igxSuffix>
 *      <igx-icon>calendar_view_day</igx-icon>
 *   </igx-picker-toggle>
 * </igx-date-range-picker>
 * ```
 */
@Component({
    template: `<ng-content></ng-content>`,
    selector: 'igx-picker-toggle'
})
export class IgxPickerToggleComponent {
    @Output()
    public clicked = new EventEmitter();

    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        // do not focus input on click
        event.stopPropagation();
        this.clicked.emit();
    }
}

/**
 * Templates the default clear icon in the picker.
 *
 * @remarks Can be applied to IgxDatePickerComponent, IgxTimePickerComponent, IgxDateRangePickerComponent
 *
 * @example
 * ```html
 * <igx-date-picker>
 *   <igx-picker-clear igxSuffix>
 *      <igx-icon>delete</igx-icon>
 *   </igx-picker-clear>
 * </igx-date-picker>
 * ```
 */
@Component({
    template: `<ng-content></ng-content>`,
    selector: 'igx-picker-clear'
})
export class IgxPickerClearComponent extends IgxPickerToggleComponent { }

/**
 * IgxPickerActionsDirective can be used to re-template the dropdown/dialog action buttons.
 *
 * @remarks Can be applied to IgxDatePickerComponent, IgxTimePickerComponent, IgxDateRangePickerComponent
 *
 */
@Directive({
    selector: '[igxPickerActions]'
})
export class IgxPickerActionsDirective {
    constructor(public template: TemplateRef<any>) { }
}


/** @hidden */
@NgModule({
    declarations: [
        IgxPickerToggleComponent,
        IgxPickerClearComponent,
        IgxPickerActionsDirective
    ],
    imports: [CommonModule],
    exports: [
        IgxPickerToggleComponent,
        IgxPickerClearComponent,
        IgxPickerActionsDirective
    ]
})
export class IgxPickersCommonModule { }
