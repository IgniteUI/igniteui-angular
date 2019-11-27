import { Component, ContentChild, Pipe, PipeTransform, OnInit } from '@angular/core';
import { IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxInputGroupBase } from '../input-group/input-group.common';
import { NgControl } from '@angular/forms';

export interface DateRange {
    start: Date;
    end: Date;
}

/**
 * @hidden
 * @internal
 */
@Component({
    template: ``,
    selector: `igx-date-range-base`
})
class IgxDateRangeBaseComponent extends IgxInputGroupComponent implements OnInit {
    @ContentChild(NgControl)
    protected ngControl: NgControl;

    /** @hidden @internal */
    public ngOnInit(): void {
        this.input.nativeElement.readOnly = true;
    }

    public get nativeElement() {
        return this.element.nativeElement;
    }

    /** @hidden @internal */
    public setFocus(): void {
        this.input.focus();
    }

    /** @hidden @internal */
    public updateValue(value: any) {
        if (this.ngControl) {
            this.ngControl.control.setValue(value);
        } else {
            this.input.value = value;
        }
    }
}

@Component({
    selector: 'igx-date-start',
    templateUrl: 'igx-date-range-inputs.common.html',
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxDateStartComponent }]
})
export class IgxDateStartComponent extends IgxDateRangeBaseComponent { }

@Component({
    selector: 'igx-date-end',
    templateUrl: 'igx-date-range-inputs.common.html',
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxDateEndComponent }]
})
export class IgxDateEndComponent extends IgxDateRangeBaseComponent { }

@Component({
    selector: 'igx-date-single',
    templateUrl: 'igx-date-range-inputs.common.html',
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxDateSingleComponent }]
})
export class IgxDateSingleComponent extends IgxDateRangeBaseComponent {
    // TODO: Separate formatter/pipe?
    public updateValue(value: any) {
        value = new DateRangeFormatPipe().transform(value);
        super.updateValue(value);
    }
}

@Pipe({ name: 'dateRange' })
export class DateRangeFormatPipe implements PipeTransform {
    transform(values: DateRange): string {
        if (!values) {
            return '';
        }
        const { start, end } = values;
        let formatted = start && start.toLocaleDateString();
        if (end) {
            formatted += ` - ${end.toLocaleDateString()}`;
        }
        return formatted;
    }

    parse(value: string): DateRange {
        const values = value.trim().split(/ - /g);
        return {
            start: value[0] && new Date(Date.parse(values[0])),
            end: value[1] && new Date(Date.parse(values[1]))
        };
    }
}
