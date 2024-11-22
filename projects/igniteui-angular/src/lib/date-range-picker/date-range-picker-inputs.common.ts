import { Component, ContentChild, Pipe, PipeTransform, Directive } from '@angular/core';
import { NgControl } from '@angular/forms';
import { IgxInputDirective, IgxInputState } from '../input-group/public_api';
import { IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxInputGroupBase } from '../input-group/input-group.common';
import { DateTimeUtil } from '../date-common/util/date-time.util';
import { IgxDateTimeEditorDirective } from '../directives/date-time-editor/public_api';
import { isDate } from '../core/utils';
import { IgxIconComponent } from '../icon/icon.component';
import { IgxSuffixDirective } from '../directives/suffix/suffix.directive';
import { IgxButtonDirective } from '../directives/button/button.directive';
import { IgxPrefixDirective } from '../directives/prefix/prefix.directive';
import { NgIf, NgTemplateOutlet, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

/** Represents a range between two dates. */
export interface DateRange {
    start: Date | string;
    end: Date | string;
}

/** @hidden @internal */
@Pipe({
    name: 'dateRange',
    standalone: true
})
export class DateRangePickerFormatPipe implements PipeTransform {
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
        const startDate = appliedFormat ? DateTimeUtil.formatDate(start, appliedFormat, locale || 'en') : start?.toLocaleDateString();
        const endDate = appliedFormat ? DateTimeUtil.formatDate(end, appliedFormat, locale || 'en') : end?.toLocaleDateString();
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
    templateUrl: '../input-group/input-group.component.html',
    providers: [
        { provide: IgxInputGroupBase, useExisting: IgxDateRangeStartComponent },
        { provide: IgxDateRangeInputsBaseComponent, useExisting: IgxDateRangeStartComponent }
    ],
    imports: [NgIf, NgTemplateOutlet, IgxPrefixDirective, IgxButtonDirective, NgClass, IgxSuffixDirective, IgxIconComponent, NgSwitch, NgSwitchCase, NgSwitchDefault]
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
    templateUrl: '../input-group/input-group.component.html',
    providers: [
        { provide: IgxInputGroupBase, useExisting: IgxDateRangeEndComponent },
        { provide: IgxDateRangeInputsBaseComponent, useExisting: IgxDateRangeEndComponent }
    ],
    imports: [NgIf, NgTemplateOutlet, IgxPrefixDirective, IgxButtonDirective, NgClass, IgxSuffixDirective, IgxIconComponent, NgSwitch, NgSwitchCase, NgSwitchDefault]
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
