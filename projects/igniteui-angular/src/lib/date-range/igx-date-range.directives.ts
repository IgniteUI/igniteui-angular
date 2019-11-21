import { Directive, Input } from '@angular/core';
import { IgxDateRangeBaseDirective } from './igx-date-range-base.directive';

/**
 * **Ignite UI for Angular IgxDateRangeStartDirective**
 *
 * The `igxDateRangeStart` directive marks an input element as a holder for a range selection's start value.
 *
 * ```html
 * <igx-date-range>
 *  <input igxDateRangeStart>
 * </igx-date-range>
 * ```
 */
@Directive({
    selector: '[igxDateRangeStart]'
})
export class IgxDateRangeStartDirective extends IgxDateRangeBaseDirective { }

/**
 * **Ignite UI for Angular IgxDateRangeEndDirective**
 *
 * The `igxDateRangeEnd` directive marks an input element as a holder for a range selection's end value.
 *
 * ```html
 * <igx-date-range>
 *  <input igxDateRangEnd>
 * </igx-date-range>
 * ```
 */
@Directive({
    selector: '[igxDateRangeEnd]'
})
export class IgxDateRangeEndDirective extends IgxDateRangeBaseDirective { }

/**
 * **Ignite UI for Angular IgxDateRangeDirective**
 *
 * The `igxDateRange` directive marks an input element as a holder for the a range selection.
 * The format is START_DATE - END_DATE
 *
 * ```html
 * <igx-date-range>
 *  <input igxDateRange>
 * </igx-date-range>
 * ```
 */
@Directive({
    selector: '[igxDateRange]'
})
export class IgxDateRangeDirective extends IgxDateRangeBaseDirective {
    /**
     * Returns the value that represents the start of the range selection.
     */
    @Input('value')
    public set value(value: string[]) {
        if (!value) {
            this.nativeElement.value = value;
            this.setNgControlValue(value);
            return;
        }
        const start = value[0] ? value[0] : '';
        const end = value[value.length - 1] ? value[value.length - 1] : '';
        this.nativeElement.value = `${start} - ${end}`;
        this.setNgControlValue(this.nativeElement.value);
    }

    private setNgControlValue(value: string | string[]) {
        if (this.ngControl) {
            this.ngControl.control.setValue(value);
        }
    }
}
