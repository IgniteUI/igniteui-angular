import { Directive, Input } from '@angular/core';
import { IgxDateRangeBaseDirective } from './igx-date-range-base.directive';

@Directive({
    selector: '[igxDateRangeStart]'
})
export class IgxDateRangeStartDirective extends IgxDateRangeBaseDirective { }

@Directive({
    selector: '[igxDateRangeEnd]'
})
export class IgxDateRangeEndDirective extends IgxDateRangeBaseDirective { }

@Directive({
    selector: '[igxDateRange]'
})
export class IgxDateRangeDirective extends IgxDateRangeBaseDirective {
    @Input('value')
    public set value(value: string[]) {
        if (!value) {
            this.nativeElement.value = value;
            this.setNgControlValue(value);
            return;
        }
        const start = value[0] ? value[0] : '';
        const end = value[value.length - 1] ? [value[value.length - 1]] : '';
        this.nativeElement.value = `${start} - ${end}`;
        this.setNgControlValue(this.nativeElement.value);
    }

    private setNgControlValue(value: string | string[]) {
        if (this.ngControl) {
            this.ngControl.control.setValue(value);
        }
    }
}
