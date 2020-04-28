import { Component, ContentChild, Pipe, PipeTransform, Output, EventEmitter, HostListener, Directive } from '@angular/core';
import { IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxInputGroupBase } from '../input-group/input-group.common';
import { NgControl } from '@angular/forms';
import { IgxDateTimeEditorDirective } from '../directives/date-time-editor';
import { formatDate } from '@angular/common';

/**
 * Represents a range between two dates.
 */
export interface DateRange {
    start: Date;
    end: Date;
}

/** @hidden @internal */
@Pipe({ name: 'dateRange' })
export class DateRangePickerFormatPipe implements PipeTransform {
    public transform(values: DateRange, inputFormat?: string, locale?: string): string {
        if (!values) {
            return '';
        }
        const { start, end } = values;
        // TODO: move default locale from IgxDateTimeEditorDirective to its commons file/use displayFormat
        const startDate = inputFormat ? formatDate(start, inputFormat, locale || 'en') : start?.toLocaleDateString();
        const endDate = inputFormat ? formatDate(end, inputFormat, locale || 'en') : end?.toLocaleDateString();
        let formatted;
        if (start) {
            formatted = `${startDate} - `;
            if (end) {
                formatted += endDate;
            }
        }

        // TODO: no need to set format twice
        return formatted ? formatted : '';
    }
}

/** @hidden @internal */
@Component({
    template: ``,
    selector: `igx-date-range-base`,
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxDateRangeBaseComponent }]
})
class IgxDateRangeBaseComponent extends IgxInputGroupComponent {
    @ContentChild(NgControl)
    protected ngControl: NgControl;

    @ContentChild(IgxDateTimeEditorDirective)
    public dateTimeEditor: IgxDateTimeEditorDirective;

    /** @hidden @internal */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /** @hidden @internal */
    public setFocus(): void {
        this.input.focus();
    }

    /** @hidden @internal */
    public updateInput(value: Date) {
        if (this.ngControl) {
            this.ngControl.control.setValue(value);
        } else {
            this.dateTimeEditor.value = value;
        }
    }
}

/**
 * Templates the default icon in the `IgxDateRangePicker`.
 *
 * @igxModule IgxDateRangePickerModule
 *
 * @igxKeyWords date range icon, date picker icon
 *
 * @igxGroup scheduling
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

    @HostListener('click')
    public onClick() {
        this.clicked.emit();
    }
}

/**
 * Defines the start input for a date range picker
 *
 * @igxModule IgxDateRangePickerModule
 *
 * @igxTheme igx-input-group-theme, igx-calendar-theme, igx-date-range-picker-theme
 *
 * @igxKeywords date, range, date range, date picker
 *
 * @igxGroup scheduling
 *
 * @remarks
 * When templating, start input has to be templated separately
 *
 * @example
 * ```html
 * <igx-date-range-picker mode="dropdown">
 *      <igx-date-range-picker-start>
 *          <input igxInput igxDateTimeEditor type="text">
 *      </igx-date-range-picker-start>
 *      ...
 * </igx-date-range-picker>
 * ```
 */
@Component({
    selector: 'igx-date-range-start',
    templateUrl: '../input-group/input-group.component.html',
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxDateRangeStartComponent }]
})
export class IgxDateRangeStartComponent extends IgxDateRangeBaseComponent { }

/**
 * Defines the end input for a date range picker
 *
 * @igxModule IgxDateRangeModule
 *
 * @igxTheme igx-input-group-theme, igx-calendar-theme, igx-date-range-picker-theme
 *
 * @igxKeywords date, range, date range, date picker
 *
 * @igxGroup scheduling
 *
 * @remarks
 * When templating, end input has to be template separately
 *
 * @example
 * ```html
 * <igx-date-range-picker mode="dropdown">
 *      <igx-date-range-picker-end>
 *          <input igxInput igxDateTimeEditor type="text">
 *      </igx-date-range-picker-end>
 *      ...
 * </igx-date-range-picker>
 * ```
 */
@Component({
    selector: 'igx-date-range-end',
    templateUrl: '../input-group/input-group.component.html',
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxDateRangeEndComponent }]
})
export class IgxDateRangeEndComponent extends IgxDateRangeBaseComponent { }

@Directive({
    selector: '[igxDateRangeSeparator]'
})
export class IgxDateRangeSeparatorDirective {
}
