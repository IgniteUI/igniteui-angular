import { Component, ContentChild, Pipe, PipeTransform, Directive, Inject, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { IgxInputDirective, IgxInputGroupBase, IgxInputGroupComponent, IgxInputState, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IgxButtonDirective, IgxDateTimeEditorDirective } from 'igniteui-angular/directives';
import { isDate, DateRange, DateTimeUtil } from 'igniteui-angular/core';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { NgTemplateOutlet } from '@angular/common';
import { BaseFormatter, I18N_FORMATTER } from '../../../core/src/core/i18n/formatters/formatter-base';

/** @hidden @internal */
@Pipe({
    name: 'dateRange',
    standalone: true
})
export class DateRangePickerFormatPipe implements PipeTransform {
    private i18nFormatter: BaseFormatter = inject(I18N_FORMATTER);

    public transform(values: DateRange, appliedFormat?: string,
        locale?: string, formatter?: (_: DateRange) => string): string {
        if (!values || !values.start && !values.end) {
            return '';
        }
        if (formatter) {
            return formatter(values);
        }
        let { start, end } = values;
        if (!isDate(start)) {
            start = DateTimeUtil.parseIsoDate(start);
        }
        if (!isDate(end)) {
            end = DateTimeUtil.parseIsoDate(end);
        }
        const startDate = this.i18nFormatter.formatDate(start, appliedFormat, locale);
        const endDate = this.i18nFormatter.formatDate(end, appliedFormat, locale);
        let formatted;
        if (start) {
            formatted = `${startDate} - `;
            if (end) {
                formatted += endDate;
            }
        }

        return formatted ? formatted : '';
    }
}

/** @hidden @internal */
@Component({
    template: ``,
    selector: `igx-date-range-base`,
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxDateRangeInputsBaseComponent }],
    standalone: true
})
export class IgxDateRangeInputsBaseComponent extends IgxInputGroupComponent {
    @ContentChild(IgxDateTimeEditorDirective)
    public dateTimeEditor: IgxDateTimeEditorDirective;

    @ContentChild(IgxInputDirective)
    public inputDirective: IgxInputDirective;

    @ContentChild(NgControl)
    protected ngControl: NgControl;

    /** @hidden @internal */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /** @hidden @internal */
    public setFocus(): void {
        this.input.focus();
    }

    /** @hidden @internal */
    public updateInputValue(value: Date) {
        if (this.ngControl) {
            this.ngControl.control.setValue(value);
        } else {
            this.dateTimeEditor.value = value;
        }
    }

    /** @hidden @internal */
    public updateInputValidity(state: IgxInputState) {
        this.inputDirective.valid = state;
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
 *      <igx-date-range-start>
 *          <input igxInput igxDateTimeEditor type="text">
 *      </igx-date-range-start>
 *      ...
 * </igx-date-range-picker>
 * ```
 */
@Component({
    selector: 'igx-date-range-start',
    templateUrl: '../../../input-group/src/input-group/input-group.component.html',
    providers: [
        { provide: IgxInputGroupBase, useExisting: IgxDateRangeStartComponent },
        { provide: IgxDateRangeInputsBaseComponent, useExisting: IgxDateRangeStartComponent }
    ],
    imports: [NgTemplateOutlet, IgxPrefixDirective, IgxButtonDirective, IgxSuffixDirective, IgxIconComponent]
})
export class IgxDateRangeStartComponent extends IgxDateRangeInputsBaseComponent { }

/**
 * Defines the end input for a date range picker
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
 * When templating, end input has to be template separately
 *
 * @example
 * ```html
 * <igx-date-range-picker mode="dropdown">
 *      ...
 *      <igx-date-range-end>
 *          <input igxInput igxDateTimeEditor type="text">
 *      </igx-date-range-end>
 * </igx-date-range-picker>
 * ```
 */
@Component({
    selector: 'igx-date-range-end',
    templateUrl: '../../../input-group/src/input-group/input-group.component.html',
    providers: [
        { provide: IgxInputGroupBase, useExisting: IgxDateRangeEndComponent },
        { provide: IgxDateRangeInputsBaseComponent, useExisting: IgxDateRangeEndComponent }
    ],
    imports: [NgTemplateOutlet, IgxPrefixDirective, IgxButtonDirective, IgxSuffixDirective, IgxIconComponent]
})
export class IgxDateRangeEndComponent extends IgxDateRangeInputsBaseComponent { }

/**
 * Replaces the default separator `to` with the provided value
 *
 * @igxModule IgxDateRangePickerModule
 *
 * @igxTheme igx-date-range-picker-theme
 *
 * @igxKeywords date, range, date range, date picker
 *
 * @igxGroup scheduling
 *
 * @example
 * ```html
 * <igx-date-range-picker>
 *      <igx-date-range-start>
 *          <input igxInput igxDateTimeEditor type="text">
 *      </igx-date-range-start>
 *
 *      <ng-template igxDateRangeSeparator>-</ng-template>
 *
 *      <igx-date-range-end>
 *          <input igxInput igxDateTimeEditor type="text">
 *      </igx-date-range-end>
 *      ...
 * </igx-date-range-picker>
 * ```
 */
@Directive({
    selector: '[igxDateRangeSeparator]',
    standalone: true
})
export class IgxDateRangeSeparatorDirective { }
